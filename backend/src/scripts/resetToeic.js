/**
 * Xóa khóa TOEIC mẫu cùng toàn bộ đề/câu hỏi/lượt làm bài của nó,
 * để chạy lại `npm run seed` tạo dữ liệu mới (ví dụ sau khi bổ sung audio).
 * Chỉ dùng cho môi trường phát triển.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');

const Course = require('../models/Course');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const cascade = require('../utils/cascadeDelete');

const COURSE_TITLE = 'TOEIC LR — Lộ trình 500+';

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini_lms');

  const course = await Course.findOne({ title: COURSE_TITLE });
  if (!course) {
    console.log('Không tìm thấy khóa TOEIC — không có gì để xóa.');
    process.exit(0);
  }

  const quizIds = (await Quiz.find({ course: course._id }).select('_id')).map((q) => q._id);
  const questionCount = await Question.countDocuments({ quiz: { $in: quizIds } });

  await cascade.deleteCourseContent(course._id, course.slug);
  await Course.deleteOne({ _id: course._id });

  console.log(`Đã xóa khóa TOEIC (${quizIds.length} đề, ${questionCount} câu hỏi) cùng dữ liệu liên quan.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
