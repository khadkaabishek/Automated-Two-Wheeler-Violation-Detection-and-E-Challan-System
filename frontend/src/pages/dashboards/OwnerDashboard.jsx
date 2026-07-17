import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleApi } from '../../api/vehicles';
import { challanApi } from '../../api/challans';
import { ownerApi } from '../../api/owners';
import { disputeApi } from '../../api/disputes';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import AIDetectionBanner from '../../components/AIDetectionBanner';
import { IconCar, IconTicket, IconWarning, IconGavel } from '../../components/icons';
import { useToast } from '../../context/ToastContext';

export default function OwnerDashboard() {
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [challans, setChallans] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const prof = await ownerApi.getMe();
        setProfile(prof);
        if (prof) {
          const [v, c, d] = await Promise.all([
            vehicleApi.list({ limit: 20 }),
            challanApi.list({ limit: 10 }),
            disputeApi.list({ limit: 5 }),
          ]);
          setVehicles(v.vehicles);
          setChallans(c.challans);
          setDisputes(d.disputes);
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
            <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconCar size={24} color="var(--civic-blue-700)" />
              Welcome
            </div>
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
  const pendingDisputes = disputes.filter((d) => d.status === 'PENDING').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCar size={24} color="var(--civic-blue-700)" />
            My Dashboard
          </div>
          <div className="page-sub">Vehicles registered to you and citations issued against them</div>
        </div>
      </div>

      <AIDetectionBanner />

      {outstanding > 0 && (
        <div
          className="card"
          style={{ marginBottom: 20, borderColor: 'var(--civic-red-dim)', background: 'var(--signal-red-bg)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconWarning size={18} color="var(--civic-red)" />
            <span style={{ fontSize: 13.5, color: 'var(--civic-red)', fontWeight: 600 }}>
              You have {outstanding} citation{outstanding === 1 ? '' : 's'} awaiting payment
            </span>
            <Link to="/payments" className="btn btn-warn btn-sm" style={{ marginLeft: 'auto' }}>
              Pay now
            </Link>
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="My Vehicles" value={vehicles.length} color="blue" icon={<IconCar size={18} />} />
        <StatCard label="Total Citations" value={challans.length} color="amber" icon={<IconTicket size={18} />} />
        <StatCard label="Awaiting Payment" value={outstanding} color="red" icon={<IconWarning size={18} />} />
        <StatCard label="Open Disputes" value={pendingDisputes} color="red" icon={<IconGavel size={18} />} />
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
                  borderBottom: '1px solid var(--border)',
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
