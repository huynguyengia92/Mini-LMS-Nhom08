const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedChoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Choice', default: null },
  isCorrect: { type: Boolean, default: null },
  pointsAwarded: { type: Number, default: 0 },
});

answerSchema.index({ attempt: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Answer', answerSchema);
