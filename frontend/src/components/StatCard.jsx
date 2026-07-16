export default function StatCard({ label, value, color = 'amber' }) {
  return (
    <div className="stat-card">
      <div className="stat-card__bar" style={{ background: `var(--signal-${color})` }} />
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}
