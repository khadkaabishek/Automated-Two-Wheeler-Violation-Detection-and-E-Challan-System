import { useState, useEffect, useRef } from 'react';
import { vehicleApi } from '../api/vehicles';

export default function VehiclePicker({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await vehicleApi.list({ search: query, limit: 8 });
        setResults(res.vehicles);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const select = (vehicle) => {
    onChange(vehicle);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      {value ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--asphalt-850)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 11px',
          }}
        >
          <span>
            <span className="ticket__plate" style={{ fontSize: 12, padding: '2px 7px', marginTop: 0 }}>
              {value.vehicleNumber}
            </span>{' '}
            <span style={{ fontSize: 12.5, color: 'var(--ink-500)' }}>
              {value.brand} {value.model} · {value.owner?.fullName}
            </span>
          </span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            className="input"
            placeholder="Search by plate, brand, or reg. number…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
          />
          {open && query.trim() && (
            <div
              className="card"
              style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                zIndex: 30,
                padding: 6,
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {loading && <div style={{ padding: 8, fontSize: 12, color: 'var(--ink-500)' }}>Searching…</div>}
              {!loading && results.length === 0 && (
                <div style={{ padding: 8, fontSize: 12, color: 'var(--ink-500)' }}>No matches</div>
              )}
              {results.map((v) => (
                <div
                  key={v.id}
                  onClick={() => select(v)}
                  style={{
                    padding: '8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--asphalt-800)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{v.vehicleNumber}</strong>{' '}
                  <span style={{ color: 'var(--ink-500)' }}>
                    · {v.brand} {v.model} · {v.owner?.fullName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
