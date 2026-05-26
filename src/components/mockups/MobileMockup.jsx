import MockupFrame from './MockupFrame';
import { MockBtn, MockStat } from './mockupUi';

export default function MobileMockup() {
  return (
    <MockupFrame variant="mobile" url="nutristore.app" fileName="mockup-mobile.png">
      <div className="mock-ui mock-ui--mobile-home">
        <div className="mock-ui__mobile-nav">
          <span className="mock-ui__logo-mark">N</span>
          <span>NutriStore</span>
        </div>
        <span className="mock-ui__pill">Suplementos</span>
        <h2 className="mock-ui__hero-title mock-ui__hero-title--sm">
          Potencia tu rendimiento
        </h2>
        <p className="mock-ui__hero-text">
          Catálogo, chatbot IA y asesor humano en un solo flujo.
        </p>
        <MockBtn block>Ver catálogo</MockBtn>
        <MockBtn variant="secondary" block>
          Consultar chatbot
        </MockBtn>
        <div className="mock-ui__mobile-cards">
          <MockStat label="Proteínas" value="12" trend="Productos" />
          <MockStat label="Chatbot" value="24/7" trend="NutriBot" />
        </div>
      </div>
    </MockupFrame>
  );
}
