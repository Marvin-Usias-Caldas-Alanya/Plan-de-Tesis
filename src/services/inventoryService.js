import { insertOne, selectMany, selectSingle, updateWhere } from './baseService';

export { getSuppliers, createSupplier } from './supplierService';
export { getPurchases, getPurchaseDetails } from './purchaseService';

export async function getInventoryMovements() {
  const rows = await selectMany(
    'inventory_movements',
    `
      id,
      movement_type,
      quantity,
      notes,
      created_at,
      products ( name, sku )
    `,
    { order: 'created_at', ascending: false, limit: 100 },
    'movimientos de inventario',
  );

  return rows.map((row) => ({
    id: row.id,
    movement_type: row.movement_type,
    quantity: row.quantity,
    notes: row.notes,
    product_name: row.products?.name ?? null,
    sku: row.products?.sku ?? null,
    created_at: row.created_at,
  }));
}

async function adjustProductStock(productId, delta) {
  const product = await selectSingle('products', 'stock', { eq: { id: productId } }, 'stock producto');
  const newStock = Math.max(0, Number(product.stock) + delta);
  await updateWhere('products', { id: productId }, { stock: newStock }, 'ajustar stock');
  return newStock;
}

export async function registerStockEntry({ productId, quantity, source }) {
  const movement = await insertOne(
    'inventory_movements',
    {
      product_id: productId,
      movement_type: 'entry',
      quantity,
      notes: source ?? 'Entrada manual admin',
    },
    'id',
    'movimiento entrada',
  );

  const entry = await insertOne(
    'stock_entries',
    {
      product_id: productId,
      quantity,
      source,
      inventory_movement_id: movement.id,
    },
    'id, product_id, quantity, created_at',
    'registro entrada stock',
  );

  await adjustProductStock(productId, quantity);
  return entry;
}

export async function registerStockOutput({ productId, quantity, reason }) {
  const absQty = Math.abs(quantity);

  const movement = await insertOne(
    'inventory_movements',
    {
      product_id: productId,
      movement_type: 'exit',
      quantity: -absQty,
      notes: reason ?? 'Salida manual admin',
    },
    'id',
    'movimiento salida',
  );

  const output = await insertOne(
    'stock_outputs',
    {
      product_id: productId,
      quantity: absQty,
      reason,
      inventory_movement_id: movement.id,
    },
    'id, product_id, quantity, created_at',
    'registro salida stock',
  );

  await adjustProductStock(productId, -absQty);
  return output;
}

export async function getStockOverview() {
  return selectMany(
    'products',
    'id, name, sku, stock, is_active, price',
    { order: 'name' },
    'resumen de stock',
  );
}
