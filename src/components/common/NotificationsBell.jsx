import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationsBell.css';

export default function NotificationsBell() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(
    user?.id,
  );

  if (!isAuthenticated) return null;

  return (
    <div className="notifications-bell">
      <button
        type="button"
        className="notifications-bell__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} sin leer` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notifications-bell__badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notifications-bell__panel" role="dialog" aria-label="Notificaciones">
          <div className="notifications-bell__header">
            <strong>Notificaciones</strong>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead}>
                Marcar todas leídas
              </button>
            )}
          </div>
          <ul className="notifications-bell__list">
            {notifications.length ? (
              notifications.map((n) => (
                <li key={n.id} className={n.is_read ? '' : 'notifications-bell__item--unread'}>
                  <button type="button" onClick={() => markRead(n.id)}>
                    <span className="notifications-bell__title">{n.title}</span>
                    {n.body && <span className="notifications-bell__body">{n.body}</span>}
                  </button>
                </li>
              ))
            ) : (
              <li className="notifications-bell__empty">Sin notificaciones</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
