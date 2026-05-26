import MockupFrame from './MockupFrame';
import { MockTopbar, MockField, MockBtn } from './mockupUi';

export default function RegisterMockup() {
  return (
    <MockupFrame url="nutristore.app/registro" fileName="mockup-register.png">
      <MockTopbar active="login" />
      <div className="mock-ui mock-ui--center">
        <div className="mock-ui__panel mock-ui__panel--auth">
          <span className="mock-ui__eyebrow">Nueva cuenta</span>
          <h3 className="mock-ui__title">Crear cuenta</h3>
          <p className="mock-ui__subtitle">Regístrate para comprar suplementos nutricionales.</p>
          <MockField label="Nombre completo" value="María López" />
          <MockField label="Correo electrónico" value="maria.lopez@ejemplo.com" />
          <MockField label="Contraseña" value="••••••••" type="password" />
          <MockField label="Confirmar contraseña" value="••••••••" type="password" />
          <MockBtn block>Registrarme</MockBtn>
          <p className="mock-ui__footer-text">
            ¿Ya tienes cuenta? <span className="mock-ui__link">Inicia sesión</span>
          </p>
        </div>
      </div>
    </MockupFrame>
  );
}
