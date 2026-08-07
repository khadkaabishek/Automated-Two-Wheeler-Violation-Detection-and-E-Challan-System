import { IconCar, IconTicket, IconCoin, IconGavel, IconBadge, IconShield } from './icons';

const FEATURES = [
  { icon: IconCar, text: 'Register your vehicles online and track approval status' },
  { icon: IconTicket, text: 'View every violation issued against your vehicles, in real time' },
  { icon: IconCoin, text: "Submit payment requests and get notified the moment they're confirmed" },
  { icon: IconGavel, text: 'Dispute a violation you believe was issued in error' },
  { icon: IconBadge, text: 'Apply to join as a Traffic Police officer' },
];

export default function PortalInfoPanel() {
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, var(--civic-blue-900), #0a2450)',
        color: '#fff',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div
          className="sidebar__mark"
          style={{ width: 44, height: 44, fontSize: 18, background: '#fff', color: 'var(--civic-blue-900)' }}
        >
          ST
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21 }}>Smart Traffic</div>
          <div style={{ fontSize: 11, letterSpacing: '0.06em', opacity: 0.7 }}>PUBLIC PORTAL</div>
        </div>
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          lineHeight: 1.3,
          margin: '0 0 12px',
        }}
      >
        AI-powered violation detection, vehicle registration, and fine payments — all in one place.
      </h1>
      <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, margin: '0 0 32px', maxWidth: 420 }}>
        A digital platform connecting citizens, traffic officers, and administrators around every
        vehicle violation — from the moment it's issued to the moment it's paid or resolved.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={15} color="#fff" />
            </div>
            <span style={{ fontSize: 13.5, opacity: 0.9, lineHeight: 1.5, paddingTop: 5 }}>{text}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 36,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          opacity: 0.75,
        }}
      >
        <IconShield size={15} color="#fff" />
        Role-based access control — you only ever see your own vehicles and violations.
      </div>
    </div>
  );
}
