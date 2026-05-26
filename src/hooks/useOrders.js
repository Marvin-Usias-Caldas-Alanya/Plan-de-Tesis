import { useCallback, useEffect, useState } from 'react';
import {
  assignOrderToSeller,
  createOrderFromItems,
  getAllOrders,
  getOrderDetails,
  getOrdersByCustomerProfile,
  getOrdersForSeller,
  getOrderStatuses,
  updateOrderStatus,
} from '../services/orderService';
import { getSellerIdByProfileId } from '../services/profileService';
import { createNotification } from '../services/notificationService';

export function useOrders({ mode = 'admin', profileId, onFeedback } = {}) {
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    if (!profileId && mode !== 'admin') return;
    setLoading(true);
    try {
      let rows = [];
      if (mode === 'admin') {
        rows = await getAllOrders();
      } else if (mode === 'seller') {
        rows = await getOrdersForSeller(profileId);
      } else {
        rows = await getOrdersByCustomerProfile(profileId);
      }
      setOrders(rows);
      const statusRows = await getOrderStatuses();
      setStatuses(statusRows);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, profileId, onFeedback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectOrder = useCallback(async (order) => {
    setSelectedOrder(order);
    if (!order?.id) {
      setOrderDetails([]);
      return;
    }
    try {
      const details = await getOrderDetails(order.id);
      setOrderDetails(details);
    } catch {
      setOrderDetails([]);
    }
  }, []);

  const createPurchaseOrder = useCallback(
    async (items) => {
      if (!profileId) throw new Error('Debes iniciar sesión');
      setSubmitting(true);
      try {
        const order = await createOrderFromItems({ profileId, items });
        await createNotification({
          profileId,
          title: 'Pedido registrado',
          body: `Tu pedido ${order.order_number} fue creado y está pendiente de confirmación.`,
          type: 'order',
        });
        onFeedback?.('success', `Pedido ${order.order_number} registrado`);
        await refresh();
        return order;
      } catch (err) {
        onFeedback?.('error', err.message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [profileId, onFeedback, refresh],
  );

  const changeOrderStatus = useCallback(
    async (orderId, statusCode) => {
      setSubmitting(true);
      try {
        await updateOrderStatus(orderId, statusCode);
        onFeedback?.('success', 'Estado del pedido actualizado');
        await refresh();
        if (selectedOrder?.id === orderId) {
          const updated = orders.find((o) => o.id === orderId);
          if (updated) await selectOrder({ ...updated, status_code: statusCode });
        }
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onFeedback, refresh, selectedOrder, orders, selectOrder],
  );

  const takeOrderAsSeller = useCallback(
    async (orderId) => {
      if (!profileId) return false;
      setSubmitting(true);
      try {
        const sellerId = await getSellerIdByProfileId(profileId);
        await assignOrderToSeller(orderId, sellerId);
        onFeedback?.('success', 'Pedido asignado a ti');
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [profileId, onFeedback, refresh],
  );

  const notifyCustomerOrderUpdate = useCallback(async (customerProfileId, title, body) => {
    try {
      await createNotification({
        profileId: customerProfileId,
        title,
        body,
        type: 'order',
      });
    } catch {
      /* opcional */
    }
  }, []);

  return {
    orders,
    statuses,
    selectedOrder,
    orderDetails,
    loading,
    submitting,
    refresh,
    selectOrder,
    createPurchaseOrder,
    changeOrderStatus,
    takeOrderAsSeller,
    notifyCustomerOrderUpdate,
  };
}
