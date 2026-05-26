import AdminGenericListPanel from './AdminGenericListPanel';
import './AdminShared.css';
import { getHandoffRequests } from '../../services/adminService';

export default function AdminHandoffPanel({ onFeedback }) {
  return (
    <AdminGenericListPanel
      title="Handoff humano"
      emptyTitle="Sin solicitudes de handoff"
      emptyMessage="Las escalaciones del chatbot aparecen en handoff_requests."
      loadRows={getHandoffRequests}
      onFeedback={onFeedback}
      columns={[
        { key: 'customer_name', label: 'Cliente' },
        { key: 'reason', label: 'Motivo' },
        {
          key: 'status',
          label: 'Estado',
          render: (row) => <span className="admin-badge">{row.status}</span>,
        },
        {
          key: 'created_at',
          label: 'Fecha',
          render: (row) => new Date(row.created_at).toLocaleString(),
        },
      ]}
    />
  );
}
