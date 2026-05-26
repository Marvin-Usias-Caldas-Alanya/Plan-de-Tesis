import { supabase } from './supabaseClient';
import { ROLES } from '../utils/constants';

/**
 * Convierte errores de Supabase en Error legibles con contexto.
 */
export function handleSupabaseError(error, context = 'Supabase') {
  if (!error) return;
  const detail = [error.details, error.hint].filter(Boolean).join(' — ');
  const message = error.message || 'Error desconocido';
  const err = new Error(detail ? `[${context}] ${message} (${detail})` : `[${context}] ${message}`);
  err.code = error.code;
  err.status = error.status;
  err.cause = error;
  throw err;
}

/**
 * Valida que exista respuesta de datos.
 */
export function ensureData(data, message = 'No se recibieron datos de Supabase') {
  if (data === null || data === undefined) {
    throw new Error(message);
  }
  return data;
}

/** Cliente singleton (solo para uso interno en services). */
export function getSupabaseClient() {
  return supabase;
}

export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) handleSupabaseError(error, 'auth.getUser');
  return data.user?.id ?? null;
}

async function getCurrentRoleCode() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('roles ( code )')
    .eq('id', userId)
    .maybeSingle();

  if (error) handleSupabaseError(error, 'profiles.role');
  return data?.roles?.code ?? null;
}

export async function isAdmin() {
  return (await getCurrentRoleCode()) === ROLES.ADMIN;
}

export async function isSeller() {
  return (await getCurrentRoleCode()) === ROLES.SELLER;
}

export async function isCustomer() {
  return (await getCurrentRoleCode()) === ROLES.CUSTOMER;
}

function applyEqFilters(query, eq = {}) {
  let q = query;
  for (const [key, value] of Object.entries(eq)) {
    if (value !== undefined && value !== null) {
      q = q.eq(key, value);
    }
  }
  return q;
}

/**
 * SELECT múltiple con filtros eq y orden opcional.
 */
export async function selectMany(
  table,
  select,
  { eq = {}, order, ascending = true, limit, ilike } = {},
  context,
) {
  let query = supabase.from(table).select(select);
  query = applyEqFilters(query, eq);

  if (ilike) {
    for (const [column, pattern] of Object.entries(ilike)) {
      if (pattern) query = query.ilike(column, pattern);
    }
  }
  if (order) query = query.order(order, { ascending });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) handleSupabaseError(error, context ?? `listar ${table}`);
  return data ?? [];
}

/**
 * SELECT .single()
 */
export async function selectSingle(table, select, { eq = {} } = {}, context) {
  let query = supabase.from(table).select(select);
  query = applyEqFilters(query, eq);

  const { data, error } = await query.single();
  if (error) handleSupabaseError(error, context ?? `obtener ${table}`);
  return ensureData(data, context ?? `Registro no encontrado en ${table}`);
}

/**
 * SELECT .maybeSingle()
 */
export async function selectMaybeSingle(table, select, { eq = {} } = {}, context) {
  let query = supabase.from(table).select(select);
  query = applyEqFilters(query, eq);

  const { data, error } = await query.maybeSingle();
  if (error) handleSupabaseError(error, context ?? `consultar ${table}`);
  return data ?? null;
}

/**
 * INSERT con retorno.
 */
export async function insertOne(table, payload, select = '*', context) {
  const { data, error } = await supabase.from(table).insert(payload).select(select).single();
  if (error) handleSupabaseError(error, context ?? `crear ${table}`);
  return ensureData(data, context ?? `No se pudo crear en ${table}`);
}

/**
 * INSERT múltiple.
 */
export async function insertMany(table, rows, select = '*', context) {
  const { data, error } = await supabase.from(table).insert(rows).select(select);
  if (error) handleSupabaseError(error, context ?? `insertar ${table}`);
  return data ?? [];
}

/**
 * UPDATE por id.
 */
export async function updateOne(table, id, payload, select = '*', context) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select(select)
    .single();

  if (error) handleSupabaseError(error, context ?? `actualizar ${table}`);
  return ensureData(data, context ?? `No se pudo actualizar ${table}`);
}

/**
 * UPDATE con filtros eq arbitrarios (sin id).
 */
export async function updateWhere(table, eq, payload, context) {
  let query = supabase.from(table).update(payload);
  query = applyEqFilters(query, eq);
  const { error } = await query;
  if (error) handleSupabaseError(error, context ?? `actualizar ${table}`);
}

/**
 * DELETE por id.
 */
export async function deleteOne(table, id, context) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) handleSupabaseError(error, context ?? `eliminar ${table}`);
}

/**
 * Conteo con filtros eq opcionales.
 */
export async function countRows(table, eq = {}, context) {
  let query = supabase.from(table).select('id', { count: 'exact', head: true });
  query = applyEqFilters(query, eq);
  const { count, error } = await query;
  if (error) handleSupabaseError(error, context ?? `contar ${table}`);
  return count ?? 0;
}
