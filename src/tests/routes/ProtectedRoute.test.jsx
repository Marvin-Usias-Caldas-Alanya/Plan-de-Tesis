import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../routes/ProtectedRoute';
import { ROUTES } from '../../utils/constants';

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

describe('ProtectedRoute', () => {
  it('muestra loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Privado</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText(/verificando sesión/i)).toBeInTheDocument();
  });

  it('redirige a login sin sesión', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: false });
    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/privado" element={<ProtectedRoute><div>Privado</div></ProtectedRoute>} />
          <Route path={ROUTES.LOGIN} element={<div>Página login</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Página login')).toBeInTheDocument();
  });

  it('renderiza hijos autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
