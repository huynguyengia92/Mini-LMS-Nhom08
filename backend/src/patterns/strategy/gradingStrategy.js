/**
 * Strategy pattern (tầng chấm từng câu): mỗi loại câu hỏi tự quyết định cách
 * chấm của mình, tách khỏi quy trình nộp bài trong templateMethod/quizAttemptService.js.
 */
class GradingStrategy {
  // eslint-disable-next-line no-unused-vars
  grade(question, selectedChoice) {
    throw new Error('grade() must be implemented by subclass');
  }
}

/** Chọn đúng một lựa chọn: đúng thì ăn trọn điểm, sai hoặc bỏ trống thì 0. */
class SingleChoiceGradingStrategy extends GradingStrategy {
  grade(question, selectedChoice) {
    const isCorrect = Boolean(selectedChoice && selectedChoice.isCorrect);
    return { isCorrect, points: isCorrect ? question.points : 0 };
  }
}

/**
 * Câu hỏi TOEIC: giống single-choice nhưng KHÔNG trừ điểm khi sai và luôn 1 điểm
 * mỗi câu, đúng như quy tắc của bài thi thật (200 câu, mỗi câu giá trị như nhau).
 */
class ToeicGradingStrategy extends GradingStrategy {
  grade(question, selectedChoice) {
    const isCorrect = Boolean(selectedChoice && selectedChoice.isCorrect);
    return { isCorrect, points: isCorrect ? 1 : 0 };
  }
}

const singleChoice = new SingleChoiceGradingStrategy();
const toeic = new ToeicGradingStrategy();

const strategies = {
  MCQ: singleChoice,
  TF: singleChoice,
  PART1_PHOTO: toeic,
  PART2_RESPONSE: toeic,
  PART34_TALK: toeic,
  PART5_GRAMMAR: toeic,
  PART67_PASSAGE: toeic,
};

function getGradingStrategy(questionType) {
  return strategies[questionType] ?? singleChoice;
}

module.exports = { getGradingStrategy, GradingStrategy, SingleChoiceGradingStrategy, ToeicGradingStrategy };
