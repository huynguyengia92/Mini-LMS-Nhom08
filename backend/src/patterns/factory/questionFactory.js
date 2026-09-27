/**
 * Factory Method pattern: mỗi loại câu hỏi có một creator riêng biết cách dựng
 * Question + Choice (và ngữ liệu kèm theo) của loại đó. Nơi gọi chỉ cần đưa
 * questionType + payload, không phải rẽ nhánh theo từng loại.
 *
 * Thêm một dạng câu hỏi mới = thêm một creator và đăng ký vào `creators`,
 * không sửa controller hay service nào khác (nguyên tắc Open/Closed).
 */
const Question = require('../../models/Question');
const Choice = require('../../models/Choice');

/** Lớp cha trừu tượng — định nghĩa hợp đồng chung cho mọi creator. */
class QuestionCreator {
  // eslint-disable-next-line no-unused-vars
  async create(payload) {
    throw new Error('create() must be implemented by subclass');
  }

  /** Tiện ích dùng chung: tạo danh sách lựa chọn từ mảng { text, isCorrect }. */
  async createChoices(questionId, choices = []) {
    if (!choices.length) return;
    await Choice.insertMany(
      choices.map(({ text, isCorrect }) => ({ question: questionId, text, isCorrect: Boolean(isCorrect) })),
    );
  }
}

// ---------------------------------------------------------------- Mini-LMS cơ bản

class MultipleChoiceQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, choices = [] }) {
    const question = await Question.create({ quiz, questionType: 'MCQ', text, order, points });
    await this.createChoices(question._id, choices);
    return question;
  }
}

class TrueFalseQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, correctAnswer = true }) {
    const question = await Question.create({ quiz, questionType: 'TF', text, order, points });
    await this.createChoices(question._id, [
      { text: 'Đúng', isCorrect: correctAnswer === true },
      { text: 'Sai', isCorrect: correctAnswer === false },
    ]);
    return question;
  }
}

// ---------------------------------------------------------------- TOEIC Listening

/** Part 1 — mô tả tranh: bắt buộc có ảnh, 4 lựa chọn A–D, thường không hiển thị đề bài. */
class Part1PhotoQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, imageUrl, imageCredit, audioUrl, choices = [], tags = [], explanation }) {
    if (!imageUrl) throw new Error('Câu hỏi Part 1 bắt buộc phải có ảnh.');
    const question = await Question.create({
      quiz, questionType: 'PART1_PHOTO', part: 1, text: text || 'Chọn câu mô tả đúng bức tranh.',
      order, points, imageUrl, imageCredit, audioUrl, tags, explanation,
    });
    await this.createChoices(question._id, choices);
    return question;
  }
}

/** Part 2 — hỏi & đáp: chỉ có audio, đúng 3 lựa chọn A–C. */
class Part2ResponseQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, audioUrl, choices = [], tags = [], explanation }) {
    const question = await Question.create({
      quiz, questionType: 'PART2_RESPONSE', part: 2, text: text || 'Chọn phản hồi phù hợp nhất.',
      order, points, audioUrl, tags, explanation,
    });
    await this.createChoices(question._id, choices.slice(0, 3));
    return question;
  }
}

/** Part 3/4 — câu hỏi thuộc một đoạn hội thoại/bài nói (group giữ audio dùng chung). */
class GroupedTalkQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, part = 3, group, choices = [], tags = [], explanation }) {
    const question = await Question.create({
      quiz, questionType: 'PART34_TALK', part, group, text, order, points, tags, explanation,
    });
    await this.createChoices(question._id, choices);
    return question;
  }
}

// ---------------------------------------------------------------- TOEIC Reading

/** Part 5 — hoàn thành câu: câu hỏi độc lập, 4 lựa chọn. */
class Part5GrammarQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, choices = [], tags = [], explanation }) {
    const question = await Question.create({
      quiz, questionType: 'PART5_GRAMMAR', part: 5, text, order, points, tags, explanation,
    });
    await this.createChoices(question._id, choices);
    return question;
  }
}

/** Part 6/7 — câu hỏi thuộc một đoạn văn (group giữ nội dung đoạn văn dùng chung). */
class GroupedPassageQuestionCreator extends QuestionCreator {
  async create({ quiz, text, order, points, part = 7, group, choices = [], tags = [], explanation }) {
    const question = await Question.create({
      quiz, questionType: 'PART67_PASSAGE', part, group, text, order, points, tags, explanation,
    });
    await this.createChoices(question._id, choices);
    return question;
  }
}

const creators = {
  MCQ: new MultipleChoiceQuestionCreator(),
  TF: new TrueFalseQuestionCreator(),
  PART1_PHOTO: new Part1PhotoQuestionCreator(),
  PART2_RESPONSE: new Part2ResponseQuestionCreator(),
  PART34_TALK: new GroupedTalkQuestionCreator(),
  PART5_GRAMMAR: new Part5GrammarQuestionCreator(),
  PART67_PASSAGE: new GroupedPassageQuestionCreator(),
};

class QuestionFactory {
  /** Điểm vào duy nhất mà controller soạn đề (UC6) sử dụng. */
  static async createQuestion(questionType, payload) {
    const creator = creators[questionType];
    if (!creator) throw new Error(`Unsupported question type: ${questionType}`);
    return creator.create(payload);
  }

  /** Suy ra loại câu hỏi mặc định từ số hiệu part của đề TOEIC. */
  static typeForPart(part) {
    if (part === 1) return 'PART1_PHOTO';
    if (part === 2) return 'PART2_RESPONSE';
    if (part === 3 || part === 4) return 'PART34_TALK';
    if (part === 5) return 'PART5_GRAMMAR';
    return 'PART67_PASSAGE';
  }
}

module.exports = QuestionFactory;
