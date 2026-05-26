import { useEffect, useState } from 'react';
import { useAdminSettings } from '../../hooks/useSettings';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import './AdminPanels.css';

export default function SettingsPanel({ onFeedback }) {
  const { settings, loading, saving, saveSetting } = useAdminSettings({ onFeedback });
  const [storeName, setStoreName] = useState('NutriStore');
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  useEffect(() => {
    if (loading) return;
    const nameRow = settings.find((s) => s.key === 'store_name');
    const botRow = settings.find((s) => s.key === 'chatbot_enabled');
    if (nameRow?.value != null) {
      setStoreName(String(nameRow.value).replace(/"/g, ''));
    }
    if (botRow?.value !== undefined) {
      setChatbotEnabled(botRow.value !== false && botRow.value !== 'false');
    }
  }, [loading, settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSetting('store_name', storeName, true);
    await saveSetting('chatbot_enabled', chatbotEnabled, true);
  };

  return (
    <Card elevated className="admin-panel__form-card">
      <h2 className="page-section__title">Configuración del sistema</h2>
      {loading ? (
        <Loading label="Cargando configuración…" />
      ) : (
        <form className="admin-panel__form" onSubmit={handleSave}>
          <label>
            Nombre de la tienda (system_settings)
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          </label>
          <label className="admin-panel__checkbox">
            <input
              type="checkbox"
              checked={chatbotEnabled}
              onChange={(e) => setChatbotEnabled(e.target.checked)}
            />
            Chatbot habilitado
          </label>
          <Button type="submit" disabled={saving}>
            Guardar configuración
          </Button>
        </form>
      )}
    </Card>
  );
}
