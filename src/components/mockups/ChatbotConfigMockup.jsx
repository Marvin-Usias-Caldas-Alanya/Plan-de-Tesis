import MockupFrame from './MockupFrame';
import { MockAdminShell, MockBadge } from './mockupUi';

export default function ChatbotConfigMockup() {
  return (
    <MockupFrame url="nutristore.app/admin/chatbot" fileName="mockup-chatbot-config.png">
      <MockAdminShell
        sidebarActive="Chatbot"
        title="Configuración del chatbot"
        subtitle="Intenciones, reglas y derivación a handoff humano"
      >
        <div className="mock-ui__grid mock-ui__grid--2">
          <div className="mock-ui__intent">
            <strong>Intención: compra</strong>
            <p className="mock-ui__muted">Palabras: comprar, pedido, pagar, llevar</p>
            <MockBadge tone="warn">Deriva a handoff</MockBadge>
          </div>
          <div className="mock-ui__intent">
            <strong>Intención: recomendación</strong>
            <p className="mock-ui__muted">Palabras: recomienda, objetivo, masa, definición</p>
            <MockBadge tone="ok">Respuesta automática</MockBadge>
          </div>
        </div>
        <div className="mock-ui__panel mock-ui__panel--preview-bot">
          <strong className="mock-ui__panel-title">Vista previa NutriBot</strong>
          <div className="mock-ui__bubble mock-ui__bubble--bot">
            Detecté intención de compra. ¿Deseas hablar con un vendedor humano?
          </div>
          <div className="mock-ui__bubble mock-ui__bubble--user">Sí, quiero comprar</div>
          <div className="mock-ui__bubble mock-ui__bubble--system">
            Te estamos derivando con un vendedor humano…
          </div>
        </div>
      </MockAdminShell>
    </MockupFrame>
  );
}
