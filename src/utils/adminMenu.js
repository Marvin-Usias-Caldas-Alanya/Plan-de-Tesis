/** Secciones del panel de administración (/admin) */
export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Resumen general', icon: '📊' },
  { id: 'users', label: 'Usuarios y roles', icon: '👤' },
  { id: 'customers', label: 'Clientes', icon: '🛒' },
  { id: 'sellers', label: 'Vendedores', icon: '🧑‍💼' },
  { id: 'products', label: 'Productos', icon: '📦' },
  { id: 'categories', label: 'Categorías', icon: '🏷️' },
  { id: 'inventory', label: 'Inventario', icon: '📋' },
  { id: 'suppliers', label: 'Proveedores', icon: '🏭' },
  { id: 'purchases', label: 'Compras', icon: '🛍️' },
  { id: 'orders', label: 'Pedidos', icon: '📑' },
  { id: 'sales', label: 'Ventas', icon: '💰' },
  { id: 'payments', label: 'Pagos', icon: '💳' },
  { id: 'promotions', label: 'Promociones y cupones', icon: '🎟️' },
  { id: 'chatbot', label: 'Configuración del Chatbot', icon: '🤖' },
  { id: 'handoff', label: 'Handoff humano', icon: '🤝' },
  { id: 'tickets', label: 'Tickets de soporte', icon: '🎫' },
  { id: 'social', label: 'Redes sociales', icon: '📱' },
  { id: 'ai-posts', label: 'Publicaciones IA', icon: '✨' },
  { id: 'campaigns', label: 'Campañas', icon: '📣' },
  { id: 'metrics', label: 'Métricas', icon: '📈' },
  { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
  { id: 'settings', label: 'Configuración del sistema', icon: '⚙️' },
  { id: 'audit', label: 'Auditoría', icon: '📜' },
  { id: 'errors', label: 'Errores del sistema', icon: '⚠️' },
  { id: 'reports', label: 'Reportes / KPIs', icon: '📉' },
];

export function getAdminSection(id) {
  return ADMIN_SECTIONS.find((s) => s.id === id) ?? ADMIN_SECTIONS[0];
}
