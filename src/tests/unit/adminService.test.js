import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCountBuilder, createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import { getAllConversations, getDashboardStats } from '../../services/adminService';

describe('adminService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getDashboardStats agrega métricas', async () => {
    mockFrom.mockImplementation(() => createCountBuilder(5));

    const stats = await getDashboardStats();
    expect(stats.products).toBe(5);
    expect(stats.activeProducts).toBe(5);
    expect(stats.lowStock).toBe(5);
    expect(stats.pendingOrders).toBe(5);
    expect(stats.users).toBe(5);
  });

  it('getDashboardStats propaga error de stock bajo', async () => {
    let productCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'products') {
        productCalls += 1;
        if (productCalls >= 3) {
          return createQueryBuilder({ data: null, error: { message: 'stock count fail' } }, { count: 0 });
        }
      }
      return createCountBuilder(1);
    });
    await expect(getDashboardStats()).rejects.toThrow(/stock count fail/);
  });

  it('getAllConversations lista conversaciones', async () => {
    const builder = createQueryBuilder({
      data: [{ id: 'c1', customer_name: 'Ana', status: 'bot' }],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ conversations: () => builder }));
    const list = await getAllConversations();
    expect(list[0].customer_name).toBe('Ana');
  });
});
