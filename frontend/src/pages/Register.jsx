import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  address: '',
  citizenshipNumber: '',
  licenseNumber: '',
};

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — welcome to the citizen portal');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-screen" style={{ background: 'var(--page-bg)', padding: '32px 0' }}>
      <div style={{ width: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
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
            Create your citizen account
          </div>
          <div className="card__desc" style={{ marginBottom: 20 }}>
            One form covers everything — your account and your owner profile — so you can request a
            vehicle registration right away.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field form-grid--full">
                <label>Full name</label>
                <input
                  className="input"
                  required
                  autoFocus
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  className="input"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>
              <div className="field form-grid--full">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span className="field-hint">At least 8 characters, with an uppercase letter and a number.</span>
              </div>
              <div className="field form-grid--full">
                <label>Address</label>
                <input
                  className="input"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Citizenship number</label>
                <input
                  className="input"
                  required
                  value={form.citizenshipNumber}
                  onChange={(e) => setForm({ ...form, citizenshipNumber: e.target.value })}
                />
              </div>
              <div className="field">
                <label>License number</label>
                <input
                  className="input"
                  required
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                />
              </div>
            </div>
            {error && (
              <div className="field-error" style={{ marginBottom: 12 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-500)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--civic-blue-700)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
