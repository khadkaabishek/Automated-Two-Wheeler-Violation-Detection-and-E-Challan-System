import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { challanApi } from '../api/challans';
import { violationApi } from '../api/violations';
import { disputeApi } from '../api/disputes';
import { aiDetectionApi } from '../api/aiDetection';
import { toISODateTime } from '../utils/date';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import TicketCard from '../components/TicketCard';
import VehiclePicker from '../components/VehiclePicker';
import DetectionResultModal from '../components/DetectionResultModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'PAID', 'CLOSED', 'REJECTED', 'CANCELLED'];

const EMPTY_FORM = {
  vehicle: null,
  violationIds: [],
  description: '',
  address: '',
  gpsLatitude: '',
  gpsLongitude: '',
  incidentDate: '',
  incidentTime: '',
  aiDetectionId: null,
  aiSnapshotUrl: null,
};

export default function Challans() {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [totalFineSum, setTotalFineSum] = useState(0);

  const calculateTotalFines = (items) => {
    return items.reduce((acc, curr) => acc + Number(curr.amount || curr.fineAmount || 0), 0);
  };
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const [challans, setChallans] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSaving, setDisputeSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [violationOptions, setViolationOptions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [analyzeFile, setAnalyzeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [evidenceVideos, setEvidenceVideos] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await challanApi.list({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setChallans(res.challans);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = async (prefillData = null) => {
    setForm(EMPTY_FORM);
    setCreateOpen(true);
    setAnalyzeFile(null);
    setAnalyzeResult(null);
    try {
      const res = await violationApi.list({ isActive: 'true', limit: 100 });
      setViolationOptions(res.violations);
      
      if (prefillData) {
        // We have prefill data from AI Detection
        // 1. Try to find the vehicle
        try {
          const vRes = await api.get('/vehicles', { search: prefillData.aiPlateNumber });
          if (vRes.vehicles?.length > 0) {
            setForm(f => ({ ...f, vehicle: vRes.vehicles[0] }));
          }
        } catch (e) {
           // Ignore
        }
        
        // 2. Map violation names to IDs
        const matchedViolationIds = res.violations
          .filter(v => prefillData.aiViolations.includes(v.name))
          .map(v => v.id);
          
        setForm(f => ({
          ...f,
          violationIds: matchedViolationIds,
          description: `Automated AI Detection - OCR Plate: ${prefillData.aiPlateNumber}`,
          aiDetectionId: prefillData.aiDetectionId,
          aiSnapshotUrl: prefillData.aiSnapshotUrl,
        }));
      }
    } catch {
      /* non-fatal */
    }
  };

  useEffect(() => {
    if (location.state?.autoOpenCreate) {
      openCreate(location.state);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleViolation = (id) => {
    setForm((f) => ({
      ...f,
      violationIds: f.violationIds.includes(id)
        ? f.violationIds.filter((x) => x !== id)
        : [...f.violationIds, id],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.vehicle) return toast.error('Select a vehicle');
    if (form.violationIds.length === 0) return toast.error('Select at least one violation');

    setSaving(true);
    try {
      const newChallan = await challanApi.create({
        vehicleId: form.vehicle.id,
        violationIds: form.violationIds,
        description: form.description || undefined,
        address: form.address || undefined,
        gpsLatitude: form.gpsLatitude ? Number(form.gpsLatitude) : undefined,
        gpsLongitude: form.gpsLongitude ? Number(form.gpsLongitude) : undefined,
        incidentDate: toISODateTime(form.incidentDate),
        incidentTime: form.incidentTime,
        aiSnapshotUrl: form.aiSnapshotUrl,
      });
      
      // If this came from an AI detection, mark it as PROCESSED
      if (form.aiDetectionId) {
        await aiDetectionApi.updateDetection(form.aiDetectionId, 'PROCESSED');
      }

      toast.success('Challan issued');
      setCreateOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (id) => {
    setDetailId(id);
    setDetailLoading(true);
    setEvidenceImages([]);
    setEvidenceVideos([]);
    setDisputeOpen(false);
    setDisputeReason('');
    try {
      const res = await challanApi.get(id);
      setDetail(res);
    } catch (err) {
      toast.error(err.message);
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const ACTION_PAST_TENSE = {
    approve: 'approved',
    reject: 'rejected',
    close: 'closed',
    cancel: 'cancelled',
  };

  const runAction = async (action) => {
    setActionLoading(true);
    try {
      const updated = await challanApi[action](detailId);
      setDetail(updated);
      toast.success(`Violation ${ACTION_PAST_TENSE[action]}`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const submitDispute = async (e) => {
    e.preventDefault();
    setDisputeSaving(true);
    try {
      await disputeApi.create({ challanId: detailId, reason: disputeReason });
      toast.success('Dispute submitted — a reviewer will respond soon');
      setDisputeOpen(false);
      setDisputeReason('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDisputeSaving(false);
    }
  };

  const uploadEvidence = async () => {
    if (evidenceImages.length === 0 && evidenceVideos.length === 0) {
      return toast.error('Choose at least one file');
    }
    setActionLoading(true);
    try {
      const updated = await challanApi.uploadEvidence(detailId, evidenceImages, evidenceVideos);
      setDetail(updated);
      setEvidenceImages([]);
      setEvidenceVideos([]);
      toast.success('Evidence uploaded');
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
          <div className="page-title">Violations</div>
          <div className="page-sub">Violations issued, their status, and the enforcement trail</div>
        </div>
        {hasPermission('challan:create') && (
          <button className="btn btn-warn" onClick={() => openCreate()}>
            + Issue violation notice
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="input search-input"
            placeholder="Search violation number or plate…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : challans.length === 0 ? (
          <EmptyState title="No violations found" desc="Issue a violation to see it appear here." />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Violation #</th>
                  <th>Vehicle</th>
                  <th>Officer</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(c.id)}>
                    <td className="mono">{c.challanNumber}</td>
                    <td className="mono">{c.vehicle?.vehicleNumber}</td>
                    <td>{c.officer?.fullName}</td>
                    <td className="mono">Rs {Number(c.fineAmount).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={c.status} />
                      {c.description?.includes('Automated AI Detection') && (
                        <span className="chip" style={{ marginLeft: 8, background: 'var(--civic-gold)', color: '#000', fontSize: '0.7rem' }}>
                          🤖 AI Draft
                        </span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openDetail(c.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {/* ---- Create modal ---- */}
      {createOpen && (
        <Modal title="Issue violation notice" onClose={() => setCreateOpen(false)} wide>
          <form onSubmit={handleCreate}>
            {form.evidenceImagePath && (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  background: 'var(--signal-red-bg)',
                  border: '1px solid #efc3c8',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  marginBottom: 16,
                }}
              >
                <img
                  src={`${FILE_ORIGIN}${form.evidenceImagePath}`}
                  alt="Flagged detection evidence"
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                />
                <div style={{ fontSize: 12.5, color: 'var(--civic-red)' }}>
                  Creating this from a flagged detection — find and select the matching vehicle below.
                  The suggested violation is already checked.
                </div>
              </div>
            )}
            <Field label="Vehicle" full>
              <VehiclePicker value={form.vehicle} onChange={(v) => setForm({ ...form, vehicle: v })} />
            </Field>

            <Field label="Analyze a photo (optional)" full>
              <div
                style={{
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    style={{ maxWidth: 260 }}
                    onChange={(e) => {
                      setAnalyzeFile(e.target.files[0] || null);
                      setAnalyzeResult(null);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!analyzeFile || analyzing}
                    onClick={runAnalyze}
                  >
                    {analyzing ? <span className="spinner" /> : 'Detect violations'}
                  </button>
                </div>
                <div className="field-hint" style={{ marginTop: 8 }}>
                  Runs the photo through the full detection pipeline. Suggestions are advisory —
                  review and confirm before issuing.
                </div>
              </div>
            </Field>

            <Field label="Violations" full>
              <div className="checkbox-grid">
                {violationOptions.map((v) => (
                  <label key={v.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.violationIds.includes(v.id)}
                      onChange={() => toggleViolation(v.id)}
                    />
                    {v.name} · Rs {Number(v.fineAmount).toLocaleString()}
                  </label>
                ))}
              </div>
            </Field>

            <div className="form-grid">
              <Field label="Incident date">
                <input
                  className="input"
                  type="date"
                  required
                  value={form.incidentDate}
                  onChange={(e) => setForm({ ...form, incidentDate: e.target.value })}
                />
              </Field>
              <Field label="Incident time">
                <input
                  className="input"
                  type="time"
                  required
                  value={form.incidentTime}
                  onChange={(e) => setForm({ ...form, incidentTime: e.target.value })}
                />
              </Field>
              <Field label="GPS latitude (optional)">
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.gpsLatitude}
                  onChange={(e) => setForm({ ...form, gpsLatitude: e.target.value })}
                />
              </Field>
              <Field label="GPS longitude (optional)">
                <input
                  className="input"
                  type="number"
                  step="any"
                  value={form.gpsLongitude}
                  onChange={(e) => setForm({ ...form, gpsLongitude: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Location / address">
              <input
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <Field label="Notes (optional)">
              <textarea
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>

            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-warn" disabled={saving}>
                {saving ? <span className="spinner" /> : 'Issue violation notice'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---- AI detection result popup ---- */}
      {analyzeResult && (
        <DetectionResultModal
          result={analyzeResult}
          onClose={() => setAnalyzeResult(null)}
          onApplyViolation={(name) => {
            applySuggestedViolation(name);
          }}
          footer={
            <button type="button" className="btn btn-primary" onClick={() => setAnalyzeResult(null)}>
              Done reviewing
            </button>
          }
        />
      )}

      {/* ---- Detail modal ---- */}
      {detailId && (
        <Modal title="Violation detail" onClose={() => setDetailId(null)} wide>
          {detailLoading || !detail ? (
            <Loader />
          ) : (
            <>
              <TicketCard challan={detail}>
                <div className="row-actions">
                  {detail.status === 'PENDING' && hasPermission('challan:update') && (
                    <>
                      <button className="btn btn-success btn-sm" disabled={actionLoading} onClick={() => runAction('approve')}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={actionLoading} onClick={() => runAction('reject')}>
                        Reject
                      </button>
                    </>
                  )}
                  {(detail.status === 'PENDING' || detail.status === 'APPROVED') && hasPermission('challan:update') && (
                    <button className="btn btn-ghost btn-sm" disabled={actionLoading} onClick={() => runAction('cancel')}>
                      Cancel
                    </button>
                  )}
                  {detail.status === 'PAID' && hasPermission('challan:update') && (
                    <button className="btn btn-success btn-sm" disabled={actionLoading} onClick={() => runAction('close')}>
                      Close
                    </button>
                  )}
                  {hasRole('User') && ['PENDING', 'APPROVED'].includes(detail.status) && (
                    <button className="btn btn-warn btn-sm" onClick={() => setDisputeOpen(true)}>
                      Dispute — I didn&apos;t do this
                    </button>
                  )}
                </div>
              </TicketCard>

              {disputeOpen && (
                <div className="card" style={{ marginTop: 16, borderColor: 'var(--civic-red-dim)' }}>
                  <div className="card__title" style={{ fontSize: 13, color: 'var(--civic-red)', marginBottom: 10 }}>
                    Dispute this violation
                  </div>
                  <form onSubmit={submitDispute}>
                    <Field label="Why do you believe this violation is incorrect?">
                      <textarea
                        className="textarea"
                        required
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Explain what happened — a traffic officer or admin will review this"
                      />
                    </Field>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDisputeOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-warn btn-sm" disabled={disputeSaving}>
                        {disputeSaving ? <span className="spinner" /> : 'Submit dispute'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {detail.evidences?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="ticket__label" style={{ marginBottom: 8 }}>
                    Evidence on file ({detail.evidences.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {detail.evidences.map((ev) => (
                      <span key={ev.id} className="chip">
                        {ev.type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasPermission('challan:update') && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card__title" style={{ marginBottom: 10, fontSize: 13 }}>
                    Attach evidence
                  </div>
                  <div className="form-grid">
                    <Field label="Images">
                      <input
                        className="input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setEvidenceImages(Array.from(e.target.files))}
                      />
                    </Field>
                    <Field label="Videos">
                      <input
                        className="input"
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => setEvidenceVideos(Array.from(e.target.files))}
                      />
                    </Field>
                  </div>
                  <button className="btn btn-primary btn-sm" disabled={actionLoading} onClick={uploadEvidence}>
                    {actionLoading ? <span className="spinner" /> : 'Upload'}
                  </button>
                </div>
              )}
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
