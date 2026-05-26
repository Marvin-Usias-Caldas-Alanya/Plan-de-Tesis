import { selectMany } from './baseService';

export async function getPurchases() {
  const rows = await selectMany(
    'purchases',
    `
      id,
      reference_code,
      status,
      total_amount,
      created_at,
      suppliers ( name )
    `,
    { order: 'created_at', ascending: false },
    'listar compras',
  );

  return rows.map((row) => ({
    id: row.id,
    reference_code: row.reference_code,
    status: row.status,
    total_amount: row.total_amount,
    created_at: row.created_at,
    supplier_name: row.suppliers?.name ?? null,
  }));
}

export async function getPurchaseDetails(purchaseId) {
  return selectMany(
    'purchase_details',
    `
      id,
      product_id,
      quantity,
      unit_cost,
      products ( name, sku )
    `,
    { eq: { purchase_id: purchaseId } },
    'detalle de compra',
  );
}
