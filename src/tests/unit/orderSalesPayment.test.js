import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/profileService.js', () => ({
  getCustomerIdByProfileId: vi.fn().mockResolvedValue('cust-1'),
}));

import { getAllOrders, getOrderStatuses, mapOrder } from '../../services/orderService';
import { getAllSales, getSaleDetails, mapSale } from '../../services/salesService';
import { getAllPayments, getCoupons, getPaymentMethods } from '../../services/paymentService';

const ORDER_ROW = {
  id: 'o1',
  order_number: 'ORD-1',
  customer_id: 'cust-1',
  subtotal: 100,
  total_amount: 110,
  order_statuses: { code: 'pending', name: 'Pendiente' },
  customers: { profiles: { full_name: 'Ana', email: 'a@t.com' } },
};

describe('orderService, salesService, paymentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mapOrder y getAllOrders', async () => {
    expect(mapOrder(null)).toBeNull();
    const mapped = mapOrder(ORDER_ROW);
    expect(mapped.status_code).toBe('pending');
    expect(mapped.customer_name).toBe('Ana');

    const builder = createQueryBuilder({ data: [ORDER_ROW], error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ orders: () => builder }));
    const list = await getAllOrders();
    expect(list).toHaveLength(1);
  });

  it('getOrderStatuses', async () => {
    const builder = createQueryBuilder({
      data: [{ id: 's1', code: 'pending', name: 'Pendiente' }],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ order_statuses: () => builder }));
    const statuses = await getOrderStatuses();
    expect(statuses[0].code).toBe('pending');
  });

  it('getAllOrders propaga error', async () => {
    const builder = createQueryBuilder({ data: null, error: { message: 'orders fail' } });
    mockFrom.mockImplementation(createSupabaseFromMock({ orders: () => builder }));
    await expect(getAllOrders()).rejects.toThrow(/orders fail/);
  });

  it('sales: mapSale, listado y detalle', async () => {
    const saleRow = {
      id: 's1',
      sale_number: 'V-1',
      total_amount: 200,
      customers: { profiles: { full_name: 'Bob', email: 'b@t.com' } },
    };
    expect(mapSale(null)).toBeNull();
    expect(mapSale(saleRow).customer_name).toBe('Bob');

    const listB = createQueryBuilder({ data: [saleRow], error: null });
    const detB = createQueryBuilder({
      data: [{ id: 'd1', quantity: 2, unit_price: 50, products: { name: 'Whey', sku: 'W1' } }],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'sales') return listB;
      if (table === 'sale_details') return detB;
      return createQueryBuilder({ data: [], error: null });
    });

    const sales = await getAllSales();
    expect(sales).toHaveLength(1);
    const details = await getSaleDetails('s1');
    expect(details[0].product_name).toBe('Whey');
  });

  it('payments: listados y cupones', async () => {
    const payB = createQueryBuilder({
      data: [
        {
          id: 'p1',
          amount: 110,
          status: 'paid',
          orders: { order_number: 'ORD-1' },
          payment_methods: { name: 'Tarjeta' },
        },
      ],
      error: null,
    });
    const methodsB = createQueryBuilder({
      data: [{ id: 'm1', code: 'card', name: 'Tarjeta' }],
      error: null,
    });
    const couponsB = createQueryBuilder({
      data: [{ id: 'c1', code: 'SAVE10', promotions: { name: 'Promo' } }],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'payments') return payB;
      if (table === 'payment_methods') return methodsB;
      if (table === 'coupons') return couponsB;
      return createQueryBuilder({ data: [], error: null });
    });

    const payments = await getAllPayments();
    expect(payments[0].payment_method).toBe('Tarjeta');
    const methods = await getPaymentMethods();
    expect(methods[0].code).toBe('card');
    const coupons = await getCoupons();
    expect(coupons[0].promotion_name).toBe('Promo');
  });
});
