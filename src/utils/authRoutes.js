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
    return [ROLES.CUSTOMER, ROLES.SELLER, ROLES.ADMIN].includes(role);
  }
  return true;
}
