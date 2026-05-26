import MockupFrame from './MockupFrame';
import { MockAdminShell, MockBtn, MockTable } from './mockupUi';
import { MOCK_PRODUCTS } from './mockupData';

export default function ProductManagementMockup() {
  const rows = MOCK_PRODUCTS.map((p) => [
    p.name,
    p.category,
    `S/ ${p.price.toFixed(2)}`,
    String(p.stock),
    'Activo',
  ]);

  return (
    <MockupFrame url="nutristore.app/admin/productos" fileName="mockup-product-management.png">
      <MockAdminShell
        sidebarActive="Productos"
        title="Gestión de productos"
        subtitle="Alta, edición, precios y estado del catálogo"
      >
        <div className="mock-ui__page-actions">
          <MockBtn>+ Nuevo producto</MockBtn>
          <MockBtn variant="ghost">Exportar CSV</MockBtn>
        </div>
        <MockTable
          columns={['Producto', 'Categoría', 'Precio', 'Stock', 'Estado']}
          rows={rows}
        />
      </MockAdminShell>
    </MockupFrame>
  );
}
