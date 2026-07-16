import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
    <div className="center-screen" style={{ background: 'var(--page-bg)' }}>
      <div style={{ width: 380 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
          <div
            className="sidebar__mark"
            style={{ width: 42, height: 42, fontSize: 17, background: 'var(--civic-blue-900)', color: '#fff' }}
          >
            EC
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--ink-900)' }}>
              E-Challan
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-500)', letterSpacing: '0.05em' }}>CITIZEN PORTAL</div>
          </div>
        </div>

        <div className="card">
          <div className="card__title" style={{ marginBottom: 4 }}>
            Sign in
          </div>
          <div className="card__desc" style={{ marginBottom: 20 }}>
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
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-500)' }}>
          New citizen?{' '}
          <Link to="/register" style={{ color: 'var(--civic-blue-700)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-300)' }}>
          Seeded default: superadmin@echallan.gov.np
        </div>
      </div>
    </div>
  );
}
