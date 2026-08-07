import { useEffect, useState, useCallback } from 'react';
import { violationApi } from '../api/violations';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = { name: '', description: '', fineAmount: '', isActive: true };

export default function Violations() {
  const toast = useToast();
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
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
      const res = await violationApi.list({ page, limit: 10, search: search || undefined });
      setItems(res.violations);
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

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      fineAmount: item.fineAmount,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, fineAmount: Number(form.fineAmount) };
      if (editing) {
        await violationApi.update(editing.id, payload);
        toast.success('Violation updated');
      } else {
        await violationApi.create(payload);
        toast.success('Violation created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete violation "${item.name}"?`)) return;
    try {
      await violationApi.remove(item.id);
      toast.success('Violation deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Violation Types</div>
          <div className="page-sub">Violation categories and their fine amounts</div>
        </div>
        {hasPermission('violation:create') && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add violation
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="input search-input"
            placeholder="Search violations…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState title="No violations found" />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td style={{ color: 'var(--ink-500)' }}>{v.description || '—'}</td>
                    <td className="mono">Rs {Number(v.fineAmount).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${v.isActive ? 'badge-green' : 'badge-grey'}`}>
                        <span className="badge-dot" />
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {hasPermission('violation:update') && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>
                            Edit
                          </button>
                        )}
                        {hasPermission('violation:delete') && (
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
        <Modal title={editing ? 'Edit violation' : 'Add violation'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <Field label="Name">
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                className="textarea"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Fine amount (Rs)">
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.fineAmount}
                onChange={(e) => setForm({ ...form, fineAmount: e.target.value })}
              />
            </Field>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active (available when issuing violation notices)
            </label>
            <div className="modal__footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : editing ? 'Save changes' : 'Add violation'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
