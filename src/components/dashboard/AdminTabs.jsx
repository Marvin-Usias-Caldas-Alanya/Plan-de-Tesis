import './AdminTabs.css';

const TABS = [
  { id: 'products', label: 'Productos' },
  { id: 'orders', label: 'Pedidos' },
  { id: 'social', label: 'Redes sociales' },
  { id: 'chatbot', label: 'Chatbot' },
  { id: 'settings', label: 'Configuración' },
];

export default function AdminTabs({ activeTab, onChange }) {
  return (
    <nav className="admin-tabs" aria-label="Secciones del panel admin">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`admin-tabs__btn ${activeTab === tab.id ? 'admin-tabs__btn--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
