import Button from '../common/Button';
import Loading from '../common/Loading';
import ChatMessage from './ChatMessage';
import SellerReplyBox from './SellerReplyBox';
import { CHAT_STATUS, CONVERSATION_STATUS_LABELS } from '../../utils/constants';
import './ConversationDetail.css';

export default function ConversationDetail({
  conversation,
  messages,
  loadingMessages,
  selectedStatus,
  onAttend,
  onClose,
  onSendReply,
  sending,
  attending,
  closing,
}) {
  if (!conversation) {
    return (
      <div className="conversation-detail conversation-detail--empty">
        <p>
          Selecciona una conversación pendiente para ver el detalle y atender al cliente.
        </p>
      </div>
    );
  }

  const status = selectedStatus ?? conversation.status;
  const isPending = status === CHAT_STATUS.PENDING_HANDOFF;
  const isHuman = status === CHAT_STATUS.HUMAN;
  const isClosed = status === CHAT_STATUS.CLOSED;

  return (
    <div className="conversation-detail">
      <header className="conversation-detail__header">
        <div>
          <h2>{conversation.customer_name ?? 'Cliente'}</h2>
          {conversation.customer_email && (
            <a
              className="conversation-detail__email"
              href={`mailto:${conversation.customer_email}`}
            >
              {conversation.customer_email}
            </a>
          )}
          <span className="conversation-detail__status">
            {CONVERSATION_STATUS_LABELS[status] ?? status}
          </span>
          {conversation.handoff_reason && (
            <p className="conversation-detail__reason">
              Motivo: {conversation.handoff_reason}
            </p>
          )}
        </div>
        <div className="conversation-detail__actions">
          {isPending && (
            <Button variant="accent" onClick={onAttend} disabled={attending}>
              {attending ? 'Asignando...' : 'Atender'}
            </Button>
          )}
          {!isClosed && (
            <Button variant="secondary" onClick={onClose} disabled={closing}>
              {closing ? 'Cerrando...' : 'Cerrar conversación'}
            </Button>
          )}
        </div>
      </header>

      <div className="conversation-detail__messages">
        {loadingMessages ? (
          <Loading label="Cargando mensajes..." />
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} showSenderLabel />
          ))
        )}
      </div>

      {isHuman && (
        <SellerReplyBox onSend={onSendReply} loading={sending} disabled={isClosed} />
      )}

      {isPending && (
        <p className="conversation-detail__hint">
          Pulsa &quot;Atender&quot; para tomar la conversación y responder al cliente.
        </p>
      )}
    </div>
  );
}
