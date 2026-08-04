import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import TrafficDashboard from './dashboards/TrafficDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalChallans: 1240, pendingFines: 45000, resolvedToday: 18 });
  const [loadingStats, setLoadingStats] = useState(false);
  const { hasRole } = useAuth();

  if (hasRole('Super Admin')) return <SuperAdminDashboard />;
  if (hasRole('Traffic Police')) return <TrafficDashboard />;
  if (hasRole('User')) return <OwnerDashboard />;

  const refreshDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/reports/summary');
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summary stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };
  // Fallback for any future/misconfigured role with no matching dashboard.
  return <Navigate to="/reports" replace />;
}
