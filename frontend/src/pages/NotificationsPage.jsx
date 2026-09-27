import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState, Skeleton } from '../components/ui/Feedback';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [justReadIds, setJustReadIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/notifications')
      .then((res) => {
        setNotifications(res.data.notifications);
        setJustReadIds((res.data.justReadIds ?? []).map(String));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Thông báo"
        description="Cập nhật về bài giảng mới và hạn nộp bài kiểm tra từ các khóa học bạn đã đăng ký."
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Chưa có thông báo nào"
          description="Khi giảng viên đăng bài giảng mới hoặc tạo bài kiểm tra có hạn nộp, bạn sẽ nhận được thông báo tại đây."
          action={<Button to="/courses">Khám phá khóa học</Button>}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {notifications.map((item) => {
              const isNew = justReadIds.includes(String(item._id));
              const content = (
                <div className={`flex gap-4 px-5 py-4 ${isNew ? 'bg-brand-50/50' : ''}`}>
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      isNew ? 'bg-brand-100 text-brand-600' : 'bg-ink-100 text-ink-400',
                    ].join(' ')}
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm leading-relaxed font-medium text-ink-800">{item.message}</p>
                      {isNew && <Badge tone="brand">Mới</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-ink-400">{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              );

              return (
                <li key={item._id}>
                  {item.url ? (
                    <Link to={item.url} className="block transition-colors hover:bg-ink-50">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
