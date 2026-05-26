import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import ProductCard from './ProductCard';
import './ProductList.css';

export default function ProductList({
  products,
  loading,
  error,
  onConsultChat,
  onRequestPurchase,
  showActions = true,
}) {
  if (loading) {
    return (
      <div className="product-list__center">
        <Loading label="Cargando productos..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage type="error" message={`Error al cargar productos: ${error}`} />;
  }

  if (!products?.length) {
    return (
      <div className="empty-state">
        <h3>Sin productos</h3>
        <p>No hay productos que coincidan con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onConsultChat={showActions ? onConsultChat : undefined}
          onRequestPurchase={showActions ? onRequestPurchase : undefined}
        />
      ))}
    </div>
  );
}
