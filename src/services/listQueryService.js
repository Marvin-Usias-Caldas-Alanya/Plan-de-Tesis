import { selectMany } from './baseService';
import { PROFILE_NESTED_SELECT, resolveProfileName } from '../utils/profileFields';

const DIRECT_PROFILE = `profiles ( ${PROFILE_NESTED_SELECT} )`;
const CUSTOMER_PROFILE = `customers ( profiles ( ${PROFILE_NESTED_SELECT} ) )`;

export { resolveProfileName };

export async function listWithDirectProfile(table, fields, queryOptions, context) {
  return selectMany(table, `${fields},\n${DIRECT_PROFILE}`, queryOptions, context);
}

export async function listWithCustomerProfile(table, fields, queryOptions, context) {
  return selectMany(table, `${fields},\n${CUSTOMER_PROFILE}`, queryOptions, context);
}

export async function listProfilesLinked(table, entityFields, mapEntity, contextLabel) {
  const rows = await selectMany(
    table,
    `${entityFields}, profiles ( id, email, role )`,
    { order: 'created_at', ascending: false },
    contextLabel,
  );

  return rows.map((row) => ({
    ...mapEntity(row),
    profile_id: row.profiles?.id,
    email: row.profiles?.email,
    full_name: resolveProfileName(row.profiles),
    is_active: row.profiles?.is_active ?? true,
  }));
}
