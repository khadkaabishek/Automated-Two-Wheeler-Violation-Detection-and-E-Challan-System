import { useEffect, useState, useCallback } from 'react';
import { paymentApi } from '../api/payments';
import { challanApi } from '../api/challans';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const METHODS = ['CASH', 'BANK_TRANSFER', 'ESEWA', 'KHALTI', 'STRIPE'];

export default function Payments() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const canReview = hasPermission('payment:update');

  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [challanQuery, setChallanQuery] = useState('');
  const [challanResults, setChallanResults] = useState([]);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [method, setMethod] = useState('CASH');
  const [saving, setSaving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentApi.list({ page, limit: 10, status: statusFilter || undefined });
      setPayments(res.payments);
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

  useEffect(() => {
    if (!challanQuery.trim()) {
      setChallanResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const res = await challanApi.list({ search: challanQuery, status: 'APPROVED', limit: 8 });
        setChallanResults(res.challans);
      } catch {
        setChallanResults([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [challanQuery]);

  const openCreate = () => {
    setSelectedChallan(null);
    setChallanQuery('');
    setMethod('CASH');
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedChallan) return toast.error('Select an approved violation');
    setSaving(true);
    try {
      await paymentApi.create({
        challanId: selectedChallan.id,
        amount: Number(selectedChallan.fineAmount),
        paymentMethod: method,
      });
      toast.success('Payment request submitted — a traffic officer will review it');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (payment) => {
    if (!window.confirm(`Approve this payment of Rs ${Number(payment.amount).toLocaleString()}?`)) return;
    setActionLoading(true);
    try {
      await paymentApi.approve(payment.id);
      toast.success('Payment approved — violation marked paid');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (payment) => {
    setRejectTarget(payment);
    setRejectReason('');
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await paymentApi.reject(rejectTarget.id, rejectReason);
      toast.success('Payment request rejected');
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
          <div className="page-title">Payments</div>
          <div className="page-sub">
            {canReview
              ? 'Review and approve or reject citizen-submitted payment requests'
              : 'Submit a payment request for an approved violation'}
          </div>
        </div>
        {hasPermission('payment:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Submit payment request
          </button>
        )}
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
            <option value="SUCCESS">Approved</option>
            <option value="FAILED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : payments.length === 0 ? (
          <EmptyState title="No payment requests yet" desc="Requests will show up here once submitted." />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Violation</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  {canReview && <th></th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="mono">{p.transactionId}</td>
                    <td className="mono">{p.challan?.challanNumber}</td>
                    <td className="mono">Rs {Number(p.amount).toLocaleString()}</td>
                    <td>{p.paymentMethod}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ color: 'var(--ink-500)' }}>
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '—'}
                    </td>
                    {canReview && (
                      <td>
                        {p.status === 'PENDING' && (
                          <div className="row-actions">
                            <button
                              className="btn btn-success btn-sm"
                              disabled={actionLoading}
                              onClick={() => handleApprove(p)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={actionLoading}
                              onClick={() => openReject(p)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {modalOpen && (
        <Modal title="Submit payment request" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate}>
            <Field label="Violation (approved only)">
              {selectedChallan ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 11px',
                  }}
                >
                  <span className="mono">
                    {selectedChallan.challanNumber} · Rs {Number(selectedChallan.fineAmount).toLocaleString()}
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedChallan(null)}>
                    Change
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    placeholder="Search approved violation number or plate…"
                    value={challanQuery}
                    onChange={(e) => setChallanQuery(e.target.value)}
                  />
                  {challanQuery.trim() && (
                    <div
                      className="card"
                      style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 30, padding: 6 }}
                    >
                      {challanResults.length === 0 && (
                        <div style={{ padding: 8, fontSize: 12, color: 'var(--ink-500)' }}>
                          No approved violations match
                        </div>
                      )}
                      {challanResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedChallan(c);
                            setChallanQuery('');
                          }}
                          style={{ padding: 8, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--civic-blue-50)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="mono">{c.challanNumber}</span>{' '}
                          <span style={{ color: 'var(--ink-500)' }}>
                            · {c.vehicle?.vehicleNumber} · Rs {Number(c.fineAmount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field label="Payment method">
              <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <span className="field-hint">
                A traffic officer will review and confirm this request before your violation is marked paid.
              </span>
            </Field>

            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Submit request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {rejectTarget && (
        <Modal title="Reject payment request" onClose={() => setRejectTarget(null)}>
          <form onSubmit={handleReject}>
            <Field label="Reason">
              <textarea
                className="textarea"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Cash was never received, invalid reference number"
              />
            </Field>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setRejectTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                {actionLoading ? <span className="spinner" /> : 'Reject request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
