import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { dashboardApi } from '../../api/dashboard';
import { vehicleApi } from '../../api/vehicles';
import { officerApplicationApi } from '../../api/officerApplications';
import { disputeApi } from '../../api/disputes';
import { flaggedDetectionApi } from '../../api/flaggedDetections';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import AIDetectionBanner from '../../components/AIDetectionBanner';
import { IconShield, IconUsers, IconCar, IconCoin, IconTicket, IconGavel, IconWarning } from '../../components/icons';
import { useToast } from '../../context/ToastContext';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SuperAdminDashboard() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState(0);
  const [pendingOfficerApps, setPendingOfficerApps] = useState(0);
  const [pendingDisputes, setPendingDisputes] = useState(0);
  const [pendingNewViolations, setPendingNewViolations] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, d, r, pv, poa, pd, pnv] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.dailyChallans(30),
          dashboardApi.monthlyRevenue(),
          vehicleApi.list({ status: 'PENDING_APPROVAL', limit: 1 }),
          officerApplicationApi.list({ status: 'PENDING', limit: 1 }),
          disputeApi.list({ status: 'PENDING', limit: 1 }),
          flaggedDetectionApi.list({ status: 'PENDING_REVIEW', limit: 1 }),
        ]);
        setSummary(s);
        setDaily(d.map((x) => ({ ...x, date: x.date?.slice(5) })));
        setRevenue(r.months.map((m) => ({ month: MONTH_LABELS[m.month - 1], total: m.total })));
        setPendingVehicles(pv.meta.total);
        setPendingOfficerApps(poa.meta.total);
        setPendingDisputes(pd.meta.total);
        setPendingNewViolations(pnv.meta.total);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  if (loading) return <Loader label="Loading system overview…" />;

  const pendingTotal = pendingVehicles + pendingOfficerApps + pendingDisputes + pendingNewViolations;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconShield size={24} color="var(--civic-blue-700)" />
            System Overview
          </div>
          <div className="page-sub">Full visibility across every citizen, officer, and violation</div>
        </div>
      </div>

      <AIDetectionBanner />

      {pendingTotal > 0 && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: 'var(--civic-red-dim)', background: 'var(--signal-red-bg)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconTicket size={18} color="var(--civic-red)" />
              <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--civic-red)' }}>
                {pendingTotal} item{pendingTotal === 1 ? '' : 's'} waiting on your review
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pendingNewViolations > 0 && (
                <Link to="/new-violations" className="btn btn-warn btn-sm">
                  {pendingNewViolations} new violation{pendingNewViolations === 1 ? '' : 's'} detected
                </Link>
              )}
              {pendingVehicles > 0 && (
                <Link to="/vehicles" className="btn btn-warn btn-sm">
                  {pendingVehicles} vehicle{pendingVehicles === 1 ? '' : 's'} to approve
                </Link>
              )}
              {pendingOfficerApps > 0 && (
                <Link to="/officer-applications" className="btn btn-warn btn-sm">
                  {pendingOfficerApps} officer application{pendingOfficerApps === 1 ? '' : 's'}
                </Link>
              )}
              {pendingDisputes > 0 && (
                <Link to="/disputes" className="btn btn-warn btn-sm">
                  {pendingDisputes} dispute{pendingDisputes === 1 ? '' : 's'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Total Users" value={summary?.totalUsers ?? '—'} color="blue" icon={<IconUsers size={18} />} />
        <StatCard label="Total Vehicles" value={summary?.totalVehicles ?? '—'} color="blue" icon={<IconCar size={18} />} />
        <StatCard label="Total Violations" value={summary?.totalChallans ?? '—'} color="amber" icon={<IconTicket size={18} />} />
        <StatCard label="Pending Violations" value={summary?.pendingChallans ?? '—'} color="red" icon={<IconTicket size={18} />} />
        <StatCard label="Paid Violations" value={summary?.paidChallans ?? '—'} color="green" icon={<IconCoin size={18} />} />
        <StatCard
          label="Total Revenue"
          value={`Rs ${Number(summary?.totalRevenue ?? 0).toLocaleString()}`}
          color="green"
          icon={<IconCoin size={18} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Daily violations</div>
              <div className="card__desc">Trailing 30 days, system-wide</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--ink-300)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--ink-300)" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="count" stroke="var(--civic-red)" strokeWidth={2} dot={false} />
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
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--ink-300)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--ink-300)" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="total" fill="var(--signal-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <Link to="/new-violations" className="card" style={{ textDecoration: 'none' }}>
          <IconWarning size={18} color="var(--civic-red)" />
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, color: 'var(--ink-900)' }}>New Violations</div>
        </Link>
        <Link to="/users" className="card" style={{ textDecoration: 'none' }}>
          <IconUsers size={18} color="var(--civic-blue-700)" />
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, color: 'var(--ink-900)' }}>Manage Users</div>
        </Link>
        <Link to="/roles" className="card" style={{ textDecoration: 'none' }}>
          <IconShield size={18} color="var(--civic-blue-700)" />
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, color: 'var(--ink-900)' }}>Roles & Permissions</div>
        </Link>
        <Link to="/audit-logs" className="card" style={{ textDecoration: 'none' }}>
          <IconGavel size={18} color="var(--civic-blue-700)" />
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, color: 'var(--ink-900)' }}>Audit Log</div>
        </Link>
        <Link to="/reports" className="card" style={{ textDecoration: 'none' }}>
          <IconTicket size={18} color="var(--civic-blue-700)" />
          <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8, color: 'var(--ink-900)' }}>Reports</div>
        </Link>
      </div>
    </div>
  );
}
