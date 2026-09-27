import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlarmClock,
  Award,
  CheckCircle2,
  Clock,
  Headphones,
  Info,
  ListChecks,
  Play,
  Timer,
} from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Alert, ErrorState, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const TIME_OPTIONS = [
  { value: '', label: 'Không giới hạn' },
  { value: 10, label: '10 phút' },
  { value: 20, label: '20 phút' },
  { value: 30, label: '30 phút' },
  { value: 45, label: '45 phút' },
];

export default function ToeicTestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('practice');
  const [selectedParts, setSelectedParts] = useState([]);
  const [timeLimit, setTimeLimit] = useState('');
  const [starting, setStarting] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    api
      .get(`/quizzes/toeic/tests/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePart(part) {
    setSelectedParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part].sort((a, b) => a - b),
    );
  }

  async function start(mode) {
    setStarting(true);
    try {
      const body =
        mode === 'PART'
          ? { mode: 'PART', parts: selectedParts, timeLimitMinutes: timeLimit || null }
          : { mode: 'FULL' };
      const res = await api.post(`/quizzes/${id}/start`, body);
      navigate(`/attempts/${res.data.attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không thể bắt đầu làm bài.');
      setStarting(false);
    }
  }

  if (loading) return <PageLoader label="Đang tải đề thi..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { quiz, parts, totalQuestions, fullTestMinutes, history } = data;
  const selectedCount = parts
    .filter((p) => selectedParts.includes(p.part))
    .reduce((sum, p) => sum + p.questionCount, 0);

  return (
    <div>
      <PageHeader
        title={quiz.title}
        description={quiz.description}
        breadcrumbs={[{ label: 'Thư viện đề thi', to: '/toeic' }, { label: quiz.title }]}
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-4 w-4 text-ink-400" />
          {totalQuestions} câu hỏi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-ink-400" />
          {fullTestMinutes} phút (full test)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-4 w-4 text-ink-400" />
          {parts.length} phần thi
        </span>
        <Link to={`/courses/${quiz.course?.slug}`} className="text-brand-600 hover:text-brand-800">
          Thuộc khóa: {quiz.course?.title}
        </Link>
      </div>

      {/* Tabs chọn chế độ */}
      <div className="mb-5 inline-flex rounded-xl border border-ink-200 bg-white p-1 shadow-sm">
        {[
          { key: 'practice', label: 'Luyện tập từng phần', icon: Timer },
          { key: 'full', label: 'Làm full test', icon: AlarmClock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === key ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-600 hover:bg-ink-100',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div>
          {tab === 'practice' ? (
            <Card>
              <CardHeader
                title="Chọn phần thi muốn luyện"
                description="Luyện từng phần giúp bạn tập trung vào dạng bài còn yếu thay vì chịu áp lực thời gian của cả đề."
              />
              <CardBody className="space-y-3">
                {parts.map((part) => {
                  const active = selectedParts.includes(part.part);
                  return (
                    <button
                      key={part.part}
                      type="button"
                      onClick={() => togglePart(part.part)}
                      className={[
                        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                          : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                          active ? 'border-brand-600 bg-brand-600' : 'border-ink-300 bg-white',
                        ].join(' ')}
                      >
                        {active && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-ink-900">{part.name}</span>
                          <Badge tone={part.skill === 'LISTENING' ? 'info' : 'neutral'}>
                            {part.skill === 'LISTENING' ? 'Listening' : 'Reading'}
                          </Badge>
                          <span className="text-xs text-ink-500">{part.questionCount} câu</span>
                          {part.needsAudio && (
                            <Headphones className="h-3.5 w-3.5 text-ink-400" title="Phần thi có audio" />
                          )}
                        </span>
                        <span className="mt-1 block text-sm text-ink-500">{part.description}</span>
                        {part.tags.length > 0 && (
                          <span className="mt-2 flex flex-wrap gap-1.5">
                            {part.tags.slice(0, 6).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-ink-500 ring-1 ring-ink-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title="Làm trọn đề"
                description="Chế độ mô phỏng bài thi thật — đây cũng là chế độ duy nhất được quy đổi sang thang điểm 990."
              />
              <CardBody className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Thời gian', value: `${fullTestMinutes} phút`, icon: Clock },
                    { label: 'Số câu', value: totalQuestions, icon: ListChecks },
                    { label: 'Thang điểm', value: '10 – 990', icon: Award },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl bg-ink-50 p-4">
                      <p className="flex items-center gap-1.5 text-xs text-ink-500">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-ink-900">{value}</p>
                    </div>
                  ))}
                </div>

                {totalQuestions < 200 && (
                  <Alert tone="info" title="Đây là đề rút gọn">
                    Đề đầy đủ có 200 câu. Với đề rút gọn, điểm quy đổi 990 chỉ mang tính{' '}
                    <strong>ước lượng</strong> dựa trên tỉ lệ câu đúng của từng kỹ năng.
                  </Alert>
                )}

                <ul className="space-y-2 text-sm text-ink-600">
                  {[
                    'Bài sẽ tự động nộp khi hết thời gian.',
                    'Không thể tạm dừng giữa chừng — hãy chuẩn bị sẵn tai nghe và không gian yên tĩnh.',
                    'Sau khi nộp, bạn xem được điểm từng kỹ năng và thống kê đúng/sai theo dạng bài.',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Lịch sử làm bài */}
          {history.length > 0 && (
            <Card className="mt-6">
              <CardHeader title="Lịch sử làm bài của bạn" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 text-left">
                    <tr>
                      <th className="px-5 py-2.5 font-semibold text-ink-600">Ngày làm</th>
                      <th className="px-5 py-2.5 font-semibold text-ink-600">Chế độ</th>
                      <th className="px-5 py-2.5 font-semibold text-ink-600">Độ chính xác</th>
                      <th className="px-5 py-2.5 text-right font-semibold text-ink-600">Điểm quy đổi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {history.map((attempt) => (
                      <tr key={attempt._id}>
                        <td className="px-5 py-3">
                          <Link
                            to={`/attempts/${attempt._id}/result`}
                            className="text-brand-600 hover:text-brand-800"
                          >
                            {new Date(attempt.submittedAt).toLocaleString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          {attempt.mode === 'FULL' ? (
                            <Badge tone="brand">Full test</Badge>
                          ) : (
                            <Badge tone="neutral">Part {attempt.selectedParts.join(', ')}</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-ink-700">{attempt.score}%</td>
                        <td className="px-5 py-3 text-right font-semibold text-ink-900">
                          {attempt.totalScore != null ? attempt.totalScore : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Panel bắt đầu */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody className="space-y-4">
              {tab === 'practice' ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-ink-700">Phần thi đã chọn</p>
                    <p className="mt-1 text-2xl font-bold text-ink-900">
                      {selectedParts.length}
                      <span className="text-base font-medium text-ink-400"> phần · {selectedCount} câu</span>
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-700">Giới hạn thời gian</p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setTimeLimit(opt.value)}
                          className={[
                            'rounded-lg border px-2 py-2 text-xs font-medium transition-colors',
                            timeLimit === opt.value
                              ? 'border-brand-500 bg-brand-50 text-brand-800'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                          ].join(' ')}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    loading={starting}
                    disabled={selectedParts.length === 0}
                    onClick={() => start('PART')}
                  >
                    <Play className="h-4 w-4" />
                    Bắt đầu luyện tập
                  </Button>
                  {selectedParts.length === 0 && (
                    <p className="text-center text-xs text-ink-400">Hãy chọn ít nhất một phần thi.</p>
                  )}
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-brand-50 p-4 text-center">
                    <p className="text-sm text-brand-700">Thời gian làm bài</p>
                    <p className="mt-1 text-3xl font-bold text-brand-900">{fullTestMinutes}</p>
                    <p className="text-sm text-brand-700">phút</p>
                  </div>
                  <Button className="w-full" size="lg" loading={starting} onClick={() => start('FULL')}>
                    <Play className="h-4 w-4" />
                    Bắt đầu làm full test
                  </Button>
                  <p className="text-center text-xs text-ink-400">
                    Đồng hồ bắt đầu chạy ngay khi bạn bấm nút.
                  </p>
                </>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
