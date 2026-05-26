import { useCallback, useEffect, useState } from 'react';
import { getAllSettings, getPublicSettings, upsertSetting } from '../services/settingsService';

export function usePublicSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicSettings();
      setSettings(data);
    } catch {
      setSettings({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, refresh };
}

export function useAdminSettings({ onFeedback } = {}) {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSettings();
      setSettings(data);
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSetting = useCallback(
    async (key, value, isPublic = false) => {
      setSaving(true);
      try {
        await upsertSetting(key, value, isPublic);
        onFeedback?.('success', `Configuración "${key}" guardada`);
        await refresh();
        return true;
      } catch (err) {
        onFeedback?.('error', err.message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [onFeedback, refresh],
  );

  return { settings, loading, saving, refresh, saveSetting };
}
