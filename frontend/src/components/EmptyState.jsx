export default function EmptyState({ title = 'Nothing here yet', desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__title">{title}</div>
      {desc && <div>{desc}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export default function EmptyState({ message = 'No records found', onResetFilter }) {