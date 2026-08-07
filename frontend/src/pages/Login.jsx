import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PortalInfoPanel from '../components/PortalInfoPanel';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const dest = location.state?.from || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-info-panel">
        <PortalInfoPanel />
      </div>

      <div className="auth-form-panel">
        <div style={{ width: 360 }}>
          <div className="card__title" style={{ fontSize: 20, marginBottom: 4 }}>
            Sign in
          </div>
          <div className="card__desc" style={{ marginBottom: 24 }}>
            Citizens, traffic officers, and administrators all sign in here
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="field-error" style={{ marginBottom: 12 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-500)' }}>
            New citizen?{' '}
            <Link to="/register" style={{ color: 'var(--civic-blue-700)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-300)' }}>
            Seeded default: superadmin@smarttraffic.gov.np
          </div>
        </div>
      </div>
    </div>
  );
}
