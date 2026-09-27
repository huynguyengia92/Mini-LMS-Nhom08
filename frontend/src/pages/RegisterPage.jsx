import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Eye, EyeOff, GraduationCap, KeyRound, Presentation, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import { FormField, Input } from '../components/ui/Field';
import { Alert } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const ROLES = [
  {
    value: 'STUDENT',
    label: 'Học viên',
    description: 'Đăng ký khóa học, xem bài giảng, làm bài kiểm tra',
    icon: GraduationCap,
  },
  {
    value: 'INSTRUCTOR',
    label: 'Giảng viên',
    description: 'Tạo khóa học, soạn bài giảng và đề kiểm tra',
    icon: Presentation,
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success('Tạo tài khoản thành công. Chào mừng bạn!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Chọn vai trò phù hợp để bắt đầu sử dụng Mini-LMS."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-800">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert tone="danger">{error}</Alert>}

        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Bạn là</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map(({ value, label, description, icon: Icon }) => {
              const active = form.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={[
                    'rounded-xl border p-4 text-left transition-all',
                    active
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                      : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                  ].join(' ')}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-ink-400'}`} />
                  <p className={`mt-2 text-sm font-semibold ${active ? 'text-brand-800' : 'text-ink-800'}`}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Họ" htmlFor="firstName" required>
            <Input id="firstName" placeholder="Nguyễn" value={form.firstName} onChange={set('firstName')} required />
          </FormField>
          <FormField label="Tên" htmlFor="lastName" required>
            <Input id="lastName" placeholder="Văn A" value={form.lastName} onChange={set('lastName')} required />
          </FormField>
        </div>

        <FormField label="Tên đăng nhập" htmlFor="username" required>
          <Input
            id="username"
            icon={User}
            placeholder="vd: nguyenvana"
            autoComplete="username"
            value={form.username}
            onChange={set('username')}
            required
          />
        </FormField>

        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            icon={AtSign}
            type="email"
            placeholder="email@dntu.edu.vn"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            required
          />
        </FormField>

        <FormField label="Mật khẩu" htmlFor="password" required hint="Tối thiểu 6 ký tự">
          <div className="relative">
            <Input
              id="password"
              icon={KeyRound}
              type={showPassword ? 'text' : 'password'}
              placeholder="Tạo mật khẩu"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
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
          Tạo tài khoản
        </Button>
      </form>
    </AuthLayout>
  );
}
