import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import api from '../api/client';
import Button from '../components/ui/Button';
import { EmptyState, PageLoader } from '../components/ui/Feedback';
import { useToast } from '../components/ui/Toast';

export default function QuizStartPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .post(`/quizzes/${id}/start`)
      .then((res) => navigate(`/attempts/${res.data.attemptId}`, { replace: true }))
      .catch((err) => {
        const message = err.response?.data?.message ?? 'Không thể bắt đầu làm bài.';
        setError(message);
        toast.error(message);
      });
  }, [id, navigate, toast]);

  if (error) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Không thể bắt đầu bài kiểm tra"
        description={error}
        action={<Button to="/courses">Về danh sách khóa học</Button>}
      />
    );
  }

  return <PageLoader label="Đang chuẩn bị bài kiểm tra..." />;
}
