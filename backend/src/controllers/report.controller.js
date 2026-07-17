import asyncHandler from '../utils/asyncHandler.js';
import * as reportService from '../services/report.service.js';

export const exportExcel = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const buffer = await reportService.generateExcelReport(period, startDate, endDate);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename="challan-report-${Date.now()}.xlsx"`);
  res.send(buffer);
});

export const exportPdf = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const buffer = await reportService.generatePdfReport(period, startDate, endDate);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="challan-report-${Date.now()}.pdf"`);
  res.send(buffer);
});
