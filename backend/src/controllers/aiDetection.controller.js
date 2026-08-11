import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Placeholder for the planned Automatic Number Plate Recognition (ANPR) /
 * violation-detection model. Once a trained model is ready, wire its
 * inference call in here (or call out to a dedicated inference service)
 * and flip `enabled` to true. Until then this simply reports status so the
 * frontend can show an honest "in development" indicator instead of a dead
 * or fake feature.
 */
export const getStatus = asyncHandler(async (req, res) => {
  new ApiResponse(res, 200, 'AI detection status retrieved', {
    enabled: false,
    status: 'in_development',
    message:
      'Automatic violation detection (ANPR / overspeed / helmet detection) is currently being trained and is not yet issuing challans automatically.',
    plannedCapabilities: [
      'Automatic Number Plate Recognition (ANPR)',
      'Helmet / seatbelt detection from camera feeds',
      'Automatic overspeed detection',
      'Auto-drafted challans for officer review before issuance',
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
    Connection: 'keep-alive',
  });

  res.write(
    `event: log\ndata: ${JSON.stringify({ message: 'Connected to ML Pipeline stream...' })}\n\n`
  );

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
  const internalSecret = 'ECHALLAN_INTERNAL_ML_SECRET_KEY';

  const jobId = Date.now().toString();
  if (!activeJobs[jobId]) activeJobs[jobId] = { clients: [] };

  const broadcast = (type, message) => {
    if (activeJobs[jobId]) {
      activeJobs[jobId].clients.forEach((client) => {
        client.write(`event: ${type}\ndata: ${JSON.stringify({ message })}\n\n`);
      });
    }
  };

  console.log(`Spawning ML pipeline for ${videoPath} [Job: ${jobId}]`);

  const pythonProcess = spawn(pythonBin, [scriptPath, videoPath, apiUrl, internalSecret], {
    cwd: path.dirname(scriptPath)
  });

  pythonProcess.on('error', (err) => {
    console.error('Failed to start python process:', err);
    broadcast('log', `[ERROR] Failed to start python process: ${err.message}`);
    delete activeJobs[jobId];
  });

  pythonProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const text of lines) {
      if (!text.trim()) continue;
      console.log(`[ML Pipeline]: ${text}`);
      broadcast('log', text);
      if (text.includes('Violation:')) {
        broadcast('violation', 'Violation Found! Bumped to AI Detections Module.');
      }
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const text of lines) {
      if (!text.trim()) continue;
      console.error(`[ML Pipeline Error]: ${text}`);
      broadcast('log', `[ERROR] ${text}`);
    }
  });

  pythonProcess.on('close', (code) => {
    console.log(`[ML Pipeline] exited with code ${code}`);
    broadcast('log', `[SYSTEM] Process exited with code ${code}`);
    broadcast('close', `Pipeline exited with code ${code}`);

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
  const internalSecret = req.headers['x-webhook-secret'];
  if (internalSecret !== 'ECHALLAN_INTERNAL_ML_SECRET_KEY') {
    return new ApiResponse(res, 401, 'Unauthorized ML pipeline request');
  }

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

  // Deduplication check: if another detection was logged within the last 15 seconds,
  // we consider this a duplicate frame of the same incident from the video stream
  // and discard it to prevent UI spam caused by flickering OCR reads.
  const cooldownWindow = new Date(Date.now() - 15 * 1000); // 15 seconds
  const recentDetection = await prisma.modelDetection.findFirst({
    where: {
      plateNumber,
      createdAt: {
        gte: cooldownWindow,
      },
    },
  });

  if (recentDetection) {
    if (snapshotFile) {
      fs.unlink(snapshotFile.path, () => {}); // cleanup unused image
    }
    return new ApiResponse(
      res,
      200,
      'Duplicate detection ignored by backend cooldown',
      recentDetection
    );
  }

  // 1. Create ModelDetection record
  const detection = await prisma.modelDetection.create({
    data: {
      plateNumber,
      violations, // Keep as JSON string
      snapshotUrl: snapshotFile ? `/uploads/evidence/images/${snapshotFile.filename}` : '',
      status: 'PENDING',
    },
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
    orderBy: { createdAt: 'desc' },
  });
  new ApiResponse(res, 200, 'Model detections retrieved', { detections });
});

/**
 * Update model detection status
 */
export const updateDetectionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['VERIFIED', 'DISCARDED', 'PROCESSED'].includes(status)) {
    return new ApiResponse(res, 400, 'Invalid status update');
  }

  const detection = await prisma.modelDetection.update({
    where: { id },
    data: { 
      status
    }
  });

  new ApiResponse(res, 200, `Detection marked as ${status}`, detection);
});

/**
 * Discard all pending AI detections at once
 */
export const discardAllDetections = asyncHandler(async (req, res) => {
  const result = await prisma.modelDetection.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'DISCARDED' }
  });

  new ApiResponse(res, 200, `Successfully discarded ${result.count} pending detections`);
});
