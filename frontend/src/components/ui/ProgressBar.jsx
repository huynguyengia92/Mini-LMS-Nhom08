export default function ProgressBar({ value = 0, tone = 'brand', size = 'md', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tones = {
    brand: 'bg-brand-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-full overflow-hidden rounded-full bg-ink-200 ${heights[size] ?? heights.md}`}>
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${tones[tone] ?? tones.brand}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-600">
          {clamped}%
        </span>
      )}
    </div>
  );
}
