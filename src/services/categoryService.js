import { deleteOne, insertOne, selectMany, updateOne } from './baseService';

const CATEGORY_SELECT = 'id, name, slug, description, is_active, created_at, updated_at';

export async function getProductCategories({ activeOnly = true } = {}) {
  const eq = activeOnly ? { is_active: true } : {};
  return selectMany(
    'product_categories',
    CATEGORY_SELECT,
    { eq, order: 'name' },
    'listar categorías',
  );
}

export async function createProductCategory(payload) {
  return insertOne(
    'product_categories',
    payload,
    'id, name, slug, description, is_active',
    'crear categoría',
  );
}

export async function updateProductCategory(id, payload) {
  return updateOne(
    'product_categories',
    id,
    payload,
    'id, name, slug, description, is_active',
    'actualizar categoría',
  );
}

export async function deleteProductCategory(id) {
  return deleteOne('product_categories', id, 'eliminar categoría');
}
