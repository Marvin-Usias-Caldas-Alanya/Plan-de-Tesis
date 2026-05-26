import { vi } from 'vitest';

/**
 * Builder encadenable compatible con consultas Supabase ({ data, error }).
 */
/**
 * @param {{ data?: unknown, error?: unknown }} result
 * @param {{ count?: number }} meta - para consultas head/count de Supabase
 */
export function createQueryBuilder(result = { data: null, error: null }, meta = {}) {
  const resolved =
    meta.count !== undefined
      ? { count: meta.count, data: result.data ?? null, error: result.error ?? null }
      : result;

  const builder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    eq: vi.fn(),
    ilike: vi.fn(),
    or: vi.fn(),
    in: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  const chain = () => builder;

  builder.select.mockImplementation(chain);
  builder.insert.mockImplementation(chain);
  builder.update.mockImplementation(chain);
  builder.delete.mockImplementation(chain);
  builder.upsert.mockImplementation(chain);
  builder.eq.mockImplementation(chain);
  builder.ilike.mockImplementation(chain);
  builder.or.mockImplementation(chain);
  builder.in.mockImplementation(chain);
  builder.lte.mockImplementation(chain);
  builder.order.mockImplementation(chain);
  builder.limit.mockImplementation(chain);
  builder.single.mockResolvedValue(result);
  builder.maybeSingle.mockResolvedValue(result);

  builder.then = (onFulfilled, onRejected) =>
    Promise.resolve(resolved).then(onFulfilled, onRejected);

  return builder;
}

/** Builder que resuelve solo conteo (countRows, adminService). */
export function createCountBuilder(count = 0, error = null) {
  return createQueryBuilder({ data: null, error }, { count });
}

/**
 * Mock de supabase.from() por tabla.
 * @param {Record<string, () => object>} tableHandlers
 */
export function createSupabaseFromMock(tableHandlers = {}) {
  return vi.fn((table) => {
    if (tableHandlers[table]) {
      return tableHandlers[table]();
    }
    return createQueryBuilder({ data: null, error: null });
  });
}

/**
 * Mock estándar del cliente Supabase para tests de servicios.
 */
export function createSupabaseClientMock(tableHandlers = {}) {
  return {
    from: createSupabaseFromMock(tableHandlers),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  };
}
