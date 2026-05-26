import { useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import SocialPlatformSelector from './SocialPlatformSelector';
import CampaignSelector from './CampaignSelector';
import { SOCIAL_POST_STATUSES } from '../../utils/socialAiConstants';
import './SocialPosts.css';

const EMPTY = {
  title: '',
  content: '',
  platformId: '',
  campaignId: '',
  productId: '',
  status: 'draft',
  scheduledAt: '',
};

export default function SocialPostForm({
  platforms,
  campaigns,
  products,
  initialData,
  editingId,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? '',
        content: initialData.content ?? '',
        platformId: initialData.platform_id ?? initialData.platformId ?? '',
        campaignId: initialData.campaign_id ?? initialData.campaignId ?? '',
        productId: initialData.product_id ?? initialData.productId ?? '',
        status: initialData.status ?? 'draft',
        scheduledAt: initialData.scheduled_at
          ? new Date(initialData.scheduled_at).toISOString().slice(0, 16)
          : '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [initialData, editingId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: form.title,
      content: form.content,
      platformId: form.platformId,
      campaignId: form.campaignId || null,
      productId: form.productId || null,
      status: form.status,
      scheduledAt:
        form.status === 'scheduled' && form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null,
    });
  };

  return (
    <Card elevated className="social-module">
      <h2 className="page-section__title">
        {editingId ? 'Editar publicación manual' : 'Crear publicación manual'}
      </h2>
      <form className="social-form" onSubmit={handleSubmit}>
        <label>
          Título
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>

        <div className="social-form__row">
          <SocialPlatformSelector
            platforms={platforms}
            value={form.platformId}
            onChange={(v) => setForm({ ...form, platformId: v })}
            required
          />
          <CampaignSelector
            campaigns={campaigns}
            value={form.campaignId}
            onChange={(v) => setForm({ ...form, campaignId: v })}
          />
        </div>

        <label>
          Producto relacionado (opcional)
          <select
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Sin producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.sku ? `(${p.sku})` : ''}
              </option>
            ))}
          </select>
        </label>

        <div className="social-form__row">
          <label>
            Estado
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {SOCIAL_POST_STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {form.status === 'scheduled' && (
            <label>
              Fecha programada
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                required
              />
            </label>
          )}
        </div>

        <label>
          Contenido
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            required
          />
        </label>

        <div className="social-form__actions">
          <Button type="submit" disabled={submitting}>
            {editingId ? 'Guardar cambios' : 'Crear publicación'}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
