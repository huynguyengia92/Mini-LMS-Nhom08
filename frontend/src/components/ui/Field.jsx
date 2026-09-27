const baseControl =
  'w-full rounded-xl border border-ink-300 bg-white px-3.5 text-sm text-ink-900 shadow-sm transition-colors ' +
  'placeholder:text-ink-400 hover:border-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500';

export function Label({ htmlFor, required, children, hint }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-700">
        {children}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </div>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{children}</p>;
}

export function Input({ className = '', error, icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
      )}
      <input
        className={[
          baseControl,
          'h-11',
          Icon ? 'pl-10' : '',
          error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : '',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}

export function Textarea({ className = '', error, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={[
        baseControl,
        'py-2.5 leading-relaxed',
        error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}

export function Select({ className = '', error, children, ...props }) {
  return (
    <select
      className={[
        baseControl,
        'h-11 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.875rem_center] bg-no-repeat pr-10',
        error ? 'border-rose-400' : '',
        className,
      ].join(' ')}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function FormField({ label, htmlFor, required, hint, error, children }) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required} hint={hint}>
          {label}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
