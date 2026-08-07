export default function StatCard({ label, value, color = 'amber', icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__bar" style={{ background: `var(--signal-${color})` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value">{value}</div>
        </div>
        {icon && (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: `var(--signal-${color}-bg)`,
              color: `var(--signal-${color})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
