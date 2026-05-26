import Button from '../common/Button';
import './AdminHeader.css';

export default function AdminHeader({ title, description, toolbar }) {
  return (
    <header className="admin-header">
      <div className="admin-header__text">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {toolbar && <div className="admin-header__toolbar">{toolbar}</div>}
    </header>
  );
}

export function AdminHeaderRefresh({ onRefresh, loading, label = 'Actualizar' }) {
  return (
    <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
      {label}
    </Button>
  );
}
