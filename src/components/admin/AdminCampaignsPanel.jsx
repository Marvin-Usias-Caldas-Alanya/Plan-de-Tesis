import { useCallback, useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AdminEmptyState from './AdminEmptyState';
import { createSocialCampaign, getSocialCampaigns } from '../../services/socialMediaService';
import './AdminShared.css';

export default function AdminCampaignsPanel({ onFeedback }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCampaigns(await getSocialCampaigns());
    } catch (err) {
      onFeedback?.('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createSocialCampaign({ name: name.trim(), status: 'draft' });
      onFeedback?.('success', 'Campaña creada');
      setName('');
      await load();
    } catch (err) {
      onFeedback?.('error', err.message);
    }
  };

  if (loading) return <Loading label="Cargando campañas…" />;

  return (
    <Card elevated className="admin-panel-section">
      <form className="admin-form-grid" onSubmit={handleCreate}>
        <label>
          Nueva campaña
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <Button type="submit">Crear campaña</Button>
      </form>
      {!campaigns.length ? (
        <AdminEmptyState title="Sin campañas" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Inicio</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.status}</td>
                  <td>{c.starts_at ? new Date(c.starts_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
