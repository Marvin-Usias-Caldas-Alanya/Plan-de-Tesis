/** Umbral por debajo del cual el producto se considera stock bajo */
export const LOW_STOCK_THRESHOLD = 5;

export const STOCK_STATUS = {
  AVAILABLE: 'available',
  LOW: 'low',
  OUT: 'out',
};

const STOCK_LABELS = {
  [STOCK_STATUS.AVAILABLE]: 'Disponible',
  [STOCK_STATUS.LOW]: 'Stock bajo',
  [STOCK_STATUS.OUT]: 'Agotado',
};

/**
 * @param {{ stock?: number }} product
 * @returns {'available' | 'low' | 'out'}
 */
export function getStockStatus(product) {
  const stock = Number(product?.stock ?? 0);
  if (stock <= 0) return STOCK_STATUS.OUT;
  if (stock <= LOW_STOCK_THRESHOLD) return STOCK_STATUS.LOW;
  return STOCK_STATUS.AVAILABLE;
}

export function getStockLabel(status) {
  return STOCK_LABELS[status] ?? STOCK_LABELS[STOCK_STATUS.AVAILABLE];
}

export function canPurchase(product) {
  return getStockStatus(product) !== STOCK_STATUS.OUT;
}
