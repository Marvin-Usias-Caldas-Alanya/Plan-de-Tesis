import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/profileService.js', () => ({
  getCustomerIdByProfileId: vi.fn().mockResolvedValue('cust-1'),
}));

import { getActiveCartByProfileId } from '../../services/cartService';

describe('cartService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('devuelve el carrito activo cuando existe uno', async () => {
    const builder = createQueryBuilder({
      data: [{ id: 'cart-1', customer_id: 'cust-1', status: 'active' }],
      error: null,
    });
    mockFrom.mockImplementation(() => builder);

    const cart = await getActiveCartByProfileId('prof-1');
    expect(cart.id).toBe('cart-1');
  });

  it('devuelve null si no hay carrito activo', async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    mockFrom.mockImplementation(() => builder);

    await expect(getActiveCartByProfileId('prof-1')).resolves.toBeNull();
  });
});
