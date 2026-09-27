import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Biểu đồ đường: điểm quy đổi TOEIC qua từng lượt làm trọn đề.
 * Bảng màu đã kiểm tra bằng validator của skill dataviz trên nền trắng
 * (ba màu tách bạch cả với người mù màu). Màu aqua nhạt hơn 3:1 so với nền nên
 * chú giải có nhãn chữ và có thêm bảng số liệu bên dưới.
 */
const SERIES = [
  { key: 'totalScore', label: 'Tổng điểm', color: '#2a78d6' },
  { key: 'listeningScore', label: 'Listening', color: '#eb6834' },
  { key: 'readingScore', label: 'Reading', color: '#1baf7a' },
];

const MAX_SCORE = 990;
const TICKS = [0, 200, 400, 600, 800];
const INK = { muted: '#898781', grid: '#e1e0d9', axis: '#c3c2b7', surface: '#ffffff' };

const formatDate = (value) =>
  new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const formatDateTime = (value) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/** Đo bề rộng thật của khung chứa để chữ trên biểu đồ không bị co lại trên màn hình nhỏ. */
function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

export default function ScoreTrendChart({ history }) {
  const [wrapRef, width] = useElementWidth();
  const [active, setActive] = useState(null);

  const compact = width < 560;
  const pad = { top: 18, right: compact ? 16 : 58, bottom: 34, left: 40 };
  const height = compact ? 230 : 270;
  const plotW = Math.max(0, width - pad.left - pad.right);
  const plotH = height - pad.top - pad.bottom;

  const xOf = (i) => pad.left + (history.length === 1 ? plotW / 2 : (i * plotW) / (history.length - 1));
  const yOf = (value) => pad.top + plotH * (1 - value / MAX_SCORE);

  const pointerMove = useCallback(
    (event) => {
      if (!plotW) return;
      const box = event.currentTarget.getBoundingClientRect();
      const ratio = (event.clientX - box.left - pad.left) / plotW;
      const index = Math.round(ratio * (history.length - 1));
      setActive(Math.min(history.length - 1, Math.max(0, index)));
    },
    [history.length, pad.left, plotW],
  );

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' ? 1 : -1;
    setActive((prev) => {
      const next = (prev ?? -1) + step;
      return Math.min(history.length - 1, Math.max(0, next));
    });
  };

  // Nhãn trục ngang: tối đa 6 mốc để không chồng chữ.
  const labelStep = Math.ceil(history.length / (compact ? 4 : 6));
  const last = history[history.length - 1];
  const activeRow = active == null ? null : history[active];

  return (
    <div>
      <div ref={wrapRef} className="relative">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            tabIndex={0}
            aria-label={`Biểu đồ điểm TOEIC qua ${history.length} lượt thi thử, lượt gần nhất ${last.totalScore} điểm`}
            className="touch-none rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            onPointerMove={pointerMove}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKeyDown}
            onBlur={() => setActive(null)}
          >
            {TICKS.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.left} x2={pad.left + plotW} y1={yOf(tick)} y2={yOf(tick)}
                  stroke={tick === 0 ? INK.axis : INK.grid} strokeWidth="1"
                />
                <text
                  x={pad.left - 8} y={yOf(tick) + 4} textAnchor="end"
                  fontSize="11" fill={INK.muted} style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {tick}
                </text>
              </g>
            ))}

            {history.map((row, i) =>
              i % labelStep === 0 || i === history.length - 1 ? (
                <text
                  key={row._id} x={xOf(i)} y={height - 12} textAnchor="middle"
                  fontSize="11" fill={INK.muted}
                >
                  {formatDate(row.submittedAt)}
                </text>
              ) : null,
            )}

            {activeRow && (
              <line
                x1={xOf(active)} x2={xOf(active)} y1={pad.top} y2={pad.top + plotH}
                stroke={INK.axis} strokeWidth="1"
              />
            )}

            {SERIES.map((series) => {
              const points = history
                .map((row, i) => ({ i, value: row[series.key] }))
                .filter((p) => p.value != null);
              if (!points.length) return null;
              const d = points.map((p, k) => `${k ? 'L' : 'M'}${xOf(p.i)},${yOf(p.value)}`).join(' ');
              return (
                <g key={series.key}>
                  <path d={d} fill="none" stroke={series.color} strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p) => (
                    <circle
                      key={p.i} cx={xOf(p.i)} cy={yOf(p.value)} r={active === p.i ? 5 : 4}
                      fill={series.color} stroke={INK.surface} strokeWidth="2"
                    />
                  ))}
                </g>
              );
            })}

            {/* Nhãn trực tiếp: chỉ ghi giá trị cuối của đường Tổng điểm */}
            {!compact && (
              <text
                x={xOf(history.length - 1) + 10} y={yOf(last.totalScore) + 4}
                fontSize="12" fontWeight="600" fill="#334155"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {last.totalScore}
              </text>
            )}
          </svg>
        )}

        {activeRow && (
          <div
            className="pointer-events-none absolute z-10 w-44 rounded-xl border border-ink-200 bg-white p-3 shadow-lift"
            style={{
              left: Math.min(Math.max(xOf(active) - 88, 0), Math.max(0, width - 176)),
              top: 8,
            }}
          >
            <p className="text-[11px] text-ink-500">{formatDateTime(activeRow.submittedAt)}</p>
            <ul className="mt-1.5 space-y-1">
              {SERIES.map((series) => (
                <li key={series.key} className="flex items-center gap-2 text-sm">
                  <span className="h-0.5 w-3.5 shrink-0 rounded-full" style={{ background: series.color }} />
                  <span className="font-semibold text-ink-900 tabular-nums">
                    {activeRow[series.key] ?? '—'}
                  </span>
                  <span className="ml-auto text-xs text-ink-500">{series.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2 text-sm text-ink-600">
            <span className="h-0.5 w-4 rounded-full" style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-brand-600 hover:text-brand-800">
          Xem dạng bảng
        </summary>
        <div className="scrollbar-slim mt-2 overflow-x-auto">
          <table className="w-full min-w-[26rem] text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs text-ink-500">
                <th className="py-2 pr-3 font-medium">Thời điểm nộp</th>
                <th className="py-2 pr-3 font-medium">Đề</th>
                <th className="py-2 pr-3 text-right font-medium">Listening</th>
                <th className="py-2 pr-3 text-right font-medium">Reading</th>
                <th className="py-2 text-right font-medium">Tổng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {history.map((row) => (
                <tr key={row._id}>
                  <td className="py-2 pr-3 whitespace-nowrap text-ink-600">{formatDateTime(row.submittedAt)}</td>
                  <td className="py-2 pr-3 text-ink-600">{row.quizTitle}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink-700">{row.listeningScore ?? '—'}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink-700">{row.readingScore ?? '—'}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-ink-900">{row.totalScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
