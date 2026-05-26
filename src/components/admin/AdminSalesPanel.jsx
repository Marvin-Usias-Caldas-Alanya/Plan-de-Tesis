import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { getAllSales, getSaleDetails } from '../../services/salesService';
import './AdminShared.css';

export default function AdminSalesPanel({ onFeedback }) {
  const [sales, setSales] = useState([]);
  const [details, setDetails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSales(await getAllSales());
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const selectSale = async (sale) => {
    setSelected(sale);
    try {
      setDetails(await getSaleDetails(sale.id));
    } catch {
      setDetails([]);
    }
  };

  if (loading) return <Loading label="Cargando ventas…" />;

  return (
    <div className="admin-panel-section orders-panel">
      <Card elevated padding={false}>
        {!sales.length ? (
          <AdminEmptyState title="Sin ventas" message="Las ventas cerradas se registran en la tabla sales." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nº venta</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => selectSale(s)}>
                    <td>{s.sale_number ?? s.id.slice(0, 8)}</td>
                    <td>{s.customer_name ?? '—'}</td>
                    <td>${s.total_amount.toFixed(2)}</td>
                    <td>{new Date(s.sale_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {selected && (
        <Card elevated>
          <h3>Detalle venta {selected.sale_number}</h3>
          <ul>
            {details.map((d) => (
              <li key={d.id}>
                {d.product_name} × {d.quantity} — ${d.unit_price.toFixed(2)}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
