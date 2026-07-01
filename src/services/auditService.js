import { selectMany } from './baseService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

export async function getAuditLogs(limit = 100) {
  const rows = await selectMany(
    'audit_logs',
    `
      id,
      action,
      table_name,
      record_id,
      payload,
      created_at,
      profiles ( ${PROFILE_NESTED_SELECT} )
    `,
    { order: 'created_at', ascending: false, limit },
    'logs de auditoría',
  );

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    table_name: row.table_name,
    record_id: row.record_id,
    profile_name: resolveProfileName(row.profiles) ?? 'Sistema',
    created_at: row.created_at,
  }));
}
