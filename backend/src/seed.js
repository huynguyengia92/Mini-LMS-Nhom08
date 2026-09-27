require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Course = require('./models/Course');
const Lecture = require('./models/Lecture');
const Enrollment = require('./models/Enrollment');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const QuestionGroup = require('./models/QuestionGroup');
const QuestionFactory = require('./patterns/factory/questionFactory');
const VocabSet = require('./models/VocabSet');
const VocabWord = require('./models/VocabWord');
const DictationLesson = require('./models/DictationLesson');
const DictationSegment = require('./models/DictationSegment');
const dictationLessons = require('./seeds/dictationScripts');
const toeicSample = require('./seeds/toeicSampleTest');
const strategyCourses = require('./seeds/toeicCourses');
const videoLectures = require('./seeds/videoLectures');
const listening = require('./seeds/listeningScripts');
const vocabLists = require('./seeds/vocabLists');
const slugify = require('./utils/slugify');

async function upsertUser({ username, email, password, firstName, lastName, role }) {
  let user = await User.findOne({ username });
  if (user) return user;
  const passwordHash = await bcrypt.hash(password, 10);
  user = await User.create({ username, email, passwordHash, firstName, lastName, role });
  return user;
}

/** Thông tin ghi nguồn ảnh Part 1, sinh bởi tools/fetch_part1_images.py. */
function loadPart1Credits() {
  const file = path.join(__dirname, '..', 'public', 'images', 'part1', 'credits.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {};
}

/** Khóa học TOEIC + đề luyện thi mẫu (đề rút gọn gồm đủ 7 part). */
async function seedToeicCourse({ instructor, student }) {
  let category = await Category.findOne({ name: 'Luyện thi TOEIC' });
  if (!category) {
    category = await Category.create({
      name: 'Luyện thi TOEIC',
      description: 'Khóa học và đề luyện thi TOEIC Listening & Reading.',
    });
  }

  let course = await Course.findOne({ title: 'TOEIC LR — Lộ trình 500+' });
  if (course) return;

  course = await Course.create({
    title: 'TOEIC LR — Lộ trình 500+',
    slug: slugify('TOEIC LR — Lộ trình 500+'),
    description:
      'Chiến lược làm bài từng part, ngữ pháp trọng tâm và bộ đề luyện thi TOEIC Listening & Reading.',
    category: category._id,
    instructor: instructor._id,
    isPublished: true,
  });

  await Lecture.create({
    course: course._id, title: 'Tổng quan cấu trúc đề TOEIC LR', order: 1,
    contentType: 'DOCUMENT',
    textContent:
      'Đề TOEIC Listening & Reading gồm 7 part, 200 câu, làm trong 120 phút.\n'
      + 'Listening (Part 1–4): 100 câu, khoảng 45 phút.\n'
      + 'Reading (Part 5–7): 100 câu, 75 phút.\n'
      + 'Điểm mỗi kỹ năng quy đổi về thang 5–495, tổng tối đa 990.',
  });
  await Lecture.create({
    course: course._id, title: 'Part 5 — Bẫy từ loại và cách xử lý nhanh', order: 2,
    contentType: 'DOCUMENT',
    textContent:
      'Bước 1: Nhìn vào 4 đáp án. Nếu cùng gốc từ khác đuôi → câu hỏi từ loại.\n'
      + 'Bước 2: Xác định vị trí chỗ trống trong câu (chủ ngữ, tân ngữ, bổ nghĩa).\n'
      + 'Bước 3: Chọn từ loại phù hợp, không cần đọc hết nghĩa của câu.',
  });

  const quiz = await Quiz.create({
    course: course._id,
    title: 'TOEIC Practice Test 01 (đề rút gọn)',
    description: 'Đề rút gọn gồm đủ 7 part (Listening có audio thật) — dùng để làm quen cấu trúc và cách tính điểm.',
    examType: 'TOEIC_TEST',
    createdBy: instructor._id,
  });

  let order = 1;
  const AUDIO = (name) => `${process.env.PUBLIC_URL ?? 'http://localhost:4000'}/audio/${name}.mp3`;

  // Part 1 — mô tả tranh (ảnh giấy phép mở + audio 4 câu mô tả)
  const credits = loadPart1Credits();
  const IMAGE = (name) => `${process.env.PUBLIC_URL ?? 'http://localhost:4000'}/images/part1/${name}.jpg`;
  for (const item of listening.part1Items) {
    const credit = credits[item.key];
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART1_PHOTO', {
      quiz: quiz._id,
      text: 'Nhìn tranh, nghe 4 câu mô tả và chọn câu mô tả đúng nhất.',
      imageUrl: IMAGE(item.key),
      imageCredit: credit ? `Ảnh: ${credit.author} · ${credit.license} · Wikimedia Commons` : '',
      audioUrl: AUDIO(item.key),
      choices: item.statements.map((s) => ({ text: `${s.letter}. ${s.text}`, isCorrect: s.isCorrect })),
      tags: item.tags,
      explanation: item.explanation,
      order: order++,
      points: 1,
    });
  }

  // Part 2 — câu hỏi độc lập, chỉ có audio
  for (const item of listening.part2Items) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART2_RESPONSE', {
      quiz: quiz._id,
      text: 'Nghe câu hỏi và chọn phản hồi phù hợp nhất.',
      audioUrl: AUDIO(item.key),
      choices: item.choices.map((c, i) => ({ ...c, text: `${'ABC'[i]}. ${c.text}` })),
      tags: item.tags,
      // Câu hỏi chỉ có trong audio nên đưa bản ghi vào phần giải thích để xem lại sau khi nộp.
      explanation: `Câu hỏi: “${item.question}” — ${item.explanation}`,
      order: order++,
      points: 1,
    });
  }

  // Part 3 — nhóm câu hỏi theo đoạn hội thoại
  const group3 = await QuestionGroup.create({
    ...toeicSample.part3Group,
    quiz: quiz._id,
    audioUrl: AUDIO(listening.part3Conversation.key),
  });
  for (const q of toeicSample.part3Questions) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART34_TALK', {
      ...q, quiz: quiz._id, part: 3, group: group3._id, order: order++, points: 1,
    });
  }

  // Part 4 — bài nói ngắn
  const group4 = await QuestionGroup.create({
    quiz: quiz._id,
    part: 4,
    title: listening.part4Talk.title,
    passageText: listening.part4Talk.passageText,
    audioUrl: AUDIO(listening.part4Talk.key),
    order: 1,
  });
  for (const q of listening.part4Talk.questions) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART34_TALK', {
      ...q, quiz: quiz._id, part: 4, group: group4._id, order: order++, points: 1,
    });
  }

  // Part 5 — câu hỏi độc lập
  for (const q of toeicSample.part5Questions) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART5_GRAMMAR', {
      ...q, quiz: quiz._id, order: order++, points: 1,
    });
  }

  // Part 6 — điền vào đoạn văn
  const group6 = await QuestionGroup.create({ ...toeicSample.part6Group, quiz: quiz._id });
  for (const q of toeicSample.part6Questions) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART67_PASSAGE', {
      ...q, quiz: quiz._id, part: 6, group: group6._id, order: order++, points: 1,
    });
  }

  // Part 7 — đọc hiểu, hai đoạn văn
  const group7a = await QuestionGroup.create({ ...toeicSample.part7GroupA, quiz: quiz._id });
  for (const q of toeicSample.part7QuestionsA) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART67_PASSAGE', {
      ...q, quiz: quiz._id, part: 7, group: group7a._id, order: order++, points: 1,
    });
  }
  const group7b = await QuestionGroup.create({ ...toeicSample.part7GroupB, quiz: quiz._id });
  for (const q of toeicSample.part7QuestionsB) {
    // eslint-disable-next-line no-await-in-loop
    await QuestionFactory.createQuestion('PART67_PASSAGE', {
      ...q, quiz: quiz._id, part: 7, group: group7b._id, order: order++, points: 1,
    });
  }

  await Enrollment.findOneAndUpdate(
    { student: student._id, course: course._id },
    { student: student._id, course: course._id },
    { upsert: true },
  );

  console.log(`Đã tạo khóa TOEIC + đề mẫu (${order - 1} câu hỏi).`);
}

/** Hai khóa chiến lược làm bài (Listening, Reading) — bài giảng tài liệu + một bài kiểm tra ngắn. */
async function seedStrategyCourses({ instructor, student }) {
  for (const spec of strategyCourses) {
    // eslint-disable-next-line no-await-in-loop
    if (await Course.findOne({ title: spec.title })) continue;

    // eslint-disable-next-line no-await-in-loop
    let category = await Category.findOne({ name: spec.category.name });
    // eslint-disable-next-line no-await-in-loop
    if (!category) category = await Category.create(spec.category);

    // eslint-disable-next-line no-await-in-loop
    const course = await Course.create({
      title: spec.title,
      slug: slugify(spec.title),
      description: spec.description,
      category: category._id,
      instructor: instructor._id,
      isPublished: true,
    });

    // eslint-disable-next-line no-await-in-loop
    await Lecture.insertMany(
      spec.lectures.map((lecture, i) => ({ ...lecture, course: course._id, order: i + 1 })),
    );

    // eslint-disable-next-line no-await-in-loop
    const quiz = await Quiz.create({
      course: course._id,
      title: spec.quiz.title,
      description: spec.quiz.description,
      createdBy: instructor._id,
    });
    for (const [i, question] of spec.quiz.questions.entries()) {
      const { type, ...payload } = question;
      // eslint-disable-next-line no-await-in-loop
      await QuestionFactory.createQuestion(type, { ...payload, quiz: quiz._id, order: i + 1, points: 1 });
    }

    // eslint-disable-next-line no-await-in-loop
    await Enrollment.findOneAndUpdate(
      { student: student._id, course: course._id },
      { student: student._id, course: course._id },
      { upsert: true },
    );
    console.log(`Đã tạo khóa "${spec.title}".`);
  }
}

/**
 * Bài giảng video (nhúng YouTube) — thêm bù vào các khóa đã có, nên chạy lại seed
 * trên cơ sở dữ liệu cũ vẫn bổ sung được mà không đụng tới bài giảng sẵn có.
 */
async function seedVideoLectures() {
  let created = 0;

  for (const spec of videoLectures) {
    // eslint-disable-next-line no-await-in-loop
    const course = await Course.findOne({ title: spec.courseTitle });
    if (!course) continue;
    // eslint-disable-next-line no-await-in-loop
    if (await Lecture.findOne({ course: course._id, title: spec.title })) continue;

    // eslint-disable-next-line no-await-in-loop
    const order = (await Lecture.countDocuments({ course: course._id })) + 1;
    // eslint-disable-next-line no-await-in-loop
    await Lecture.create({
      course: course._id,
      title: spec.title,
      order,
      contentType: spec.contentType,
      videoUrl: spec.videoUrl,
      textContent: spec.textContent,
    });
    created += 1;
  }

  if (created) console.log(`Đã thêm ${created} bài giảng video.`);
}

/** List từ vựng — tách riêng để chạy được kể cả khi khóa TOEIC đã tồn tại từ lần seed trước. */
async function seedVocabLists({ instructor }) {
  const course = await Course.findOne({ title: 'TOEIC LR — Lộ trình 500+' });
  let created = 0;

  // Khóa TOEIC có thể đã được tạo lại (ID mới) — nối lại các list cũ vào khóa hiện tại.
  if (course) {
    await VocabSet.updateMany({ title: { $in: vocabLists.map((l) => l.title) } }, { course: course._id });
  }

  for (const list of vocabLists) {
    // eslint-disable-next-line no-await-in-loop
    if (await VocabSet.findOne({ title: list.title })) continue;

    // eslint-disable-next-line no-await-in-loop
    const set = await VocabSet.create({
      title: list.title,
      topic: list.topic,
      description: list.description,
      course: course?._id ?? null,
      createdBy: instructor._id,
    });
    // eslint-disable-next-line no-await-in-loop
    await VocabWord.insertMany(list.words.map((w, i) => ({ ...w, set: set._id, order: i + 1 })));
    created += 1;
  }

  if (created) console.log(`Đã tạo ${created} list từ vựng.`);
}

/** Bài nghe chép chính tả — mỗi câu một file audio sinh sẵn bằng tools/generate_audio.py. */
async function seedDictation({ instructor }) {
  const course = await Course.findOne({ title: 'TOEIC LR — Lộ trình 500+' });
  const audio = (name) => `${process.env.PUBLIC_URL ?? 'http://localhost:4000'}/audio/${name}.mp3`;
  let created = 0;

  if (course) {
    await DictationLesson.updateMany(
      { title: { $in: dictationLessons.map((l) => l.title) } },
      { course: course._id },
    );
  }

  for (const [index, spec] of dictationLessons.entries()) {
    // eslint-disable-next-line no-await-in-loop
    if (await DictationLesson.findOne({ title: spec.title })) continue;

    // eslint-disable-next-line no-await-in-loop
    const lesson = await DictationLesson.create({
      title: spec.title,
      description: spec.description,
      level: spec.level,
      part: spec.part,
      course: course?._id ?? null,
      createdBy: instructor._id,
      order: index + 1,
    });

    // eslint-disable-next-line no-await-in-loop
    await DictationSegment.insertMany(
      spec.segments.map((seg, i) => ({
        lesson: lesson._id,
        order: i + 1,
        text: seg.text,
        translation: seg.translation,
        audioUrl: audio(`${spec.key}-${String(i + 1).padStart(2, '0')}`),
      })),
    );
    created += 1;
  }

  if (created) console.log(`Đã tạo ${created} bài nghe chép chính tả.`);
}

async function seed() {
  await connectDB();

  const admin = await upsertUser({
    username: 'admin', email: 'admin@lms.local', password: 'admin12345',
    firstName: 'Quan', lastName: 'Tri', role: 'ADMIN',
  });
  const instructor = await upsertUser({
    username: 'instructor1', email: 'gv@lms.local', password: 'instructor12345',
    firstName: 'Minh', lastName: 'Nguyen', role: 'INSTRUCTOR',
  });
  const student = await upsertUser({
    username: 'student1', email: 'hv@lms.local', password: 'student12345',
    firstName: 'Lan', lastName: 'Tran', role: 'STUDENT',
  });

  await seedToeicCourse({ instructor, student });
  await seedStrategyCourses({ instructor, student });
  await seedVideoLectures();
  await seedVocabLists({ instructor });
  await seedDictation({ instructor });

  console.log('Seed xong. Đăng nhập: admin/admin12345, instructor1/instructor12345, student1/student12345');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
