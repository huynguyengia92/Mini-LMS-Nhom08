import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, CircleHelp, ListChecks, Plus, ToggleLeft, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { FormField, Input, Textarea } from '../components/ui/Field';
import { Alert, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const EMPTY_FORM = {
  questionType: 'MCQ',
  text: '',
  points: 1,
  choiceTexts: ['', '', '', ''],
  correctIndex: 0,
  correctAnswerTF: 'true',
};

const TYPES = [
  { value: 'MCQ', label: 'Trắc nghiệm', icon: ListChecks },
  { value: 'TF', label: 'Đúng / Sai', icon: ToggleLeft },
];

export default function QuizManagePage() {
  const { id } = useParams();
  const toast = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .get(`/quizzes/${id}/manage`)
      .then((res) => {
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions);
      })
      .catch(() => setQuiz(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function setChoiceText(index, value) {
    const choiceTexts = [...form.choiceTexts];
    choiceTexts[index] = value;
    setForm({ ...form, choiceTexts });
  }

  async function handleAddQuestion(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload =
        form.questionType === 'MCQ'
          ? {
              questionType: 'MCQ',
              text: form.text,
              points: Number(form.points) || 1,
              choices: form.choiceTexts
                .map((text, i) => ({ text: text.trim(), isCorrect: i === Number(form.correctIndex) }))
                .filter((c) => c.text),
            }
          : {
              questionType: 'TF',
              text: form.text,
              points: Number(form.points) || 1,
              correctAnswer: form.correctAnswerTF === 'true',
            };

      await api.post(`/quizzes/${id}/questions`, payload);
      toast.success('Đã thêm câu hỏi vào đề.');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Thêm câu hỏi thất bại.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/quizzes/questions/${target._id}`);
      toast.success('Đã xóa câu hỏi.');
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xóa câu hỏi thất bại.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!quiz) return null;

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div>
      <PageHeader
        title={quiz.title}
        description="Thêm câu hỏi trắc nghiệm hoặc đúng/sai cho đề kiểm tra này."
        breadcrumbs={[
          { label: 'Quản lý khóa học', to: '/instructor/courses' },
          { label: quiz.course?.title, to: `/instructor/courses/${quiz.course?.slug}/manage` },
          { label: 'Soạn đề' },
        ]}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone="brand">{questions.length} câu hỏi</Badge>
        <Badge tone="neutral">Tổng {totalPoints} điểm</Badge>
        {quiz.timeLimitMinutes && <Badge tone="info">{quiz.timeLimitMinutes} phút</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        {/* Danh sách câu hỏi */}
        <div>
          <Card>
            <CardHeader title="Câu hỏi trong đề" description="Đáp án đúng được tô màu xanh" />
            {questions.length === 0 ? (
              <CardBody>
                <div className="py-10 text-center">
                  <CircleHelp className="mx-auto h-9 w-9 text-ink-300" />
                  <p className="mt-3 text-sm font-medium text-ink-700">Đề thi chưa có câu hỏi</p>
                  <p className="mt-1 text-sm text-ink-500">
                    Dùng biểu mẫu bên cạnh để thêm câu hỏi đầu tiên.
                  </p>
                </div>
              </CardBody>
            ) : (
              <ul className="divide-y divide-ink-100">
                {questions.map((question, index) => (
                  <li key={question._id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="text-[15px] leading-relaxed font-semibold text-ink-900">
                            {question.text}
                          </p>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge tone="neutral">{question.points} điểm</Badge>
                            <Button
                              variant="danger-ghost"
                              size="icon"
                              title="Xóa câu hỏi"
                              onClick={() => setTarget(question)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-ink-400">
                          {question.questionType === 'MCQ' ? 'Trắc nghiệm nhiều lựa chọn' : 'Đúng / Sai'}
                        </p>

                        <ul className="mt-3 space-y-1.5">
                          {question.choices.map((choice) => (
                            <li
                              key={choice._id}
                              className={[
                                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                                choice.isCorrect
                                  ? 'border-emerald-200 bg-emerald-50 font-medium text-emerald-800'
                                  : 'border-ink-200 bg-white text-ink-600',
                              ].join(' ')}
                            >
                              {choice.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                              ) : (
                                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-ink-300" />
                              )}
                              {choice.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Form thêm câu hỏi */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Thêm câu hỏi" />
            <CardBody>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                {error && <Alert tone="danger">{error}</Alert>}

                <div>
                  <p className="mb-2 text-sm font-medium text-ink-700">Loại câu hỏi</p>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map(({ value, label, icon: Icon }) => {
                      const active = form.questionType === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm({ ...form, questionType: value })}
                          className={[
                            'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                            active
                              ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100'
                              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <FormField label="Nội dung câu hỏi" htmlFor="text" required>
                  <Textarea
                    id="text"
                    rows={3}
                    placeholder="Nhập nội dung câu hỏi..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    required
                  />
                </FormField>

                <FormField label="Điểm" htmlFor="points">
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    className="max-w-28"
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: e.target.value })}
                  />
                </FormField>

                {form.questionType === 'MCQ' ? (
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-700">
                      Lựa chọn <span className="font-normal text-ink-400">— chọn ô tròn để đánh dấu đáp án đúng</span>
                    </p>
                    <div className="space-y-2">
                      {form.choiceTexts.map((text, i) => {
                        const isCorrect = Number(form.correctIndex) === i;
                        return (
                          <div
                            key={i}
                            className={[
                              'flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-colors',
                              isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-ink-200 bg-white',
                            ].join(' ')}
                          >
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, correctIndex: i })}
                              className={[
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-ink-300 bg-white',
                              ].join(' ')}
                              aria-label={`Đánh dấu lựa chọn ${i + 1} là đáp án đúng`}
                            >
                              {isCorrect && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </button>
                            <input
                              className="w-full border-0 bg-transparent py-1.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                              placeholder={`Lựa chọn ${i + 1}`}
                              value={text}
                              onChange={(e) => setChoiceText(i, e.target.value)}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-ink-400">Cần ít nhất 2 lựa chọn có nội dung.</p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 text-sm font-medium text-ink-700">Đáp án đúng</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'true', label: 'Đúng' },
                        { value: 'false', label: 'Sai' },
                      ].map(({ value, label }) => {
                        const active = form.correctAnswerTF === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setForm({ ...form, correctAnswerTF: value })}
                            className={[
                              'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                              active
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                                : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                            ].join(' ')}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button type="submit" loading={saving} className="w-full">
                  <Plus className="h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </form>
            </CardBody>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title="Xóa câu hỏi?"
        description="Câu hỏi và toàn bộ lựa chọn của nó sẽ bị xóa khỏi đề kiểm tra."
        confirmLabel="Xóa câu hỏi"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
