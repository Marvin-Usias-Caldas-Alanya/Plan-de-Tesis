import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import { CHATBOT_INTENT_TYPES } from '../../utils/chatbotConfigConstants';

const EMPTY = {
  intent_code: '',
  label: '',
  intent_type: 'goal',
  keywords: '',
  response_template: '',
  triggers_handoff: false,
  recommended_product_ids: [],
  priority: 100,
  is_active: true,
};

export default function ChatbotIntentForm({
  editingIntent,
  products,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editingIntent) {
      setForm({
        intent_code: editingIntent.intent_code,
        label: editingIntent.label,
        intent_type: editingIntent.intent_type,
        keywords: editingIntent.keywords,
        response_template: editingIntent.response_template ?? '',
        triggers_handoff: editingIntent.triggers_handoff,
        recommended_product_ids: editingIntent.recommended_product_ids ?? [],
        priority: editingIntent.priority,
        is_active: editingIntent.is_active,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editingIntent]);

  const toggleProduct = (id) => {
    setForm((prev) => {
      const ids = prev.recommended_product_ids ?? [];
      const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
      return { ...prev, recommended_product_ids: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card elevated>
      <h3 className="page-section__title">
        {editingIntent ? 'Editar intención' : 'Nueva intención detectable'}
      </h3>
      <form className="chatbot-config__form" onSubmit={handleSubmit}>
        <div className="chatbot-config__row">
          <label>
            Código
            <input
              value={form.intent_code}
              onChange={(e) => setForm({ ...form, intent_code: e.target.value })}
              required
              disabled={Boolean(editingIntent)}
            />
          </label>
          <label>
            Etiqueta
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              required
            />
          </label>
        </div>
        <div className="chatbot-config__row">
          <label>
            Tipo
            <select
              value={form.intent_type}
              onChange={(e) => setForm({ ...form, intent_type: e.target.value })}
            >
              {CHATBOT_INTENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prioridad
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            />
          </label>
        </div>
        <label>
          Palabras clave (separadas por |)
          <input
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            required
            placeholder="masa muscular|ganar músculo"
          />
        </label>
        <label>
          Mensaje de respuesta
          <textarea
            value={form.response_template}
            onChange={(e) => setForm({ ...form, response_template: e.target.value })}
            rows={2}
          />
        </label>
        {form.intent_type === 'goal' && (
          <div>
            <span className="chatbot-config__form label">Productos recomendados (opcional)</span>
            <div className="chatbot-config__product-picks">
              {(products ?? []).map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={form.recommended_product_ids.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        )}
        <label className="chatbot-config__checkbox">
          <input
            type="checkbox"
            checked={form.triggers_handoff}
            onChange={(e) => setForm({ ...form, triggers_handoff: e.target.checked })}
          />
          Activa handoff humano
        </label>
        <label className="chatbot-config__checkbox">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Intención activa
        </label>
        <div className="chatbot-config__actions">
          <Button type="submit" disabled={submitting}>
            {editingIntent ? 'Guardar' : 'Crear intención'}
          </Button>
          {editingIntent && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
