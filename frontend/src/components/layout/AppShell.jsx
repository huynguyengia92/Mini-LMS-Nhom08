import { GraduationCap } from 'lucide-react';
import Navbar from './Navbar';

export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      <footer className="border-t border-ink-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <GraduationCap className="h-4 w-4 text-brand-600" />
            <span className="font-semibold text-ink-700">Mini-LMS</span>
            <span className="text-ink-300">•</span>
            <span>Đồ án SEP — Nhóm 8</span>
          </div>
          <p className="text-xs text-ink-400">
            Node.js · Express · MongoDB · React — Đại học Công nghệ Đồng Nai
          </p>
        </div>
      </footer>
    </div>
  );
}
