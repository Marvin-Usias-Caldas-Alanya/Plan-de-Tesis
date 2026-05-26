import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';
import { RAW_PRODUCT_ROW } from '../helpers/mockData';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import {
  createProduct,
  deleteProduct,
  getActiveProducts,
  mapProduct,
  updateProduct,
} from '../../services/productService';

describe('productService — CRUD y stock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtener productos activos', () => {
    it('lista y mapea productos activos', async () => {
      const builder = createQueryBuilder({ data: [RAW_PRODUCT_ROW], error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      const list = await getActiveProducts();
      expect(builder.eq).toHaveBeenCalledWith('is_active', true);
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('Whey Protein Gold');
      expect(list[0].category).toBe('Proteínas');
    });

    it('propaga error con contexto', async () => {
      const builder = createQueryBuilder({
        data: null,
        error: { message: 'permission denied', code: '42501' },
      });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      await expect(getActiveProducts()).rejects.toMatchObject({
        message: expect.stringContaining('permission denied'),
      });
    });
  });

  describe('crear producto', () => {
    it('inserta y devuelve producto mapeado', async () => {
      const payload = { name: 'Nuevo', price: 100, stock: 5, category_id: 'cat-1', is_active: true };
      const builder = createQueryBuilder({ data: RAW_PRODUCT_ROW, error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      const created = await createProduct(payload);
      expect(builder.insert).toHaveBeenCalledWith(payload);
      expect(created.id).toBe('prod-1');
    });
  });

  describe('editar producto', () => {
    it('actualiza por id', async () => {
      const patch = { price: 799, stock: 8 };
      const updated = { ...RAW_PRODUCT_ROW, price: 799, stock: 8 };
      const builder = createQueryBuilder({ data: updated, error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      const result = await updateProduct('prod-1', patch);
      expect(builder.update).toHaveBeenCalledWith(patch);
      expect(result.price).toBe(799);
    });
  });

  describe('desactivar producto', () => {
    it('actualiza is_active a false', async () => {
      const inactive = { ...RAW_PRODUCT_ROW, is_active: false };
      const builder = createQueryBuilder({ data: inactive, error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      const result = await updateProduct('prod-1', { is_active: false });
      expect(result.is_active).toBe(false);
    });
  });

  describe('actualizar stock', () => {
    it('mapProduct normaliza números', () => {
      const mapped = mapProduct(RAW_PRODUCT_ROW);
      expect(mapped.stock).toBe(10);
      expect(mapped.price).toBe(899);
    });

    it('decreaseStock vía updateProduct reduce unidades', async () => {
      const { decreaseStock } = await import('../../services/productService');
      const lowStock = { ...RAW_PRODUCT_ROW, stock: 8 };
      let call = 0;
      mockFrom.mockImplementation(
        createSupabaseFromMock({
          products: () => {
            call += 1;
            if (call === 1) {
              return createQueryBuilder({ data: RAW_PRODUCT_ROW, error: null });
            }
            return createQueryBuilder({ data: lowStock, error: null });
          },
        }),
      );

      const result = await decreaseStock('prod-1', 2);
      expect(result.stock).toBe(8);
    });
  });

  describe('eliminar producto', () => {
    it('elimina por id', async () => {
      const builder = createQueryBuilder({ data: null, error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ products: () => builder }));

      await deleteProduct('prod-1');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('id', 'prod-1');
    });
  });
});
