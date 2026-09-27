/**
 * Lịch ôn tập giãn cách (spaced repetition) rút gọn theo tinh thần thuật toán Leitner:
 * mỗi lần nhớ đúng thì đẩy từ lên "hộp" cao hơn và giãn khoảng cách ôn, quên thì về hộp đầu.
 */
const INTERVALS_DAYS = [1, 2, 4, 8, 16, 30];

// Nhớ liên tiếp đủ số lần này thì coi như đã thuộc.
const MEMORIZED_STREAK = 4;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * @param {{streak:number, reviewCount:number}} current tiến độ hiện tại
 * @param {boolean} remembered học viên có nhớ từ này không
 */
function nextState(current, remembered) {
  const streak = remembered ? current.streak + 1 : 0;
  const intervalDays = remembered
    ? INTERVALS_DAYS[Math.min(streak - 1, INTERVALS_DAYS.length - 1)]
    : 0; // quên thì ôn lại ngay trong phiên hôm nay

  let status = 'LEARNING';
  if (streak >= MEMORIZED_STREAK) status = 'MEMORIZED';

  return {
    status,
    streak,
    reviewCount: current.reviewCount + 1,
    lastReviewedAt: new Date(),
    nextReviewAt: new Date(Date.now() + intervalDays * DAY_MS),
  };
}

/** Từ đến hạn ôn: chưa từng học, hoặc đã tới mốc nextReviewAt. */
function isDue(progress) {
  if (!progress) return true;
  if (progress.status === 'NEW') return true;
  if (!progress.nextReviewAt) return true;
  return progress.nextReviewAt.getTime() <= Date.now();
}

module.exports = { nextState, isDue, INTERVALS_DAYS, MEMORIZED_STREAK };
