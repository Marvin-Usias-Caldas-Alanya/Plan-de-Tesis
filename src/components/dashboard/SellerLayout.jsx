import DashboardStats from './DashboardStats';
import ErrorMessage from '../common/ErrorMessage';
import './SellerLayout.css';

export default function SellerLayout({
  title = 'Panel del vendedor',
  description,
  stats = [],
  feedback,
  onClearFeedback,
  children,
}) {
  return (
    <div className="seller-layout">
      <header className="seller-layout__header page-header">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </header>

      {feedback?.message && (
        <div className="seller-layout__feedback">
          <ErrorMessage type={feedback.type ?? 'error'} message={feedback.message} />
          {onClearFeedback && (
            <button
              type="button"
              className="seller-layout__feedback-close"
              onClick={onClearFeedback}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          )}
        </div>
      )}

      {stats.length > 0 && <DashboardStats stats={stats} />}

      <div className="seller-layout__content">{children}</div>
    </div>
  );
}
