import { ROUTES, ROLES } from './constants';

/**
 * Ruta por defecto tras iniciar sesión según rol.
 */
export function getDefaultRouteForRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case ROLES.SELLER:
      return ROUTES.SELLER_DASHBOARD;
    case ROLES.CUSTOMER:
    default:
      return ROUTES.CATALOG;
  }
}

const CUSTOMER_SHOP_ROUTES = [ROUTES.CART, ROUTES.CHECKOUT, ROUTES.ORDERS];

/**
 * Indica si un rol puede acceder a una ruta protegida por rol.
 */
export function canAccessRoute(role, pathname) {
  if (pathname === ROUTES.ADMIN_DASHBOARD) {
    return role === ROLES.ADMIN;
  }
  if (pathname === ROUTES.SELLER_DASHBOARD) {
    return role === ROLES.SELLER || role === ROLES.ADMIN;
  }
  if (pathname === ROUTES.CATALOG) {
    return true;
  }
  if (CUSTOMER_SHOP_ROUTES.includes(pathname)) {
    return [ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN].includes(role);
  }
  if (pathname === ROUTES.PROFILE) {
    return Boolean(role);
  }
  return true;
}
