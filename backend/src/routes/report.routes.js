import { Router } from 'express';
import { query } from 'express-validator';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

const reportQueryValidator = [
  query('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

router.use(authenticate, authorizePermissions(PERMISSIONS.REPORT_READ));

/**
 * @openapi
 * /reports/excel:
 *   get:
 *     tags: [Reports]
 *     summary: Export challan report as Excel (.xlsx)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, weekly, monthly, yearly] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Excel file stream }
 */
router.get('/excel', reportQueryValidator, validate, reportController.exportExcel);

/**
 * @openapi
 * /reports/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Export challan report as PDF
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, weekly, monthly, yearly] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: PDF file stream }
 */
router.get('/pdf', reportQueryValidator, validate, reportController.exportPdf);

export default router;
