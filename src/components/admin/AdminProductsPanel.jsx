import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useAdminProductActions } from '../../hooks/useAdminProductActions';
import ProductForm from '../products/ProductForm';
import ProductTable from '../products/ProductTable';
import Button from '../common/Button';

export default function AdminProductsPanel({ onFeedback }) {
  const { products, categories, loading, error, refreshProducts } = useProducts({
    includeInactive: true,
  });
  const [formMode, setFormMode] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const { submitting, actionBusy, createProduct, updateProduct, setProductActive, quickUpdatePriceStock } =
    useAdminProductActions({ onFeedback });

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'create') await createProduct(formData);
      else if (formMode === 'edit' && editingProduct) await updateProduct(editingProduct.id, formData);
      setFormMode(null);
      setEditingProduct(null);
      await refreshProducts();
    } catch {
      /* feedback */
    }
  };

  return (
    <div className="admin-panel-section">
      <div className="admin-panel-section__toolbar">
        <h2 className="page-section__title">Productos</h2>
        <div>
          <Button variant="secondary" size="sm" onClick={refreshProducts} disabled={loading}>
            Actualizar
          </Button>
          <Button size="sm" onClick={() => { setEditingProduct(null); setFormMode('create'); }} disabled={formMode === 'create'}>
            Nuevo producto
          </Button>
        </div>
      </div>
      {formMode && (
        <ProductForm
          mode={formMode}
          initialData={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          onCancel={() => { setFormMode(null); setEditingProduct(null); }}
          submitting={submitting}
        />
      )}
      <ProductTable
        products={products}
        loading={loading}
        error={error}
        onEdit={(p) => { setEditingProduct(p); setFormMode('edit'); }}
        onDeactivate={(p) => setProductActive(p, false).then(refreshProducts)}
        onActivate={(p) => setProductActive(p, true).then(refreshProducts)}
        onQuickUpdate={async (id, payload) => {
          const ok = await quickUpdatePriceStock(id, payload);
          if (ok) await refreshProducts();
        }}
        actionBusy={actionBusy || submitting}
      />
    </div>
  );
}
