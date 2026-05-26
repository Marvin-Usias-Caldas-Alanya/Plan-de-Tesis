import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { getAllPayments, getPaymentMethods } from '../../services/paymentService';
import './AdminShared.css';

export default function AdminPaymentsPanel({ onFeedback }) {
  const [payments, setPayments] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payRows, methodRows] = await Promise.all([getAllPayments(), getPaymentMethods()]);
      setPayments(payRows);
      setMethods(methodRows);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading label="Cargando pagos…" />;

  return (
    <div className="admin-panel-section">
      <Card elevated>
        <h2 className="page-section__title">Métodos de pago</h2>
        {!methods.length ? (
          <AdminEmptyState title="Sin métodos" />
        ) : (
          <ul>
            {methods.map((m) => (
              <li key={m.id}>
                {m.name} ({m.code}) {m.is_active ? '✓' : '—'}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card elevated padding={false}>
        <h2 className="page-section__title admin-panel__list-title">Pagos</h2>
        {!payments.length ? (
          <AdminEmptyState title="Sin pagos" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.order_number ?? p.order_id?.slice(0, 8)}</td>
                    <td>${p.amount.toFixed(2)}</td>
                    <td>{p.payment_method}</td>
                    <td>
                      <span className="admin-badge">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
