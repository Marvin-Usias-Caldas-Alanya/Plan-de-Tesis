import './AdminTabs.css';

const TABS = [
  { id: 'conversations', label: 'Conversaciones' },
  { id: 'orders', label: 'Pedidos' },
];

export default function SellerTabs({ activeTab, onChange }) {
  return (
    <nav className="admin-tabs" aria-label="Secciones del panel vendedor">
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
