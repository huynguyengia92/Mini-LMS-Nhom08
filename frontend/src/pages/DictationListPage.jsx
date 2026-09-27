import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Headphones, Keyboard, PenLine } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';

const LEVELS = {
  BEGINNER: { label: 'Cơ bản', tone: 'success' },
  INTERMEDIATE: { label: 'Trung cấp', tone: 'warning' },
  ADVANCED: { label: 'Nâng cao', tone: 'danger' },
};

export default function DictationListPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    api
      .get('/dictation/lessons')
      .then((res) => setLessons(res.data.lessons))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Nghe chép chính tả"
        description="Nghe từng câu và gõ lại chính xác những gì bạn nghe được — cách luyện bắt âm hiệu quả nhất cho phần Listening."
      />

      <Card className="mb-6 border-brand-200 bg-brand-50/50">
        <CardBody className="grid gap-4 text-sm sm:grid-cols-3">
          {[
            { icon: Headphones, title: 'Nghe', text: 'Nghe câu nhiều lần, có thể giảm tốc độ nếu nói nhanh.' },
            { icon: Keyboard, title: 'Gõ lại', text: 'Gõ đúng những gì nghe được, không cần viết hoa hay dấu câu.' },
            { icon: CheckCircle2, title: 'Đối chiếu', text: 'Hệ thống tô màu từng từ đúng, sai, thiếu để bạn biết lỗi ở đâu.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="font-semibold text-ink-900">{title}</p>
                <p className="mt-0.5 text-ink-600">{text}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <EmptyState icon={PenLine} title="Chưa có bài chép chính tả nào" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => {
            const level = LEVELS[lesson.level] ?? LEVELS.BEGINNER;
            const percent = lesson.segmentCount
              ? (lesson.completedSegments / lesson.segmentCount) * 100
              : 0;
            return (
              <Card key={lesson._id} hoverable className="flex flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={level.tone}>{level.label}</Badge>
                    {lesson.part && <Badge tone="info">Part {lesson.part}</Badge>}
                    {lesson.completed && (
                      <Badge tone="success" icon={CheckCircle2}>
                        Hoàn thành
                      </Badge>
                    )}
                  </div>

                  <Link
                    to={`/dictation/${lesson._id}`}
                    className="mt-3 text-base font-semibold text-ink-900 transition-colors hover:text-brand-700"
                  >
                    {lesson.title}
                  </Link>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{lesson.description}</p>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-ink-500">
                        {lesson.completedSegments}/{lesson.segmentCount} câu đạt
                      </span>
                      {lesson.averageAccuracy != null && (
                        <span className="font-semibold text-brand-700">TB {lesson.averageAccuracy}%</span>
                      )}
                    </div>
                    <ProgressBar value={percent} size="sm" tone={lesson.completed ? 'success' : 'brand'} />
                  </div>

                  <div className="mt-auto pt-5">
                    <Button to={`/dictation/${lesson._id}`} className="w-full">
                      {lesson.completedSegments > 0 ? 'Luyện tiếp' : 'Bắt đầu'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
