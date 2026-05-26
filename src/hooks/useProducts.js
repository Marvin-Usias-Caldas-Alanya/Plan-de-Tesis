import { useCallback, useEffect, useState } from 'react';
import {
  getActiveProducts,
  getAllProducts,
  getProductById,
  getProductCategories,
} from '../services/productService';

/**
 * Hook para listado de catálogo con filtros y recarga.
 * @param {{ categoryId?: string, search?: string, includeInactive?: boolean }} options
 */
export function useProducts(options = {}) {
  const { categoryId, search, includeInactive = false } = options;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetcher = includeInactive ? getAllProducts : getActiveProducts;
      const data = await fetcher({
        categoryId: categoryId || undefined,
        search: search || undefined,
      });
      setProducts(data);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, search, includeInactive]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getProductCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    products,
    categories,
    loading,
    error,
    refreshProducts,
  };
}

/**
 * Hook para detalle de un solo producto.
 */
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { product, loading, error, refresh };
}
