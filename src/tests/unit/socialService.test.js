import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import {
  buildSocialPostPayload,
  createManualSocialPost,
  deleteSocialPost,
  generateSocialContentFromPrompt,
  getSocialPosts,
  mapSocialPost,
  updateSocialPost,
} from '../../services/socialService';

const POST_ROW = {
  id: 'post-1',
  title: 'Promo',
  content: 'Texto',
  status: 'draft',
  platform_id: 'pl-1',
  social_platforms: { code: 'facebook', name: 'Facebook' },
  social_campaigns: { name: 'Verano' },
  products: { name: 'Whey', sku: 'W1', product_categories: { name: 'Proteínas' } },
};

describe('socialService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('mapSocialPost y buildSocialPostPayload', () => {
    expect(mapSocialPost(null)).toBeNull();
    const mapped = mapSocialPost(POST_ROW);
    expect(mapped.platform_code).toBe('facebook');
    expect(mapped.product_name).toBe('Whey');

    const payload = buildSocialPostPayload({
      title: '  T  ',
      content: '  C  ',
      platformId: 'pl-1',
      campaignId: '',
      productId: null,
      status: 'draft',
      scheduledAt: '2026-06-01T10:00:00Z',
    });
    expect(payload.title).toBe('T');
    expect(payload.scheduled_at).toBeDefined();
  });

  it('creación manual de publicación', async () => {
    const builder = createQueryBuilder({ data: POST_ROW, error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ social_posts: () => builder }));

    const post = await createManualSocialPost({
      title: 'Promo',
      content: 'Texto',
      platformId: 'pl-1',
      campaignId: null,
      productId: null,
      status: 'draft',
    });
    expect(post.title).toBe('Promo');
    expect(builder.insert).toHaveBeenCalled();
  });

  it('lista, actualiza y elimina publicaciones', async () => {
    const listB = createQueryBuilder({ data: [POST_ROW], error: null });
    const updB = createQueryBuilder({ data: { ...POST_ROW, title: 'Nuevo' }, error: null });
    const delB = createQueryBuilder({ data: null, error: null });
    let n = 0;
    mockFrom.mockImplementation((table) => {
      if (table !== 'social_posts') return createQueryBuilder({ data: [], error: null });
      n += 1;
      if (n === 1) return listB;
      if (n === 2) return updB;
      return delB;
    });

    const list = await getSocialPosts();
    expect(list).toHaveLength(1);

    const updated = await updateSocialPost('post-1', { title: 'Nuevo' });
    expect(updated.title).toBe('Nuevo');

    await deleteSocialPost('post-1');
  });

  it('generateSocialContentFromPrompt simulado', () => {
    const text = generateSocialContentFromPrompt('whey protein');
    expect(text).toContain('whey protein');
    expect(text).toContain('#NutriStore');
  });

  it('error al crear publicación', async () => {
    const builder = createQueryBuilder({ data: null, error: { message: 'rls' } });
    mockFrom.mockImplementation(createSupabaseFromMock({ social_posts: () => builder }));
    await expect(
      createManualSocialPost({
        title: 'X',
        content: 'Y',
        platformId: 'pl',
        status: 'draft',
      }),
    ).rejects.toThrow(/rls/);
  });
});
