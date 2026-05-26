import Button from '../common/Button';
import Card from '../common/Card';
import Loading from '../common/Loading';

export default function ChatbotRulesTable({
  rules,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}) {
  return (
    <Card elevated padding={false}>
      <h3 className="page-section__title admin-panel__list-title">Reglas del chatbot</h3>
      {loading ? (
        <Loading label="Cargando reglas…" />
      ) : !rules.length ? (
        <p className="admin-empty-hint">No hay reglas configuradas.</p>
      ) : (
        <div className="chatbot-config__table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Patrón</th>
                <th>Prioridad</th>
                <th>Handoff</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>
                    <strong>{rule.rule_code}</strong>
                  </td>
                  <td>
                    <code>{rule.intent_pattern}</code>
                  </td>
                  <td>{rule.priority}</td>
                  <td>{rule.triggers_handoff ? 'Sí' : 'No'}</td>
                  <td>
                    <span
                      className={`chatbot-config__badge ${rule.is_active ? 'chatbot-config__badge--on' : 'chatbot-config__badge--off'}`}
                    >
                      {rule.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-panel__item-actions">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(rule)}>
                        Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onToggleActive(rule)}>
                        {rule.is_active ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(rule.id)}>
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
  );
}
