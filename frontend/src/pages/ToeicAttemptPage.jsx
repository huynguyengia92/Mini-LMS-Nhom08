import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FileText, Headphones, Send, Timer } from 'lucide-react';
import api from '../api/client';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Alert } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const PART_NAMES = {
  1: 'Part 1 — Mô tả tranh',
  2: 'Part 2 — Hỏi & đáp',
  3: 'Part 3 — Hội thoại',
  4: 'Part 4 — Bài nói ngắn',
  5: 'Part 5 — Hoàn thành câu',
  6: 'Part 6 — Hoàn thành đoạn văn',
  7: 'Part 7 — Đọc hiểu',
};

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

/** Ngữ liệu dùng chung của một nhóm câu hỏi: audio (Part 3/4) hoặc đoạn văn (Part 6/7). */
function GroupPanel({ group }) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
      <div className="flex items-center gap-2 border-b border-ink-200 bg-white px-4 py-2.5">
        {group.audioUrl || group.part === 3 || group.part === 4 ? (
          <Headphones className="h-4 w-4 text-brand-600" />
        ) : (
          <FileText className="h-4 w-4 text-brand-600" />
        )}
        <span className="text-sm font-semibold text-ink-800">{group.title || `Ngữ liệu Part ${group.part}`}</span>
      </div>

      {group.audioUrl ? (
        <div className="bg-white px-4 py-3">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={group.audioUrl} className="w-full" />
        </div>
      ) : (
        (group.part === 3 || group.part === 4) && (
          <div className="border-b border-ink-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            Chưa có file audio cho phần này — bản ghi hội thoại được hiển thị bên dưới để luyện tạm.
          </div>
        )
      )}

      {group.passageText && (
        <div className="scrollbar-slim max-h-80 overflow-y-auto px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink-700">{group.passageText}</p>
        </div>
      )}
    </div>
  );
}

export default function ToeicAttemptPage({ attempt, questions, groups }) {
  const navigate = useNavigate();
  const toast = useToast();

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  const autoSubmitted = useRef(false);

  const groupMap = useMemo(() => new Map(groups.map((g) => [String(g._id), g])), [groups]);

  // Gom câu hỏi theo part để hiển thị và điều hướng.
  const sections = useMemo(() => {
    const byPart = new Map();
    questions.forEach((q, index) => {
      const part = q.part ?? 0;
      if (!byPart.has(part)) byPart.set(part, []);
      byPart.get(part).push({ ...q, number: index + 1 });
    });
    return [...byPart.entries()].sort((a, b) => a[0] - b[0]).map(([part, items]) => ({ part, items }));
  }, [questions]);

  const deadline = useMemo(() => {
    if (!attempt.timeLimitMinutes) return null;
    return new Date(attempt.startedAt).getTime() + attempt.timeLimitMinutes * 60_000;
  }, [attempt]);

  const submit = useCallback(
    async (auto = false) => {
      setSubmitting(true);
      try {
        await api.post(`/quizzes/attempts/${attempt._id}/submit`, { answers });
        toast.success(auto ? 'Hết giờ — bài đã được nộp tự động.' : 'Đã nộp bài.');
        navigate(`/attempts/${attempt._id}/result`, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message ?? 'Nộp bài thất bại.');
        setSubmitting(false);
        setConfirmOpen(false);
      }
    },
    [answers, attempt._id, navigate, toast],
  );

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

  const answeredCount = Object.keys(answers).length;
  const remaining = deadline ? deadline - now : null;
  const urgent = remaining != null && remaining < 5 * 60_000;

  function scrollToQuestion(number) {
    document.getElementById(`q-${number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      {/* Đề thi */}
      <div className="min-w-0">
        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="brand">{attempt.mode === 'FULL' ? 'Full test' : 'Luyện tập từng phần'}</Badge>
            {attempt.mode === 'PART' && (
              <Badge tone="neutral">Part {attempt.selectedParts.join(', ')}</Badge>
            )}
            <span className="text-xs text-ink-500">{questions.length} câu hỏi</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{attempt.quiz.title}</h1>
        </div>

        {urgent && (
          <Alert tone="warning" className="mb-5" title="Sắp hết giờ">
            Bài sẽ tự động nộp khi đồng hồ về 00:00.
          </Alert>
        )}

        {sections.map(({ part, items }) => {
          let lastGroupId = null;
          return (
            <section key={part} className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold tracking-wide text-ink-500 uppercase">
                  {PART_NAMES[part] ?? `Part ${part}`}
                </h2>
                <span className="h-px flex-1 bg-ink-200" />
                <span className="text-xs text-ink-400">{items.length} câu</span>
              </div>

              {items.map((question) => {
                const groupId = question.group ? String(question.group) : null;
                const showGroup = groupId && groupId !== lastGroupId;
                lastGroupId = groupId;
                const group = groupId ? groupMap.get(groupId) : null;
                const selected = answers[question._id];

                return (
                  <div key={question._id}>
                    {showGroup && group && <GroupPanel group={group} />}

                    <Card id={`q-${question.number}`} className={`mb-3 ${selected ? 'border-brand-200' : ''}`}>
                      <CardBody>
                        <div className="flex items-start gap-3">
                          <span
                            className={[
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                              selected ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-500',
                            ].join(' ')}
                          >
                            {question.number}
                          </span>
                          <div className="min-w-0 flex-1">
                            {question.imageUrl && (
                              <figure className="mb-3">
                                <img
                                  src={question.imageUrl}
                                  alt={`Tranh câu ${question.number}`}
                                  className="max-h-80 rounded-xl border border-ink-200 object-contain"
                                />
                                {question.imageCredit && (
                                  <figcaption className="mt-1 text-[11px] text-ink-400">
                                    {question.imageCredit}
                                  </figcaption>
                                )}
                              </figure>
                            )}
                            {question.audioUrl && (
                              // eslint-disable-next-line jsx-a11y/media-has-caption
                              <audio controls src={question.audioUrl} className="mb-3 w-full" />
                            )}

                            <p className="text-[15px] leading-relaxed font-medium text-ink-900">
                              {question.text}
                            </p>

                            {/* Part 1/2: phương án chỉ được đọc trong audio → hiển thị như phiếu tô đáp án */}
                            {question.choices.every((c) => c.text == null) ? (
                              <div className="mt-3 flex gap-2">
                                {question.choices.map((choice, i) => {
                                  const active = selected === choice._id;
                                  return (
                                    <button
                                      key={choice._id}
                                      type="button"
                                      onClick={() => setAnswers((prev) => ({ ...prev, [question._id]: choice._id }))}
                                      className={[
                                        'flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-bold transition-all',
                                        active
                                          ? 'border-brand-600 bg-brand-600 text-white shadow-md'
                                          : 'border-ink-300 bg-white text-ink-600 hover:border-brand-400 hover:text-brand-700',
                                      ].join(' ')}
                                      aria-label={`Chọn đáp án ${CHOICE_LABELS[i]}`}
                                    >
                                      {CHOICE_LABELS[i]}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                            <div className="mt-3 space-y-2">
                              {question.choices.map((choice, i) => {
                                const active = selected === choice._id;
                                return (
                                  <label
                                    key={choice._id}
                                    className={[
                                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 transition-all',
                                      active
                                        ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                                        : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                                    ].join(' ')}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${question._id}`}
                                      className="sr-only"
                                      checked={active}
                                      onChange={() =>
                                        setAnswers((prev) => ({ ...prev, [question._id]: choice._id }))
                                      }
                                    />
                                    <span
                                      className={[
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors',
                                        active
                                          ? 'bg-brand-600 text-white'
                                          : 'bg-ink-100 text-ink-500',
                                      ].join(' ')}
                                    >
                                      {CHOICE_LABELS[i]}
                                    </span>
                                    <span
                                      className={`text-sm leading-relaxed ${active ? 'font-medium text-brand-900' : 'text-ink-700'}`}
                                    >
                                      {choice.text}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {/* Bảng điều khiển */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardBody className="space-y-4">
            {remaining != null ? (
              <div
                className={[
                  'flex items-center justify-center gap-2 rounded-xl py-3 text-xl font-bold tabular-nums',
                  urgent ? 'bg-rose-50 text-rose-700' : 'bg-brand-50 text-brand-700',
                ].join(' ')}
              >
                <Timer className={`h-5 w-5 ${urgent ? 'animate-pulse' : ''}`} />
                {formatClock(remaining)}
              </div>
            ) : (
              <div className="rounded-xl bg-ink-100 py-3 text-center text-sm font-medium text-ink-600">
                Không giới hạn thời gian
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-ink-600">Đã trả lời</span>
                <span className="font-semibold text-ink-900">
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {questions.map((q, index) => {
                  const number = index + 1;
                  const done = Boolean(answers[q._id]);
                  return (
                    <button
                      key={q._id}
                      type="button"
                      onClick={() => scrollToQuestion(number)}
                      className={[
                        'flex h-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                        done
                          ? 'bg-brand-600 text-white hover:bg-brand-700'
                          : 'bg-ink-100 text-ink-500 hover:bg-ink-200',
                      ].join(' ')}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-ink-100 pt-4">
              <p className="mb-3 flex items-start gap-2 text-xs text-ink-500">
                {answeredCount === questions.length ? (
                  <>
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    Bạn đã trả lời hết các câu hỏi.
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    Còn {questions.length - answeredCount} câu chưa trả lời.
                  </>
                )}
              </p>
              <Button className="w-full" size="lg" loading={submitting} onClick={() => setConfirmOpen(true)}>
                <Send className="h-4 w-4" />
                Nộp bài
              </Button>
            </div>
          </CardBody>
        </Card>
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        tone={answeredCount === questions.length ? 'brand' : 'danger'}
        title="Nộp bài thi?"
        description={
          answeredCount === questions.length
            ? 'Bài sẽ được chấm ngay và bạn xem được phân tích kết quả theo từng phần thi.'
            : `Còn ${questions.length - answeredCount} câu chưa trả lời, các câu này sẽ tính 0 điểm.`
        }
        confirmLabel="Nộp bài"
        loading={submitting}
        onConfirm={() => submit(false)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
