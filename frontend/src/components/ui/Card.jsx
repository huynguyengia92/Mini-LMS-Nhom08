export function Card({ className = '', hoverable = false, children, ...props }) {
  return (
    <div
      className={[
        'rounded-2xl border border-ink-200 bg-white shadow-card',
        hoverable ? 'transition-shadow duration-200 hover:shadow-lift' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 ${className}`}>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-ink-900">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
