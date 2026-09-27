import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FileQuestion, Send, Timer } from 'lucide-react';
import api from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Alert, EmptyState, PageLoader } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../components/ui/Toast';
import ToeicAttemptPage from './ToeicAttemptPage';

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export default function QuizAttemptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const autoSubmitted = useRef(false);

  useEffect(() => {
    api
      .get(`/quizzes/attempts/${id}`)
      .then((res) => {
        if (res.data.submitted) {
          navigate(`/attempts/${id}/result`, { replace: true });
          return;
        }
        setAttempt(res.data.attempt);
        setQuestions(res.data.questions);
        setGroups(res.data.groups ?? []);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Không tải được bài kiểm tra.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const deadline = useMemo(() => {
    if (!attempt?.quiz?.timeLimitMinutes) return null;
    return new Date(attempt.startedAt).getTime() + attempt.quiz.timeLimitMinutes * 60_000;
  }, [attempt]);

  const submit = useCallback(
    async (auto = false) => {
      setSubmitting(true);
      try {
        await api.post(`/quizzes/attempts/${id}/submit`, { answers });
        toast.success(auto ? 'Hết giờ — bài đã được nộp tự động.' : 'Đã nộp bài thành công.');
        navigate(`/attempts/${id}/result`, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message ?? 'Nộp bài thất bại.');
        setSubmitting(false);
        setConfirmOpen(false);
      }
    },
    [answers, id, navigate, toast],
  );

  // Đồng hồ đếm ngược, tự nộp bài khi hết giờ.
  useEffect(() => {
    if (!deadline) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  useEffect(() => {
    if (!deadline || autoSubmitted.current || submitting) return;
    if (now >= deadline) {
      autoSubmitted.current = true;
      submit(true);
    }
  }, [now, deadline, submitting, submit]);

  if (loading) return <PageLoader label="Đang chuẩn bị đề thi..." />;

  if (error || !attempt) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Không mở được bài kiểm tra"
        description={error || 'Lượt làm bài không tồn tại hoặc đã kết thúc.'}
        action={<Button to="/my/dashboard">Về khóa học của tôi</Button>}
      />
    );
  }

  // Đề TOEIC có bố cục riêng (ngữ liệu dùng chung, bảng điều hướng câu hỏi, chia theo part).
  if (attempt.quiz.examType === 'TOEIC_TEST') {
    return <ToeicAttemptPage attempt={attempt} questions={questions} groups={groups} />;
  }

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const remaining = deadline ? deadline - now : null;
  const urgent = remaining != null && remaining < 60_000;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header đề thi */}
      <Card className="mb-5">
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{attempt.quiz.title}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {questions.length} câu hỏi · Tổng {questions.reduce((s, q) => s + q.points, 0)} điểm
            </p>
          </div>
          {remaining != null && (
            <div
              className={[
                'flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold tabular-nums',
                urgent ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-brand-50 text-brand-700',
              ].join(' ')}
            >
              <Timer className={`h-4.5 w-4.5 ${urgent ? 'animate-pulse' : ''}`} />
              {formatClock(remaining)}
            </div>
          )}
        </CardBody>
        <div className="border-t border-ink-100 px-5 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-ink-500">
              Đã trả lời {answeredCount}/{questions.length} câu
            </span>
            <span className="font-semibold text-ink-700">
              {Math.round((answeredCount / Math.max(1, questions.length)) * 100)}%
            </span>
          </div>
          <ProgressBar value={(answeredCount / Math.max(1, questions.length)) * 100} size="sm" />
        </div>
      </Card>

      {urgent && (
        <Alert tone="warning" className="mb-5" title="Sắp hết giờ">
          Bài sẽ được nộp tự động khi đồng hồ về 00:00.
        </Alert>
      )}

      {/* Danh sách câu hỏi */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = answers[question._id];
          return (
            <Card key={question._id} className={selected ? 'border-brand-200' : ''}>
              <CardBody>
                <div className="flex items-start gap-3">
                  <span
                    className={[
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      selected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[15px] leading-relaxed font-semibold text-ink-900">
                        {question.text}
                      </p>
                      <Badge tone="neutral">{question.points} điểm</Badge>
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {question.questionType === 'MCQ' ? 'Trắc nghiệm nhiều lựa chọn' : 'Câu hỏi Đúng / Sai'}
                    </p>

                    <div className="mt-4 space-y-2">
                      {question.choices.map((choice) => {
                        const active = selected === choice._id;
                        return (
                          <label
                            key={choice._id}
                            className={[
                              'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all',
                              active
                                ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                            ].join(' ')}
                          >
                            <input
                              type="radio"
                              name={`question-${question._id}`}
                              className="sr-only"
                              checked={active}
                              onChange={() => setAnswers((prev) => ({ ...prev, [question._id]: choice._id }))}
                            />
                            <span
                              className={[
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                active ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white',
                              ].join(' ')}
                            >
                              {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            <span
                              className={`text-sm ${active ? 'font-medium text-brand-900' : 'text-ink-700'}`}
                            >
                              {choice.text}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Thanh nộp bài */}
      <div className="sticky bottom-4 mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white/95 p-4 shadow-lift backdrop-blur">
          <p className="flex items-center gap-2 text-sm">
            {allAnswered ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-ink-700">Đã trả lời hết tất cả câu hỏi</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-ink-700">
                  Còn <strong>{questions.length - answeredCount}</strong> câu chưa trả lời
                </span>
              </>
            )}
          </p>
          <Button size="lg" loading={submitting} onClick={() => setConfirmOpen(true)}>
            <Send className="h-4 w-4" />
            Nộp bài
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        tone={allAnswered ? 'brand' : 'danger'}
        title="Xác nhận nộp bài?"
        description={
          allAnswered
            ? 'Bài làm sẽ được chấm điểm ngay lập tức và không thể chỉnh sửa sau khi nộp.'
            : `Bạn còn ${questions.length - answeredCount} câu chưa trả lời. Các câu bỏ trống sẽ được tính 0 điểm.`
        }
        confirmLabel="Nộp bài"
        loading={submitting}
        onConfirm={() => submit(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
