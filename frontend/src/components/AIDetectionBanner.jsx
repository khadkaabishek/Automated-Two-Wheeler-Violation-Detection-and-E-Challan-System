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

  const live = status.enabled;

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
          background: live ? 'var(--signal-green-bg)' : 'var(--signal-blue-bg)',
          border: `1px solid ${live ? '#c3e6d3' : '#c9d9f0'}`,
          color: live ? 'var(--signal-green)' : 'var(--signal-blue)',
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
          <span className={`badge ${live ? 'badge-green' : 'badge-blue'}`}>
            <span className="badge-dot" />
            {live ? 'Live' : 'Unavailable'}
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
