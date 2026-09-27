const mongoose = require('mongoose');

/**
 * Nhóm câu hỏi dùng chung một ngữ liệu: đoạn hội thoại (Part 3/4), đoạn văn (Part 6/7).
 * Part 1/2/5 là câu hỏi độc lập nên không cần group.
 */
const questionGroupSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  part: { type: Number, min: 1, max: 7, required: true },
  title: { type: String, default: '' },
  passageText: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  order: { type: Number, default: 1 },
});

module.exports = mongoose.model('QuestionGroup', questionGroupSchema);
