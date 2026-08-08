import Modal from './Modal';
import { IconWarning } from './icons';

const STATUS_CONFIG = {
  NO_VEHICLE: {
    title: 'No Vehicle Detected',
    badgeColor: 'grey',
    badgeLabel: 'No vehicle',
  },
  NOT_TWO_WHEELER: {
    title: 'Not a Two-Wheeler',
    badgeColor: 'blue',
    badgeLabel: 'Out of scope',
  },
  NO_VIOLATION: {
    title: 'No Violations Detected',
    badgeColor: 'green',
    badgeLabel: 'Clear',
  },
  VIOLATION_NO_PLATE: {
    title: 'Violation Detected',
    badgeColor: 'red',
    badgeLabel: 'Plate not found',
  },
  VIOLATION_WITH_PLATE: {
    title: 'Violation Detected',
    badgeColor: 'red',
    badgeLabel: 'Plate located',
  },
};

/**
 * The single, consistent way this app shows a detection result — a large
 * centered popup with the annotated (bounding-boxes-drawn) image at a
 * fixed, properly-scaled size, the plain-language outcome, the violations
 * found (if any), and the plate status. Used both for the inline "Analyze
 * a photo" step while issuing a violation notice and for photo submissions
 * on the New Violations page.
 */
export default function DetectionResultModal({ result, onClose, footer, onApplyViolation }) {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);
  if (!result) return null;

  const config = STATUS_CONFIG[result.resultStatus] || {
    title: 'Detection Result',
    badgeColor: 'grey',
    badgeLabel: result.resultStatus,
  };

  const hasViolation = result.resultStatus === 'VIOLATION_NO_PLATE' || result.resultStatus === 'VIOLATION_WITH_PLATE';

  return (
    <Modal title={config.title} onClose={onClose} size="large" footer={footer}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className={`badge badge-${config.badgeColor}`}>
          <span className="badge-dot" />
          {config.badgeLabel}
        </span>
        {result.processingMs != null && (
          <span style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>Screened in {result.processingMs}ms</span>
        )}
      </div>

      {result.annotatedImageBase64 && (
        <div
          style={{
            width: '100%',
            height: '52vh',
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          <img
            src={`data:image/jpeg;base64,${result.annotatedImageBase64}`}
            alt="Annotated detection result"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 16,
          background: hasViolation ? 'var(--signal-red-bg)' : 'var(--surface-alt)',
          border: `1px solid ${hasViolation ? '#efc3c8' : 'var(--border)'}`,
        }}
      >
        {hasViolation && (
          <span style={{ marginTop: 1, flexShrink: 0 }}>
            <IconWarning size={16} color="var(--civic-red)" />
          </span>
        )}
        <span style={{ fontSize: 13.5, color: hasViolation ? 'var(--civic-red)' : 'var(--ink-700)', fontWeight: 500 }}>
          {result.resultMessage}
        </span>
      </div>

      {result.suggestedViolations?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="ticket__label" style={{ marginBottom: 8 }}>
            Violations found {onApplyViolation && '— click to add to the form'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {result.suggestedViolations.map((v) =>
              onApplyViolation ? (
                <button
                  key={v}
                  type="button"
                  className="chip chip--violation"
                  style={{ cursor: 'pointer', border: '1px solid #efc3c8' }}
                  onClick={() => onApplyViolation(v)}
                >
                  + {v}
                </button>
              ) : (
                <span key={v} className="chip chip--violation">
                  {v}
                </span>
              )
            )}
          </div>
        </div>
      )}

      {result.resultStatus === 'VIOLATION_WITH_PLATE' && result.platePreviewsBase64?.length > 0 && (
        <div>
          <div className="ticket__label" style={{ marginBottom: 8 }}>
            Number plate {result.platePreviewsBase64.length > 1 ? 'candidates' : 'located'} — read manually
            and confirm before issuing (text recognition isn&apos;t trained yet, and the model can
            occasionally flag the wrong region)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.platePreviewsBase64.map((b64, i) => (
              <img
                key={i}
                src={`data:image/png;base64,${b64}`}
                alt="Detected plate region"
                style={{ height: 56, borderRadius: 6, border: '1px solid var(--border-strong)' }}
              />
            ))}
          </div>
        </div>
      )}

      {result.riderCounts?.some((r) => r.riderCount > 0) && (
        <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--ink-500)' }}>
          Rider count check: {result.riderCounts.map((r) => r.riderCount).join(', ')}{' '}
          {result.riderCounts.some((r) => r.isViolation)
            ? '(3+ triggers Triple Riding)'
            : '(under the 3-rider threshold)'}
        </div>
      )}
    </Modal>
  );
}
