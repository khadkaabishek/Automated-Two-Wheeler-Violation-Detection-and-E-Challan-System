import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = {
  '/': 'Dashboard',
  '/challans': 'Violations',
  '/new-violations': 'New Violations',
  '/payments': 'Payments',
  '/reports': 'Reports',
  '/vehicles': 'Vehicles',
  '/owners': 'Vehicle Owners',
  '/violations': 'Violation Types',
  '/users': 'Users',
  '/roles': 'Roles & Permissions',
  '/audit-logs': 'Audit Log',
  '/my-profile': 'My Owner Profile',
  '/officer-application': 'Apply to Serve',
  '/officer-applications': 'Officer Applications',
  '/disputes': 'Violation Disputes',
};

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return TITLES[base] || 'Smart Traffic';
}

export default function Layout() {
  const location = useLocation();
  return (
    <div className="shell">
      <Sidebar />
      <div>
        <Topbar title={resolveTitle(location.pathname)} />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
