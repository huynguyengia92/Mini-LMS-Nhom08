const mongoose = require('mongoose');

/** Kết quả chép chính tả của học viên theo từng câu trong một bài. */
const segmentResultSchema = new mongoose.Schema(
  {
    segment: { type: mongoose.Schema.Types.ObjectId, ref: 'DictationSegment', required: true },
    bestAccuracy: { type: Number, default: 0 }, // 0–100
    attempts: { type: Number, default: 0 },
    usedHint: { type: Boolean, default: false },
  },
  { _id: false },
);

const dictationProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'DictationLesson', required: true },
    segments: { type: [segmentResultSchema], default: [] },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

dictationProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('DictationProgress', dictationProgressSchema);
