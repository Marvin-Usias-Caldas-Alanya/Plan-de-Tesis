import MockupFrame from './MockupFrame';
import { MockAdminShell, MockBtn, MockBadge, MockField } from './mockupUi';
import { MOCK_SOCIAL_PLATFORMS } from './mockupData';

export default function SocialAIMockup() {
  return (
    <MockupFrame url="nutristore.app/admin/redes-ia" fileName="mockup-social-ai.png">
      <MockAdminShell
        sidebarActive="Redes IA"
        title="Generación de publicaciones con IA"
        subtitle="Copy para Instagram, Facebook, TikTok y WhatsApp"
      >
        <div className="mock-ui__grid mock-ui__grid--2">
          <div className="mock-ui__panel">
            <MockField label="Producto" value="Whey Protein Gold" />
            <span className="mock-ui__label">Plataforma</span>
            <div className="mock-ui__chips">
              {MOCK_SOCIAL_PLATFORMS.map((p, i) => (
                <MockBadge key={p} tone={i === 0 ? 'ok' : 'info'}>
                  {p}
                </MockBadge>
              ))}
            </div>
            <MockField label="Tono" value="Motivacional · Fitness" />
            <MockField label="Objetivo" value="Promover venta de proteína" />
            <MockBtn variant="accent">Generar contenido IA</MockBtn>
          </div>
          <div className="mock-ui__panel mock-ui__panel--preview">
            <MockBadge tone="info">Vista previa Instagram</MockBadge>
            <p className="mock-ui__preview-text">
              💪 Potencia tu entrenamiento con Whey Protein Gold. Proteína de alta calidad para
              ganar masa muscular y recuperarte más rápido.
            </p>
            <span className="mock-ui__muted">#NutriStore #Fitness #Proteína #Suplementos</span>
            <div className="mock-ui__hero-actions">
              <MockBtn variant="secondary">Editar</MockBtn>
              <MockBtn>Publicar</MockBtn>
            </div>
          </div>
        </div>
      </MockAdminShell>
    </MockupFrame>
  );
}
