import { useCallback, useState } from 'react';
import { createProduct, updateProduct } from '../services/productService';
import { validatePriceStockUpdate } from '../utils/validators';

/**
 * Acciones CRUD de productos para el panel admin (capa de orquestación).
 * Mantiene Supabase fuera de componentes y páginas.
 */
export function useAdminProductActions({ onFeedback } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const runAction = useCallback(
    async (fn, { busyKey = 'action' } = {}) => {
      const setBusy = busyKey === 'submit' ? setSubmitting : setActionBusy;
      setBusy(true);
      try {
        return await fn();
      } catch (err) {
        onFeedback?.('error', err.message);
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [onFeedback],
  );

  const create = useCallback(
    (formData) =>
      runAction(() => createProduct(formData), { busyKey: 'submit' }).then(() => {
        onFeedback?.('success', `Producto "${formData.name}" creado correctamente.`);
      }),
    [runAction, onFeedback],
  );

  const update = useCallback(
    (id, formData) =>
      runAction(() => updateProduct(id, formData), { busyKey: 'submit' }).then(() => {
        onFeedback?.('success', `Producto "${formData.name}" actualizado.`);
      }),
    [runAction, onFeedback],
  );

  const setActive = useCallback(
    (product, isActive) =>
      runAction(async () => {
        await updateProduct(product.id, { is_active: isActive });
        const verb = isActive ? 'activado en catálogo' : 'desactivado';
        onFeedback?.('success', `"${product.name}" ${verb}.`);
      }),
    [runAction, onFeedback],
  );

  const quickUpdate = useCallback(
    (id, { price, stock }) => {
      const validation = validatePriceStockUpdate({ price, stock });
      if (!validation.isValid) {
        onFeedback?.('error', Object.values(validation.errors)[0]);
        return Promise.resolve(false);
      }

      return runAction(async () => {
        await updateProduct(id, { price, stock });
        onFeedback?.('success', 'Precio y stock actualizados.');
        return true;
      });
    },
    [runAction, onFeedback],
  );

  return {
    submitting,
    actionBusy,
    createProduct: create,
    updateProduct: update,
    setProductActive: setActive,
    quickUpdatePriceStock: quickUpdate,
  };
}
