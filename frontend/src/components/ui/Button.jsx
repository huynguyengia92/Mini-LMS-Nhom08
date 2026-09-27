import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
  secondary:
    'bg-ink-900 text-white shadow-sm hover:bg-ink-800 active:bg-ink-700 disabled:bg-ink-400',
  outline:
    'border border-ink-300 bg-white text-ink-700 hover:border-ink-400 hover:bg-ink-50 active:bg-ink-100 disabled:text-ink-400',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50 active:bg-rose-100',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
  // Dùng trên nền tối/gradient (hero, banner)
  white: 'bg-white text-brand-700 shadow-sm hover:bg-brand-50 active:bg-brand-100',
  'white-outline':
    'border border-white/35 bg-white/10 text-white backdrop-blur hover:bg-white/20 active:bg-white/25',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-[15px]',
  icon: 'h-9 w-9',
};

export default function Button({
  as,
  to,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const classes = [
    'inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-90',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className,
  ].join(' ');

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  const Tag = as ?? 'button';
  return (
    <Tag className={classes} disabled={disabled || loading} {...props}>
      {content}
    </Tag>
  );
}
