import { useState } from 'react';
import { useChatbotRules } from '../../hooks/useChatbotRules';
import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';
import './AdminPanels.css';

const EMPTY_RULE = {
  rule_code: '',
  intent_pattern: '',
  response_template: '',
  priority: 100,
  triggers_handoff: false,
  is_active: true,
};

export default function ChatbotRulesPanel({ onFeedback }) {
  const { rules, loading, submitting, saveRule, removeRule } = useChatbotRules({
    onFeedback,
  });
  const [form, setForm] = useState(EMPTY_RULE);
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await saveRule(form, editingId);
    if (ok) {
      setForm(EMPTY_RULE);
      setEditingId(null);
    }
  };

  const handleEdit = (rule) => {
    setEditingId(rule.id);
    setForm({
      rule_code: rule.rule_code,
      intent_pattern: rule.intent_pattern,
      response_template: rule.response_template,
      priority: rule.priority,
      triggers_handoff: rule.triggers_handoff,
      is_active: rule.is_active,
    });
  };

  return (
    <div className="admin-panel">
      <Card elevated className="admin-panel__form-card">
        <h2 className="page-section__title">
          {editingId ? 'Editar regla' : 'Nueva regla del chatbot'}
        </h2>
        <form className="admin-panel__form" onSubmit={handleSubmit}>
          <label>
            Código
            <input
              value={form.rule_code}
              onChange={(e) => setForm({ ...form, rule_code: e.target.value })}
              required
              disabled={Boolean(editingId)}
            />
          </label>
          <label>
            Patrón (regex o texto)
            <input
              value={form.intent_pattern}
              onChange={(e) => setForm({ ...form, intent_pattern: e.target.value })}
              required
              placeholder="hola|buenos"
            />
          </label>
          <label>
            Respuesta
            <textarea
              value={form.response_template}
              onChange={(e) => setForm({ ...form, response_template: e.target.value })}
              required
              rows={3}
            />
          </label>
          <label>
            Prioridad (menor = primero)
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            />
          </label>
          <label className="admin-panel__checkbox">
            <input
              type="checkbox"
              checked={form.triggers_handoff}
              onChange={(e) => setForm({ ...form, triggers_handoff: e.target.checked })}
            />
            Activa handoff humano
          </label>
          <label className="admin-panel__checkbox">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Activa
          </label>
          <div className="admin-panel__actions">
            <Button type="submit" disabled={submitting}>
              {editingId ? 'Guardar' : 'Crear regla'}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_RULE);
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card elevated padding={false}>
        <h2 className="page-section__title admin-panel__list-title">Reglas en Supabase</h2>
        {loading ? (
          <Loading label="Cargando reglas…" />
        ) : (
          <ul className="admin-panel__list">
            {rules.map((rule) => (
              <li key={rule.id} className="admin-panel__list-item">
                <div>
                  <strong>{rule.rule_code}</strong>
                  <span className="admin-panel__meta">
                    prioridad {rule.priority} · {rule.is_active ? 'activa' : 'inactiva'}
                  </span>
                  <p className="admin-panel__pattern">{rule.intent_pattern}</p>
                  <p>{rule.response_template}</p>
                </div>
                <div className="admin-panel__item-actions">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(rule)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeRule(rule.id)}>
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
