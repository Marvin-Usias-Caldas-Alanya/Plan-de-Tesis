import {
  deleteOne,
  getSupabaseClient,
  handleSupabaseError,
  insertOne,
  selectMany,
  selectMaybeSingle,
  updateOne,
  updateWhere,
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

export async function getOrCreateActiveCart(profileId) {
  const existing = await getActiveCartByProfileId(profileId);
  if (existing) return existing;
  return createCartForProfile(profileId);
}

export async function getCartItems(cartId) {
  const rows = await selectMany(
    'cart_items',
    `
      id,
      cart_id,
      product_id,
      quantity,
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
    unit_price: Number(row.products?.price ?? 0),
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

export async function upsertCartItem(cartId, { productId, quantity }) {
  const existing = await selectMaybeSingle(
    'cart_items',
    'id, quantity',
    { eq: { cart_id: cartId, product_id: productId } },
    'buscar ítem en carrito',
  );

  if (existing) {
    return updateOne(
      'cart_items',
      existing.id,
      { quantity: existing.quantity + quantity },
      'id, cart_id, product_id, quantity',
      'actualizar ítem del carrito',
    );
  }

  return insertOne(
    'cart_items',
    { cart_id: cartId, product_id: productId, quantity },
    'id, cart_id, product_id, quantity',
    'agregar ítem al carrito',
  );
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  if (quantity <= 0) {
    await removeCartItem(cartItemId);
    return null;
  }
  return updateOne(
    'cart_items',
    cartItemId,
    { quantity },
    'id, quantity',
    'actualizar cantidad del carrito',
  );
}

export async function removeCartItem(cartItemId) {
  await deleteOne('cart_items', cartItemId, 'eliminar ítem del carrito');
}

export async function clearCartItems(cartId) {
  const { error } = await getSupabaseClient().from('cart_items').delete().eq('cart_id', cartId);
  if (error) handleSupabaseError(error, 'vaciar carrito');
}

export async function markCartConverted(cartId) {
  await updateWhere('carts', { id: cartId }, { status: 'converted' }, 'convertir carrito');
}
