const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    contentType: { type: String, enum: ['VIDEO', 'DOCUMENT'], default: 'VIDEO' },
    videoUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    textContent: { type: String, default: '' },
    order: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Lecture', lectureSchema);
