import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import ErrorMessage from '../common/ErrorMessage';
import './AdminLayout.css';

export default function AdminLayout({
  activeSection,
  onSectionChange,
  title,
  description,
  toolbar,
  feedback,
  onClearFeedback,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="admin-shell__main">
        <AdminHeader title={title} description={description} toolbar={toolbar} />

        {feedback?.message && (
          <div className="admin-layout__feedback">
            <ErrorMessage type={feedback.type} message={feedback.message} />
            {onClearFeedback && (
              <button
                type="button"
                className="admin-layout__feedback-close"
                onClick={onClearFeedback}
                aria-label="Cerrar mensaje"
              >
                ×
              </button>
            )}
          </div>
        )}

        <div className="admin-shell__content">{children}</div>
      </div>
    </div>
  );
}
