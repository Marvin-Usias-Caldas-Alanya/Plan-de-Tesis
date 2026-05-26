import { useCallback, useEffect, useState } from 'react';
import {
  createChatbotRule,
  deleteChatbotRule,
  getChatbotRules,
  updateChatbotRule,
} from '../services/chatbotConfigService';

export function useChatbotRules({ onFeedback } = {}) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatbotRules();
      setRules(data);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveRule = useCallback(
    async (payload, editingId = null) => {
      setSubmitting(true);
      try {
        if (editingId) {
          await updateChatbotRule(editingId, payload);
          onFeedback?.('success', 'Regla actualizada');
        } else {
          await createChatbotRule(payload);
          onFeedback?.('success', 'Regla creada');
        }
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh],
  );

  const removeRule = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta regla del chatbot?')) return false;
      setSubmitting(true);
      try {
        await deleteChatbotRule(id);
        onFeedback?.('success', 'Regla eliminada');
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh],
  );

  return { rules, loading, submitting, refresh, saveRule, removeRule };
}
