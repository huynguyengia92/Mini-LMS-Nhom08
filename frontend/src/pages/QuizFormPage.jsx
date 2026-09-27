import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BellRing } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { FormField, Input, Textarea } from '../components/ui/Field';
import { Alert } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function QuizFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ title: '', description: '', timeLimitMinutes: '', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post(`/courses/${slug}/quizzes`, {
        title: form.title,
        description: form.description,
        timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : null,
        dueDate: form.dueDate || null,
      });
      toast.success('Đã tạo bài kiểm tra. Tiếp tục thêm câu hỏi.');
      navigate(`/instructor/quizzes/${res.data.quiz._id}/manage`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Tạo bài kiểm tra thất bại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Tạo bài kiểm tra"
        description="Thiết lập thông tin chung, sau đó thêm câu hỏi cho đề thi."
        breadcrumbs={[
          { label: 'Quản lý khóa học', to: '/instructor/courses' },
          { label: 'Nội dung khóa học', to: `/instructor/courses/${slug}/manage` },
          { label: 'Bài kiểm tra mới' },
        ]}
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="danger">{error}</Alert>}

            <FormField label="Tên bài kiểm tra" htmlFor="title" required>
              <Input
                id="title"
                placeholder="VD: Kiểm tra giữa kỳ — Chương 1"
                value={form.title}
                onChange={set('title')}
                required
              />
            </FormField>

            <FormField label="Mô tả" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                placeholder="Phạm vi kiến thức, lưu ý khi làm bài..."
                value={form.description}
                onChange={set('description')}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Thời gian làm bài"
                htmlFor="timeLimitMinutes"
                hint="Phút — để trống nếu không giới hạn"
              >
                <Input
                  id="timeLimitMinutes"
                  type="number"
                  min="1"
                  placeholder="VD: 30"
                  value={form.timeLimitMinutes}
                  onChange={set('timeLimitMinutes')}
                />
              </FormField>

              <FormField label="Hạn nộp bài" htmlFor="dueDate" hint="Không bắt buộc">
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={set('dueDate')}
                />
              </FormField>
            </div>

            {form.dueDate && (
              <Alert tone="info" title="Học viên sẽ được thông báo">
                Vì bài kiểm tra có hạn nộp, tất cả học viên đã đăng ký khóa học sẽ nhận thông báo tự động.
              </Alert>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-5">
              <p className="flex items-center gap-1.5 text-xs text-ink-500">
                <BellRing className="h-3.5 w-3.5" />
                Bước tiếp theo: thêm câu hỏi cho đề
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/instructor/courses/${slug}/manage`)}
                >
                  Hủy
                </Button>
                <Button type="submit" loading={saving}>
                  Tạo & thêm câu hỏi
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
