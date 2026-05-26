export const CHATBOT_INTENT_TYPES = [
  { id: 'goal', label: 'Objetivo / recomendación' },
  { id: 'handoff', label: 'Handoff humano' },
  { id: 'purchase', label: 'Intención de compra' },
  { id: 'price', label: 'Consulta de precio' },
  { id: 'stock', label: 'Consulta de stock' },
  { id: 'greeting', label: 'Saludo' },
  { id: 'auto', label: 'Mensaje automático' },
  { id: 'general', label: 'General' },
];

export const CHATBOT_GOAL_OPTIONS = [
  { id: 'muscle_mass', label: 'Ganar masa muscular' },
  { id: 'weight_loss', label: 'Bajar de peso' },
  { id: 'energy', label: 'Energía' },
  { id: 'recovery', label: 'Recuperación' },
  { id: 'vitamins', label: 'Vitaminas' },
];

export const SETTING_HANDOFF_KEYWORDS = 'chatbot_handoff_keywords';
export const SETTING_AUTO_MESSAGES = 'chatbot_auto_messages';
