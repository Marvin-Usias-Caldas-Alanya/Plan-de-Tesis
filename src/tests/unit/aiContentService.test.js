import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  generateCaption,
  generateSocialPost,
  AI_MODEL_SIMULATED,
} from '../../services/aiContentService';

vi.mock('../../services/socialService', () => ({
  createSocialPost: vi.fn(),
  saveAiGeneratedContent: vi.fn(),
}));

import { createSocialPost, saveAiGeneratedContent } from '../../services/socialService';
import { createSocialPostFromAI, saveGeneratedContent } from '../../services/aiContentService';

const product = {
  id: 'prod-1',
  name: 'Whey Protein Gold',
  description: 'Proteína de suero de alta calidad.',
  price: 899,
  stock: 12,
};

describe('aiContentService — plataformas y tonos', () => {
  describe('generar publicación por plataforma', () => {
    it.each([
      ['facebook', 'facebook'],
      ['instagram', 'instagram'],
      ['tiktok', 'tiktok'],
      ['whatsapp', 'whatsapp'],
    ])('genera publicación para %s', (platform, code) => {
      const result = generateSocialPost({
        product,
        platform: code,
        tone: 'promocional',
        objective: 'vender',
      });
      expect(result.title).toContain('Whey Protein Gold');
      expect(result.content).toContain('Whey Protein Gold');
      expect(result.modelName).toBe(AI_MODEL_SIMULATED);
      expect(JSON.parse(result.prompt).platform).toBe(code);
    });

    it('WhatsApp incluye texto de consulta', () => {
      const caption = generateCaption({ product, platform: 'whatsapp', tone: 'informativo' });
      expect(caption).toMatch(/WhatsApp/i);
    });
  });

  describe('generar contenido según tono', () => {
    it.each(['promocional', 'informativo', 'juvenil', 'profesional', 'urgente'])(
      'aplica tono %s',
      (tone) => {
        const result = generateSocialPost({ product, platform: 'instagram', tone, objective: 'vender' });
        expect(JSON.parse(result.prompt).tone).toBe(tone);
        expect(result.content.length).toBeGreaterThan(20);
      },
    );
  });

  describe('generar contenido según objetivo', () => {
    it.each([
      'vender',
      'informar',
      'lanzar_promocion',
      'recuperar_clientes',
      'anunciar_stock',
    ])('aplica objetivo %s', (objective) => {
      const result = generateSocialPost({
        product,
        platform: 'facebook',
        tone: 'promocional',
        objective,
      });
      expect(JSON.parse(result.prompt).objective).toBe(objective);
      expect(result.content).toMatch(/NutriStore/i);
    });
  });

  describe('persistencia simulada', () => {
    beforeEach(() => vi.clearAllMocks());

    it('saveGeneratedContent delega a socialService', async () => {
      saveAiGeneratedContent.mockResolvedValue({ id: 'ai-1' });
      const row = await saveGeneratedContent({ prompt: '{}', generatedText: 'Texto' });
      expect(saveAiGeneratedContent).toHaveBeenCalled();
      expect(row.id).toBe('ai-1');
    });

    it('createSocialPostFromAI vincula post e IA', async () => {
      createSocialPost.mockResolvedValue({ id: 'post-1', platform_code: 'instagram' });
      saveAiGeneratedContent.mockResolvedValue({ id: 'ai-2' });
      const result = await createSocialPostFromAI({
        title: 'T',
        content: 'C',
        platformId: 'pl-1',
        productId: 'prod-1',
        prompt: '{}',
        generatedText: 'C',
      });
      expect(result.post.id).toBe('post-1');
    });
  });
});
