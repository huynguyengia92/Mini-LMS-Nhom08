const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  score: { type: Number, default: null }, // điểm phần trăm (dùng chung cho mọi loại bài)

  // FULL: làm trọn đề (mới quy đổi thang 990). PART: luyện tập một/vài part.
  mode: { type: String, enum: ['FULL', 'PART'], default: 'FULL' },
  selectedParts: { type: [Number], default: [] },
  timeLimitMinutes: { type: Number, default: null }, // thời gian tự chọn khi luyện part

  // ----- Kết quả riêng của đề TOEIC -----
  listeningCorrect: { type: Number, default: null },
  readingCorrect: { type: Number, default: null },
  listeningScore: { type: Number, default: null },
  readingScore: { type: Number, default: null },
  totalScore: { type: Number, default: null }, // thang 10–990
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
