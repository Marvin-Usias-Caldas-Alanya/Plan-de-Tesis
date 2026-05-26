import { Link } from 'react-router-dom';
import { formatProductPrice } from '../../utils/productFormatters';
import { ROUTES } from '../../utils/constants';
import './ChatMessage.css';

const SENDER_LABELS = {
  customer: 'Cliente',
  bot: 'Bot',
  seller: 'Vendedor',
  system: 'Sistema',
};

export default function ChatMessage({ message, showSenderLabel = false }) {
  const { role, content, recommendedProducts = [], senderType } = message;
  const roleClass =
    senderType === 'seller'
      ? 'seller'
      : role === 'user'
        ? 'user'
        : role === 'assistant'
          ? 'assistant'
          : 'system';

  return (
    <div className={`chat-message chat-message--${roleClass}`}>
      {showSenderLabel && senderType && (
        <span className="chat-message__label">
          {SENDER_LABELS[senderType] ?? senderType}
        </span>
      )}
      <div className="chat-message__bubble">
        {content.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>

      {recommendedProducts.length > 0 && (
        <ul className="chat-message__products" aria-label="Productos recomendados">
          {recommendedProducts.map((product) => (
            <li key={product.id} className="chat-message__product-card">
              <strong>{product.name}</strong>
              <span>{formatProductPrice(product.price)}</span>
              <Link to={ROUTES.CATALOG} className="chat-message__product-link">
                Ver en catálogo
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
