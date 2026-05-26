import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSignIn = vi.hoisted(() => vi.fn());
const mockSignUp = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());
const mockGetUser = vi.hoisted(() => vi.fn());
const mockGetProfileById = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getUser: mockGetUser,
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('../../services/profileService.js', () => ({
  getProfileById: mockGetProfileById,
}));

import { getCurrentProfile, getCurrentUser, login, logout, register } from '../../services/authService';

describe('authService — autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('inicia sesión con correo recortado', async () => {
      const payload = { user: { id: 'u1', email: 'test@mail.com' }, session: {} };
      mockSignIn.mockResolvedValue({ data: payload, error: null });

      const result = await login('  test@mail.com  ', 'secret123');
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@mail.com', password: 'secret123' });
      expect(result).toEqual(payload);
    });

    it('traduce credenciales inválidas', async () => {
      mockSignIn.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });
      await expect(login('a@b.com', 'x')).rejects.toThrow('Correo o contraseña incorrectos');
    });
  });

  describe('logout', () => {
    it('cierra sesión sin error', async () => {
      mockSignOut.mockResolvedValue({ error: null });
      await expect(logout()).resolves.toBeUndefined();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('obtener usuario actual', () => {
    it('retorna usuario de auth', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com' } },
        error: null,
      });
      const user = await getCurrentUser();
      expect(user.id).toBe('u1');
    });

    it('retorna null sin sesión', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
      expect(await getCurrentUser()).toBeNull();
    });
  });

  describe('obtener profile', () => {
    it('carga perfil desde profileService', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com' } },
        error: null,
      });
      mockGetProfileById.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        full_name: 'Ana',
        role_code: 'admin',
      });

      const profile = await getCurrentProfile();
      expect(mockGetProfileById).toHaveBeenCalledWith('u1');
      expect(profile.role).toBe('admin');
      expect(profile.full_name).toBe('Ana');
    });

    it('fallback si falla profiles', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'u1', email: 'a@b.com', user_metadata: { full_name: 'Guest' } } },
        error: null,
      });
      mockGetProfileById.mockRejectedValue(new Error('RLS'));

      const profile = await getCurrentProfile();
      expect(profile.role).toBe('customer');
      expect(profile.full_name).toBe('Guest');
    });
  });

  describe('register', () => {
    it('registra con metadata de nombre', async () => {
      mockSignUp.mockResolvedValue({ data: { user: { id: 'n1' } }, error: null });
      await register('  Juan  ', 'juan@mail.com', '123456');
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'juan@mail.com',
          options: { data: { full_name: 'Juan' } },
        }),
      );
    });
  });
});
