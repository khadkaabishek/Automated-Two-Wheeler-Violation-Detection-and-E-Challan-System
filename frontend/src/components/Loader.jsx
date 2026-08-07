export default function Loader({ label = 'Loading…', inline = false }) {
  if (inline) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ink-500)' }}>
        <span className="spinner" /> {label}
      </span>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '48px 0', justifyContent: 'center', color: 'var(--ink-500)' }}>
      <span className="spinner" /> {label}
    </div>
  );
}
