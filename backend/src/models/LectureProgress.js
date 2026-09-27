const mongoose = require('mongoose');

const lectureProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lecture: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
});

lectureProgressSchema.index({ student: 1, lecture: 1 }, { unique: true });

module.exports = mongoose.model('LectureProgress', lectureProgressSchema);
