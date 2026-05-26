import { useCallback, useEffect, useState } from 'react';
import {
  createChatbotIntent,
  createChatbotRule,
  deleteChatbotIntent,
  deleteChatbotRule,
  getChatbotGlobalConfig,
  getChatbotIntents,
  getChatbotRules,
  saveAutoMessages,
  saveHandoffKeywords,
  updateChatbotIntent,
  updateChatbotRule,
} from '../services/chatbotConfigService';
import { getActiveProducts } from '../services/productService';

export function useChatbotConfig({ onFeedback } = {}) {
  const [rules, setRules] = useState([]);
  const [intents, setIntents] = useState([]);
  const [products, setProducts] = useState([]);
  const [handoffKeywords, setHandoffKeywords] = useState('');
  const [autoMessages, setAutoMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesData, intentsData, global, catalog] = await Promise.all([
        getChatbotRules(),
        getChatbotIntents(),
        getChatbotGlobalConfig(),
        getActiveProducts().catch(() => []),
      ]);
      setRules(rulesData);
      setIntents(intentsData);
      setHandoffKeywords(
        typeof global.handoffKeywords === 'string'
          ? global.handoffKeywords
          : String(global.handoffKeywords ?? ''),
      );
      setAutoMessages(global.autoMessages ?? {});
      setProducts(catalog);
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
      if (!window.confirm('¿Eliminar esta regla?')) return false;
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

  const saveIntent = useCallback(
    async (payload, editingId = null) => {
      setSubmitting(true);
      try {
        if (editingId) {
          await updateChatbotIntent(editingId, payload);
          onFeedback?.('success', 'Intención actualizada');
        } else {
          await createChatbotIntent(payload);
          onFeedback?.('success', 'Intención creada');
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

  const removeIntent = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta intención?')) return false;
      setSubmitting(true);
      try {
        await deleteChatbotIntent(id);
        onFeedback?.('success', 'Intención eliminada');
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

  const saveGlobalConfig = useCallback(
    async ({ handoffKeywords: kw, autoMessages: msgs }) => {
      setSubmitting(true);
      try {
        if (kw !== undefined) await saveHandoffKeywords(kw);
        if (msgs !== undefined) await saveAutoMessages(msgs);
        onFeedback?.('success', 'Configuración guardada');
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

  const toggleRuleActive = useCallback(
    async (rule) => {
      return saveRule({ ...rule, is_active: !rule.is_active }, rule.id);
    },
    [saveRule],
  );

  const toggleIntentActive = useCallback(
    async (intent) => {
      return saveIntent({ ...intent, is_active: !intent.is_active }, intent.id);
    },
    [saveIntent],
  );

  return {
    rules,
    intents,
    products,
    handoffKeywords,
    autoMessages,
    loading,
    submitting,
    refresh,
    saveRule,
    removeRule,
    saveIntent,
    removeIntent,
    saveGlobalConfig,
    toggleRuleActive,
    toggleIntentActive,
    setHandoffKeywords,
    setAutoMessages,
  };
}
