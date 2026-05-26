import { getStockStatus, STOCK_STATUS } from './productStock';

/**
 * Calcula métricas del inventario para el panel admin.
 */
export function getAdminProductStats(products = []) {
  const list = Array.isArray(products) ? products : [];

  return {
    total: list.length,
    active: list.filter((p) => p.is_active).length,
    lowStock: list.filter((p) => getStockStatus(p) === STOCK_STATUS.LOW).length,
    outOfStock: list.filter((p) => getStockStatus(p) === STOCK_STATUS.OUT).length,
  };
}
