import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
} from '../../services/categoryService';

describe('categoryService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista categorías activas', async () => {
    const builder = createQueryBuilder({
      data: [{ id: 'c1', name: 'Proteínas', is_active: true }],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ product_categories: () => builder }));

    const list = await getProductCategories();
    expect(builder.eq).toHaveBeenCalledWith('is_active', true);
    expect(list[0].name).toBe('Proteínas');
  });

  it('lista todas si activeOnly es false', async () => {
    const builder = createQueryBuilder({ data: [], error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ product_categories: () => builder }));
    await getProductCategories({ activeOnly: false });
    expect(builder.eq).not.toHaveBeenCalled();
  });

  it('crea, actualiza y elimina categoría', async () => {
    const row = { id: 'c1', name: 'Vitaminas', slug: 'vitaminas' };
    const createB = createQueryBuilder({ data: row, error: null });
    const updateB = createQueryBuilder({ data: { ...row, name: 'Vits' }, error: null });
    const deleteB = createQueryBuilder({ data: null, error: null });

    let calls = 0;
    mockFrom.mockImplementation(() => {
      calls += 1;
      if (calls === 1) return createB;
      if (calls === 2) return updateB;
      return deleteB;
    });

    await expect(createProductCategory({ name: 'Vitaminas' })).resolves.toMatchObject(row);
    await expect(updateProductCategory('c1', { name: 'Vits' })).resolves.toMatchObject({
      name: 'Vits',
    });
    await expect(deleteProductCategory('c1')).resolves.toBeUndefined();
  });

  it('propaga error al crear', async () => {
    const builder = createQueryBuilder({ data: null, error: { message: 'duplicate' } });
    mockFrom.mockImplementation(createSupabaseFromMock({ product_categories: () => builder }));
    await expect(createProductCategory({ name: 'X' })).rejects.toThrow(/duplicate/);
  });
});
