import { useState } from 'react';
import { getAdminSection } from '../utils/adminMenu';
import { useAdminFeedback } from '../hooks/useAdminFeedback';
import AdminLayout from '../components/dashboard/AdminLayout';
import AdminOverviewPanel from '../components/admin/AdminOverviewPanel';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import AdminProductsPanel from '../components/admin/AdminProductsPanel';
import AdminInventoryPanel from '../components/admin/AdminInventoryPanel';
import AdminOrdersPanel from '../components/admin/AdminOrdersPanel';
import AdminSalesPanel from '../components/admin/AdminSalesPanel';
import AdminPaymentsPanel from '../components/admin/AdminPaymentsPanel';
import AdminChatbotPanel from '../components/admin/AdminChatbotPanel';
import AdminSocialPostsPanel from '../components/admin/AdminSocialPostsPanel';
import AdminCampaignsPanel from '../components/admin/AdminCampaignsPanel';
import AdminSettingsPanel from '../components/admin/AdminSettingsPanel';
import AdminAuditPanel from '../components/admin/AdminAuditPanel';
import AdminCategoriesPanel from '../components/admin/AdminCategoriesPanel';
import AdminSuppliersPanel from '../components/admin/AdminSuppliersPanel';
import AdminPromotionsPanel from '../components/admin/AdminPromotionsPanel';
import AdminHandoffPanel from '../components/admin/AdminHandoffPanel';
import AdminErrorsPanel from '../components/admin/AdminErrorsPanel';
import AdminGenericListPanel from '../components/admin/AdminGenericListPanel';
import { getAllCustomers, getAllSellers, getSupportTickets } from '../services/userService';
import { getPurchases } from '../services/purchaseService';
import { getAllNotifications } from '../services/adminService';
import { getAllAiGeneratedContents, getSocialMetrics } from '../services/socialMediaService';

const SECTION_DESCRIPTIONS = {
  overview: 'Vista general del sistema NutriStore y métricas clave.',
  users: 'Gestión de perfiles, roles y estado de cuentas.',
  customers: 'Clientes registrados y puntos de lealtad.',
  sellers: 'Vendedores y disponibilidad para handoff.',
  products: 'Catálogo: alta, edición, precios y stock.',
  categories: 'Categorías de product_categories.',
  inventory: 'Stock, entradas y salidas de inventario.',
  suppliers: 'Proveedores del negocio.',
  purchases: 'Órdenes de compra a proveedores.',
  orders: 'Pedidos de clientes y cambio de estado.',
  sales: 'Ventas cerradas.',
  payments: 'Pagos y métodos de pago.',
  promotions: 'Promociones y cupones.',
  chatbot: 'Reglas, intenciones, handoff, mensajes automáticos y vista previa del bot.',
  handoff: 'Solicitudes de atención humana.',
  tickets: 'Tickets de soporte.',
  social: 'Publicaciones en redes sociales.',
  'ai-posts': 'Contenidos generados con IA.',
  campaigns: 'Campañas de marketing.',
  metrics: 'Métricas de publicaciones sociales.',
  notifications: 'Notificaciones del sistema.',
  settings: 'Parámetros en system_settings.',
  audit: 'Registro de auditoría.',
  errors: 'Logs de errores.',
  reports: 'Indicadores y KPIs del negocio.',
};

function AdminSectionContent({ section, onFeedback }) {
  switch (section) {
    case 'overview':
      return <AdminOverviewPanel onFeedback={onFeedback} />;
    case 'reports':
      return <AdminOverviewPanel variant="reports" onFeedback={onFeedback} />;
    case 'users':
      return <AdminUsersPanel onFeedback={onFeedback} />;
    case 'customers':
      return (
        <AdminGenericListPanel
          title="Clientes"
          emptyTitle="Sin clientes"
          loadRows={getAllCustomers}
          onFeedback={onFeedback}
          columns={[
            { key: 'full_name', label: 'Nombre' },
            { key: 'email', label: 'Correo' },
            { key: 'loyalty_points', label: 'Puntos' },
          ]}
        />
      );
    case 'sellers':
      return (
        <AdminGenericListPanel
          title="Vendedores"
          emptyTitle="Sin vendedores"
          loadRows={getAllSellers}
          onFeedback={onFeedback}
          columns={[
            { key: 'full_name', label: 'Nombre' },
            { key: 'employee_code', label: 'Código' },
            {
              key: 'is_available',
              label: 'Disponible',
              render: (r) => (r.is_available ? 'Sí' : 'No'),
            },
          ]}
        />
      );
    case 'products':
      return <AdminProductsPanel onFeedback={onFeedback} />;
    case 'categories':
      return <AdminCategoriesPanel onFeedback={onFeedback} />;
    case 'inventory':
      return <AdminInventoryPanel onFeedback={onFeedback} />;
    case 'suppliers':
      return <AdminSuppliersPanel onFeedback={onFeedback} />;
    case 'purchases':
      return (
        <AdminGenericListPanel
          title="Compras"
          emptyTitle="Sin compras"
          loadRows={getPurchases}
          onFeedback={onFeedback}
          columns={[
            { key: 'reference_code', label: 'Referencia' },
            { key: 'supplier_name', label: 'Proveedor' },
            { key: 'status', label: 'Estado' },
          ]}
        />
      );
    case 'orders':
      return <AdminOrdersPanel onFeedback={onFeedback} />;
    case 'sales':
      return <AdminSalesPanel onFeedback={onFeedback} />;
    case 'payments':
      return <AdminPaymentsPanel onFeedback={onFeedback} />;
    case 'promotions':
      return <AdminPromotionsPanel onFeedback={onFeedback} />;
    case 'chatbot':
      return <AdminChatbotPanel onFeedback={onFeedback} />;
    case 'handoff':
      return <AdminHandoffPanel onFeedback={onFeedback} />;
    case 'tickets':
      return (
        <AdminGenericListPanel
          title="Tickets de soporte"
          emptyTitle="Sin tickets"
          loadRows={getSupportTickets}
          onFeedback={onFeedback}
          columns={[
            { key: 'ticket_number', label: 'Nº' },
            { key: 'subject', label: 'Asunto' },
            { key: 'status', label: 'Estado' },
          ]}
        />
      );
    case 'social':
      return <AdminSocialPostsPanel onFeedback={onFeedback} />;
    case 'ai-posts':
      return (
        <AdminGenericListPanel
          title="Publicaciones IA"
          emptyTitle="Sin contenidos IA"
          loadRows={getAllAiGeneratedContents}
          onFeedback={onFeedback}
          columns={[
            { key: 'post_title', label: 'Post' },
            { key: 'model_name', label: 'Modelo' },
            { key: 'status', label: 'Estado' },
          ]}
        />
      );
    case 'campaigns':
      return <AdminCampaignsPanel onFeedback={onFeedback} />;
    case 'metrics':
      return (
        <AdminGenericListPanel
          title="Métricas sociales"
          emptyTitle="Sin métricas"
          loadRows={getSocialMetrics}
          onFeedback={onFeedback}
          columns={[
            { key: 'post_title', label: 'Publicación' },
            { key: 'impressions', label: 'Impresiones' },
            { key: 'likes', label: 'Likes' },
          ]}
        />
      );
    case 'notifications':
      return (
        <AdminGenericListPanel
          title="Notificaciones"
          emptyTitle="Sin notificaciones"
          loadRows={getAllNotifications}
          onFeedback={onFeedback}
          columns={[
            { key: 'title', label: 'Título' },
            { key: 'type', label: 'Tipo' },
            {
              key: 'is_read',
              label: 'Leída',
              render: (r) => (r.is_read ? 'Sí' : 'No'),
            },
          ]}
        />
      );
    case 'settings':
      return <AdminSettingsPanel onFeedback={onFeedback} />;
    case 'audit':
      return <AdminAuditPanel onFeedback={onFeedback} />;
    case 'errors':
      return <AdminErrorsPanel onFeedback={onFeedback} />;
    default:
      return <AdminOverviewPanel onFeedback={onFeedback} />;
  }
}

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const { feedback, onFeedback, clearFeedback } = useAdminFeedback();
  const sectionMeta = getAdminSection(activeSection);

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      title={sectionMeta.label}
      description={SECTION_DESCRIPTIONS[activeSection]}
      feedback={feedback}
      onClearFeedback={clearFeedback}
    >
      <AdminSectionContent section={activeSection} onFeedback={onFeedback} />
    </AdminLayout>
  );
}
