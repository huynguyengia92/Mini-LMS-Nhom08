const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const LectureProgress = require('../models/LectureProgress');
const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');
const slugify = require('../utils/slugify');
const cascade = require('../utils/cascadeDelete');
const { courseSubject } = require('../patterns/observer/courseSubject');

/** Gắn số bài giảng/bài kiểm tra cho danh sách khóa học bằng 2 truy vấn gộp (tránh N+1). */
async function withContentCounts(courses) {
  const ids = courses.map((c) => c._id);
  const [lectureCounts, quizCounts] = await Promise.all([
    Lecture.aggregate([{ $match: { course: { $in: ids } } }, { $group: { _id: '$course', n: { $sum: 1 } } }]),
    Quiz.aggregate([{ $match: { course: { $in: ids } } }, { $group: { _id: '$course', n: { $sum: 1 } } }]),
  ]);
  const lectureMap = new Map(lectureCounts.map((x) => [String(x._id), x.n]));
  const quizMap = new Map(quizCounts.map((x) => [String(x._id), x.n]));
  // toJSON (không phải toObject) để giữ virtual field như User.fullName của instructor đã populate.
  return courses.map((c) => ({
    ...c.toJSON(),
    lectureCount: lectureMap.get(String(c._id)) ?? 0,
    quizCount: quizMap.get(String(c._id)) ?? 0,
  }));
}

// UC2 — Tìm kiếm khóa học
async function listCourses(req, res) {
  const { q, category } = req.query;
  const filter = { isPublished: true };
  if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
  if (category) filter.category = category;

  const found = await Course.find(filter).populate('category instructor').sort('-createdAt');
  const courses = await withContentCounts(found);

  let enrolledIds = [];
  if (req.user?.role === 'STUDENT') {
    enrolledIds = (await Enrollment.find({ student: req.user._id }).select('course')).map((e) => e.course.toString());
  }
  res.json({ courses, enrolledIds });
}

async function getCourse(req, res) {
  const course = await Course.findOne({ slug: req.params.slug }).populate('category instructor');
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

  const [lectures, quizzes, studentCount] = await Promise.all([
    Lecture.find({ course: course._id }).sort('order'),
    Quiz.find({ course: course._id }).sort('createdAt'),
    Enrollment.countDocuments({ course: course._id }),
  ]);

  const isEnrolled = req.user?.role === 'STUDENT'
    ? Boolean(await Enrollment.findOne({ student: req.user._id, course: course._id }))
    : false;

  // Cho phép giao diện đánh dấu bài giảng đã hoàn thành ngay trong danh sách chương trình học.
  let completedLectureIds = [];
  if (isEnrolled) {
    const done = await LectureProgress.find({
      student: req.user._id,
      lecture: { $in: lectures.map((l) => l._id) },
      isCompleted: true,
    }).select('lecture');
    completedLectureIds = done.map((d) => String(d.lecture));
  }

  res.json({ course, lectures, quizzes, isEnrolled, studentCount, completedLectureIds });
}

// UC2 — Đăng ký khóa học
async function enroll(req, res) {
  if (req.user.role !== 'STUDENT') return res.status(403).json({ message: 'Chỉ học viên mới đăng ký được.' });
  const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

  await Enrollment.findOneAndUpdate(
    { student: req.user._id, course: course._id },
    { student: req.user._id, course: course._id },
    { upsert: true },
  );
  res.json({ message: `Đã đăng ký khóa học "${course.title}".` });
}

// UC5 — Giảng viên quản lý khóa học
async function myCourses(req, res) {
  const found = await Course.find({ instructor: req.user._id }).populate('category').sort('-createdAt');
  const courses = await withContentCounts(found);
  const enrollmentCounts = await Enrollment.aggregate([
    { $match: { course: { $in: found.map((c) => c._id) } } },
    { $group: { _id: '$course', n: { $sum: 1 } } },
  ]);
  const enrollMap = new Map(enrollmentCounts.map((x) => [String(x._id), x.n]));
  res.json({
    courses: courses.map((c) => ({ ...c, studentCount: enrollMap.get(String(c._id)) ?? 0 })),
  });
}

async function createCourse(req, res) {
  const { title, description, category, isPublished } = req.body;
  let slug = slugify(title);
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Course.findOne({ slug })) {
    suffix += 1;
    slug = `${slugify(title)}-${suffix}`;
  }
  const course = await Course.create({
    title, description, category, isPublished, slug, instructor: req.user._id,
  });
  res.status(201).json({ course });
}

async function updateCourse(req, res) {
  const course = await Course.findOne({ slug: req.params.slug, instructor: req.user._id });
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học của bạn.' });

  Object.assign(course, req.body);
  await course.save();
  res.json({ course });
}

async function deleteCourse(req, res) {
  const course = await Course.findOneAndDelete({ slug: req.params.slug, instructor: req.user._id });
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học của bạn.' });
  await cascade.deleteCourseContent(course._id, course.slug);
  res.json({ message: 'Đã xóa khóa học.' });
}

// UC5 — Bài giảng (kích hoạt Observer khi thêm mới)
async function createLecture(req, res) {
  const course = await Course.findOne({ slug: req.params.slug, instructor: req.user._id });
  if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học của bạn.' });

  const lecture = await Lecture.create({ ...req.body, course: course._id });

  await courseSubject.notify('NEW_LECTURE', {
    courseId: course._id,
    message: `Bài giảng mới: "${lecture.title}" trong khóa "${course.title}"`,
    url: `/courses/${course.slug}`,
  });

  res.status(201).json({ lecture });
}

async function updateLecture(req, res) {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Không tìm thấy bài giảng.' });
  const course = await Course.findOne({ _id: lecture.course, instructor: req.user._id });
  if (!course) return res.status(403).json({ message: 'Bạn không sở hữu khóa học này.' });

  Object.assign(lecture, req.body);
  await lecture.save();
  res.json({ lecture });
}

async function deleteLecture(req, res) {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Không tìm thấy bài giảng.' });
  const course = await Course.findOne({ _id: lecture.course, instructor: req.user._id });
  if (!course) return res.status(403).json({ message: 'Bạn không sở hữu khóa học này.' });

  await cascade.deleteLectures([lecture._id]);
  res.json({ message: 'Đã xóa bài giảng.' });
}

async function getLecture(req, res) {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return res.status(404).json({ message: 'Không tìm thấy bài giảng.' });

  const siblings = await Lecture.find({ course: lecture.course._id }).sort('order');

  let completedLectureIds = [];
  if (req.user?.role === 'STUDENT') {
    const done = await LectureProgress.find({
      student: req.user._id,
      lecture: { $in: siblings.map((l) => l._id) },
      isCompleted: true,
    }).select('lecture');
    completedLectureIds = done.map((d) => String(d.lecture));
  }

  res.json({ lecture, siblings, completedLectureIds });
}

module.exports = {
  listCourses, getCourse, enroll, myCourses, createCourse, updateCourse, deleteCourse,
  createLecture, updateLecture, deleteLecture, getLecture,
};
