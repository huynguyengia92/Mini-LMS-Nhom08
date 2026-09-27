import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpenCheck, Clock, Headphones, ListChecks, Target } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';

export default function ToeicTestListPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    api
      .get('/quizzes/toeic/tests')
      .then((res) => setTests(res.data.tests))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Thư viện đề thi TOEIC"
        description="Luyện từng phần thi để tập trung vào dạng bài yếu, hoặc làm trọn đề để ước lượng điểm thang 990."
      />

      {/* Giải thích cấu trúc đề */}
      <Card className="mb-6 border-brand-200 bg-brand-50/50">
        <CardBody className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <span className="inline-flex items-center gap-2 font-semibold text-brand-800">
            <BookOpenCheck className="h-4.5 w-4.5" />
            Cấu trúc đề TOEIC Listening &amp; Reading
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <Headphones className="h-4 w-4 text-ink-400" />
            Listening — Part 1-4 · 100 câu
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <ListChecks className="h-4 w-4 text-ink-400" />
            Reading — Part 5-7 · 100 câu
          </span>
          <span className="inline-flex items-center gap-1.5 text-ink-600">
            <Clock className="h-4 w-4 text-ink-400" />
            120 phút · thang điểm 10–990
          </span>
        </CardBody>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Chưa có đề thi nào"
          description="Giảng viên có thể tạo đề TOEIC trong phần quản lý khóa học."
          action={<Button to="/courses">Xem khóa học</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {tests.map((test) => (
            <Card key={test._id} hoverable className="flex flex-col">
              <CardBody className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/toeic/${test._id}`}
                      className="text-base font-semibold text-ink-900 transition-colors hover:text-brand-700"
                    >
                      {test.title}
                    </Link>
                    <p className="mt-1 text-sm text-ink-500">{test.course?.title}</p>
                  </div>
                  {test.bestScore != null && (
                    <Badge tone="success" icon={Award}>
                      {test.bestScore}
                    </Badge>
                  )}
                </div>

                {test.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{test.description}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {test.availableParts.map((part) => (
                    <span
                      key={part}
                      className="rounded-lg bg-ink-100 px-2 py-1 text-xs font-medium text-ink-600"
                    >
                      Part {part}
                    </span>
                  ))}
                </div>

                <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
                  <div className="inline-flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" />
                    {test.questionCount} câu hỏi
                  </div>
                  <div className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    120 phút (full test)
                  </div>
                  {test.attemptCount > 0 && (
                    <div className="inline-flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Bạn đã làm {test.attemptCount} lần
                    </div>
                  )}
                </dl>

                <div className="mt-auto pt-5">
                  <Button to={`/toeic/${test._id}`} className="w-full">
                    Vào luyện tập
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
