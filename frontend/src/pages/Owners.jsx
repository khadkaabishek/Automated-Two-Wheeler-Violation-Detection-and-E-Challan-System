import { useEffect, useState, useCallback } from 'react';
import { ownerApi } from '../api/owners';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  fullName: '',
  address: '',
  citizenshipNumber: '',
  licenseNumber: '',
  phone: '',
  email: '',
};

export default function Owners() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const [owners, setOwners] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ownerApi.list({ page, limit: 10, search: search || undefined });
      setOwners(res.owners);
      setMeta(res.meta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (owner) => {
    setEditing(owner);
    setForm({
      fullName: owner.fullName,
      address: owner.address,
      citizenshipNumber: owner.citizenshipNumber,
      licenseNumber: owner.licenseNumber,
      phone: owner.phone,
      email: owner.email || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await ownerApi.update(editing.id, form);
        toast.success('Owner updated');
      } else {
        await ownerApi.create(form);
        toast.success('Owner registered');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (owner) => {
    if (!window.confirm(`Delete owner "${owner.fullName}"? This cannot be undone.`)) return;
    try {
      await ownerApi.remove(owner.id);
      toast.success('Owner deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vehicle Owners</div>
          <div className="page-sub">Registered owners linked to vehicles and citations</div>
        </div>
        {hasPermission('owner:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Register owner
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="input search-input"
            placeholder="Search name, phone, ID…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {loading ? (
          <Loader />
        ) : owners.length === 0 ? (
          <EmptyState title="No owners found" desc="Register an owner to link them with vehicles." />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>License No.</th>
                  <th>Citizenship No.</th>
                  <th>Vehicles</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr key={o.id}>
                    <td>{o.fullName}</td>
                    <td className="mono">{o.phone}</td>
                    <td className="mono">{o.licenseNumber}</td>
                    <td className="mono">{o.citizenshipNumber}</td>
                    <td>{o._count?.vehicles ?? 0}</td>
                    <td>
                      <div className="row-actions">
                        {hasPermission('owner:update') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>
                            Edit
                          </button>
                        )}
                        {hasPermission('owner:delete') && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}>
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
        <Modal title={editing ? 'Edit owner' : 'Register owner'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <Field label="Full name">
              <input
                className="input"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <input
                className="input"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <div className="form-grid">
              <Field label="Citizenship number">
                <input
                  className="input"
                  required
                  disabled={!!editing}
                  value={form.citizenshipNumber}
                  onChange={(e) => setForm({ ...form, citizenshipNumber: e.target.value })}
                />
              </Field>
              <Field label="License number">
                <input
                  className="input"
                  required
                  disabled={!!editing}
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                />
              </Field>
              <Field label="Phone">
                <input
                  className="input"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Email (optional)">
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : editing ? 'Save changes' : 'Register owner'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
