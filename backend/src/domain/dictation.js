/**
 * So khớp bài chép chính tả với câu gốc ở mức từ, dùng dãy con chung dài nhất (LCS)
 * để chịu được việc học viên gõ thiếu hoặc thừa từ mà vẫn căn đúng các từ còn lại.
 */

/**
 * Chuẩn hóa để so sánh: không phân biệt hoa thường, bỏ dấu câu và cả dấu nháy.
 * Bỏ dấu nháy vì đây là bài NGHE — "I'm"/"im", "it's"/"its" phát âm y hệt nhau,
 * học viên nghe đúng thì không nên bị trừ điểm vì cách gõ.
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/['’‘]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/(^|\s)-+|-+(\s|$)/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Tách câu gốc thành từ để hiển thị (giữ nguyên hoa thường và dấu câu như bản gốc). */
function displayWords(text) {
  return text.split(/\s+/).filter(Boolean);
}

/**
 * @returns {{ accuracy:number, correct:number, total:number,
 *   tokens: Array<{ word:string, status:'correct'|'missing'|'wrong'|'extra', typed?:string }> }}
 */
function compare(expectedText, typedText) {
  const expectedDisplay = displayWords(expectedText);
  const expected = expectedDisplay.map((w) => normalize(w).join(''));
  const typedDisplay = displayWords(typedText ?? '');
  const typed = typedDisplay.map((w) => normalize(w).join(''));

  const n = expected.length;
  const m = typed.length;

  // Bảng LCS: dp[i][j] = độ dài LCS của expected[i..] và typed[j..]
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = expected[i] && expected[i] === typed[j]
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // Truy vết để gán trạng thái cho từng từ.
  const raw = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (expected[i] && expected[i] === typed[j]) {
      raw.push({ word: expectedDisplay[i], status: 'correct' });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ word: expectedDisplay[i], status: 'missing' });
      i += 1;
    } else {
      raw.push({ word: typedDisplay[j], status: 'extra' });
      j += 1;
    }
  }
  while (i < n) raw.push({ word: expectedDisplay[i++], status: 'missing' });
  while (j < m) raw.push({ word: typedDisplay[j++], status: 'extra' });

  // Giữa hai từ đúng liên tiếp là một "khoảng lệch" gồm các từ thiếu và từ thừa.
  // Ghép lần lượt từng từ thiếu với từng từ thừa trong cùng khoảng thành "gõ sai"
  // (vd "scheduled for" → "schedule on" thành 2 lỗi sai, không phải thiếu + thừa lẫn lộn).
  const tokens = [];
  let gapMissing = [];
  let gapExtra = [];

  const flushGap = () => {
    const pairs = Math.min(gapMissing.length, gapExtra.length);
    for (let k = 0; k < pairs; k += 1) {
      tokens.push({ word: gapMissing[k].word, status: 'wrong', typed: gapExtra[k].word });
    }
    for (let k = pairs; k < gapMissing.length; k += 1) tokens.push(gapMissing[k]);
    for (let k = pairs; k < gapExtra.length; k += 1) tokens.push(gapExtra[k]);
    gapMissing = [];
    gapExtra = [];
  };

  for (const token of raw) {
    if (token.status === 'correct') {
      flushGap();
      tokens.push(token);
    } else if (token.status === 'missing') {
      gapMissing.push(token);
    } else {
      gapExtra.push(token);
    }
  }
  flushGap();

  const correct = tokens.filter((t) => t.status === 'correct').length;
  const total = n;
  // Gõ thừa từ cũng bị trừ để tránh gõ bừa nhiều từ cho khớp.
  const extra = tokens.filter((t) => t.status === 'extra').length;
  const accuracy = total ? Math.max(0, Math.round(((correct - extra * 0.5) / total) * 100)) : 0;

  return { accuracy, correct, total, tokens };
}

module.exports = { compare, normalize };
