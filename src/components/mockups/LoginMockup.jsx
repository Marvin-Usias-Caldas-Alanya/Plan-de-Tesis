import MockupFrame from './MockupFrame';
import { MockTopbar, MockField, MockBtn } from './mockupUi';

export default function LoginMockup() {
  return (
    <MockupFrame url="nutristore.app/login" fileName="mockup-login.png">
      <MockTopbar active="login" />
      <div className="mock-ui mock-ui--center">
        <div className="mock-ui__panel mock-ui__panel--auth">
          <span className="mock-ui__eyebrow">Acceso seguro</span>
          <h3 className="mock-ui__title">Iniciar sesión</h3>
          <p className="mock-ui__subtitle">Consulta catálogo, chatbot y pedidos.</p>
          <MockField label="Correo electrónico" value="cliente@ejemplo.com" />
          <MockField label="Contraseña" value="••••••••" type="password" />
          <span className="mock-ui__link">¿Olvidaste tu contraseña?</span>
          <MockBtn block>Entrar</MockBtn>
          <p className="mock-ui__footer-text">
            ¿No tienes cuenta? <span className="mock-ui__link">Regístrate</span>
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}
