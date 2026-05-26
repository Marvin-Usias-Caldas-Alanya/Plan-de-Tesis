import {
  getSupabaseClient,
  handleSupabaseError,
  insertOne,
  selectMany,
  selectMaybeSingle,
} from './baseService';
import { getCustomerIdByProfileId } from './profileService';

export async function getActiveCartByProfileId(profileId) {
  const customerId = await getCustomerIdByProfileId(profileId);
  return selectMaybeSingle(
    'carts',
    'id, customer_id, status, created_at, updated_at',
    { eq: { customer_id: customerId, status: 'active' } },
    'obtener carrito activo',
  );
}

export async function getCartItems(cartId) {
  const rows = await selectMany(
    'cart_items',
    `
      id,
      cart_id,
      product_id,
      quantity,
      unit_price,
      products ( name, sku, price, stock )
    `,
    { eq: { cart_id: cartId } },
    'ítems del carrito',
  );

  return rows.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.products?.name ?? null,
    sku: row.products?.sku ?? null,
    quantity: row.quantity,
    unit_price: Number(row.unit_price ?? row.products?.price ?? 0),
    stock: row.products?.stock ?? 0,
  }));
}

export async function createCartForProfile(profileId) {
  const customerId = await getCustomerIdByProfileId(profileId);
  return insertOne(
    'carts',
    { customer_id: customerId, status: 'active' },
    'id, customer_id, status',
    'crear carrito',
  );
}

export async function addItemToCart(cartId, { productId, quantity, unitPrice }) {
  return insertOne(
    'cart_items',
    {
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price: unitPrice,
    },
    'id, cart_id, product_id, quantity, unit_price',
    'agregar ítem al carrito',
  );
}

export async function clearCartItems(cartId) {
  const { error } = await getSupabaseClient().from('cart_items').delete().eq('cart_id', cartId);
  if (error) handleSupabaseError(error, 'vaciar carrito');
}
