import Card from '../common/Card';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import ProductActions from './ProductActions';
import { formatProductPrice } from '../../utils/productFormatters';
import { getStockLabel, getStockStatus } from '../../utils/productStock';
import './ProductTable.css';

export default function ProductTable({
  products,
  loading,
  error,
  onEdit,
  onDeactivate,
  onActivate,
  onQuickUpdate,
  actionBusy = false,
}) {
  if (loading) {
    return (
      <Card elevated className="product-table__loading">
        <Loading label="Cargando inventario..." />
      </Card>
    );
  }

  if (error) {
    return <ErrorMessage type="error" message={`Error: ${error}`} />;
  }

  if (!products?.length) {
    return (
      <Card elevated>
        <div className="empty-state">
          <h3>Sin productos</h3>
          <p>Crea el primer producto con el botón &quot;Nuevo producto&quot;.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card elevated padding={false} className="product-table">
      <div className="product-table__scroll">
        <table className="product-table__table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Catálogo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <tr
                  key={product.id}
                  className={!product.is_active ? 'product-table__row--inactive' : ''}
                >
                  <td data-label="Producto">
                    <strong>{product.name}</strong>
                    {product.sku && (
                      <span className="product-table__sku">{product.sku}</span>
                    )}
                  </td>
                  <td data-label="Categoría">{product.category ?? '—'}</td>
                  <td data-label="Precio">{formatProductPrice(product.price)}</td>
                  <td data-label="Stock">{product.stock}</td>
                  <td data-label="Estado">
                    <span
                      className={`product-table__stock product-table__stock--${stockStatus}`}
                    >
                      {getStockLabel(stockStatus)}
                    </span>
                  </td>
                  <td data-label="Catálogo">
                    <span
                      className={
                        product.is_active
                          ? 'product-table__active'
                          : 'product-table__inactive'
                      }
                    >
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <ProductActions
                      product={product}
                      onEdit={onEdit}
                      onDeactivate={onDeactivate}
                      onActivate={onActivate}
                      onQuickUpdate={onQuickUpdate}
                      busy={actionBusy}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
