import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CirclePlay,
  Circle,
  ExternalLink,
  FileText,
  ListChecks,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState, PageLoader } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../components/ui/Toast';

export default function LecturePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/lectures/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function markComplete() {
    setSaving(true);
    try {
      await api.post(`/lectures/${id}/complete`);
      toast.success('Đã đánh dấu hoàn thành bài giảng.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không thể cập nhật tiến độ.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader label="Đang tải bài giảng..." />;

  if (failed || !data) {
    return (
      <EmptyState
        icon={FileText}
        title="Không tìm thấy bài giảng"
        description="Bài giảng có thể đã bị xóa hoặc bạn không có quyền truy cập."
        action={<Button to="/courses">Về danh sách khóa học</Button>}
      />
    );
  }

  const { lecture, siblings, completedLectureIds = [] } = data;
  const isStudent = user?.role === 'STUDENT';
  const isCompleted = completedLectureIds.includes(lecture._id);
  const currentIndex = siblings.findIndex((l) => l._id === lecture._id);
  const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
  const progress = siblings.length ? (completedLectureIds.length / siblings.length) * 100 : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
      {/* Sidebar chương trình học */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-1 scrollbar-slim">
        <Card>
          <div className="border-b border-ink-100 px-5 py-4">
            <Link
              to={`/courses/${lecture.course.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 transition-colors hover:text-brand-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về khóa học
            </Link>
            <h2 className="mt-2 text-sm leading-snug font-semibold text-ink-900">{lecture.course.title}</h2>
            {isStudent && (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-ink-500">
                    {completedLectureIds.length}/{siblings.length} bài giảng
                  </span>
                  <span className="font-semibold text-brand-700">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} size="sm" tone={progress >= 100 ? 'success' : 'brand'} />
              </div>
            )}
          </div>

          <nav className="p-2">
            {siblings.map((item) => {
              const active = item._id === lecture._id;
              const done = completedLectureIds.includes(item._id);
              return (
                <Link
                  key={item._id}
                  to={`/lectures/${item._id}`}
                  className={[
                    'flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                    active ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-ink-50',
                  ].join(' ')}
                >
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className={`mt-0.5 h-4 w-4 shrink-0 ${active ? 'text-brand-500' : 'text-ink-300'}`} />
                  )}
                  <span className="min-w-0">
                    <span
                      className={[
                        'block text-sm leading-snug',
                        active ? 'font-semibold text-brand-800' : 'font-medium text-ink-700',
                      ].join(' ')}
                    >
                      {item.order}. {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-400">
                      {item.contentType === 'VIDEO' ? 'Video' : 'Tài liệu'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </Card>
      </aside>

      {/* Nội dung bài giảng */}
      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone={lecture.contentType === 'VIDEO' ? 'info' : 'neutral'}>
                {lecture.contentType === 'VIDEO' ? 'Video bài giảng' : 'Tài liệu'}
              </Badge>
              <span className="text-xs text-ink-400">
                Bài {currentIndex + 1} / {siblings.length}
              </span>
              {isCompleted && (
                <Badge tone="success" icon={CheckCircle2}>
                  Đã hoàn thành
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{lecture.title}</h1>
          </div>
        </div>

        {lecture.contentType === 'VIDEO' && lecture.videoUrl && (
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 shadow-card">
            <div className="aspect-video">
              <iframe
                src={lecture.videoUrl}
                title={lecture.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {lecture.documentUrl && (
          <Card>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Tài liệu bài giảng</p>
                  <p className="text-xs text-ink-500">Mở trong tab mới để xem hoặc tải về</p>
                </div>
              </div>
              <Button as="a" href={lecture.documentUrl} target="_blank" rel="noreferrer" variant="outline">
                Mở tài liệu
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardBody>
          </Card>
        )}

        {lecture.textContent && (
          <Card>
            <CardBody>
              <div className="prose-sm max-w-none leading-relaxed whitespace-pre-line text-ink-700">
                {lecture.textContent}
              </div>
            </CardBody>
          </Card>
        )}

        {!lecture.videoUrl && !lecture.documentUrl && !lecture.textContent && (
          <Card>
            <CardBody>
              <p className="py-8 text-center text-sm text-ink-500">
                Bài giảng này chưa có nội dung. Vui lòng liên hệ giảng viên.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Hành động */}
        {isStudent && (
          <Card className={isCompleted ? 'border-emerald-200 bg-emerald-50/50' : ''}>
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-ink-100 text-ink-500',
                  ].join(' ')}
                >
                  <ListChecks className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {isCompleted ? 'Bạn đã hoàn thành bài giảng này' : 'Đã học xong bài này?'}
                  </p>
                  <p className="text-xs text-ink-500">
                    {isCompleted
                      ? 'Tiến độ của bạn đã được ghi nhận.'
                      : 'Đánh dấu hoàn thành để cập nhật tiến độ học tập.'}
                  </p>
                </div>
              </div>
              {!isCompleted && (
                <Button variant="success" loading={saving} onClick={markComplete}>
                  <CheckCircle2 className="h-4 w-4" />
                  Đánh dấu hoàn thành
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {/* Điều hướng bài trước / sau */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {prev ? (
            <Button variant="outline" onClick={() => navigate(`/lectures/${prev._id}`)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="max-w-[12rem] truncate">{prev.title}</span>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button onClick={() => navigate(`/lectures/${next._id}`)}>
              <span className="max-w-[12rem] truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" to={`/courses/${lecture.course.slug}`}>
              <CirclePlay className="h-4 w-4" />
              Hoàn tất — về khóa học
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
