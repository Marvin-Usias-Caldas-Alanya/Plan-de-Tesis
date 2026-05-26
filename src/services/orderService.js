import { getSupabaseClient, handleSupabaseError, insertMany, insertOne, selectMany, selectSingle, updateOne } from './baseService';
import { getCustomerIdByProfileId } from './profileService';

const ORDER_SELECT = `
  id,
  order_number,
  customer_id,
  status_id,
  seller_id,
  subtotal,
  total_amount,
  created_at,
  updated_at,
  order_statuses ( code, name ),
  customers (
    profiles ( full_name, email )
  )
`;

export function mapOrder(row) {
  if (!row) return null;
  const profile = row.customers?.profiles;
  return {
    id: row.id,
    order_number: row.order_number,
    customer_id: row.customer_id,
    customer_name: profile?.full_name ?? null,
    customer_email: profile?.email ?? null,
    status_id: row.status_id,
    status_code: row.order_statuses?.code ?? null,
    status_name: row.order_statuses?.name ?? null,
    seller_id: row.seller_id,
    subtotal: Number(row.subtotal),
    total_amount: Number(row.total_amount),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getStatusIdByCode(code) {
  const row = await selectSingle(
    'order_statuses',
    'id',
    { eq: { code } },
    'estado de pedido',
  );
  return row.id;
}

export async function getOrderStatuses() {
  return selectMany(
    'order_statuses',
    'id, code, name, is_final',
    { order: 'code' },
    'estados de pedido',
  );
}

export async function getAllOrders() {
  const rows = await selectMany('orders', ORDER_SELECT, { order: 'created_at', ascending: false }, 'listar pedidos');
  return rows.map(mapOrder);
}

export async function getOrdersByCustomerProfile(profileId) {
  const customerId = await getCustomerIdByProfileId(profileId);
  const rows = await selectMany(
    'orders',
    ORDER_SELECT,
    { eq: { customer_id: customerId }, order: 'created_at', ascending: false },
    'pedidos del cliente',
  );
  return rows.map(mapOrder);
}

export async function getOrdersForSeller(profileId) {
  const seller = await selectSingle('sellers', 'id', { eq: { profile_id: profileId } }, 'vendedor');
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .or(`seller_id.eq.${seller.id},seller_id.is.null`)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error, 'pedidos del vendedor');
  return (data ?? []).map(mapOrder);
}

export async function getOrderDetails(orderId) {
  const rows = await selectMany(
    'order_details',
    `
      id,
      product_id,
      quantity,
      unit_price,
      products ( name, sku )
    `,
    { eq: { order_id: orderId } },
    'detalle de pedido',
  );

  return rows.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.products?.name ?? null,
    sku: row.products?.sku ?? null,
    quantity: row.quantity,
    unit_price: Number(row.unit_price),
  }));
}

export async function createOrderFromItems({ profileId, items }) {
  if (!items?.length) {
    throw new Error('El pedido debe incluir al menos un producto');
  }

  const customerId = await getCustomerIdByProfileId(profileId);
  const pendingStatusId = await getStatusIdByCode('pending');
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const order = await insertOne(
    'orders',
    {
      order_number: orderNumber,
      customer_id: customerId,
      status_id: pendingStatusId,
      subtotal,
      total_amount: subtotal,
    },
    ORDER_SELECT,
    'crear pedido',
  );

  const details = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));

  await insertMany('order_details', details, 'id', 'crear detalle de pedido');
  return mapOrder(order);
}

export async function assignOrderToSeller(orderId, sellerId) {
  const row = await updateOne(
    'orders',
    orderId,
    { seller_id: sellerId },
    ORDER_SELECT,
    'asignar vendedor al pedido',
  );
  return mapOrder(row);
}

export async function updateOrderStatus(orderId, statusCode) {
  const statusId = await getStatusIdByCode(statusCode);
  const row = await updateOne(
    'orders',
    orderId,
    { status_id: statusId },
    ORDER_SELECT,
    'actualizar estado de pedido',
  );
  return mapOrder(row);
}
