import { useCallback, useEffect, useState } from 'react';
import { getActiveProducts } from '../services/productService';
import {
  createConversation,
  fetchConversationMessages,
  generateBotResponse,
  triggerHumanHandoff,
  updateConversationCustomer,
  saveMessage,
  loadActiveBotRules,
  recordBotIntent,
} from '../services/chatbotService';
import { isChatbotEnabled } from '../services/settingsService';
function toUiMessage(row, extra = {}) {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    ...extra,
  };
}

export function useChatbot({ profile, user, enabled = true }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [products, setProducts] = useState([]);
  const [engineConfig, setEngineConfig] = useState({
    rules: [],
    intents: [],
    handoffKeywords: null,
    autoMessages: {},
  });
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [handoffRequested, setHandoffRequested] = useState(false);
  const [error, setError] = useState(null);

  const loadCatalog = useCallback(async () => {
    try {
      const data = await getActiveProducts();
      setProducts(data);
      return data;
    } catch {
      setProducts([]);
      return [];
    }
  }, []);

  const initConversation = useCallback(async () => {
    if (conversationId) return conversationId;

    const catalog = await loadCatalog();

    const conversation = await createConversation({
      profileId: user?.id,
      customerName: profile?.full_name,
      customerEmail: profile?.email ?? user?.email,
    });

    setConversationId(conversation.id);
    setHandoffRequested(false);

    const greeting = generateBotResponse('hola', catalog, engineConfig);
    const welcomeMsg = await saveMessage(conversation.id, 'bot', greeting.content);

    setMessages([
      toUiMessage(welcomeMsg, { recommendedProducts: greeting.recommendedProducts }),
    ]);

    return conversation.id;
  }, [conversationId, user, profile, loadCatalog, engineConfig]);

  const applyHandoff = useCallback(
    async (activeId, reason) => {
      if (handoffRequested) return null;

      await updateConversationCustomer(activeId, {
        customerName: profile?.full_name,
        customerEmail: profile?.email ?? user?.email,
      });

      const systemMsg = await triggerHumanHandoff(activeId, reason);
      setHandoffRequested(true);
      return toUiMessage(systemMsg);
    },
    [handoffRequested, profile, user],
  );

  const processBotReply = useCallback(
    async (activeId, userText, catalog) => {
      const botReply = generateBotResponse(userText, catalog, engineConfig);

      if (botReply.shouldHandoff) {
        const reason =
          botReply.intent === 'purchase'
            ? 'Intención de compra'
            : 'Solicitud de atención humana';
        const handoffMsg = await applyHandoff(activeId, reason);
        return handoffMsg;
      }

      const savedBot = await saveMessage(activeId, 'bot', botReply.content);

      if (botReply.intent) {
        await recordBotIntent({
          conversationId: activeId,
          messageId: savedBot.id,
          intentCode: botReply.intent,
        });
      }

      return toUiMessage(savedBot, {
        recommendedProducts: botReply.recommendedProducts ?? [],
        intent: botReply.intent,
      });
    },
    [applyHandoff, engineConfig],
  );

  const sendUserMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      setError(null);

      const optimistic = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        let activeId = conversationId;
        if (!activeId) {
          activeId = await initConversation();
        }

        const savedUser = await saveMessage(activeId, 'customer', trimmed);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? toUiMessage(savedUser) : m)),
        );

        if (handoffRequested) {
          return;
        }

        const catalog = products.length ? products : await loadCatalog();
        const botMsg = await processBotReply(activeId, trimmed, catalog);
        if (botMsg) {
          setMessages((prev) => [...prev, botMsg]);
        }
      } catch (err) {
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'system', content: err.message },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      conversationId,
      loading,
      handoffRequested,
      initConversation,
      processBotReply,
      products,
      loadCatalog,
    ],
  );

  const requestHandoff = useCallback(async () => {
    if (!conversationId || handoffRequested) return;

    setLoading(true);
    try {
      const handoffMsg = await applyHandoff(conversationId, 'Botón: hablar con vendedor');
      if (handoffMsg) {
        setMessages((prev) => [...prev, handoffMsg]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId, handoffRequested, applyHandoff]);

  useEffect(() => {
    if (!enabled) return;
    loadCatalog();
    loadActiveBotRules().then(setEngineConfig);
    isChatbotEnabled().then(setChatbotEnabled).catch(() => setChatbotEnabled(true));
  }, [enabled, loadCatalog]);

  useEffect(() => {
    if (!enabled || !conversationId || !handoffRequested) return undefined;

    const poll = async () => {
      try {
        const data = await fetchConversationMessages(conversationId);
        setMessages(data);
      } catch {
        /* ignorar errores de polling */
      }
    };

    const interval = setInterval(poll, 6000);
    return () => clearInterval(interval);
  }, [enabled, conversationId, handoffRequested]);

  return {
    conversationId,
    messages,
    products,
    loading,
    error,
    handoffRequested,
    chatbotEnabled,
    initConversation,
    sendUserMessage,
    requestHandoff,
    setMessages,
  };
}
