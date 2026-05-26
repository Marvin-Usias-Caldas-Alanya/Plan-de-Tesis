/**
 * Primitivas visuales para mockups (solo diseño, sin interactividad).
 * Todo el contenido es estático y no ejecuta lógica ni consultas.
 */

export function MockTopbar({ active = 'home' }) {
  const items = [
    { key: 'home', label: 'Inicio' },
    { key: 'catalog', label: 'Catálogo' },
    { key: 'login', label: 'Ingresar' },
  ];

  return (
    <div className="mock-ui__topbar">
      <div className="mock-ui__logo">
        <span className="mock-ui__logo-mark">N</span>
        <span>NutriStore</span>
      </div>
      <div className="mock-ui__nav">
        {items.map((item) => (
          <span
            key={item.key}
            className={`mock-ui__nav-item${active === item.key ? ' mock-ui__nav-item--active' : ''}`}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MockAdminShell({ sidebarActive, title, subtitle, children }) {
  const items = [
    'Resumen',
    'Productos',
    'Inventario',
    'Pedidos',
    'Chatbot',
    'Redes IA',
    'Usuarios',
  ];

  return (
    <div className="mock-ui__admin">
      <aside className="mock-ui__sidebar">
        <div className="mock-ui__sidebar-brand">
          <span className="mock-ui__logo-mark">N</span>
          Admin
        </div>
        {items.map((item) => (
          <span
            key={item}
            className={`mock-ui__sidebar-item${sidebarActive === item ? ' mock-ui__sidebar-item--active' : ''}`}
          >
            {item}
          </span>
        ))}
      </aside>
      <div className="mock-ui__admin-main">
        <div className="mock-ui__page-head">
          <div>
            <h3 className="mock-ui__title">{title}</h3>
            {subtitle ? <p className="mock-ui__subtitle">{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function MockField({ label, value, type = 'text' }) {
  return (
    <div className="mock-ui__field">
      <span className="mock-ui__label">{label}</span>
      <div className={`mock-ui__input${type === 'password' ? ' mock-ui__input--password' : ''}`}>
        {value}
      </div>
    </div>
  );
}

export function MockBtn({ children, variant = 'primary', block = false }) {
  return (
    <span className={`mock-ui__btn mock-ui__btn--${variant}${block ? ' mock-ui__btn--block' : ''}`}>
      {children}
    </span>
  );
}

export function MockBadge({ children, tone = 'ok' }) {
  return <span className={`mock-ui__badge mock-ui__badge--${tone}`}>{children}</span>;
}

export function MockStat({ label, value, trend }) {
  return (
    <div className="mock-ui__stat">
      <span className="mock-ui__stat-label">{label}</span>
      <strong className="mock-ui__stat-value">{value}</strong>
      {trend ? <em className="mock-ui__stat-trend">{trend}</em> : null}
    </div>
  );
}

export function MockTable({ columns, rows }) {
  return (
    <div className="mock-ui__table-wrap">
      <table className="mock-ui__table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MockChart({ title, bars }) {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="mock-ui__chart">
      <span className="mock-ui__chart-title">{title}</span>
      <div className="mock-ui__chart-bars">
        {bars.map((bar) => (
          <div key={bar.label} className="mock-ui__chart-col">
            <div
              className="mock-ui__chart-bar"
              style={{ height: `${(bar.value / max) * 100}%` }}
            />
            <span>{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MockProductCard({ name, category, price, stock, badge, tone = 'green' }) {
  return (
    <div className="mock-ui__product">
      <div className={`mock-ui__product-img mock-ui__product-img--${tone}`} />
      <div className="mock-ui__product-head">
        <strong>{name}</strong>
        {badge ? <MockBadge tone={badge === 'Stock bajo' ? 'warn' : 'ok'}>{badge}</MockBadge> : null}
      </div>
      <span className="mock-ui__muted">{category}</span>
      <div className="mock-ui__product-foot">
        <strong className="mock-ui__price">S/ {price}</strong>
        <span className="mock-ui__muted">Stock {stock}</span>
      </div>
    </div>
  );
}

export function MockChatFloat({ messages }) {
  return (
    <div className="mock-ui__chat-float">
      <div className="mock-ui__chat-head">
        <span>NutriBot</span>
        <MockBadge tone="ok">En línea</MockBadge>
      </div>
      <div className="mock-ui__chat-body">
        {messages.map((msg, i) => (
          <div key={i} className={`mock-ui__bubble mock-ui__bubble--${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mock-ui__chat-input">Escribe tu mensaje…</div>
    </div>
  );
}

export function MockBubble({ from, children }) {
  return <div className={`mock-ui__bubble mock-ui__bubble--${from}`}>{children}</div>;
}
