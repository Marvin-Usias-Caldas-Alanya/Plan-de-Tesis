import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatProductPrice } from '../../utils/productFormatters';
import './ProductActions.css';

export default function ProductActions({
  product,
  onEdit,
  onDeactivate,
  onActivate,
  onQuickUpdate,
  busy = false,
}) {
  const [price, setPrice] = useState(String(product.price ?? ''));
  const [stock, setStock] = useState(String(product.stock ?? ''));
  const [showQuick, setShowQuick] = useState(false);

  useEffect(() => {
    setPrice(String(product.price ?? ''));
    setStock(String(product.stock ?? ''));
  }, [product.id, product.price, product.stock]);

  const handleQuickSave = () => {
    onQuickUpdate?.(product.id, {
      price: Number(price),
      stock: Number(stock),
    });
    setShowQuick(false);
  };

  return (
    <div className="product-actions">
      <div className="product-actions__main">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit?.(product)}
          disabled={busy}
        >
          Editar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowQuick((v) => !v)}
          disabled={busy}
        >
          Precio / Stock
        </Button>
        {product.is_active ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeactivate?.(product)}
            disabled={busy}
          >
            Desactivar
          </Button>
        ) : (
          <Button size="sm" onClick={() => onActivate?.(product)} disabled={busy}>
            Activar
          </Button>
        )}
      </div>

      {showQuick && (
        <div className="product-actions__quick">
          <Input
            label="Precio"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label="Stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <div className="product-actions__quick-btns">
            <Button size="sm" onClick={handleQuickSave} disabled={busy}>
              Guardar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowQuick(false)}>
              Cerrar
            </Button>
          </div>
          <p className="product-actions__hint">
            Actual: {formatProductPrice(product.price)} · {product.stock} uds.
          </p>
        </div>
      )}
    </div>
  );
}
