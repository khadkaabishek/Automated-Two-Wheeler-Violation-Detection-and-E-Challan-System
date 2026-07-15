import { useEffect, useState, useCallback } from 'react';
import { vehicleApi } from '../api/vehicles';
import { ownerApi } from '../api/owners';
import { toISODateTime } from '../utils/date';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = {
  vehicleNumber: '',
  vehicleType: '',
  brand: '',
  model: '',
  color: '',
  registrationNumber: '',
  registrationDate: '',
  insuranceExpiry: '',
  bluebookNumber: '',
  ownerId: '',
};

const STATUS_OPTIONS = ['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'IMPOUNDED', 'BLACKLISTED'];

export default function Vehicles() {
  const toast = useToast();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canSeeOwners = hasPermission('owner:read');
  const [vehicles, setVehicles] = useState([]);
  const [owners, setOwners] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehicleApi.list({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setVehicles(res.vehicles);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = async () => {
    if (!canSeeOwners) {
      // Self-service Vehicle Owner: make sure a linked owner profile exists
      // before letting them register a vehicle (the backend requires it too).
      try {
        const profile = await ownerApi.getMe();
        if (!profile) {
          toast.error('Complete your owner profile first');
          navigate('/my-profile');
          return;
        }
      } catch {
        toast.error('Complete your owner profile first');
        navigate('/my-profile');
        return;
      }
    }

    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);

    if (canSeeOwners) {
      try {
        const res = await ownerApi.list({ limit: 100 });
        setOwners(res.owners);
      } catch {
        /* non-fatal */
      }
    }
  };

  const openEdit = async (vehicle) => {
    setEditing(vehicle);
    setForm({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      registrationNumber: vehicle.registrationNumber,
      registrationDate: vehicle.registrationDate?.slice(0, 10),
      insuranceExpiry: vehicle.insuranceExpiry?.slice(0, 10),
      bluebookNumber: vehicle.bluebookNumber,
      ownerId: vehicle.ownerId,
    });
    setModalOpen(true);
    if (canSeeOwners) {
      try {
        const res = await ownerApi.list({ limit: 100 });
        setOwners(res.owners);
      } catch {
        /* non-fatal */
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        registrationDate: toISODateTime(form.registrationDate),
        insuranceExpiry: toISODateTime(form.insuranceExpiry),
      };
      if (!canSeeOwners) delete payload.ownerId; // server derives it from the caller's own profile
      if (editing) {
        // eslint-disable-next-line no-unused-vars
        const { vehicleNumber, registrationNumber, bluebookNumber, ownerId, ...editable } = payload;
        await vehicleApi.update(editing.id, editable);
        toast.success('Vehicle updated');
      } else {
        await vehicleApi.create(payload);
        toast.success('Vehicle registered');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete vehicle "${v.vehicleNumber}"?`)) return;
    try {
      await vehicleApi.remove(v.id);
      toast.success('Vehicle deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (v, status) => {
    try {
      await vehicleApi.setStatus(v.id, status);
      toast.success(`Status set to ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApprove = async (v) => {
    try {
      await vehicleApi.approve(v.id);
      toast.success('Registration approved');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReject = async (v) => {
    if (!window.confirm(`Reject registration for "${v.vehicleNumber}"?`)) return;
    try {
      await vehicleApi.reject(v.id);
      toast.success('Registration rejected');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vehicles</div>
          <div className="page-sub">
            {canSeeOwners
              ? 'Registry of vehicles eligible for enforcement'
              : 'Vehicles registered under your owner profile'}
          </div>
        </div>
        {hasPermission('vehicle:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            {canSeeOwners ? '+ Register vehicle' : '+ Request vehicle registration'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="input search-input"
            placeholder="Search plate, reg. number, brand…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <Loader />
        ) : vehicles.length === 0 ? (
          <EmptyState title="No vehicles found" desc="Register a vehicle to start issuing challans against it." />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Type / Brand</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className="ticket__plate" style={{ fontSize: 12, padding: '2px 7px' }}>
                        {v.vehicleNumber}
                      </span>
                    </td>
                    <td>
                      {v.vehicleType} · {v.brand} {v.model}
                    </td>
                    <td>{v.owner?.fullName}</td>
                    <td>
                      {v.status === 'PENDING_APPROVAL' ? (
                        <StatusBadge status={v.status} />
                      ) : (
                        <select
                          className="select"
                          style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                          value={v.status}
                          onChange={(e) => handleStatusChange(v, e.target.value)}
                          disabled={!hasPermission('vehicle:update')}
                        >
                          {STATUS_OPTIONS.filter((s) => s !== 'PENDING_APPROVAL').map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        {v.status === 'PENDING_APPROVAL' && hasPermission('vehicle:update') && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => handleApprove(v)}>
                              Approve
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleReject(v)}>
                              Reject
                            </button>
                          </>
                        )}
                        {hasPermission('vehicle:update') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>
                            Edit
                          </button>
                        )}
                        {hasPermission('vehicle:delete') && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination meta={meta} onPageChange={setPage} />
      </div>

      {modalOpen && (
        <Modal
          title={editing ? 'Edit vehicle' : canSeeOwners ? 'Register vehicle' : 'Request vehicle registration'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <form onSubmit={handleSave}>
            {!canSeeOwners && !editing && (
              <div
                style={{
                  background: 'var(--asphalt-850)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: 12.5,
                  color: 'var(--ink-300)',
                  marginBottom: 16,
                }}
              >
                This vehicle will show as <strong>Pending Approval</strong> until an admin reviews and
                approves the registration.
              </div>
            )}
            <div className="form-grid">
              <Field label="Plate / vehicle number">
                <input
                  className="input"
                  required
                  disabled={!!editing}
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                  placeholder="BA 2 PA 1234"
                />
              </Field>
              <Field label="Vehicle type">
                <input
                  className="input"
                  required
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  placeholder="Motorcycle / Car / Bus"
                />
              </Field>
              <Field label="Brand">
                <input
                  className="input"
                  required
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Field>
              <Field label="Model">
                <input
                  className="input"
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </Field>
              <Field label="Color">
                <input
                  className="input"
                  required
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </Field>
              <Field label="Registration number">
                <input
                  className="input"
                  required
                  disabled={!!editing}
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                />
              </Field>
              <Field label="Registration date">
                <input
                  className="input"
                  type="date"
                  required
                  value={form.registrationDate}
                  onChange={(e) => setForm({ ...form, registrationDate: e.target.value })}
                />
              </Field>
              <Field label="Insurance expiry">
                <input
                  className="input"
                  type="date"
                  required
                  value={form.insuranceExpiry}
                  onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
                />
              </Field>
              <Field label="Bluebook number">
                <input
                  className="input"
                  required
                  disabled={!!editing}
                  value={form.bluebookNumber}
                  onChange={(e) => setForm({ ...form, bluebookNumber: e.target.value })}
                />
              </Field>
              {canSeeOwners && (
                <Field label="Owner">
                  <select
                    className="select"
                    required
                    disabled={!!editing}
                    value={form.ownerId}
                    onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                  >
                    <option value="">Select owner…</option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.fullName} · {o.phone}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <span className="spinner" />
                ) : editing ? (
                  'Save changes'
                ) : canSeeOwners ? (
                  'Register vehicle'
                ) : (
                  'Submit request'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
