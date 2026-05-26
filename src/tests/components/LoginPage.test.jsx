import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';

const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    error: null,
    clearError: mockClearError,
    role: 'customer',
  }),
}));

describe('LoginPage', () => {
  it('renderiza formulario y valida campos vacíos', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));
    expect(mockLogin).not.toHaveBeenCalled();
    expect(screen.getByText(/correo es obligatorio/i)).toBeInTheDocument();
  });

  it('login exitoso redirige', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1' }, profile: { role: 'admin' } });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/correo/i), 'admin@test.com');
    await user.type(screen.getByLabelText(/contraseña/i), '123456');
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(mockLogin).toHaveBeenCalledWith('admin@test.com', '123456');
    expect(mockNavigate).toHaveBeenCalled();
  });
});
