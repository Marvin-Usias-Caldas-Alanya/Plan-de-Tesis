import Button from '../common/Button';
import Input from '../common/Input';
import './ChatInput.css';

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onHandoff,
  loading = false,
  handoffRequested = false,
  disabled = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <footer className="chat-input">
      {!handoffRequested && onHandoff && (
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={onHandoff}
          disabled={loading}
        >
          Hablar con vendedor
        </Button>
      )}
      {handoffRequested && (
        <span className="chat-input__badge badge badge--accent">Handoff solicitado</span>
      )}
      <form className="chat-input__form" onSubmit={handleSubmit}>
        <Input
          placeholder="Escribe tu mensaje..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || disabled || handoffRequested}
          required={false}
        />
        <Button type="submit" disabled={loading || !value.trim() || handoffRequested}>
          Enviar
        </Button>
      </form>
    </footer>
  );
}
