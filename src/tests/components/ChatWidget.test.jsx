import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWidget from '../../components/chatbot/ChatWidget';
import { renderWithRouter } from '../helpers/testUtils';

const mockInit = vi.fn().mockResolvedValue('conv-1');
const mockSend = vi.fn();
const mockHandoff = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useChatbot', () => ({
  useChatbot: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';
import { useChatbot } from '../../hooks/useChatbot';

function ChatWidgetHarness() {
  const [messages, setMessages] = useState([
    { id: 'm1', role: 'bot', content: '¡Hola! Soy NutriBot.' },
  ]);
  const [handoffRequested, setHandoffRequested] = useState(false);

  useChatbot.mockImplementation(() => ({
    messages,
    loading: false,
    handoffRequested,
    chatbotEnabled: true,
    initConversation: mockInit,
    sendUserMessage: (text) => {
      mockSend(text);
      setMessages((prev) => [
        ...prev,
        { id: `u-${prev.length}`, role: 'customer', content: text },
        {
          id: `b-${prev.length}`,
          role: 'bot',
          content: '¡Perfecto! Detecté interés de compra.',
        },
      ]);
      if (/comprar/i.test(text)) {
        setHandoffRequested(true);
      }
    },
    requestHandoff: mockHandoff,
  }));

  return <ChatWidget />;
}

const defaultChatbotMock = {
  messages: [],
  loading: false,
  handoffRequested: false,
  chatbotEnabled: true,
  initConversation: mockInit,
  sendUserMessage: mockSend,
  requestHandoff: mockHandoff,
};

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatbot.mockReturnValue(defaultChatbotMock);
    useAuth.mockReturnValue({
      user: { id: 'user-1', email: 'cliente@test.com' },
      profile: { full_name: 'Cliente Demo', email: 'cliente@test.com' },
      isAuthenticated: true,
    });
  });

  it('no renderiza si el usuario no está autenticado', () => {
    useAuth.mockReturnValue({
      user: null,
      profile: null,
      isAuthenticated: false,
    });
    const { container } = render(<ChatWidget />);
    expect(container).toBeEmptyDOMElement();
  });

  it('abre chatbot', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ChatWidgetHarness />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    expect(screen.getByText('Asistente NutriStore')).toBeInTheDocument();
    expect(mockInit).toHaveBeenCalled();
  });

  it('envía mensaje', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ChatWidgetHarness />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    await user.type(input, 'precio del whey');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));
    expect(mockSend).toHaveBeenCalledWith('precio del whey');
  });

  it('muestra respuesta', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ChatWidgetHarness />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    await user.type(input, 'hola');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));
    await waitFor(() => {
      expect(screen.getByText(/Detecté interés de compra/i)).toBeInTheDocument();
    });
  });

  it('detecta compra (handoff)', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ChatWidgetHarness />);
    await user.click(screen.getByRole('button', { name: /abrir asistente/i }));
    const input = screen.getByPlaceholderText(/escribe tu mensaje/i);
    await user.type(input, 'quiero comprar proteína');
    await user.click(screen.getByRole('button', { name: /^enviar$/i }));
    expect(mockSend).toHaveBeenCalledWith('quiero comprar proteína');
    await waitFor(() => {
      expect(screen.getByText(/handoff solicitado/i)).toBeInTheDocument();
    });
  });
});
