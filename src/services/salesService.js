import { insertMany, insertOne, selectMany, selectMaybeSingle } from './baseService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

const SALE_SELECT = `
  id,
  sale_number,
  order_id,
  customer_id,
  total_amount,
  sale_date,
  created_at,
  customers ( profiles ( ${PROFILE_NESTED_SELECT} ) )
`;

export function mapSale(row) {
  if (!row) return null;
  return {
    id: row.id,
    sale_number: row.sale_number,
    order_id: row.order_id,
    customer_id: row.customer_id,
    customer_name: resolveProfileName(row.customers?.profiles),
    total_amount: Number(row.total_amount),
    sale_date: row.sale_date,
    created_at: row.created_at,
  };
}

export async function getAllSales() {
  const rows = await selectMany(
    'sales',
    SALE_SELECT,
    { order: 'sale_date', ascending: false },
    'listar ventas',
  );
  return rows.map(mapSale);
}

export async function getSaleDetails(saleId) {
  const rows = await selectMany(
    'sale_details',
    `
      id,
      quantity,
      unit_price,
      products ( name, sku )
    `,
    { eq: { sale_id: saleId } },
    'detalle de venta',
  );

  return rows.map((row) => ({
    id: row.id,
    product_name: row.products?.name,
    sku: row.products?.sku,
    quantity: row.quantity,
    unit_price: Number(row.unit_price),
  }));
}

export async function getSaleByOrderId(orderId) {
  const row = await selectMaybeSingle(
    'sales',
    SALE_SELECT,
    { eq: { order_id: orderId } },
    'venta por pedido',
  );
  return mapSale(row);
}

export async function createSaleFromOrder({ orderId, customerId, totalAmount, items }) {
  const existing = await getSaleByOrderId(orderId);
  if (existing) return existing;

  const saleNumber = `V-${Date.now().toString(36).toUpperCase()}`;
  const sale = await insertOne(
    'sales',
    {
      order_id: orderId,
      customer_id: customerId,
      total_amount: totalAmount,
      sale_number: saleNumber,
    },
    SALE_SELECT,
    'crear venta',
  );

  const detailRows = items.map((item) => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  await insertMany('sale_details', detailRows, 'id', 'crear detalle de venta');
  return mapSale(sale);
}
