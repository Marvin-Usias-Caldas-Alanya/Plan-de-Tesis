import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/profileService.js', () => ({
  getCustomerIdByProfileId: vi.fn().mockResolvedValue('cust-1'),
}));

import { getOrdersByCustomerProfile, mapOrder } from '../../services/orderService';

const ORDER_ROW = {
  id: 'o1',
  order_number: 'ORD-1',
  subtotal: 50,
  total_amount: 55,
  order_statuses: { code: 'pending', name: 'Pendiente' },
  customers: { profiles: { full_name: 'Ana', email: 'a@t.com' } },
};

describe('orderService — cliente', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getOrdersByCustomerProfile', async () => {
    const builder = createQueryBuilder({ data: [ORDER_ROW], error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ orders: () => builder }));

    const orders = await getOrdersByCustomerProfile('prof-1');
    expect(orders).toHaveLength(1);
    expect(mapOrder(ORDER_ROW).customer_email).toBe('a@t.com');
  });
});
