const Lecture = require('../models/Lecture');
const LectureProgress = require('../models/LectureProgress');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// UC3 — Đánh dấu hoàn thành bài giảng
async function markLectureComplete(req, res) {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Không tìm thấy bài giảng.' });

  await LectureProgress.findOneAndUpdate(
    { student: req.user._id, lecture: lecture._id },
    { isCompleted: true, completedAt: new Date() },
    { upsert: true },
  );
  res.json({ message: 'Đã đánh dấu hoàn thành bài giảng.' });
}

async function courseProgress(studentId, courseId) {
  const lectures = await Lecture.find({ course: courseId });
  const totalLectures = lectures.length;
  const completedLectures = await LectureProgress.countDocuments({
    student: studentId,
    lecture: { $in: lectures.map((l) => l._id) },
    isCompleted: true,
  });
  const percent = totalLectures ? Math.round((completedLectures / totalLectures) * 100) : 0;

  const quizzes = await Quiz.find({ course: courseId });
  const quizResults = await Promise.all(
    quizzes.map(async (quiz) => {
      const best = await QuizAttempt.findOne({ quiz: quiz._id, student: studentId, submittedAt: { $ne: null } })
        .sort('-score');
      return { quiz, bestAttempt: best };
    }),
  );

  return { totalLectures, completedLectures, percent, quizResults };
}

/**
 * Lịch sử điểm quy đổi của các lượt làm trọn đề TOEIC, xếp theo thời gian nộp —
 * dùng để vẽ biểu đồ tiến bộ. Lượt luyện theo part không có điểm quy đổi nên bị bỏ qua.
 */
async function toeicScoreHistory(studentId) {
  const attempts = await QuizAttempt.find({
    student: studentId,
    submittedAt: { $ne: null },
    totalScore: { $ne: null },
  })
    .populate({ path: 'quiz', select: 'title' })
    .sort('submittedAt')
    .select('quiz submittedAt totalScore listeningScore readingScore');

  return attempts
    .filter((a) => a.quiz)
    .map((a) => ({
      _id: a._id,
      quizTitle: a.quiz.title,
      submittedAt: a.submittedAt,
      totalScore: a.totalScore,
      listeningScore: a.listeningScore,
      readingScore: a.readingScore,
    }));
}

// UC7 — Theo dõi tiến độ học tập
async function progressOverview(req, res) {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
  const overview = await Promise.all(
    enrollments.map(async (e) => ({ course: e.course, ...(await courseProgress(req.user._id, e.course._id)) })),
  );
  res.json({ overview, toeicHistory: await toeicScoreHistory(req.user._id) });
}

module.exports = { markLectureComplete, progressOverview, courseProgress };
