import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminChatbotPanel from '../../components/admin/AdminChatbotPanel';

const mockSaveRule = vi.fn().mockResolvedValue(true);
const mockSaveIntent = vi.fn().mockResolvedValue(true);

vi.mock('../../hooks/useChatbotConfig', () => ({
  useChatbotConfig: vi.fn(),
}));

vi.mock('../../components/chatbot-config/ChatbotPreview', () => ({
  default: () => (
    <div data-testid="chatbot-preview">
      <p>Vista previa del bot</p>
    </div>
  ),
}));

import { useChatbotConfig } from '../../hooks/useChatbotConfig';

describe('AdminChatbotPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatbotConfig.mockReturnValue({
      rules: [
        {
          id: 'r1',
          rule_code: 'greeting',
          intent_pattern: 'hola',
          response_template: 'Hola',
          priority: 10,
          triggers_handoff: false,
          is_active: true,
        },
      ],
      intents: [],
      products: [],
      handoffKeywords: 'vendedor|humano',
      autoMessages: { greeting: 'Hola', handoff: 'Handoff', fallback: 'Fallback' },
      loading: false,
      submitting: false,
      saveRule: mockSaveRule,
      removeRule: vi.fn(),
      saveIntent: mockSaveIntent,
      removeIntent: vi.fn(),
      saveGlobalConfig: vi.fn(),
      toggleRuleActive: vi.fn(),
      toggleIntentActive: vi.fn(),
      setHandoffKeywords: vi.fn(),
      setAutoMessages: vi.fn(),
    });
  });

  it('muestra reglas en tabla', () => {
    render(<AdminChatbotPanel onFeedback={vi.fn()} />);
    expect(screen.getByText('Configuración del Chatbot')).toBeInTheDocument();
    expect(screen.getByText('greeting')).toBeInTheDocument();
  });

  it('permite crear regla', async () => {
    const user = userEvent.setup();
    render(<AdminChatbotPanel onFeedback={vi.fn()} />);
    await user.type(screen.getByLabelText(/código/i), 'price_check');
    await user.type(screen.getByLabelText(/patrón \(regex/i), 'precio|cuesta');
    await user.type(screen.getByLabelText(/respuesta automática/i), 'Consulta precios');
    await user.click(screen.getByRole('button', { name: /crear regla/i }));
    expect(mockSaveRule).toHaveBeenCalledWith(
      expect.objectContaining({ rule_code: 'price_check' }),
      undefined,
    );
  });

  it('permite probar respuesta en preview', async () => {
    const user = userEvent.setup();
    render(<AdminChatbotPanel onFeedback={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /vista previa/i }));
    expect(screen.getByTestId('chatbot-preview')).toBeInTheDocument();
    expect(screen.getByText(/vista previa del bot/i)).toBeInTheDocument();
  });
});
