import { useOrders } from '../../hooks/useOrders';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import './AdminPanels.css';

export default function OrdersPanel({ mode = 'admin', profileId, onFeedback }) {
  const {
    orders,
    statuses,
    selectedOrder,
    orderDetails,
    loading,
    submitting,
    selectOrder,
    changeOrderStatus,
    takeOrderAsSeller,
  } = useOrders({ mode, profileId, onFeedback });

  return (
    <div className="admin-panel orders-panel">
      <Card elevated padding={false} className="orders-panel__list">
        <h2 className="page-section__title admin-panel__list-title">Pedidos</h2>
        {loading ? (
          <Loading label="Cargando pedidos…" />
        ) : (
          <ul className="admin-panel__list">
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className={`orders-panel__order-btn ${selectedOrder?.id === order.id ? 'orders-panel__order-btn--active' : ''}`}
                  onClick={() => selectOrder(order)}
                >
                  <strong>{order.order_number ?? order.id.slice(0, 8)}</strong>
                  <span className="admin-panel__meta">
                    {order.customer_name ?? 'Cliente'} · {order.status_name ?? order.status_code}
                  </span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </button>
              </li>
            ))}
            {!orders.length && <p className="admin-panel__empty">No hay pedidos registrados.</p>}
          </ul>
        )}
      </Card>

      <Card elevated className="orders-panel__detail">
        {selectedOrder ? (
          <>
            <h2 className="page-section__title">Detalle del pedido</h2>
            <p>
              <strong>Cliente:</strong> {selectedOrder.customer_name ?? '—'}
            </p>
            <p>
              <strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}
            </p>
            <ul className="orders-panel__details">
              {orderDetails.map((line) => (
                <li key={line.id}>
                  {line.product_name} × {line.quantity} — ${line.unit_price.toFixed(2)}
                </li>
              ))}
            </ul>
            <div className="admin-panel__actions">
              {statuses.map((status) => (
                <Button
                  key={status.id}
                  size="sm"
                  variant={selectedOrder.status_code === status.code ? 'primary' : 'secondary'}
                  disabled={submitting}
                  onClick={() => changeOrderStatus(selectedOrder.id, status.code)}
                >
                  {status.name}
                </Button>
              ))}
              {mode === 'seller' && !selectedOrder.seller_id && (
                <Button
                  size="sm"
                  variant="accent"
                  disabled={submitting}
                  onClick={() => takeOrderAsSeller(selectedOrder.id)}
                >
                  Tomar pedido
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="admin-panel__empty">Selecciona un pedido para ver el detalle.</p>
        )}
      </Card>
    </div>
  );
}
