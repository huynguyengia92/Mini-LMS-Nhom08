import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, CheckCircle2, FileQuestion, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: CheckCircle2, text: 'Học theo lộ trình và luyện đề TOEIC 7 part' },
  { icon: FileQuestion, text: 'Chấm điểm tự động, quy đổi về thang 990' },
  { icon: BarChart3, text: 'Theo dõi tiến bộ qua từng lượt thi thử' },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Cột thương hiệu */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-5.5 w-5.5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Mini-LMS</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-3xl leading-tight font-bold">
            Nền tảng luyện thi TOEIC Listening &amp; Reading
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-brand-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-200">
          Đồ án SEP — Nhóm 8 · Đại học Công nghệ Đồng Nai
        </p>
      </div>

      {/* Cột form */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </Link>

          <div className="mb-8 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-500">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
