import { useCallback, useEffect, useState } from 'react';
import { getActiveProducts } from '../services/productService';
import {
  createManualSocialPost,
  deleteSocialPost,
  getSocialCampaigns,
  getSocialPlatforms,
  getSocialPosts,
  updateSocialPost,
} from '../services/socialService';
import {
  createSocialPostFromAI,
  generateSocialPost,
  saveGeneratedContent,
} from '../services/aiContentService';

export function useSocialPublications({ onFeedback } = {}) {
  const [posts, setPosts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [postRows, platformRows, campaignRows, productRows] = await Promise.all([
        getSocialPosts(),
        getSocialPlatforms(),
        getSocialCampaigns(),
        getActiveProducts(),
      ]);
      setPosts(postRows);
      setPlatforms(platformRows);
      setCampaigns(campaignRows);
      setProducts(productRows);
    } catch (err) {
      onFeedback?.('error', err.message ?? 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveManualPost = useCallback(
    async (form, editingId = null) => {
      setSubmitting(true);
      try {
        if (editingId) {
          await updateSocialPost(editingId, {
            title: form.title,
            content: form.content,
            platform_id: form.platformId,
            campaign_id: form.campaignId || null,
            product_id: form.productId || null,
            status: form.status,
            scheduled_at:
              form.status === 'scheduled' && form.scheduledAt ? form.scheduledAt : null,
          });
          onFeedback?.('success', 'Publicación actualizada');
        } else {
          await createManualSocialPost(form);
          onFeedback?.('success', 'Publicación creada');
        }
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message ?? 'No se pudo guardar la publicación');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh],
  );

  const removePost = useCallback(
    async (id) => {
      if (!window.confirm('¿Eliminar esta publicación?')) return false;
      setSubmitting(true);
      try {
        await deleteSocialPost(id);
        onFeedback?.('success', 'Publicación eliminada');
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh],
  );

  const generatePreview = useCallback(({ product, platformCode, tone, objective }) => {
    const platform = platforms.find((p) => p.code === platformCode) ?? { code: platformCode };
    return generateSocialPost({
      product,
      platform,
      tone,
      objective,
    });
  }, [platforms]);

  const saveAiPublication = useCallback(
    async ({ draft, platformId, campaignId, productId, status, scheduledAt, saveAsPost }) => {
      setSubmitting(true);
      try {
        if (saveAsPost) {
          await createSocialPostFromAI({
            title: draft.title,
            content: draft.content,
            platformId,
            campaignId,
            productId,
            status,
            scheduledAt,
            prompt: draft.prompt,
            generatedText: draft.content,
            modelName: draft.modelName,
          });
          onFeedback?.('success', 'Publicación IA guardada en redes y historial');
        } else {
          await saveGeneratedContent({
            prompt: draft.prompt,
            generatedText: draft.content,
            modelName: draft.modelName,
          });
          onFeedback?.('success', 'Contenido guardado en historial IA');
        }
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message ?? 'Error al guardar contenido IA');
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh],
  );

  const runGenerate = useCallback(
    async (params) => {
      setGenerating(true);
      try {
        const product = products.find((p) => p.id === params.productId) ?? null;
        const draft = generatePreview({
          product,
          platformCode: params.platformCode,
          tone: params.tone,
          objective: params.objective,
        });
        return draft;
      } catch (err) {
        onFeedback?.('error', err.message);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [products, generatePreview, onFeedback],
  );

  return {
    posts,
    platforms,
    campaigns,
    products,
    loading,
    submitting,
    generating,
    refresh,
    saveManualPost,
    removePost,
    runGenerate,
    saveAiPublication,
  };
}
