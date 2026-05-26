import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

const mockRegister = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: null }),
  };
});

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    register: mockRegister,
    error: null,
    clearError: vi.fn(),
    role: 'customer',
  }),
}));

describe('RegisterPage', () => {
  it('rechaza contraseñas distintas', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^nombre/i), 'Ana Test');
    await user.type(screen.getByLabelText(/correo/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '123456');
    await user.type(screen.getByLabelText(/confirmar/i), '654321');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(mockRegister).not.toHaveBeenCalled();
    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
  });

  it('registro válido llama servicio', async () => {
    mockRegister.mockResolvedValue({ user: { id: 'u1' } });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/^nombre/i), 'Ana Test');
    await user.type(screen.getByLabelText(/correo/i), 'ana@test.com');
    await user.type(screen.getByLabelText(/^contraseña$/i), '123456');
    await user.type(screen.getByLabelText(/confirmar/i), '123456');
    await user.click(screen.getByRole('button', { name: /registrarse/i }));

    expect(mockRegister).toHaveBeenCalledWith('Ana Test', 'ana@test.com', '123456');
  });
});
