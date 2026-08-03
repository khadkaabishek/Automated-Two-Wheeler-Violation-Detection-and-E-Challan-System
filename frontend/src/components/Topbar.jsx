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
      <form onSubmit={handleQuickPlateSearch} style={{ margin: '0 16px', display: 'flex', gap: 6 }}>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Search Vehicle Plate (e.g. BA 2 PA 1234)..."
          value={searchPlate}
          onChange={(e) => setSearchPlate(e.target.value)}
          style={{ width: 260 }}
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>
      <div className="topbar__user" style={{ position: 'relative' }}>
        <span className="badge bg-info-subtle text-info border border-info-subtle me-2">{user?.role?.name || 'Officer'}</span>
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
