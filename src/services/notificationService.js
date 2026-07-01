import { getSupabaseClient, handleSupabaseError, insertOne, selectMany, updateOne, updateWhere } from './baseService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

export function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    profile_id: row.profile_id,
    title: row.title,
    body: row.body,
    type: row.type,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

export async function getNotificationsForProfile(profileId, { unreadOnly = false } = {}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('notifications')
    .select('id, profile_id, title, body, type, is_read, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error } = await query;
  if (error) handleSupabaseError(error, 'listar notificaciones');
  return (data ?? []).map(mapNotification);
}

export async function getAllNotifications(limit = 100) {
  const rows = await selectMany(
    'notifications',
    `
      id,
      title,
      body,
      type,
      is_read,
      created_at,
      profiles ( ${PROFILE_NESTED_SELECT} )
    `,
    { order: 'created_at', ascending: false, limit },
    'notificaciones admin',
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    is_read: row.is_read,
    profile_name: resolveProfileName(row.profiles),
    created_at: row.created_at,
  }));
}

export async function createNotification({ profileId, title, body, type = 'info' }) {
  const row = await insertOne(
    'notifications',
    {
      profile_id: profileId,
      title,
      body: body ?? null,
      type,
      is_read: false,
    },
    'id, profile_id, title, body, type, is_read, created_at',
    'crear notificación',
  );
  return mapNotification(row);
}

export async function markNotificationRead(id) {
  return updateOne('notifications', id, { is_read: true }, 'id, is_read', 'marcar notificación');
}

export async function markAllNotificationsRead(profileId) {
  await updateWhere(
    'notifications',
    { profile_id: profileId, is_read: false },
    { is_read: true },
    'marcar todas las notificaciones',
  );
}
