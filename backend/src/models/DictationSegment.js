const mongoose = require('mongoose');

/** Một câu trong bài chép chính tả: nội dung chuẩn + file audio đọc riêng câu đó. */
const dictationSegmentSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'DictationLesson', required: true },
  order: { type: Number, required: true },
  text: { type: String, required: true },
  translation: { type: String, default: '' },
  audioUrl: { type: String, required: true },
});

dictationSegmentSchema.index({ lesson: 1, order: 1 });

module.exports = mongoose.model('DictationSegment', dictationSegmentSchema);
