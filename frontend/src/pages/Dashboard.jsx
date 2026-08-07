import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import TrafficDashboard from './dashboards/TrafficDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';

export default function Dashboard() {
  const { hasRole } = useAuth();

  if (hasRole('Super Admin')) return <SuperAdminDashboard />;
  if (hasRole('Traffic Police')) return <TrafficDashboard />;
  if (hasRole('User')) return <OwnerDashboard />;
  // Fallback for any future/misconfigured role with no matching dashboard.
  return <Navigate to="/reports" replace />;
}
