import { useCallback, useEffect, useState } from 'react';
import {
  createSocialPost,
  deleteSocialPost,
  generateSocialContentFromPrompt,
  getAiContentsForPost,
  getSocialCampaigns,
  getSocialPlatforms,
  getSocialPosts,
  saveAiGeneratedContent,
  updateSocialPost,
} from '../services/socialService';

export function useSocialPosts({ onFeedback, storeName = 'NutriStore' } = {}) {
  const [posts, setPosts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [postRows, platformRows, campaignRows] = await Promise.all([
        getSocialPosts(),
        getSocialPlatforms(),
        getSocialCampaigns(),
      ]);
      setPosts(postRows);
      setPlatforms(platformRows);
      setCampaigns(campaignRows);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savePost = useCallback(
    async (payload, editingId = null) => {
      setSubmitting(true);
      try {
        if (editingId) {
          await updateSocialPost(editingId, payload);
          onFeedback?.('success', 'Publicación actualizada');
        } else {
          await createSocialPost(payload);
          onFeedback?.('success', 'Publicación creada');
        }
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

  const generateWithAi = useCallback(
    async (prompt, postId = null) => {
      setGenerating(true);
      try {
        const text = generateSocialContentFromPrompt(prompt, { storeName });
        await saveAiGeneratedContent({
          socialPostId: postId,
          prompt,
          generatedText: text,
        });
        onFeedback?.('success', 'Contenido generado con IA (plantilla)');
        return text;
      } catch (err) {
        onFeedback?.('error', err.message);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [onFeedback, storeName],
  );

  const loadAiHistory = useCallback(async (postId) => {
    try {
      return await getAiContentsForPost(postId);
    } catch {
      return [];
    }
  }, []);

  return {
    posts,
    platforms,
    campaigns,
    loading,
    submitting,
    generating,
    refresh,
    savePost,
    removePost,
    generateWithAi,
    loadAiHistory,
  };
}
