import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';

vi.mock('../../services/authService.js', () => ({
  getSession: vi.fn(),
  getCurrentProfile: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
}));

import * as authService from '../../services/authService';

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.getSession.mockResolvedValue({ user: null });
    authService.getCurrentProfile.mockResolvedValue(null);
  });

  it('inicia sin sesión', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isCustomer).toBe(true);
  });

  it('carga perfil admin', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'u1', email: 'a@t.com' } });
    authService.getCurrentProfile.mockResolvedValue({
      id: 'u1',
      role: 'admin',
      full_name: 'Admin',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAdmin).toBe(true));
    expect(result.current.role).toBe('admin');
  });

  it('login exitoso', async () => {
    authService.login.mockResolvedValue({ user: { id: 'u1' } });
    authService.getCurrentProfile.mockResolvedValue({ id: 'u1', role: 'seller' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('seller@test.com', '123456');
    });

    expect(result.current.isSeller).toBe(true);
    expect(authService.login).toHaveBeenCalledWith('seller@test.com', '123456');
  });

  it('login con error', async () => {
    authService.login.mockRejectedValue(new Error('Credenciales inválidas'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      try {
        await result.current.login('x@y.com', 'bad');
      } catch {
        /* esperado */
      }
    });
    await waitFor(() => expect(result.current.error).toContain('Credenciales'));
  });

  it('logout limpia estado', async () => {
    authService.getSession.mockResolvedValue({ user: { id: 'u1' } });
    authService.getCurrentProfile.mockResolvedValue({ id: 'u1', role: 'customer' });
    authService.logout.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });

  it('register asigna usuario', async () => {
    authService.register.mockResolvedValue({ user: { id: 'u2' } });
    authService.getCurrentProfile.mockResolvedValue({ id: 'u2', role: 'customer' });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.register('Nuevo', 'n@t.com', '123456');
    });

    expect(result.current.user?.id).toBe('u2');
  });

  it('useAuth fuera de provider lanza', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
