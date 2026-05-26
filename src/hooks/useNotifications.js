import { useCallback, useEffect, useState } from 'react';
import {
  getNotificationsForProfile,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notificationService';

export function useNotifications(profileId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!profileId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getNotificationsForProfile(profileId);
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    refresh();
    if (!profileId) return undefined;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [profileId, refresh]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = useCallback(
    async (id) => {
      await markNotificationRead(id);
      await refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    if (!profileId) return;
    await markAllNotificationsRead(profileId);
    await refresh();
  }, [profileId, refresh]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}
