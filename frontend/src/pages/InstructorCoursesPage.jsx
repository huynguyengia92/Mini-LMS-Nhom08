import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileQuestion,
  LayoutGrid,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Users,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EmptyState, Skeleton } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function InstructorCoursesPage() {
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .get('/courses/instructor/mine')
      .then((res) => setCourses(res.data.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/courses/${target.slug}`);
      toast.success(`Đã xóa khóa học "${target.title}".`);
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xóa khóa học thất bại.');
    } finally {
      setDeleting(false);
    }
  }

  const totalStudents = courses.reduce((s, c) => s + (c.studentCount ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Quản lý khóa học"
        description="Tạo khóa học, thêm bài giảng và soạn đề kiểm tra cho học viên của bạn."
        actions={
          <Button to="/instructor/courses/new">
            <Plus className="h-4 w-4" />
            Tạo khóa học
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="Bạn chưa tạo khóa học nào"
          description="Tạo khóa học đầu tiên, thêm bài giảng và bài kiểm tra để học viên có thể đăng ký học."
          action={
            <Button to="/instructor/courses/new">
              <Plus className="h-4 w-4" />
              Tạo khóa học đầu tiên
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Khóa học', value: courses.length, icon: BookOpen },
              { label: 'Tổng học viên', value: totalStudents, icon: Users },
              {
                label: 'Bài kiểm tra',
                value: courses.reduce((s, c) => s + (c.quizCount ?? 0), 0),
                icon: FileQuestion,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <div>
                  <p className="text-2xl leading-tight font-bold text-ink-900">{value}</p>
                  <p className="text-sm text-ink-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <Card>
            <ul className="divide-y divide-ink-100">
              {courses.map((course) => (
                <li key={course._id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/instructor/courses/${course.slug}/manage`}
                        className="truncate font-semibold text-ink-900 transition-colors hover:text-brand-700"
                      >
                        {course.title}
                      </Link>
                      {course.isPublished ? (
                        <Badge tone="success">Đã xuất bản</Badge>
                      ) : (
                        <Badge tone="warning">Bản nháp</Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span>{course.category?.name}</span>
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lectureCount ?? 0} bài giảng
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileQuestion className="h-3.5 w-3.5" />
                        {course.quizCount ?? 0} bài kiểm tra
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course.studentCount ?? 0} học viên
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button to={`/instructor/courses/${course.slug}/manage`} size="sm">
                      <Settings2 className="h-4 w-4" />
                      Quản lý
                    </Button>
                    <Button to={`/instructor/courses/${course.slug}/edit`} variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                      Sửa
                    </Button>
                    <Button variant="danger-ghost" size="icon" onClick={() => setTarget(course)} title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title={`Xóa khóa học "${target?.title}"?`}
        description="Toàn bộ bài giảng, bài kiểm tra và dữ liệu đăng ký của học viên trong khóa học này sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa khóa học"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
