import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

router.use(authenticate, authorizePermissions(PERMISSIONS.DASHBOARD_READ));

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get high-level counts (users, vehicles, challans, revenue, etc.)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Summary retrieved }
 */
router.get('/summary', dashboardController.getSummary);

/**
 * @openapi
 * /dashboard/revenue/monthly:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get monthly revenue breakdown for a given year
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Monthly revenue retrieved }
 */
router.get('/revenue/monthly', dashboardController.getMonthlyRevenue);

/**
 * @openapi
 * /dashboard/challans/daily:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get daily challan counts for the trailing N days
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Daily challan counts retrieved }
 */
router.get('/challans/daily', dashboardController.getDailyChallans);

/**
 * @openapi
 * /dashboard/violations/top:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get top 10 most frequent violations
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Top violations retrieved }
 */
router.get('/violations/top', dashboardController.getTopViolations);

/**
 * @openapi
 * /dashboard/challans/by-officer:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get challan counts grouped by issuing officer
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challans by officer retrieved }
 */
router.get('/challans/by-officer', dashboardController.getChallansByOfficer);

export default router;
