import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { formatProductPrice } from '../utils/productFormatters';
import { ROUTES } from '../utils/constants';
import './CustomerPages.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, loading, submitting, error, setQuantity, removeItem } = useCart(
    user?.id,
  );

  if (loading) {
    return (
      <div className="customer-page">
        <Loading label="Cargando carrito..." />
      </div>
    );
  }

  return (
    <div className="customer-page cart-page">
      <header className="customer-page__header">
        <h1>Mi carrito</h1>
        <p>Revisa tus productos antes de finalizar la compra.</p>
      </header>

      {error && <ErrorMessage type="error" message={error} className="customer-page__notice" />}

      {!items.length ? (
        <Card className="cart-page__empty">
          <h2>Tu carrito está vacío</h2>
          <p>Explora el catálogo y agrega suplementos.</p>
          <Link to={ROUTES.CATALOG}>
            <Button>Ir al catálogo</Button>
          </Link>
        </Card>
      ) : (
        <>
          <ul className="cart-page__list">
            {items.map((item) => (
              <li key={item.id} className="cart-page__item">
                <div>
                  <h2 className="cart-page__item-name">{item.product_name}</h2>
                  <p className="cart-page__item-meta">
                    {item.sku} · {formatProductPrice(item.unit_price)} c/u
                  </p>
                </div>
                <div className="cart-page__qty">
                  <label htmlFor={`qty-${item.id}`} className="visually-hidden">
                    Cantidad
                  </label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    disabled={submitting}
                    onChange={(e) => setQuantity(item.id, Number(e.target.value))}
                  />
                </div>
                <div>
                  <strong>{formatProductPrice(item.unit_price * item.quantity)}</strong>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={submitting}
                      onClick={() => removeItem(item.id)}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-page__summary">
            <div className="cart-page__total">
              <span>Subtotal</span>
              <span>{formatProductPrice(subtotal)}</span>
            </div>
            <div className="cart-page__actions">
              <Link to={ROUTES.CATALOG}>
                <Button variant="secondary">Seguir comprando</Button>
              </Link>
              <Button disabled={submitting} onClick={() => navigate(ROUTES.CHECKOUT)}>
                Ir al checkout
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
