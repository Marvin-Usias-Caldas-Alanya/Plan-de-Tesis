import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  validateProductForm,
  validatePriceStockUpdate,
} from '../../utils/validators';

describe('validators — pruebas unitarias obligatorias', () => {
  describe('validar email', () => {
    it('acepta correos válidos', () => {
      expect(isValidEmail('usuario@ejemplo.com')).toBe(true);
      expect(isValidEmail('  test@mail.org  ')).toBe(true);
    });

    it('rechaza formatos inválidos', () => {
      expect(isValidEmail('invalido')).toBe(false);
      expect(isValidEmail('sin-arroba.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validar contraseña', () => {
    it('acepta longitud mínima de 6', () => {
      expect(isValidPassword('123456')).toBe(true);
    });

    it('rechaza contraseñas cortas', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('validar producto', () => {
    it('acepta producto completo válido', () => {
      const result = validateProductForm({
        name: 'Whey Protein',
        price: 899,
        stock: 10,
        category_id: 'cat-1',
      });
      expect(result.isValid).toBe(true);
    });

    it('rechaza nombre vacío', () => {
      const result = validateProductForm({
        name: '   ',
        price: 100,
        stock: 1,
        category_id: 'cat-1',
      });
      expect(result.errors.name).toBe('El nombre es obligatorio');
    });
  });

  describe('validar precio', () => {
    it('rechaza precio vacío o no numérico', () => {
      expect(
        validateProductForm({ name: 'X', price: '', stock: 1, category_id: 'c' }).errors.price,
      ).toBe('El precio es obligatorio');
      expect(
        validateProductForm({ name: 'X', price: 'abc', stock: 1, category_id: 'c' }).errors.price,
      ).toBe('El precio es obligatorio');
    });

    it('rechaza precio menor o igual a cero', () => {
      expect(
        validateProductForm({ name: 'X', price: 0, stock: 1, category_id: 'c' }).errors.price,
      ).toBe('El precio debe ser mayor a 0');
    });

    it('validatePriceStockUpdate valida precio positivo', () => {
      expect(validatePriceStockUpdate({ price: 10, stock: 0 }).isValid).toBe(true);
      expect(validatePriceStockUpdate({ price: 0, stock: 5 }).errors.price).toBeDefined();
    });
  });

  describe('validar stock', () => {
    it('rechaza stock negativo', () => {
      expect(
        validateProductForm({ name: 'X', price: 10, stock: -1, category_id: 'c' }).errors.stock,
      ).toBe('El stock debe ser mayor o igual a 0');
    });

    it('acepta stock en cero', () => {
      const result = validateProductForm({ name: 'X', price: 10, stock: 0, category_id: 'c' });
      expect(result.errors.stock).toBeUndefined();
    });
  });
});
