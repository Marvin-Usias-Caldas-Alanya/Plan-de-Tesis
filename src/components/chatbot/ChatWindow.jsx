import { useEffect, useRef } from 'react';
import Card from '../common/Card';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import './ChatWindow.css';

export default function ChatWindow({
  messages,
  loading,
  inputValue,
  onInputChange,
  onSend,
  onHandoff,
  onClose,
  handoffRequested,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <Card elevated padding={false} className="chat-window">
      <header className="chat-window__header">
        <div>
          <h3>Asistente NutriStore</h3>
          <p className="chat-window__subtitle">NutriBot · recomendaciones y ventas</p>
        </div>
        <button
          type="button"
          className="chat-window__close"
          onClick={onClose}
          aria-label="Cerrar chat"
        >
          ×
        </button>
      </header>

      <div className="chat-window__messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && <p className="chat-window__typing">Escribiendo...</p>}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSubmit={onSend}
        onHandoff={onHandoff}
        loading={loading}
        handoffRequested={handoffRequested}
      />
    </Card>
  );
}
