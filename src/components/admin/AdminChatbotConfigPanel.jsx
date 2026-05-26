import { useState } from 'react';
import { useChatbotConfig } from '../../hooks/useChatbotConfig';
import ChatbotRulesPanel from '../chatbot-config/ChatbotRulesPanel';
import ChatbotIntentsPanel from '../chatbot-config/ChatbotIntentsPanel';
import ChatbotPreview from '../chatbot-config/ChatbotPreview';
import ChatbotGlobalSettings from '../chatbot-config/ChatbotGlobalSettings';
import '../chatbot-config/ChatbotConfig.css';

const TABS = [
  { id: 'rules', label: 'Reglas' },
  { id: 'intents', label: 'Intenciones' },
  { id: 'global', label: 'Handoff y mensajes' },
  { id: 'preview', label: 'Vista previa' },
];

export default function AdminChatbotConfigPanel({ onFeedback }) {
  const [tab, setTab] = useState('rules');
  const {
    rules,
    intents,
    products,
    handoffKeywords,
    autoMessages,
    loading,
    submitting,
    saveRule,
    removeRule,
    saveIntent,
    removeIntent,
    saveGlobalConfig,
    toggleRuleActive,
    toggleIntentActive,
    setHandoffKeywords,
    setAutoMessages,
  } = useChatbotConfig({ onFeedback });

  return (
    <div className="chatbot-config admin-panel-section">
      <header>
        <h2 className="page-section__title">Configuración del Chatbot</h2>
        <p className="admin-panel__hint">
          Reglas, intenciones detectables, palabras de handoff, mensajes automáticos y recomendaciones
          por objetivo. Los cambios se aplican al motor NutriBot en tiempo real.
        </p>
      </header>

      <nav className="chatbot-config__tabs" aria-label="Secciones chatbot">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chatbot-config__tab ${tab === t.id ? 'chatbot-config__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'rules' && (
        <ChatbotRulesPanel
          rules={rules}
          loading={loading}
          submitting={submitting}
          onSaveRule={saveRule}
          onRemoveRule={removeRule}
          onToggleActive={toggleRuleActive}
        />
      )}

      {tab === 'intents' && (
        <ChatbotIntentsPanel
          intents={intents}
          products={products}
          loading={loading}
          submitting={submitting}
          onSaveIntent={saveIntent}
          onRemoveIntent={removeIntent}
          onToggleActive={toggleIntentActive}
        />
      )}

      {tab === 'global' && (
        <ChatbotGlobalSettings
          handoffKeywords={handoffKeywords}
          autoMessages={autoMessages}
          submitting={submitting}
          onHandoffChange={setHandoffKeywords}
          onAutoChange={setAutoMessages}
          onSave={saveGlobalConfig}
        />
      )}

      {tab === 'preview' && (
        <ChatbotPreview
          products={products}
          handoffKeywords={handoffKeywords}
          autoMessages={autoMessages}
        />
      )}
    </div>
  );
}
