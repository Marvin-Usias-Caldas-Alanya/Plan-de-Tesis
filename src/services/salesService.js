import { selectMany } from './baseService';

const SALE_SELECT = `
  id,
  sale_number,
  order_id,
  customer_id,
  total_amount,
  sale_date,
  created_at,
  customers ( profiles ( full_name, email ) )
`;

export function mapSale(row) {
  if (!row) return null;
  return {
    id: row.id,
    sale_number: row.sale_number,
    order_id: row.order_id,
    customer_id: row.customer_id,
    customer_name: row.customers?.profiles?.full_name ?? null,
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
