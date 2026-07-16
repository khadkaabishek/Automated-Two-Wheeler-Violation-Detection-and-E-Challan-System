import { api } from './client';

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const reportApi = {
  downloadExcel: async ({ period, startDate, endDate }) => {
    const blob = await api.download('/reports/excel', { period, startDate, endDate });
    triggerDownload(blob, `challan-report-${Date.now()}.xlsx`);
  },
  downloadPdf: async ({ period, startDate, endDate }) => {
    const blob = await api.download('/reports/pdf', { period, startDate, endDate });
    triggerDownload(blob, `challan-report-${Date.now()}.pdf`);
  },
};
