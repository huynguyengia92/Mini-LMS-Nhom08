import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  CirclePlay,
  ExternalLink,
  FileQuestion,
  FileText,
  Pencil,
  Plus,
  Timer,
  Trash2,
  Users,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function CourseManagePage() {
  const { slug } = useParams();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { type: 'lecture' | 'quiz', item }
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/courses/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    setDeleting(true);
    try {
      if (confirm.type === 'lecture') {
        await api.delete(`/lectures/${confirm.item._id}`);
        toast.success('Đã xóa bài giảng.');
      } else {
        await api.delete(`/quizzes/${confirm.item._id}`);
        toast.success('Đã xóa bài kiểm tra.');
      }
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xóa thất bại.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { course, lectures, quizzes, studentCount } = data;

  return (
    <div>
      <PageHeader
        title={course.title}
        description={course.description || 'Chưa có mô tả cho khóa học này.'}
        breadcrumbs={[{ label: 'Quản lý khóa học', to: '/instructor/courses' }, { label: course.title }]}
        actions={
          <>
            <Button to={`/courses/${course.slug}`} variant="outline">
              <ExternalLink className="h-4 w-4" />
              Xem như học viên
            </Button>
            <Button to={`/instructor/courses/${course.slug}/edit`} variant="outline">
              <Pencil className="h-4 w-4" />
              Sửa thông tin
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="brand">{course.category?.name}</Badge>
        {course.isPublished ? <Badge tone="success">Đã xuất bản</Badge> : <Badge tone="warning">Bản nháp</Badge>}
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
          <Users className="h-4 w-4" />
          {studentCount ?? 0} học viên đã đăng ký
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bài giảng */}
        <Card>
          <CardHeader
            title="Bài giảng"
            description={`${lectures.length} bài giảng trong khóa học`}
            action={
              <Button to={`/instructor/courses/${course.slug}/lectures/new`} size="sm">
                <Plus className="h-4 w-4" />
                Thêm
              </Button>
            }
          />
          {lectures.length === 0 ? (
            <CardBody>
              <div className="py-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Chưa có bài giảng nào</p>
                <p className="mt-1 text-sm text-ink-500">
                  Thêm bài giảng đầu tiên để học viên có nội dung học.
                </p>
              </div>
            </CardBody>
          ) : (
            <ul className="divide-y divide-ink-100">
              {lectures.map((lecture) => (
                <li key={lecture._id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500">
                    {lecture.contentType === 'VIDEO' ? (
                      <CirclePlay className="h-4.5 w-4.5" />
                    ) : (
                      <FileText className="h-4.5 w-4.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {lecture.order}. {lecture.title}
                    </p>
                    <p className="text-xs text-ink-500">
                      {lecture.contentType === 'VIDEO' ? 'Video' : 'Tài liệu'}
                    </p>
                  </div>
                  <Button
                    to={`/instructor/lectures/${lecture._id}/edit`}
                    variant="ghost"
                    size="icon"
                    title="Sửa"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger-ghost"
                    size="icon"
                    title="Xóa"
                    onClick={() => setConfirm({ type: 'lecture', item: lecture })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Bài kiểm tra */}
        <Card>
          <CardHeader
            title="Bài kiểm tra"
            description={`${quizzes.length} bài kiểm tra trong khóa học`}
            action={
              <Button to={`/instructor/courses/${course.slug}/quizzes/new`} size="sm">
                <Plus className="h-4 w-4" />
                Tạo đề
              </Button>
            }
          />
          {quizzes.length === 0 ? (
            <CardBody>
              <div className="py-8 text-center">
                <FileQuestion className="mx-auto h-8 w-8 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Chưa có bài kiểm tra nào</p>
                <p className="mt-1 text-sm text-ink-500">
                  Tạo đề kiểm tra để đánh giá kết quả học tập của học viên.
                </p>
              </div>
            </CardBody>
          ) : (
            <ul className="divide-y divide-ink-100">
              {quizzes.map((quiz) => (
                <li key={quiz._id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <FileQuestion className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/instructor/quizzes/${quiz._id}/manage`}
                      className="block truncate text-sm font-medium text-ink-900 transition-colors hover:text-brand-700"
                    >
                      {quiz.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-ink-500">
                      {quiz.timeLimitMinutes && (
                        <span className="inline-flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {quiz.timeLimitMinutes} phút
                        </span>
                      )}
                      {quiz.dueDate && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {new Date(quiz.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button to={`/instructor/quizzes/${quiz._id}/manage`} variant="outline" size="sm">
                    Soạn câu hỏi
                  </Button>
                  <Button
                    variant="danger-ghost"
                    size="icon"
                    title="Xóa"
                    onClick={() => setConfirm({ type: 'quiz', item: quiz })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.type === 'lecture' ? 'Xóa bài giảng?' : 'Xóa bài kiểm tra?'}
        description={
          confirm?.type === 'lecture'
            ? `Bài giảng "${confirm?.item?.title}" sẽ bị xóa khỏi khóa học, cùng với tiến độ học tập liên quan.`
            : `Bài kiểm tra "${confirm?.item?.title}" và toàn bộ câu hỏi bên trong sẽ bị xóa vĩnh viễn.`
        }
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
