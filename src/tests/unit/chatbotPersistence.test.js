import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/profileService.js', () => ({
  getCustomerIdByProfileId: vi.fn().mockResolvedValue('cust-1'),
  getSellerIdByProfileId: vi.fn().mockResolvedValue('seller-1'),
}));

vi.mock('../../services/chatbotConfigService.js', () => ({
  loadBotEngineConfig: vi.fn().mockResolvedValue({ rules: [], intents: [] }),
  logChatbotIntent: vi.fn().mockResolvedValue({ id: 'intent-log' }),
}));

vi.mock('../../services/handoffService.js', () => ({
  completeHandoffsForConversation: vi.fn().mockResolvedValue(undefined),
  triggerHumanHandoff: vi.fn(),
  fetchPendingConversations: vi.fn().mockResolvedValue([]),
  requestHumanHandoff: vi.fn(),
  assignConversationToSeller: vi.fn(),
  HANDOFF_CLIENT_MESSAGE: 'Handoff msg',
}));

vi.mock('../../services/notificationService.js', () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 'n1' }),
}));

import {
  closeConversation,
  createConversation,
  fetchConversationMessages,
  recordBotIntent,
  saveMessage,
  sendMessage,
} from '../../services/chatbotService';

describe('chatbotService — persistencia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crea conversación con customer_id', async () => {
    const conv = { id: 'conv-1', status: 'bot', created_at: '2026-01-01' };
    const builder = createQueryBuilder({ data: conv, error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ conversations: () => builder }));

    const row = await createConversation({
      profileId: 'prof-1',
      customerName: 'Ana',
      customerEmail: 'ana@test.com',
    });
    expect(row.id).toBe('conv-1');
  });

  it('guarda y lista mensajes', async () => {
    const msgRow = {
      id: 'm1',
      sender_type: 'bot',
      message: 'Hola',
      created_at: '2026-01-01',
    };
    const saveB = createQueryBuilder({ data: msgRow, error: null });
    const listB = createQueryBuilder({ data: [msgRow], error: null });
    let n = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'messages') {
        n += 1;
        return n === 1 ? saveB : listB;
      }
      return createQueryBuilder({ data: null, error: null });
    });

    const saved = await saveMessage('conv-1', 'bot', 'Hola');
    expect(saved.role).toBe('assistant');
    expect(saved.content).toBe('Hola');

    const list = await fetchConversationMessages('conv-1');
    expect(list).toHaveLength(1);
  });

  it('cierra conversación y guarda mensaje sistema', async () => {
    const updB = createQueryBuilder({ data: { id: 'conv-1', status: 'closed' }, error: null });
    const msgB = createQueryBuilder({
      data: { id: 'm2', sender_type: 'system', message: 'cerrada', created_at: 'x' },
      error: null,
    });
    let msgCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'conversations') return updB;
      if (table === 'messages') {
        msgCalls += 1;
        return msgB;
      }
      return createQueryBuilder({ data: null, error: null });
    });

    await closeConversation('conv-1');
    expect(msgCalls).toBeGreaterThan(0);
  });

  it('recordBotIntent tolera error', async () => {
    const { logChatbotIntent } = await import('../../services/chatbotConfigService');
    logChatbotIntent.mockRejectedValueOnce(new Error('fail'));
    await expect(
      recordBotIntent({ conversationId: 'c', intentCode: 'greeting' }),
    ).resolves.toBeNull();
  });

  it('sendMessage mapea roles legacy', async () => {
    const msgB = createQueryBuilder({
      data: { id: 'm3', sender_type: 'customer', message: 'hi', created_at: 'x' },
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ messages: () => msgB }));
    const ui = await sendMessage({ conversationId: 'c1', role: 'user', content: 'hi' });
    expect(ui.role).toBe('user');
  });
});
