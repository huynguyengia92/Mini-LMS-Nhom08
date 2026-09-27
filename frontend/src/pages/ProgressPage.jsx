import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, CheckCircle2, FileQuestion, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';
import ScoreTrendChart from '../components/ScoreTrendChart';

function scoreTone(score) {
  if (score == null) return 'neutral';
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

export default function ProgressPage() {
  const [overview, setOverview] = useState([]);
  const [toeicHistory, setToeicHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/progress')
      .then((res) => {
        setOverview(res.data.overview);
        setToeicHistory(res.data.toeicHistory ?? []);
      })
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalLectures = overview.reduce((s, i) => s + i.totalLectures, 0);
  const completedLectures = overview.reduce((s, i) => s + i.completedLectures, 0);
  const overallPercent = totalLectures ? (completedLectures / totalLectures) * 100 : 0;

  const allScores = overview.flatMap((i) =>
    i.quizResults.filter((q) => q.bestAttempt).map((q) => q.bestAttempt.score),
  );
  const avgScore = allScores.length
    ? Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length)
    : null;

  const latestToeic = toeicHistory[toeicHistory.length - 1] ?? null;
  const previousToeic = toeicHistory[toeicHistory.length - 2] ?? null;
  const toeicDelta = latestToeic && previousToeic ? latestToeic.totalScore - previousToeic.totalScore : 0;

  return (
    <div>
      <PageHeader
        title="Tiến độ học tập"
        description="Tổng hợp mức độ hoàn thành bài giảng và điểm bài kiểm tra của từng khóa học."
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : overview.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Chưa có dữ liệu tiến độ"
          description="Đăng ký một khóa học và bắt đầu học để hệ thống ghi nhận tiến độ của bạn."
          action={<Button to="/courses">Khám phá khóa học</Button>}
        />
      ) : (
        <>
          {/* Tổng quan */}
          <Card className="mb-6">
            <CardBody className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm text-ink-500">
                  <TrendingUp className="h-4 w-4" />
                  Tiến độ tổng thể
                </p>
                <p className="mt-1 text-3xl font-bold text-ink-900">{Math.round(overallPercent)}%</p>
                <div className="mt-2">
                  <ProgressBar value={overallPercent} size="sm" />
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm text-ink-500">
                  <BookOpen className="h-4 w-4" />
                  Bài giảng hoàn thành
                </p>
                <p className="mt-1 text-3xl font-bold text-ink-900">
                  {completedLectures}
                  <span className="text-lg font-medium text-ink-400">/{totalLectures}</span>
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm text-ink-500">
                  <FileQuestion className="h-4 w-4" />
                  Điểm trung bình
                </p>
                <p className="mt-1 text-3xl font-bold text-ink-900">
                  {avgScore != null ? `${avgScore}` : '—'}
                  {avgScore != null && <span className="text-lg font-medium text-ink-400">/100</span>}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Tiến bộ điểm TOEIC — chỉ vẽ biểu đồ khi có từ 2 lượt trở lên */}
          {toeicHistory.length > 0 && (
            <Card className="mb-6">
              <CardBody>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-ink-900">Điểm TOEIC qua các lượt thi thử</h2>
                    <p className="mt-0.5 text-sm text-ink-500">
                      Điểm quy đổi thang 990 của những lượt làm trọn đề.
                    </p>
                  </div>
                  {latestToeic && previousToeic && (
                    <span
                      className={[
                        'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold',
                        toeicDelta > 0
                          ? 'bg-emerald-50 text-emerald-700'
                          : toeicDelta < 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-ink-100 text-ink-600',
                      ].join(' ')}
                    >
                      {toeicDelta > 0 ? <TrendingUp className="h-4 w-4" /> : toeicDelta < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      {toeicDelta > 0 ? `+${toeicDelta}` : toeicDelta} so với lượt trước
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {toeicHistory.length >= 2 ? (
                    <ScoreTrendChart history={toeicHistory} />
                  ) : (
                    <div className="flex flex-wrap items-end gap-6">
                      <div>
                        <p className="text-sm text-ink-500">Lượt thi thử đầu tiên</p>
                        <p className="mt-1 text-5xl font-bold text-ink-900">{latestToeic.totalScore}</p>
                        <p className="mt-1 text-sm text-ink-500">
                          Listening {latestToeic.listeningScore} · Reading {latestToeic.readingScore}
                        </p>
                      </div>
                      <p className="max-w-xs text-sm text-ink-500">
                        Làm thêm một đề nữa để hệ thống vẽ biểu đồ tiến bộ cho bạn.
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-ink-400">
                  Đề rút gọn nên điểm là ước lượng, quy đổi từ tỉ lệ câu đúng của từng kỹ năng.
                </p>
              </CardBody>
            </Card>
          )}

          {/* Chi tiết từng khóa */}
          <div className="space-y-5">
            {overview.map((item) => (
              <Card key={item.course._id}>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/courses/${item.course.slug}`}
                        className="text-base font-semibold text-ink-900 transition-colors hover:text-brand-700"
                      >
                        {item.course.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-500">
                        {item.completedLectures}/{item.totalLectures} bài giảng đã hoàn thành
                      </p>
                    </div>
                    {item.percent >= 100 ? (
                      <Badge tone="success" icon={CheckCircle2}>
                        Hoàn thành
                      </Badge>
                    ) : (
                      <Badge tone="brand">{Math.round(item.percent)}%</Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={item.percent}
                      tone={item.percent >= 100 ? 'success' : 'brand'}
                      showLabel
                    />
                  </div>

                  {item.quizResults.length > 0 && (
                    <div className="mt-5 overflow-hidden rounded-xl border border-ink-200">
                      <table className="w-full text-sm">
                        <thead className="bg-ink-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-ink-600">Bài kiểm tra</th>
                            <th className="w-40 px-4 py-2.5 text-right font-semibold text-ink-600">
                              Điểm cao nhất
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100">
                          {item.quizResults.map((qr) => (
                            <tr key={qr.quiz._id}>
                              <td className="px-4 py-3 text-ink-800">{qr.quiz.title}</td>
                              <td className="px-4 py-3 text-right">
                                {qr.bestAttempt ? (
                                  <Badge tone={scoreTone(qr.bestAttempt.score)}>
                                    {qr.bestAttempt.score} điểm
                                  </Badge>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                                    <Minus className="h-3 w-3" />
                                    Chưa làm
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
