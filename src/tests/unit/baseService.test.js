import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCountBuilder, createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());
const mockGetUser = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: {
    from: mockFrom,
    auth: { getUser: mockGetUser },
  },
}));

import {
  countRows,
  deleteOne,
  ensureData,
  getCurrentUserId,
  handleSupabaseError,
  insertMany,
  insertOne,
  isAdmin,
  isCustomer,
  isSeller,
  selectMany,
  selectMaybeSingle,
  selectSingle,
  updateOne,
  updateWhere,
} from '../../services/baseService';

describe('baseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleSupabaseError y ensureData', () => {
    it('lanza Error con contexto y detalle', () => {
      expect(() =>
        handleSupabaseError({ message: 'fallo', details: 'det', hint: 'hint' }, 'test'),
      ).toThrow(/\[test\] fallo/);
    });

    it('no lanza si error es null', () => {
      expect(() => handleSupabaseError(null, 'test')).not.toThrow();
    });

    it('ensureData rechaza null/undefined', () => {
      expect(() => ensureData(null)).toThrow('No se recibieron datos');
      expect(ensureData({ id: 1 })).toEqual({ id: 1 });
    });
  });

  describe('getCurrentUserId y roles', () => {
    it('devuelve id de usuario autenticado', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null });
      await expect(getCurrentUserId()).resolves.toBe('u-1');
    });

    it('devuelve null sin sesión', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      await expect(getCurrentUserId()).resolves.toBeNull();
    });

    it('isAdmin true para rol admin', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null });
      const builder = createQueryBuilder({
        data: { roles: { code: 'admin' } },
        error: null,
      });
      mockFrom.mockImplementation(createSupabaseFromMock({ profiles: () => builder }));
      await expect(isAdmin()).resolves.toBe(true);
      await expect(isSeller()).resolves.toBe(false);
      await expect(isCustomer()).resolves.toBe(false);
    });

    it('isCustomer true para rol customer', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null });
      const builder = createQueryBuilder({
        data: { roles: { code: 'customer' } },
        error: null,
      });
      mockFrom.mockImplementation(createSupabaseFromMock({ profiles: () => builder }));
      await expect(isCustomer()).resolves.toBe(true);
    });
  });

  describe('CRUD helpers', () => {
    it('selectMany con filtros ilike y limit', async () => {
      const builder = createQueryBuilder({ data: [{ id: 1 }], error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      const rows = await selectMany('products', 'id', {
        eq: { is_active: true },
        ilike: { name: '%whey%' },
        order: 'name',
        limit: 10,
      });
      expect(rows).toHaveLength(1);
      expect(builder.ilike).toHaveBeenCalled();
      expect(builder.limit).toHaveBeenCalledWith(10);
    });

    it('selectMany propaga error', async () => {
      const builder = createQueryBuilder({ data: null, error: { message: 'db error' } });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));
      await expect(selectMany('products', 'id')).rejects.toThrow(/db error/);
    });

    it('selectSingle y selectMaybeSingle', async () => {
      const single = createQueryBuilder({ data: { id: 'a' }, error: null });
      const maybe = createQueryBuilder({ data: null, error: null });
      mockFrom.mockImplementation(
        createSupabaseFromMock({
          products: () => single,
          categories: () => maybe,
        }),
      );
      await expect(selectSingle('products', 'id', { eq: { id: 'a' } })).resolves.toEqual({
        id: 'a',
      });
      await expect(selectMaybeSingle('categories', 'id')).resolves.toBeNull();
    });

    it('insertOne, insertMany, updateOne, deleteOne', async () => {
      const ins = createQueryBuilder({ data: { id: 'n' }, error: null });
      const insMany = createQueryBuilder({ data: [{ id: 1 }, { id: 2 }], error: null });
      const upd = createQueryBuilder({ data: { id: 'n', name: 'X' }, error: null });
      const del = createQueryBuilder({ data: null, error: null });

      const builders = [ins, insMany, upd, del];
      let call = 0;
      mockFrom.mockImplementation(() => {
        const builder = builders[Math.min(call, builders.length - 1)];
        call += 1;
        return builder;
      });

      await expect(insertOne('products', { name: 'N' })).resolves.toMatchObject({ id: 'n' });
      await expect(insertMany('products', [{}, {}])).resolves.toHaveLength(2);
      await expect(updateOne('products', 'n', { name: 'X' })).resolves.toMatchObject({ name: 'X' });
      await expect(deleteOne('products', 'n')).resolves.toBeUndefined();
    });

    it('updateWhere y countRows', async () => {
      const upd = createQueryBuilder({ data: null, error: null });
      const cnt = createCountBuilder(7);
      mockFrom.mockImplementation(
        createSupabaseFromMock({
          products: () => upd,
          orders: () => cnt,
        }),
      );
      await updateWhere('products', { id: 'p1' }, { stock: 5 });
      await expect(countRows('orders')).resolves.toBe(7);
    });
  });
});
