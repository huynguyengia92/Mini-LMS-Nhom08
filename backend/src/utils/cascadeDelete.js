/**
 * Xóa dây chuyền các bản ghi phụ thuộc.
 * MongoDB không có khóa ngoại nên phải tự dọn, nếu không sẽ còn lại bản ghi mồ côi
 * (tiến độ của bài giảng đã xóa, lượt làm bài của đề đã xóa...).
 */
const Lecture = require('../models/Lecture');
const LectureProgress = require('../models/LectureProgress');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuestionGroup = require('../models/QuestionGroup');
const Choice = require('../models/Choice');
const QuizAttempt = require('../models/QuizAttempt');
const Answer = require('../models/Answer');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');

/** Xóa bài giảng kèm tiến độ học viên đã ghi nhận cho những bài đó. */
async function deleteLectures(lectureIds) {
  if (!lectureIds.length) return;
  await LectureProgress.deleteMany({ lecture: { $in: lectureIds } });
  await Lecture.deleteMany({ _id: { $in: lectureIds } });
}

/** Xóa đề kiểm tra kèm câu hỏi, phương án, nhóm câu hỏi và toàn bộ lượt làm bài. */
async function deleteQuizzes(quizIds) {
  if (!quizIds.length) return;
  const questions = await Question.find({ quiz: { $in: quizIds } }).select('_id');
  const attempts = await QuizAttempt.find({ quiz: { $in: quizIds } }).select('_id');

  await Answer.deleteMany({ attempt: { $in: attempts.map((a) => a._id) } });
  await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
  await Choice.deleteMany({ question: { $in: questions.map((q) => q._id) } });
  await Question.deleteMany({ quiz: { $in: quizIds } });
  await QuestionGroup.deleteMany({ quiz: { $in: quizIds } });
  await Quiz.deleteMany({ _id: { $in: quizIds } });
}

/**
 * Xóa toàn bộ dữ liệu thuộc về một khóa học (F.2.6). Không xóa bản ghi Course.
 * Thông báo không lưu id khóa học nên dọn theo đường dẫn mà Observer đã ghi.
 */
async function deleteCourseContent(courseId, courseSlug) {
  const lectures = await Lecture.find({ course: courseId }).select('_id');
  const quizzes = await Quiz.find({ course: courseId }).select('_id');

  await deleteLectures(lectures.map((l) => l._id));
  await deleteQuizzes(quizzes.map((q) => q._id));
  await Enrollment.deleteMany({ course: courseId });
  if (courseSlug) await Notification.deleteMany({ url: `/courses/${courseSlug}` });
}

module.exports = { deleteLectures, deleteQuizzes, deleteCourseContent };
