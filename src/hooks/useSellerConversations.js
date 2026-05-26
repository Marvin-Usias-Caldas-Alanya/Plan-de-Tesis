import { useCallback, useEffect, useState } from 'react';
import {
  assignConversationToSeller,
  closeConversation,
  fetchConversationMessages,
  fetchPendingConversations,
  saveSellerMessage,
} from '../services/chatbotService';
import { CHAT_STATUS } from '../utils/constants';

export function useSellerConversations(profileId) {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await fetchPendingConversations();
      setConversations(data);
      if (
        selectedId &&
        !data.some((c) => c.id === selectedId) &&
        selectedStatus !== CHAT_STATUS.HUMAN
      ) {
        setSelectedId(null);
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, [selectedId, selectedStatus]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await fetchConversationMessages(conversationId);
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const selectConversation = useCallback(
    (conversation) => {
      setSelectedId(conversation.id);
      setActiveConversation(conversation);
      setSelectedStatus(conversation.status);
      loadMessages(conversation.id);
    },
    [loadMessages],
  );

  const attendConversation = useCallback(async () => {
    if (!selectedId || !profileId) return null;

    setError(null);
    try {
      const { conversation } = await assignConversationToSeller(selectedId, profileId);
      setSelectedStatus(conversation.status);
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              status: conversation.status,
              customer_name: conversation.customer_name ?? prev.customer_name,
              customer_email: conversation.customer_email ?? prev.customer_email,
            }
          : prev,
      );
      await loadMessages(selectedId);
      await loadConversations();
      return conversation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [selectedId, profileId, loadMessages, loadConversations]);

  const closeSelectedConversation = useCallback(async () => {
    if (!selectedId) return;

    setError(null);
    try {
      await closeConversation(selectedId);
      setSelectedId(null);
      setActiveConversation(null);
      setMessages([]);
      setSelectedStatus(null);
      await loadConversations();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [selectedId, loadConversations]);

  const sendReply = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || !selectedId || selectedStatus !== CHAT_STATUS.HUMAN) return;

      setSending(true);
      setError(null);
      try {
        const saved = await saveSellerMessage(selectedId, trimmed);
        setMessages((prev) => [...prev, saved]);
        return saved;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [selectedId, selectedStatus],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId || selectedStatus !== CHAT_STATUS.HUMAN) return undefined;

    const interval = setInterval(() => {
      loadMessages(selectedId);
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedId, selectedStatus, loadMessages]);

  const selectedConversation =
    conversations.find((c) => c.id === selectedId) ?? activeConversation;

  return {
    conversations,
    selectedConversation,
    selectedId,
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
  };
}
