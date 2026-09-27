import { useState } from 'react';
import { CheckCircle2, Lightbulb, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Input } from '../ui/Field';
import ProgressBar from '../ui/ProgressBar';

/** Điền từ: hiện nghĩa tiếng Việt, học viên gõ lại từ tiếng Anh. */
export default function TypingMode({ words, onReview, onFinish }) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(null); // null | true | false
  const [hint, setHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const word = words[index];
  if (!word) return null;

  async function check(e) {
    e.preventDefault();
    if (checked !== null) return;

    const isCorrect = value.trim().toLowerCase() === word.word.trim().toLowerCase();
    setChecked(isCorrect);
    if (isCorrect) setCorrectCount((c) => c + 1);
    // Dùng gợi ý thì không tính là đã nhớ.
    await onReview(word._id, isCorrect && !hint);
  }

  function next() {
    if (index + 1 >= words.length) {
      onFinish({ remembered: correctCount, forgot: words.length - correctCount });
      return;
    }
    setIndex((i) => i + 1);
    setValue('');
    setChecked(null);
    setHint(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Từ {index + 1}/{words.length}
          </span>
          <span className="font-semibold text-emerald-600">{correctCount} đúng</span>
        </div>
        <ProgressBar value={(index / words.length) * 100} size="sm" />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <p className="text-center text-xs font-medium tracking-wide text-ink-400 uppercase">
          Gõ từ tiếng Anh tương ứng
        </p>
        <p className="mt-3 text-center text-2xl font-bold text-brand-700">{word.meaning}</p>
        {word.wordType && (
          <p className="mt-1.5 text-center text-sm text-ink-500">({word.wordType})</p>
        )}

        <form onSubmit={check} className="mt-6">
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nhập từ..."
            disabled={checked !== null}
            className={
              checked === true
                ? 'border-emerald-400 bg-emerald-50'
                : checked === false
                  ? 'border-rose-400 bg-rose-50'
                  : ''
            }
          />

          {hint && checked === null && (
            <p className="mt-2 text-center text-sm text-amber-700">
              Gợi ý: bắt đầu bằng <strong>{word.word.slice(0, 2)}</strong> · {word.word.length} ký tự
            </p>
          )}

          {checked === null ? (
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setHint(true)} disabled={hint}>
                <Lightbulb className="h-4 w-4" />
                Gợi ý
              </Button>
              <Button type="submit" className="flex-1" disabled={!value.trim()}>
                Kiểm tra
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                  checked ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {checked ? (
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                ) : (
                  <XCircle className="h-4.5 w-4.5 shrink-0" />
                )}
                <span>
                  {checked ? 'Chính xác!' : 'Chưa đúng — đáp án là '}
                  {!checked && <strong>{word.word}</strong>}
                </span>
              </div>

              {word.example && (
                <div className="mt-3 rounded-xl bg-ink-50 p-4">
                  <p className="text-sm leading-relaxed text-ink-800">{word.example}</p>
                  {word.exampleMeaning && (
                    <p className="mt-1 text-sm text-ink-500">{word.exampleMeaning}</p>
                  )}
                </div>
              )}

              <Button className="mt-4 w-full" onClick={next}>
                {index + 1 >= words.length ? 'Xem kết quả' : 'Từ tiếp theo'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
