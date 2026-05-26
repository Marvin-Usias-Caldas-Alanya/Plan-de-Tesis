import { CHAT_STATUS } from '../utils/constants';
import { pickLastMessagePerConversation } from '../utils/conversationMessages';
import {
  generateBotResponse,
  generateBotResponseWithAi,
  detectPurchaseIntent,
  detectHumanHandoffIntent,
} from './chatbotEngine';
import { loadBotEngineConfig, logChatbotIntent } from './chatbotConfigService';
import { insertOne, selectMany, selectSingle, updateOne } from './baseService';
import { getCustomerIdByProfileId, getSellerIdByProfileId } from './profileService';
import {
  assignConversationToSeller,
  fetchPendingConversations,
  requestHumanHandoff,
  triggerHumanHandoff,
  completeHandoffsForConversation,
  HANDOFF_CLIENT_MESSAGE,
} from './handoffService';
import { createNotification } from './notificationService';

export {
  generateBotResponse,
  generateBotResponseWithAi,
  detectPurchaseIntent,
  detectHumanHandoffIntent,
  HANDOFF_CLIENT_MESSAGE,
  pickLastMessagePerConversation,
  getCustomerIdByProfileId,
  getSellerIdByProfileId,
  fetchPendingConversations,
  requestHumanHandoff,
  triggerHumanHandoff,
  assignConversationToSeller,
};

export async function loadActiveBotRules() {
  return loadBotEngineConfig();
}

export { loadBotEngineConfig };

export async function recordBotIntent(params) {
  try {
    return await logChatbotIntent(params);
  } catch {
    return null;
  }
}

export async function createConversation(customerData = {}) {
  const { profileId, customerName, customerEmail } = customerData;

  let customerId = null;
  if (profileId) {
    try {
      customerId = await getCustomerIdByProfileId(profileId);
    } catch {
      customerId = null;
    }
  }

  return insertOne(
    'conversations',
    {
      customer_id: customerId,
      customer_name: customerName ?? null,
      customer_email: customerEmail ?? null,
      status: CHAT_STATUS.BOT,
      channel: 'web',
    },
    'id, status, created_at, updated_at',
    'crear conversación',
  );
}

export async function updateConversationCustomer(
  conversationId,
  { customerName, customerEmail },
) {
  const patch = {};
  if (customerName !== undefined) patch.customer_name = customerName;
  if (customerEmail !== undefined) patch.customer_email = customerEmail;
  if (!Object.keys(patch).length) return null;

  return updateOne(
    'conversations',
    conversationId,
    patch,
    'id, customer_name, customer_email, status, updated_at',
    'actualizar cliente en conversación',
  );
}

export async function saveMessage(conversationId, senderType, message) {
  const row = await insertOne(
    'messages',
    { conversation_id: conversationId, sender_type: senderType, message },
    'id, sender_type, message, created_at',
    'guardar mensaje',
  );
  return mapRowToUiMessage(row);
}

export async function fetchConversationMessages(conversationId) {
  const rows = await selectMany(
    'messages',
    'id, sender_type, message, created_at',
    { eq: { conversation_id: conversationId }, order: 'created_at' },
    'mensajes de conversación',
  );
  return rows.map(mapRowToUiMessage);
}

function mapRowToUiMessage(row) {
  return {
    id: row.id,
    role: mapSenderToUiRole(row.sender_type),
    senderType: row.sender_type,
    content: row.message,
    created_at: row.created_at,
  };
}

function mapSenderToUiRole(senderType) {
  if (senderType === 'customer') return 'user';
  if (senderType === 'bot' || senderType === 'seller') return 'assistant';
  return 'system';
}

export async function fetchConversationById(conversationId) {
  return selectSingle(
    'conversations',
    `
      id,
      customer_name,
      customer_email,
      status,
      assigned_seller_id,
      created_at,
      updated_at,
      handoff_requests ( id, reason, status )
    `,
    { eq: { id: conversationId } },
    'obtener conversación',
  );
}

export async function closeConversation(conversationId) {
  const data = await updateOne(
    'conversations',
    conversationId,
    { status: CHAT_STATUS.CLOSED },
    'id, status',
    'cerrar conversación',
  );

  await completeHandoffsForConversation(conversationId);
  await saveMessage(
    conversationId,
    'system',
    'La conversación ha sido cerrada. ¡Gracias por contactarnos!',
  );

  return data;
}

export async function saveSellerMessage(conversationId, message) {
  return saveMessage(conversationId, 'seller', message);
}

export async function notifySellerProfile(profileId, title, body) {
  if (!profileId) return null;
  try {
    return await createNotification({ profileId, title, body, type: 'chat' });
  } catch {
    return null;
  }
}

/** @deprecated Usar fetchPendingConversations */
export async function fetchPendingHandoffs() {
  const list = await fetchPendingConversations();
  return list.map((c) => ({
    id: c.handoff_id ?? c.id,
    conversation_id: c.id,
    reason: c.handoff_reason,
    updated_at: c.updated_at,
    customer_name: c.customer_name,
  }));
}

/** @deprecated Usar saveMessage */
export async function sendMessage({ conversationId, role, content }) {
  const map = { user: 'customer', assistant: 'bot', system: 'system' };
  return saveMessage(conversationId, map[role] ?? 'system', content);
}
