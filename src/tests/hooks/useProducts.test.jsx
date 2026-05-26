import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProducts } from '../../hooks/useProducts';

vi.mock('../../services/productService.js', () => ({
  getActiveProducts: vi.fn(),
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductCategories: vi.fn(),
}));

import * as productService from '../../services/productService';
import { SAMPLE_PRODUCT } from '../helpers/mockData';

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productService.getActiveProducts.mockResolvedValue([SAMPLE_PRODUCT]);
    productService.getProductCategories.mockResolvedValue([
      { id: 'cat-1', name: 'Proteínas' },
    ]);
  });

  it('carga productos activos y categorías', async () => {
    const { result } = renderHook(() => useProducts({ search: 'whey' }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Proteínas');
    expect(productService.getActiveProducts).toHaveBeenCalledWith({
      categoryId: undefined,
      search: 'whey',
    });
  });

  it('maneja error de carga', async () => {
    productService.getActiveProducts.mockRejectedValue(new Error('Sin red'));
    const { result } = renderHook(() => useProducts());

    await waitFor(() => expect(result.current.error).toBe('Sin red'));
    expect(result.current.products).toEqual([]);
  });

  it('includeInactive usa getAllProducts', async () => {
    productService.getAllProducts.mockResolvedValue([]);
    const { result } = renderHook(() => useProducts({ includeInactive: true }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(productService.getAllProducts).toHaveBeenCalled();
  });

  it('refreshProducts recarga', async () => {
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    productService.getActiveProducts.mockResolvedValue([]);
    await result.current.refreshProducts();
    await waitFor(() => expect(result.current.products).toEqual([]));
  });
});
