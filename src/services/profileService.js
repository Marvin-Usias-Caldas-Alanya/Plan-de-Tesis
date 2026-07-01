import {
  insertOne,
  selectMany,
  selectMaybeSingle,
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

const PROFILE_LEGACY_SELECT = `
  id,
  email,
  full_name,
  phone,
  avatar_url,
  is_active,
  role,
  created_at,
  updated_at
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
    role_id: row.role_id ?? null,
    role_code: row.roles?.code ?? row.role ?? null,
    role_name: row.roles?.name ?? row.role ?? null,
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
  try {
    const row = await selectSingle(
      'profiles',
      PROFILE_SELECT,
      { eq: { id: profileId } },
      'obtener perfil',
    );
    return mapProfile(row);
  } catch {
    const row = await selectSingle(
      'profiles',
      PROFILE_LEGACY_SELECT,
      { eq: { id: profileId } },
      'obtener perfil legacy',
    );
    return mapProfile(row);
  }
}

export async function updateProfileRole(profileId, roleId) {
  const row = await updateOne(
    'profiles',
    profileId,
    { role_id: roleId },
    PROFILE_SELECT,
    'actualizar rol de perfil',
  );
  const profile = mapProfile(row);
  await ensureRoleEntities(profileId, profile.role_code);
  return profile;
}

export async function updateProfile(profileId, { full_name, phone }) {
  const payload = {};
  if (full_name !== undefined) payload.full_name = full_name;
  if (phone !== undefined) payload.phone = phone;

  const row = await updateOne(
    'profiles',
    profileId,
    payload,
    PROFILE_SELECT,
    'actualizar perfil',
  );
  return mapProfile(row);
}

async function ensureRoleEntities(profileId, roleCode) {
  if (roleCode === 'seller') {
    const existing = await selectMaybeSingle(
      'sellers',
      'id',
      { eq: { profile_id: profileId } },
      'verificar vendedor',
    );
    if (!existing) {
      await insertOne(
        'sellers',
        { profile_id: profileId, is_available: true },
        'id, profile_id',
        'crear vendedor',
      );
    }
  }

  if (roleCode === 'customer') {
    const existing = await selectMaybeSingle(
      'customers',
      'id',
      { eq: { profile_id: profileId } },
      'verificar cliente',
    );
    if (!existing) {
      await createCustomerForProfile(profileId);
    }
  }
}

export async function getSellerAvailability(profileId) {
  const row = await selectSingle(
    'sellers',
    'is_available',
    { eq: { profile_id: profileId } },
    'disponibilidad del vendedor',
  );
  return row.is_available;
}

export async function updateSellerAvailability(profileId, isAvailable) {
  const sellerId = await getSellerIdByProfileId(profileId);
  await updateOne(
    'sellers',
    sellerId,
    { is_available: isAvailable },
    'id, is_available',
    'actualizar disponibilidad',
  );
  return isAvailable;
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
  const row = await selectMaybeSingle(
    'customers',
    'id',
    { eq: { profile_id: profileId } },
    'obtener cliente por perfil',
  );
  if (row?.id) return row.id;

  const created = await createCustomerForProfile(profileId);
  return created.id;
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
