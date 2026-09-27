const mongoose = require('mongoose');

/**
 * Loại câu hỏi. MCQ/TF là 2 loại cơ bản của Mini-LMS; các loại PART_* phục vụ
 * đề TOEIC — mỗi loại có một creator riêng trong patterns/factory/questionFactory.js.
 */
const QUESTION_TYPES = [
  'MCQ',            // Trắc nghiệm nhiều lựa chọn (dùng chung)
  'TF',             // Đúng / Sai
  'PART1_PHOTO',    // Part 1 — mô tả tranh (4 lựa chọn, có ảnh + audio)
  'PART2_RESPONSE', // Part 2 — hỏi & đáp (3 lựa chọn, chỉ audio)
  'PART34_TALK',    // Part 3/4 — hội thoại / bài nói (4 lựa chọn, thuộc group audio)
  'PART5_GRAMMAR',  // Part 5 — hoàn thành câu (4 lựa chọn)
  'PART67_PASSAGE', // Part 6/7 — điền đoạn văn / đọc hiểu (4 lựa chọn, thuộc group đoạn văn)
];

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionType: { type: String, enum: QUESTION_TYPES, required: true },
  text: { type: String, required: true },
  points: { type: Number, default: 1 },
  order: { type: Number, default: 1 },

  // ----- Trường dành riêng cho đề TOEIC -----
  part: { type: Number, min: 1, max: 7, default: null },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionGroup', default: null },
  imageUrl: { type: String, default: '' },
  // Ghi nguồn ảnh theo yêu cầu giấy phép (CC BY...): tác giả, giấy phép, link gốc.
  imageCredit: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  // Tag dạng bài để thống kê điểm yếu, vd: "Câu hỏi WHAT", "Grammar: Mệnh đề quan hệ"
  tags: { type: [String], default: [] },
  explanation: { type: String, default: '' },
});

questionSchema.index({ quiz: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
module.exports.QUESTION_TYPES = QUESTION_TYPES;
