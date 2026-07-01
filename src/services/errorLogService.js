import { listWithDirectProfile, resolveProfileName } from './listQueryService';

export async function getErrorLogs(limit = 100) {
  const rows = await listWithDirectProfile(
    'error_logs',
    'id, error_code, message, severity, context, created_at',
    { order: 'created_at', ascending: false, limit },
    'listar logs de error',
  );

  return rows.map((row) => ({
    id: row.id,
    error_code: row.error_code,
    message: row.message,
    severity: row.severity,
    profile_name: resolveProfileName(row.profiles),
    created_at: row.created_at,
  }));
}
