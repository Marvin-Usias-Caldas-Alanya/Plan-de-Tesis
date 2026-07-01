import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChatWidget from '../components/chatbot/ChatWidget';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME, ROUTES } from '../utils/constants';
import './HomePage.css';

const BENEFITS = [
  {
    icon: '⚡',
    title: 'Atención rápida',
    text: 'Respuestas al instante sobre productos, precios y disponibilidad, sin esperar en cola.',
  },
  {
    icon: '🎯',
    title: 'Recomendaciones inteligentes',
    text: 'Sugerencias según tu objetivo: masa muscular, definición, energía, recuperación y más.',
  },
  {
    icon: '📦',
    title: 'Productos actualizados',
    text: 'Catálogo en línea con stock, precios y categorías siempre al día.',
  },
  {
    icon: '🤝',
    title: 'Ayuda humana cuando se necesita',
    text: 'Si quieres comprar o prefieres un asesor, te conectamos con un vendedor real.',
  },
];

const CATEGORIES = [
  { name: 'Proteínas', slug: 'proteinas', icon: '💪', desc: 'Whey, isolate y blends' },
  { name: 'Creatinas', slug: 'creatinas', icon: '🔋', desc: 'Fuerza y rendimiento' },
  {
    name: 'Pre-entrenos',
    slug: 'pre-entreno',
    icon: '⚡',
    desc: 'Energía para tu rutina',
  },
  { name: 'Vitaminas', slug: 'vitaminas', icon: '🌿', desc: 'Salud y bienestar diario' },
  {
    name: 'Quemadores',
    slug: 'quemadores',
    icon: '🔥',
    desc: 'Control de peso y definición',
  },
  {
    name: 'Recuperación',
    slug: 'recuperacion',
    icon: '🔄',
    desc: 'BCAA, glutamina y aminoácidos',
  },
];

const HYBRID_STEPS = [
  {
    step: '01',
    title: 'El chatbot responde automáticamente',
    text: 'NutriBot saluda, orienta y recomienda suplementos según tus preguntas y objetivos.',
    accent: 'primary',
  },
  {
    step: '02',
    title: '¿Quieres comprar? Pasa a un vendedor',
    text: 'Al detectar intención de compra o si lo pides, la conversación se deriva a atención humana.',
    accent: 'accent',
  },
  {
    step: '03',
    title: 'El vendedor finaliza la atención',
    text: 'Un asesor cierra tu pedido, resuelve dudas y da seguimiento hasta completar la venta.',
    accent: 'info',
  },
];

const CHAT_PROMPT = 'Hola, quiero consultar productos y recomendaciones';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');

  const catalogPath = ROUTES.CATALOG;

  const openChat = useCallback(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.HOME, intent: 'chat' } });
      return;
    }
    setChatPrompt(CHAT_PROMPT);
    setChatOpen(true);
  }, [isAuthenticated, navigate]);

  const handleChatPromptConsumed = useCallback(() => {
    setChatPrompt('');
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__glow home-hero__glow--left" aria-hidden="true" />
        <div className="home-hero__glow home-hero__glow--right" aria-hidden="true" />

        <div className="home-hero__inner">
          <span className="home-hero__badge">Suplementos · Atención inteligente</span>
          <h1 id="home-hero-title" className="home-hero__title">
            Potencia tu rendimiento con la nutrición correcta
          </h1>
          <p className="home-hero__subtitle">
            En {APP_NAME} encuentras proteínas, vitaminas y más, con asesoría por chatbot
            y vendedores humanos cuando lo necesites.
          </p>
          <div className="home-hero__actions">
            <Link to={catalogPath} className="home-hero__link">
              <Button size="lg">Ver catálogo</Button>
            </Link>
            <Button size="lg" variant="secondary" onClick={openChat}>
              Consultar por chatbot
            </Button>
          </div>
          <ul className="home-hero__stats" aria-label="Ventajas destacadas">
            <li>
              <strong>24/7</strong>
              <span>Asistente disponible</span>
            </li>
            <li>
              <strong>+6</strong>
              <span>Categorías</span>
            </li>
            <li>
              <strong>IA + humano</strong>
              <span>Sistema híbrido</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Beneficios */}
      <section className="home-section home-benefits" aria-labelledby="benefits-title">
        <div className="home-section__head">
          <h2 id="benefits-title">¿Por qué elegir {APP_NAME}?</h2>
          <p>Tecnología y personas trabajando juntas para tu meta fitness.</p>
        </div>
        <ul className="home-benefits__grid">
          {BENEFITS.map((item) => (
            <li key={item.title} className="home-benefits__card">
              <span className="home-benefits__icon" aria-hidden="true">
                {item.icon}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Categorías */}
      <section
        className="home-section home-categories"
        aria-labelledby="categories-title"
      >
        <div className="home-section__head">
          <h2 id="categories-title">Explora por categoría</h2>
          <p>Encuentra el suplemento ideal para cada etapa de tu entrenamiento.</p>
        </div>
        <ul className="home-categories__grid">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link
                to={catalogPath}
                state={{ categoryHint: cat.slug }}
                className="home-categories__card"
              >
                <span className="home-categories__icon" aria-hidden="true">
                  {cat.icon}
                </span>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <span className="home-categories__cta">Ver productos →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sistema híbrido */}
      <section className="home-section home-hybrid" aria-labelledby="hybrid-title">
        <div className="home-section__head home-section__head--light">
          <h2 id="hybrid-title">Sistema híbrido: IA + vendedor humano</h2>
          <p>
            Lo mejor de la automatización y la atención personalizada en un solo flujo.
          </p>
        </div>
        <ol className="home-hybrid__flow">
          {HYBRID_STEPS.map((item, index) => (
            <li
              key={item.step}
              className={`home-hybrid__step home-hybrid__step--${item.accent}`}
            >
              <span className="home-hybrid__step-num">{item.step}</span>
              <div className="home-hybrid__step-body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
              {index < HYBRID_STEPS.length - 1 && (
                <span className="home-hybrid__connector" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
        <div className="home-hybrid__cta">
          <Button variant="accent" onClick={openChat}>
            Probar el chatbot ahora
          </Button>
        </div>
      </section>

      <ChatWidget
        open={chatOpen}
        onOpenChange={setChatOpen}
        initialPrompt={chatPrompt}
        onPromptConsumed={handleChatPromptConsumed}
      />
    </div>
  );
}
