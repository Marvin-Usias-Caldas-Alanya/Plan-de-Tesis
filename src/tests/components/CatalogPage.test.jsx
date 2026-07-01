import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CatalogPage from '../../pages/CatalogPage';
import { SAMPLE_PRODUCT } from '../helpers/mockData';

const mockCreateOrder = vi.fn();
const mockRefresh = vi.fn();

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 'u1' }, isAuthenticated: true }),
}));

vi.mock('../../hooks/useProducts.js', () => ({
  useProducts: vi.fn(),
}));

vi.mock('../../hooks/useOrders.js', () => ({
  useOrders: () => ({
    createPurchaseOrder: mockCreateOrder,
    submitting: false,
  }),
}));

vi.mock('../../hooks/useCart.js', () => ({
  useCart: () => ({
    addProduct: vi.fn(),
    submitting: false,
  }),
}));

vi.mock('../../components/chatbot/ChatWidget.jsx', () => ({
  default: ({ open, initialPrompt }) =>
    open ? <div data-testid="chat-open">{initialPrompt}</div> : null,
}));

import { useProducts } from '../../hooks/useProducts';

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProducts.mockReturnValue({
      products: [SAMPLE_PRODUCT],
      categories: [{ id: 'cat-1', name: 'Proteínas' }],
      loading: false,
      error: null,
      refreshProducts: mockRefresh,
    });
    mockCreateOrder.mockResolvedValue({ id: 'ord-1' });
  });

  it('renderiza catálogo y filtros', () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /catálogo/i })).toBeInTheDocument();
    expect(screen.getByText(SAMPLE_PRODUCT.name)).toBeInTheDocument();
  });

  it('consulta por chatbot abre widget', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /consultar por chatbot/i }));
    expect(screen.getByTestId('chat-open')).toBeInTheDocument();
    expect(screen.getByTestId('chat-open').textContent).toContain('Whey');
  });

  it('producto agotado deshabilita compra', () => {
    useProducts.mockReturnValue({
      products: [{ ...SAMPLE_PRODUCT, stock: 0 }],
      categories: [],
      loading: false,
      error: null,
      refreshProducts: mockRefresh,
    });
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar compra/i })).toBeDisabled();
  });

  it('solicitar compra crea pedido y abre chat', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /solicitar compra/i }));
    expect(mockCreateOrder).toHaveBeenCalled();
    expect(screen.getByTestId('chat-open')).toBeInTheDocument();
  });
});
