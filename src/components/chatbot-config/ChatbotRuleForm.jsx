import { useEffect, useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';

const EMPTY = {
  rule_code: '',
  intent_pattern: '',
  response_template: '',
  priority: 100,
  triggers_handoff: false,
  is_active: true,
};

export default function ChatbotRuleForm({
  editingRule,
  submitting,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (editingRule) {
      setForm({
        rule_code: editingRule.rule_code,
        intent_pattern: editingRule.intent_pattern,
        response_template: editingRule.response_template,
        priority: editingRule.priority,
        triggers_handoff: editingRule.triggers_handoff,
        is_active: editingRule.is_active,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editingRule]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Card elevated>
      <h3 className="page-section__title">{editingRule ? 'Editar regla' : 'Nueva regla'}</h3>
      <form className="chatbot-config__form" onSubmit={handleSubmit}>
        <label>
          Código (único)
          <input
            value={form.rule_code}
            onChange={(e) => setForm({ ...form, rule_code: e.target.value })}
            required
            disabled={Boolean(editingRule)}
          />
        </label>
        <label>
          Patrón (regex o palabras con |)
          <input
            value={form.intent_pattern}
            onChange={(e) => setForm({ ...form, intent_pattern: e.target.value })}
            required
            placeholder="hola|buenos|precio"
          />
        </label>
        <label>
          Respuesta automática
          <textarea
            value={form.response_template}
            onChange={(e) => setForm({ ...form, response_template: e.target.value })}
            required
            rows={3}
          />
        </label>
        <div className="chatbot-config__row">
          <label>
            Prioridad (menor = primero)
            <input
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
            />
          </label>
          <label className="chatbot-config__checkbox">
            <input
              type="checkbox"
              checked={form.triggers_handoff}
              onChange={(e) => setForm({ ...form, triggers_handoff: e.target.checked })}
            />
            Activa handoff humano
          </label>
        </div>
        <label className="chatbot-config__checkbox">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Regla activa
        </label>
        <div className="chatbot-config__actions">
          <Button type="submit" disabled={submitting}>
            {editingRule ? 'Guardar' : 'Crear regla'}
          </Button>
          {editingRule && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
