import MockupFrame from './MockupFrame';
import { MockTopbar, MockBtn, MockProductCard } from './mockupUi';
import { MOCK_PRODUCTS } from './mockupData';

export default function CatalogMockup({ showFloatingChat = false }) {
  return (
    <MockupFrame
      url="nutristore.app/catalogo"
      fileName={showFloatingChat ? 'mockup-chatbot-float.png' : 'mockup-catalog.png'}
    >
      <div className="mock-ui mock-ui--catalog">
        <MockTopbar active="catalog" />
        <div className="mock-ui__catalog-head">
          <div>
            <h3 className="mock-ui__title">Catálogo de suplementos</h3>
            <p className="mock-ui__subtitle">Proteínas, creatinas, pre-entrenos y vitaminas</p>
          </div>
          <div className="mock-ui__toolbar">
            <span className="mock-ui__input mock-ui__input--compact">Buscar producto…</span>
            <MockBtn variant="ghost">Filtros</MockBtn>
          </div>
        </div>
        <div className="mock-ui__grid mock-ui__grid--2">
          {MOCK_PRODUCTS.map((p, i) => (
            <MockProductCard
              key={p.id}
              name={p.name}
              category={p.category}
              price={p.price.toFixed(2)}
              stock={p.stock}
              badge={p.badge}
              tone={['green', 'orange', 'blue', 'green'][i]}
            />
          ))}
        </div>
        {showFloatingChat ? (
          <div className="mock-ui__chat-overlay">
            <div className="mock-ui__chat-float mock-ui__chat-float--large">
              <div className="mock-ui__chat-head">
                <span>NutriBot · Asistente IA</span>
                <span className="mock-ui__badge mock-ui__badge--ok">En línea</span>
              </div>
              <div className="mock-ui__chat-body">
                <div className="mock-ui__bubble mock-ui__bubble--bot">
                  ¿Buscas proteína o creatina para ganar masa muscular?
                </div>
                <div className="mock-ui__bubble mock-ui__bubble--user">
                  Quiero whey para volumen
                </div>
                <div className="mock-ui__bubble mock-ui__bubble--bot">
                  Te recomiendo Whey Protein Gold. ¿Deseas hablar con un vendedor?
                </div>
              </div>
              <div className="mock-ui__chat-input">Escribe tu mensaje…</div>
            </div>
          </div>
        ) : null}
      </div>
    </MockupFrame>
  );
}
