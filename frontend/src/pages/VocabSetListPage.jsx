import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookMarked, Brain, CheckCircle2, Layers, RefreshCw } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';
import ProgressBar from '../components/ui/ProgressBar';

export default function VocabSetListPage() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    api
      .get('/vocab/sets')
      .then((res) => setSets(res.data.sets))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const totalWords = sets.reduce((s, x) => s + x.wordCount, 0);
  const totalMemorized = sets.reduce((s, x) => s + x.memorized, 0);
  const totalDue = sets.reduce((s, x) => s + x.due, 0);

  return (
    <div>
      <PageHeader
        title="Flashcards — Từ vựng TOEIC"
        description="Học từ theo phương pháp lặp lại ngắt quãng: từ nào hay quên sẽ xuất hiện lại sớm hơn."
      />

      {!loading && sets.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Tổng số từ', value: totalWords, icon: Layers, tone: 'bg-brand-50 text-brand-600' },
            { label: 'Đã nhớ', value: totalMemorized, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
            { label: 'Cần ôn tập', value: totalDue, icon: RefreshCw, tone: 'bg-amber-50 text-amber-600' },
          ].map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-5 shadow-card">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5.5 w-5.5" />
              </span>
              <div>
                <p className="text-2xl leading-tight font-bold text-ink-900">{value}</p>
                <p className="text-sm text-ink-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="Chưa có list từ vựng nào"
          description="Giảng viên có thể tạo list từ vựng đi kèm khóa học."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {sets.map((set) => {
            const percent = set.wordCount ? (set.memorized / set.wordCount) * 100 : 0;
            return (
              <Card key={set._id} hoverable className="flex flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/vocabulary/${set._id}`}
                        className="text-base font-semibold text-ink-900 transition-colors hover:text-brand-700"
                      >
                        {set.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink-500">{set.wordCount} từ</p>
                    </div>
                    {set.topic && <Badge tone="brand">{set.topic}</Badge>}
                  </div>

                  {set.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-500">{set.description}</p>
                  )}

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-ink-500">Đã nhớ {set.memorized}/{set.wordCount}</span>
                      <span className="font-semibold text-brand-700">{Math.round(percent)}%</span>
                    </div>
                    <ProgressBar value={percent} size="sm" tone={percent >= 100 ? 'success' : 'brand'} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {set.due > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-700">
                        <RefreshCw className="h-3 w-3" />
                        {set.due} từ cần ôn
                      </span>
                    )}
                    {set.learning > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1 font-medium text-sky-700">
                        <Brain className="h-3 w-3" />
                        {set.learning} đang học
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-5">
                    <Button to={`/vocabulary/${set._id}`} className="w-full">
                      {set.memorized > 0 ? 'Học tiếp' : 'Bắt đầu học'}
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
