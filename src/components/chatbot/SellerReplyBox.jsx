import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import './SellerReplyBox.css';

export default function SellerReplyBox({ onSend, loading = false, disabled = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || loading || disabled) return;
    onSend(value);
    setText('');
  };

  return (
    <form className="seller-reply-box" onSubmit={handleSubmit}>
      <Input
        placeholder="Escribe tu respuesta al cliente..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading || disabled}
        required={false}
      />
      <Button type="submit" disabled={loading || disabled || !text.trim()}>
        Enviar
      </Button>
    </form>
  );
}
