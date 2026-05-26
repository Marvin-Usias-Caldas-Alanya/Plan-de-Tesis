import { selectMany } from './baseService';

export async function getErrorLogs(limit = 100) {
  const rows = await selectMany(
    'error_logs',
    `
      id,
      error_code,
      message,
      severity,
      context,
      created_at,
      profiles ( full_name, email )
    `,
    { order: 'created_at', ascending: false, limit },
    'listar logs de error',
  );

  return rows.map((row) => ({
    id: row.id,
    error_code: row.error_code,
    message: row.message,
    severity: row.severity,
    profile_name: row.profiles?.full_name ?? null,
    created_at: row.created_at,
  }));
}
