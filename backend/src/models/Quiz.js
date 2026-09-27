const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    timeLimitMinutes: { type: Number, default: null },
    dueDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // QUIZ: bài kiểm tra thường của khóa học. TOEIC_TEST: đề luyện thi TOEIC 7 part.
    examType: { type: String, enum: ['QUIZ', 'TOEIC_TEST'], default: 'QUIZ' },
  },
  { timestamps: true },
);

quizSchema.virtual('isToeic').get(function () {
  return this.examType === 'TOEIC_TEST';
});

quizSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);
