import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { APP_NAME, APP_TAGLINE, ROUTES, ROLES } from '../../utils/constants';
import Button from './Button';
import NotificationsBell from './NotificationsBell';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, profile, role, user, logout, loading } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardRoute =
    role === ROLES.ADMIN
      ? ROUTES.ADMIN_DASHBOARD
      : role === ROLES.SELLER
        ? ROUTES.SELLER_DASHBOARD
        : null;

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <NavLink to={ROUTES.HOME} className="navbar__link" onClick={closeMenu}>
        Inicio
      </NavLink>
      <NavLink to={ROUTES.CATALOG} className="navbar__link" onClick={closeMenu}>
        Catálogo
      </NavLink>
      {isAuthenticated && (
        <>
          <NavLink to={ROUTES.ORDERS} className="navbar__link" onClick={closeMenu}>
            Mis pedidos
          </NavLink>
          <NavLink to={ROUTES.CART} className="navbar__link navbar__link--cart" onClick={closeMenu}>
            Carrito
            {itemCount > 0 && (
              <span className="navbar__cart-badge" aria-label={`${itemCount} productos`}>
                {itemCount}
              </span>
            )}
          </NavLink>
          <NavLink to={ROUTES.PROFILE} className="navbar__link" onClick={closeMenu}>
            Perfil
          </NavLink>
        </>
      )}
      {dashboardRoute && (
        <NavLink to={dashboardRoute} className="navbar__link" onClick={closeMenu}>
          Panel
        </NavLink>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to={ROUTES.HOME} className="navbar__brand" onClick={closeMenu}>
          <img
            src="/nutriland-logo.svg"
            alt={APP_NAME}
            className="navbar__logo"
            width="180"
            height="40"
          />
          <span className="navbar__title">{APP_TAGLINE}</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}
          aria-label="Principal"
        >
          {navLinks}
          <div className="navbar__actions navbar__actions--mobile">
            {!loading &&
              (isAuthenticated ? (
                <>
                  <span className="navbar__user">
                    {profile?.full_name || profile?.email}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    block
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} onClick={closeMenu}>
                    <Button variant="ghost" size="sm" block>
                      Ingresar
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={closeMenu}>
                    <Button size="sm" block>
                      Registrarse
                    </Button>
                  </Link>
                </>
              ))}
          </div>
        </nav>

        <div className="navbar__actions navbar__actions--desktop">
          {loading ? null : isAuthenticated ? (
            <>
              <NotificationsBell />
              <span className="navbar__user" title={profile?.email}>
                {profile?.full_name || profile?.email}
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Ingresar
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
