import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import { FormField, Input } from '../components/ui/Field';
import { Alert } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const DEMO_ACCOUNTS = [
  { label: 'Học viên', username: 'student1', password: 'student12345' },
  { label: 'Giảng viên', username: 'instructor1', password: 'instructor12345' },
  { label: 'Quản trị', username: 'admin', password: 'admin12345' },
];

export default function LoginPage() {
    const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Khởi tạo Google Sign-In
    useEffect(() => {
        const initializeGoogle = () => {
            if (!window.google) return;

            const googleButton = document.getElementById('google-signin-button');

            if (!googleButton) return;

            // Xóa button cũ nếu Google đã render trước đó
            googleButton.innerHTML = '';
            console.log(
                'GOOGLE CLIENT ID:',
                import.meta.env.VITE_GOOGLE_CLIENT_ID
            );
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

                callback: async (response) => {
                    console.log('GOOGLE CALLBACK:', response)
                    setError('');
                    setLoading(true);

                    try {
                        await loginWithGoogle(response.credential);

                        toast.success('Đăng nhập bằng Google thành công.');

                        navigate(location.state?.from ?? '/', {
                            replace: true,
                        });
                    } catch (err) {
                        setError(
                            err.response?.data?.message ??
                            'Đăng nhập bằng Google thất bại. Vui lòng thử lại.',
                        );
                    } finally {
                        setLoading(false);
                    }
                },
            });

            window.google.accounts.id.renderButton(googleButton, {
                theme: 'outline',
                size: 'large',
                width: 400,
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
            });
        };

        // Nếu Google script đã được tải
        if (window.google) {
            initializeGoogle();
            return;
        }

        // Tải Google Identity Services
        const script = document.createElement('script');

        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        script.onload = initializeGoogle;

        document.head.appendChild(script);

        return () => {
            script.onload = null;
        };
    }, [loginWithGoogle, navigate, location.state, toast]);


  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Đăng nhập thành công.');
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Nhập tài khoản của bạn để tiếp tục học tập."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-800">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}

        <FormField label="Tên đăng nhập" htmlFor="username" required>
          <Input
            id="username"
            icon={User}
            autoComplete="username"
            placeholder="Nhập tên đăng nhập"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" required>
          <div className="relative">
            <Input
              id="password"
              icon={KeyRound}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Đăng nhập
        </Button>
      </form>
          {/* Đăng nhập bằng Google */}
          <div className="mt-6">
              <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-ink-200" />

                  <span className="text-xs text-ink-400">
                      HOẶC
                  </span>

                  <div className="h-px flex-1 bg-ink-200" />
              </div>

              <div className="mt-4 flex justify-center">
                  <div id="google-signin-button" />
              </div>
          </div>

      <div className="mt-8 rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="text-xs font-semibold tracking-wide text-ink-600 uppercase">Tài khoản demo</p>
        <div className="mt-3 grid gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.username}
              type="button"
              onClick={() => setForm({ username: acc.username, password: acc.password })}
              className="flex items-center justify-between rounded-lg border border-ink-200 bg-white px-3 py-2 text-left text-sm transition-colors hover:border-brand-300 hover:bg-brand-50"
            >
              <span className="font-medium text-ink-800">{acc.label}</span>
              <span className="font-mono text-xs text-ink-500">{acc.username}</span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-ink-400">Bấm để điền nhanh thông tin đăng nhập.</p>
      </div>
    </AuthLayout>
  );
}
