import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSocialPublications } from '../../hooks/useSocialPublications';

vi.mock('../../services/socialService.js', () => ({
  getSocialPosts: vi.fn(),
  getSocialPlatforms: vi.fn(),
  getSocialCampaigns: vi.fn(),
  createManualSocialPost: vi.fn(),
  updateSocialPost: vi.fn(),
  deleteSocialPost: vi.fn(),
}));

vi.mock('../../services/productService.js', () => ({
  getActiveProducts: vi.fn(),
}));

vi.mock('../../services/aiContentService.js', () => ({
  generateSocialPost: vi.fn(),
  createSocialPostFromAI: vi.fn(),
  saveGeneratedContent: vi.fn(),
}));

import * as socialService from '../../services/socialService';
import * as productService from '../../services/productService';
import * as aiContentService from '../../services/aiContentService';

describe('useSocialPublications', () => {
  const onFeedback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    socialService.getSocialPosts.mockResolvedValue([]);
    socialService.getSocialPlatforms.mockResolvedValue([{ id: 'pl-1', code: 'facebook' }]);
    socialService.getSocialCampaigns.mockResolvedValue([]);
    productService.getActiveProducts.mockResolvedValue([{ id: 'p1', name: 'Whey' }]);
    aiContentService.generateSocialPost.mockResolvedValue({
      title: 'T',
      content: 'C',
      prompt: '{}',
      modelName: 'nutristore-rules-v1',
    });
    socialService.createManualSocialPost.mockResolvedValue({ id: 'post-1' });
    aiContentService.createSocialPostFromAI.mockResolvedValue({ id: 'post-2' });
  });

  it('carga datos iniciales', async () => {
    const { result } = renderHook(() => useSocialPublications({ onFeedback }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.platforms).toHaveLength(1);
    expect(result.current.products[0].name).toBe('Whey');
  });

  it('saveManualPost crea publicación', async () => {
    const { result } = renderHook(() => useSocialPublications({ onFeedback }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.saveManualPost({
        title: 'Promo',
        content: 'Texto',
        platformId: 'pl-1',
        status: 'draft',
      });
    });

    expect(ok).toBe(true);
    expect(socialService.createManualSocialPost).toHaveBeenCalled();
    expect(onFeedback).toHaveBeenCalledWith('success', expect.any(String));
  });

  it('runGenerate IA simulada', async () => {
    const { result } = renderHook(() => useSocialPublications({ onFeedback }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let generated;
    await act(async () => {
      generated = await result.current.runGenerate({
        productId: 'p1',
        platformCode: 'facebook',
        tone: 'promocional',
        objective: 'vender',
      });
    });

    expect(generated.content).toBe('C');
    expect(aiContentService.generateSocialPost).toHaveBeenCalled();
  });

  it('saveManualPost error', async () => {
    socialService.createManualSocialPost.mockRejectedValue(new Error('RLS'));
    const { result } = renderHook(() => useSocialPublications({ onFeedback }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.saveManualPost({
        title: 'X',
        content: 'Y',
        platformId: 'pl-1',
        status: 'draft',
      });
    });

    expect(ok).toBe(false);
    expect(onFeedback).toHaveBeenCalledWith('error', 'RLS');
  });
});
