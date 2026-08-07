const STATUS_COLOR = {
  // Challan status
  PENDING: 'amber',
  APPROVED: 'blue',
  PAID: 'green',
  CLOSED: 'grey',
  REJECTED: 'red',
  CANCELLED: 'red',
  // Vehicle registration status
  PENDING_APPROVAL: 'amber',
  ACTIVE: 'green',
  INACTIVE: 'grey',
  SUSPENDED: 'red',
  IMPOUNDED: 'amber',
  BLACKLISTED: 'red',
  // Payment status
  SUCCESS: 'green',
  FAILED: 'red',
  REFUNDED: 'blue',
  // Dispute status
  UPHELD: 'red',
  DISMISSED: 'grey',
  // Flagged detection status
  PENDING_REVIEW: 'amber',
  CONVERTED: 'green',
};

export default function StatusBadge({ status, customLabel }) {
  const getBadgeVariant = (st) => {
    switch ((st || '').toUpperCase()) {
      case 'PAID': case 'APPROVED': return 'badge-success';
      case 'PENDING': case 'REVIEW': return 'badge-warning';
      case 'OVERDUE': case 'REJECTED': case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };
  const color = STATUS_COLOR[status] || 'grey';
  return (
    <span className={`badge badge-${color}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
