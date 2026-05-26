import { describe, expect, it } from 'vitest';
import { ROLES, ROUTES } from '../../utils/constants';
import { canAccessRoute, getDefaultRouteForRole } from '../../utils/authRoutes';
import { mapAuthError } from '../../utils/authErrors';
import {
  buildChatConsultMessage,
  buildPurchaseRequestMessage,
  formatProductPrice,
} from '../../utils/productFormatters';
import { pickLastMessagePerConversation } from '../../utils/conversationMessages';
import { buildOverviewStats, buildReportStats } from '../../utils/adminStatsBuilders';
import {
  validateLoginForm,
  validateRegisterForm,
} from '../../utils/validators';

describe('utils — cobertura ampliada', () => {
  describe('constants y authRoutes', () => {
    it('roles definidos', () => {
      expect(ROLES.ADMIN).toBe('admin');
      expect(ROUTES.CATALOG).toBeTruthy();
    });

    it('rutas por rol', () => {
      expect(getDefaultRouteForRole(ROLES.ADMIN)).toBe(ROUTES.ADMIN_DASHBOARD);
      expect(getDefaultRouteForRole(ROLES.SELLER)).toBe(ROUTES.SELLER_DASHBOARD);
      expect(getDefaultRouteForRole(ROLES.CUSTOMER)).toBe(ROUTES.CATALOG);
      expect(getDefaultRouteForRole('unknown')).toBe(ROUTES.CATALOG);
    });

    it('canAccessRoute por rol', () => {
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.ADMIN_DASHBOARD)).toBe(true);
      expect(canAccessRoute(ROLES.CUSTOMER, ROUTES.ADMIN_DASHBOARD)).toBe(false);
      expect(canAccessRoute(ROLES.SELLER, ROUTES.SELLER_DASHBOARD)).toBe(true);
      expect(canAccessRoute(ROLES.ADMIN, ROUTES.SELLER_DASHBOARD)).toBe(true);
      expect(canAccessRoute(ROLES.CUSTOMER, ROUTES.CATALOG)).toBe(true);
      expect(canAccessRoute(ROLES.CUSTOMER, '/otra')).toBe(true);
    });
  });

  describe('authErrors', () => {
    it('traduce errores conocidos', () => {
      expect(mapAuthError(null)).toContain('inesperado');
      expect(mapAuthError({ code: 'invalid_credentials' })).toContain('incorrectos');
      expect(mapAuthError({ message: 'User already registered' })).toContain('registrado');
      expect(mapAuthError({ message: 'Password is too weak' })).toContain('seguridad');
      expect(mapAuthError({ message: 'Network error fetch failed' })).toContain('conexión');
      expect(mapAuthError({ message: 'Custom error' })).toBe('Custom error');
    });
  });

  describe('productFormatters y conversationMessages', () => {
    it('formatea precio y mensajes de chat', () => {
      expect(formatProductPrice(100)).toContain('100');
      const product = { name: 'Whey', sku: 'W1', price: 50 };
      expect(buildChatConsultMessage(product)).toContain('Whey');
      expect(buildPurchaseRequestMessage(product)).toContain('Whey');
      const map = pickLastMessagePerConversation([
        { conversation_id: 'c1', message: 'a', sender_type: 'bot', created_at: '2026-01-01' },
        { conversation_id: 'c1', message: 'b', sender_type: 'customer', created_at: '2026-01-02' },
      ]);
      expect(map.get('c1').content).toBe('b');
    });
  });

  describe('adminStatsBuilders', () => {
    it('construye tarjetas KPI', () => {
      const overview = buildOverviewStats({
        users: 1,
        activeProducts: 2,
        orders: 3,
        pendingHandoffs: 4,
      });
      expect(overview.some((c) => c.label.includes('Usuarios'))).toBe(true);
      expect(buildReportStats(null)).toEqual([]);
      expect(buildReportStats({ conversations: 5 }).length).toBeGreaterThan(0);
    });
  });

  describe('validators — formularios auth', () => {
    it('validateLoginForm campos vacíos', () => {
      const r = validateLoginForm({ email: '', password: '' });
      expect(r.isValid).toBe(false);
      expect(r.errors.email).toBeDefined();
      expect(r.errors.password).toBeDefined();
    });

    it('validateLoginForm email inválido', () => {
      const r = validateLoginForm({ email: 'bad', password: '123456' });
      expect(r.errors.email).toBeDefined();
    });

    it('validateRegisterForm contraseñas distintas', () => {
      const r = validateRegisterForm({
        fullName: 'Ana',
        email: 'ana@test.com',
        password: '123456',
        confirmPassword: '654321',
      });
      expect(r.errors.confirmPassword).toContain('no coinciden');
    });

    it('validateRegisterForm válido', () => {
      const r = validateRegisterForm({
        fullName: 'Ana López',
        email: 'ana@test.com',
        password: '123456',
        confirmPassword: '123456',
      });
      expect(r.isValid).toBe(true);
    });
  });
});
