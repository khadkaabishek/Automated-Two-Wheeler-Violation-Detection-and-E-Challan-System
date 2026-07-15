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
};

export default function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || 'grey';
  return (
    <span className={`badge badge-${color}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
