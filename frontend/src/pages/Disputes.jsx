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

const BASE = 'http://localhost:5001';

export default function Disputes() {
  const toast = useToast();
  const [disputes, setDisputes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteTarget, setNoteTarget] = useState(null); // { dispute, decision }
  const [note, setNote] = useState('');
  const [viewImage, setViewImage] = useState(null);

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
        toast.success('Dispute upheld — citation voided');
      } else {
        await disputeApi.dismiss(noteTarget.dispute.id, note);
        toast.success('Dispute dismissed — citation stands');
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
            Citation Disputes
          </div>
          <div className="page-sub">Citizens appealing a citation they believe was issued in error</div>
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
                  <th>Citation</th>
                  <th>Raised by</th>
                  <th>Reason</th>
                  <th>Evidence</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr key={d.id}>
                    <td className="mono">{d.challan?.challanNumber}</td>
                    <td>{d.raisedBy?.fullName}</td>
                    <td style={{ maxWidth: 260, color: 'var(--ink-700)' }}>{d.reason}</td>
                    <td>
                      {d.evidences?.length > 0 ? (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {d.evidences.map((ev) => (
                            ev.type === 'IMAGE' || ev.url.match(/\.(jpg|jpeg|png|webp|bmp)$/i) ? (
                              <img
                                key={ev.id}
                                src={`${BASE}${ev.url}`}
                                alt="evidence"
                                style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #e5e7eb' }}
                                onClick={() => setViewImage(`${BASE}${ev.url}`)}
                                title="Click to enlarge"
                              />
                            ) : (
                              <a key={ev.id} href={`${BASE}${ev.url}`} target="_blank" rel="noreferrer"
                                style={{ fontSize: 11, padding: '2px 6px', background: '#f3f4f6', borderRadius: 4, color: '#374151', textDecoration: 'none' }}>
                                🎥 Video
                              </a>
                            )
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>None</span>
                      )}
                    </td>
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
            noteTarget.decision === 'UPHELD' ? 'Uphold dispute — void citation' : 'Dismiss dispute — citation stands'
          }
          onClose={() => setNoteTarget(null)}
        >
          <form onSubmit={handleResolve}>
            {/* Citizen's reason */}
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
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 4 }}>
                Citizen's reason
              </div>
              {noteTarget.dispute.reason}
            </div>

            {/* Evidence uploaded by citizen */}
            {noteTarget.dispute.evidences?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 8 }}>
                  Supporting evidence ({noteTarget.dispute.evidences.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {noteTarget.dispute.evidences.map((ev) => {
                    const url = `${BASE}${ev.url}`;
                    return ev.type === 'IMAGE' || ev.url.match(/\.(jpg|jpeg|png|webp|bmp)$/i) ? (
                      <div
                        key={ev.id}
                        style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', border: '2px solid #e5e7eb', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => setViewImage(url)}
                        title="Click to view full size"
                      >
                        <img src={url} alt="Dispute evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <a
                        key={ev.id}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, width: 120, height: 80, borderRadius: 8, border: '2px solid #e5e7eb', background: '#f3f4f6', color: '#374151', textDecoration: 'none', fontSize: 12 }}
                      >
                        <span style={{ fontSize: 24 }}>🎥</span>
                        <span>Video</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

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
                  'Uphold & void citation'
                ) : (
                  'Dismiss dispute'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Fullscreen image lightbox */}
      {viewImage && (
        <div
          onClick={() => setViewImage(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewImage(null)} style={{ position: 'absolute', top: -44, right: 0, background: 'none', border: 'none', color: 'white', fontSize: '2.2rem', cursor: 'pointer' }}>
              &times;
            </button>
            <img src={viewImage} alt="Evidence" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} />
          </div>
        </div>
      )}
    </div>
  );
}

