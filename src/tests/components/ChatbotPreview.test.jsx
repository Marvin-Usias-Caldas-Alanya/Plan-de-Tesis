import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatbotPreview from '../../components/chatbot-config/ChatbotPreview';

vi.mock('../../services/chatbotEngine.js', () => ({
  generateBotResponse: vi.fn(() => ({
    intent: 'greeting',
    content: 'Respuesta de prueba',
    recommendedProducts: [],
  })),
}));

vi.mock('../../services/chatbotConfigService.js', () => ({
  getActiveRules: vi.fn().mockResolvedValue([]),
  getActiveIntents: vi.fn().mockResolvedValue([]),
}));

describe('ChatbotPreview', () => {
  const products = [{ id: 'p1', name: 'Whey', price: 10, stock: 5, is_active: true }];

  it('permite probar mensaje y muestra respuesta', async () => {
    const user = userEvent.setup();
    render(<ChatbotPreview products={products} useLiveConfig={false} />);

    const input = screen.getByLabelText(/mensaje de prueba/i);
    await user.type(input, 'hola');
    await user.click(screen.getByRole('button', { name: /probar respuesta/i }));

    expect(await screen.findByText(/Respuesta de prueba/i)).toBeInTheDocument();
  });

  it('deshabilita botón sin mensaje', () => {
    render(<ChatbotPreview products={products} useLiveConfig={false} />);
    expect(screen.getByRole('button', { name: /probar respuesta/i })).toBeDisabled();
  });
});
