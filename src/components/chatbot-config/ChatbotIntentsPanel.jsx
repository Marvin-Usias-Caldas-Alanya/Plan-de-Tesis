import { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import ChatbotIntentForm from './ChatbotIntentForm';

export default function ChatbotIntentsPanel({
  intents,
  products,
  loading,
  submitting,
  onSaveIntent,
  onRemoveIntent,
  onToggleActive,
}) {
  const [editingIntent, setEditingIntent] = useState(null);

  const handleSubmit = async (form) => {
    const ok = await onSaveIntent(form, editingIntent?.id);
    if (ok) setEditingIntent(null);
  };

  return (
    <>
      <ChatbotIntentForm
        editingIntent={editingIntent}
        products={products}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setEditingIntent(null)}
      />
      <Card elevated padding={false}>
        <h3 className="page-section__title admin-panel__list-title">Intenciones detectables</h3>
        {loading ? (
          <Loading label="Cargando intenciones…" />
        ) : !intents.length ? (
          <p className="admin-empty-hint">No hay intenciones configuradas.</p>
        ) : (
          <div className="chatbot-config__table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Etiqueta</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {intents.map((intent) => (
                  <tr key={intent.id}>
                    <td>
                      <strong>{intent.intent_code}</strong>
                    </td>
                    <td>{intent.label}</td>
                    <td>{intent.intent_type}</td>
                    <td>{intent.priority}</td>
                    <td>
                      <span
                        className={`chatbot-config__badge ${intent.is_active ? 'chatbot-config__badge--on' : 'chatbot-config__badge--off'}`}
                      >
                        {intent.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-panel__item-actions">
                        <Button size="sm" variant="secondary" onClick={() => setEditingIntent(intent)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onToggleActive(intent)}>
                          {intent.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onRemoveIntent(intent.id)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
