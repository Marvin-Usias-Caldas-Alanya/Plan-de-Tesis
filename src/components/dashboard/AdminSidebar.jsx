import { ADMIN_SECTIONS } from '../../utils/adminMenu';
import './AdminSidebar.css';

export default function AdminSidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }) {
  return (
    <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__logo" aria-hidden="true">
          NS
        </span>
        {!collapsed && <span className="admin-sidebar__title">Admin NutriStore</span>}
        <button
          type="button"
          className="admin-sidebar__collapse"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Menú administración">
        <ul>
          {ADMIN_SECTIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`admin-sidebar__link ${activeSection === item.id ? 'admin-sidebar__link--active' : ''}`}
                onClick={() => onSectionChange(item.id)}
                title={item.label}
              >
                <span className="admin-sidebar__icon" aria-hidden="true">
                  {item.icon}
                </span>
                {!collapsed && <span className="admin-sidebar__label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
