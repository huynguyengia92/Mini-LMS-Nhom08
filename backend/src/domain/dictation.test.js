/**
 * Kiểm thử thuật toán chấm chép chính tả. Chạy: node src/domain/dictation.test.js
 * (dùng node:test có sẵn trong Node, không cần cài thêm thư viện).
 */
const test = require('node:test');
const assert = require('node:assert');
const { compare } = require('./dictation');

const SENTENCE = 'Friday works for me, but could we make it eleven instead?';

const statuses = (result) => result.tokens.map((t) => t.status);

test('gõ đúng hết thì 100%, không phân biệt hoa thường và dấu câu', () => {
  const r = compare(SENTENCE, 'friday works for me but could we make it eleven instead');
  assert.strictEqual(r.accuracy, 100);
  assert.ok(statuses(r).every((s) => s === 'correct'));
});

test('bỏ qua dấu nháy vì phát âm giống nhau (I\'m = im)', () => {
  const r = compare("I'm sure it's fine.", 'im sure its fine');
  assert.strictEqual(r.accuracy, 100);
});

test('thiếu một từ được đánh dấu missing', () => {
  const r = compare(SENTENCE, 'Friday works for me, could we make it eleven instead?');
  const missing = r.tokens.filter((t) => t.status === 'missing');
  assert.deepStrictEqual(missing.map((t) => t.word), ['but']);
});

test('gõ nhầm một từ được ghép thành wrong kèm từ đã gõ', () => {
  const r = compare(SENTENCE, 'Friday works for me, but could we make it seven instead?');
  const wrong = r.tokens.filter((t) => t.status === 'wrong');
  assert.strictEqual(wrong.length, 1);
  assert.strictEqual(wrong[0].word, 'eleven');
  assert.strictEqual(wrong[0].typed, 'seven');
});

test('hai từ sai liền nhau được ghép đúng từng cặp, không lệch thành thiếu + thừa', () => {
  const r = compare(
    "Hi David, I'm calling about the budget meeting scheduled for Thursday morning.",
    'hi david im calling about the budget meeting schedule on thursday morning',
  );
  const wrong = r.tokens.filter((t) => t.status === 'wrong').map((t) => `${t.typed}->${t.word}`);
  assert.deepStrictEqual(wrong, ['schedule->scheduled', 'on->for']);
  assert.ok(!statuses(r).includes('missing'));
  assert.ok(!statuses(r).includes('extra'));
  assert.strictEqual(r.accuracy, 83); // 10/12 từ đúng
});

test('gõ thừa từ bị trừ nửa điểm mỗi từ thừa', () => {
  const r = compare(SENTENCE, 'Friday works for me, but could we make it at eleven instead?');
  assert.deepStrictEqual(r.tokens.filter((t) => t.status === 'extra').map((t) => t.word), ['at']);
  assert.strictEqual(r.accuracy, 95); // (11 - 0.5) / 11
});

test('bỏ trống thì 0% và mọi từ đều thiếu', () => {
  const r = compare(SENTENCE, '');
  assert.strictEqual(r.accuracy, 0);
  assert.ok(statuses(r).every((s) => s === 'missing'));
});
