export default function Field({ label, error, hint, children, full }) {
  return (
    <div className={`field ${full ? 'form-grid--full' : ''}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
