import MockupFrame from './MockupFrame';
import { MockAdminShell, MockStat, MockChart } from './mockupUi';
import { MOCK_STATS } from './mockupData';

export default function AdminDashboardMockup() {
  return (
    <MockupFrame url="nutristore.app/admin" fileName="mockup-admin-dashboard.png">
      <MockAdminShell
        sidebarActive="Resumen"
        title="Panel administrador"
        subtitle="Vista general del negocio NutriStore"
      >
        <div className="mock-ui__grid mock-ui__grid--4">
          {MOCK_STATS.map((s) => (
            <MockStat key={s.label} label={s.label} value={s.value} trend={s.trend} />
          ))}
        </div>
        <div className="mock-ui__grid mock-ui__grid--2 mock-ui__grid--spaced">
          <MockChart
            title="Ventas semanales (simulado)"
            bars={[
              { label: 'L', value: 40 },
              { label: 'M', value: 65 },
              { label: 'X', value: 52 },
              { label: 'J', value: 78 },
              { label: 'V', value: 90 },
            ]}
          />
          <div className="mock-ui__panel">
            <strong className="mock-ui__panel-title">Actividad reciente</strong>
            <ul className="mock-ui__list">
              <li>Handoff #104 asignado a vendedor</li>
              <li>Publicación IA generada para Instagram</li>
              <li>Stock actualizado: Creatina Monohidratada</li>
              <li>Nuevo pedido #892 en proceso</li>
            </ul>
          </div>
        </div>
      </MockAdminShell>
    </MockupFrame>
  );
}
