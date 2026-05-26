import { selectMany } from './baseService';

export async function getRoles() {
  return selectMany('roles', 'id, code, name, description', { order: 'code' }, 'listar roles');
}

export async function getRoleByCode(code) {
  const rows = await selectMany('roles', 'id, code, name', { eq: { code } }, 'obtener rol');
  return rows[0] ?? null;
}
