import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder, createSupabaseFromMock } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

vi.mock('../../services/profileService.js', () => ({
  getSellerIdByProfileId: vi.fn().mockResolvedValue('seller-1'),
}));

import {
  fetchPendingConversations,
  getHandoffRequests,
  requestHumanHandoff,
  triggerHumanHandoff,
} from '../../services/handoffService';
import { getPublicSettings, isChatbotEnabled, mapSetting, upsertSetting } from '../../services/settingsService';

describe('handoffService y settingsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requestHumanHandoff reutiliza pendiente existente', async () => {
    const updB = createQueryBuilder({ data: null, error: null });
    const existingB = createQueryBuilder({ data: { id: 'h1', status: 'pending' }, error: null });
    mockFrom.mockImplementation((table) => {
      if (table === 'conversations') return updB;
      if (table === 'handoff_requests') return existingB;
      return createQueryBuilder({ data: null, error: null });
    });

    const res = await requestHumanHandoff('conv-1', 'Quiero comprar');
    expect(res.id).toBe('h1');
  });

  it('triggerHumanHandoff crea mensaje sistema', async () => {
    const updB = createQueryBuilder({ data: null, error: null });
    const maybeB = createQueryBuilder({ data: null, error: null });
    const insHandoff = createQueryBuilder({
      data: { id: 'h2', conversation_id: 'conv-1', status: 'pending' },
      error: null,
    });
    const insMsg = createQueryBuilder({
      data: { id: 'm1', sender_type: 'system', message: 'handoff', created_at: 'x' },
      error: null,
    });
    let handoffCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'conversations') return updB;
      if (table === 'handoff_requests') {
        handoffCalls += 1;
        return handoffCalls === 1 ? maybeB : insHandoff;
      }
      if (table === 'messages') return insMsg;
      return createQueryBuilder({ data: null, error: null });
    });

    const msg = await triggerHumanHandoff('conv-1');
    expect(msg.sender_type).toBe('system');
  });

  it('getHandoffRequests mapea conversaciones', async () => {
    const builder = createQueryBuilder({
      data: [
        {
          id: 'h1',
          reason: 'compra',
          status: 'pending',
          conversations: { customer_name: 'Ana', customer_email: 'a@t.com', status: 'pending_handoff' },
        },
      ],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ handoff_requests: () => builder }));
    const list = await getHandoffRequests();
    expect(list[0].customer_name).toBe('Ana');
  });

  it('fetchPendingConversations enriquece con último mensaje', async () => {
    const convB = createQueryBuilder({
      data: [
        {
          id: 'c1',
          customer_name: 'Ana',
          status: 'pending_handoff',
          updated_at: '2026-01-02',
          handoff_requests: [{ id: 'h1', reason: 'x', status: 'pending' }],
        },
      ],
      error: null,
    });
    const msgB = createQueryBuilder({
      data: [
        {
          conversation_id: 'c1',
          message: 'Necesito ayuda',
          sender_type: 'customer',
          created_at: '2026-01-02',
        },
      ],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'conversations') return convB;
      if (table === 'messages') return msgB;
      return createQueryBuilder({ data: [], error: null });
    });
    const pending = await fetchPendingConversations();
    expect(pending).toHaveLength(1);
    expect(pending[0].customer_name).toBe('Ana');
    expect(pending[0].last_message).toBe('Necesito ayuda');
  });

  it('settings: mapSetting, públicos y chatbot flag', async () => {
    expect(mapSetting(null)).toBeNull();
    const builder = createQueryBuilder({
      data: [
        { id: '1', setting_key: 'chatbot_enabled', setting_value: 'true', is_public: true },
        { id: '2', setting_key: 'store_name', setting_value: '"NutriStore"', is_public: true },
      ],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ system_settings: () => builder }));

    const pub = await getPublicSettings();
    expect(pub.chatbot_enabled).toBe(true);
    await expect(isChatbotEnabled()).resolves.toBe(true);
  });

  it('isChatbotEnabled false cuando setting es false', async () => {
    const builder = createQueryBuilder({
      data: [{ setting_key: 'chatbot_enabled', setting_value: 'false' }],
      error: null,
    });
    mockFrom.mockImplementation(createSupabaseFromMock({ system_settings: () => builder }));
    await expect(isChatbotEnabled()).resolves.toBe(false);
  });

  it('upsertSetting guarda JSON', async () => {
    const row = {
      id: 's1',
      setting_key: 'chatbot_auto_messages',
      setting_value: '{"greeting":"Hola"}',
      is_public: false,
      updated_at: 'x',
    };
    const builder = createQueryBuilder({ data: row, error: null });
    mockFrom.mockImplementation(createSupabaseFromMock({ system_settings: () => builder }));

    const saved = await upsertSetting('chatbot_auto_messages', { greeting: 'Hola' }, false);
    expect(saved.value.greeting).toBe('Hola');
  });
});
