import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Vehicles from './pages/Vehicles';
import Violations from './pages/Violations';
import Challans from './pages/Challans';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Roles from './pages/Roles';
import AuditLogs from './pages/AuditLogs';
import MyProfile from './pages/MyProfile';
import OfficerApply from './pages/OfficerApply';
import OfficerApplications from './pages/OfficerApplications';
import Disputes from './pages/Disputes';
import LiveMonitoring from './pages/LiveMonitoring';
import ModelDetections from './pages/ModelDetections';

export default function App() {
  const [globalError, setGlobalError] = useState(null);
  useEffect(() => {
    const handleUnhandledRejection = (e) => {
      setGlobalError(e.reason?.message || 'Unhandled network error occurred');
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="live-monitoring" element={<LiveMonitoring />} />
              <Route path="challans" element={<Challans />} />
              <Route path="payments" element={<Payments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="owners" element={<Owners />} />
              <Route path="violations" element={<Violations />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="my-profile" element={<MyProfile />} />
              <Route path="officer-application" element={<OfficerApply />} />
              <Route path="officer-applications" element={<OfficerApplications />} />
              <Route path="disputes" element={<Disputes />} />
              <Route path="ai-detections" element={<ModelDetections />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
