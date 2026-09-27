import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  ChevronDown,
  FolderTree,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const ROLE_LABELS = {
  STUDENT: 'Học viên',
  INSTRUCTOR: 'Giảng viên',
  ADMIN: 'Quản trị viên',
};

function navLinksFor(role) {
  const links = [
    { to: '/courses', label: 'Khóa học', icon: BookOpen },
    { to: '/toeic', label: 'Đề thi TOEIC', icon: Target },
    { to: '/vocabulary', label: 'Flashcards', icon: Layers },
    { to: '/dictation', label: 'Chép chính tả', icon: PenLine },
  ];
  if (role === 'STUDENT') {
    links.push(
      { to: '/my/dashboard', label: 'Khóa học của tôi', icon: LayoutDashboard },
      { to: '/my/progress', label: 'Tiến độ', icon: TrendingUp },
    );
  }
  if (role === 'INSTRUCTOR') {
    links.push({ to: '/instructor/courses', label: 'Quản lý khóa học', icon: LayoutDashboard });
  }
  if (role === 'ADMIN') {
    links.push({ to: '/admin/categories', label: 'Danh mục', icon: FolderTree });
  }
  return links;
}

function initialsOf(user) {
  if (!user) return '?';
  const source = user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username;
  const parts = source.split(' ').filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2)).toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  const links = navLinksFor(user?.role);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    let active = true;
    api
      .get('/notifications/unread-count')
      .then((res) => active && setUnread(res.data.count ?? 0))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const linkClass = ({ isActive }) =>
    [
      'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-ink-900">Mini-LMS</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 xl:flex">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-1.5 transition-colors hover:bg-ink-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
                    {initialsOf(user)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-[10rem] truncate text-sm leading-tight font-semibold text-ink-900">
                      {user.fullName || user.username}
                    </span>
                    <span className="block text-xs leading-tight text-ink-500">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink-400" />
                </button>

                {menuOpen && (
                  <div className="animate-fade-up absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift">
                    <div className="border-b border-ink-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {user.fullName || user.username}
                      </p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Đăng ký
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white px-4 py-3 xl:hidden">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2 border-t border-ink-100 pt-3">
                <Link
                  to="/login"
                  className="flex-1 rounded-xl border border-ink-300 px-4 py-2 text-center text-sm font-medium text-ink-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-xl bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
