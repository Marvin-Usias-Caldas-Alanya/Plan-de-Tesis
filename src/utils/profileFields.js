/**
 * Campos de perfil compatibles con schema NutriStore y legacy (role, nombre, sin full_name).
 */
export const PROFILE_NESTED_SELECT = 'email';

export function resolveProfileName(profile) {
  if (!profile) return null;
  return profile.full_name ?? profile.nombre ?? profile.name ?? profile.email ?? null;
}

export function normalizeProfileRow(row) {
  if (!row) return null;
  return {
    ...row,
    full_name: row.full_name ?? row.nombre ?? row.name ?? '',
  };
}
