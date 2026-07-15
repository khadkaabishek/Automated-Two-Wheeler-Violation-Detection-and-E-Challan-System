import { useEffect, useState, useCallback } from 'react';
import { auditLogApi } from '../api/auditLogs';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

export default function AuditLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditLogApi.list({ page, limit: 15 });
      setLogs(res.logs);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Audit Log</div>
          <div className="page-sub">Every login, creation, approval, and payment event, in order</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Loader />
        ) : logs.length === 0 ? (
          <EmptyState title="No activity recorded yet" />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td>{l.user?.fullName || 'System'}</td>
                    <td>
                      <span className="chip">{l.action}</span>
                    </td>
                    <td className="mono">{l.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>
    </div>
  );
}
