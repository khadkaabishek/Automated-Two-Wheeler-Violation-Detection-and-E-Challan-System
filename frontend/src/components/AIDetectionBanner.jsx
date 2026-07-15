import { useEffect, useState } from 'react';
import { aiDetectionApi } from '../api/aiDetection';

export default function AIDetectionBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    aiDetectionApi
      .status()
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        borderStyle: 'dashed',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(59, 130, 196, 0.12)',
          border: '1px solid var(--signal-blue-dim)',
          color: 'var(--signal-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        AI
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span className="card__title" style={{ fontSize: 13.5 }}>
            Automatic violation detection
          </span>
          <span className="badge badge-blue">
            <span className="badge-dot" />
            In development
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 6 }}>{status.message}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {status.plannedCapabilities?.map((cap) => (
            <span key={cap} className="chip">
              {cap}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
