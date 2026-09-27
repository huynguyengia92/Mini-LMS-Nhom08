import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CirclePlay,
  FileQuestion,
  FileText,
  Lock,
  Timer,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Alert, EmptyState, PageLoader } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../components/ui/Toast';

function formatDate(value) {
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/courses/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      const res = await api.post(`/courses/${slug}/enroll`);
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Đăng ký thất bại.');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <PageLoader label="Đang tải khóa học..." />;

  if (notFound || !data) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Không tìm thấy khóa học"
        description="Khóa học có thể đã bị xóa hoặc chưa được xuất bản."
        action={<Button to="/courses">Xem tất cả khóa học</Button>}
      />
    );
  }

  const { course, lectures, quizzes, isEnrolled, studentCount, completedLectureIds = [] } = data;
  const isOwner = user?.role === 'INSTRUCTOR' && course.instructor?._id === user._id;
  const canViewContent = isEnrolled || isOwner || user?.role === 'ADMIN';
  const completedCount = completedLectureIds.length;
  const progress = lectures.length ? (completedCount / lectures.length) * 100 : 0;

  return (
    <div>
      {/* Banner */}
      <div className="relative -mx-4 mb-8 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 px-6 py-10 text-white sm:-mx-6 sm:rounded-3xl sm:px-10 lg:-mx-0">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="relative">
          <nav className="mb-4 flex items-center gap-2 text-sm text-brand-200">
            <Link to="/courses" className="transition-colors hover:text-white">
              Khóa học
            </Link>
            <span>/</span>
            <span className="text-white">{course.category?.name}</span>
          </nav>

          <h1 className="max-w-3xl text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-4 max-w-2xl leading-relaxed text-brand-100">{course.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-100">
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4" />
              {course.instructor?.fullName ?? course.instructor?.username}
            </span>
            <span className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {lectures.length} bài giảng
            </span>
            <span className="inline-flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              {quizzes.length} bài kiểm tra
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {studentCount ?? 0} học viên
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Nội dung chính */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Nội dung khóa học"
              description={`${lectures.length} bài giảng${
                isEnrolled ? ` · đã hoàn thành ${completedCount}/${lectures.length}` : ''
              }`}
            />
            {lectures.length === 0 ? (
              <CardBody>
                <p className="py-6 text-center text-sm text-ink-500">
                  Giảng viên chưa thêm bài giảng nào cho khóa học này.
                </p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-ink-100">
                {lectures.map((lecture) => {
                  const done = completedLectureIds.includes(lecture._id);
                  const Icon = lecture.contentType === 'VIDEO' ? CirclePlay : FileText;

                  const inner = (
                    <>
                      <span
                        className={[
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          done ? 'bg-emerald-50 text-emerald-600' : 'bg-ink-100 text-ink-500',
                        ].join(' ')}
                      >
                        {done ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-900">
                          {lecture.order}. {lecture.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-500">
                          {lecture.contentType === 'VIDEO' ? 'Video bài giảng' : 'Tài liệu'}
                          {done && ' · Đã hoàn thành'}
                        </span>
                      </span>
                      {canViewContent ? (
                        <span className="shrink-0 text-sm font-medium text-brand-600">Xem</span>
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-ink-300" />
                      )}
                    </>
                  );

                  return (
                    <li key={lecture._id}>
                      {canViewContent ? (
                        <Link
                          to={`/lectures/${lecture._id}`}
                          className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-3.5 opacity-70">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Bài kiểm tra" description={`${quizzes.length} bài kiểm tra trong khóa học`} />
            {quizzes.length === 0 ? (
              <CardBody>
                <p className="py-6 text-center text-sm text-ink-500">Chưa có bài kiểm tra nào.</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-ink-100">
                {quizzes.map((quiz) => (
                  <li key={quiz._id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <FileQuestion className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{quiz.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                        {quiz.timeLimitMinutes ? (
                          <span className="inline-flex items-center gap-1">
                            <Timer className="h-3.5 w-3.5" />
                            {quiz.timeLimitMinutes} phút
                          </span>
                        ) : (
                          <span>Không giới hạn thời gian</span>
                        )}
                        {quiz.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Hạn: {formatDate(quiz.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Button size="sm" onClick={() => navigate(`/quizzes/${quiz._id}/start`)}>
                        Làm bài
                      </Button>
                    ) : (
                      <Badge tone="neutral" icon={Lock}>
                        Cần đăng ký
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <CardBody className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge tone="brand">{course.category?.name}</Badge>
                {!course.isPublished && <Badge tone="warning">Chưa xuất bản</Badge>}
              </div>

              {user?.role === 'STUDENT' ? (
                isEnrolled ? (
                  <>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" />
                        Bạn đã đăng ký khóa học
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink-600">Tiến độ của bạn</span>
                        <span className="font-semibold text-brand-700">{Math.round(progress)}%</span>
                      </div>
                      <ProgressBar value={progress} tone={progress >= 100 ? 'success' : 'brand'} />
                      <p className="mt-2 text-xs text-ink-500">
                        Hoàn thành {completedCount}/{lectures.length} bài giảng
                      </p>
                    </div>
                    {lectures.length > 0 && (
                      <Button
                        to={`/lectures/${
                          lectures.find((l) => !completedLectureIds.includes(l._id))?._id ?? lectures[0]._id
                        }`}
                        className="w-full"
                        size="lg"
                      >
                        {completedCount === 0 ? 'Bắt đầu học' : 'Tiếp tục học'}
                      </Button>
                    )}
                    <Button to="/my/progress" variant="outline" className="w-full">
                      <Trophy className="h-4 w-4" />
                      Xem tiến độ tổng hợp
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-ink-600">
                      Đăng ký để mở khóa toàn bộ bài giảng và bài kiểm tra của khóa học này.
                    </p>
                    <Button className="w-full" size="lg" loading={enrolling} onClick={handleEnroll}>
                      Đăng ký khóa học
                    </Button>
                  </>
                )
              ) : user ? (
                isOwner ? (
                  <>
                    <Alert tone="info">Bạn là giảng viên của khóa học này.</Alert>
                    <Button to={`/instructor/courses/${course.slug}/manage`} className="w-full">
                      Quản lý nội dung
                    </Button>
                  </>
                ) : (
                  <Alert tone="info">
                    Chỉ tài khoản học viên mới có thể đăng ký khóa học.
                  </Alert>
                )
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-ink-600">
                    Đăng nhập bằng tài khoản học viên để đăng ký và bắt đầu học.
                  </p>
                  <Button to="/login" className="w-full" size="lg">
                    Đăng nhập để đăng ký
                  </Button>
                </>
              )}

              <dl className="space-y-2.5 border-t border-ink-100 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Giảng viên</dt>
                  <dd className="font-medium text-ink-800">
                    {course.instructor?.fullName ?? course.instructor?.username}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Bài giảng</dt>
                  <dd className="font-medium text-ink-800">{lectures.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Bài kiểm tra</dt>
                  <dd className="font-medium text-ink-800">{quizzes.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Học viên</dt>
                  <dd className="font-medium text-ink-800">{studentCount ?? 0}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
