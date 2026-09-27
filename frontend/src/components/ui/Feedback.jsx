import { AlertCircle, CheckCircle2, Info, Loader2, RefreshCw, TriangleAlert } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} />;
}

export function PageLoader({ label = 'Đang tải...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink-500">
      <Spinner className="h-7 w-7" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

const ALERT_TONES = {
  info: { wrap: 'border-sky-200 bg-sky-50 text-sky-800', icon: Info },
  success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2 },
  warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-800', icon: TriangleAlert },
  danger: { wrap: 'border-rose-200 bg-rose-50 text-rose-800', icon: AlertCircle },
};

export function Alert({ tone = 'info', title, children, className = '' }) {
  const { wrap, icon: Icon } = ALERT_TONES[tone] ?? ALERT_TONES.info;
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${wrap} ${className}`}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white/60 px-6 py-14 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-ink-200 ${className}`} />;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-ink-800">Không tải được dữ liệu</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        {message || 'Máy chủ không phản hồi. Kiểm tra kết nối rồi thử lại.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      )}
    </div>
  );
}
