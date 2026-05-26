import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { createSupplier, getSuppliers } from '../../services/inventoryService';
import './AdminShared.css';

export default function AdminSuppliersPanel({ onFeedback }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSuppliers(await getSuppliers());
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createSupplier(form);
      onFeedback?.('success', 'Proveedor creado');
      setForm({ name: '', email: '', phone: '' });
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  if (loading) return <Loading label="Cargando proveedores…" />;

  return (
    <Card elevated className="admin-panel-section">
      <form className="admin-form-grid" onSubmit={handleCreate}>
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          Teléfono
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <Button type="submit">Crear proveedor</Button>
      </form>
      {!suppliers.length ? (
        <AdminEmptyState title="Sin proveedores" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email ?? '—'}</td>
                  <td>{s.phone ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
