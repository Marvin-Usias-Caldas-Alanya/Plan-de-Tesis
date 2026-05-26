import MockupFrame from './MockupFrame';
import { MockBadge, MockBtn, MockBubble } from './mockupUi';
import { MOCK_CHAT_MESSAGES } from './mockupData';

export default function HandoffMockup() {
  return (
    <MockupFrame url="nutristore.app/vendedor/handoff" fileName="mockup-handoff.png">
      <div className="mock-ui mock-ui--handoff">
        <div className="mock-ui__seller-head">
          <div className="mock-ui__logo">
            <span className="mock-ui__logo-mark">N</span>
            Handoff humano · Conversación #104
          </div>
          <MockBadge tone="warn">Atención humana activa</MockBadge>
        </div>
        <div className="mock-ui__handoff-layout">
          <div className="mock-ui__panel">
            <strong>Cliente: Juan Pérez</strong>
            <p className="mock-ui__muted">Objetivo: masa muscular</p>
            <p className="mock-ui__muted">Productos: Whey + Creatina</p>
            <MockBadge tone="warn">Pendiente → Humano</MockBadge>
          </div>
          <div className="mock-ui__panel mock-ui__panel--chat">
            {MOCK_CHAT_MESSAGES.map((msg, i) => (
              <MockBubble key={i} from={msg.from}>
                {msg.text}
              </MockBubble>
            ))}
            <span className="mock-ui__input">Responder como vendedor…</span>
            <MockBtn>Enviar respuesta</MockBtn>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}
