import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from '../admin/AdminEmptyState';
import '../admin/AdminShared.css';

const STATUS_LABELS = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
  archived: 'Archivado',
};

export default function SocialPostTable({
  posts,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}) {
  return (
    <Card elevated padding={false}>
      <div className="admin-panel-section__toolbar" style={{ padding: '1rem' }}>
        <h2 className="page-section__title">Publicaciones guardadas</h2>
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
            Actualizar
          </Button>
        )}
      </div>

      {loading ? (
        <Loading label="Cargando publicaciones…" />
      ) : !posts.length ? (
        <AdminEmptyState
          title="Sin publicaciones"
          message="Crea una publicación manual o genera contenido con IA para comenzar."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Plataforma</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Programado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.platform_name ?? post.platform_code}</td>
                  <td>{post.product_name ?? '—'}</td>
                  <td>
                    <span className="admin-badge">{STATUS_LABELS[post.status] ?? post.status}</span>
                  </td>
                  <td>
                    {post.scheduled_at
                      ? new Date(post.scheduled_at).toLocaleString('es-MX')
                      : '—'}
                  </td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => onEdit(post)}>
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(post.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
