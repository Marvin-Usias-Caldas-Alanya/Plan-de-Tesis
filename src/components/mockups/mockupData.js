export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Whey Protein Gold',
    category: 'Proteínas',
    price: 189.9,
    stock: 42,
    badge: 'Best seller',
  },
  {
    id: 2,
    name: 'Creatina Monohidratada',
    category: 'Creatinas',
    price: 79.5,
    stock: 18,
    badge: null,
  },
  {
    id: 3,
    name: 'Pre-Workout Ignite',
    category: 'Pre-entrenos',
    price: 129.0,
    stock: 7,
    badge: 'Stock bajo',
  },
  {
    id: 4,
    name: 'Multivitamínico Active',
    category: 'Vitaminas',
    price: 59.9,
    stock: 55,
    badge: null,
  },
];

export const MOCK_STATS = [
  { label: 'Ventas del mes', value: 'S/ 24.580', trend: '+12%' },
  { label: 'Pedidos activos', value: '38', trend: '+5' },
  { label: 'Handoffs pendientes', value: '4', trend: '-2' },
  { label: 'Publicaciones IA', value: '16', trend: '+3' },
];

export const MOCK_CHAT_MESSAGES = [
  { from: 'bot', text: '¡Hola! Soy NutriBot. ¿Buscas proteína, creatina o algo para definición?' },
  { from: 'user', text: 'Quiero ganar masa muscular, ¿qué me recomiendas?' },
  {
    from: 'bot',
    text: 'Te sugiero Whey Protein Gold y Creatina Monohidratada. ¿Deseas que un vendedor te ayude a comprar?',
  },
  { from: 'user', text: 'Sí, quiero comprar' },
  {
    from: 'system',
    text: 'Te estamos derivando con un vendedor humano para continuar con tu compra.',
  },
];

export const MOCK_SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'WhatsApp'];

export const MOCK_QUALITY_METRICS = [
  { label: 'Pruebas automatizadas', value: '196', status: 'ok' },
  { label: 'Cobertura de líneas', value: '76,6%', status: 'ok' },
  { label: 'ESLint', value: '0 warnings', status: 'ok' },
  { label: 'Build producción', value: 'Exitoso', status: 'ok' },
];
