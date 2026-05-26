import { countRows, getSupabaseClient, handleSupabaseError, selectMany } from './baseService';
import { getHandoffRequests } from './handoffService';
import { getAllNotifications } from './notificationService';

export { getHandoffRequests };

export async function getDashboardStats() {
  const supabase = getSupabaseClient();

  const [
    users,
    customers,
    sellers,
    products,
    activeProducts,
    orders,
    sales,
    payments,
    conversations,
    pendingHandoffs,
    tickets,
    socialPosts,
    unreadNotifications,
    auditLogs,
    errorLogs,
  ] = await Promise.all([
    countRows('profiles', {}, 'contar usuarios'),
    countRows('customers', {}, 'contar clientes'),
    countRows('sellers', {}, 'contar vendedores'),
    countRows('products', {}, 'contar productos'),
    countRows('products', { is_active: true }, 'contar productos activos'),
    countRows('orders', {}, 'contar pedidos'),
    countRows('sales', {}, 'contar ventas'),
    countRows('payments', {}, 'contar pagos'),
    countRows('conversations', {}, 'contar conversaciones'),
    countRows('handoff_requests', { status: 'pending' }, 'contar handoffs'),
    countRows('support_tickets', { status: 'open' }).catch(() => countRows('support_tickets')),
    countRows('social_posts', {}, 'contar posts'),
    countRows('notifications', { is_read: false }).catch(() => Promise.resolve(0)),
    countRows('audit_logs', {}, 'contar auditoría'),
    countRows('error_logs', {}, 'contar errores'),
  ]);

  const { count: lowStock, error: lowStockError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .lte('stock', 5)
    .eq('is_active', true);

  if (lowStockError) handleSupabaseError(lowStockError, 'contar stock bajo');

  const { count: pendingOrdersCount, error: pendingOrdersError } = await supabase
    .from('orders')
    .select('id, order_statuses!inner(code)', { count: 'exact', head: true })
    .eq('order_statuses.code', 'pending');

  if (pendingOrdersError) handleSupabaseError(pendingOrdersError, 'contar pedidos pendientes');

  return {
    users,
    customers,
    sellers,
    products,
    activeProducts,
    lowStock: lowStock ?? 0,
    orders,
    pendingOrders: pendingOrdersCount ?? 0,
    sales,
    payments,
    conversations,
    pendingHandoffs,
    tickets,
    socialPosts,
    unreadNotifications,
    auditLogs,
    errorLogs,
  };
}

export async function getAllConversations() {
  return selectMany(
    'conversations',
    `
      id,
      customer_name,
      customer_email,
      status,
      channel,
      created_at,
      updated_at
    `,
    { order: 'updated_at', ascending: false, limit: 100 },
    'listar conversaciones admin',
  );
}

export { getAllNotifications };
