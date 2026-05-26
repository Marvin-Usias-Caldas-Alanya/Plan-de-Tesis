import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminSocialPostsPanel from '../../components/admin/AdminSocialPostsPanel';

const mockSaveManual = vi.fn().mockResolvedValue(true);
const mockRunGenerate = vi.fn();
const mockSaveAi = vi.fn().mockResolvedValue(true);

vi.mock('../../hooks/useSocialPublications', () => ({
  useSocialPublications: vi.fn(),
}));

import { useSocialPublications } from '../../hooks/useSocialPublications';

const baseHook = {
  posts: [],
  platforms: [{ id: 'pl-1', code: 'facebook', name: 'Facebook' }],
  campaigns: [],
  products: [{ id: 'prod-1', name: 'Whey', price: 100, stock: 5 }],
  loading: false,
  submitting: false,
  generating: false,
  refresh: vi.fn(),
  removePost: vi.fn(),
};

describe('AdminSocialPostsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRunGenerate.mockResolvedValue({
      title: 'Whey | promocional',
      content: 'Texto IA generado',
      prompt: '{}',
      modelName: 'nutristore-rules-v1',
    });
    useSocialPublications.mockReturnValue({
      ...baseHook,
      saveManualPost: mockSaveManual,
      runGenerate: mockRunGenerate,
      saveAiPublication: mockSaveAi,
    });
  });

  it('permite crear publicación manual', async () => {
    const user = userEvent.setup();
    render(<AdminSocialPostsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /crear manual/i }));
    await user.type(screen.getByLabelText(/título/i), 'Promo Whey');
    await user.type(screen.getByLabelText(/contenido/i), 'Oferta del mes');
    await user.selectOptions(screen.getByLabelText(/plataforma/i), 'pl-1');
    await user.click(screen.getByRole('button', { name: /crear publicación/i }));
    expect(mockSaveManual).toHaveBeenCalled();
  });

  it('permite generar publicación IA', async () => {
    const user = userEvent.setup();
    render(<AdminSocialPostsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /generar con ia/i }));
    await user.selectOptions(screen.getByLabelText(/^producto$/i), 'prod-1');
    await user.selectOptions(screen.getByLabelText(/^plataforma$/i), 'facebook');
    const generateButtons = screen.getAllByRole('button', { name: /generar con ia/i });
    await user.click(generateButtons[generateButtons.length - 1]);
    expect(mockRunGenerate).toHaveBeenCalled();
    expect(await screen.findByDisplayValue('Texto IA generado')).toBeInTheDocument();
  });

  it('permite editar texto generado', async () => {
    const user = userEvent.setup();
    render(<AdminSocialPostsPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /generar con ia/i }));
    await user.selectOptions(screen.getByLabelText(/^producto$/i), 'prod-1');
    await user.selectOptions(screen.getByLabelText(/^plataforma$/i), 'facebook');
    const genButtons = screen.getAllByRole('button', { name: /generar con ia/i });
    await user.click(genButtons[genButtons.length - 1]);

    const textarea = await screen.findByDisplayValue('Texto IA generado');
    await user.clear(textarea);
    await user.type(textarea, 'Texto editado por admin');
    expect(textarea).toHaveValue('Texto editado por admin');
  });
});
