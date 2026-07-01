import { useLocation } from 'react-router-dom';
import Card from '../components/common/Card';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { formatProductPrice } from '../utils/productFormatters';
import './CustomerPages.css';

export default function OrdersPage() {
  const location = useLocation();
  const { user } = useAuth();
  const { orders, loading, selectOrder, selectedOrder, orderDetails } = useOrders({
    mode: 'customer',
    profileId: user?.id,
  });

  return (
    <div className="customer-page orders-page">
      <header className="customer-page__header">
        <h1>Mis pedidos</h1>
        <p>Consulta el estado de tus compras en NutriStore.</p>
      </header>

      {location.state?.orderNumber && (
        <ErrorMessage
          type="success"
          message={`Pedido ${location.state.orderNumber} registrado correctamente.`}
          className="customer-page__notice"
        />
      )}

      {loading ? (
        <Loading label="Cargando pedidos..." />
      ) : !orders.length ? (
        <Card className="cart-page__empty">
          <h2>Aún no tienes pedidos</h2>
          <p>Cuando compres en el catálogo, aparecerán aquí.</p>
        </Card>
      ) : (
        <ul className="orders-page__list">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                className="orders-page__card"
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => selectOrder(order)}
              >
                <div className="orders-page__card-head">
                  <strong>{order.order_number}</strong>
                  <span className="orders-page__status">{order.status_name}</span>
                </div>
                <p className="cart-page__item-meta">
                  {new Date(order.created_at).toLocaleString('es-MX')} ·{' '}
                  {formatProductPrice(order.total_amount)}
                </p>
                {selectedOrder?.id === order.id && orderDetails.length > 0 && (
                  <ul className="orders-panel__details" style={{ marginTop: '0.75rem' }}>
                    {orderDetails.map((line) => (
                      <li key={line.id}>
                        {line.product_name} × {line.quantity} —{' '}
                        {formatProductPrice(line.unit_price * line.quantity)}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
