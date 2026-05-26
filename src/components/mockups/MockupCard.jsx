export default function MockupCard({
  id,
  title,
  description,
  requirement,
  device = 'desktop',
  children,
}) {
  const isMobile = device === 'mobile';

  return (
    <article className="mockup-card" id={`mockup-${id}`} aria-labelledby={`mockup-title-${id}`}>
      <header className="mockup-card__header">
        <div className="mockup-card__meta">
          <h2 id={`mockup-title-${id}`}>{title}</h2>
          <p>{description}</p>
          <div>
            {requirement ? <span className="mockup-card__tag">{requirement}</span> : null}{' '}
            <span className="mockup-card__tag mockup-card__tag--device">
              {isMobile ? 'Marco móvil' : 'Marco desktop'}
            </span>
          </div>
        </div>
      </header>
      <div className={`mockup-card__stage${isMobile ? ' mockup-card__stage--mobile' : ''}`}>
        {children}
      </div>
    </article>
  );
}
