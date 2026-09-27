import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Field';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/Feedback';

export default function CourseListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const [keyword, setKeyword] = useState(q);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/courses', { params: { q: q || undefined, category: category || undefined } })
      .then((res) => {
        setCourses(res.data.courses);
        setEnrolledIds(res.data.enrolledIds ?? []);
      })
      .catch((err) => setError(err.response?.data?.message ?? err.message))
      .finally(() => setLoading(false));
  }, [q, category]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  function updateParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  }

  function onSubmit(e) {
    e.preventDefault();
    updateParams({ q: keyword });
  }

  function clearFilters() {
    setKeyword('');
    setSearchParams(new URLSearchParams());
  }

  const hasFilters = Boolean(q || category);
  const activeCategory = categories.find((c) => c._id === category);

  return (
    <div>
      <PageHeader
        title="Khám phá khóa học"
        description="Tìm khóa học theo từ khóa hoặc danh mục, xem chi tiết và đăng ký học ngay."
      />

      {/* Thanh tìm kiếm & lọc */}
      <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-4 shadow-card">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Tìm theo tên hoặc mô tả khóa học..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="sm:w-auto">
            Tìm kiếm
          </Button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Danh mục
          </span>
          <button
            type="button"
            onClick={() => updateParams({ category: '' })}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              !category ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
            ].join(' ')}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => updateParams({ category: cat._id })}
              className={[
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                category === cat._id ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
              ].join(' ')}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Kết quả */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {loading ? (
            'Đang tìm...'
          ) : (
            <>
              Tìm thấy <span className="font-semibold text-ink-800">{courses.length}</span> khóa học
              {q && (
                <>
                  {' '}
                  cho <span className="font-semibold text-ink-800">“{q}”</span>
                </>
              )}
              {activeCategory && (
                <>
                  {' '}
                  trong <span className="font-semibold text-ink-800">{activeCategory.name}</span>
                </>
              )}
            </>
          )}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchCourses} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
              <Skeleton className="h-28 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              enrolled={user?.role === 'STUDENT' && enrolledIds.includes(course._id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Không tìm thấy khóa học phù hợp"
          description="Thử từ khóa khác hoặc bỏ bớt bộ lọc danh mục để xem thêm kết quả."
          action={
            hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
