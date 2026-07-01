import { selectMany } from './baseService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

export async function getSupportTickets() {
  const rows = await selectMany(
    'support_tickets',
    `
      id,
      ticket_number,
      subject,
      status,
      created_at,
      customers ( profiles ( ${PROFILE_NESTED_SELECT} ) )
    `,
    { order: 'created_at', ascending: false },
    'listar tickets',
  );

  return rows.map((row) => ({
    id: row.id,
    ticket_number: row.ticket_number,
    subject: row.subject,
    status: row.status,
    customer_name: resolveProfileName(row.customers?.profiles),
    customer_email: row.customers?.profiles?.email ?? null,
    created_at: row.created_at,
  }));
}
