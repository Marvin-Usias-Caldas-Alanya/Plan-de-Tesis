import { useState } from 'react';
import { useSocialPosts } from '../../hooks/useSocialPosts';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import './AdminPanels.css';

const EMPTY_POST = {
  title: '',
  content: '',
  platform_id: '',
  campaign_id: '',
  status: 'draft',
};

export default function SocialPostsPanel({ onFeedback }) {
  const {
    posts,
    platforms,
    campaigns,
    loading,
    submitting,
    generating,
    savePost,
    removePost,
    generateWithAi,
  } = useSocialPosts({ onFeedback });

  const [form, setForm] = useState(EMPTY_POST);
  const [editingId, setEditingId] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('Promoción de proteínas verano');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      campaign_id: form.campaign_id || null,
    };
    const ok = await savePost(payload, editingId);
    if (ok) {
      setForm(EMPTY_POST);
      setEditingId(null);
    }
  };

  const handleGenerate = async () => {
    const text = await generateWithAi(aiPrompt, editingId);
    if (text) {
      setForm((prev) => ({ ...prev, content: text }));
    }
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      platform_id: post.platform_id,
      campaign_id: post.campaign_id ?? '',
      status: post.status,
    });
  };

  return (
    <div className="admin-panel">
      <Card elevated className="admin-panel__form-card">
        <h2 className="page-section__title">
          {editingId ? 'Editar publicación' : 'Nueva publicación'}
        </h2>
        <form className="admin-panel__form" onSubmit={handleSubmit}>
          <label>
            Título
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label>
            Plataforma
            <select
              value={form.platform_id}
              onChange={(e) => setForm({ ...form, platform_id: e.target.value })}
              required
            >
              <option value="">Seleccionar…</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Campaña (opcional)
            <select
              value={form.campaign_id}
              onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
            >
              <option value="">Sin campaña</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="draft">Borrador</option>
              <option value="scheduled">Programado</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>
          <label>
            Contenido
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={5}
            />
          </label>
          <div className="admin-panel__ai-row">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Prompt para generar con IA…"
            />
            <Button type="button" variant="accent" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generando…' : 'Generar con IA'}
            </Button>
          </div>
          <div className="admin-panel__actions">
            <Button type="submit" disabled={submitting}>
              {editingId ? 'Guardar' : 'Publicar en BD'}
            </Button>
          </div>
        </form>
      </Card>

      <Card elevated padding={false}>
        <h2 className="page-section__title admin-panel__list-title">Publicaciones</h2>
        {loading ? (
          <Loading label="Cargando publicaciones…" />
        ) : (
          <ul className="admin-panel__list">
            {posts.map((post) => (
              <li key={post.id} className="admin-panel__list-item">
                <div>
                  <strong>{post.title}</strong>
                  <span className="admin-panel__meta">
                    {post.platform_name} · {post.status}
                  </span>
                  <p>{post.content}</p>
                </div>
                <div className="admin-panel__item-actions">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(post)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removePost(post.id)}>
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
