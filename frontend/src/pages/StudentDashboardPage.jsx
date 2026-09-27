import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Compass, GraduationCap, Trophy } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';

function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5.5 w-5.5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-tight font-bold text-ink-900">{value}</p>
        <p className="mt-0.5 truncate text-sm text-ink-500">{label}</p>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/progress')
      .then((res) => setOverview(res.data.overview))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalCourses = overview.length;
  const completedCourses = overview.filter((i) => i.percent >= 100).length;
  const quizAttempts = overview.reduce(
    (sum, item) => sum + item.quizResults.filter((q) => q.bestAttempt).length,
    0,
  );

  return (
    <div>
      <PageHeader
        title={`Chào ${user?.firstName ? `${user.firstName} ${user.lastName}` : 'bạn'} 👋`}
        description="Tiếp tục hành trình học tập của bạn từ nơi đã dừng lại."
        actions={
          <Button to="/courses" variant="outline">
            <Compass className="h-4 w-4" />
            Tìm khóa học mới
          </Button>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : overview.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Bạn chưa đăng ký khóa học nào"
          description="Khám phá danh sách khóa học và đăng ký khóa đầu tiên để bắt đầu học."
          action={<Button to="/courses">Khám phá khóa học</Button>}
        />
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard icon={BookOpen} label="Khóa học đã đăng ký" value={totalCourses} />
            <StatCard icon={Trophy} label="Khóa học hoàn thành" value={completedCourses} tone="emerald" />
            <StatCard icon={GraduationCap} label="Bài kiểm tra đã làm" value={quizAttempts} tone="amber" />
          </div>

          <h2 className="mb-4 text-lg font-semibold text-ink-900">Khóa học của tôi</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {overview.map((item) => (
              <CourseCard
                key={item.course._id}
                course={{
                  ...item.course,
                  lectureCount: item.totalLectures,
                  quizCount: item.quizResults.length,
                }}
                enrolled
                progress={item.percent}
                footer={
                  <Button to={`/courses/${item.course.slug}`} variant="outline" size="sm" className="w-full">
                    {item.percent >= 100 ? 'Xem lại khóa học' : item.percent > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                  </Button>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
