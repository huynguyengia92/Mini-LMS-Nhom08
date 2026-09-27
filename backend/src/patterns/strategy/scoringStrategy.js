/**
 * Strategy pattern (tầng tổng kết bài làm): cùng một tập câu trả lời đã chấm,
 * mỗi loại bài lại quy đổi ra kết quả cuối theo cách khác nhau:
 *   - Bài kiểm tra thường  -> điểm phần trăm
 *   - Đề TOEIC full test   -> quy đổi thang 990 (Listening + Reading)
 *   - Luyện tập từng part  -> chỉ tính độ chính xác, KHÔNG quy đổi thang 990
 *
 * Nhờ tách riêng, service nộp bài (Template Method) không cần biết đang chấm loại nào.
 */
const { PART_MAP, toScaledScore, proficiencyOf } = require('../../domain/toeic');

class ScoringStrategy {
  // eslint-disable-next-line no-unused-vars
  summarize(gradedAnswers) {
    throw new Error('summarize() must be implemented by subclass');
  }
}

/** Điểm phần trăm: dùng cho bài kiểm tra thường của khóa học. */
class PercentScoringStrategy extends ScoringStrategy {
  summarize(gradedAnswers) {
    const earned = gradedAnswers.reduce((sum, a) => sum + a.points, 0);
    const possible = gradedAnswers.reduce((sum, a) => sum + a.question.points, 0);
    return {
      score: possible ? Math.round((earned / possible) * 10000) / 100 : 0,
    };
  }
}

/** Tách số câu đúng / tổng số câu theo kỹ năng Listening — Reading. */
function splitBySkill(gradedAnswers) {
  let listeningCorrect = 0;
  let readingCorrect = 0;
  let listeningTotal = 0;
  let readingTotal = 0;

  for (const answer of gradedAnswers) {
    const meta = PART_MAP.get(answer.question.part);
    if (meta?.skill === 'LISTENING') {
      listeningTotal += 1;
      if (answer.isCorrect) listeningCorrect += 1;
    } else if (meta?.skill === 'READING') {
      readingTotal += 1;
      if (answer.isCorrect) readingCorrect += 1;
    }
  }
  return { listeningCorrect, readingCorrect, listeningTotal, readingTotal };
}

/**
 * Quy đổi cho đề rút gọn: bảng điểm chuẩn tính trên 100 câu mỗi kỹ năng, nên với đề
 * ít câu hơn ta nội suy tỉ lệ số câu đúng về thang 100 rồi mới tra bảng (điểm ước lượng).
 */
function normalizedCorrect(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

/** Full test: quy đổi sang thang 990 như bài thi thật. */
class ToeicFullTestScoringStrategy extends ScoringStrategy {
  summarize(gradedAnswers) {
    const { listeningCorrect, readingCorrect, listeningTotal, readingTotal } = splitBySkill(gradedAnswers);
    const listeningScore = listeningTotal
      ? toScaledScore(normalizedCorrect(listeningCorrect, listeningTotal))
      : 0;
    const readingScore = readingTotal
      ? toScaledScore(normalizedCorrect(readingCorrect, readingTotal))
      : 0;
    const totalScore = listeningScore + readingScore;
    const correct = gradedAnswers.filter((a) => a.isCorrect).length;

    return {
      score: gradedAnswers.length ? Math.round((correct / gradedAnswers.length) * 10000) / 100 : 0,
      listeningCorrect,
      readingCorrect,
      listeningScore,
      readingScore,
      totalScore,
      // Đề rút gọn thì điểm là ước lượng, giao diện cần nói rõ điều này cho học viên.
      estimated: listeningTotal + readingTotal < 200,
      proficiency: proficiencyOf(totalScore),
    };
  }
}

/**
 * Luyện tập từng part: chỉ báo độ chính xác. Không quy đổi thang 990 vì thang điểm
 * chỉ có ý nghĩa khi làm trọn 200 câu (đúng như quy ước của các nền tảng luyện thi).
 */
class ToeicPartPracticeScoringStrategy extends ScoringStrategy {
  summarize(gradedAnswers) {
    const { listeningCorrect, readingCorrect } = splitBySkill(gradedAnswers);
    const correct = gradedAnswers.filter((a) => a.isCorrect).length;
    return {
      score: gradedAnswers.length ? Math.round((correct / gradedAnswers.length) * 10000) / 100 : 0,
      listeningCorrect,
      readingCorrect,
      listeningScore: null,
      readingScore: null,
      totalScore: null,
    };
  }
}

function getScoringStrategy({ isToeic, mode }) {
  if (!isToeic) return new PercentScoringStrategy();
  return mode === 'PART' ? new ToeicPartPracticeScoringStrategy() : new ToeicFullTestScoringStrategy();
}

module.exports = {
  getScoringStrategy,
  PercentScoringStrategy,
  ToeicFullTestScoringStrategy,
  ToeicPartPracticeScoringStrategy,
};
