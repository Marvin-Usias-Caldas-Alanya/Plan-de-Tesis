import { createClient } from '@supabase/supabase-js';

const ENV_URL = 'VITE_SUPABASE_URL';
const ENV_KEY = 'VITE_SUPABASE_ANON_KEY';

const supabaseUrl = import.meta.env[ENV_URL]?.trim() ?? '';
const supabaseAnonKey = import.meta.env[ENV_KEY]?.trim() ?? '';

/**
 * Lista las variables de entorno de Supabase que faltan o están vacías.
 * @returns {string[]}
 */
export function getMissingSupabaseEnvVars() {
  const missing = [];
  if (!supabaseUrl) missing.push(ENV_URL);
  if (!supabaseAnonKey) missing.push(ENV_KEY);
  return missing;
}

/**
 * Indica si el proyecto tiene credenciales de Supabase cargadas.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return getMissingSupabaseEnvVars().length === 0;
}

/**
 * Mensaje legible cuando falta configuración (útil en UI o logs).
 * @returns {string | null}
 */
export function getSupabaseConfigMessage() {
  if (isSupabaseConfigured()) return null;

  const missing = getMissingSupabaseEnvVars().join(', ');
  return (
    `Supabase no está configurado. Faltan: ${missing}. ` +
    'Copia .env.example a .env en la raíz del proyecto y asigna tus valores.'
  );
}

function logConfigWarning() {
  const message = getSupabaseConfigMessage();
  if (!message) return;

  if (import.meta.env.DEV) {
    // Advertencia intencional en desarrollo cuando faltan variables de entorno
    console.warn(`[Supabase] ${message}`);
    return;
  }

  console.error(`[Supabase] ${message}`);
}

logConfigWarning();

/**
 * Cliente de Supabase (singleton).
 * Si faltan variables, se crea con valores placeholder para que Vite/React
 * arranquen en desarrollo; las llamadas a la API fallarán hasta configurar .env.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
