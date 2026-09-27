/**
 * Cấu trúc chuẩn của đề TOEIC Listening & Reading (format công khai của bài thi):
 * 7 part, 200 câu, 120 phút — Listening 100 câu (~45 phút), Reading 100 câu (75 phút).
 */
const PARTS = [
  {
    part: 1,
    name: 'Part 1 — Mô tả tranh',
    skill: 'LISTENING',
    questionType: 'PART1_PHOTO',
    officialCount: 6,
    choiceCount: 4,
    grouped: false,
    needsAudio: true,
    description: 'Nghe 4 câu mô tả và chọn câu mô tả đúng bức tranh.',
  },
  {
    part: 2,
    name: 'Part 2 — Hỏi & đáp',
    skill: 'LISTENING',
    questionType: 'PART2_RESPONSE',
    officialCount: 25,
    choiceCount: 3,
    grouped: false,
    needsAudio: true,
    description: 'Nghe câu hỏi và chọn phản hồi phù hợp nhất.',
  },
  {
    part: 3,
    name: 'Part 3 — Hội thoại',
    skill: 'LISTENING',
    questionType: 'PART34_TALK',
    officialCount: 39,
    choiceCount: 4,
    grouped: true,
    needsAudio: true,
    description: 'Nghe đoạn hội thoại và trả lời 3 câu hỏi cho mỗi đoạn.',
  },
  {
    part: 4,
    name: 'Part 4 — Bài nói ngắn',
    skill: 'LISTENING',
    questionType: 'PART34_TALK',
    officialCount: 30,
    choiceCount: 4,
    grouped: true,
    needsAudio: true,
    description: 'Nghe bài nói ngắn và trả lời 3 câu hỏi cho mỗi bài.',
  },
  {
    part: 5,
    name: 'Part 5 — Hoàn thành câu',
    skill: 'READING',
    questionType: 'PART5_GRAMMAR',
    officialCount: 30,
    choiceCount: 4,
    grouped: false,
    needsAudio: false,
    description: 'Chọn từ/cụm từ đúng để hoàn thành câu.',
  },
  {
    part: 6,
    name: 'Part 6 — Hoàn thành đoạn văn',
    skill: 'READING',
    questionType: 'PART67_PASSAGE',
    officialCount: 16,
    choiceCount: 4,
    grouped: true,
    needsAudio: false,
    description: 'Điền từ, cụm từ hoặc câu vào chỗ trống trong đoạn văn.',
  },
  {
    part: 7,
    name: 'Part 7 — Đọc hiểu',
    skill: 'READING',
    questionType: 'PART67_PASSAGE',
    officialCount: 54,
    choiceCount: 4,
    grouped: true,
    needsAudio: false,
    description: 'Đọc một hoặc nhiều đoạn văn và trả lời các câu hỏi liên quan.',
  },
];

const PART_MAP = new Map(PARTS.map((p) => [p.part, p]));

const FULL_TEST_MINUTES = 120;

/**
 * Bảng quy đổi số câu đúng -> điểm thang 5..495 cho mỗi kỹ năng.
 * ETS không công bố bảng chính thức và mỗi đề có bảng riêng, nên đây là bảng
 * xấp xỉ tuyến tính từng đoạn theo các mốc thường gặp — đủ dùng cho mục đích luyện tập.
 */
const SCALE_ANCHORS = [
  { correct: 0, score: 5 },
  { correct: 10, score: 40 },
  { correct: 20, score: 90 },
  { correct: 30, score: 145 },
  { correct: 40, score: 200 },
  { correct: 50, score: 255 },
  { correct: 60, score: 310 },
  { correct: 70, score: 360 },
  { correct: 80, score: 405 },
  { correct: 90, score: 450 },
  { correct: 95, score: 475 },
  { correct: 100, score: 495 },
];

/** Nội suy tuyến tính giữa các mốc trong SCALE_ANCHORS. */
function toScaledScore(correctCount) {
  const correct = Math.max(0, Math.min(100, correctCount));
  for (let i = 0; i < SCALE_ANCHORS.length - 1; i += 1) {
    const lo = SCALE_ANCHORS[i];
    const hi = SCALE_ANCHORS[i + 1];
    if (correct >= lo.correct && correct <= hi.correct) {
      const ratio = (correct - lo.correct) / (hi.correct - lo.correct || 1);
      const raw = lo.score + ratio * (hi.score - lo.score);
      return Math.round(raw / 5) * 5; // điểm TOEIC là bội số của 5
    }
  }
  return 5;
}

/** Xếp loại trình độ theo tổng điểm 990 (tham chiếu thang màu chứng chỉ TOEIC). */
function proficiencyOf(totalScore) {
  if (totalScore >= 860) return { label: 'Thành thạo', level: 'C1', tone: 'success' };
  if (totalScore >= 730) return { label: 'Khá tốt', level: 'B2', tone: 'success' };
  if (totalScore >= 470) return { label: 'Trung bình', level: 'B1', tone: 'warning' };
  if (totalScore >= 220) return { label: 'Sơ cấp', level: 'A2', tone: 'warning' };
  return { label: 'Mới bắt đầu', level: 'A1', tone: 'danger' };
}

module.exports = { PARTS, PART_MAP, FULL_TEST_MINUTES, toScaledScore, proficiencyOf };
