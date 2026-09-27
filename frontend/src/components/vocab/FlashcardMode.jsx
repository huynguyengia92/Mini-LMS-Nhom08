import { useState } from 'react';
import { Check, RotateCw, Volume2, X } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

/** Lật thẻ để xem nghĩa, rồi tự đánh giá đã nhớ hay chưa (spaced repetition). */
export default function FlashcardMode({ words, onReview, onFinish }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState({ remembered: 0, forgot: 0 });

  const word = words[index];
  if (!word) return null;

  async function answer(remembered) {
    await onReview(word._id, remembered);
    setResult((r) => ({
      remembered: r.remembered + (remembered ? 1 : 0),
      forgot: r.forgot + (remembered ? 0 : 1),
    }));

    if (index + 1 >= words.length) {
      onFinish({
        remembered: result.remembered + (remembered ? 1 : 0),
        forgot: result.forgot + (remembered ? 0 : 1),
      });
      return;
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Thẻ {index + 1}/{words.length}
          </span>
          <span className="text-ink-500">
            <span className="font-semibold text-emerald-600">{result.remembered}</span> nhớ ·{' '}
            <span className="font-semibold text-rose-600">{result.forgot}</span> quên
          </span>
        </div>
        <ProgressBar value={(index / words.length) * 100} size="sm" />
      </div>

      {/* Thẻ từ */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-72 w-full flex-col items-center justify-center rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-card transition-shadow hover:shadow-lift"
      >
        {!flipped ? (
          <>
            <p className="text-4xl font-bold tracking-tight text-ink-900">{word.word}</p>
            {word.pronunciation && (
              <p className="mt-2 flex items-center gap-2 text-sm text-ink-500">
                <Volume2 className="h-4 w-4" />
                {word.pronunciation}
              </p>
            )}
            {word.wordType && (
              <span className="mt-3 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600">
                {word.wordType}
              </span>
            )}
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-400">
              <RotateCw className="h-3.5 w-3.5" />
              Bấm vào thẻ để xem nghĩa
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-brand-700">{word.meaning}</p>
            {word.example && (
              <div className="mt-6 max-w-lg rounded-xl bg-ink-50 p-4 text-left">
                <p className="text-sm leading-relaxed text-ink-800">{word.example}</p>
                {word.exampleMeaning && (
                  <p className="mt-1.5 text-sm text-ink-500">{word.exampleMeaning}</p>
                )}
              </div>
            )}
            <p className="mt-6 text-xs text-ink-400">Bạn có nhớ từ này không?</p>
          </>
        )}
      </button>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" onClick={() => answer(false)} className="border-rose-200 text-rose-700 hover:bg-rose-50">
          <X className="h-4 w-4" />
          Chưa nhớ
        </Button>
        <Button variant="success" size="lg" onClick={() => answer(true)}>
          <Check className="h-4 w-4" />
          Đã nhớ
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-400">
        Từ bạn chưa nhớ sẽ được lặp lại sớm; từ đã nhớ nhiều lần sẽ giãn dần khoảng cách ôn.
      </p>
    </div>
  );
}
