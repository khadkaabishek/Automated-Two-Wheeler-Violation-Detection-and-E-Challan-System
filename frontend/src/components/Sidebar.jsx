import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  {
    section: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: '◆', end: true }],
  },
  {
    section: 'Operations',
    items: [
      { to: '/live-monitoring', label: 'Live Monitoring', icon: '⌕', permission: 'live_monitoring:read' },
      { to: '/ai-detections', label: 'AI Detections', icon: '🤖', permission: 'live_monitoring:read' },
      { to: '/challans', label: 'Challans', icon: '▤', permission: 'challan:read' },
      { to: '/disputes', label: 'Disputes', icon: '⚖', permission: 'challan:update' },
      { to: '/payments', label: 'Payments', icon: '¤', permission: 'payment:read' },
      { to: '/reports', label: 'Reports', icon: '⬇', permission: 'report:read' },
    ],
  },
  {
    section: 'Registry',
    items: [
      { to: '/vehicles', label: 'Vehicles', icon: '⛋', permission: 'vehicle:read' },
      { to: '/owners', label: 'Owners', icon: '☺', permission: 'owner:read' },
      { to: '/violations', label: 'Violations', icon: '!', permission: 'violation:read' },
    ],
  },
  {
    section: 'My Account',
    items: [
      { to: '/my-profile', label: 'My Owner Profile', icon: '⚙', roles: ['User'] },
      { to: '/officer-application', label: 'Apply to Serve', icon: '★', roles: ['User'] },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/officer-applications', label: 'Officer Applications', icon: '★', roles: ['Super Admin'] },
      { to: '/users', label: 'Users', icon: '⚉', permission: 'user:read' },
      { to: '/roles', label: 'Roles', icon: '⚿', permission: 'role:read' },
      { to: '/audit-logs', label: 'Audit Log', icon: '≡', roles: ['Super Admin'] },
    ],
  },
];

export default function Sidebar() {
  const { hasPermission, hasRole } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__mark">EC</div>
        <div>
          <div className="sidebar__title">Smart Traffic</div>
          <div className="sidebar__subtitle">CITIZEN PORTAL</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.permission && !hasPermission(item.permission)) return false;
            if (item.roles && !hasRole(...item.roles)) return false;
            return true;
          });
          if (!visibleItems.length) return null;

          return (
            <div key={group.section}>
              <div className="sidebar__section-label">{group.section}</div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
                >
                  <span className="navlink__icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
