import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import {
  getInventoryMovements,
  getStockOverview,
  registerStockEntry,
  registerStockOutput,
} from '../../services/inventoryService';
import './AdminShared.css';

export default function AdminInventoryPanel({ onFeedback }) {
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: '', quantity: 1, type: 'entry', note: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRows, movRows] = await Promise.all([
        getStockOverview(),
        getInventoryMovements(),
      ]);
      setStock(stockRows);
      setMovements(movRows);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMovement = async (e) => {
    e.preventDefault();
    if (!form.productId || form.quantity <= 0) return;
    try {
      if (form.type === 'entry') {
        await registerStockEntry({
          productId: form.productId,
          quantity: Number(form.quantity),
          source: form.note,
        });
      } else {
        await registerStockOutput({
          productId: form.productId,
          quantity: Number(form.quantity),
          reason: form.note,
        });
      }
      onFeedback?.('success', 'Movimiento registrado');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  if (loading) return <Loading label="Cargando inventario…" />;

  return (
    <div className="admin-panel-section">
      <Card elevated>
        <h2 className="page-section__title">Registrar movimiento</h2>
        <form className="admin-form-grid" onSubmit={handleMovement}>
          <label>
            Producto
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            >
              <option value="">Seleccionar…</option>
              {stock.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="entry">Entrada</option>
              <option value="exit">Salida</option>
            </select>
          </label>
          <label>
            Cantidad
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </label>
          <label>
            Nota
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          <Button type="submit">Registrar</Button>
        </form>
      </Card>

      <Card elevated padding={false}>
        <h2 className="page-section__title admin-panel__list-title">Stock actual</h2>
        {!stock.length ? (
          <AdminEmptyState />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku ?? '—'}</td>
                    <td>
                      <span className={p.stock <= 5 ? 'admin-badge admin-badge--warn' : 'admin-badge'}>
                        {p.stock}
                      </span>
                    </td>
                    <td>${Number(p.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card elevated padding={false}>
        <h2 className="page-section__title admin-panel__list-title">Últimos movimientos</h2>
        {!movements.length ? (
          <AdminEmptyState title="Sin movimientos" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td>{m.product_name}</td>
                    <td>{m.movement_type}</td>
                    <td>{m.quantity}</td>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
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
