// backend/src/controllers/evidence.controller.js
import path from 'path';
import { fileURLToPath } from 'url';
import ApiResponse from '../utils/ApiResponse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve evidence files (images or videos)
export const getEvidence = async (req, res) => {
  const { type, filename } = req.params; // type = images | videos
  const allowed = ['images', 'videos'];
  if (!allowed.includes(type)) {
    return new ApiResponse(res, 400, 'Invalid evidence type');
  }
  const filePath = path.join(__dirname, '..', 'uploads', 'evidence', type, filename);
  return res.sendFile(filePath, (err) => {
    if (err) {
      return new ApiResponse(res, 404, 'Evidence not found');
    }
  });
};
