import {
  insertOne,
  selectMany,
  selectSingle,
  updateOne,
} from './baseService';
import { normalizeProfileRow, resolveProfileName } from '../utils/profileFields';

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

const PROFILE_LEGACY_SELECTS = [
  'id, email, full_name, phone, avatar_url, is_active, role, created_at, updated_at',
  'id, email, nombre, phone, is_active, role, created_at, updated_at',
  'id, email, name, is_active, role, created_at, updated_at',
  'id, email, role, created_at, updated_at',
];

export function mapProfile(row) {
  const normalized = normalizeProfileRow(row);
  if (!normalized) return null;
  return {
    id: normalized.id,
    email: normalized.email,
    full_name: normalized.full_name,
    phone: normalized.phone ?? null,
    avatar_url: normalized.avatar_url ?? null,
    is_active: normalized.is_active ?? true,
    role_id: normalized.role_id ?? null,
    role_code: normalized.roles?.code ?? normalized.role ?? null,
    role_name: normalized.roles?.name ?? normalized.role ?? null,
    created_at: normalized.created_at,
    updated_at: normalized.updated_at,
  };
}

async function fetchProfileRow(profileId, select, context) {
  return selectSingle('profiles', select, { eq: { id: profileId } }, context);
}

export async function getProfileById(profileId) {
  try {
    const row = await fetchProfileRow(profileId, PROFILE_SELECT, 'obtener perfil');
    return mapProfile(row);
  } catch {
    for (const select of PROFILE_LEGACY_SELECTS) {
      try {
        const row = await fetchProfileRow(profileId, select, 'obtener perfil legacy');
        return mapProfile(row);
      } catch {
        /* siguiente variante */
      }
    }
    throw new Error('[obtener perfil] No se pudo leer el perfil del usuario');
  }
}

export async function getAllProfiles() {
  try {
    const rows = await selectMany(
      'profiles',
      PROFILE_SELECT,
      { order: 'email' },
      'listar perfiles',
    );
    return rows.map(mapProfile);
  } catch {
    const rows = await selectMany(
      'profiles',
      'id, email, role, created_at, updated_at',
      { order: 'email' },
      'listar perfiles legacy',
    );
    return rows.map(mapProfile);
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

  try {
    const row = await updateOne(
      'profiles',
      profileId,
      payload,
      PROFILE_SELECT,
      'actualizar perfil',
    );
    return mapProfile(row);
  } catch {
    const legacyPayload = {};
    if (full_name !== undefined) {
      legacyPayload.nombre = full_name;
      legacyPayload.name = full_name;
    }
    if (phone !== undefined) legacyPayload.phone = phone;
    const row = await updateOne(
      'profiles',
      profileId,
      legacyPayload,
      'id, email, nombre, name, phone, role, created_at, updated_at',
      'actualizar perfil legacy',
    );
    return mapProfile(row);
  }
}

async function ensureRoleEntities(profileId, roleCode) {
  if (roleCode === 'seller') {
    const rows = await selectMany(
      'sellers',
      'id',
      { eq: { profile_id: profileId } },
      'verificar vendedor',
    );
    if (!rows.length) {
      await insertOne(
        'sellers',
        { profile_id: profileId, is_available: true },
        'id, profile_id',
        'crear vendedor',
      );
    }
  }

  if (roleCode === 'customer') {
    await getCustomerIdByProfileId(profileId);
  }
}

export async function getSellerAvailability(profileId) {
  const rows = await selectMany(
    'sellers',
    'is_available',
    { eq: { profile_id: profileId } },
    'disponibilidad del vendedor',
  );
  if (!rows.length) return true;
  return rows[0].is_available;
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
  try {
    const row = await updateOne(
      'profiles',
      profileId,
      { is_active: isActive },
      PROFILE_SELECT,
      'activar/desactivar perfil',
    );
    return mapProfile(row);
  } catch {
    const row = await updateOne(
      'profiles',
      profileId,
      { is_active: isActive },
      'id, email, role, is_active',
      'activar/desactivar perfil legacy',
    );
    return mapProfile(row);
  }
}

export async function getCustomerIdByProfileId(profileId) {
  const rows = await selectMany(
    'customers',
    'id, created_at',
    { eq: { profile_id: profileId }, order: 'created_at', ascending: false },
    'obtener cliente por perfil',
  );

  if (!rows.length) {
    const created = await createCustomerForProfile(profileId);
    return created.id;
  }

  return rows[0].id;
}

export async function getSellerIdByProfileId(profileId) {
  const rows = await selectMany(
    'sellers',
    'id',
    { eq: { profile_id: profileId } },
    'obtener vendedor por perfil',
  );
  if (!rows.length) {
    throw new Error('[obtener vendedor por perfil] No existe fila en sellers');
  }
  return rows[0].id;
}

export async function getAllCustomers() {
  const rows = await selectMany(
    'customers',
    `
      id,
      document_id,
      loyalty_points,
      created_at,
      profiles ( id, email, role )
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
    full_name: resolveProfileName(row.profiles),
    is_active: row.profiles?.is_active ?? true,
    role_code: row.profiles?.role ?? null,
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
      profiles ( id, email, role )
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
    full_name: resolveProfileName(row.profiles),
    is_active: row.profiles?.is_active ?? true,
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
