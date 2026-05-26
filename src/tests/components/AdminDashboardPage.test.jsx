import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDashboardPage from '../../pages/AdminDashboardPage';
import { DASHBOARD_STATS_MOCK } from '../helpers/mockData';

vi.mock('../../services/adminService', () => ({
  getDashboardStats: vi.fn(),
  getAllNotifications: vi.fn().mockResolvedValue([]),
  getHandoffRequests: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../components/admin/AdminProductsPanel', () => ({
  default: () => <div data-testid="panel-products">Panel Productos</div>,
}));

vi.mock('../../components/admin/AdminChatbotPanel', () => ({
  default: () => <div data-testid="panel-chatbot">Panel Chatbot</div>,
}));

vi.mock('../../components/admin/AdminSocialPostsPanel', () => ({
  default: () => <div data-testid="panel-social">Panel Redes Sociales</div>,
}));

import { getDashboardStats } from '../../services/adminService';

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDashboardStats.mockResolvedValue(DASHBOARD_STATS_MOCK);
  });

  it('renderiza menú admin', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByRole('navigation', { name: /menú administración/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /productos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /configuración del chatbot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redes sociales/i })).toBeInTheDocument();
  });

  it('muestra tarjetas resumen en overview', async () => {
    render(<AdminDashboardPage />);
    expect(await screen.findByText(/usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(String(DASHBOARD_STATS_MOCK.users))).toBeInTheDocument();
  });

  it('muestra acceso a productos', async () => {
    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await user.click(screen.getByRole('button', { name: /^productos$/i }));
    expect(screen.getByTestId('panel-products')).toBeInTheDocument();
  });

  it('muestra acceso a chatbot', async () => {
    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await user.click(screen.getByRole('button', { name: /configuración del chatbot/i }));
    expect(screen.getByTestId('panel-chatbot')).toBeInTheDocument();
  });

  it('muestra acceso a redes sociales', async () => {
    const user = userEvent.setup();
    render(<AdminDashboardPage />);
    await user.click(screen.getByRole('button', { name: /redes sociales/i }));
    expect(screen.getByTestId('panel-social')).toBeInTheDocument();
  });
});
