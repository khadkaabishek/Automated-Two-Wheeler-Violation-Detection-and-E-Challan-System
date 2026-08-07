import StatusBadge from './StatusBadge';
import { IconWarning } from './icons';

const STAMP_COLOR = {
  PENDING: 'var(--signal-amber)',
  APPROVED: 'var(--signal-blue)',
  PAID: 'var(--signal-green)',
  CLOSED: 'var(--ink-500)',
  REJECTED: 'var(--signal-red)',
  CANCELLED: 'var(--signal-red)',
};

export default function TicketCard({ challan, children }) {
  if (!challan) return null;
  const stampColor = STAMP_COLOR[challan.status] || 'var(--ink-500)';

  return (
    <div className="ticket">
      <div className="ticket__stamp" style={{ color: stampColor }}>
        {challan.status}
      </div>

      <div className="ticket__serial">{challan.challanNumber}</div>
      <div className="ticket__plate">
        {challan.vehicle?.vehicleNumber}
        {challan.description?.includes('Automated AI Detection') && (
          <span className="chip" style={{ marginLeft: 8, background: 'var(--civic-gold)', color: '#000', fontSize: '0.7rem' }}>
            🤖 AI Draft
          </span>
        )}
      </div>

      <div className="ticket__grid">
        <div>
          <div className="ticket__label">Owner</div>
          <div className="ticket__value">{challan.vehicle?.owner?.fullName || '—'}</div>
        </div>
        <div>
          <div className="ticket__label">Issuing officer</div>
          <div className="ticket__value">{challan.officer?.fullName || '—'}</div>
        </div>
        <div>
          <div className="ticket__label">Incident date</div>
          <div className="ticket__value">
            {challan.incidentDate ? new Date(challan.incidentDate).toLocaleDateString() : '—'} at{' '}
            {challan.incidentTime}
          </div>
        </div>
        <div>
          <div className="ticket__label">Payment status</div>
          <div className="ticket__value">
            <StatusBadge status={challan.paymentStatus} />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="ticket__label">Location</div>
          <div className="ticket__value">{challan.address || '—'}</div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="ticket__label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <IconWarning size={13} color="var(--civic-red)" />
            Violations
          </div>
          <div className="ticket__violations">
            {(challan.challanViolations || []).map((cv) => (
              <span key={cv.id} className="chip chip--violation">
                {cv.violation?.name} · Rs {Number(cv.fineAmount).toLocaleString()}
              </span>
            ))}
          </div>
        </div>
        {challan.description && (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="ticket__label">Notes</div>
            <div className="ticket__value">{challan.description}</div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          borderTop: '1px dashed var(--hairline)',
        }}
      >
        <div>
          <div className="ticket__label">Total fine</div>
          <div className="ticket__amount">Rs {Number(challan.fineAmount).toLocaleString()}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
