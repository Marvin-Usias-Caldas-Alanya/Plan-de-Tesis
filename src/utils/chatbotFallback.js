/** Reglas locales si Supabase no devuelve reglas activas. */
export const FALLBACK_CHATBOT_RULES = [
  {
    rule_code: 'greeting',
    intent_pattern: 'hola|buenos|buenas|hey',
    response_template:
      '¡Hola! Soy NutriBot, tu asistente de NutriStore. Puedo recomendarte suplementos, informarte precios/stock o conectarte con un vendedor.',
    priority: 10,
    triggers_handoff: false,
  },
  {
    rule_code: 'price',
    intent_pattern: 'precio|cuesta|cuánto|costo',
    response_template: 'Indica el nombre del producto y te comparto el precio actualizado.',
    priority: 20,
    triggers_handoff: false,
  },
  {
    rule_code: 'human',
    intent_pattern: 'asesor|humano|vendedor|atención humana',
    response_template: 'Te conecto con un vendedor humano para continuar.',
    priority: 5,
    triggers_handoff: true,
  },
];

/** Intenciones detectables locales (fallback). */
export const FALLBACK_CHATBOT_INTENTS = [
  {
    intent_code: 'greeting',
    label: 'Saludo',
    intent_type: 'greeting',
    keywords: 'hola|buenos|buenas|hey',
    response_template: '¡Hola! Soy NutriBot. ¿En qué te ayudo?',
    triggers_handoff: false,
    priority: 10,
    recommended_product_ids: [],
  },
  {
    intent_code: 'muscle_mass',
    label: 'Ganar masa muscular',
    intent_type: 'goal',
    keywords: 'masa muscular|ganar músculo|volumen|bulking',
    response_template: 'Para ganar masa muscular, te recomiendo estos productos:',
    triggers_handoff: false,
    priority: 20,
    recommended_product_ids: [],
  },
  {
    intent_code: 'weight_loss',
    label: 'Bajar de peso',
    intent_type: 'goal',
    keywords: 'bajar de peso|perder peso|definir|quemar grasa|adelgazar',
    response_template: 'Para bajar de peso, te recomiendo:',
    triggers_handoff: false,
    priority: 21,
    recommended_product_ids: [],
  },
  {
    intent_code: 'energy',
    label: 'Energía',
    intent_type: 'goal',
    keywords: 'energía|rendimiento|pre entreno|pre-entreno',
    response_template: 'Para energía y rendimiento:',
    triggers_handoff: false,
    priority: 22,
    recommended_product_ids: [],
  },
  {
    intent_code: 'recovery',
    label: 'Recuperación',
    intent_type: 'goal',
    keywords: 'recuperación|post entreno|después del entreno',
    response_template: 'Para recuperación muscular:',
    triggers_handoff: false,
    priority: 23,
    recommended_product_ids: [],
  },
  {
    intent_code: 'vitamins',
    label: 'Vitaminas',
    intent_type: 'goal',
    keywords: 'vitaminas|multivitam|salud general',
    response_template: 'Para salud y vitaminas:',
    triggers_handoff: false,
    priority: 24,
    recommended_product_ids: [],
  },
  {
    intent_code: 'price',
    label: 'Consulta de precio',
    intent_type: 'price',
    keywords: 'precio|cuesta|cuánto|costo',
    response_template: 'Te comparto precios de productos relacionados:',
    triggers_handoff: false,
    priority: 30,
    recommended_product_ids: [],
  },
  {
    intent_code: 'stock',
    label: 'Consulta de stock',
    intent_type: 'stock',
    keywords: 'stock|disponible|hay|inventario|agotado',
    response_template: 'Disponibilidad consultada:',
    triggers_handoff: false,
    priority: 31,
    recommended_product_ids: [],
  },
  {
    intent_code: 'purchase',
    label: 'Intención de compra',
    intent_type: 'purchase',
    keywords: 'quiero comprar|deseo comprar|hacer pedido|quiero pagar|realizar compra',
    response_template:
      '¡Perfecto! Detecté interés de compra. Puedo conectarte con un vendedor para cerrar tu pedido.',
    triggers_handoff: true,
    priority: 5,
    recommended_product_ids: [],
  },
  {
    intent_code: 'handoff',
    label: 'Handoff humano',
    intent_type: 'handoff',
    keywords: 'asesor|humano|vendedor|atención humana',
    response_template:
      'Entiendo que prefieres atención personalizada. Voy a solicitar un vendedor humano.',
    triggers_handoff: true,
    priority: 4,
    recommended_product_ids: [],
  },
];

export const DEFAULT_HANDOFF_KEYWORDS =
  'quiero hablar con un vendedor|necesito ayuda humana|hablar con un asesor|atención humana|quiero un vendedor|necesito un vendedor|quiero comprar|deseo comprar|quiero pagar';

export const DEFAULT_AUTO_MESSAGES = {
  greeting: '¡Hola! Soy NutriBot, tu asistente de NutriStore.',
  handoff: 'Te estamos derivando con un vendedor humano.',
  fallback:
    'Puedo ayudarte con recomendaciones, precios, stock o conectarte con un vendedor. ¿Qué necesitas?',
};
