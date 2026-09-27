import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, FileQuestion, User } from 'lucide-react';
import Badge from './ui/Badge';
import ProgressBar from './ui/ProgressBar';

// Màu gradient ổn định theo tên khóa học để mỗi khóa có một "bìa" riêng nhận diện được.
const COVERS = [
  'from-brand-500 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-blue-700',
  'from-violet-500 to-purple-700',
];

// FNV-1a: trộn đều hơn hàm băm nhân-cộng, vốn trả cùng một màu cho các tên chỉ khác phần đầu
// (ví dụ mọi khóa đều kết thúc bằng "TOEIC").
function coverFor(text = '') {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return COVERS[(hash >>> 0) % COVERS.length];
}

export default function CourseCard({ course, enrolled = false, progress = null, footer = null }) {
  const lectureCount = course.lectureCount ?? course.lectures?.length;
  const quizCount = course.quizCount ?? course.quizzes?.length;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-lift">
      <Link to={`/courses/${course.slug}`} className="block">
        <div className={`relative h-28 bg-gradient-to-br ${coverFor(course.title)}`}>
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {course.category?.name && (
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-ink-700 backdrop-blur">
                {course.category.name}
              </span>
            )}
            {enrolled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                <CheckCircle2 className="h-3 w-3" />
                Đã đăng ký
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/courses/${course.slug}`}>
          <h3 className="line-clamp-2 text-base leading-snug font-semibold text-ink-900 transition-colors group-hover:text-brand-700">
            {course.title}
          </h3>
        </Link>

        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">{course.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
          {(course.instructor?.fullName || course.instructor?.username) && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {course.instructor.fullName ?? course.instructor.username}
            </span>
          )}
          {lectureCount != null && (
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {lectureCount} bài giảng
            </span>
          )}
          {quizCount != null && quizCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <FileQuestion className="h-3.5 w-3.5" />
              {quizCount} bài kiểm tra
            </span>
          )}
        </div>

        {progress != null && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-ink-600">Tiến độ</span>
              <span className="font-semibold text-brand-700">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} size="sm" tone={progress >= 100 ? 'success' : 'brand'} />
          </div>
        )}

        <div className="mt-auto pt-4">
          {footer ?? (
            <div className="flex items-center justify-between">
              {!course.isPublished && <Badge tone="warning">Chưa xuất bản</Badge>}
              <Link
                to={`/courses/${course.slug}`}
                className="ml-auto text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
              >
                Xem chi tiết →
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
