import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as aiDetectionService from '../services/aiDetection.service.js';

/**
 * Reports whether the remote screening service (vehicle-type -> helmet ->
 * plate staged pipeline, served by the separate /ml-service process) is
 * reachable right now. This is genuinely live — not a hardcoded flag — so
 * if that service is down, the dashboard banner says so honestly instead
 * of claiming a feature that isn't currently working.
 */
export const getStatus = asyncHandler(async (req, res) => {
  const status = await aiDetectionService.checkServiceStatus();

  new ApiResponse(res, 200, 'AI detection status retrieved', {
    enabled: status.reachable,
    status: status.reachable ? 'active' : 'unavailable',
    message: status.reachable
      ? 'Two-wheeler violation screening is live: vehicle type, then helmet, then plate location — upload a photo to try it.'
      : `The detection service is not reachable right now (${status.detail || 'unknown reason'}). Violations can still be issued manually.`,
    vehicleClasses: status.vehicleClasses || null,
    helmetClasses: status.helmetClasses || null,
    plateClasses: status.plateClasses || null,
    plannedCapabilities: [
      'Vehicle-type screening — only two-wheelers (motorcycle/scooter) are carried forward',
      'Helmet / no-helmet detection, only run once a two-wheeler is confirmed',
      'Number-plate location, only run once a violation is confirmed — reading the plate characters (OCR) is not yet trained',
      'Automatic overspeed detection',
    ],
  });
});

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { env } from '../config/env.js';

const prisma = new PrismaClient();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const activeJobs = {};

/**
 * Stream logs via SSE
 */
export const streamLogs = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write(`event: log\ndata: ${JSON.stringify({ message: 'Connected to ML Pipeline stream...' })}\n\n`);

  if (!activeJobs[jobId]) {
    activeJobs[jobId] = { clients: [] };
  }

  activeJobs[jobId].clients.push(res);

  req.on('close', () => {
    if (activeJobs[jobId]) {
      activeJobs[jobId].clients = activeJobs[jobId].clients.filter((client) => client !== res);
    }
  });
});

/**
 * Handle video upload for AI processing testing
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return new ApiResponse(res, 400, 'No video file provided');
  }

  const videoPath = req.file.path;
  const scriptPath = path.resolve(__dirname, '../../../ML/Code/model_workflow.py');
  const pythonBin = path.resolve(__dirname, '../../../ML/myvenv/bin/python');
  const apiUrl = `http://localhost:${env.port}/api/v1/ai-detection/automated-violation`;
  const token = req.headers.authorization?.split(' ')[1] || '';
  
  const jobId = Date.now().toString();
  if (!activeJobs[jobId]) activeJobs[jobId] = { clients: [] };

  const broadcast = (type, message) => {
    if (activeJobs[jobId]) {
      activeJobs[jobId].clients.forEach(client => {
        client.write(`event: ${type}\ndata: ${JSON.stringify({ message })}\n\n`);
      });
    }
  };

  console.log(`Spawning ML pipeline for ${videoPath} [Job: ${jobId}]`);
  
  const pythonProcess = spawn(pythonBin, [scriptPath, videoPath, apiUrl, token]);

  pythonProcess.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`[ML Pipeline]: ${text}`);
    broadcast('log', text);
    if (text.includes('Violation detected!')) {
      broadcast('violation', 'Violation Found! Bumped to AI Detections Module.');
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    const text = data.toString();
    console.error(`[ML Pipeline Error]: ${text}`);
    broadcast('log', `ERROR: ${text}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[ML Pipeline] exited with code ${code}`);
    broadcast('close', `Pipeline exited with code ${code}`);
    
    // Cleanup after a short delay so frontend receives final messages
    setTimeout(() => {
      delete activeJobs[jobId];
    }, 5000);
  });

  new ApiResponse(res, 200, 'Video uploaded successfully. Queued for AI processing.', {
    fileName: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    status: 'queued',
    jobId,
  });
});

/**
 * Handle incoming automated violation from the ML pipeline
 */
export const receiveAutomatedViolation = asyncHandler(async (req, res) => {
  const { plateNumber, violations } = req.body;
  const snapshotFile = req.file;

  if (!plateNumber || !violations) {
    return new ApiResponse(res, 400, 'Missing plateNumber or violations payload');
  }

  let violationList = [];
  try {
    violationList = JSON.parse(violations);
  } catch (e) {
    return new ApiResponse(res, 400, 'Violations must be a JSON array');
  }

  // 1. Create ModelDetection record
  const detection = await prisma.modelDetection.create({
    data: {
      plateNumber,
      violations, // Keep as JSON string
      snapshotUrl: snapshotFile ? `/uploads/evidence/images/${snapshotFile.filename}` : '',
      status: 'PENDING'
    }
  });

  new ApiResponse(res, 201, 'Automated detection logged successfully', detection);
});

/**
 * List raw model detections
 */
export const listDetections = asyncHandler(async (req, res) => {
  const { status = 'PENDING' } = req.query;
  const detections = await prisma.modelDetection.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' }
  });
  new ApiResponse(res, 200, 'Model detections retrieved', { detections });
});

/**
 * Update model detection status
 */
export const updateDetection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['PENDING', 'PROCESSED', 'DISCARDED'].includes(status)) {
    return new ApiResponse(res, 400, 'Invalid status');
  }

  const detection = await prisma.modelDetection.update({
    where: { id },
    data: { status }
  });

  new ApiResponse(res, 200, 'Model detection updated', detection);
});
