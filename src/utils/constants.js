export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/registro',
  CATALOG: '/catalogo',
  CART: '/carrito',
  CHECKOUT: '/checkout',
  ORDERS: '/mis-pedidos',
  PROFILE: '/perfil',
  ADMIN_DASHBOARD: '/admin',
  SELLER_DASHBOARD: '/vendedor',
  MOCKUPS: '/mockups',
};

/** Estados de public.conversations.status */
export const CHAT_STATUS = {
  BOT: 'bot',
  PENDING_HANDOFF: 'pending_handoff',
  HUMAN: 'human',
  CLOSED: 'closed',
};

export const APP_NAME = 'Nutriland Sport';
export const APP_TAGLINE = 'Impulsando tu mejor versión';

/** Mensaje fijo al cliente cuando se activa handoff humano */
export const HANDOFF_CLIENT_MESSAGE =
  'Te estamos derivando con un vendedor humano para continuar con tu compra.';

export const CONVERSATION_STATUS_LABELS = {
  [CHAT_STATUS.BOT]: 'Bot',
  [CHAT_STATUS.PENDING_HANDOFF]: 'Pendiente de vendedor',
  [CHAT_STATUS.HUMAN]: 'Atención humana',
  [CHAT_STATUS.CLOSED]: 'Cerrada',
};
