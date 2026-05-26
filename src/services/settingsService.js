import { getSupabaseClient, handleSupabaseError, selectMany } from './baseService';

function parseSettingValue(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function mapSetting(row) {
  if (!row) return null;
  return {
    id: row.id,
    key: row.setting_key,
    value: parseSettingValue(row.setting_value),
    is_public: row.is_public,
    updated_at: row.updated_at,
  };
}

export async function getPublicSettings() {
  const rows = await selectMany(
    'system_settings',
    'id, setting_key, setting_value, is_public, updated_at',
    { eq: { is_public: true } },
    'configuración pública',
  );

  const map = {};
  for (const row of rows) {
    map[row.setting_key] = parseSettingValue(row.setting_value);
  }
  return map;
}

export async function getAllSettings() {
  const rows = await selectMany(
    'system_settings',
    'id, setting_key, setting_value, is_public, updated_at',
    { order: 'setting_key' },
    'configuración del sistema',
  );
  return rows.map(mapSetting);
}

export async function upsertSetting(key, value, isPublic = false) {
  const payload = {
    setting_key: key,
    setting_value: typeof value === 'string' ? value : JSON.stringify(value),
    is_public: isPublic,
  };

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('system_settings')
    .upsert(payload, { onConflict: 'setting_key' })
    .select('id, setting_key, setting_value, is_public, updated_at')
    .single();

  if (error) handleSupabaseError(error, 'guardar configuración');
  return mapSetting(data);
}

export async function isChatbotEnabled() {
  const settings = await getPublicSettings();
  const flag = settings.chatbot_enabled;
  if (flag === false || flag === 'false') return false;
  return true;
}
