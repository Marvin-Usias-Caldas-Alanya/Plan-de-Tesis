import { insertOne, selectMany } from './baseService';

export async function getAllPayments() {
  const rows = await selectMany(
    'payments',
    `
      id,
      order_id,
      amount,
      status,
      paid_at,
      created_at,
      payment_methods ( code, name ),
      orders ( order_number )
    `,
    { order: 'created_at', ascending: false },
    'listar pagos',
  );

  return rows.map((row) => ({
    id: row.id,
    order_id: row.order_id,
    order_number: row.orders?.order_number ?? null,
    amount: Number(row.amount),
    status: row.status,
    payment_method: row.payment_methods?.name ?? null,
    paid_at: row.paid_at,
    created_at: row.created_at,
  }));
}

export async function getPaymentMethods() {
  return selectMany(
    'payment_methods',
    'id, code, name, is_active',
    { order: 'name' },
    'métodos de pago',
  );
}

export async function getPromotions() {
  return selectMany(
    'promotions',
    'id, code, name, discount_type, discount_value, is_active, created_at',
    { order: 'created_at', ascending: false },
    'listar promociones',
  );
}

export async function getCoupons() {
  const rows = await selectMany(
    'coupons',
    `
      id,
      code,
      max_uses,
      used_count,
      is_active,
      created_at,
      promotions ( name )
    `,
    { order: 'created_at', ascending: false },
    'listar cupones',
  );

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    max_uses: row.max_uses,
    used_count: row.used_count,
    is_active: row.is_active,
    promotion_name: row.promotions?.name ?? null,
    created_at: row.created_at,
  }));
}

export async function createPromotion(payload) {
  return insertOne('promotions', payload, '*', 'crear promoción');
}

export async function createCoupon(payload) {
  return insertOne('coupons', payload, '*', 'crear cupón');
}
