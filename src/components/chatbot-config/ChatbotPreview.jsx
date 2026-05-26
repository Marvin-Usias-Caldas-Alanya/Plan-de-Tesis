import { useMemo, useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { generateBotResponse } from '../../services/chatbotEngine';
import { getActiveRules, getActiveIntents } from '../../services/chatbotConfigService';
import { FALLBACK_CHATBOT_INTENTS, FALLBACK_CHATBOT_RULES } from '../../utils/chatbotFallback';

export default function ChatbotPreview({
  products,
  handoffKeywords,
  autoMessages,
  useLiveConfig = true,
}) {
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const catalog = useMemo(
    () => (products ?? []).filter((p) => p.is_active !== false),
    [products],
  );

  const runPreview = async () => {
    const text = message.trim();
    if (!text) return;

    setLoading(true);
    try {
      let rules = FALLBACK_CHATBOT_RULES;
      let intents = FALLBACK_CHATBOT_INTENTS;

      if (useLiveConfig) {
        try {
          rules = await getActiveRules();
          intents = await getActiveIntents();
        } catch {
          /* fallback ya asignado */
        }
      }

      const reply = generateBotResponse(text, catalog, {
        rules,
        intents,
        handoffKeywords,
        autoMessages,
      });

      setPreview(reply);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card elevated>
      <h3 className="page-section__title">Vista previa del bot</h3>
      <p className="admin-panel__hint">
        Escribe un mensaje de prueba para ver cómo respondería NutriBot con la configuración actual.
      </p>
      <div className="chatbot-config__form">
        <label>
          Mensaje de prueba
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej: quiero ganar masa muscular"
            onKeyDown={(e) => e.key === 'Enter' && runPreview()}
          />
        </label>
        <Button type="button" onClick={runPreview} disabled={loading || !message.trim()}>
          {loading ? 'Procesando…' : 'Probar respuesta'}
        </Button>
      </div>
      {preview && (
        <div className="chatbot-config__preview" role="status">
          {preview.content}
          <div className="chatbot-config__preview-meta">
            Intención: <strong>{preview.intent}</strong>
            {preview.shouldHandoff ? ' · Handoff: sí' : ''}
            {preview.recommendedProducts?.length
              ? ` · Productos: ${preview.recommendedProducts.length}`
              : ''}
            {preview.fromDatabase ? ' · Regla BD' : ''}
            {preview.fromIntentConfig ? ' · Intención BD' : ''}
          </div>
        </div>
      )}
    </Card>
  );
}
