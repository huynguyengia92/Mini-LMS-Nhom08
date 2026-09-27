const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Choice = require('../models/Choice');
const QuizAttempt = require('../models/QuizAttempt');
const Answer = require('../models/Answer');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuestionGroup = require('../models/QuestionGroup');
const QuestionFactory = require('../patterns/factory/questionFactory');
const cascade = require('../utils/cascadeDelete');
const { getAttemptService, QuizSubmissionError } = require('../patterns/templateMethod/quizAttemptService');
const { courseSubject } = require('../patterns/observer/courseSubject');
const { PART_MAP, FULL_TEST_MINUTES, proficiencyOf } = require('../domain/toeic');

// UC6 — Giảng viên tạo bài kiểm tra
async function createQuiz(req, res) {
  const course = await Course.findOne({ slug: req.params.slug, instructor: req.user._id });
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học của bạn.' });

  const { title, description, timeLimitMinutes, dueDate } = req.body;
  const quiz = await Quiz.create({
    course: course._id, title, description, timeLimitMinutes: timeLimitMinutes || null,
    dueDate: dueDate || null, createdBy: req.user._id,
  });

  if (quiz.dueDate) {
    await courseSubject.notify('QUIZ_DUE', {
      courseId: course._id,
      message: `Bài kiểm tra mới "${quiz.title}" — hạn nộp ${quiz.dueDate.toLocaleString('vi-VN')}`,
      url: `/courses/${course.slug}`,
    });
  }
  res.status(201).json({ quiz });
}

async function deleteQuiz(req, res) {
  const quiz = await Quiz.findById(req.params.id).populate('course');
  if (!quiz || quiz.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra.' });
  }
  await cascade.deleteQuizzes([quiz._id]);
  res.json({ message: 'Đã xóa bài kiểm tra.' });
}

async function getQuizForManage(req, res) {
  const quiz = await Quiz.findById(req.params.id).populate('course');
  if (!quiz || quiz.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra.' });
  }
  const questions = await Question.find({ quiz: quiz._id }).sort('order');
  const questionsWithChoices = await Promise.all(
    questions.map(async (q) => ({ ...q.toObject(), choices: await Choice.find({ question: q._id }) })),
  );
  res.json({ quiz, questions: questionsWithChoices });
}

// UC6 — Thêm câu hỏi (Factory Method)
async function addQuestion(req, res) {
  const quiz = await Quiz.findById(req.params.id).populate('course');
  if (!quiz || quiz.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra.' });
  }

  const { questionType, text, points, choices, correctAnswer } = req.body;
  const order = (await Question.countDocuments({ quiz: quiz._id })) + 1;

  if (questionType === 'MCQ') {
    if (!Array.isArray(choices) || choices.filter((c) => c.text).length < 2) {
      return res.status(400).json({ message: 'Câu trắc nghiệm cần ít nhất 2 lựa chọn.' });
    }
    if (!choices.some((c) => c.isCorrect)) {
      return res.status(400).json({ message: 'Vui lòng chọn lựa chọn đúng.' });
    }
  }

  const question = await QuestionFactory.createQuestion(questionType, {
    quiz: quiz._id, text, order, points: points || 1, choices, correctAnswer,
  });
  res.status(201).json({ question });
}

async function deleteQuestion(req, res) {
  const question = await Question.findById(req.params.id).populate({ path: 'quiz', populate: 'course' });
  if (!question || question.quiz.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
  }
  await Choice.deleteMany({ question: question._id });
  await question.deleteOne();
  res.json({ message: 'Đã xóa câu hỏi.' });
}

// UC4 — Học viên làm bài kiểm tra
async function startAttempt(req, res) {
  const quiz = await Quiz.findById(req.params.id).populate('course');
  if (!quiz) return res.status(404).json({ message: 'Không tìm thấy bài kiểm tra.' });

  const enrolled = await Enrollment.findOne({ student: req.user._id, course: quiz.course._id });
  if (!enrolled) return res.status(403).json({ message: 'Bạn cần đăng ký khóa học trước khi làm bài kiểm tra.' });

  // Chế độ làm bài: FULL (trọn đề) hoặc PART (luyện các part đã chọn, tự chọn thời gian).
  const isToeic = quiz.examType === 'TOEIC_TEST';
  const mode = isToeic && req.body.mode === 'PART' ? 'PART' : 'FULL';
  const selectedParts = mode === 'PART'
    ? (req.body.parts ?? []).map(Number).filter((p) => p >= 1 && p <= 7)
    : [];

  if (mode === 'PART' && selectedParts.length === 0) {
    return res.status(400).json({ message: 'Vui lòng chọn ít nhất một phần thi để luyện tập.' });
  }

  let attempt = await QuizAttempt.findOne({ quiz: quiz._id, student: req.user._id, submittedAt: null });
  if (attempt) {
    // Lượt làm dở với cấu hình khác thì bỏ, tạo lượt mới đúng lựa chọn hiện tại.
    const sameConfig = attempt.mode === mode
      && attempt.selectedParts.join(',') === selectedParts.join(',');
    if (!sameConfig) {
      await Answer.deleteMany({ attempt: attempt._id });
      await attempt.deleteOne();
      attempt = null;
    }
  }

  if (!attempt) {
    attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      mode,
      selectedParts,
      timeLimitMinutes: mode === 'PART'
        ? (Number(req.body.timeLimitMinutes) || null)
        : (isToeic ? FULL_TEST_MINUTES : quiz.timeLimitMinutes),
    });
  }
  res.json({ attemptId: attempt._id });
}

async function getAttempt(req, res) {
  const attempt = await QuizAttempt.findOne({ _id: req.params.id, student: req.user._id }).populate('quiz');
  if (!attempt) return res.status(404).json({ message: 'Không tìm thấy lượt làm bài.' });
  if (attempt.submittedAt) return res.json({ attempt, submitted: true });

  const filter = { quiz: attempt.quiz._id };
  if (attempt.mode === 'PART' && attempt.selectedParts.length) {
    filter.part = { $in: attempt.selectedParts };
  }

  const questions = await Question.find(filter).sort('order');
  // Sắp theo _id để thứ tự lựa chọn khớp đúng thứ tự A-B-C-D được đọc trong audio.
  const choices = await Choice.find({ question: { $in: questions.map((q) => q._id) } }).sort('_id');

  // Part 1 và Part 2 trong đề thật chỉ NGHE các phương án, không in ra giấy.
  const listenOnly = new Set(questions.filter((q) => q.part === 1 || q.part === 2).map((q) => String(q._id)));

  const choiceMap = new Map();
  for (const choice of choices) {
    const key = String(choice.question);
    if (!choiceMap.has(key)) choiceMap.set(key, []);
    // Không gửi kèm isCorrect; với Part 1/2 cũng không gửi nội dung phương án.
    choiceMap.get(key).push({ _id: choice._id, text: listenOnly.has(key) ? null : choice.text });
  }

  // Ngữ liệu dùng chung (đoạn văn Part 6/7, audio Part 3/4) trả kèm để client hiển thị.
  const groups = await QuestionGroup.find({
    _id: { $in: questions.map((q) => q.group).filter(Boolean) },
  }).sort('order');

  const questionsWithChoices = questions.map((q) => ({
    ...q.toObject(),
    choices: choiceMap.get(String(q._id)) ?? [],
  }));

  res.json({ attempt, questions: questionsWithChoices, groups, submitted: false });
}

async function submitAttempt(req, res) {
  const attempt = await QuizAttempt.findOne({ _id: req.params.id, student: req.user._id }).populate('quiz');
  if (!attempt) return res.status(404).json({ message: 'Không tìm thấy lượt làm bài.' });
  if (attempt.submittedAt) return res.status(400).json({ message: 'Bài đã được nộp trước đó.' });

  const service = getAttemptService(attempt.quiz, attempt);
  try {
    await service.submit(attempt, attempt.quiz, req.body.answers || {});
  } catch (err) {
    if (err instanceof QuizSubmissionError) return res.status(400).json({ message: err.message });
    throw err;
  }
  res.json({ attempt });
}

async function getResult(req, res) {
  const attempt = await QuizAttempt.findOne({ _id: req.params.id, student: req.user._id })
    .populate({ path: 'quiz', populate: 'course' });
  if (!attempt || !attempt.submittedAt) return res.status(404).json({ message: 'Chưa có kết quả.' });

  const answers = await Answer.find({ attempt: attempt._id }).populate('question selectedChoice');

  // Kèm đáp án đúng để học viên xem lại bài và biết mình sai ở đâu.
  const correctChoices = await Choice.find({
    question: { $in: answers.map((a) => a.question._id) },
    isCorrect: true,
  });
  const correctMap = new Map(correctChoices.map((c) => [String(c.question), c]));

  const reviewed = answers
    .map((a) => ({ ...a.toObject(), correctChoice: correctMap.get(String(a.question._id)) ?? null }))
    .sort((a, b) => (a.question.order ?? 0) - (b.question.order ?? 0));

  // Ngữ liệu dùng chung để hiển thị lại đoạn văn/audio khi xem đáp án.
  const groups = await QuestionGroup.find({
    _id: { $in: reviewed.map((a) => a.question.group).filter(Boolean) },
  }).sort('order');

  const isToeic = attempt.quiz.examType === 'TOEIC_TEST';
  let breakdown = null;

  if (isToeic) {
    // Thống kê đúng/sai theo từng part và theo dạng bài (tag) để học viên biết điểm yếu.
    const byPart = new Map();
    const byTag = new Map();

    for (const answer of reviewed) {
      const part = answer.question.part;
      if (part) {
        if (!byPart.has(part)) byPart.set(part, { part, total: 0, correct: 0 });
        const entry = byPart.get(part);
        entry.total += 1;
        if (answer.isCorrect) entry.correct += 1;
      }
      for (const tag of answer.question.tags ?? []) {
        if (!byTag.has(tag)) byTag.set(tag, { tag, total: 0, correct: 0 });
        const entry = byTag.get(tag);
        entry.total += 1;
        if (answer.isCorrect) entry.correct += 1;
      }
    }

    breakdown = {
      // Đề dưới 200 câu thì điểm quy đổi chỉ là ước lượng — giao diện phải nói rõ.
      estimated: reviewed.length < 200,
      byPart: [...byPart.values()]
        .sort((a, b) => a.part - b.part)
        .map((e) => ({ ...e, name: PART_MAP.get(e.part)?.name ?? `Part ${e.part}`, skill: PART_MAP.get(e.part)?.skill })),
      byTag: [...byTag.values()].sort((a, b) => a.correct / a.total - b.correct / b.total),
      proficiency: attempt.totalScore != null ? proficiencyOf(attempt.totalScore) : null,
    };
  }

  res.json({ attempt, answers: reviewed, groups, breakdown });
}

/** Danh sách đề TOEIC công khai — thư viện đề thi. */
async function listToeicTests(req, res) {
  const quizzes = await Quiz.find({ examType: 'TOEIC_TEST' })
    .populate({ path: 'course', select: 'title slug isPublished' })
    .sort('-createdAt');

  const counts = await Question.aggregate([
    { $match: { quiz: { $in: quizzes.map((q) => q._id) } } },
    { $group: { _id: { quiz: '$quiz', part: '$part' }, n: { $sum: 1 } } },
  ]);

  const statsByQuiz = new Map();
  for (const row of counts) {
    const key = String(row._id.quiz);
    if (!statsByQuiz.has(key)) statsByQuiz.set(key, { total: 0, parts: new Set() });
    const entry = statsByQuiz.get(key);
    entry.total += row.n;
    if (row._id.part) entry.parts.add(row._id.part);
  }

  // Số lượt đã luyện của chính học viên đang đăng nhập.
  let attemptsByQuiz = new Map();
  if (req.user) {
    const attempts = await QuizAttempt.find({ student: req.user._id, submittedAt: { $ne: null } })
      .select('quiz totalScore score submittedAt')
      .sort('-submittedAt');
    for (const a of attempts) {
      const key = String(a.quiz);
      if (!attemptsByQuiz.has(key)) attemptsByQuiz.set(key, []);
      attemptsByQuiz.get(key).push(a);
    }
  }

  res.json({
    tests: quizzes.map((quiz) => {
      const stats = statsByQuiz.get(String(quiz._id)) ?? { total: 0, parts: new Set() };
      const mine = attemptsByQuiz.get(String(quiz._id)) ?? [];
      return {
        ...quiz.toJSON(),
        questionCount: stats.total,
        partCount: stats.parts.size,
        availableParts: [...stats.parts].sort((a, b) => a - b),
        attemptCount: mine.length,
        bestScore: mine.reduce((best, a) => (a.totalScore != null && a.totalScore > best ? a.totalScore : best), 0) || null,
      };
    }),
  });
}

/** Chi tiết đề TOEIC: thông tin part để học viên chọn chế độ luyện tập. */
async function getToeicTest(req, res) {
  const quiz = await Quiz.findOne({ _id: req.params.id, examType: 'TOEIC_TEST' })
    .populate({ path: 'course', select: 'title slug' });
  if (!quiz) return res.status(404).json({ message: 'Không tìm thấy đề thi.' });

  const counts = await Question.aggregate([
    { $match: { quiz: quiz._id } },
    { $group: { _id: '$part', n: { $sum: 1 }, tags: { $addToSet: '$tags' } } },
    { $sort: { _id: 1 } },
  ]);

  const parts = counts.map((row) => {
    const meta = PART_MAP.get(row._id) ?? {};
    return {
      part: row._id,
      name: meta.name ?? `Part ${row._id}`,
      skill: meta.skill,
      description: meta.description,
      needsAudio: meta.needsAudio,
      questionCount: row.n,
      tags: [...new Set(row.tags.flat())].filter(Boolean),
    };
  });

  const history = req.user
    ? await QuizAttempt.find({ quiz: quiz._id, student: req.user._id, submittedAt: { $ne: null } })
      .sort('-submittedAt')
      .limit(10)
    : [];

  res.json({
    quiz,
    parts,
    totalQuestions: parts.reduce((s, p) => s + p.questionCount, 0),
    fullTestMinutes: FULL_TEST_MINUTES,
    history,
  });
}

module.exports = {
  createQuiz, deleteQuiz, getQuizForManage, addQuestion, deleteQuestion,
  startAttempt, getAttempt, submitAttempt, getResult,
  listToeicTests, getToeicTest,
};
