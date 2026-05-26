import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useChatbot } from '../../hooks/useChatbot';
import ChatWindow from './ChatWindow';
import './ChatWidget.css';

export default function ChatWidget({
  open: controlledOpen,
  onOpenChange,
  initialPrompt = '',
  onPromptConsumed,
}) {
  const { user, profile, isAuthenticated } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [input, setInput] = useState('');
  const promptAppliedRef = useRef(false);
  const autoSendRef = useRef(false);
  const pendingPromptRef = useRef('');

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange],
  );

  const {
    messages,
    loading,
    handoffRequested,
    chatbotEnabled,
    initConversation,
    sendUserMessage,
    requestHandoff,
  } = useChatbot({
    profile,
    user,
    enabled: open && isAuthenticated,
  });

  useEffect(() => {
    if (open && isAuthenticated) {
      initConversation().catch(() => {});
    }
  }, [open, isAuthenticated, initConversation]);

  useEffect(() => {
    if (!open || !initialPrompt || promptAppliedRef.current) return;

    promptAppliedRef.current = true;
    pendingPromptRef.current = initialPrompt;
    setInput(initialPrompt);
    onPromptConsumed?.();
  }, [open, initialPrompt, onPromptConsumed]);

  useEffect(() => {
    const pending = pendingPromptRef.current;
    if (!open || !pending || autoSendRef.current || loading) return;

    autoSendRef.current = true;
    pendingPromptRef.current = '';

    const timer = setTimeout(() => {
      sendUserMessage(pending);
      setInput('');
    }, 400);

    return () => clearTimeout(timer);
  }, [open, loading, sendUserMessage]);

  const handleSend = (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput('');
    sendUserMessage(value);
  };

  if (!isAuthenticated || chatbotEnabled === false) return null;

  return (
    <div className={`chat-widget ${open ? 'chat-widget--open' : ''}`}>
      {open && (
        <ChatWindow
          messages={messages}
          loading={loading}
          inputValue={input}
          onInputChange={setInput}
          onSend={handleSend}
          onHandoff={requestHandoff}
          onClose={() => setOpen(false)}
          handoffRequested={handoffRequested}
        />
      )}

      <button
        type="button"
        className="chat-widget__toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}
