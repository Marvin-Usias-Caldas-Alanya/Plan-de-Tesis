import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoleRoute from '../../routes/RoleRoute';
import { ROUTES, ROLES } from '../../utils/constants';

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

describe('RoleRoute', () => {
  it('redirige customer fuera de admin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      role: ROLES.CUSTOMER,
    });
    render(
      <MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
        <Routes>
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <div>Admin</div>
              </RoleRoute>
            }
          />
          <Route path={ROUTES.CATALOG} element={<div>Catálogo</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Catálogo')).toBeInTheDocument();
  });

  it('permite admin en panel admin', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      role: ROLES.ADMIN,
    });
    render(
      <MemoryRouter initialEntries={[ROUTES.ADMIN_DASHBOARD]}>
        <Routes>
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <div>Panel admin</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Panel admin')).toBeInTheDocument();
  });

  it('seller accede a su dashboard', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      role: ROLES.SELLER,
    });
    render(
      <MemoryRouter initialEntries={[ROUTES.SELLER_DASHBOARD]}>
        <Routes>
          <Route
            path={ROUTES.SELLER_DASHBOARD}
            element={
              <RoleRoute allowedRoles={[ROLES.SELLER, ROLES.ADMIN]}>
                <div>Panel vendedor</div>
              </RoleRoute>
            }
          />
          <Route path={ROUTES.CATALOG} element={<div>Catálogo</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Panel vendedor')).toBeInTheDocument();
  });

  it('loading permisos', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: true, role: ROLES.ADMIN });
    render(
      <MemoryRouter>
        <RoleRoute allowedRoles={[ROLES.ADMIN]}>
          <div>X</div>
        </RoleRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText(/cargando permisos/i)).toBeInTheDocument();
  });
});
