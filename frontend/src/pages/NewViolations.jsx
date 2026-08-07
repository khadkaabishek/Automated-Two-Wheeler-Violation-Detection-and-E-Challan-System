import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flaggedDetectionApi } from '../api/flaggedDetections';
import { FILE_ORIGIN } from '../api/client';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { IconWarning } from '../components/icons';
import DetectionResultModal from '../components/DetectionResultModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const PHOTO_STAGES = [
  'Screening vehicle type…',
  'Checking helmet & counting riders…',
  'Locating plate (only if a violation was found)…',
];

const VIDEO_STAGES = [
  'Reading video and sampling frames…',
  'Screening vehicle type on each sampled frame…',
  'Checking helmet & counting riders on two-wheeler frames…',
  'Locating plates on frames with a violation…',
  'Compiling results…',
];

export default function NewViolations() {
  const toast = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canAct = hasPermission('challan:create');

  const [detections, setDetections] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [page, setPage] = useState(1);

  const [mode, setMode] = useState('photo'); // 'photo' | 'video'
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [photoResult, setPhotoResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flaggedDetectionApi.list({ page, limit: 10, status: statusFilter || undefined });
      setDetections(res.detections);
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

  // Cycles through a description of what the pipeline is doing while a
  // request is in flight. This isn't wired to the ML service's actual
  // per-frame progress (that would need a streaming connection) — it's an
  // honest best-effort "here's roughly what's happening" indicator, shown
  // as a persistent panel rather than a toast that vanishes in a few
  // seconds while video processing can take a minute or more.
  useEffect(() => {
    if (!uploading) {
      setStageIndex(0);
      return;
    }
    const stages = mode === 'video' ? VIDEO_STAGES : PHOTO_STAGES;
    const interval = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, stages.length - 1));
    }, mode === 'video' ? 4000 : 700);
    return () => clearInterval(interval);
  }, [uploading, mode]);

  const handleUploadPhoto = async () => {
    if (!uploadFile) return toast.error('Choose a photo first');
    setUploading(true);
    try {
      const result = await flaggedDetectionApi.submit(uploadFile);
      setPhotoResult(result.screenResult);
      if (result.flagged) {
        setStatusFilter('PENDING_REVIEW');
        setPage(1);
        load();
      }
      setUploadFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadVideo = async () => {
    if (!uploadFile) return toast.error('Choose a video first');
    setUploading(true);
    try {
      const result = await flaggedDetectionApi.submitVideo(uploadFile);
      if (result.flagged) {
        toast.success(
          `${result.detections.length} violation${result.detections.length === 1 ? '' : 's'} found across the video and added to the review queue`
        );
        setStatusFilter('PENDING_REVIEW');
        setPage(1);
        load();
      } else {
        toast.info(
          `Screened ${result.framesSampled} frame${result.framesSampled === 1 ? '' : 's'} across ${result.durationSec}s — no confident violations found`
        );
      }
      setUploadFile(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => (mode === 'photo' ? handleUploadPhoto() : handleUploadVideo());

  const handleDismiss = async (id) => {
    if (!window.confirm('Dismiss this detection as a false positive?')) return;
    setActionLoading(id);
    try {
      await flaggedDetectionApi.dismiss(id);
      toast.success('Detection dismissed');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateNotice = (detection) => {
    navigate('/challans', {
      state: {
        flaggedDetectionId: detection.id,
        suggestedViolation: detection.violationLabel,
        evidenceImagePath: detection.evidenceImagePath,
      },
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconWarning size={22} color="var(--civic-red)" />
            New Violations
          </div>
          <div className="page-sub">Detections from the automated screening pipeline, awaiting review</div>
        </div>
      </div>

      {canAct && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              className={mode === 'photo' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              onClick={() => {
                setMode('photo');
                setUploadFile(null);
              }}
            >
              Photo
            </button>
            <button
              type="button"
              className={mode === 'video' ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
              onClick={() => {
                setMode('video');
                setUploadFile(null);
              }}
            >
              Video
            </button>
          </div>

          <div className="card__title" style={{ marginBottom: 4, fontSize: 13.5 }}>
            {mode === 'photo' ? 'Submit a photo for screening' : 'Submit a video for screening'}
          </div>
          <div className="card__desc" style={{ marginBottom: 14 }}>
            {mode === 'photo' ? (
              'Runs the staged pipeline (vehicle type → helmet + triple-riding → plate location). Only confident two-wheeler violations land in the queue below.'
            ) : (
              <>
                Samples frames across the video and runs each through the same pipeline. Every violation
                found becomes its own queue item with its own captured frame and timestamp. Longer clips
                take longer — a short clip can take a minute or more on CPU, so the page will show a
                spinner while it works. Don&apos;t close the tab while it&apos;s running.
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              className="input"
              type="file"
              accept={mode === 'photo' ? 'image/*' : 'video/*'}
              style={{ maxWidth: 280 }}
              disabled={uploading}
              onChange={(e) => setUploadFile(e.target.files[0] || null)}
            />
            <button className="btn btn-warn" disabled={!uploadFile || uploading} onClick={handleUpload}>
              {uploading ? <span className="spinner" /> : 'Screen for violations'}
            </button>
          </div>

          {uploading && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'var(--civic-blue-50)',
                border: '1px solid var(--civic-blue-100)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span className="spinner" style={{ color: 'var(--civic-blue-700)' }} />
              <span style={{ fontSize: 12.5, color: 'var(--civic-blue-700)' }}>
                {(mode === 'video' ? VIDEO_STAGES : PHOTO_STAGES)[stageIndex]}
              </span>
            </div>
          )}
        </div>
      )}

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
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="CONVERTED">Converted to notice</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : detections.length === 0 ? (
          <EmptyState title="No detections found" desc="Submit a photo or video above, or check back later." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {detections.map((d) => (
              <div key={d.id} className="card" style={{ padding: 14 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={`${FILE_ORIGIN}${d.evidenceImagePath}`}
                    alt="Detection evidence"
                    style={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 10,
                      border: '1px solid var(--border)',
                    }}
                  />
                  {d.sourceType === 'video' && (
                    <span
                      className="chip"
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      Video · {formatTimestamp(d.frameTimestampSec)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span className="chip chip--violation">{d.violationLabel}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-700)', marginBottom: 4 }}>
                  Vehicle type: <strong>{d.vehicleType}</strong> · Confidence:{' '}
                  {Math.round(Number(d.confidence) * 100)}%
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-500)', marginBottom: 10 }}>
                  Detected {new Date(d.createdAt).toLocaleString()} · submitted by {d.submittedBy?.fullName}
                </div>
                {d.platePreviewPaths?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {d.platePreviewPaths.map((p, i) => (
                      <img
                        key={i}
                        src={`${FILE_ORIGIN}${p}`}
                        alt="Plate preview"
                        style={{ height: 32, borderRadius: 4, border: '1px solid var(--border-strong)' }}
                      />
                    ))}
                  </div>
                )}
                {d.status === 'PENDING_REVIEW' && canAct && (
                  <div className="row-actions">
                    <button
                      className="btn btn-warn btn-sm"
                      disabled={actionLoading === d.id}
                      onClick={() => handleCreateNotice(d)}
                    >
                      Create violation notice
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={actionLoading === d.id}
                      onClick={() => handleDismiss(d.id)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                {d.status === 'CONVERTED' && d.challan && (
                  <div style={{ fontSize: 12, color: 'var(--signal-green)' }}>→ {d.challan.challanNumber}</div>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {photoResult && (
        <DetectionResultModal
          result={photoResult}
          onClose={() => setPhotoResult(null)}
          footer={
            <>
              {(photoResult.resultStatus === 'VIOLATION_NO_PLATE' ||
                photoResult.resultStatus === 'VIOLATION_WITH_PLATE') && (
                <span style={{ fontSize: 12.5, color: 'var(--signal-green)', marginRight: 'auto', alignSelf: 'center' }}>
                  Added to the review queue below
                </span>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setPhotoResult(null)}>
                Close
              </button>
            </>
          }
        />
      )}
    </div>
  );
}

function formatTimestamp(sec) {
  const total = Math.round(Number(sec) || 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
