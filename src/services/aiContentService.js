import { formatProductPrice } from '../utils/productFormatters';
import { PLATFORM_HASHTAGS } from '../utils/socialAiConstants';
import { createSocialPost } from './socialService';
import { saveAiGeneratedContent } from './socialService';

/** Identificador del motor simulado (sustituir por API real, p. ej. OpenAI / Edge Function). */
export const AI_MODEL_SIMULATED = 'nutristore-rules-v1';

const TONE_OPENERS = {
  promocional: ['🔥 ¡Oferta NutriStore!', '💪 Potencia tu rutina con', '⭐ Destacado del catálogo:'],
  informativo: ['📋 Te contamos sobre', 'ℹ️ Sabías que', '✅ Información útil:'],
  juvenil: ['🚀 ¡A darle con todo!', '💥 Bro, mira esto:', '🔥 En el gym se habla de'],
  profesional: ['En NutriStore recomendamos', 'Para objetivos de rendimiento:', 'Asesoría NutriStore:'],
  urgente: ['⏰ ¡Últimas unidades!', '🚨 No te quedes sin', '⚡ Stock limitado en'],
};

const OBJECTIVE_LINES = {
  vender: 'Aprovecha y lleva el tuyo hoy. Escríbenos o visita el catálogo.',
  informar: 'Conoce beneficios, dosis sugeridas y combínalo con buena nutrición.',
  lanzar_promocion: 'Promoción vigente por tiempo limitado. Consulta condiciones en tienda.',
  recuperar_clientes: 'Te extrañamos. Vuelve con asesoría personalizada y envío rápido.',
  anunciar_stock: 'Ya tenemos disponibilidad. Reserva el tuyo antes de que se agote.',
};

function normalizePlatform(platform) {
  const code = typeof platform === 'string' ? platform : platform?.code ?? 'instagram';
  return code.toLowerCase();
}

function productLabel(product) {
  if (!product?.name) return 'nuestros suplementos';
  const price = product.price != null ? ` — ${formatProductPrice(product.price)}` : '';
  const stock =
    product.stock != null
      ? product.stock > 0
        ? ` (${product.stock} en stock)`
        : ' (consultar disponibilidad)'
      : '';
  return `${product.name}${price}${stock}`;
}

/**
 * Construye el prompt estructurado para trazabilidad y futura API IA.
 */
export function buildGenerationPrompt({ product, platform, tone, objective }) {
  const platformCode = normalizePlatform(platform);
  return JSON.stringify({
    product_id: product?.id ?? null,
    product_name: product?.name ?? null,
    platform: platformCode,
    tone,
    objective,
    store: 'NutriStore',
  });
}

/**
 * Genera caption según producto, plataforma y tono.
 * @param {{ product?: object, platform: string|object, tone: string }} params
 */
export function generateCaption({ product, platform, tone = 'promocional' }) {
  const platformCode = normalizePlatform(platform);
  const openers = TONE_OPENERS[tone] ?? TONE_OPENERS.promocional;
  const opener = openers[Math.floor(Math.random() * openers.length)];
  const label = productLabel(product);
  const hashtags = PLATFORM_HASHTAGS[platformCode] ?? PLATFORM_HASHTAGS.instagram;

  let body = `${opener} ${label}.`;
  if (product?.description) {
    const short = product.description.slice(0, 120);
    body += ` ${short}${product.description.length > 120 ? '…' : ''}`;
  }

  if (platformCode === 'whatsapp') {
    return `${body}\n\n${hashtags}`;
  }

  return `${body}\n\n${hashtags}`;
}

/**
 * Genera título + contenido completo para publicación social.
 * Preparado para delegar a `callExternalAiApi()` en el futuro.
 */
export function generateSocialPost({
  product,
  platform,
  tone = 'promocional',
  objective = 'vender',
}) {
  const platformCode = normalizePlatform(platform);
  const caption = generateCaption({ product, platform: platformCode, tone });
  const objectiveLine = OBJECTIVE_LINES[objective] ?? OBJECTIVE_LINES.vender;
  const productName = product?.name ?? 'Suplementos NutriStore';

  const title = `${productName} | ${tone} · ${platformCode}`;

  const content = `${caption}\n\n${objectiveLine}\n\n— NutriStore · Sistema híbrido IA + asesoría humana`;

  const prompt = buildGenerationPrompt({ product, platform: platformCode, tone, objective });

  return {
    title,
    content,
    caption,
    prompt,
    modelName: AI_MODEL_SIMULATED,
    metadata: { platform: platformCode, tone, objective },
  };
}

/**
 * Punto de extensión para API IA real (no implementado).
 * @returns {Promise<{ title: string, content: string, caption: string, prompt: string, modelName: string }>}
 */
export async function callExternalAiApi(_params) {
  throw new Error(
    'Integración de API IA externa no configurada. Use generateSocialPost() o configure callExternalAiApi.',
  );
}

/**
 * Persiste registro en ai_generated_contents.
 */
export async function saveGeneratedContent({
  socialPostId = null,
  prompt,
  generatedText,
  modelName = AI_MODEL_SIMULATED,
  status = 'completed',
}) {
  return saveAiGeneratedContent({
    socialPostId,
    prompt,
    generatedText,
    modelName,
    status,
  });
}

/**
 * Crea social_posts y vincula contenido IA generado.
 */
export async function createSocialPostFromAI({
  title,
  content,
  platformId,
  campaignId = null,
  productId = null,
  status = 'draft',
  scheduledAt = null,
  prompt,
  generatedText,
  modelName = AI_MODEL_SIMULATED,
}) {
  const post = await createSocialPost({
    title,
    content,
    platform_id: platformId,
    campaign_id: campaignId || null,
    product_id: productId || null,
    status,
    scheduled_at: scheduledAt || null,
  });

  const aiRecord = await saveGeneratedContent({
    socialPostId: post.id,
    prompt: prompt ?? buildGenerationPrompt({ platform: post.platform_code }),
    generatedText: generatedText ?? content,
    modelName,
  });

  return { post, aiRecord };
}
