import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Keyboard,
  Layers,
  ListChecks,
  PartyPopper,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';
import FlashcardMode from '../components/vocab/FlashcardMode';
import QuizMode from '../components/vocab/QuizMode';
import MatchMode from '../components/vocab/MatchMode';
import TypingMode from '../components/vocab/TypingMode';

const MODES = [
  { key: 'flashcard', label: 'Flashcards', icon: Layers, description: 'Lật thẻ, tự đánh giá đã nhớ hay chưa' },
  { key: 'quiz', label: 'Trắc nghiệm', icon: ListChecks, description: 'Chọn nghĩa đúng trong 4 lựa chọn' },
  { key: 'match', label: 'Tìm cặp', icon: Shuffle, description: 'Ghép từ với nghĩa tương ứng' },
  { key: 'typing', label: 'Điền từ', icon: Keyboard, description: 'Xem nghĩa và gõ lại từ tiếng Anh' },
];

const STATUS_LABEL = {
  NEW: { label: 'Chưa học', tone: 'neutral' },
  LEARNING: { label: 'Đang học', tone: 'info' },
  MEMORIZED: { label: 'Đã nhớ', tone: 'success' },
};

export default function VocabSetDetailPage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null);
  const [onlyDue, setOnlyDue] = useState(true);
  const [session, setSession] = useState(null); // kết quả phiên học vừa xong

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get(`/vocab/sets/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const review = useCallback(
    (wordId, remembered) => api.post(`/vocab/words/${wordId}/review`, { remembered }).catch(() => {}),
    [],
  );

  function finish(result) {
    setSession(result);
    setMode(null);
    load();
  }

  if (loading) return <PageLoader label="Đang tải list từ..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { set, words, summary } = data;
  const studyWords = onlyDue ? words.filter((w) => w.due) : words;
  const percent = summary.total ? (summary.memorized / summary.total) * 100 : 0;

  // ----- Đang trong phiên học -----
  if (mode) {
    const ModeComponent = { flashcard: FlashcardMode, quiz: QuizMode, match: MatchMode, typing: TypingMode }[mode];
    return (
      <div>
        <button
          type="button"
          onClick={() => setMode(null)}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Thoát phiên học
        </button>
        <ModeComponent words={studyWords} allWords={words} onReview={review} onFinish={finish} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={set.title}
        description={set.description}
        breadcrumbs={[{ label: 'Flashcards', to: '/vocabulary' }, { label: set.title }]}
      />

      {/* Kết quả phiên vừa học */}
      {session && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/60">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <PartyPopper className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="font-semibold text-ink-900">Hoàn thành phiên học!</p>
                <p className="text-sm text-ink-600">
                  Nhớ được <strong className="text-emerald-700">{session.remembered}</strong> từ · cần ôn
                  lại <strong className="text-rose-600">{session.forgot}</strong> từ
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSession(null)}>
              Đóng
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        <div>
          <Card>
            <CardHeader title="Chọn cách luyện tập" description="Mỗi cách rèn một kỹ năng nhớ từ khác nhau." />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {MODES.map(({ key, label, icon: Icon, description }) => (
                <button
                  key={key}
                  type="button"
                  disabled={studyWords.length === 0}
                  onClick={() => {
                    setSession(null);
                    setMode(key);
                  }}
                  className="flex items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 text-left transition-all hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-900">{label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{description}</span>
                  </span>
                </button>
              ))}
            </CardBody>
          </Card>

          {/* Danh sách từ */}
          <Card className="mt-6">
            <CardHeader title={`Danh sách từ (${words.length})`} />
            <ul className="divide-y divide-ink-100">
              {words.map((word) => {
                const status = STATUS_LABEL[word.status];
                return (
                  <li key={word._id} className="flex flex-wrap items-start gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink-900">{word.word}</span>
                        {word.pronunciation && (
                          <span className="text-xs text-ink-400">{word.pronunciation}</span>
                        )}
                        {word.wordType && (
                          <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-500">
                            {word.wordType}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-600">{word.meaning}</p>
                      {word.example && (
                        <p className="mt-1 text-xs text-ink-400 italic">{word.example}</p>
                      )}
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Tổng quan */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-600">Đã nhớ</span>
                  <span className="font-semibold text-brand-700">{Math.round(percent)}%</span>
                </div>
                <ProgressBar value={percent} tone={percent >= 100 ? 'success' : 'brand'} />
                <p className="mt-2 text-xs text-ink-500">
                  {summary.memorized}/{summary.total} từ đã thuộc
                </p>
              </div>

              <dl className="space-y-2 border-t border-ink-100 pt-4 text-sm">
                {[
                  { label: 'Cần ôn tập hôm nay', value: summary.due, icon: RefreshCw, tone: 'text-amber-600' },
                  { label: 'Đang học', value: summary.learning, icon: Layers, tone: 'text-sky-600' },
                  { label: 'Đã nhớ', value: summary.memorized, icon: CheckCircle2, tone: 'text-emerald-600' },
                ].map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="inline-flex items-center gap-1.5 text-ink-500">
                      <Icon className={`h-4 w-4 ${tone}`} />
                      {label}
                    </dt>
                    <dd className="font-semibold text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-200 bg-ink-50 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  checked={onlyDue}
                  onChange={(e) => setOnlyDue(e.target.checked)}
                />
                <span>
                  <span className="block text-sm font-medium text-ink-800">Chỉ học từ đến hạn</span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    Đang có {studyWords.length} từ trong phiên học
                  </span>
                </span>
              </label>

              {studyWords.length === 0 && (
                <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-700">
                  Bạn đã ôn hết từ đến hạn hôm nay. Quay lại sau nhé!
                </p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
