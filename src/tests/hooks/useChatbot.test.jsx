import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChatbot } from '../../hooks/useChatbot';

vi.mock('../../services/productService.js', () => ({
  getActiveProducts: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Whey', is_active: true, price: 10, stock: 5 }]),
}));

vi.mock('../../services/chatbotService.js', () => ({
  createConversation: vi.fn().mockResolvedValue({ id: 'conv-1' }),
  fetchConversationMessages: vi.fn().mockResolvedValue([]),
  generateBotResponse: vi.fn().mockReturnValue({
    intent: 'greeting',
    content: 'Hola desde bot',
    recommendedProducts: [],
    shouldHandoff: false,
  }),
  saveMessage: vi.fn().mockImplementation((_cid, role, content) =>
    Promise.resolve({
      id: `msg-${Math.random()}`,
      role: role === 'customer' ? 'user' : 'assistant',
      content,
      created_at: new Date().toISOString(),
    }),
  ),
  loadActiveBotRules: vi.fn().mockResolvedValue({
    rules: [],
    intents: [],
    handoffKeywords: null,
    autoMessages: {},
  }),
  recordBotIntent: vi.fn(),
  triggerHumanHandoff: vi.fn().mockResolvedValue({ id: 'm-handoff' }),
  updateConversationCustomer: vi.fn(),
}));

vi.mock('../../services/settingsService.js', () => ({
  isChatbotEnabled: vi.fn().mockResolvedValue(true),
}));

import * as chatbotService from '../../services/chatbotService';

describe('useChatbot', () => {
  const profile = { full_name: 'Cliente', email: 'c@test.com' };
  const user = { id: 'u1', email: 'c@test.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    chatbotService.generateBotResponse.mockReturnValue({
      intent: 'greeting',
      content: 'Hola desde bot',
      recommendedProducts: [],
      shouldHandoff: false,
    });
  });

  it('inicializa conversación al habilitar', async () => {
    const { result } = renderHook(() =>
      useChatbot({ profile, user, enabled: true }),
    );

    await act(async () => {
      await result.current.initConversation();
    });

    expect(chatbotService.createConversation).toHaveBeenCalled();
    await waitFor(() => expect(result.current.messages.length).toBeGreaterThan(0));
  });

  it('sendUserMessage agrega mensajes y respuesta', async () => {
    const { result } = renderHook(() =>
      useChatbot({ profile, user, enabled: true }),
    );

    await act(async () => {
      await result.current.initConversation();
    });

    await act(async () => {
      await result.current.sendUserMessage('hola');
    });

    await waitFor(() => {
      expect(result.current.messages.some((m) => m.content === 'hola')).toBe(true);
      expect(result.current.messages.some((m) => m.content.includes('Hola'))).toBe(true);
    });
  });

  it('detecta compra y solicita handoff', async () => {
    chatbotService.generateBotResponse.mockReturnValue({
      intent: 'purchase',
      content: 'Te conecto con vendedor',
      shouldHandoff: true,
      recommendedProducts: [],
    });

    const { result } = renderHook(() =>
      useChatbot({ profile, user, enabled: true }),
    );

    await act(async () => {
      await result.current.initConversation();
    });

    await act(async () => {
      await result.current.sendUserMessage('quiero comprar');
    });

    await waitFor(() => expect(result.current.handoffRequested).toBe(true));
    expect(chatbotService.triggerHumanHandoff).toHaveBeenCalled();
  });

  it('requestHandoff manual', async () => {
    const { result } = renderHook(() =>
      useChatbot({ profile, user, enabled: true }),
    );

    await act(async () => {
      await result.current.initConversation();
    });

    await act(async () => {
      await result.current.requestHandoff();
    });

    expect(result.current.handoffRequested).toBe(true);
  });
});
