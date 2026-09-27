import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Save } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { FormField, Input, Select, Textarea } from '../components/ui/Field';
import { Alert, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function CourseFormPage() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '', isPublished: true });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/courses/${slug}`)
      .then((res) => {
        const { course } = res.data;
        setForm({
          title: course.title,
          description: course.description ?? '',
          category: course.category?._id ?? '',
          isPublished: course.isPublished,
        });
      })
      .catch(() => setError('Không tải được thông tin khóa học.'))
      .finally(() => setLoading(false));
  }, [isEdit, slug]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/courses/${slug}`, form);
        toast.success('Đã cập nhật khóa học.');
      } else {
        await api.post('/courses', form);
        toast.success('Đã tạo khóa học mới.');
      }
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Lưu khóa học thất bại.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        description={
          isEdit
            ? 'Cập nhật thông tin hiển thị của khóa học với học viên.'
            : 'Điền thông tin cơ bản, bạn có thể thêm bài giảng và bài kiểm tra ngay sau đó.'
        }
        breadcrumbs={[
          { label: 'Quản lý khóa học', to: '/instructor/courses' },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="danger">{error}</Alert>}

            <FormField label="Tên khóa học" htmlFor="title" required>
              <Input
                id="title"
                placeholder="VD: Nhập môn lập trình Web với Node.js"
                value={form.title}
                onChange={set('title')}
                required
              />
            </FormField>

            <FormField
              label="Mô tả"
              htmlFor="description"
              hint="Giúp học viên hiểu khóa học dạy gì"
            >
              <Textarea
                id="description"
                rows={5}
                placeholder="Mô tả ngắn gọn nội dung, đối tượng phù hợp và kết quả đạt được sau khóa học..."
                value={form.description}
                onChange={set('description')}
              />
            </FormField>

            <FormField label="Danh mục" htmlFor="category" required>
              <Select id="category" value={form.category} onChange={set('category')} required>
                <option value="">— Chọn danh mục —</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink-800">
                    {form.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Xuất bản khóa học
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {form.isPublished
                      ? 'Học viên có thể tìm thấy và đăng ký khóa học này.'
                      : 'Khóa học ở chế độ nháp, chỉ mình bạn nhìn thấy.'}
                  </span>
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-ink-100 pt-5">
              <Button type="button" variant="outline" onClick={() => navigate('/instructor/courses')}>
                Hủy
              </Button>
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" />
                {isEdit ? 'Lưu thay đổi' : 'Tạo khóa học'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
