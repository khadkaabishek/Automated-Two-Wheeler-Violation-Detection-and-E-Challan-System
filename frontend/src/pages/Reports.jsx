import { useState } from 'react';
import { reportApi } from '../api/reports';
import { useToast } from '../context/ToastContext';

const PERIODS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'Last 7 days' },
  { value: 'monthly', label: 'Last 30 days' },
  { value: 'yearly', label: 'Last 12 months' },
];

export default function Reports() {
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [exportFormat, setExportFormat] = useState('PDF');

  const handleDownloadReportPDF = async () => {
    try {
      const response = await api.get('/reports/export', {
        params: { startDate: startDateFilter, endDate: endDateFilter, format: exportFormat },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traffic-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to export PDF report');
    }
  };
  const toast = useToast();
  const [period, setPeriod] = useState('monthly');
  const [useCustom, setUseCustom] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadingType, setLoadingType] = useState(null);

  const buildQuery = () =>
    useCustom ? { startDate, endDate } : { period };

  const handleDownload = async (type) => {
    if (useCustom && (!startDate || !endDate)) {
      return toast.error('Choose both a start and end date');
    }
    setLoadingType(type);
    try {
      if (type === 'excel') await reportApi.downloadExcel(buildQuery());
      else await reportApi.downloadPdf(buildQuery());
      toast.success('Download started');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Export violation activity for a period as PDF or Excel</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card__title" style={{ marginBottom: 4 }}>
          Select a range
        </div>
        <div className="card__desc" style={{ marginBottom: 20 }}>
          Choose a preset window or a custom date range
        </div>

        <div className="field">
          <label className="checkbox-row" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
            Use a custom date range
          </label>
        </div>

        {useCustom ? (
          <div className="form-grid">
            <div className="field">
              <label>Start date</label>
              <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="field">
              <label>End date</label>
              <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="field">
            <label>Period</label>
            <select className="select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            className="btn btn-primary"
            disabled={loadingType === 'excel'}
            onClick={() => handleDownload('excel')}
          >
            {loadingType === 'excel' ? <span className="spinner" /> : 'Download Excel'}
          </button>
          <button
            className="btn btn-ghost"
            disabled={loadingType === 'pdf'}
            onClick={() => handleDownload('pdf')}
          >
            {loadingType === 'pdf' ? <span className="spinner" /> : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
