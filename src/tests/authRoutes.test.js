import { describe, expect, it } from 'vitest';
import { canAccessRoute, getDefaultRouteForRole } from '../utils/authRoutes';
import { ROUTES, ROLES } from '../utils/constants';

describe('authRoutes', () => {
  it('redirige admin al panel admin', () => {
    expect(getDefaultRouteForRole(ROLES.ADMIN)).toBe(ROUTES.ADMIN_DASHBOARD);
  });

  it('redirige seller al panel vendedor', () => {
    expect(getDefaultRouteForRole(ROLES.SELLER)).toBe(ROUTES.SELLER_DASHBOARD);
  });

  it('redirige customer al catálogo', () => {
    expect(getDefaultRouteForRole(ROLES.CUSTOMER)).toBe(ROUTES.CATALOG);
  });

  it('controla acceso por rol', () => {
    expect(canAccessRoute(ROLES.ADMIN, ROUTES.ADMIN_DASHBOARD)).toBe(true);
    expect(canAccessRoute(ROLES.CUSTOMER, ROUTES.ADMIN_DASHBOARD)).toBe(false);
    expect(canAccessRoute(ROLES.CUSTOMER, ROUTES.CATALOG)).toBe(true);
    expect(canAccessRoute(null, ROUTES.CATALOG)).toBe(true);
    expect(canAccessRoute(ROLES.CUSTOMER, ROUTES.CART)).toBe(true);
  });
});
