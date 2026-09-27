const mongoose = require('mongoose');

/** Một list từ vựng, ví dụ "List 1 — Từ vựng TOEIC chủ đề Văn phòng". */
const vocabSetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    topic: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // List hệ thống (do giảng viên tạo) hay list riêng của học viên tự tạo.
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('VocabSet', vocabSetSchema);
