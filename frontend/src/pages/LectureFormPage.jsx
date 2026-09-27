import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CirclePlay, FileText, Save } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { FormField, Input, Textarea } from '../components/ui/Field';
import { Alert, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

const TYPES = [
  { value: 'VIDEO', label: 'Video bài giảng', description: 'Nhúng video từ YouTube hoặc nguồn khác', icon: CirclePlay },
  { value: 'DOCUMENT', label: 'Tài liệu', description: 'Liên kết tài liệu PDF, slide, bài đọc', icon: FileText },
];

export default function LectureFormPage() {
  const { slug, id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [courseSlug, setCourseSlug] = useState(slug ?? '');
  const [form, setForm] = useState({
    title: '',
    contentType: 'VIDEO',
    videoUrl: '',
    documentUrl: '',
    textContent: '',
    order: 1,
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/lectures/${id}`)
        .then((res) => {
          const { lecture } = res.data;
          setCourseSlug(lecture.course.slug);
          setForm({
            title: lecture.title,
            contentType: lecture.contentType,
            videoUrl: lecture.videoUrl ?? '',
            documentUrl: lecture.documentUrl ?? '',
            textContent: lecture.textContent ?? '',
            order: lecture.order,
          });
        })
        .catch(() => setError('Không tải được bài giảng.'))
        .finally(() => setLoading(false));
    } else {
      // Gợi ý thứ tự tiếp theo dựa trên số bài giảng hiện có.
      api
        .get(`/courses/${slug}`)
        .then((res) => setForm((prev) => ({ ...prev, order: (res.data.lectures?.length ?? 0) + 1 })))
        .catch(() => {});
    }
  }, [isEdit, id, slug]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 1 };
      if (isEdit) {
        await api.put(`/lectures/${id}`, payload);
        toast.success('Đã cập nhật bài giảng.');
      } else {
        await api.post(`/courses/${slug}/lectures`, payload);
        toast.success('Đã thêm bài giảng — học viên đã đăng ký sẽ nhận được thông báo.');
      }
      navigate(`/instructor/courses/${courseSlug}/manage`);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Lưu bài giảng thất bại.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa bài giảng' : 'Thêm bài giảng'}
        description={
          isEdit
            ? 'Cập nhật nội dung bài giảng của khóa học.'
            : 'Khi thêm bài giảng mới, học viên đã đăng ký sẽ tự động nhận thông báo.'
        }
        breadcrumbs={[
          { label: 'Quản lý khóa học', to: '/instructor/courses' },
          { label: 'Nội dung khóa học', to: `/instructor/courses/${courseSlug}/manage` },
          { label: isEdit ? 'Chỉnh sửa bài giảng' : 'Bài giảng mới' },
        ]}
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="danger">{error}</Alert>}

            <FormField label="Tiêu đề bài giảng" htmlFor="title" required>
              <Input
                id="title"
                placeholder="VD: Giới thiệu về Express Router"
                value={form.title}
                onChange={set('title')}
                required
              />
            </FormField>

            <div>
              <p className="mb-2 text-sm font-medium text-ink-700">Loại nội dung</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPES.map(({ value, label, description, icon: Icon }) => {
                  const active = form.contentType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, contentType: value })}
                      className={[
                        'rounded-xl border p-4 text-left transition-all',
                        active
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                          : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50',
                      ].join(' ')}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-ink-400'}`} />
                      <p className={`mt-2 text-sm font-semibold ${active ? 'text-brand-800' : 'text-ink-800'}`}>
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {form.contentType === 'VIDEO' ? (
              <FormField
                label="Link video nhúng"
                htmlFor="videoUrl"
                hint="Dùng link dạng /embed/ của YouTube"
              >
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={form.videoUrl}
                  onChange={set('videoUrl')}
                />
              </FormField>
            ) : (
              <FormField label="Link tài liệu" htmlFor="documentUrl">
                <Input
                  id="documentUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={form.documentUrl}
                  onChange={set('documentUrl')}
                />
              </FormField>
            )}

            <FormField
              label="Nội dung / ghi chú"
              htmlFor="textContent"
              hint="Hiển thị bên dưới video hoặc tài liệu"
            >
              <Textarea
                id="textContent"
                rows={6}
                placeholder="Tóm tắt nội dung bài giảng, các điểm chính cần ghi nhớ..."
                value={form.textContent}
                onChange={set('textContent')}
              />
            </FormField>

            <FormField label="Thứ tự hiển thị" htmlFor="order" hint="Số nhỏ hiển thị trước">
              <Input
                id="order"
                type="number"
                min="1"
                className="max-w-32"
                value={form.order}
                onChange={set('order')}
              />
            </FormField>

            <div className="flex justify-end gap-2 border-t border-ink-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/instructor/courses/${courseSlug}/manage`)}
              >
                Hủy
              </Button>
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" />
                {isEdit ? 'Lưu thay đổi' : 'Thêm bài giảng'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
