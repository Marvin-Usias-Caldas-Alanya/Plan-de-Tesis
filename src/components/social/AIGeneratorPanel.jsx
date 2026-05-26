import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { SocialPlatformCodeSelector } from './SocialPlatformSelector';
import CampaignSelector from './CampaignSelector';
import { SOCIAL_OBJECTIVES, SOCIAL_POST_STATUSES, SOCIAL_TONES } from '../../utils/socialAiConstants';
import { AI_MODEL_SIMULATED } from '../../services/aiContentService';
import './SocialPosts.css';

export default function AIGeneratorPanel({
  platforms,
  campaigns,
  products,
  generating,
  submitting,
  onGenerate,
  onSave,
}) {
  const [productId, setProductId] = useState('');
  const [platformCode, setPlatformCode] = useState('');
  const [tone, setTone] = useState('promocional');
  const [objective, setObjective] = useState('vender');
  const [draft, setDraft] = useState(null);
  const [campaignId, setCampaignId] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleGenerate = async () => {
    if (!platformCode) return;
    const result = await onGenerate({
      productId: productId || null,
      platformCode,
      tone,
      objective,
    });
    if (result) {
      setDraft({
        title: result.title,
        content: result.content,
        prompt: result.prompt,
        modelName: result.modelName ?? AI_MODEL_SIMULATED,
      });
    }
  };

  const platformId = platforms.find((p) => p.code === platformCode)?.id ?? '';

  const handleSaveHistory = () => {
    if (!draft) return;
    onSave({
      draft,
      platformId,
      campaignId: campaignId || null,
      productId: productId || null,
      status,
      scheduledAt:
        status === 'scheduled' && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
      saveAsPost: false,
    });
  };

  const handleSavePost = () => {
    if (!draft || !platformId) return;
    onSave({
      draft,
      platformId,
      campaignId: campaignId || null,
      productId: productId || null,
      status,
      scheduledAt:
        status === 'scheduled' && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
      saveAsPost: true,
    });
  };

  return (
    <div className="social-module">
      <Card elevated>
        <h2 className="page-section__title">Generar publicación con IA</h2>
        <p className="social-ai-badge">
          Motor simulado ({AI_MODEL_SIMULATED}). Edita el texto antes de guardar. Listo para API
          externa.
        </p>

        <div className="social-form">
          <label>
            Producto
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Sin producto específico</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="social-form__row">
            <SocialPlatformCodeSelector
              platforms={platforms}
              value={platformCode}
              onChange={setPlatformCode}
              required
            />
            <label>
              Tono
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                {SOCIAL_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Objetivo
            <select value={objective} onChange={(e) => setObjective(e.target.value)}>
              {SOCIAL_OBJECTIVES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <Button type="button" variant="accent" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generando…' : 'Generar con IA'}
          </Button>
        </div>
      </Card>

      {draft && (
        <Card elevated>
          <h3 className="page-section__title">Vista previa — edita antes de guardar</h3>
          <div className="social-form">
            <label>
              Título
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              Contenido
              <textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={8}
              />
            </label>

            <CampaignSelector
              campaigns={campaigns}
              value={campaignId}
              onChange={setCampaignId}
            />

            <div className="social-form__row">
              <label>
                Estado al guardar
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {SOCIAL_POST_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              {status === 'scheduled' && (
                <label>
                  Fecha programada
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="social-preview">{draft.content}</div>

            <div className="social-form__actions">
              <Button
                type="button"
                onClick={handleSavePost}
                disabled={submitting || !platformId}
              >
                Guardar como publicación
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveHistory}
                disabled={submitting}
              >
                Solo historial IA
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
