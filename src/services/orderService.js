import {
  getSupabaseClient,
  handleSupabaseError,
  insertMany,
  insertOne,
  selectMany,
  selectSingle,
  updateOne,
} from './baseService';
import {
  clearCartItems,
  getCartItems,
  getOrCreateActiveCart,
  markCartConverted,
} from './cartService';
import { getCustomerIdByProfileId } from './profileService';
import { createPayment } from './paymentService';
import { createSaleFromOrder } from './salesService';
import { decreaseStock } from './productService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

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
    profile_id,
    profiles ( ${PROFILE_NESTED_SELECT} )
  )
`;

export function mapOrder(row) {
  if (!row) return null;
  const profile = row.customers?.profiles;
  return {
    id: row.id,
    order_number: row.order_number,
    customer_id: row.customer_id,
    customer_name: resolveProfileName(profile),
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
  const rows = await selectMany(
    'sellers',
    'id',
    { eq: { profile_id: profileId }, limit: 1 },
    'vendedor',
  );
  const seller = rows[0];
  if (!seller) {
    throw new Error('[pedidos del vendedor] No existe fila en sellers');
  }

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

export async function createOrderFromItems({ profileId, items, statusCode = 'pending' }) {
  if (!items?.length) {
    throw new Error('El pedido debe incluir al menos un producto');
  }

  const customerId = await getCustomerIdByProfileId(profileId);
  const statusId = await getStatusIdByCode(statusCode);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

  const order = await insertOne(
    'orders',
    {
      order_number: orderNumber,
      customer_id: customerId,
      status_id: statusId,
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

async function fulfillDeliveredOrder(orderId) {
  const orderRow = await selectSingle(
    'orders',
    'id, customer_id, total_amount',
    { eq: { id: orderId } },
    'pedido para venta',
  );
  const details = await getOrderDetails(orderId);

  await createSaleFromOrder({
    orderId,
    customerId: orderRow.customer_id,
    totalAmount: Number(orderRow.total_amount),
    items: details,
  });

  for (const line of details) {
    await decreaseStock(line.product_id, line.quantity);
  }
}

export async function completeCheckout({ profileId, paymentMethodCode = 'card' }) {
  const cart = await getOrCreateActiveCart(profileId);
  const items = await getCartItems(cart.id);

  if (!items.length) {
    throw new Error('Tu carrito está vacío');
  }

  for (const item of items) {
    if (item.quantity > item.stock) {
      throw new Error(`Stock insuficiente para ${item.product_name ?? 'un producto'}`);
    }
  }

  const orderItems = items.map((item) => ({
    productId: item.product_id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
  }));

  const order = await createOrderFromItems({ profileId, items: orderItems, statusCode: 'pending' });

  await createPayment({
    orderId: order.id,
    paymentMethodCode,
    amount: order.total_amount,
    status: 'completed',
  });

  const confirmed = await updateOrderStatus(order.id, 'confirmed');

  await clearCartItems(cart.id);
  await markCartConverted(cart.id);

  return confirmed;
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
  const order = mapOrder(row);

  if (statusCode === 'delivered') {
    await fulfillDeliveredOrder(orderId);
  }

  return order;
}
