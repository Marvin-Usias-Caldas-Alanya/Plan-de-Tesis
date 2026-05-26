import AdminGenericListPanel from './AdminGenericListPanel';
import { getErrorLogs } from '../../services/errorLogService';

export default function AdminErrorsPanel({ onFeedback }) {
  return (
    <AdminGenericListPanel
      title="Errores del sistema"
      emptyTitle="Sin errores registrados"
      emptyMessage="Los fallos de la aplicación se almacenan en error_logs."
      loadRows={getErrorLogs}
      onFeedback={onFeedback}
      columns={[
        { key: 'severity', label: 'Severidad' },
        { key: 'error_code', label: 'Código' },
        { key: 'message', label: 'Mensaje' },
        {
          key: 'created_at',
          label: 'Fecha',
          render: (row) => new Date(row.created_at).toLocaleString(),
        },
      ]}
    />
  );
}
