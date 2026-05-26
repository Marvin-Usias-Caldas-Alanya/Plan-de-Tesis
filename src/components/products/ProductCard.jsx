import Card from '../common/Card';
import Button from '../common/Button';
import {
  getStockLabel,
  getStockStatus,
  canPurchase,
  STOCK_STATUS,
} from '../../utils/productStock';
import { formatProductPrice } from '../../utils/productFormatters';
import './ProductCard.css';

export default function ProductCard({ product, onConsultChat, onRequestPurchase }) {
  const { name, description, price, stock, category, image_url } = product;
  const stockStatus = getStockStatus(product);
  const purchasable = canPurchase(product);

  return (
    <Card as="article" hover padding={false} className="product-card">
      <div className="product-card__image-wrap">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="product-card__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">
            {name?.charAt(0) ?? '?'}
          </div>
        )}
        <span className={`product-card__status product-card__status--${stockStatus}`}>
          {getStockLabel(stockStatus)}
        </span>
      </div>

      <div className="product-card__body">
        {category && <span className="badge">{category}</span>}
        <h3 className="product-card__title">{name}</h3>
        <p className="product-card__desc">{description || 'Sin descripción'}</p>

        <div className="product-card__meta">
          <span className="product-card__price">{formatProductPrice(price)}</span>
          <span className="product-card__stock">
            {stockStatus === STOCK_STATUS.OUT ? 'Sin unidades' : `${stock} en stock`}
          </span>
        </div>

        <div className="product-card__actions">
          <Button
            variant="secondary"
            size="sm"
            block
            onClick={() => onConsultChat?.(product)}
          >
            Consultar por chatbot
          </Button>
          <Button
            variant="accent"
            size="sm"
            block
            disabled={!purchasable}
            onClick={() => onRequestPurchase?.(product)}
          >
            Solicitar compra
          </Button>
        </div>
      </div>
    </Card>
  );
}
