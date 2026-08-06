import { useEffect, useState, useCallback } from 'react';
import { disputeApi } from '../api/disputes';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { IconGavel } from '../components/icons';
import { useToast } from '../context/ToastContext';

export default function Disputes() {
  const [disputeReason, setDisputeReason] = useState('NOT_MY_VEHICLE');
  const [descriptionText, setDescriptionText] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const handleEvidenceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };
  const toast = useToast();
  const [disputes, setDisputes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null); // { dispute, decision }
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await disputeApi.list({ page, limit: 10, status: statusFilter || undefined });
      setDisputes(res.disputes);
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

  const openResolve = (dispute, decision) => {
    setNoteTarget({ dispute, decision });
    setNote('');
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (noteTarget.decision === 'UPHELD') {
        await disputeApi.uphold(noteTarget.dispute.id, note);
        toast.success('Dispute upheld — violation voided');
      } else {
        await disputeApi.dismiss(noteTarget.dispute.id, note);
        toast.success('Dispute dismissed — violation stands');
      }
      setNoteTarget(null);
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
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconGavel size={22} color="var(--civic-red)" />
            Violation Disputes
          </div>
          <div className="page-sub">Citizens appealing a violation they believe was issued in error</div>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="UPHELD">Upheld</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : disputes.length === 0 ? (
          <EmptyState title="No disputes found" />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Violation</th>
                  <th>Raised by</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td className="mono">{d.challan?.challanNumber}</td>
                    <td>{d.raisedBy?.fullName}</td>
                    <td style={{ maxWidth: 320, color: 'var(--ink-700)' }}>{d.reason}</td>
                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                    <td>
                      {d.status === 'PENDING' && (
                        <div className="row-actions">
                          <button className="btn btn-success btn-sm" onClick={() => openResolve(d, 'DISMISSED')}>
                            Dismiss
                          </button>
                          <button className="btn btn-warn btn-sm" onClick={() => openResolve(d, 'UPHELD')}>
                            Uphold (void)
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

      {noteTarget && (
        <Modal
          title={
            noteTarget.decision === 'UPHELD' ? 'Uphold dispute — void violation' : 'Dismiss dispute — violation stands'
          }
          onClose={() => setNoteTarget(null)}
        >
          <form onSubmit={handleResolve}>
            <div
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--ink-700)',
                marginBottom: 16,
              }}
            >
              {noteTarget.dispute.reason}
            </div>
            <Field label="Resolution note (optional)">
              <textarea
                className="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain your decision — this is shown to the citizen"
              />
            </Field>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setNoteTarget(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className={noteTarget.decision === 'UPHELD' ? 'btn btn-warn' : 'btn btn-success'}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="spinner" />
                ) : noteTarget.decision === 'UPHELD' ? (
                  'Uphold & void violation'
                ) : (
                  'Dismiss dispute'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
