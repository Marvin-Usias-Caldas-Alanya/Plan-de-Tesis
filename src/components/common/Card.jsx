import './Card.css';

export default function Card({
  children,
  as: Tag = 'div',
  elevated = false,
  hover = false,
  padding = true,
  className = '',
  ...props
}) {
  const classes = [
    'ui-card',
    elevated && 'ui-card--elevated',
    hover && 'ui-card--hover',
    !padding && 'ui-card--flat',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
