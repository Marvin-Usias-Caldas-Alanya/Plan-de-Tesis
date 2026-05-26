import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import './AdminShared.css';

/**
 * Panel genérico de solo lectura para tablas admin.
 */
export default function AdminGenericListPanel({
  title,
  emptyTitle,
  emptyMessage,
  loadRows,
  columns,
  onFeedback,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await loadRows());
    } catch (err) {
      onFeedback?.('error', err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [loadRows, onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label={`Cargando ${title}…`} />;

  return (
    <Card elevated padding={false} className="admin-panel-section">
      <div className="admin-panel-section__toolbar" style={{ padding: '1rem' }}>
        <h2 className="page-section__title">{title}</h2>
        <Button variant="secondary" size="sm" onClick={load}>
          Actualizar
        </Button>
      </div>
      {!rows.length ? (
        <AdminEmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id ?? row.code ?? JSON.stringify(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
