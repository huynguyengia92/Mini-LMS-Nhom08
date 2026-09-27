const VocabSet = require('../models/VocabSet');
const VocabWord = require('../models/VocabWord');
const VocabProgress = require('../models/VocabProgress');
const { nextState, isDue } = require('../domain/spacedRepetition');

/** Gom tiến độ của học viên theo từng list để hiển thị Đã nhớ / Đang học / Cần ôn tập. */
async function statsForSets(studentId, setIds) {
  const progress = await VocabProgress.find({ student: studentId, set: { $in: setIds } });
  const map = new Map();
  for (const p of progress) {
    const key = String(p.set);
    if (!map.has(key)) map.set(key, { memorized: 0, learning: 0, due: 0 });
    const entry = map.get(key);
    if (p.status === 'MEMORIZED') entry.memorized += 1;
    else if (p.status === 'LEARNING') entry.learning += 1;
    if (isDue(p)) entry.due += 1;
  }
  return map;
}

async function listSets(req, res) {
  const sets = await VocabSet.find({ isPublic: true })
    .populate({ path: 'course', select: 'title slug' })
    .sort('createdAt');

  const wordCounts = await VocabWord.aggregate([
    { $match: { set: { $in: sets.map((s) => s._id) } } },
    { $group: { _id: '$set', n: { $sum: 1 } } },
  ]);
  const countMap = new Map(wordCounts.map((r) => [String(r._id), r.n]));

  const statsMap = req.user ? await statsForSets(req.user._id, sets.map((s) => s._id)) : new Map();

  res.json({
    sets: sets.map((set) => {
      const total = countMap.get(String(set._id)) ?? 0;
      const stats = statsMap.get(String(set._id)) ?? { memorized: 0, learning: 0, due: 0 };
      return {
        ...set.toJSON(),
        wordCount: total,
        memorized: stats.memorized,
        learning: stats.learning,
        // Từ chưa đụng tới cũng là từ cần học.
        due: stats.due + (total - stats.memorized - stats.learning),
      };
    }),
  });
}

async function getSet(req, res) {
  const set = await VocabSet.findById(req.params.id).populate({ path: 'course', select: 'title slug' });
  if (!set) return res.status(404).json({ message: 'Không tìm thấy list từ.' });

  const words = await VocabWord.find({ set: set._id }).sort('order');

  let progressMap = new Map();
  if (req.user) {
    const progress = await VocabProgress.find({ student: req.user._id, set: set._id });
    progressMap = new Map(progress.map((p) => [String(p.word), p]));
  }

  const enriched = words.map((w) => {
    const p = progressMap.get(String(w._id));
    return {
      ...w.toJSON(),
      status: p?.status ?? 'NEW',
      streak: p?.streak ?? 0,
      due: isDue(p),
      nextReviewAt: p?.nextReviewAt ?? null,
    };
  });

  res.json({
    set,
    words: enriched,
    summary: {
      total: enriched.length,
      memorized: enriched.filter((w) => w.status === 'MEMORIZED').length,
      learning: enriched.filter((w) => w.status === 'LEARNING').length,
      due: enriched.filter((w) => w.due).length,
    },
  });
}

/** Ghi nhận kết quả một lượt ôn: nhớ / chưa nhớ → cập nhật lịch ôn tiếp theo. */
async function reviewWord(req, res) {
  const { remembered } = req.body;
  const word = await VocabWord.findById(req.params.wordId);
  if (!word) return res.status(404).json({ message: 'Không tìm thấy từ.' });

  const current = (await VocabProgress.findOne({ student: req.user._id, word: word._id })) ?? {
    streak: 0,
    reviewCount: 0,
  };

  const updated = nextState(current, Boolean(remembered));

  const progress = await VocabProgress.findOneAndUpdate(
    { student: req.user._id, word: word._id },
    { ...updated, set: word.set, student: req.user._id, word: word._id },
    { upsert: true, new: true },
  );

  res.json({ progress });
}

/** Danh sách từ đến hạn ôn hôm nay trên toàn bộ các list — phục vụ "Ôn tập hàng ngày". */
async function dueToday(req, res) {
  const progress = await VocabProgress.find({ student: req.user._id }).populate('word');
  const dueWords = progress.filter((p) => p.word && isDue(p)).map((p) => p.word);

  // Bổ sung các từ chưa từng học trong những list học viên đã bắt đầu.
  const startedSetIds = [...new Set(progress.map((p) => String(p.set)))];
  const seenWordIds = new Set(progress.map((p) => String(p.word?._id)));
  const untouched = startedSetIds.length
    ? (await VocabWord.find({ set: { $in: startedSetIds } })).filter(
      (w) => !seenWordIds.has(String(w._id)),
    )
    : [];

  res.json({ words: [...dueWords, ...untouched].slice(0, 50) });
}

module.exports = { listSets, getSet, reviewWord, dueToday };
