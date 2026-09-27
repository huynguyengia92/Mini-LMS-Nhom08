const mongoose = require('mongoose');

/**
 * Tiến độ ghi nhớ của từng học viên với từng từ, theo phương pháp spaced repetition:
 * nhớ được thì giãn dần khoảng cách ôn lại, quên thì quay về mốc đầu.
 */
const vocabProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    word: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabWord', required: true },
    set: { type: mongoose.Schema.Types.ObjectId, ref: 'VocabSet', required: true },

    // NEW: chưa học · LEARNING: đang học · MEMORIZED: đã nhớ (qua đủ số lần ôn)
    status: { type: String, enum: ['NEW', 'LEARNING', 'MEMORIZED'], default: 'NEW' },
    streak: { type: Number, default: 0 }, // số lần nhớ liên tiếp
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date, default: null },
    nextReviewAt: { type: Date, default: null },
  },
  { timestamps: true },
);

vocabProgressSchema.index({ student: 1, word: 1 }, { unique: true });

module.exports = mongoose.model('VocabProgress', vocabProgressSchema);
