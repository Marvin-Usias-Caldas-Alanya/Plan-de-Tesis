import './AdminShared.css';

export default function AdminEmptyState({
  title = 'Sin registros',
  message = 'No hay datos para mostrar en esta sección. Los registros aparecerán aquí cuando se creen en el sistema.',
}) {
  return (
    <div className="admin-empty" role="status">
      <p className="admin-empty__title">{title}</p>
      <p className="admin-empty__message">{message}</p>
    </div>
  );
}
