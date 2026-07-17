import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { dashboardApi } from '../../api/dashboard';
import { challanApi } from '../../api/challans';
import { paymentApi } from '../../api/payments';
import { disputeApi } from '../../api/disputes';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';
import AIDetectionBanner from '../../components/AIDetectionBanner';
import { IconBadge, IconTicket, IconCoin, IconGavel } from '../../components/icons';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function TrafficDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const [daily, setDaily] = useState([]);
  const [pendingChallans, setPendingChallans] = useState([]);
  const [pendingChallanCount, setPendingChallanCount] = useState(0);
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  const [pendingDisputeCount, setPendingDisputeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [d, pc, pp, pd] = await Promise.all([
          dashboardApi.dailyChallans(14),
          challanApi.list({ status: 'PENDING', limit: 5 }),
          paymentApi.list({ status: 'PENDING', limit: 1 }),
          disputeApi.list({ status: 'PENDING', limit: 1 }),
        ]);
        setDaily(d.map((x) => ({ ...x, date: x.date?.slice(5) })));
        setPendingChallans(pc.challans);
        setPendingChallanCount(pc.meta.total);
        setPendingPaymentCount(pp.meta.total);
        setPendingDisputeCount(pd.meta.total);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  if (loading) return <Loader label="Loading your duty overview…" />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconBadge size={24} color="var(--civic-blue-700)" />
            Duty Overview
          </div>
          <div className="page-sub">Welcome back, {user?.fullName?.split(' ')[0]} — here's what needs attention</div>
        </div>
        <Link to="/challans" className="btn btn-warn">
          + Issue citation
        </Link>
      </div>

      <AIDetectionBanner />

      <div className="stat-grid">
        <StatCard
          label="Citations Awaiting Approval"
          value={pendingChallanCount}
          color="red"
          icon={<IconTicket size={18} />}
        />
        <StatCard
          label="Payment Requests to Review"
          value={pendingPaymentCount}
          color="amber"
          icon={<IconCoin size={18} />}
        />
        <StatCard label="Open Disputes" value={pendingDisputeCount} color="red" icon={<IconGavel size={18} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card__header">
            <div>
              <div className="card__title">Citations trend</div>
              <div className="card__desc">Trailing 14 days</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
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
            <div className="card__title">Awaiting your approval</div>
            <Link to="/challans" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>
          {pendingChallans.length === 0 ? (
            <div style={{ color: 'var(--ink-500)', fontSize: 13 }}>Nothing pending — nice work.</div>
          ) : (
            pendingChallans.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--border)',
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
