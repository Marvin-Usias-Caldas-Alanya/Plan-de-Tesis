import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/settingsService.js', () => ({
  upsertSetting: vi.fn().mockResolvedValue({}),
}));

import {
  getChatbotRules,
  getChatbotIntents,
  loadBotEngineConfig,
  logChatbotIntent,
  saveAutoMessages,
  saveHandoffKeywords,
} from '../../services/chatbotConfigService';

describe('chatbotConfigService — rutas exitosas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loadBotEngineConfig desde BD', async () => {
    const rulesB = createQueryBuilder({
      data: [
        {
          id: 'r1',
          rule_code: 'greet',
          intent_pattern: 'hola',
          response_template: 'Hi',
          priority: 1,
          triggers_handoff: false,
          is_active: true,
        },
      ],
      error: null,
    });
    const intentsB = createQueryBuilder({
      data: [
        {
          id: 'i1',
          intent_code: 'goal',
          label: 'Meta',
          intent_type: 'goal',
          keywords: 'masa',
          is_active: true,
          priority: 1,
          triggers_handoff: false,
          recommended_product_ids: [],
        },
      ],
      error: null,
    });
    const settingsB = createQueryBuilder({ data: [], error: null });
    mockFrom.mockImplementation((table) => {
      if (table === 'chatbot_rules') return rulesB;
      if (table === 'chatbot_intent_definitions') return intentsB;
      if (table === 'system_settings') return settingsB;
      return createQueryBuilder({ data: [], error: null });
    });

    const cfg = await loadBotEngineConfig();
    expect(cfg.fromDatabase).toBe(true);
    expect(cfg.rules[0].rule_code).toBe('greet');
    expect(cfg.intents[0].intent_code).toBe('goal');
  });

  it('getChatbotRules y getChatbotIntents listan', async () => {
    const rulesB = createQueryBuilder({ data: [], error: null });
    const intentsB = createQueryBuilder({ data: [], error: null });
    mockFrom.mockImplementation((table) => {
      if (table === 'chatbot_rules') return rulesB;
      return intentsB;
    });
    await expect(getChatbotRules()).resolves.toEqual([]);
    await expect(getChatbotIntents()).resolves.toEqual([]);
  });

  it('logChatbotIntent inserta registro', async () => {
    const builder = createQueryBuilder({
      data: { id: 'log1', intent_code: 'greeting' },
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ chatbot_intents: () => builder }));
    const row = await logChatbotIntent({
      conversationId: 'c1',
      intentCode: 'greeting',
    });
    expect(row.intent_code).toBe('greeting');
  });

  it('saveHandoffKeywords y saveAutoMessages', async () => {
    const { upsertSetting } = await import('../../services/settingsService');
    await saveHandoffKeywords('asesor|humano');
    await saveAutoMessages({ greeting: 'Hola' });
    expect(upsertSetting).toHaveBeenCalledTimes(2);
  });
});
