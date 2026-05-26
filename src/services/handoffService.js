import { CHAT_STATUS, HANDOFF_CLIENT_MESSAGE } from '../utils/constants';
import { pickLastMessagePerConversation } from '../utils/conversationMessages';
import {
  getSupabaseClient,
  handleSupabaseError,
  insertOne,
  selectMany,
  selectMaybeSingle,
  updateOne,
  updateWhere,
} from './baseService';
import { getSellerIdByProfileId } from './profileService';

export { HANDOFF_CLIENT_MESSAGE };

async function insertSystemMessage(conversationId, text) {
  return insertOne(
    'messages',
    { conversation_id: conversationId, sender_type: 'system', message: text },
    'id, sender_type, message, created_at',
    'mensaje de sistema',
  );
}

export async function requestHumanHandoff(
  conversationId,
  reason = 'Solicitud del cliente',
) {
  await updateWhere(
    'conversations',
    { id: conversationId },
    { status: CHAT_STATUS.PENDING_HANDOFF },
    'actualizar conversación a handoff',
  );

  const existing = await selectMaybeSingle(
    'handoff_requests',
    'id, status',
    { eq: { conversation_id: conversationId, status: 'pending' } },
    'buscar handoff pendiente',
  );

  if (existing?.id) {
    return { id: existing.id, conversation_id: conversationId, status: 'pending' };
  }

  return insertOne(
    'handoff_requests',
    { conversation_id: conversationId, reason, status: 'pending' },
    'id, conversation_id, status, created_at',
    'crear solicitud handoff',
  );
}

export async function triggerHumanHandoff(
  conversationId,
  reason = 'Solicitud del cliente',
) {
  await requestHumanHandoff(conversationId, reason);
  return insertSystemMessage(conversationId, HANDOFF_CLIENT_MESSAGE);
}

export async function getHandoffRequests() {
  const rows = await selectMany(
    'handoff_requests',
    `
      id,
      reason,
      status,
      created_at,
      conversations ( customer_name, customer_email, status )
    `,
    { order: 'created_at', ascending: false },
    'listar handoffs',
  );

  return rows.map((row) => ({
    id: row.id,
    reason: row.reason,
    status: row.status,
    customer_name: row.conversations?.customer_name,
    customer_email: row.conversations?.customer_email,
    conversation_status: row.conversations?.status,
    created_at: row.created_at,
  }));
}

export async function fetchPendingConversations() {
  const conversations = await selectMany(
    'conversations',
    `
      id,
      customer_name,
      customer_email,
      status,
      assigned_seller_id,
      created_at,
      updated_at,
      handoff_requests ( id, reason, status, created_at )
    `,
    { eq: { status: CHAT_STATUS.PENDING_HANDOFF }, order: 'updated_at', ascending: false },
    'conversaciones pendientes handoff',
  );

  if (!conversations.length) return [];

  const ids = conversations.map((c) => c.id);
  const supabase = getSupabaseClient();
  const { data: messages, error } = await supabase
    .from('messages')
    .select('conversation_id, message, sender_type, created_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error, 'últimos mensajes handoff');

  const lastMap = pickLastMessagePerConversation(messages ?? []);

  return conversations.map((conv) => {
    const pendingHandoff = (conv.handoff_requests ?? []).find((h) => h.status === 'pending');
    const last = lastMap.get(conv.id);

    return {
      id: conv.id,
      customer_name: conv.customer_name,
      customer_email: conv.customer_email,
      status: conv.status,
      updated_at: conv.updated_at,
      handoff_id: pendingHandoff?.id ?? null,
      handoff_reason: pendingHandoff?.reason ?? null,
      last_message: last?.content ?? null,
      last_message_at: last?.created_at ?? conv.updated_at,
      last_sender_type: last?.sender_type ?? null,
    };
  });
}

export async function assignConversationToSeller(conversationId, profileId) {
  const sellerId = await getSellerIdByProfileId(profileId);

  const handoff = await selectMaybeSingle(
    'handoff_requests',
    'id',
    { eq: { conversation_id: conversationId, status: 'pending' } },
    'handoff para asignar',
  );

  const conversation = await updateOne(
    'conversations',
    conversationId,
    { status: CHAT_STATUS.HUMAN, assigned_seller_id: sellerId },
    'id, status, assigned_seller_id, customer_name, customer_email',
    'asignar vendedor a conversación',
  );

  if (handoff?.id) {
    await updateWhere(
      'handoff_requests',
      { id: handoff.id },
      { status: 'assigned' },
      'actualizar handoff asignado',
    );
  }

  await updateWhere(
    'seller_assignments',
    { conversation_id: conversationId, is_active: true },
    { is_active: false },
    'desactivar asignaciones previas',
  );

  const assignment = await insertOne(
    'seller_assignments',
    {
      conversation_id: conversationId,
      seller_id: sellerId,
      handoff_request_id: handoff?.id ?? null,
      is_active: true,
    },
    'id, conversation_id, seller_id',
    'crear asignación vendedor',
  );

  await insertSystemMessage(
    conversationId,
    'Un vendedor humano se ha unido a la conversación. Puedes continuar aquí.',
  );

  return { conversation, assignment };
}

export async function completeHandoffsForConversation(conversationId) {
  const supabase = getSupabaseClient();
  const { error: handoffError } = await supabase
    .from('handoff_requests')
    .update({ status: 'completed' })
    .eq('conversation_id', conversationId)
    .in('status', ['pending', 'assigned']);

  if (handoffError) handleSupabaseError(handoffError, 'completar handoffs');

  await updateWhere(
    'seller_assignments',
    { conversation_id: conversationId, is_active: true },
    { is_active: false },
    'cerrar asignaciones',
  );
}
