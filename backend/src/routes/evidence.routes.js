// backend/src/routes/evidence.routes.js
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getEvidence } from '../controllers/evidence.controller.js';

const router = Router();

// Serve evidence files (images or videos) with authentication
router.get('/:type/:filename', authenticate, getEvidence);

export default router;
