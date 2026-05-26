import './Loading.css';

export default function Loading({ label = 'Cargando...', size = 'md' }) {
  return (
    <div className={`ui-loading ui-loading--${size}`} role="status" aria-live="polite">
      <div className="ui-loading__spinner" aria-hidden="true" />
      {label && <span className="ui-loading__label">{label}</span>}
    </div>
  );
}
