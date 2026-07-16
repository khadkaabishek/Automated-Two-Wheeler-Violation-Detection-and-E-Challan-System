import { useEffect, useState, useCallback } from 'react';
import { roleApi } from '../api/roles';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Roles() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roleRes, permRes] = await Promise.all([roleApi.list({ limit: 50 }), roleApi.listPermissions()]);
      setRoles(roleRes.roles);
      setPermissions(permRes);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groupedPermissions = permissions.reduce((acc, p) => {
    (acc[p.module] ||= []).push(p);
    return acc;
  }, {});

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setSelectedPermIds([]);
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPermIds((role.rolePermissions || []).map((rp) => rp.permission.id));
    setModalOpen(true);
  };

  const togglePerm = (id) => {
    setSelectedPermIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const toggleModule = (modulePerms) => {
    const ids = modulePerms.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermIds.includes(id));
    setSelectedPermIds((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await roleApi.update(editing.id, { name, description });
        await roleApi.assignPermissions(editing.id, selectedPermIds);
        toast.success('Role updated');
      } else {
        await roleApi.create({ name, description, permissionIds: selectedPermIds });
        toast.success('Role created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (role.isSystem) return toast.error('System roles cannot be deleted');
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await roleApi.remove(role.id);
      toast.success('Role deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Roles & Permissions</div>
          <div className="page-sub">Access control is enforced server-side from these assignments</div>
        </div>
        {hasPermission('role:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Create role
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : roles.length === 0 ? (
        <EmptyState title="No roles found" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {roles.map((r) => (
            <div className="card" key={r.id}>
              <div className="card__header">
                <div>
                  <div className="card__title">{r.name}</div>
                  <div className="card__desc">{r.description}</div>
                </div>
                {r.isSystem && <span className="badge badge-blue"><span className="badge-dot" />System</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 14 }}>
                {r.rolePermissions?.length || 0} permissions · {r._count?.users ?? 0} users
              </div>
              <div className="row-actions">
                {hasPermission('role:update') && (
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>
                    Edit permissions
                  </button>
                )}
                {hasPermission('role:delete') && !r.isSystem && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? `Edit role · ${editing.name}` : 'Create role'} onClose={() => setModalOpen(false)} wide>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <Field label="Role name">
                <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Description">
                <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>

            <Field label="Permissions" full>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
                {Object.entries(groupedPermissions).map(([mod, perms]) => (
                  <div key={mod} className="card" style={{ padding: 12 }}>
                    <label className="checkbox-row" style={{ fontWeight: 600, marginBottom: 8, color: 'var(--ink-100)' }}>
                      <input
                        type="checkbox"
                        checked={perms.every((p) => selectedPermIds.includes(p.id))}
                        onChange={() => toggleModule(perms)}
                      />
                      {mod}
                    </label>
                    <div className="checkbox-grid" style={{ maxHeight: 'none', border: 'none', background: 'none', padding: 0 }}>
                      {perms.map((p) => (
                        <label key={p.id} className="checkbox-row">
                          <input
                            type="checkbox"
                            checked={selectedPermIds.includes(p.id)}
                            onChange={() => togglePerm(p.id)}
                          />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : editing ? 'Save changes' : 'Create role'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
