import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmptyState, PageLoader } from './ui/Feedback';
import Button from './ui/Button';

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Đang kiểm tra phiên đăng nhập..." />;

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  if (roles && !roles.includes(user.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Bạn không có quyền truy cập trang này"
        description="Trang này chỉ dành cho vai trò khác. Hãy quay lại trang chủ hoặc đăng nhập bằng tài khoản phù hợp."
        action={<Button to="/">Về trang chủ</Button>}
      />
    );
  }

  return children;
}
