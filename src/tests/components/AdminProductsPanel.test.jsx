import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminProductsPanel from '../../components/admin/AdminProductsPanel';
import { SAMPLE_PRODUCT } from '../helpers/mockData';

const mockCreate = vi.fn().mockResolvedValue(undefined);
const mockRefresh = vi.fn();

vi.mock('../../hooks/useProducts', () => ({
  useProducts: vi.fn(),
}));

vi.mock('../../hooks/useAdminProductActions', () => ({
  useAdminProductActions: vi.fn(),
}));

import { useProducts } from '../../hooks/useProducts';
import { useAdminProductActions } from '../../hooks/useAdminProductActions';

describe('AdminProductsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProducts.mockReturnValue({
      products: [SAMPLE_PRODUCT],
      categories: [{ id: 'cat-1', name: 'Proteínas' }],
      loading: false,
      error: null,
      refreshProducts: mockRefresh,
    });
    useAdminProductActions.mockReturnValue({
      submitting: false,
      actionBusy: false,
      createProduct: mockCreate,
      updateProduct: vi.fn(),
      setProductActive: vi.fn(),
      quickUpdatePriceStock: vi.fn(),
    });
  });

  it('muestra productos en tabla', () => {
    render(<AdminProductsPanel onFeedback={vi.fn()} />);
    expect(screen.getByText('Whey Protein Gold')).toBeInTheDocument();
  });

  it('abre formulario al crear producto', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));
    expect(screen.getByLabelText(/nombre \*/i)).toBeInTheDocument();
  });

  it('valida campos obligatorios', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));
    await user.click(screen.getByRole('button', { name: /crear producto/i }));
    expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('llama a crear producto con datos válidos', async () => {
    const user = userEvent.setup();
    render(<AdminProductsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /nuevo producto/i }));

    await user.type(screen.getByLabelText(/nombre \*/i), 'Creatina Test');
    await user.clear(screen.getByLabelText(/precio \(mxn\)/i));
    await user.type(screen.getByLabelText(/precio \(mxn\)/i), '250');
    await user.clear(screen.getByLabelText(/stock \*/i));
    await user.type(screen.getByLabelText(/stock \*/i), '5');
    await user.selectOptions(screen.getByLabelText(/categoría \*/i), 'cat-1');
    await user.click(screen.getByRole('button', { name: /crear producto/i }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Creatina Test',
        category_id: 'cat-1',
      }),
    );
  });
});
