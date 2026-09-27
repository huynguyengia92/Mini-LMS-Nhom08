import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { FormField, Input, Textarea } from '../components/ui/Field';
import { Alert, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api
      .get('/categories')
      .then((res) => {
        const found = res.data.categories.find((c) => c._id === id);
        if (found) setForm({ name: found.name, description: found.description ?? '' });
        else setError('Không tìm thấy danh mục.');
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Không tải được danh mục.'))
      .finally(() => setLoading(false));
  }, [isEdit, id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, form);
        toast.success('Đã cập nhật danh mục.');
      } else {
        await api.post('/categories', form);
        toast.success('Đã thêm danh mục mới.');
      }
      navigate('/admin/categories');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Lưu danh mục thất bại.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        breadcrumbs={[
          { label: 'Danh mục khóa học', to: '/admin/categories' },
          { label: isEdit ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
      />

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert tone="danger">{error}</Alert>}

            <FormField label="Tên danh mục" htmlFor="name" required>
              <Input
                id="name"
                placeholder="VD: Lập trình Web"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Mô tả" htmlFor="description">
              <Textarea
                id="description"
                rows={3}
                placeholder="Mô tả ngắn về lĩnh vực của danh mục này..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormField>

            <div className="flex justify-end gap-2 border-t border-ink-100 pt-5">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/categories')}>
                Hủy
              </Button>
              <Button type="submit" loading={saving}>
                <Save className="h-4 w-4" />
                {isEdit ? 'Lưu thay đổi' : 'Thêm danh mục'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
