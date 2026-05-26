import { useCallback, useMemo, useState } from 'react';
import Card from '../components/common/Card';
import SellerLayout from '../components/dashboard/SellerLayout';
import SellerTabs from '../components/dashboard/SellerTabs';
import OrdersPanel from '../components/dashboard/OrdersPanel';
import ConversationList from '../components/chatbot/ConversationList';
import ConversationDetail from '../components/chatbot/ConversationDetail';
import { useAuth } from '../hooks/useAuth';
import { useSellerConversations } from '../hooks/useSellerConversations';
import { CHAT_STATUS } from '../utils/constants';
import './SellerDashboardPage.css';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('conversations');
  const [feedback, setFeedback] = useState(null);
  const [attending, setAttending] = useState(false);
  const [closing, setClosing] = useState(false);

  const showFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const {
    conversations,
    selectedConversation,
    selectedStatus,
    messages,
    loadingList,
    loadingMessages,
    sending,
    error,
    setError,
    loadConversations,
    selectConversation,
    attendConversation,
    closeSelectedConversation,
    sendReply,
  } = useSellerConversations(user?.id);

  const stats = useMemo(
    () => [
      {
        label: 'Pendientes de handoff',
        value: String(conversations.length),
        hint: 'Conversaciones en cola',
      },
      {
        label: 'Estado',
        value: 'En línea',
        hint: 'Disponible para atención',
      },
    ],
    [conversations.length],
  );

  const handleAttend = async () => {
    setAttending(true);
    setError(null);
    try {
      await attendConversation();
    } finally {
      setAttending(false);
    }
  };

  const handleClose = async () => {
    if (
      !window.confirm(
        '¿Cerrar esta conversación? El cliente ya no podrá continuar por este chat.',
      )
    ) {
      return;
    }
    setClosing(true);
    setError(null);
    try {
      await closeSelectedConversation();
    } finally {
      setClosing(false);
    }
  };

  const canReply = selectedStatus === CHAT_STATUS.HUMAN;

  return (
    <SellerLayout
      title="Panel del vendedor"
      description={
        activeTab === 'conversations'
          ? 'Atiende conversaciones escaladas desde el chatbot.'
          : 'Gestiona pedidos de clientes y cierra ventas.'
      }
      stats={stats}
      feedback={
        feedback ?? (error ? { type: 'error', message: error } : null)
      }
      onClearFeedback={() => {
        setFeedback(null);
        setError(null);
      }}
    >
      <SellerTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'orders' && (
        <OrdersPanel mode="seller" profileId={user?.id} onFeedback={showFeedback} />
      )}

      {activeTab === 'conversations' && (
      <Card elevated padding={false} className="seller-dashboard">
        <div className="seller-dashboard__toolbar">
          <h2 className="page-section__title">Conversaciones pendientes</h2>
          <button
            type="button"
            className="seller-dashboard__refresh"
            onClick={loadConversations}
            disabled={loadingList}
          >
            Actualizar
          </button>
        </div>

        <div className="seller-dashboard__grid">
          <aside className="seller-dashboard__list">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={selectConversation}
              loading={loadingList}
            />
          </aside>

          <section className="seller-dashboard__detail">
            <ConversationDetail
              conversation={selectedConversation}
              messages={messages}
              loadingMessages={loadingMessages}
              selectedStatus={selectedStatus}
              onAttend={handleAttend}
              onClose={handleClose}
              onSendReply={sendReply}
              sending={sending}
              attending={attending}
              closing={closing}
            />
            {canReply && (
              <p className="seller-dashboard__reply-hint">
                Tus respuestas se guardan en Supabase y el cliente las verá en el chat.
              </p>
            )}
          </section>
        </div>
      </Card>
      )}
    </SellerLayout>
  );
}
