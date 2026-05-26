import MockupFrame from './MockupFrame';
import { MockBadge, MockTable } from './mockupUi';

export default function SellerPanelMockup() {
  return (
    <MockupFrame url="nutristore.app/vendedor" fileName="mockup-seller-panel.png">
      <div className="mock-ui mock-ui--seller">
        <div className="mock-ui__seller-head">
          <div className="mock-ui__logo">
            <span className="mock-ui__logo-mark">N</span>
            Panel vendedor
          </div>
          <MockBadge tone="ok">Disponible</MockBadge>
        </div>
        <h3 className="mock-ui__title">Cola de conversaciones</h3>
        <p className="mock-ui__subtitle">Atención híbrida bot + humano</p>
        <MockTable
          columns={['ID', 'Cliente', 'Estado', 'Último mensaje', 'Acción']}
          rows={[
            ['#104', 'Juan Pérez', 'Handoff', 'Quiero comprar whey', 'Atender'],
            ['#103', 'Ana Ruiz', 'Bot', '¿Tienen pre-entreno?', 'Ver'],
            ['#102', 'Carlos Díaz', 'Cerrada', 'Gracias, ya compré', 'Ver'],
          ]}
        />
      </div>
    </MockupFrame>
  );
}
