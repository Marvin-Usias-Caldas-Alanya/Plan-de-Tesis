import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { getAuditLogs } from '../../services/auditService';
import './AdminShared.css';

export default function AdminAuditPanel({ onFeedback }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await getAuditLogs());
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label="Cargando auditoría…" />;

  return (
    <Card elevated padding={false} className="admin-panel-section">
      <div className="admin-panel-section__toolbar" style={{ padding: '1rem' }}>
        <h2 className="page-section__title">Auditoría</h2>
        <Button variant="secondary" size="sm" onClick={load}>
          Actualizar
        </Button>
      </div>
      {!logs.length ? (
        <AdminEmptyState
          title="Sin registros de auditoría"
          message="Los eventos del sistema se guardan en audit_logs."
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Tabla</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>{log.table_name ?? '—'}</td>
                  <td>{log.profile_name}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
