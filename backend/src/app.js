const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const quizRoutes = require('./routes/quizRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const progressRoutes = require('./routes/progressRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const vocabRoutes = require('./routes/vocabRoutes');
const dictationRoutes = require('./routes/dictationRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// File audio phần nghe (sinh bằng text-to-speech từ kịch bản của nhóm).
app.use('/audio', express.static(path.join(__dirname, '..', 'public', 'audio')));
// Ảnh Part 1 (giấy phép mở từ Wikimedia Commons).
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/dictation', dictationRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống.' });
});

module.exports = app;
