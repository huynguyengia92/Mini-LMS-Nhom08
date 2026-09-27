import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { PageLoader } from './components/ui/Feedback';

// Trang chủ và trang đăng nhập tải ngay; các trang còn lại tách chunk và chỉ tải khi mở tới.
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CourseListPage = lazy(() => import('./pages/CourseListPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LecturePage = lazy(() => import('./pages/LecturePage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const InstructorCoursesPage = lazy(() => import('./pages/InstructorCoursesPage'));
const CourseFormPage = lazy(() => import('./pages/CourseFormPage'));
const CourseManagePage = lazy(() => import('./pages/CourseManagePage'));
const LectureFormPage = lazy(() => import('./pages/LectureFormPage'));
const QuizFormPage = lazy(() => import('./pages/QuizFormPage'));
const QuizManagePage = lazy(() => import('./pages/QuizManagePage'));
const QuizStartPage = lazy(() => import('./pages/QuizStartPage'));
const QuizAttemptPage = lazy(() => import('./pages/QuizAttemptPage'));
const QuizResultPage = lazy(() => import('./pages/QuizResultPage'));
const CategoryListPage = lazy(() => import('./pages/CategoryListPage'));
const CategoryFormPage = lazy(() => import('./pages/CategoryFormPage'));
const ToeicTestListPage = lazy(() => import('./pages/ToeicTestListPage'));
const ToeicTestDetailPage = lazy(() => import('./pages/ToeicTestDetailPage'));
const VocabSetListPage = lazy(() => import('./pages/VocabSetListPage'));
const VocabSetDetailPage = lazy(() => import('./pages/VocabSetDetailPage'));
const DictationListPage = lazy(() => import('./pages/DictationListPage'));
const DictationPracticePage = lazy(() => import('./pages/DictationPracticePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ShellLayout() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Trang xác thực: layout riêng, không có navbar */}
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/register"
        element={
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        }
      />

      <Route element={<ShellLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />

        {/* Luyện thi TOEIC */}
        <Route path="/toeic" element={<ToeicTestListPage />} />
        <Route path="/toeic/:id" element={<ToeicTestDetailPage />} />
        <Route path="/vocabulary" element={<VocabSetListPage />} />
        <Route path="/vocabulary/:id" element={<VocabSetDetailPage />} />
        <Route path="/dictation" element={<DictationListPage />} />
        <Route
          path="/dictation/:id"
          element={
            <ProtectedRoute>
              <DictationPracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lectures/:id"
          element={
            <ProtectedRoute>
              <LecturePage />
            </ProtectedRoute>
          }
        />

        {/* Học viên */}
        <Route
          path="/my/dashboard"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my/progress"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:id/start"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <QuizStartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempts/:id"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <QuizAttemptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attempts/:id/result"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />

        {/* Giảng viên */}
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <InstructorCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/new"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:slug/edit"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <CourseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:slug/manage"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <CourseManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:slug/lectures/new"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <LectureFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/lectures/:id/edit"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <LectureFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:slug/quizzes/new"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <QuizFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/quizzes/:id/manage"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <QuizManagePage />
            </ProtectedRoute>
          }
        />

        {/* Quản trị viên */}
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoryListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/new"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoryFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories/:id/edit"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoryFormPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
