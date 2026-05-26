import { describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: { getUser: vi.fn() } },
}));

import { getActiveProducts } from '../../services/productService';
import { getChatbotRules } from '../../services/chatbotConfigService';
import { handleSupabaseError } from '../../services/baseService';

/**
 * Integración ligera: servicios + mock Supabase sin red ni BD real.
 */
describe('integración — capa de servicios con mock Supabase', () => {
  it('productService y chatbotConfig comparten cliente mockeado', async () => {
    const productBuilder = createQueryBuilder({
      data: [
        {
          id: 'p1',
          name: 'Test',
          price: 10,
          stock: 1,
          is_active: true,
          sku: null,
          description: null,
          category_id: null,
          product_categories: null,
          product_images: [],
        },
      ],
      error: null,
    });
    const rulesBuilder = createQueryBuilder({
      data: [
        {
          id: 'r1',
          rule_code: 'greeting',
          intent_pattern: 'hola',
          response_template: 'Hola',
          priority: 1,
          triggers_handoff: false,
          is_active: true,
        },
      ],
      error: null,
    });

    mockFrom.mockImplementation(
      createSupabaseFromMock({
        products: () => productBuilder,
        chatbot_rules: () => rulesBuilder,
      }),
    );

    const products = await getActiveProducts();
    const rules = await getChatbotRules();

    expect(products).toHaveLength(1);
    expect(rules[0].rule_code).toBe('greeting');
    expect(mockFrom).toHaveBeenCalledWith('products');
    expect(mockFrom).toHaveBeenCalledWith('chatbot_rules');
  });

  it('baseService propaga errores legibles', () => {
    expect(() => handleSupabaseError({ message: 'timeout' }, 'integración')).toThrow(
      '[integración] timeout',
    );
  });
});
