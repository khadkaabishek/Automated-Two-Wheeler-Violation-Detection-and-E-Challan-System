import { useEffect, useState } from 'react';
import { officerApplicationApi } from '../api/officerApplications';
import Field from '../components/Field';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export default function OfficerApply() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({ message: '', desiredStation: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await officerApplicationApi.list({ limit: 10 });
      setApplications(res.applications);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPending = applications.some((a) => a.status === 'PENDING');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await officerApplicationApi.create(form);
      toast.success('Application submitted — an administrator will review it');
      setForm({ message: '', desiredStation: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Apply to Serve</div>
          <div className="page-sub">Request to join as a Traffic Police officer</div>
        </div>
      </div>

      {!hasPending && (
        <div className="card" style={{ maxWidth: 560, marginBottom: 20 }}>
          <div className="card__title" style={{ marginBottom: 4 }}>
            Submit an application
          </div>
          <div className="card__desc" style={{ marginBottom: 16 }}>
            An administrator will review your request and, if approved, your account will be promoted
            to Traffic Police.
          </div>
          <form onSubmit={handleSubmit}>
            <Field label="Desired station / area (optional)">
              <input
                className="input"
                value={form.desiredStation}
                onChange={(e) => setForm({ ...form, desiredStation: e.target.value })}
                placeholder="e.g. Kathmandu Ring Road Division"
              />
            </Field>
            <Field label="Message to reviewers (optional)">
              <textarea
                className="textarea"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Relevant experience, motivation, etc."
              />
            </Field>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Submit application'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <div className="card__title">My applications</div>
        </div>
        {loading ? (
          <Loader />
        ) : applications.length === 0 ? (
          <EmptyState title="No applications yet" desc="Submit one above to get started." />
        ) : (
          <div className="table-wrap">
            <table className="dtable">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Desired station</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--ink-500)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>{a.desiredStation || '—'}</td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ color: 'var(--ink-500)' }}>{a.rejectionReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
