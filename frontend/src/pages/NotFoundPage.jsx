import { Compass, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-bold tracking-tight text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink-900">Không tìm thấy trang</h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <div className="mt-6 flex gap-3">
        <Button to="/">
          <Home className="h-4 w-4" />
          Về trang chủ
        </Button>
        <Button to="/courses" variant="outline">
          <Compass className="h-4 w-4" />
          Xem khóa học
        </Button>
      </div>
    </div>
  );
}
