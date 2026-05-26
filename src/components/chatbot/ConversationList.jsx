import Loading from '../common/Loading';
import { CONVERSATION_STATUS_LABELS, CHAT_STATUS } from '../../utils/constants';
import './ConversationList.css';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  loading,
}) {
  if (loading) {
    return (
      <div className="conversation-list conversation-list--loading">
        <Loading label="Cargando conversaciones..." />
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div className="conversation-list conversation-list--empty">
        <p>No hay conversaciones pendientes de handoff.</p>
      </div>
    );
  }

  return (
    <ul className="conversation-list">
      {conversations.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`conversation-list__item ${isSelected ? 'conversation-list__item--active' : ''}`}
              onClick={() => onSelect(item)}
            >
              <div className="conversation-list__head">
                <strong>{item.customer_name ?? 'Cliente sin nombre'}</strong>
                <span className="conversation-list__status">
                  {CONVERSATION_STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
              {item.customer_email && (
                <span className="conversation-list__email">{item.customer_email}</span>
              )}
              <p className="conversation-list__preview">
                {item.last_message
                  ? `${item.last_sender_type === 'customer' ? 'Cliente' : 'Sistema'}: ${item.last_message}`
                  : 'Sin mensajes'}
              </p>
              <span className="conversation-list__meta">
                {formatDate(item.last_message_at ?? item.updated_at)}
              </span>
              {item.status === CHAT_STATUS.PENDING_HANDOFF && (
                <span className="conversation-list__badge">Pendiente</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
