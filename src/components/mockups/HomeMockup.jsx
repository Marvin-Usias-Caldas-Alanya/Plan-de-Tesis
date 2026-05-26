import MockupFrame from './MockupFrame';
import { MockTopbar, MockBtn, MockStat } from './mockupUi';

export default function HomeMockup() {
  return (
    <MockupFrame url="nutristore.app" fileName="mockup-home.png">
      <MockTopbar active="home" />
      <div className="mock-ui mock-ui--hero">
        <span className="mock-ui__pill">Suplementos · Atención inteligente</span>
        <h2 className="mock-ui__hero-title">Potencia tu rendimiento con la nutrición correcta</h2>
        <p className="mock-ui__hero-text">
          Proteínas, vitaminas y más, con asesoría por chatbot y vendedores humanos.
        </p>
        <div className="mock-ui__hero-actions">
          <MockBtn>Ver catálogo</MockBtn>
          <MockBtn variant="secondary">Consultar chatbot</MockBtn>
        </div>
        <div className="mock-ui__grid mock-ui__grid--3">
          <MockStat label="Asistente" value="24/7" trend="Disponible" />
          <MockStat label="Categorías" value="+6" trend="Catálogo" />
          <MockStat label="Modelo" value="IA + humano" trend="Híbrido" />
        </div>
      </div>
    </MockupFrame>
  );
}
