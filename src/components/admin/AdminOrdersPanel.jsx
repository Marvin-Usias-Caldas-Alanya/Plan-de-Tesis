import { useOrders } from '../../hooks/useOrders';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import './AdminShared.css';

export default function AdminOrdersPanel({ onFeedback }) {
  const {
    orders,
    statuses,
    selectedOrder,
    orderDetails,
    loading,
    submitting,
    refresh,
    selectOrder,
    changeOrderStatus,
  } = useOrders({ mode: 'admin', onFeedback });

  if (loading && !orders.length) return <Loading label="Cargando pedidos…" />;

  return (
    <div className="admin-panel-section orders-panel">
      <Card elevated padding={false} className="orders-panel__list">
        <div className="admin-panel-section__toolbar" style={{ padding: '1rem' }}>
          <h2 className="page-section__title">Pedidos</h2>
          <Button variant="secondary" size="sm" onClick={refresh}>
            Actualizar
          </Button>
        </div>
        {!orders.length ? (
          <AdminEmptyState title="Sin pedidos" message="Los pedidos del catálogo aparecerán aquí." />
        ) : (
          <ul className="admin-panel__list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className={`orders-panel__order-btn ${selectedOrder?.id === order.id ? 'orders-panel__order-btn--active' : ''}`}
                  onClick={() => selectOrder(order)}
                >
                  <strong>{order.order_number ?? order.id.slice(0, 8)}</strong>
                  <span className="admin-panel__meta">
                    {order.customer_name ?? 'Cliente'} · {order.status_name}
                  </span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card elevated className="orders-panel__detail">
        {selectedOrder ? (
          <>
            <h2 className="page-section__title">Detalle</h2>
            <p>
              <strong>Cliente:</strong> {selectedOrder.customer_name ?? '—'}
            </p>
            <p>
              <strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}
            </p>
            <ul>
              {orderDetails.map((line) => (
                <li key={line.id}>
                  {line.product_name} × {line.quantity}
                </li>
              ))}
            </ul>
            <div className="admin-panel-section__toolbar">
              {statuses.map((s) => (
                <Button
                  key={s.id}
                  size="sm"
                  variant={selectedOrder.status_code === s.code ? 'primary' : 'secondary'}
                  disabled={submitting}
                  onClick={() => changeOrderStatus(selectedOrder.id, s.code)}
                >
                  {s.name}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <AdminEmptyState title="Selecciona un pedido" message="Elige un pedido de la lista." />
        )}
      </Card>
    </div>
  );
}
