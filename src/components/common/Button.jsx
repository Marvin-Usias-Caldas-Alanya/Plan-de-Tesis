import './Button.css';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size,
  block = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    size && `ui-btn--${size}`,
    block && 'ui-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
