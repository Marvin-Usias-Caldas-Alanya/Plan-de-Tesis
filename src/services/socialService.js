import { deleteOne, insertOne, selectMany, updateOne } from './baseService';

const POST_SELECT = `
  id,
  campaign_id,
  platform_id,
  product_id,
  title,
  content,
  status,
  scheduled_at,
  created_at,
  updated_at,
  social_platforms ( id, code, name ),
  social_campaigns ( id, name, status ),
  products ( id, name, sku, price, stock, product_categories ( name ) )
`;

export function mapSocialPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    campaign_id: row.campaign_id,
    platform_id: row.platform_id,
    product_id: row.product_id,
    product_name: row.products?.name ?? null,
    product_sku: row.products?.sku ?? null,
    product_category: row.products?.product_categories?.name ?? null,
    platform_code: row.social_platforms?.code ?? null,
    platform_name: row.social_platforms?.name ?? null,
    campaign_name: row.social_campaigns?.name ?? null,
    title: row.title,
    content: row.content,
    status: row.status,
    scheduled_at: row.scheduled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function buildSocialPostPayload({
  title,
  content,
  platformId,
  campaignId,
  productId,
  status,
  scheduledAt,
}) {
  const payload = {
    title: title.trim(),
    content: content.trim(),
    platform_id: platformId,
    campaign_id: campaignId || null,
    product_id: productId || null,
    status: status ?? 'draft',
  };

  if (scheduledAt) {
    payload.scheduled_at = scheduledAt;
  }

  return payload;
}

export async function createManualSocialPost(form) {
  const payload = buildSocialPostPayload(form);
  return createSocialPost(payload);
}

export async function getSocialPlatforms() {
  return selectMany(
    'social_platforms',
    'id, code, name, is_active',
    { eq: { is_active: true }, order: 'name' },
    'plataformas sociales',
  );
}

export async function getSocialCampaigns() {
  return selectMany(
    'social_campaigns',
    'id, name, status, starts_at, ends_at',
    { order: 'created_at', ascending: false },
    'campañas sociales',
  );
}

export async function getSocialPosts() {
  const rows = await selectMany(
    'social_posts',
    POST_SELECT,
    { order: 'created_at', ascending: false },
    'publicaciones sociales',
  );
  return rows.map(mapSocialPost);
}

export async function createSocialPost(post) {
  const row = await insertOne('social_posts', post, POST_SELECT, 'crear publicación social');
  return mapSocialPost(row);
}

export async function updateSocialPost(id, patch) {
  const row = await updateOne('social_posts', id, patch, POST_SELECT, 'actualizar publicación');
  return mapSocialPost(row);
}

export async function deleteSocialPost(id) {
  return deleteOne('social_posts', id, 'eliminar publicación');
}

/** @deprecated Usar aiContentService.generateSocialPost */
export function generateSocialContentFromPrompt(prompt, { storeName = 'NutriStore' } = {}) {
  const topic = (prompt ?? '').trim() || 'suplementos nutricionales';
  return (
    `💪 ${storeName} — ${topic}\n\n` +
    `Descubre productos de calidad para alcanzar tus metas. ` +
    `Proteínas, vitaminas y asesoría personalizada.\n\n` +
    `#NutriStore #Suplementos #Fitness #Salud\n\n` +
    `👉 Visita nuestro catálogo y consulta con NutriBot.`
  );
}

export async function saveAiGeneratedContent({
  socialPostId,
  prompt,
  generatedText,
  modelName = 'nutristore-template-v1',
  status = 'completed',
}) {
  return insertOne(
    'ai_generated_contents',
    {
      social_post_id: socialPostId ?? null,
      prompt,
      generated_text: generatedText,
      model_name: modelName,
      status,
    },
    'id, social_post_id, prompt, generated_text, model_name, status, created_at',
    'guardar contenido IA',
  );
}

export async function getAiContentsForPost(postId) {
  return selectMany(
    'ai_generated_contents',
    'id, prompt, generated_text, model_name, status, created_at',
    { eq: { social_post_id: postId }, order: 'created_at', ascending: false },
    'contenidos IA del post',
  );
}
