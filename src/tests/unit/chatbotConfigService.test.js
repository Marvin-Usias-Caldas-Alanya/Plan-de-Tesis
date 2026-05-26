import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCountBuilder, createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';
import { FALLBACK_CHATBOT_INTENTS, FALLBACK_CHATBOT_RULES } from '../../utils/chatbotFallback';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/settingsService.js', () => ({
  upsertSetting: vi.fn().mockResolvedValue({ setting_key: 'handoff' }),
}));

import {
  createChatbotIntent,
  createChatbotRule,
  deleteChatbotIntent,
  deleteChatbotRule,
  getActiveIntents,
  getActiveRules,
  getChatbotGlobalConfig,
  loadBotEngineConfig,
  mapChatbotIntent,
  mapChatbotRule,
} from '../../services/chatbotConfigService';

describe('chatbotConfigService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('mappers', () => {
    it('mapChatbotRule e Intent', () => {
      expect(mapChatbotRule(null)).toBeNull();
      expect(
        mapChatbotRule({
          id: '1',
          rule_code: 'greet',
          intent_pattern: 'hola',
          response_template: 'Hi',
          priority: 1,
          triggers_handoff: false,
          is_active: true,
        }),
      ).toMatchObject({ rule_code: 'greet' });

      expect(mapChatbotIntent(null)).toBeNull();
      expect(
        mapChatbotIntent({
          id: '2',
          intent_code: 'goal',
          label: 'Meta',
          intent_type: 'goal',
          keywords: 'masa',
          recommended_product_ids: ['p1'],
          is_active: true,
          priority: 1,
          triggers_handoff: false,
        }),
      ).toMatchObject({ intent_code: 'goal', recommended_product_ids: ['p1'] });
    });
  });

  describe('reglas activas y fallback', () => {
    it('usa fallback si no hay reglas en BD', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ chatbot_rules: () => builder }));
      const rules = await getActiveRules();
      expect(rules).toEqual(FALLBACK_CHATBOT_RULES);
    });

    it('crea regla en BD', async () => {
      const row = {
        id: 'r1',
        rule_code: 'test',
        intent_pattern: 'hola',
        response_template: 'ok',
        priority: 10,
        triggers_handoff: false,
        is_active: true,
      };
      const builder = createQueryBuilder({ data: row, error: null });
      mockFrom.mockImplementation(createSupabaseFromMock({ chatbot_rules: () => builder }));
      const created = await createChatbotRule({
        rule_code: 'test',
        intent_pattern: 'hola',
        response_template: 'ok',
      });
      expect(created.rule_code).toBe('test');
    });

    it('no elimina regla en uso', async () => {
      const ruleB = createQueryBuilder({ data: { rule_code: 'used' }, error: null });
      const countB = createCountBuilder(2);
      mockFrom.mockImplementation((table) => {
        if (table === 'chatbot_rules') return ruleB;
        if (table === 'chatbot_intents') return countB;
        return createQueryBuilder({ data: null, error: null });
      });
      await expect(deleteChatbotRule('r1')).rejects.toThrow(/no puede eliminarse/);
    });
  });

  describe('intenciones', () => {
    it('usa fallback si BD vacía', async () => {
      const builder = createQueryBuilder({ data: [], error: null });
      mockFrom.mockImplementation(
        createSupabaseFromMock({ chatbot_intent_definitions: () => builder }),
      );
      const intents = await getActiveIntents();
      expect(intents).toEqual(FALLBACK_CHATBOT_INTENTS);
    });

    it('no elimina intención en uso', async () => {
      const intentB = createQueryBuilder({ data: { intent_code: 'purchase' }, error: null });
      const countB = createCountBuilder(1);
      mockFrom.mockImplementation((table) => {
        if (table === 'chatbot_intent_definitions') return intentB;
        if (table === 'chatbot_intents') return countB;
        return createQueryBuilder({ data: [], error: null });
      });
      await expect(deleteChatbotIntent('i1')).rejects.toThrow(/no puede eliminarse/);
    });

    it('crea intención', async () => {
      const row = {
        id: 'i1',
        intent_code: 'energy',
        label: 'Energía',
        intent_type: 'goal',
        keywords: 'energía',
        recommended_product_ids: [],
        is_active: true,
        priority: 5,
        triggers_handoff: false,
      };
      const builder = createQueryBuilder({ data: row, error: null });
      mockFrom.mockImplementation(
        createSupabaseFromMock({ chatbot_intent_definitions: () => builder }),
      );
      const created = await createChatbotIntent({
        intent_code: 'energy',
        label: 'Energía',
        intent_type: 'goal',
        keywords: 'energía',
      });
      expect(created.intent_code).toBe('energy');
    });
  });

  describe('config global y motor', () => {
    it('parsea settings de handoff y mensajes', async () => {
      const builder = createQueryBuilder({
        data: [
          { setting_key: 'chatbot_handoff_keywords', setting_value: '"asesor|humano"' },
          {
            setting_key: 'chatbot_auto_messages',
            setting_value: JSON.stringify({ greeting: 'Hola custom' }),
          },
        ],
        error: null,
      });
      mockFrom.mockImplementation(createSupabaseFromMock({ system_settings: () => builder }));
      const cfg = await getChatbotGlobalConfig();
      expect(cfg.autoMessages.greeting).toBe('Hola custom');
    });

    it('loadBotEngineConfig con fallback si falla BD', async () => {
      mockFrom.mockImplementation(() => {
        throw new Error('offline');
      });
      const cfg = await loadBotEngineConfig();
      expect(cfg.fromDatabase).toBe(false);
      expect(cfg.rules).toEqual(FALLBACK_CHATBOT_RULES);
    });
  });
});
