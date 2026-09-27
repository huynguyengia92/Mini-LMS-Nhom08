import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TONES = {
  success: { wrap: 'border-emerald-200 bg-white', accent: 'bg-emerald-500', icon: CheckCircle2, iconColor: 'text-emerald-600' },
  error: { wrap: 'border-rose-200 bg-white', accent: 'bg-rose-500', icon: AlertCircle, iconColor: 'text-rose-600' },
  info: { wrap: 'border-sky-200 bg-white', accent: 'bg-sky-500', icon: Info, iconColor: 'text-sky-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'info', duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration) setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const { wrap, accent, icon: Icon, iconColor } = TONES[toast.tone] ?? TONES.info;
          return (
            <div
              key={toast.id}
              role="status"
              className={`animate-fade-up pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border py-3 pr-3 pl-5 shadow-lift ${wrap}`}
            >
              <span className={`absolute top-0 bottom-0 left-0 w-1 ${accent}`} />
              <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${iconColor}`} />
              <p className="min-w-0 flex-1 text-sm text-ink-700">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
                aria-label="Đóng thông báo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
