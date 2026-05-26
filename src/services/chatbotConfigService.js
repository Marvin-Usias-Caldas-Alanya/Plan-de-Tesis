import {
  countRows,
  deleteOne,
  insertOne,
  selectMany,
  selectSingle,
  updateOne,
} from './baseService';
import { upsertSetting } from './settingsService';
import {
  DEFAULT_AUTO_MESSAGES,
  DEFAULT_HANDOFF_KEYWORDS,
  FALLBACK_CHATBOT_INTENTS,
  FALLBACK_CHATBOT_RULES,
} from '../utils/chatbotFallback';
import {
  SETTING_AUTO_MESSAGES,
  SETTING_HANDOFF_KEYWORDS,
} from '../utils/chatbotConfigConstants';

export function mapChatbotRule(row) {
  if (!row) return null;
  return {
    id: row.id,
    rule_code: row.rule_code,
    intent_pattern: row.intent_pattern,
    response_template: row.response_template,
    priority: row.priority,
    triggers_handoff: row.triggers_handoff,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapChatbotIntent(row) {
  if (!row) return null;
  return {
    id: row.id,
    intent_code: row.intent_code,
    label: row.label,
    intent_type: row.intent_type,
    keywords: row.keywords,
    response_template: row.response_template,
    triggers_handoff: row.triggers_handoff,
    recommended_product_ids: row.recommended_product_ids ?? [],
    is_active: row.is_active,
    priority: row.priority,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildRulePayload(data) {
  return {
    rule_code: data.rule_code?.trim(),
    intent_pattern: data.intent_pattern?.trim(),
    response_template: data.response_template?.trim(),
    priority: Number(data.priority ?? 100),
    triggers_handoff: Boolean(data.triggers_handoff),
    is_active: data.is_active !== false,
  };
}

function buildIntentPayload(data) {
  const ids = Array.isArray(data.recommended_product_ids)
    ? data.recommended_product_ids.filter(Boolean)
    : [];
  return {
    intent_code: data.intent_code?.trim(),
    label: data.label?.trim(),
    intent_type: data.intent_type ?? 'general',
    keywords: data.keywords?.trim() ?? '',
    response_template: data.response_template?.trim() ?? null,
    triggers_handoff: Boolean(data.triggers_handoff),
    recommended_product_ids: ids,
    priority: Number(data.priority ?? 100),
    is_active: data.is_active !== false,
  };
}

export async function getChatbotRules() {
  const rows = await selectMany(
    'chatbot_rules',
    '*',
    { order: 'priority' },
    'listar reglas chatbot',
  );
  return rows.map(mapChatbotRule);
}

export async function getActiveRules() {
  const rows = await selectMany(
    'chatbot_rules',
    'id, rule_code, intent_pattern, response_template, priority, triggers_handoff, is_active',
    { eq: { is_active: true }, order: 'priority' },
    'reglas activas chatbot',
  );
  const mapped = rows.map(mapChatbotRule);
  return mapped.length ? mapped : FALLBACK_CHATBOT_RULES;
}

export async function createChatbotRule(data) {
  const row = await insertOne('chatbot_rules', buildRulePayload(data), '*', 'crear regla chatbot');
  return mapChatbotRule(row);
}

export async function updateChatbotRule(id, data) {
  const patch = buildRulePayload(data);
  if (data.rule_code === undefined) delete patch.rule_code;
  const row = await updateOne('chatbot_rules', id, patch, '*', 'actualizar regla chatbot');
  return mapChatbotRule(row);
}

export async function isChatbotRuleInUse(ruleCode) {
  const count = await countRows('chatbot_intents', { intent_code: ruleCode }, 'uso de regla');
  return count > 0;
}

export async function deleteChatbotRule(id) {
  const rule = await selectSingle('chatbot_rules', 'rule_code', { eq: { id } }, 'regla a eliminar');
  if (await isChatbotRuleInUse(rule.rule_code)) {
    throw new Error(
      `La regla "${rule.rule_code}" no puede eliminarse: hay conversaciones que la registraron.`,
    );
  }
  return deleteOne('chatbot_rules', id, 'eliminar regla chatbot');
}

export async function getChatbotIntents() {
  const rows = await selectMany(
    'chatbot_intent_definitions',
    '*',
    { order: 'priority' },
    'listar intenciones chatbot',
  );
  return rows.map(mapChatbotIntent);
}

export async function getActiveIntents() {
  const rows = await selectMany(
    'chatbot_intent_definitions',
    '*',
    { eq: { is_active: true }, order: 'priority' },
    'intenciones activas chatbot',
  );
  const mapped = rows.map(mapChatbotIntent);
  return mapped.length ? mapped : FALLBACK_CHATBOT_INTENTS;
}

export async function createChatbotIntent(data) {
  const row = await insertOne(
    'chatbot_intent_definitions',
    buildIntentPayload(data),
    '*',
    'crear intención chatbot',
  );
  return mapChatbotIntent(row);
}

export async function updateChatbotIntent(id, data) {
  const patch = buildIntentPayload(data);
  if (data.intent_code === undefined) delete patch.intent_code;
  const row = await updateOne(
    'chatbot_intent_definitions',
    id,
    patch,
    '*',
    'actualizar intención chatbot',
  );
  return mapChatbotIntent(row);
}

export async function isChatbotIntentInUse(intentCode) {
  const count = await countRows('chatbot_intents', { intent_code: intentCode }, 'uso de intención');
  return count > 0;
}

export async function deleteChatbotIntent(id) {
  const intent = await selectSingle(
    'chatbot_intent_definitions',
    'intent_code',
    { eq: { id } },
    'intención a eliminar',
  );
  if (await isChatbotIntentInUse(intent.intent_code)) {
    throw new Error(
      `La intención "${intent.intent_code}" no puede eliminarse: está registrada en conversaciones.`,
    );
  }
  return deleteOne('chatbot_intent_definitions', id, 'eliminar intención chatbot');
}

export async function getChatbotGlobalConfig() {
  const rows = await selectMany(
    'system_settings',
    'setting_key, setting_value',
    {},
    'config global chatbot',
  );

  const filtered = rows.filter((r) =>
    [SETTING_HANDOFF_KEYWORDS, SETTING_AUTO_MESSAGES].includes(r.setting_key),
  );

  let handoffKeywords = DEFAULT_HANDOFF_KEYWORDS;
  let autoMessages = { ...DEFAULT_AUTO_MESSAGES };

  for (const row of filtered) {
    if (row.setting_key === SETTING_HANDOFF_KEYWORDS) {
      try {
        handoffKeywords = JSON.parse(row.setting_value);
      } catch {
        handoffKeywords = row.setting_value ?? DEFAULT_HANDOFF_KEYWORDS;
      }
    }
    if (row.setting_key === SETTING_AUTO_MESSAGES) {
      try {
        autoMessages = { ...DEFAULT_AUTO_MESSAGES, ...JSON.parse(row.setting_value) };
      } catch {
        /* defaults */
      }
    }
  }

  return { handoffKeywords, autoMessages };
}

export async function saveHandoffKeywords(keywords) {
  return upsertSetting(SETTING_HANDOFF_KEYWORDS, keywords, false);
}

export async function saveAutoMessages(messages) {
  return upsertSetting(SETTING_AUTO_MESSAGES, messages, false);
}

export async function loadBotEngineConfig() {
  try {
    const [rules, intents, global] = await Promise.all([
      getActiveRules(),
      getActiveIntents(),
      getChatbotGlobalConfig(),
    ]);
    return {
      rules,
      intents,
      handoffKeywords: global.handoffKeywords,
      autoMessages: global.autoMessages,
      fromDatabase: true,
    };
  } catch {
    return {
      rules: FALLBACK_CHATBOT_RULES,
      intents: FALLBACK_CHATBOT_INTENTS,
      handoffKeywords: DEFAULT_HANDOFF_KEYWORDS,
      autoMessages: DEFAULT_AUTO_MESSAGES,
      fromDatabase: false,
    };
  }
}

export async function logChatbotIntent({
  conversationId,
  messageId,
  intentCode,
  confidence = null,
}) {
  return insertOne(
    'chatbot_intents',
    {
      conversation_id: conversationId,
      message_id: messageId ?? null,
      intent_code: intentCode,
      confidence,
    },
    'id, intent_code, created_at',
    'registrar intención chatbot',
  );
}
