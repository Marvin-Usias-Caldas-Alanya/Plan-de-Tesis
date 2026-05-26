export function buildOverviewStats(data) {
  if (!data) return [];
  return [
    { label: 'Usuarios', value: String(data.users ?? 0) },
    { label: 'Clientes', value: String(data.customers ?? 0) },
    { label: 'Vendedores', value: String(data.sellers ?? 0) },
    { label: 'Productos activos', value: String(data.activeProducts ?? 0) },
    { label: 'Pedidos', value: String(data.orders ?? 0) },
    { label: 'Handoffs pendientes', value: String(data.pendingHandoffs ?? 0) },
    { label: 'Ventas', value: String(data.sales ?? 0) },
    { label: 'Bajo stock', value: String(data.lowStock ?? 0), hint: '≤ 5 unidades' },
  ];
}

export function buildReportStats(data) {
  if (!data) return [];
  return [
    { label: 'Conversaciones', value: String(data.conversations ?? 0) },
    { label: 'Tickets abiertos', value: String(data.tickets ?? 0) },
    { label: 'Publicaciones sociales', value: String(data.socialPosts ?? 0) },
    { label: 'Pagos registrados', value: String(data.payments ?? 0) },
    { label: 'Notificaciones sin leer', value: String(data.unreadNotifications ?? 0) },
    { label: 'Registros auditoría', value: String(data.auditLogs ?? 0) },
    { label: 'Errores sistema', value: String(data.errorLogs ?? 0) },
    { label: 'Pedidos pendientes', value: String(data.pendingOrders ?? 0) },
  ];
}
