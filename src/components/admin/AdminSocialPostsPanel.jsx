import { useState } from 'react';
import { useSocialPublications } from '../../hooks/useSocialPublications';
import SocialPostForm from '../social/SocialPostForm';
import SocialPostTable from '../social/SocialPostTable';
import AIGeneratorPanel from '../social/AIGeneratorPanel';
import '../social/SocialPosts.css';

const TABS = [
  { id: 'list', label: 'Listado' },
  { id: 'manual', label: 'Crear manual' },
  { id: 'ai', label: 'Generar con IA' },
];

export default function AdminSocialPostsPanel({ onFeedback }) {
  const [tab, setTab] = useState('list');
  const [editingPost, setEditingPost] = useState(null);

  const {
    posts,
    platforms,
    campaigns,
    products,
    loading,
    submitting,
    generating,
    refresh,
    saveManualPost,
    removePost,
    runGenerate,
    saveAiPublication,
  } = useSocialPublications({ onFeedback });

  const handleManualSubmit = async (form) => {
    const ok = await saveManualPost(form, editingPost?.id);
    if (ok) {
      setEditingPost(null);
      setTab('list');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setTab('manual');
  };

  const handleAiSave = async (payload) => {
    const ok = await saveAiPublication(payload);
    if (ok) setTab('list');
  };

  return (
    <div className="social-module">
      <nav className="social-module__tabs" aria-label="Publicaciones sociales">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`social-module__tab ${tab === t.id ? 'social-module__tab--active' : ''}`}
            onClick={() => {
              setTab(t.id);
              if (t.id !== 'manual') setEditingPost(null);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'list' && (
        <SocialPostTable
          posts={posts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={removePost}
          onRefresh={refresh}
        />
      )}

      {tab === 'manual' && (
        <SocialPostForm
          platforms={platforms}
          campaigns={campaigns}
          products={products}
          initialData={editingPost}
          editingId={editingPost?.id}
          submitting={submitting}
          onSubmit={handleManualSubmit}
          onCancel={
            editingPost
              ? () => {
                  setEditingPost(null);
                  setTab('list');
                }
              : undefined
          }
        />
      )}

      {tab === 'ai' && (
        <AIGeneratorPanel
          platforms={platforms}
          campaigns={campaigns}
          products={products}
          generating={generating}
          submitting={submitting}
          onGenerate={runGenerate}
          onSave={handleAiSave}
        />
      )}
    </div>
  );
}
