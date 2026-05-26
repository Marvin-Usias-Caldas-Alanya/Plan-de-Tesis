import {
  insertOne,
  selectMany,
  selectSingle,
  updateOne,
} from './baseService';

const PROFILE_SELECT = `
  id,
  email,
  full_name,
  phone,
  avatar_url,
  is_active,
  role_id,
  created_at,
  updated_at,
  roles ( id, code, name )
`;

export function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    avatar_url: row.avatar_url,
    is_active: row.is_active,
    role_id: row.role_id,
    role_code: row.roles?.code ?? null,
    role_name: row.roles?.name ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAllProfiles() {
  const rows = await selectMany(
    'profiles',
    PROFILE_SELECT,
    { order: 'full_name' },
    'listar perfiles',
  );
  return rows.map(mapProfile);
}

export async function getProfileById(profileId) {
  const row = await selectSingle(
    'profiles',
    PROFILE_SELECT,
    { eq: { id: profileId } },
    'obtener perfil',
  );
  return mapProfile(row);
}

export async function updateProfileRole(profileId, roleId) {
  const row = await updateOne(
    'profiles',
    profileId,
    { role_id: roleId },
    PROFILE_SELECT,
    'actualizar rol de perfil',
  );
  return mapProfile(row);
}

export async function setProfileActive(profileId, isActive) {
  const row = await updateOne(
    'profiles',
    profileId,
    { is_active: isActive },
    PROFILE_SELECT,
    'activar/desactivar perfil',
  );
  return mapProfile(row);
}

export async function getCustomerIdByProfileId(profileId) {
  const row = await selectSingle(
    'customers',
    'id',
    { eq: { profile_id: profileId } },
    'obtener cliente por perfil',
  );
  return row.id;
}

export async function getSellerIdByProfileId(profileId) {
  const row = await selectSingle(
    'sellers',
    'id',
    { eq: { profile_id: profileId } },
    'obtener vendedor por perfil',
  );
  return row.id;
}

export async function getAllCustomers() {
  const rows = await selectMany(
    'customers',
    `
      id,
      document_id,
      loyalty_points,
      created_at,
      profiles ( id, email, full_name, is_active, roles ( code, name ) )
    `,
    { order: 'created_at', ascending: false },
    'listar clientes',
  );

  return rows.map((row) => ({
    id: row.id,
    document_id: row.document_id,
    loyalty_points: row.loyalty_points,
    profile_id: row.profiles?.id,
    email: row.profiles?.email,
    full_name: row.profiles?.full_name,
    is_active: row.profiles?.is_active,
    role_code: row.profiles?.roles?.code,
    created_at: row.created_at,
  }));
}

export async function getAllSellers() {
  const rows = await selectMany(
    'sellers',
    `
      id,
      employee_code,
      is_available,
      created_at,
      profiles ( id, email, full_name, is_active, roles ( code, name ) )
    `,
    { order: 'created_at', ascending: false },
    'listar vendedores',
  );

  return rows.map((row) => ({
    id: row.id,
    employee_code: row.employee_code,
    is_available: row.is_available,
    profile_id: row.profiles?.id,
    email: row.profiles?.email,
    full_name: row.profiles?.full_name,
    is_active: row.profiles?.is_active,
    created_at: row.created_at,
  }));
}

export async function createCustomerForProfile(profileId, documentId = null) {
  return insertOne(
    'customers',
    { profile_id: profileId, document_id: documentId },
    'id, profile_id',
    'crear cliente',
  );
}
