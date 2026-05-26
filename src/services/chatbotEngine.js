import { formatProductPrice } from '../utils/productFormatters';
import { GOAL_RULES_LEGACY } from '../utils/chatbotGoalRules';

const GREETING_PATTERNS = [
  /hola\b/i,
  /buenos?\s*d[ií]as?/i,
  /buenas?\s*tardes?/i,
  /buenas?\s*noches?/i,
  /hey\b/i,
];

const PURCHASE_PATTERNS = [
  /quiero\s+comprar/i,
  /deseo\s+comprar/i,
  /quiero\s+hacer\s+un\s+pedido/i,
  /deseo\s+pagar/i,
  /quiero\s+pagar/i,
  /deseo\s+hacer\s+un\s+pedido/i,
  /realizar\s+compra/i,
  /hacer\s+pedido/i,
];

const HANDOFF_PATTERNS = [
  /quiero\s+hablar\s+con\s+un\s+vendedor/i,
  /necesito\s+ayuda\s+humana/i,
  /hablar\s+con\s+(un\s+)?(asesor|vendedor|persona)/i,
  /atenci[oó]n\s+humana/i,
  /quiero\s+un\s+vendedor/i,
  /necesito\s+un\s+vendedor/i,
  ...PURCHASE_PATTERNS,
];

function normalize(text) {
  return (text ?? '').trim().toLowerCase();
}

function matchesAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function patternToRegex(pattern) {
  if (pattern instanceof RegExp) return pattern;
  const raw = String(pattern ?? '').trim();
  if (!raw) return null;
  try {
    return new RegExp(raw, 'i');
  } catch {
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i');
  }
}

function keywordsToPatterns(keywords) {
  if (!keywords) return [];
  return String(keywords)
    .split('|')
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => patternToRegex(k))
    .filter(Boolean);
}

export function buildHandoffPatterns(keywordsPipe) {
  const custom = keywordsToPatterns(keywordsPipe);
  return custom.length ? [...HANDOFF_PATTERNS, ...custom] : HANDOFF_PATTERNS;
}

/**
 * Evalúa reglas de public.chatbot_rules (ordenadas por prioridad).
 */
export function matchDatabaseRule(message, dbRules = []) {
  const text = normalize(message);
  if (!text || !dbRules?.length) return null;

  for (const rule of dbRules) {
    const regex = patternToRegex(rule.intent_pattern);
    if (regex && regex.test(text)) {
      return {
        intent: rule.rule_code,
        content: rule.response_template,
        shouldHandoff: Boolean(rule.triggers_handoff),
        recommendedProducts: [],
        fromDatabase: true,
      };
    }
  }
  return null;
}

/**
 * Evalúa intenciones de chatbot_intent_definitions.
 */
export function matchIntentDefinition(message, intents = [], products = []) {
  const text = normalize(message);
  if (!text || !intents?.length) return null;

  const catalog = (products ?? []).filter((p) => p.is_active !== false);
  const sorted = [...intents].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  for (const intent of sorted) {
    const patterns = keywordsToPatterns(intent.keywords);
    if (!patterns.some((p) => p.test(text))) continue;

    let recommended = resolveRecommendedProducts(intent, catalog);
    if (
      (intent.intent_type === 'price' || intent.intent_type === 'stock') &&
      !recommended.length
    ) {
      recommended = searchProductsByText(message, catalog).slice(0, 4);
    }
    const list = formatProductList(recommended);
    let content = intent.response_template ?? '';

    if (intent.intent_type === 'goal' && recommended.length) {
      content = `${content}\n\n${list}\n\n¿Quieres más detalle o prefieres hablar con un vendedor?`;
    } else if (
      (intent.intent_type === 'price' || intent.intent_type === 'stock') &&
      recommended.length
    ) {
      content = `${content}\n\n${list}`;
    } else if (intent.intent_type === 'greeting' && !content) {
      content = '¡Hola! Soy NutriBot. ¿En qué te ayudo?';
    }

    return {
      intent: intent.intent_code,
      intentType: intent.intent_type,
      goal: intent.intent_type === 'goal' ? intent.intent_code : undefined,
      content,
      shouldHandoff: Boolean(intent.triggers_handoff),
      recommendedProducts: recommended,
      fromIntentConfig: true,
    };
  }

  return null;
}

function resolveRecommendedProducts(intent, catalog) {
  const ids = intent.recommended_product_ids ?? [];
  if (ids.length) {
    const byId = catalog.filter((p) => ids.includes(p.id));
    return byId.slice(0, 4);
  }

  if (intent.intent_type === 'goal') {
    return recommendProductsByGoal(intent.intent_code, catalog);
  }

  return [];
}

function productMatchesGoal(product, rule) {
  const name = normalize(product.name);
  const category = normalize(product.category ?? '');
  const slug = normalize(product.category_slug ?? '');

  const nameHit = rule.nameHints.some((h) => name.includes(h));
  const catHit = rule.categoryHints.some(
    (h) => category.includes(h) || slug.includes(h.replace(/\s/g, '-')),
  );
  return nameHit || catHit;
}

function searchProductsByText(message, products) {
  const text = normalize(message);
  const tokens = text.split(/\s+/).filter((t) => t.length > 2);

  return (products ?? []).filter((p) => {
    const blob = normalize(`${p.name} ${p.description} ${p.category} ${p.sku}`);
    return tokens.some((t) => blob.includes(t));
  });
}

export function recommendProductsByGoal(goalId, products = []) {
  const rule = GOAL_RULES_LEGACY.find((r) => r.id === goalId);
  if (!rule) return [];

  const matched = (products ?? []).filter(
    (p) => p.is_active !== false && productMatchesGoal(p, rule),
  );
  return matched.slice(0, 4);
}

function formatProductList(products) {
  if (!products?.length) return '';
  return products
    .map(
      (p) =>
        `• ${p.name} — ${formatProductPrice(p.price)} (${p.stock > 0 ? `${p.stock} en stock` : 'agotado'})`,
    )
    .join('\n');
}

function detectGoalLegacy(message) {
  const text = normalize(message);
  return GOAL_RULES_LEGACY.find((rule) => rule.keywords.some((p) => p.test(text))) ?? null;
}

/**
 * Detecta intención de compra en el mensaje del usuario.
 */
export function detectPurchaseIntent(message, keywordsPipe = null) {
  const text = normalize(message);
  const custom = keywordsToPatterns(keywordsPipe);
  const patterns = custom.length ? [...PURCHASE_PATTERNS, ...custom] : PURCHASE_PATTERNS;
  return matchesAny(text, patterns);
}

/**
 * Detecta intención de handoff humano.
 */
export function detectHumanHandoffIntent(message, keywordsPipe = null) {
  const text = normalize(message);
  const patterns = buildHandoffPatterns(keywordsPipe);
  return matchesAny(text, patterns);
}

function isGreeting(message) {
  const text = normalize(message);
  return !text || matchesAny(text, GREETING_PATTERNS);
}

/**
 * Genera respuesta del bot basada en reglas e intenciones de BD (con fallback local).
 * @param {string} userMessage
 * @param {Array} products
 * @param {object} engineConfig - { rules, intents, handoffKeywords, autoMessages }
 */
export function generateBotResponse(userMessage, products = [], engineConfig = {}) {
  const text = normalize(userMessage);
  const catalog = (products ?? []).filter((p) => p.is_active !== false);

  const dbRules = engineConfig.rules ?? engineConfig.dbRules ?? [];
  const dbIntents = engineConfig.intents ?? [];
  const handoffKeywords = engineConfig.handoffKeywords ?? null;
  const autoMessages = engineConfig.autoMessages ?? {};

  const dbMatch = matchDatabaseRule(text, dbRules);
  if (dbMatch) {
    if (dbMatch.shouldHandoff && autoMessages.handoff) {
      dbMatch.content = `${dbMatch.content}\n\n${autoMessages.handoff}`;
    }
    return dbMatch;
  }

  const intentMatch = matchIntentDefinition(text, dbIntents, catalog);
  if (intentMatch) {
    if (intentMatch.intentType === 'greeting' && autoMessages.greeting) {
      intentMatch.content = autoMessages.greeting;
    }
    if (intentMatch.shouldHandoff && autoMessages.handoff) {
      intentMatch.content = `${intentMatch.content}\n\n${autoMessages.handoff}`;
    }
    return intentMatch;
  }

  if (detectHumanHandoffIntent(text, handoffKeywords)) {
    return {
      intent: 'handoff',
      shouldHandoff: true,
      content:
        autoMessages.handoff ??
        'Entiendo que prefieres atención personalizada. Voy a solicitar que un vendedor humano te ayude con tu consulta o compra.',
      recommendedProducts: [],
    };
  }

  if (detectPurchaseIntent(text, handoffKeywords)) {
    return {
      intent: 'purchase',
      shouldHandoff: true,
      content:
        '¡Perfecto! Detecté interés de compra. Puedo conectarte con un vendedor para cerrar tu pedido y confirmar pago/envío.',
      recommendedProducts: catalog.slice(0, 3),
    };
  }

  if (isGreeting(text)) {
    return {
      intent: 'greeting',
      content:
        autoMessages.greeting ??
        '¡Hola! Soy NutriBot, tu asistente de NutriStore. Puedo recomendarte suplementos según tus objetivos (masa muscular, bajar de peso, energía, recuperación o vitaminas), informarte sobre productos o conectarte con un vendedor.',
      recommendedProducts: [],
    };
  }

  const goal = detectGoalLegacy(text);
  if (goal) {
    const recommended = recommendProductsByGoal(goal.id, catalog);
    const list = formatProductList(recommended);

    return {
      intent: 'goal',
      goal: goal.id,
      content: recommended.length
        ? `Para ${goal.label}, te recomiendo estos productos del catálogo:\n\n${list}\n\n¿Quieres más detalle de alguno o prefieres hablar con un vendedor?`
        : `Para ${goal.label}, por ahora no tengo productos específicos en catálogo. ¿Te conecto con un vendedor para asesoría personalizada?`,
      recommendedProducts: recommended,
    };
  }

  if (/precio|cuesta|cu[aá]nto|costo/.test(text)) {
    const matched = searchProductsByText(text, catalog).slice(0, 4);
    return {
      intent: 'price',
      content: matched.length
        ? `Estos productos coinciden con tu consulta:\n\n${formatProductList(matched)}`
        : 'Indica el nombre del producto y te comparto el precio actualizado.',
      recommendedProducts: matched,
    };
  }

  if (/stock|disponible|hay|inventario|agotado/.test(text)) {
    const matched = searchProductsByText(text, catalog).slice(0, 4);
    return {
      intent: 'stock',
      content: matched.length
        ? `Disponibilidad consultada:\n\n${formatProductList(matched)}`
        : 'Dime qué producto buscas y reviso el stock por ti.',
      recommendedProducts: matched,
    };
  }

  const matched = searchProductsByText(text, catalog).slice(0, 4);
  if (matched.length) {
    return {
      intent: 'product_search',
      content: `Encontré estos productos relacionados:\n\n${formatProductList(matched)}`,
      recommendedProducts: matched,
    };
  }

  return {
    intent: 'general',
    content:
      autoMessages.fallback ??
      'Puedo ayudarte con recomendaciones por objetivo (masa muscular, bajar de peso, energía, recuperación, vitaminas), precios, stock o conectarte con un vendedor. ¿Qué necesitas?',
    recommendedProducts: [],
  };
}

/**
 * Punto de extensión para IA — sustituir implementación interna más adelante.
 */
export async function generateBotResponseWithAi(userMessage, products, context = {}) {
  return generateBotResponse(userMessage, products, context);
}
