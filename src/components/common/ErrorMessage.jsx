import './ErrorMessage.css';

const TYPE_CLASS = {
  error: 'ui-alert--error',
  success: 'ui-alert--success',
  info: 'ui-alert--info',
  warning: 'ui-alert--warning',
};

export default function ErrorMessage({ message, type = 'error', className = '' }) {
  if (!message) return null;

  return (
    <div
      className={`ui-alert ${TYPE_CLASS[type] ?? TYPE_CLASS.error} ${className}`.trim()}
      role="alert"
    >
      {message}
    </div>
  );
}
