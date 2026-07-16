import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { dashboardApi } from '../api/dashboard';
import { vehicleApi } from '../api/vehicles';
import { challanApi } from '../api/challans';
import { ownerApi } from '../api/owners';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import AIDetectionBanner from '../components/AIDetectionBanner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { hasPermission, hasRole } = useAuth();

  if (hasPermission('dashboard:read')) return <AdminDashboard />;
  if (hasRole('User')) return <OwnerDashboard />;
  // Viewer (report:read only) and anyone else without dashboard access lands on Reports.
  return <Navigate to="/reports" replace />;
}

// ============================================================
// Admin / Traffic Police view — fleet-wide analytics
// ============================================================
function AdminDashboard() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [topViolations, setTopViolations] = useState([]);
  const [byOfficer, setByOfficer] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, d, r, tv, bo] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.dailyChallans(30),
          dashboardApi.monthlyRevenue(),
          dashboardApi.topViolations(),
          dashboardApi.challansByOfficer(),
        ]);
        setSummary(s);
        setDaily(d.map((x) => ({ ...x, date: x.date?.slice(5) })));
        setRevenue(r.months.map((m) => ({ month: MONTH_LABELS[m.month - 1], total: m.total })));
        setTopViolations(tv);
        setByOfficer(bo);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  if (loading) return <Loader label="Loading dashboard…" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Fleet-wide enforcement activity at a glance</div>
        </div>
      </div>

      <AIDetectionBanner />

      <div className="stat-grid">
        <StatCard label="Total Challans" value={summary?.totalChallans ?? '—'} color="amber" />
        <StatCard label="Pending" value={summary?.pendingChallans ?? '—'} color="blue" />
        <StatCard label="Paid" value={summary?.paidChallans ?? '—'} color="green" />
        <StatCard
          label="Total Revenue"
          value={`Rs ${Number(summary?.totalRevenue ?? 0).toLocaleString()}`}
          color="amber"
        />
        <StatCard label="Total Vehicles" value={summary?.totalVehicles ?? '—'} color="blue" />
        <StatCard label="Total Users" value={summary?.totalUsers ?? '—'} color="grey" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Daily challans</div>
              <div className="card__desc">Trailing 30 days</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <CartesianGrid stroke="var(--hairline-soft)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--ink-700)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--ink-700)" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  background: 'var(--asphalt-800)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="count" stroke="var(--signal-amber)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Monthly revenue</div>
              <div className="card__desc">{new Date().getFullYear()}</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue}>
              <CartesianGrid stroke="var(--hairline-soft)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ink-700)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--ink-700)" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                contentStyle={{
                  background: 'var(--asphalt-800)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="total" fill="var(--signal-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card__header">
            <div className="card__title">Top violations</div>
          </div>
          {topViolations.length === 0 ? (
            <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>No data yet.</div>
          ) : (
            topViolations.map((tv, i) => (
              <div
                key={tv.violation?.id || i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--hairline-soft)',
                  fontSize: 13,
                }}
              >
                <span>{tv.violation?.name || 'Unknown'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--signal-amber)' }}>{tv.count}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card__header">
            <div className="card__title">Challans by officer</div>
          </div>
          {byOfficer.length === 0 ? (
            <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>No data yet.</div>
          ) : (
            byOfficer.map((bo, i) => (
              <div
                key={bo.officer?.id || i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--hairline-soft)',
                  fontSize: 13,
                }}
              >
                <span>{bo.officer?.fullName || 'Unknown'}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--signal-blue)' }}>
                  {bo.challanCount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Vehicle Owner view — only their own vehicles and citations
// ============================================================
function OwnerDashboard() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const prof = await ownerApi.getMe();
        setProfile(prof);
        if (prof) {
          const [v, c] = await Promise.all([
            vehicleApi.list({ limit: 20 }),
            challanApi.list({ limit: 10 }),
          ]);
          setVehicles(v.vehicles);
          setChallans(c.challans);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  if (loading) return <Loader label="Loading your account…" />;

  if (!profile) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">Welcome</div>
            <div className="page-sub">Set up your owner profile to register a vehicle and track citations</div>
          </div>
        </div>
        <AIDetectionBanner />
        <div className="card">
          <EmptyState
            title="No owner profile yet"
            desc="Complete your profile with your citizenship and license details, then you can request a vehicle registration."
            action={
              <Link to="/my-profile" className="btn btn-primary">
                Complete my profile
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const outstanding = challans.filter((c) => c.status === 'APPROVED').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Dashboard</div>
          <div className="page-sub">Vehicles registered to you and citations issued against them</div>
        </div>
      </div>

      <AIDetectionBanner />

      <div className="stat-grid">
        <StatCard label="My Vehicles" value={vehicles.length} color="blue" />
        <StatCard label="Total Citations" value={challans.length} color="amber" />
        <StatCard label="Awaiting Payment" value={outstanding} color="red" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card__header">
            <div className="card__title">My vehicles</div>
            <Link to="/vehicles" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <EmptyState
              title="No vehicles yet"
              desc="Request a vehicle registration to get started."
              action={
                <Link to="/vehicles" className="btn btn-primary btn-sm">
                  Request registration
                </Link>
              }
            />
          ) : (
            vehicles.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--hairline-soft)',
                }}
              >
                <span className="ticket__plate" style={{ fontSize: 12, padding: '2px 7px', marginTop: 0 }}>
                  {v.vehicleNumber}
                </span>
                <StatusBadge status={v.status} />
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card__header">
            <div className="card__title">Recent citations</div>
            <Link to="/challans" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          {challans.length === 0 ? (
            <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>No citations on record. Good driving.</div>
          ) : (
            challans.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--hairline-soft)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{c.challanNumber}</span>
                <StatusBadge status={c.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
