import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryBuilder } from '../helpers/supabaseMock';

const mockFrom = vi.hoisted(() => vi.fn());

vi.mock('../../services/supabaseClient.js', () => ({
  supabase: { from: mockFrom, auth: {} },
}));

import {
  getInventoryMovements,
  getStockOverview,
  registerStockEntry,
  registerStockOutput,
} from '../../services/inventoryService';
import { getAuditLogs } from '../../services/auditService';
import { getErrorLogs } from '../../services/errorLogService';
import { getSocialMetrics, getAllAiGeneratedContents } from '../../services/socialMediaService';

describe('inventory, audit, errorLog, socialMedia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inventario: movimientos y resumen', async () => {
    const movB = createQueryBuilder({
      data: [
        {
          id: 'mv1',
          movement_type: 'entry',
          quantity: 10,
          products: { name: 'Whey', sku: 'W1' },
        },
      ],
      error: null,
    });
    const stockB = createQueryBuilder({
      data: [{ id: 'p1', name: 'Whey', stock: 10 }],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'inventory_movements') return movB;
      if (table === 'products') return stockB;
      return createQueryBuilder({ data: [], error: null });
    });

    const moves = await getInventoryMovements();
    expect(moves[0].product_name).toBe('Whey');
    const overview = await getStockOverview();
    expect(overview[0].stock).toBe(10);
  });

  it('registerStockEntry ajusta stock', async () => {
    const stockRead = createQueryBuilder({ data: { stock: 5 }, error: null });
    const movementIns = createQueryBuilder({ data: { id: 'mv1' }, error: null });
    const entryIns = createQueryBuilder({ data: { id: 'e1', product_id: 'p1', quantity: 3 }, error: null });
    const stockUpd = createQueryBuilder({ data: null, error: null });
    let prodCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'inventory_movements') return movementIns;
      if (table === 'stock_entries') return entryIns;
      if (table === 'stock_outputs') return createQueryBuilder({ data: { id: 'o1' }, error: null });
      if (table === 'products') {
        prodCalls += 1;
        if (prodCalls === 1) return stockRead;
        return stockUpd;
      }
      return createQueryBuilder({ data: null, error: null });
    });

    await registerStockEntry({ productId: 'p1', quantity: 3, source: 'compra' });
    expect(movementIns.insert).toHaveBeenCalled();
  });

  it('registerStockOutput reduce stock', async () => {
    const stockRead = createQueryBuilder({ data: { stock: 10 }, error: null });
    const movementIns = createQueryBuilder({ data: { id: 'mv2' }, error: null });
    const outputIns = createQueryBuilder({ data: { id: 'out1' }, error: null });
    const stockUpd = createQueryBuilder({ data: null, error: null });
    let prodCalls = 0;
    mockFrom.mockImplementation((table) => {
      if (table === 'inventory_movements') return movementIns;
      if (table === 'stock_outputs') return outputIns;
      if (table === 'products') {
        prodCalls += 1;
        return prodCalls === 1 ? stockRead : stockUpd;
      }
      return createQueryBuilder({ data: null, error: null });
    });

    await registerStockOutput({ productId: 'p1', quantity: 2, reason: 'venta' });
    expect(outputIns.insert).toHaveBeenCalled();
  });

  it('audit y error logs', async () => {
    const auditB = createQueryBuilder({
      data: [
        {
          id: 'a1',
          action: 'UPDATE',
          table_name: 'products',
          profiles: { full_name: 'Admin' },
        },
      ],
      error: null,
    });
    const errB = createQueryBuilder({
      data: [
        {
          id: 'e1',
          error_code: 'E01',
          message: 'fail',
          severity: 'error',
          profiles: null,
        },
      ],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'audit_logs') return auditB;
      if (table === 'error_logs') return errB;
      return createQueryBuilder({ data: [], error: null });
    });

    const audits = await getAuditLogs(50);
    expect(audits[0].profile_name).toBe('Admin');
    const errors = await getErrorLogs();
    expect(errors[0].message).toBe('fail');
  });

  it('socialMedia métricas e historial IA', async () => {
    const metricsB = createQueryBuilder({
      data: [
        {
          id: 'm1',
          impressions: 100,
          social_posts: { title: 'Post', social_platforms: { name: 'IG' } },
        },
      ],
      error: null,
    });
    const aiB = createQueryBuilder({
      data: [{ id: 'ai1', generated_text: 'Texto', social_posts: { title: 'P' } }],
      error: null,
    });
    mockFrom.mockImplementation((table) => {
      if (table === 'social_metrics') return metricsB;
      if (table === 'ai_generated_contents') return aiB;
      return createQueryBuilder({ data: [], error: null });
    });

    const metrics = await getSocialMetrics();
    expect(metrics[0].platform_name).toBe('IG');
    const ai = await getAllAiGeneratedContents();
    expect(ai[0].post_title).toBe('P');
  });
});
