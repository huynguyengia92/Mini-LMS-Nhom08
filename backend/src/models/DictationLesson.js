const mongoose = require('mongoose');

/** Một bài nghe chép chính tả, gồm nhiều câu (segment) nghe và gõ lại lần lượt. */
const dictationLessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    // Part TOEIC liên quan (nếu bài chép lấy từ ngữ liệu Part 3/4), để học viên nghe lại bài vừa làm.
    part: { type: Number, min: 1, max: 7, default: null },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('DictationLesson', dictationLessonSchema);
