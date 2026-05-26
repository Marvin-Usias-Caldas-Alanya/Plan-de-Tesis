import AdminChatbotConfigPanel from './AdminChatbotConfigPanel';

/** Panel admin: configuración del chatbot (reglas, intenciones, preview). */
export default function AdminChatbotPanel({ onFeedback }) {
  return <AdminChatbotConfigPanel onFeedback={onFeedback} />;
}
