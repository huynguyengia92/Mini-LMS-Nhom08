import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  GraduationCap,
  Headphones,
  Layers,
  PenLine,
  Sparkles,
  Target,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Feedback';

const FEATURES = [
  {
    icon: Target,
    title: 'Luyện theo part hoặc full test',
    text: 'Chọn một vài part để luyện riêng, hoặc làm trọn đề 7 part trong 120 phút như thi thật.',
  },
  {
    icon: BarChart3,
    title: 'Chấm điểm & quy đổi thang 990',
    text: 'Nộp bài là có ngay điểm quy đổi, kèm tỉ lệ đúng theo từng part và từng dạng bài.',
  },
  {
    icon: Headphones,
    title: 'Audio cho Part 1-4',
    text: 'Mỗi câu Listening có audio riêng, nghe lại bao nhiêu lần cũng được khi luyện tập.',
  },
  {
    icon: Layers,
    title: 'Flashcards từ vựng',
    text: 'Học từ theo lịch lặp lại ngắt quãng với 4 chế độ: lật thẻ, trắc nghiệm, tìm cặp, điền từ.',
  },
  {
    icon: PenLine,
    title: 'Nghe chép chính tả',
    text: 'Nghe từng câu rồi gõ lại, hệ thống chấm từng từ và chỉ rõ chỗ nghe sai, thiếu hay thừa.',
  },
  {
    icon: BellRing,
    title: 'Tiến độ & thông báo',
    text: 'Theo dõi phần trăm hoàn thành từng khóa, điểm cao nhất mỗi bài và nhận thông báo bài mới.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/courses')
      .then((res) => {
        setCourses(res.data.courses.slice(0, 6));
        setEnrolledIds(res.data.enrolledIds ?? []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden rounded-none bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 px-6 py-16 text-white sm:-mx-6 sm:rounded-3xl sm:px-10 lg:-mx-0 lg:px-14 lg:py-20">
        <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Nền tảng luyện thi TOEIC Listening & Reading
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            Luyện đề, học từ vựng và luyện nghe TOEIC ở cùng một nơi
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-100 sm:text-lg">
            Mini-LMS cho bạn luyện từng part hoặc làm trọn đề 120 phút, chấm điểm tự động và quy đổi về
            thang 990, kèm flashcards từ vựng và bài nghe chép chính tả để luyện kỹ năng nghe mỗi ngày.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/toeic" size="lg" variant="white">
              Luyện đề TOEIC
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/courses" size="lg" variant="white-outline">
              Khám phá khóa học
            </Button>
          </div>

          <dl className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/20 pt-6">
            {[
              { icon: BookOpen, value: courses.length, label: 'Khóa học' },
              { icon: Target, value: '7', label: 'Part trong đề thi' },
              { icon: BarChart3, value: '990', label: 'Thang điểm quy đổi' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <dt className="flex items-center gap-1.5 text-xs text-brand-200">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tính năng */}
      <section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Đủ công cụ cho một lộ trình TOEIC
          </h2>
          <p className="mt-3 text-ink-500">
            Từ lúc học chiến lược từng part tới khi luyện đề và đo điểm quy đổi, mọi bước đều nằm trong hệ thống.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Khóa học nổi bật */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900">Khóa học nổi bật</h2>
            <p className="mt-1.5 text-sm text-ink-500">Các khóa luyện thi TOEIC đang mở đăng ký</p>
          </div>
          <Link
            to="/courses"
            className="shrink-0 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-800"
          >
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
                <Skeleton className="h-28 rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} enrolled={enrolledIds.includes(course._id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-300 bg-white/60 py-16 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-700">Chưa có khóa học nào được xuất bản</p>
            <p className="mt-1 text-sm text-ink-500">Giảng viên có thể tạo khóa học đầu tiên ngay bây giờ.</p>
          </div>
        )}
      </section>

      {/* CTA cuối trang */}
      {!user && (
        <section className="overflow-hidden rounded-3xl border border-ink-200 bg-white p-8 shadow-card sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold tracking-tight text-ink-900">Sẵn sàng bắt đầu?</h2>
              <p className="mt-2 text-ink-500">
                Tạo tài khoản học viên để luyện đề và theo dõi điểm số, hoặc tài khoản giảng viên để soạn đề
                TOEIC cho lớp của riêng bạn.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button to="/register" size="lg">
                Tạo tài khoản
              </Button>
              <Button to="/login" variant="outline" size="lg">
                Đăng nhập
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
