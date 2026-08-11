import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import challanRepository from '../repositories/challan.repository.js';
import ApiError from '../utils/ApiError.js';

const PERIOD_RANGES = {
  daily: () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  weekly: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
  },
  monthly: () => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  },
  yearly: () => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    return { start, end };
  },
};

const getReportData = async (period, startDate, endDate) => {
  let range;
  if (startDate && endDate) {
    range = { start: new Date(startDate), end: new Date(endDate) };
  } else {
    const resolver = PERIOD_RANGES[period];
    if (!resolver)
      throw ApiError.badRequest('Invalid period. Use daily, weekly, monthly, or yearly.');
    range = resolver();
  }

  const challans = await challanRepository.findManyForReport({
    createdAt: { gte: range.start, lte: range.end },
  });

  return { challans, range };
};

export const generateExcelReport = async (period, startDate, endDate) => {
  const { challans, range } = await getReportData(period, startDate, endDate);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Smart Traffic Management System';
  const sheet = workbook.addWorksheet('Challan Report');

  sheet.columns = [
    { header: 'Challan Number', key: 'challanNumber', width: 22 },
    { header: 'Vehicle Number', key: 'vehicleNumber', width: 16 },
    { header: 'Officer', key: 'officer', width: 20 },
    { header: 'Violations', key: 'violations', width: 30 },
    { header: 'Fine Amount', key: 'fineAmount', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Payment Status', key: 'paymentStatus', width: 15 },
    { header: 'Incident Date', key: 'incidentDate', width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };

  challans.forEach((c) => {
    sheet.addRow({
      challanNumber: c.challanNumber,
      vehicleNumber: c.vehicle?.vehicleNumber,
      officer: c.officer?.fullName,
      violations: c.challanViolations.map((cv) => cv.violation.name).join(', '),
      fineAmount: Number(c.fineAmount),
      status: c.status,
      paymentStatus: c.paymentStatus,
      incidentDate: c.incidentDate?.toISOString().split('T')[0],
    });
  });

  sheet.addRow({});
  sheet.addRow({
    challanNumber: `Report range: ${range.start.toISOString().split('T')[0]} to ${range.end.toISOString().split('T')[0]}`,
  });

  return workbook.xlsx.writeBuffer();
};

export const generatePdfReport = async (period, startDate, endDate) => {
  const { challans, range } = await getReportData(period, startDate, endDate);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text('Smart Traffic Report', { align: 'center' });
    doc
      .fontSize(10)
      .text(
        `Range: ${range.start.toISOString().split('T')[0]} to ${range.end.toISOString().split('T')[0]}`,
        { align: 'center' }
      );
    doc.moveDown();

    const totalFine = challans.reduce((sum, c) => sum + Number(c.fineAmount), 0);
    doc
      .fontSize(11)
      .text(`Total Challans: ${challans.length}   |   Total Fine Amount: ${totalFine.toFixed(2)}`);
    doc.moveDown();

    challans.forEach((c, idx) => {
      doc
        .fontSize(9)
        .text(
          `${idx + 1}. ${c.challanNumber} | Vehicle: ${c.vehicle?.vehicleNumber} | Officer: ${c.officer?.fullName} | Fine: ${c.fineAmount} | Status: ${c.status}/${c.paymentStatus} | Violations: ${c.challanViolations.map((cv) => cv.violation.name).join(', ')}`
        );
    });

    doc.end();
  });
};
