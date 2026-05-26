/**
 * Capa de redes sociales para el panel admin.
 * Reutiliza socialService y añade campañas, métricas e IA.
 */
export {
  getSocialPlatforms,
  getSocialPosts,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost,
  generateSocialContentFromPrompt,
  saveAiGeneratedContent,
  getAiContentsForPost,
  mapSocialPost,
  getSocialCampaigns,
} from './socialService';

import { insertOne, selectMany } from './baseService';

export async function createSocialCampaign(payload) {
  return insertOne('social_campaigns', payload, '*', 'crear campaña social');
}

export async function getSocialMetrics() {
  const rows = await selectMany(
    'social_metrics',
    `
      id,
      metric_date,
      impressions,
      likes,
      comments,
      shares,
      social_posts ( title, social_platforms ( name ) )
    `,
    { order: 'metric_date', ascending: false, limit: 100 },
    'métricas sociales',
  );

  return rows.map((row) => ({
    id: row.id,
    metric_date: row.metric_date,
    impressions: row.impressions,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    post_title: row.social_posts?.title ?? null,
    platform_name: row.social_posts?.social_platforms?.name ?? null,
  }));
}

export async function getAllAiGeneratedContents() {
  const rows = await selectMany(
    'ai_generated_contents',
    `
      id,
      prompt,
      generated_text,
      model_name,
      status,
      created_at,
      social_posts ( title )
    `,
    { order: 'created_at', ascending: false, limit: 100 },
    'contenidos IA',
  );

  return rows.map((row) => ({
    id: row.id,
    prompt: row.prompt,
    generated_text: row.generated_text,
    model_name: row.model_name,
    status: row.status,
    post_title: row.social_posts?.title ?? null,
    created_at: row.created_at,
  }));
}
