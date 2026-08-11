import { useEffect, useState, useCallback, useRef } from 'react';
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

const BASE = 'http://localhost:5001';

// Methods that require a transaction receipt
const ONLINE_METHODS = ['ESEWA', 'KHALTI', 'STRIPE', 'BANK_TRANSFER'];

const METHOD_META = {
  CASH: {
    label: 'Cash',
    icon: '💵',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    hint: 'Pay in person at the traffic office. A receipt will be issued.',
  },
  BANK_TRANSFER: {
    label: 'Bank Transfer',
    icon: '🏦',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#93c5fd',
    hint: 'Transfer to the official account. Upload your bank transaction screenshot.',
  },
  ESEWA: {
    label: 'eSewa',
    icon: '🟢',
    color: '#1a7c3e',
    bg: '#f0fdf4',
    border: '#4ade80',
    hint: 'Use your eSewa wallet. Screenshot the payment confirmation and upload it.',
  },
  KHALTI: {
    label: 'Khalti',
    icon: '🟣',
    color: '#5c2d91',
    bg: '#faf5ff',
    border: '#c084fc',
    hint: 'Use your Khalti wallet. Upload the payment success screenshot as proof.',
  },
  STRIPE: {
    label: 'Stripe / Card',
    icon: '💳',
    color: '#6366f1',
    bg: '#eef2ff',
    border: '#a5b4fc',
    hint: 'Pay by debit/credit card via Stripe. Upload the receipt or card statement.',
  },
};

function MethodTile({ value, selected, onClick }) {
  const m = METHOD_META[value];
  return (
    <div
      onClick={() => onClick(value)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '14px 10px',
        borderRadius: 10,
        cursor: 'pointer',
        border: `2px solid ${selected ? m.color : m.border}`,
        background: selected ? m.bg : '#fff',
        boxShadow: selected ? `0 0 0 3px ${m.color}22` : 'none',
        transition: 'all .18s',
        flex: '1 1 0',
        minWidth: 80,
      }}
    >
      <span style={{ fontSize: 24 }}>{m.icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
    </div>
  );
}

function ReceiptDropzone({ file, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  const handleFile = (f) => {
    if (f && f.type.startsWith('image/')) onChange(f);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${drag ? '#6366f1' : '#d1d5db'}`,
          borderRadius: 10,
          padding: preview ? '12px' : '28px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: drag ? '#eef2ff' : '#f9fafb',
          transition: 'all .15s',
        }}
      >
        {preview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={preview}
              alt="Receipt preview"
              style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8, display: 'block', margin: '0 auto' }}
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              style={{
                position: 'absolute', top: -10, right: -10, width: 24, height: 24,
                borderRadius: '50%', border: 'none', background: '#ef4444', color: '#fff',
                cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >x</button>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{file.name}</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📎</div>
            <div style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>
              Drag and drop or click to upload
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              PNG, JPG, WEBP -- max 10 MB
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

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
  const [receiptFile, setReceiptFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [viewReceipt, setViewReceipt] = useState(null);

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

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!challanQuery.trim()) { setChallanResults([]); return; }
    const handle = setTimeout(async () => {
      try {
        const res = await challanApi.list({ search: challanQuery, status: 'APPROVED', limit: 8 });
        setChallanResults(res.challans);
      } catch { setChallanResults([]); }
    }, 300);
    return () => clearTimeout(handle);
  }, [challanQuery]);

  const openCreate = () => {
    setSelectedChallan(null);
    setChallanQuery('');
    setMethod('CASH');
    setReceiptFile(null);
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedChallan) return toast.error('Select an approved citation');
    const needsReceipt = ONLINE_METHODS.includes(method);
    if (needsReceipt && !receiptFile) {
      return toast.error('Please upload your transaction receipt screenshot as proof of payment');
    }
    setSaving(true);
    try {
      const payment = await paymentApi.create({
        challanId: selectedChallan.id,
        amount: Number(selectedChallan.fineAmount),
        paymentMethod: method,
      });
      if (receiptFile) {
        await paymentApi.uploadReceipt(payment.id, receiptFile);
      }
      toast.success('Payment request submitted -- a traffic officer will review it');
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
      toast.success('Payment approved -- citation marked paid');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openReject = (payment) => { setRejectTarget(payment); setRejectReason(''); };

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

  const isOnline = ONLINE_METHODS.includes(method);
  const methodMeta = METHOD_META[method];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">
            {canReview
              ? 'Review and approve or reject citizen-submitted payment requests'
              : 'Submit a payment request for an approved citation'}
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
          <select className="select" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
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
                  <th>Citation</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Receipt</th>
                  <th>Status</th>
                  <th>Date</th>
                  {canReview && <th></th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const receiptUrl = p.transactionReceiptUrl ? `${BASE}${p.transactionReceiptUrl}` : null;
                  const mm = METHOD_META[p.paymentMethod];
                  return (
                    <tr key={p.id}>
                      <td className="mono">{p.transactionId}</td>
                      <td className="mono">{p.challan?.challanNumber}</td>
                      <td className="mono">Rs {Number(p.amount).toLocaleString()}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13,
                          padding: '2px 8px', borderRadius: 20,
                          background: mm?.bg || '#f3f4f6',
                          color: mm?.color || '#374151',
                          border: `1px solid ${mm?.border || '#e5e7eb'}`,
                          fontWeight: 500,
                        }}>
                          {mm?.icon} {mm?.label || p.paymentMethod}
                        </span>
                      </td>
                      <td>
                        {receiptUrl ? (
                          <img
                            src={receiptUrl}
                            alt="Receipt"
                            onClick={() => setViewReceipt(receiptUrl)}
                            title="Click to view receipt"
                            style={{
                              width: 48, height: 36, objectFit: 'cover', borderRadius: 5,
                              cursor: 'pointer', border: '2px solid #e5e7eb', transition: 'border-color .15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6366f1')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--ink-400)' }}>--</span>
                        )}
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td style={{ color: 'var(--ink-500)' }}>
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '--'}
                      </td>
                      {canReview && (
                        <td>
                          {p.status === 'PENDING' && (
                            <div className="row-actions">
                              <button className="btn btn-success btn-sm" disabled={actionLoading} onClick={() => handleApprove(p)}>
                                Approve
                              </button>
                              <button className="btn btn-danger btn-sm" disabled={actionLoading} onClick={() => openReject(p)}>
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {modalOpen && (
        <Modal title="Submit payment request" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate}>
            <Field label="Citation (approved only)">
              {selectedChallan ? (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--surface-alt)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '8px 11px',
                }}>
                  <span className="mono">
                    {selectedChallan.challanNumber} · Rs {Number(selectedChallan.fineAmount).toLocaleString()}
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedChallan(null)}>Change</button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    placeholder="Search approved citation number or plate..."
                    value={challanQuery}
                    onChange={(e) => setChallanQuery(e.target.value)}
                  />
                  {challanQuery.trim() && (
                    <div className="card" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 30, padding: 6 }}>
                      {challanResults.length === 0 && (
                        <div style={{ padding: 8, fontSize: 12, color: 'var(--ink-500)' }}>No approved citations match</div>
                      )}
                      {challanResults.map((c) => (
                        <div key={c.id} onClick={() => { setSelectedChallan(c); setChallanQuery(''); }}
                          style={{ padding: 8, borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--civic-blue-50)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <span className="mono">{c.challanNumber}</span>{' '}
                          <span style={{ color: 'var(--ink-500)' }}>· {c.vehicle?.vehicleNumber} · Rs {Number(c.fineAmount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Field>

            <Field label="Payment method">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.keys(METHOD_META).map((m) => (
                  <MethodTile key={m} value={m} selected={method === m} onClick={setMethod} />
                ))}
              </div>
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 8,
                background: methodMeta.bg, border: `1px solid ${methodMeta.border}`,
                fontSize: 12, color: methodMeta.color, display: 'flex', gap: 8, alignItems: 'flex-start',
              }}>
                <span>i</span>
                <span>{methodMeta.hint}</span>
              </div>
            </Field>

            {isOnline && (
              <Field label="Transaction receipt (required)">
                <ReceiptDropzone file={receiptFile} onChange={setReceiptFile} />
                <span className="field-hint" style={{ marginTop: 6, display: 'block' }}>
                  Upload a screenshot of your payment confirmation from {methodMeta.label}.
                  An officer will verify this before approving your request.
                </span>
              </Field>
            )}

            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Submit request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {rejectTarget && (
        <Modal title="Reject payment request" onClose={() => setRejectTarget(null)}>
          {rejectTarget.transactionReceiptUrl && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-400)', marginBottom: 8 }}>
                Submitted Receipt
              </div>
              <img
                src={`${BASE}${rejectTarget.transactionReceiptUrl}`}
                alt="Payment receipt"
                style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'zoom-in' }}
                onClick={() => setViewReceipt(`${BASE}${rejectTarget.transactionReceiptUrl}`)}
              />
            </div>
          )}
          <form onSubmit={handleReject}>
            <Field label="Reason">
              <textarea
                className="textarea"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Receipt appears altered, reference number does not match"
              />
            </Field>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button type="submit" className="btn btn-danger" disabled={actionLoading}>
                {actionLoading ? <span className="spinner" /> : 'Reject request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewReceipt && (
        <div
          onClick={() => setViewReceipt(null)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.92)',
            zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', cursor: 'zoom-out',
          }}
        >
          <div
            style={{ position: 'relative', maxWidth: '92vw', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewReceipt(null)}
              style={{
                position: 'absolute', top: -44, right: 0, background: 'none',
                border: 'none', color: 'white', fontSize: '2.2rem', cursor: 'pointer',
              }}
            >X</button>
            <div style={{
              background: 'rgba(255,255,255,0.06)', padding: 8, borderRadius: 14,
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', textAlign: 'center', marginBottom: 6 }}>
                Transaction Receipt
              </div>
              <img
                src={viewReceipt}
                alt="Receipt fullscreen"
                style={{ maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 10 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
