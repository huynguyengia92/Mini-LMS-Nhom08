const DictationLesson = require('../models/DictationLesson');
const DictationSegment = require('../models/DictationSegment');
const DictationProgress = require('../models/DictationProgress');
const { compare } = require('../domain/dictation');

// Đạt ngưỡng này ở mọi câu thì bài được coi là hoàn thành.
const PASS_ACCURACY = 80;

function lessonSummary(segmentCount, progress) {
  const done = progress?.segments.filter((s) => s.bestAccuracy >= PASS_ACCURACY).length ?? 0;
  // Câu chỉ bấm "Hiện đáp án" mà chưa gõ lần nào thì không tính vào độ chính xác trung bình.
  const tried = progress?.segments.filter((s) => s.attempts > 0) ?? [];
  const avg = tried.length
    ? Math.round(tried.reduce((sum, s) => sum + s.bestAccuracy, 0) / tried.length)
    : null;
  return {
    segmentCount,
    completedSegments: done,
    averageAccuracy: avg,
    completed: Boolean(progress?.completedAt),
  };
}

async function listLessons(req, res) {
  const lessons = await DictationLesson.find().sort('order');
  const counts = await DictationSegment.aggregate([
    { $group: { _id: '$lesson', n: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  const progressMap = new Map();
  if (req.user) {
    const all = await DictationProgress.find({ student: req.user._id });
    for (const p of all) progressMap.set(String(p.lesson), p);
  }

  res.json({
    lessons: lessons.map((lesson) => ({
      ...lesson.toJSON(),
      ...lessonSummary(countMap.get(String(lesson._id)) ?? 0, progressMap.get(String(lesson._id))),
    })),
  });
}

async function getLesson(req, res) {
  const lesson = await DictationLesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Không tìm thấy bài chép chính tả.' });

  const segments = await DictationSegment.find({ lesson: lesson._id }).sort('order');
  const progress = req.user
    ? await DictationProgress.findOne({ student: req.user._id, lesson: lesson._id })
    : null;
  const resultMap = new Map((progress?.segments ?? []).map((s) => [String(s.segment), s]));

  res.json({
    lesson,
    // Không gửi kèm nội dung câu gốc — học viên chỉ xem được khi đã kiểm tra hoặc bấm "Hiện đáp án".
    segments: segments.map((s) => {
      const r = resultMap.get(String(s._id));
      return {
        _id: s._id,
        order: s.order,
        audioUrl: s.audioUrl,
        wordCount: s.text.split(/\s+/).filter(Boolean).length,
        bestAccuracy: r?.attempts ? r.bestAccuracy : null,
        usedHint: Boolean(r?.usedHint),
      };
    }),
    summary: lessonSummary(segments.length, progress),
  });
}

/** Chấm một câu: server so khớp và lưu kết quả tốt nhất của học viên. */
async function checkSegment(req, res) {
  const segment = await DictationSegment.findById(req.params.segmentId);
  if (!segment) return res.status(404).json({ message: 'Không tìm thấy câu.' });

  const result = compare(segment.text, req.body.typed ?? '');

  const progress = await findOrCreateProgress(req.user._id, segment.lesson);
  const entry = segmentEntry(progress, segment._id);
  entry.attempts += 1;
  entry.bestAccuracy = Math.max(entry.bestAccuracy, result.accuracy);

  // Hoàn thành bài khi mọi câu đều đạt ngưỡng.
  const total = await DictationSegment.countDocuments({ lesson: segment.lesson });
  const passed = progress.segments.filter((s) => s.bestAccuracy >= PASS_ACCURACY).length;
  if (passed >= total && !progress.completedAt) progress.completedAt = new Date();

  await progress.save();

  res.json({ ...result, transcript: segment.text, translation: segment.translation });
}

/** Hiện đáp án khi học viên bỏ cuộc — ghi nhận là đã xem đáp án nhưng không tính điểm. */
async function revealSegment(req, res) {
  const segment = await DictationSegment.findById(req.params.segmentId);
  if (!segment) return res.status(404).json({ message: 'Không tìm thấy câu.' });

  // Cờ usedHint do server tự ghi, không nhận từ client, để học viên không tự xóa được.
  const progress = await findOrCreateProgress(req.user._id, segment.lesson);
  segmentEntry(progress, segment._id).usedHint = true;
  await progress.save();

  res.json({ transcript: segment.text, translation: segment.translation });
}

async function findOrCreateProgress(studentId, lessonId) {
  const progress = await DictationProgress.findOne({ student: studentId, lesson: lessonId });
  return progress ?? new DictationProgress({ student: studentId, lesson: lessonId, segments: [] });
}

/** Lấy kết quả của một câu trong tiến độ, chưa có thì thêm mới (0 lượt gõ). */
function segmentEntry(progress, segmentId) {
  let entry = progress.segments.find((s) => String(s.segment) === String(segmentId));
  if (!entry) {
    progress.segments.push({ segment: segmentId, bestAccuracy: 0, attempts: 0, usedHint: false });
    entry = progress.segments[progress.segments.length - 1];
  }
  return entry;
}

module.exports = { listLessons, getLesson, checkSegment, revealSegment, PASS_ACCURACY };
