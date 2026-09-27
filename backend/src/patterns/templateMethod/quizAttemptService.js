/**
 * Template Method pattern: submit() cố định khung xử lý nộp bài
 *   kiểm tra điều kiện -> lấy tập câu hỏi -> chấm từng câu -> tổng kết -> lưu
 * Các bước in nghiêng bên dưới là "hook" để lớp con thay đổi:
 *   - validateCanSubmit(): ràng buộc thời gian khác nhau
 *   - collectQuestions():  full test lấy cả 200 câu, luyện part chỉ lấy part đã chọn
 *   - scoringStrategy():   phần trăm / quy đổi 990 / chỉ độ chính xác
 */
const Question = require('../../models/Question');
const Choice = require('../../models/Choice');
const Answer = require('../../models/Answer');
const { getGradingStrategy } = require('../strategy/gradingStrategy');
const { getScoringStrategy } = require('../strategy/scoringStrategy');
const { FULL_TEST_MINUTES } = require('../../domain/toeic');

class QuizSubmissionError extends Error {}

class QuizAttemptService {
  /** ---- TEMPLATE METHOD: thứ tự các bước là cố định, không lớp con nào được đổi ---- */
  async submit(attempt, quiz, answersByQuestionId) {
    this.validateCanSubmit(attempt, quiz);

    const questions = await this.collectQuestions(attempt, quiz);
    const graded = [];

    for (const question of questions) {
      const choiceId = answersByQuestionId[question._id.toString()];
      // eslint-disable-next-line no-await-in-loop
      const selectedChoice = choiceId
        ? await Choice.findOne({ _id: choiceId, question: question._id })
        : null;

      const strategy = getGradingStrategy(question.questionType);
      const { isCorrect, points } = strategy.grade(question, selectedChoice);

      // eslint-disable-next-line no-await-in-loop
      await Answer.findOneAndUpdate(
        { attempt: attempt._id, question: question._id },
        { selectedChoice: selectedChoice ? selectedChoice._id : null, isCorrect, pointsAwarded: points },
        { upsert: true },
      );

      graded.push({ question, isCorrect, points });
    }

    const summary = this.scoringStrategy(quiz, attempt).summarize(graded);
    Object.assign(attempt, summary);
    attempt.submittedAt = new Date();
    await attempt.save();

    return { attempt, summary };
  }

  /** ---- Các hook cho lớp con ---- */

  // eslint-disable-next-line no-unused-vars
  validateCanSubmit(attempt, quiz) {
    throw new Error('validateCanSubmit() must be implemented by subclass');
  }

  // eslint-disable-next-line class-methods-use-this
  async collectQuestions(attempt, quiz) {
    return Question.find({ quiz: quiz._id }).sort('order');
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  scoringStrategy(quiz, attempt) {
    return getScoringStrategy({ isToeic: false, mode: 'FULL' });
  }

  /** Tiện ích dùng chung cho các lớp con có giới hạn thời gian. */
  static assertWithinTimeLimit(attempt, minutes) {
    if (!minutes) return;
    const deadline = new Date(attempt.startedAt.getTime() + minutes * 60_000);
    // Cho phép trễ 30s để bù độ trễ mạng khi bấm nộp sát giờ.
    if (Date.now() > deadline.getTime() + 30_000) {
      throw new QuizSubmissionError('Đã hết thời gian làm bài.');
    }
  }
}

/** Bài kiểm tra thường của khóa học (Mini-LMS gốc). */
class StandardQuizAttemptService extends QuizAttemptService {
  validateCanSubmit(attempt, quiz) {
    QuizAttemptService.assertWithinTimeLimit(attempt, quiz.timeLimitMinutes);
  }

  // eslint-disable-next-line class-methods-use-this
  scoringStrategy() {
    return getScoringStrategy({ isToeic: false, mode: 'FULL' });
  }
}

/** Đề TOEIC — làm trọn bộ: luôn 120 phút, quy đổi thang 990. */
class ToeicFullTestAttemptService extends QuizAttemptService {
  validateCanSubmit(attempt) {
    QuizAttemptService.assertWithinTimeLimit(attempt, FULL_TEST_MINUTES);
  }

  // eslint-disable-next-line class-methods-use-this
  scoringStrategy() {
    return getScoringStrategy({ isToeic: true, mode: 'FULL' });
  }
}

/** Đề TOEIC — luyện từng part: thời gian do học viên tự chọn, chỉ chấm part đã chọn. */
class ToeicPartPracticeAttemptService extends QuizAttemptService {
  validateCanSubmit(attempt) {
    QuizAttemptService.assertWithinTimeLimit(attempt, attempt.timeLimitMinutes);
  }

  // eslint-disable-next-line class-methods-use-this
  async collectQuestions(attempt, quiz) {
    return Question.find({ quiz: quiz._id, part: { $in: attempt.selectedParts } }).sort('order');
  }

  // eslint-disable-next-line class-methods-use-this
  scoringStrategy() {
    return getScoringStrategy({ isToeic: true, mode: 'PART' });
  }
}

/** Chọn biến thể phù hợp với loại đề và chế độ làm bài. */
function getAttemptService(quiz, attempt) {
  if (quiz.examType !== 'TOEIC_TEST') return new StandardQuizAttemptService();
  return attempt?.mode === 'PART' ? new ToeicPartPracticeAttemptService() : new ToeicFullTestAttemptService();
}

module.exports = {
  getAttemptService,
  QuizSubmissionError,
  QuizAttemptService,
  StandardQuizAttemptService,
  ToeicFullTestAttemptService,
  ToeicPartPracticeAttemptService,
};
