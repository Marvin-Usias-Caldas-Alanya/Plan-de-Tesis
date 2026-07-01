import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { completeCheckout } from '../services/orderService';
import { getPaymentMethods } from '../services/paymentService';
import { createNotification } from '../services/notificationService';
import { formatProductPrice } from '../utils/productFormatters';
import { ROUTES } from '../utils/constants';
import './CustomerPages.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, loading, submitting, error } = useCart(user?.id);
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [checkoutError, setCheckoutError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    getPaymentMethods()
      .then((rows) => {
        setMethods(rows);
        if (rows[0]?.code) setSelectedMethod(rows[0].code);
      })
      .catch(() => setMethods([]));
  }, []);

  const handleConfirm = async () => {
    if (!user?.id || !items.length) return;

    setProcessing(true);
    setCheckoutError(null);
    try {
      const order = await completeCheckout({
        profileId: user.id,
        paymentMethodCode: selectedMethod,
      });

      await createNotification({
        profileId: user.id,
        title: 'Compra confirmada',
        body: `Tu pedido ${order.order_number} fue confirmado. Pago simulado exitoso.`,
        type: 'order',
      });

      setNotice({ type: 'success', text: `Pedido ${order.order_number} confirmado.` });
      navigate(ROUTES.ORDERS, {
        replace: true,
        state: { orderNumber: order.order_number },
      });
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-page">
        <Loading label="Preparando checkout..." />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="customer-page checkout-page">
        <Card className="cart-page__empty">
          <h2>No hay productos para pagar</h2>
          <p>Agrega artículos al carrito antes de continuar.</p>
          <Link to={ROUTES.CATALOG}>
            <Button>Ver catálogo</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="customer-page checkout-page">
      <header className="customer-page__header">
        <h1>Checkout</h1>
        <p>Selecciona un método de pago (simulado) y confirma tu pedido.</p>
      </header>

      {(error || checkoutError) && (
        <ErrorMessage
          type="error"
          message={error || checkoutError}
          className="customer-page__notice"
        />
      )}
      {notice && (
        <ErrorMessage type="success" message={notice.text} className="customer-page__notice" />
      )}

      <Card elevated className="checkout-page__summary">
        <h2 className="page-section__title">Resumen</h2>
        <ul className="orders-page__list">
          {items.map((item) => (
            <li key={item.id} className="orders-page__card">
              {item.product_name} × {item.quantity} —{' '}
              {formatProductPrice(item.unit_price * item.quantity)}
            </li>
          ))}
        </ul>
        <p className="cart-page__total">
          <span>Total</span>
          <span>{formatProductPrice(subtotal)}</span>
        </p>
      </Card>

      <Card elevated className="checkout-page__card">
        <h2 className="page-section__title">Método de pago</h2>
        <div className="checkout-page__methods">
          {methods.map((method) => (
            <label
              key={method.id}
              className={`checkout-page__method ${selectedMethod === method.code ? 'checkout-page__method--active' : ''}`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.code}
                checked={selectedMethod === method.code}
                onChange={() => setSelectedMethod(method.code)}
              />
              {method.name}
            </label>
          ))}
          {!methods.length && <p>Tarjeta (simulada)</p>}
        </div>
        <div className="cart-page__actions">
          <Link to={ROUTES.CART}>
            <Button variant="secondary">Volver al carrito</Button>
          </Link>
          <Button disabled={processing || submitting} onClick={handleConfirm}>
            {processing ? 'Procesando...' : 'Confirmar y pagar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
