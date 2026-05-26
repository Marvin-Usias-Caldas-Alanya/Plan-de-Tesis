import { useRef } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import MockupCard from '../components/mockups/MockupCard';
import LoginMockup from '../components/mockups/LoginMockup';
import RegisterMockup from '../components/mockups/RegisterMockup';
import HomeMockup from '../components/mockups/HomeMockup';
import CatalogMockup from '../components/mockups/CatalogMockup';
import AdminDashboardMockup from '../components/mockups/AdminDashboardMockup';
import ProductManagementMockup from '../components/mockups/ProductManagementMockup';
import InventoryMockup from '../components/mockups/InventoryMockup';
import SocialAIMockup from '../components/mockups/SocialAIMockup';
import ChatbotConfigMockup from '../components/mockups/ChatbotConfigMockup';
import SellerPanelMockup from '../components/mockups/SellerPanelMockup';
import HandoffMockup from '../components/mockups/HandoffMockup';
import MobileMockup from '../components/mockups/MobileMockup';
import QualityEvidenceMockup from '../components/mockups/QualityEvidenceMockup';
import { printMockupsGallery } from '../components/mockups/captureMockup';
import { ROUTES } from '../utils/constants';
import '../styles/mockups.css';
import './MockupsPage.css';

const MOCKUP_ITEMS = [
  {
    id: 'login',
    title: 'Login',
    description: 'Propuesta visual de acceso — wireframe de alta fidelidad, no funcional.',
    requirement: 'RF-01 Autenticación',
    component: <LoginMockup />,
  },
  {
    id: 'register',
    title: 'Registro',
    description: 'Diseño estático del formulario de alta de clientes.',
    requirement: 'RF-01 Autenticación',
    component: <RegisterMockup />,
  },
  {
    id: 'home',
    title: 'Home',
    description: 'Landing con propuesta de valor, CTA y beneficios del negocio.',
    requirement: 'RF-02 Navegación',
    component: <HomeMockup />,
  },
  {
    id: 'catalog',
    title: 'Catálogo de productos',
    description: 'Grid visual de suplementos con precio, stock y badges simulados.',
    requirement: 'RF-03 Productos',
    component: <CatalogMockup />,
  },
  {
    id: 'chatbot',
    title: 'Chatbot flotante',
    description: 'Widget NutriBot sobre el catálogo — conversación simulada tipo Figma.',
    requirement: 'RF-04 Chatbot híbrido',
    component: <CatalogMockup showFloatingChat />,
  },
  {
    id: 'admin-dashboard',
    title: 'Dashboard administrador',
    description: 'KPIs, gráfico simulado y actividad reciente del panel admin.',
    requirement: 'RF-05 Panel admin',
    component: <AdminDashboardMockup />,
  },
  {
    id: 'products',
    title: 'Gestión de productos',
    description: 'Tabla visual CRUD con estados y acciones simuladas.',
    requirement: 'RF-03 Productos',
    component: <ProductManagementMockup />,
  },
  {
    id: 'inventory',
    title: 'Inventario',
    description: 'Métricas de stock y movimientos de almacén simulados.',
    requirement: 'RF-06 Inventario',
    component: <InventoryMockup />,
  },
  {
    id: 'social-ai',
    title: 'Publicaciones con IA',
    description: 'Generador visual de copy para redes sociales.',
    requirement: 'RF-07 Redes e IA',
    component: <SocialAIMockup />,
  },
  {
    id: 'chatbot-config',
    title: 'Configuración del chatbot',
    description: 'Intenciones, reglas y preview de handoff simulado.',
    requirement: 'RF-04 Chatbot híbrido',
    component: <ChatbotConfigMockup />,
  },
  {
    id: 'seller-panel',
    title: 'Panel vendedor',
    description: 'Cola de conversaciones con estados bot, handoff y cerrada.',
    requirement: 'RF-08 Handoff',
    component: <SellerPanelMockup />,
  },
  {
    id: 'handoff',
    title: 'Handoff humano',
    description: 'Conversación bot → vendedor con mensaje de derivación.',
    requirement: 'RF-08 Handoff',
    component: <HandoffMockup />,
  },
  {
    id: 'mobile',
    title: 'Vista móvil responsive',
    description: 'Home adaptado en marco de dispositivo móvil.',
    requirement: 'RF-10 Responsive',
    device: 'mobile',
    component: <MobileMockup />,
  },
  {
    id: 'quality',
    title: 'Evidencia de pruebas y código limpio',
    description: 'Panel visual de métricas de calidad para anexo de tesis.',
    requirement: 'RF-09 Calidad',
    component: <QualityEvidenceMockup />,
  },
];

export default function MockupsPage() {
  const galleryRef = useRef(null);

  function scrollToGallery() {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="mockups-page">
      <header className="mockups-page__hero">
        <div className="mockups-page__hero-inner">
          <span className="mockups-page__badge">Diseño UI · Evidencia académica</span>
          <h1>Galería de mockups visuales — NutriStore</h1>
          <p>
            Propuestas de interfaz en formato imagen (estilo Figma / wireframe de alta fidelidad).
            Son diseños estáticos: no ejecutan lógica, no consultan Supabase y no contienen
            formularios funcionales. Sirven para documentar la propuesta visual de la tesis.
          </p>
          <div className="mockups-page__toolbar">
            <Button type="button" onClick={scrollToGallery}>
              Ver mockups
            </Button>
            <Button type="button" variant="accent" onClick={printMockupsGallery}>
              Capturar evidencia
            </Button>
            <Link to={ROUTES.HOME}>
              <Button type="button" variant="secondary">
                Volver al sistema
              </Button>
            </Link>
          </div>
          <p className="mockups-page__hint">
            Cada mockup incluye el botón <strong>Descargar PNG</strong> sobre el marco visual. También
            puedes usar <strong>Capturar evidencia</strong> para imprimir / guardar PDF de toda la
            galería.
          </p>
        </div>
      </header>

      <section
        ref={galleryRef}
        id="mockups-gallery"
        className="mockups-page__grid"
        aria-label="Galería de mockups visuales"
      >
        {MOCKUP_ITEMS.map((item) => (
          <MockupCard
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            requirement={item.requirement}
            device={item.device ?? 'desktop'}
          >
            {item.component}
          </MockupCard>
        ))}
      </section>
    </div>
  );
}
