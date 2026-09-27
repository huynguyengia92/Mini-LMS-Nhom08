import { useCallback, useEffect, useState } from 'react';
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { EmptyState, Skeleton } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function CategoryListPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/categories/${target._id}`);
      toast.success(`Đã xóa danh mục "${target.name}".`);
      setTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Xóa danh mục thất bại.');
      setTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Danh mục khóa học"
        description="Danh mục giúp học viên lọc và tìm khóa học theo lĩnh vực."
        actions={
          <Button to="/admin/categories/new">
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Chưa có danh mục nào"
          description="Tạo danh mục đầu tiên để giảng viên có thể phân loại khóa học."
          action={
            <Button to="/admin/categories/new">
              <Plus className="h-4 w-4" />
              Thêm danh mục
            </Button>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-ink-100">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FolderTree className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{cat.name}</p>
                  <p className="mt-0.5 truncate text-sm text-ink-500">
                    {cat.description || 'Chưa có mô tả'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button to={`/admin/categories/${cat._id}/edit`} variant="ghost" size="icon" title="Sửa">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger-ghost"
                    size="icon"
                    title="Xóa"
                    onClick={() => setTarget(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title={`Xóa danh mục "${target?.name}"?`}
        description="Nếu vẫn còn khóa học thuộc danh mục này, hệ thống sẽ từ chối xóa để đảm bảo toàn vẹn dữ liệu."
        confirmLabel="Xóa danh mục"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
