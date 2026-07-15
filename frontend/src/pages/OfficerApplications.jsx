import { useEffect, useState, useCallback } from 'react';
import { officerApplicationApi } from '../api/officerApplications';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';

export default function OfficerApplications() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await officerApplicationApi.list({ page, limit: 10, status: statusFilter || undefined });
      setApplications(res.applications);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (app) => {
    if (!window.confirm(`Promote ${app.applicant.fullName} to Traffic Police?`)) return;
    setActionLoading(true);
    try {
      await officerApplicationApi.approve(app.id);
      toast.success(`${app.applicant.fullName} is now a Traffic Police officer`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (app) => {
    setRejectTarget(app);
    setRejectReason('');
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await officerApplicationApi.reject(rejectTarget.id, rejectReason);
      toast.success('Application rejected');
      setRejectTarget(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Officer Applications</div>
          <div className="page-sub">Citizens requesting to join as Traffic Police</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select className="select" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : applications.length === 0 ? (
          <EmptyState title="No applications found" />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Desired station</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>{a.applicant?.fullName}</td>
                    <td className="mono">{a.applicant?.email}</td>
                    <td>{a.desiredStation || '—'}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      {a.status === 'PENDING' && (
                        <div className="row-actions">
                          <button
                            className="btn btn-success btn-sm"
                            disabled={actionLoading}
                            onClick={() => handleApprove(a)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={actionLoading}
                            onClick={() => openReject(a)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {rejectTarget && (
        <Modal title={`Reject application — ${rejectTarget.applicant?.fullName}`} onClose={() => setRejectTarget(null)}>
          <form onSubmit={handleReject}>
            <Field label="Reason">
              <textarea
                className="textarea"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected"
              />
            </Field>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setRejectTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                {actionLoading ? <span className="spinner" /> : 'Reject application'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
