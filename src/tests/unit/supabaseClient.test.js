import { describe, expect, it } from 'vitest';
import {
  getMissingSupabaseEnvVars,
  isSupabaseConfigured,
  supabase,
} from '../../services/supabaseClient';

describe('supabaseClient', () => {
  it('exporta cliente y helpers de configuración', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe('function');
    expect(typeof isSupabaseConfigured).toBe('function');
    expect(Array.isArray(getMissingSupabaseEnvVars())).toBe(true);
  });
});
