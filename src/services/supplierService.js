import { insertOne, selectMany } from './baseService';

const SUPPLIER_SELECT = 'id, name, email, phone, is_active, created_at, updated_at';

export async function getSuppliers() {
  return selectMany('suppliers', SUPPLIER_SELECT, { order: 'name' }, 'listar proveedores');
}

export async function createSupplier({ name, email, phone }) {
  return insertOne(
    'suppliers',
    { name, email, phone },
    'id, name, email, phone, is_active',
    'crear proveedor',
  );
}
