import Button from '../common/Button';
import Card from '../common/Card';

export default function ChatbotGlobalSettings({
  handoffKeywords,
  autoMessages,
  submitting,
  onHandoffChange,
  onAutoChange,
  onSave,
}) {
  return (
    <Card elevated>
      <h3 className="page-section__title">Handoff y mensajes automáticos</h3>
      <div className="chatbot-config__form">
        <label>
          Palabras clave que activan handoff (separadas por |)
          <textarea
            value={handoffKeywords}
            onChange={(e) => onHandoffChange(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          Mensaje de saludo
          <input
            value={autoMessages.greeting ?? ''}
            onChange={(e) => onAutoChange({ ...autoMessages, greeting: e.target.value })}
          />
        </label>
        <label>
          Mensaje al derivar a humano
          <input
            value={autoMessages.handoff ?? ''}
            onChange={(e) => onAutoChange({ ...autoMessages, handoff: e.target.value })}
          />
        </label>
        <label>
          Mensaje fallback (sin coincidencias)
          <textarea
            value={autoMessages.fallback ?? ''}
            onChange={(e) => onAutoChange({ ...autoMessages, fallback: e.target.value })}
            rows={2}
          />
        </label>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => onSave({ handoffKeywords, autoMessages })}
        >
          Guardar configuración global
        </Button>
      </div>
    </Card>
  );
}
