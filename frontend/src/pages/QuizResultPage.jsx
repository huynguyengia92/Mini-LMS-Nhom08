import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, Target, Trophy, XCircle } from 'lucide-react';
import api from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { EmptyState, PageLoader } from '../components/ui/Feedback';
import ToeicScoreSummary from '../components/ToeicScoreSummary';

function ScoreRing({ value }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const tone = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-ink-900">{Math.round(value)}</span>
        <span className="text-xs font-medium text-ink-500">/ 100 điểm</span>
      </div>
    </div>
  );
}

export default function QuizResultPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get(`/quizzes/attempts/${id}/result`)
      .then((res) => setData(res.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader label="Đang chấm điểm..." />;

  if (failed || !data) {
    return (
      <EmptyState
        icon={Trophy}
        title="Chưa có kết quả"
        description="Lượt làm bài này chưa được nộp hoặc không tồn tại."
        action={<Button to="/my/dashboard">Về khóa học của tôi</Button>}
      />
    );
  }

  const { attempt, answers, groups = [], breakdown } = data;
  const isToeic = attempt.quiz.examType === 'TOEIC_TEST';
  const groupMap = new Map(groups.map((g) => [String(g._id), g]));
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const earned = answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
  const total = answers.reduce((sum, a) => sum + a.question.points, 0);
  const score = attempt.score ?? 0;
  const passed = score >= 50;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/courses/${attempt.quiz.course.slug}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Về khóa học {attempt.quiz.course.title}
      </Link>

      {/* Đề TOEIC: hiển thị điểm quy đổi + phân tích theo part/dạng bài */}
      {isToeic && breakdown ? (
        <div className="mb-6">
          <ToeicScoreSummary attempt={attempt} breakdown={breakdown} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button to={`/toeic/${attempt.quiz._id}`} variant="outline">
              <RotateCcw className="h-4 w-4" />
              Luyện lại đề này
            </Button>
            <Button to="/toeic">Thư viện đề thi</Button>
          </div>
        </div>
      ) : (
      /* Bài kiểm tra thường: điểm phần trăm */
      <Card className="mb-6 overflow-hidden">
        <div
          className={`px-6 py-3 text-sm font-semibold text-white ${passed ? 'bg-emerald-600' : 'bg-amber-600'}`}
        >
          {passed ? 'Chúc mừng! Bạn đã vượt qua bài kiểm tra.' : 'Bạn cần ôn tập thêm để đạt kết quả tốt hơn.'}
        </div>
        <CardBody className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:items-center sm:justify-center">
          <ScoreRing value={score} />
          <div className="w-full max-w-xs space-y-4">
            <div>
              <h1 className="text-lg font-bold text-ink-900">{attempt.quiz.title}</h1>
              <p className="mt-0.5 text-sm text-ink-500">
                Nộp lúc{' '}
                {new Date(attempt.submittedAt).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Câu đúng</dt>
                <dd className="mt-0.5 text-lg font-bold text-ink-900">
                  {correctCount}
                  <span className="text-sm font-medium text-ink-400">/{answers.length}</span>
                </dd>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <dt className="text-xs text-ink-500">Điểm đạt</dt>
                <dd className="mt-0.5 text-lg font-bold text-ink-900">
                  {earned}
                  <span className="text-sm font-medium text-ink-400">/{total}</span>
                </dd>
              </div>
            </dl>
            <div className="flex gap-2">
              <Button to={`/quizzes/${attempt.quiz._id}/start`} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4" />
                Làm lại
              </Button>
              <Button to="/my/progress" className="flex-1">
                <Target className="h-4 w-4" />
                Tiến độ
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      )}

      {/* Xem lại từng câu */}
      <Card>
        <CardHeader title="Xem lại bài làm" description="Đối chiếu đáp án của bạn với đáp án đúng" />
        <ul className="divide-y divide-ink-100">
          {answers.map((answer, index) => (
            <li key={answer._id} className="px-5 py-5">
              <div className="flex items-start gap-3">
                <span
                  className={[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                    answer.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600',
                  ].join(' ')}
                >
                  {answer.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-[15px] leading-relaxed font-semibold text-ink-900">
                      Câu {index + 1}. {answer.question.text}
                    </p>
                    <Badge tone={answer.isCorrect ? 'success' : 'danger'}>
                      {answer.pointsAwarded}/{answer.question.points} điểm
                    </Badge>
                  </div>

                  {answer.question.imageUrl && (
                    <figure className="mt-3">
                      <img
                        src={answer.question.imageUrl}
                        alt=""
                        className="max-h-56 rounded-xl border border-ink-200 object-contain"
                      />
                      {answer.question.imageCredit && (
                        <figcaption className="mt-1 text-[11px] text-ink-400">
                          {answer.question.imageCredit}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {answer.question.audioUrl && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio controls src={answer.question.audioUrl} className="mt-3 w-full max-w-md" />
                  )}

                  <div className="mt-3 space-y-2 text-sm">
                    <div
                      className={[
                        'rounded-xl border px-3.5 py-2.5',
                        answer.isCorrect
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-rose-200 bg-rose-50',
                      ].join(' ')}
                    >
                      <span className="text-xs font-medium text-ink-500">Bạn chọn</span>
                      <p
                        className={`mt-0.5 font-medium ${
                          answer.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                        }`}
                      >
                        {answer.selectedChoice?.text ?? 'Không chọn đáp án'}
                      </p>
                    </div>

                    {!answer.isCorrect && answer.correctChoice && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                        <span className="text-xs font-medium text-ink-500">Đáp án đúng</span>
                        <p className="mt-0.5 font-medium text-emerald-800">{answer.correctChoice.text}</p>
                      </div>
                    )}

                    {answer.question.explanation && (
                      <div className="rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5">
                        <span className="text-xs font-medium text-ink-500">Giải thích</span>
                        <p className="mt-0.5 leading-relaxed text-ink-700">{answer.question.explanation}</p>
                      </div>
                    )}

                    {answer.question.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {answer.question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white px-2 py-0.5 text-[11px] text-ink-500 ring-1 ring-ink-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {isToeic && answer.question.group && groupMap.get(String(answer.question.group))?.passageText && (
                      <details className="rounded-xl border border-ink-200 bg-white px-3.5 py-2.5">
                        <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-800">
                          Xem lại ngữ liệu ({groupMap.get(String(answer.question.group)).title})
                        </summary>
                        <p className="scrollbar-slim mt-2 max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-ink-600">
                          {groupMap.get(String(answer.question.group)).passageText}
                        </p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
