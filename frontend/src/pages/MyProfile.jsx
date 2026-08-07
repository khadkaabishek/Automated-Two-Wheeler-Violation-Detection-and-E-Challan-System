import { useEffect, useState } from 'react';
import { ownerApi } from '../api/owners';
import Field from '../components/Field';
import Loader from '../components/Loader';
import { useToast } from '../context/ToastContext';

const EMPTY_FORM = {
  fullName: '',
  address: '',
  citizenshipNumber: '',
  licenseNumber: '',
  phone: '',
  email: '',
};

export default function MyProfile() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await ownerApi.getMe();
        if (res) {
          setProfile(res);
          setForm({
            fullName: res.fullName,
            address: res.address,
            citizenshipNumber: res.citizenshipNumber,
            licenseNumber: res.licenseNumber,
            phone: res.phone,
            email: res.email || '',
          });
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile) {
        const updated = await ownerApi.updateMe({
          fullName: form.fullName,
          address: form.address,
          phone: form.phone,
          email: form.email,
        });
        setProfile(updated);
        toast.success('Profile updated');
      } else {
        const created = await ownerApi.createMe(form);
        setProfile(created);
        toast.success('Owner profile created — you can now request a vehicle registration');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">My Owner Profile</div>
          <div className="page-sub">
            {profile
              ? 'Identity details linked to your vehicles and violations'
              : 'Complete this once to request vehicle registrations and view violations against your vehicles'}
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <Field label="Full name">
              <input
                className="input"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
            <Field label="Citizenship number" full={!profile}>
              <input
                className="input"
                required
                disabled={!!profile}
                value={form.citizenshipNumber}
                onChange={(e) => setForm({ ...form, citizenshipNumber: e.target.value })}
              />
            </Field>
            <Field label="License number">
              <input
                className="input"
                required
                disabled={!!profile}
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
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
          <Field label="Address">
            <input
              className="input"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          {profile && (
            <div className="field-hint" style={{ marginBottom: 16 }}>
              Citizenship and license numbers can&apos;t be changed here — contact an administrator if
              these need correcting.
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : profile ? 'Save changes' : 'Create profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
