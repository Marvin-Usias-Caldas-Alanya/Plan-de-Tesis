import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import { getCustomerIdByProfileId, getProfileById, mapProfile } from '../../services/profileService';

describe('profileService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mapProfile y getProfileById', async () => {
    const row = {
      id: 'u1',
      email: 'a@t.com',
      full_name: 'Ana',
      roles: { code: 'admin', name: 'Admin' },
    };
    expect(mapProfile(null)).toBeNull();

    const builder = createQueryBuilder({ data: row, error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ profiles: () => builder }));

    const profile = await getProfileById('u1');
    expect(profile.role_code).toBe('admin');
  });

  it('getCustomerIdByProfileId', async () => {
    const builder = createQueryBuilder({ data: { id: 'cust-1' }, error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ customers: () => builder }));
    await expect(getCustomerIdByProfileId('u1')).resolves.toBe('cust-1');
  });
});
