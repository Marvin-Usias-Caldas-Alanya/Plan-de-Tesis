import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
} from '../../services/productService';
import './AdminShared.css';

export default function AdminCategoriesPanel({ onFeedback }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(await getProductCategories({ activeOnly: false }));
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProductCategory(editingId, form);
        onFeedback?.('success', 'Categoría actualizada');
      } else {
        await createProductCategory({ ...form, is_active: true });
        onFeedback?.('success', 'Categoría creada');
      }
      setForm({ name: '', slug: '', description: '' });
      setEditingId(null);
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar categoría?')) return;
    try {
      await deleteProductCategory(id);
      onFeedback?.('success', 'Categoría eliminada');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  if (loading) return <Loading label="Cargando categorías…" />;

  return (
    <Card elevated className="admin-panel-section">
      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Slug
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </label>
        <label>
          Descripción
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <Button type="submit">{editingId ? 'Guardar' : 'Crear categoría'}</Button>
      </form>
      {!categories.length ? (
        <AdminEmptyState title="Sin categorías" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Activa</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.is_active ? 'Sí' : 'No'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(c.id);
                        setForm({
                          name: c.name,
                          slug: c.slug,
                          description: c.description ?? '',
                        });
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(c.id)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
