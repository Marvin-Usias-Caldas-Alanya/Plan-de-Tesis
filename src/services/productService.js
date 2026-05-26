import {
  deleteOne,
  getSupabaseClient,
  handleSupabaseError,
  insertOne,
  selectSingle,
  updateOne,
} from './baseService';
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
} from './categoryService';

export {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};

const PRODUCT_SELECT = `
  id,
  sku,
  name,
  description,
  price,
  stock,
  is_active,
  category_id,
  created_at,
  updated_at,
  product_categories ( id, name, slug ),
  product_images ( image_url, is_primary )
`;

export function mapProduct(row) {
  if (!row) return null;

  const primaryImage =
    row.product_images?.find((img) => img.is_primary) ?? row.product_images?.[0];

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stock: Number(row.stock),
    is_active: row.is_active,
    category_id: row.category_id,
    category: row.product_categories?.name ?? null,
    category_slug: row.product_categories?.slug ?? null,
    image_url: primaryImage?.image_url ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function queryProducts({ activeOnly, categoryId, search }) {
  let query = getSupabaseClient().from('products').select(PRODUCT_SELECT).order('name');

  if (activeOnly) query = query.eq('is_active', true);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search?.trim()) query = query.ilike('name', `%${search.trim()}%`);

  const { data, error } = await query;
  if (error) handleSupabaseError(error, 'listar productos');
  return (data ?? []).map(mapProduct);
}

export async function getActiveProducts(filters = {}) {
  return queryProducts({ ...filters, activeOnly: true });
}

export async function getAllProducts(filters = {}) {
  return queryProducts({ ...filters, activeOnly: false });
}

export async function getProductById(id) {
  const row = await selectSingle(
    'products',
    PRODUCT_SELECT,
    { eq: { id } },
    'obtener producto',
  );
  return mapProduct(row);
}

export async function createProduct(productData) {
  const row = await insertOne('products', productData, PRODUCT_SELECT, 'crear producto');
  return mapProduct(row);
}

export async function updateProduct(id, productData) {
  const row = await updateOne('products', id, productData, PRODUCT_SELECT, 'actualizar producto');
  return mapProduct(row);
}

export async function deleteProduct(id) {
  return deleteOne('products', id, 'eliminar producto');
}

export async function decreaseStock(id, quantity) {
  if (quantity <= 0) {
    throw new Error('La cantidad debe ser mayor a cero');
  }
  const product = await getProductById(id);
  const newStock = Math.max(0, product.stock - quantity);
  return updateProduct(id, { stock: newStock });
}
