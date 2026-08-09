import { useEffect, useState, useCallback } from 'react';
import { userApi } from '../api/users';
import { roleApi } from '../api/roles';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { fullName: '', email: '', phone: '', password: '', roleId: '' };

export default function Users() {
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const handleToggleUserActiveStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, { active: !currentStatus });
      toast.success('User status updated');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };
  const toast = useToast();
  const { hasPermission, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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
      const res = await userApi.list({ page, limit: 10, search: search || undefined });
      setUsers(res.users);
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
    roleApi.list({ limit: 50 }).then((res) => setRoles(res.roles)).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ fullName: u.fullName, email: u.email, phone: u.phone || '', password: '', roleId: u.roleId });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await userApi.update(editing.id, { fullName: form.fullName, phone: form.phone, roleId: form.roleId });
        toast.success('User updated');
      } else {
        await userApi.create(form);
        toast.success('User created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.fullName}"?`)) return;
    try {
      await userApi.remove(u.id);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async (u) => {
    try {
      if (u.status === 'ACTIVE') {
        await userApi.deactivate(u.id);
        toast.success('User deactivated');
      } else {
        await userApi.activate(u.id);
        toast.success('User activated');
      }
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">Staff accounts and their assigned roles</div>
        </div>
        {hasPermission('user:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add user
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="input search-input"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td className="mono">{u.email}</td>
                    <td>{u.role?.name}</td>
                    <td>
                      <StatusBadge status={u.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {hasPermission('user:update') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>
                            Edit
                          </button>
                        )}
                        {hasPermission('user:update') && u.id !== currentUser?.id && (
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(u)}>
                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {hasPermission('user:delete') && u.id !== currentUser?.id && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>
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
        <Modal title={editing ? 'Edit user' : 'Add user'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <Field label="Full name">
              <input
                className="input"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                type="email"
                required
                disabled={!!editing}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            {!editing && (
              <Field label="Temporary password" hint="At least 8 characters">
                <input
                  className="input"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>
            )}
            <Field label="Role">
              <select
                className="select"
                required
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              >
                <option value="">Select role…</option>
                {roles
                  .filter((r) => r.name !== 'User')
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </select>
            </Field>
            <div className="field-hint" style={{ marginTop: -10, marginBottom: 16 }}>
              User accounts aren&apos;t created here — citizens self-register from the login
              page.
            </div>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : editing ? 'Save changes' : 'Create user'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
