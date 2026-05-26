import MockupFrame from './MockupFrame';
import { MockAdminShell, MockStat, MockTable } from './mockupUi';

export default function InventoryMockup() {
  return (
    <MockupFrame url="nutristore.app/admin/inventario" fileName="mockup-inventory.png">
      <MockAdminShell
        sidebarActive="Inventario"
        title="Gestión de inventario"
        subtitle="Entradas, salidas, saldos y alertas de stock"
      >
        <div className="mock-ui__grid mock-ui__grid--3">
          <MockStat label="SKUs en almacén" value="128" trend="Activos" />
          <MockStat label="Alertas stock bajo" value="5" trend="Revisar" />
          <MockStat label="Movimientos hoy" value="23" trend="+4 vs ayer" />
        </div>
        <MockTable
          columns={['Producto', 'Entrada', 'Salida', 'Saldo', 'Ubicación', 'Estado']}
          rows={[
            ['Whey Protein Gold', '+20', '-8', '42', 'A-12', 'OK'],
            ['Pre-Workout Ignite', '+10', '-12', '7', 'B-03', 'Stock bajo'],
            ['Creatina Monohidratada', '+15', '-5', '18', 'A-08', 'OK'],
            ['Multivitamínico Active', '+8', '-3', '55', 'C-01', 'OK'],
          ]}
        />
      </MockAdminShell>
    </MockupFrame>
  );
}
