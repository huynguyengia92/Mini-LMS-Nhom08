/**
 * Tạo vài lượt làm đề TOEIC mẫu cho một học viên, dùng khi demo để biểu đồ tiến bộ
 * có dữ liệu. Điểm được chấm bằng đúng luồng thật (Template Method + Strategy),
 * chỉ có thời điểm nộp là lùi về quá khứ cho giống lịch sử luyện thi nhiều tuần.
 *
 * Chạy:  node src/scripts/seedDemoAttempts.js [username]   (mặc định: student1)
 * Xóa:   node src/scripts/seedDemoAttempts.js --clear [username]
 * Chỉ dùng cho môi trường phát triển.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
require('../models/Course'); // populate('course') cần model này được đăng ký trước
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Choice = require('../models/Choice');
const Answer = require('../models/Answer');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment');
const { getAttemptService } = require('../patterns/templateMethod/quizAttemptService');

// Tỉ lệ câu đúng của từng lượt và số ngày trước đây đã nộp — dựng đường tiến bộ có thật, có chững.
const RUNS = [
  { accuracy: 0.42, daysAgo: 35 },
  { accuracy: 0.55, daysAgo: 24 },
  { accuracy: 0.52, daysAgo: 16 },
  { accuracy: 0.7, daysAgo: 8 },
  { accuracy: 0.82, daysAgo: 2 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini_lms');

  const args = process.argv.slice(2);
  const clear = args.includes('--clear');
  const username = args.find((a) => !a.startsWith('--')) ?? 'student1';

  const student = await User.findOne({ username });
  if (!student) throw new Error(`Không tìm thấy học viên "${username}".`);

  const quiz = await Quiz.findOne({ examType: 'TOEIC_TEST' }).populate('course');
  if (!quiz) throw new Error('Chưa có đề TOEIC nào — chạy `npm run seed` trước.');

  if (clear) {
    const attempts = await QuizAttempt.find({ student: student._id, quiz: quiz._id });
    await Answer.deleteMany({ attempt: { $in: attempts.map((a) => a._id) } });
    await QuizAttempt.deleteMany({ _id: { $in: attempts.map((a) => a._id) } });
    console.log(`Đã xóa ${attempts.length} lượt làm bài của ${username}.`);
    process.exit(0);
  }

  await Enrollment.findOneAndUpdate(
    { student: student._id, course: quiz.course._id },
    { student: student._id, course: quiz.course._id },
    { upsert: true },
  );

  const questions = await Question.find({ quiz: quiz._id }).sort('order');
  const choicesByQuestion = new Map();
  for (const question of questions) {
    // eslint-disable-next-line no-await-in-loop
    choicesByQuestion.set(String(question._id), await Choice.find({ question: question._id }).sort('_id'));
  }

  for (const { accuracy, daysAgo } of RUNS) {
    const submittedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const startedAt = new Date(submittedAt.getTime() - 110 * 60 * 1000);

    // Bắt đầu ở hiện tại để qua được ràng buộc 120 phút của full test, lùi ngày sau khi nộp.
    // eslint-disable-next-line no-await-in-loop
    const attempt = await QuizAttempt.create({
      quiz: quiz._id, student: student._id, mode: 'FULL', startedAt: new Date(),
    });

    // Rải câu đúng đều khắp đề thay vì đúng hết phần đầu, để tỉ lệ theo part cũng hợp lý.
    const correctCount = Math.round(accuracy * questions.length);
    const answers = {};
    questions.forEach((question, index) => {
      const choices = choicesByQuestion.get(String(question._id));
      if (!choices.length) return;
      const shouldBeCorrect = Math.floor((index * correctCount) / questions.length)
        !== Math.floor(((index + 1) * correctCount) / questions.length);
      const correct = choices.find((c) => c.isCorrect);
      const wrong = choices.find((c) => !c.isCorrect) ?? correct;
      answers[String(question._id)] = String((shouldBeCorrect ? correct : wrong)._id);
    });

    const service = getAttemptService(quiz, attempt);
    // eslint-disable-next-line no-await-in-loop
    await service.submit(attempt, quiz, answers);
    // eslint-disable-next-line no-await-in-loop
    await QuizAttempt.updateOne({ _id: attempt._id }, { startedAt, submittedAt });

    console.log(`Lượt ${daysAgo} ngày trước: ${attempt.listeningScore} + ${attempt.readingScore}`
      + ` = ${attempt.totalScore} điểm (đúng ${Math.round(accuracy * 100)}%)`);
  }

  console.log(`Xong — ${RUNS.length} lượt mẫu cho "${username}".`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
