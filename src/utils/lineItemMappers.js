const PRODUCT_LINE_SELECT = `
  id,
  product_id,
  quantity,
  unit_price,
  products ( name, sku )
`;

export function mapProductLineRow(row) {
  return {
    id: row.id,
    product_id: row.product_id,
    product_name: row.products?.name ?? null,
    sku: row.products?.sku ?? null,
    quantity: row.quantity,
    unit_price: Number(row.unit_price),
  };
}

export async function fetchProductLines(selectMany, table, parentColumn, parentId, context) {
  const rows = await selectMany(
    table,
    PRODUCT_LINE_SELECT,
    { eq: { [parentColumn]: parentId } },
    context,
  );
  return rows.map(mapProductLineRow);
}
