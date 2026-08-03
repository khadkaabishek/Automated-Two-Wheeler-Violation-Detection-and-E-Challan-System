import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchPlate, setSearchPlate] = useState('');

  const handleQuickPlateSearch = (e) => {
    e.preventDefault();
    if (searchPlate.trim()) {
      navigate(`/vehicles?search=${encodeURIComponent(searchPlate.trim())}`);
      setSearchPlate('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar__crumb">{title}</div>
      <div className="topbar__user" style={{ position: 'relative' }}>
        <span className="topbar__role">{user?.role?.name}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setOpen((o) => !o)}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {user?.fullName}
          <span style={{ opacity: 0.6 }}>▾</span>
        </button>
        {open && (
          <div
            className="card"
            style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              width: 200,
              padding: 8,
              zIndex: 20,
            }}
            onMouseLeave={() => setOpen(false)}
          >
            <div style={{ padding: '6px 8px', fontSize: 12, color: 'var(--ink-500)' }}>{user?.email}</div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start', marginTop: 4 }}
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
