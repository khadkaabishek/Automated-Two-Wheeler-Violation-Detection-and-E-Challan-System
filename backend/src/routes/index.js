import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import vehicleOwnerRoutes from './vehicleOwner.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import violationRoutes from './violation.routes.js';
import challanRoutes from './challan.routes.js';
import paymentRoutes from './payment.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import auditLogRoutes from './auditLog.routes.js';
import aiDetectionRoutes from './aiDetection.routes.js';
import officerApplicationRoutes from './officerApplication.routes.js';
import challanDisputeRoutes from './challanDispute.routes.js';
import flaggedDetectionRoutes from './flaggedDetection.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/owners', vehicleOwnerRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/violations', violationRoutes);
router.use('/challans', challanRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/ai-detection', aiDetectionRoutes);
router.use('/officer-applications', officerApplicationRoutes);
router.use('/disputes', challanDisputeRoutes);
router.use('/flagged-detections', flaggedDetectionRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: { timestamp: new Date().toISOString() },
    errors: null,
  });
});

export default router;
