import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { Textarea } from '../components/ui/Field';
import ProgressBar from '../components/ui/ProgressBar';
import { useToast } from '../components/ui/Toast';

const SPEEDS = [0.75, 1, 1.25];
const PASS = 80;

/** Hiển thị kết quả so khớp: đúng xanh, sai đỏ (kèm từ đã gõ), thiếu gạch chân, thừa gạch ngang. */
function DiffView({ tokens }) {
  return (
    <p className="text-[17px] leading-loose">
      {tokens.map((t, i) => {
        if (t.status === 'correct') {
          return <span key={i} className="text-emerald-700">{t.word} </span>;
        }
        if (t.status === 'wrong') {
          return (
            <span key={i} className="whitespace-nowrap">
              <span className="text-rose-400 line-through decoration-2">{t.typed}</span>{' '}
              <span className="rounded bg-rose-100 px-1 font-semibold text-rose-700">{t.word}</span>{' '}
            </span>
          );
        }
        if (t.status === 'missing') {
          return (
            <span key={i} className="rounded bg-amber-100 px-1 font-semibold text-amber-800 underline decoration-dotted">
              {t.word}{' '}
            </span>
          );
        }
        return (
          <span key={i} className="text-ink-400 line-through">
            {t.word}{' '}
          </span>
        );
      })}
    </p>
  );
}

export default function DictationPracticePage() {
  const { id } = useParams();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [checking, setChecking] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);

  const audioRef = useRef(null);
  const inputRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get(`/dictation/lessons/${id}`)
      .then((res) => {
        setData(res.data);
        // Mở tới câu đầu tiên chưa đạt để học viên luyện tiếp từ chỗ dở dang.
        const firstUndone = res.data.segments.findIndex((s) => (s.bestAccuracy ?? 0) < PASS);
        setIndex(firstUndone === -1 ? 0 : firstUndone);
      })
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const segment = data?.segments[index];

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.playbackRate = speed;
    audio.play().catch(() => {});
  }, [speed]);

  // Đổi câu thì reset trạng thái và tự phát câu mới.
  useEffect(() => {
    setTyped('');
    setResult(null);
    setRevealed(null);
    const timer = setTimeout(() => {
      play();
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(timer);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Phím tắt như study4: Ctrl để nghe lại câu.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Control' && !e.repeat) {
        e.preventDefault();
        play();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play]);

  async function check() {
    if (!segment || checking) return;
    setChecking(true);
    try {
      const res = await api.post(`/dictation/segments/${segment._id}/check`, { typed });
      setResult(res.data);
      setData((prev) => ({
        ...prev,
        segments: prev.segments.map((s, i) =>
          i === index ? { ...s, bestAccuracy: Math.max(s.bestAccuracy ?? 0, res.data.accuracy) } : s,
        ),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không chấm được câu này, hãy thử lại.');
    } finally {
      setChecking(false);
    }
  }

  async function reveal() {
    try {
      const res = await api.post(`/dictation/segments/${segment._id}/reveal`);
      setRevealed(res.data);
      setData((prev) => ({
        ...prev,
        segments: prev.segments.map((s, i) => (i === index ? { ...s, usedHint: true } : s)),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không tải được đáp án, hãy thử lại.');
    }
  }

  function next() {
    if (index + 1 >= data.segments.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  }

  if (loading) return <PageLoader label="Đang tải bài chép chính tả..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { lesson, segments } = data;
  const passedCount = segments.filter((s) => (s.bestAccuracy ?? 0) >= PASS).length;

  if (finished) {
    const avg = Math.round(segments.reduce((sum, s) => sum + (s.bestAccuracy ?? 0), 0) / segments.length);
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Trophy className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Hoàn thành bài chép!</h1>
        <p className="mt-2 text-ink-500">
          Độ chính xác trung bình <strong className="text-ink-900">{avg}%</strong> ·{' '}
          {passedCount}/{segments.length} câu đạt từ {PASS}%
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setFinished(false);
              setIndex(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Luyện lại
          </Button>
          <Button to="/dictation">Bài khác</Button>
        </div>
      </div>
    );
  }

  const answer = result?.transcript ?? revealed?.transcript;
  const translation = result?.translation ?? revealed?.translation;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={lesson.title}
        breadcrumbs={[{ label: 'Nghe chép chính tả', to: '/dictation' }, { label: lesson.title }]}
      />

      {/* Tiến độ các câu */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ink-700">
            Câu {index + 1}/{segments.length}
          </span>
          <span className="text-ink-500">{passedCount} câu đạt</span>
        </div>
        <div className="flex gap-1.5">
          {segments.map((s, i) => {
            const acc = s.bestAccuracy;
            const tone =
              acc == null ? 'bg-ink-200' : acc >= PASS ? 'bg-emerald-500' : 'bg-amber-400';
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setIndex(i)}
                title={`Câu ${i + 1}${acc != null ? ` — ${acc}%` : ''}${s.usedHint ? ' (đã xem đáp án)' : ''}`}
                className={`h-2 flex-1 rounded-full transition-all ${tone} ${
                  i === index ? 'ring-2 ring-brand-400 ring-offset-2' : ''
                }`}
              />
            );
          })}
        </div>
      </div>

      <Card>
        <CardBody className="space-y-5">
          {/* Trình phát */}
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-ink-50 p-4">
            <audio
              ref={audioRef}
              src={segment.audioUrl}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              preload="auto"
            />
            <Button size="lg" onClick={play} className="rounded-full">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {playing ? 'Đang phát' : 'Nghe'}
            </Button>

            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-ink-400" />
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={[
                    'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    speed === s ? 'bg-brand-600 text-white' : 'bg-white text-ink-600 hover:bg-ink-100',
                  ].join(' ')}
                >
                  {s}x
                </button>
              ))}
            </div>

            <p className="ml-auto text-xs text-ink-500">
              Bấm <kbd className="rounded border border-ink-300 bg-white px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd>{' '}
              để nghe lại · câu có {segment.wordCount} từ
            </p>
          </div>

          {/* Ô gõ */}
          <div>
            <Textarea
              ref={inputRef}
              rows={3}
              value={typed}
              disabled={Boolean(result) || Boolean(revealed)}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!result && !revealed) check();
                  else next();
                }
              }}
              placeholder="Gõ lại những gì bạn nghe được... (Enter để kiểm tra)"
              className="text-base"
            />
          </div>

          {/* Kết quả */}
          {(result || revealed) && (
            <div className="space-y-3 rounded-2xl border border-ink-200 p-4">
              {result && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
                        result.accuracy >= PASS ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Chính xác {result.accuracy}% · đúng {result.correct}/{result.total} từ
                    </span>
                    <div className="flex flex-wrap gap-3 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Đúng</span>
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Sai</span>
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Thiếu</span>
                      <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-ink-300" />Thừa</span>
                    </div>
                  </div>
                  <ProgressBar value={result.accuracy} size="sm" tone={result.accuracy >= PASS ? 'success' : 'warning'} />
                  <DiffView tokens={result.tokens} />
                </>
              )}

              {!result && answer && (
                <p className="text-[17px] leading-loose text-ink-800">{answer}</p>
              )}

              {translation && (
                <p className="border-t border-ink-100 pt-3 text-sm text-ink-500">{translation}</p>
              )}
            </div>
          )}

          {/* Hành động */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
            <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              <ArrowLeft className="h-4 w-4" />
              Câu trước
            </Button>

            <div className="flex gap-2">
              {!result && !revealed ? (
                <>
                  <Button variant="outline" onClick={reveal}>
                    <Eye className="h-4 w-4" />
                    Hiện đáp án
                  </Button>
                  <Button onClick={check} loading={checking} disabled={!typed.trim()}>
                    Kiểm tra
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null);
                      setRevealed(null);
                      setTyped('');
                      play();
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Làm lại câu này
                  </Button>
                  <Button onClick={next}>
                    {index + 1 >= segments.length ? 'Hoàn thành' : 'Câu tiếp theo'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
