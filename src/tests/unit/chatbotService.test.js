import { describe, expect, it } from 'vitest';
import {
  detectHumanHandoffIntent,
  detectPurchaseIntent,
  generateBotResponse,
  matchDatabaseRule,
} from '../../services/chatbotEngine';
import { FALLBACK_CHATBOT_RULES, FALLBACK_CHATBOT_INTENTS } from '../../utils/chatbotFallback';
import { CHATBOT_CATALOG } from '../helpers/mockData';

const DB_RULES = [
  {
    rule_code: 'custom_greeting',
    intent_pattern: 'buenas\\s*tardes',
    response_template: '¡Buenas tardes desde Supabase!',
    triggers_handoff: false,
  },
];

describe('chatbotService — motor de reglas', () => {
  describe('detectar intención de compra', () => {
    it.each([
      'quiero comprar',
      'deseo pagar',
      'quiero hacer un pedido',
      'realizar compra',
    ])('detecta: "%s"', (phrase) => {
      expect(detectPurchaseIntent(phrase)).toBe(true);
    });

    it('no confunde precio con compra', () => {
      expect(detectPurchaseIntent('cuánto cuesta el whey')).toBe(false);
    });
  });

  describe('detectar handoff humano', () => {
    it.each([
      'necesito ayuda humana',
      'hablar con un vendedor',
      'hablar con un asesor',
    ])('detecta handoff: "%s"', (phrase) => {
      expect(detectHumanHandoffIntent(phrase)).toBe(true);
    });

    it('frases de compra también activan handoff', () => {
      expect(detectHumanHandoffIntent('quiero comprar proteína')).toBe(true);
    });
  });

  describe('responder por objetivo del cliente', () => {
    it('recomienda proteínas para masa muscular', () => {
      const res = generateBotResponse('quiero ganar masa muscular', CHATBOT_CATALOG);
      expect(res.intent).toBe('goal');
      expect(res.goal).toBe('muscle_mass');
      expect(res.recommendedProducts.length).toBeGreaterThan(0);
    });

    it('recomienda vitaminas', () => {
      const res = generateBotResponse('busco vitaminas', CHATBOT_CATALOG);
      expect(res.goal).toBe('vitamins');
    });
  });

  describe('respuesta usando reglas de Supabase', () => {
    it('prioriza regla de BD', () => {
      const reply = generateBotResponse('buenas tardes', [], { rules: DB_RULES });
      expect(reply.intent).toBe('custom_greeting');
      expect(reply.content).toContain('Supabase');
    });

    it('matchDatabaseRule marca fromDatabase', () => {
      const match = matchDatabaseRule('buenas tardes', DB_RULES);
      expect(match?.fromDatabase).toBe(true);
    });
  });

  describe('fallback si no hay reglas', () => {
    it('usa saludo local sin reglas ni intenciones', () => {
      const reply = generateBotResponse('hola', CHATBOT_CATALOG, { rules: [], intents: [] });
      expect(reply.intent).toBe('greeting');
    });

    it('motor con fallback empaquetado', () => {
      const reply = generateBotResponse('ganar masa muscular', CHATBOT_CATALOG, {
        rules: FALLBACK_CHATBOT_RULES,
        intents: FALLBACK_CHATBOT_INTENTS,
      });
      expect(reply.intent).toBe('muscle_mass');
      expect(reply.intentType).toBe('goal');
      expect(reply.goal).toBe('muscle_mass');
      expect(reply.fromIntentConfig).toBe(true);
    });
  });

  describe('recomendar producto', () => {
    it('lista productos al buscar por nombre', () => {
      const res = generateBotResponse('precio creatina monohidrato', CHATBOT_CATALOG);
      expect(res.intent).toBe('price');
      expect(res.recommendedProducts.some((p) => /creatina/i.test(p.name))).toBe(true);
    });

    it('excluye productos inactivos', () => {
      const catalog = [
        ...CHATBOT_CATALOG,
        { id: 'x', name: 'Off', is_active: false, category: 'Proteínas', price: 1, stock: 0 },
      ];
      const res = generateBotResponse('ganar masa muscular', catalog);
      expect(res.recommendedProducts.every((p) => p.id !== 'x')).toBe(true);
    });
  });
});
