import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Trắc nghiệm: hiện từ tiếng Anh, chọn nghĩa đúng trong 4 lựa chọn. */
export default function QuizMode({ words, allWords, onReview, onFinish }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  const word = words[index];

  // Ba nghĩa gây nhiễu lấy từ các từ khác trong cùng list.
  const options = useMemo(() => {
    if (!word) return [];
    const distractors = shuffle(allWords.filter((w) => w._id !== word._id))
      .slice(0, 3)
      .map((w) => w.meaning);
    return shuffle([word.meaning, ...distractors]);
  }, [word, allWords]);

  if (!word) return null;

  async function pick(option) {
    if (picked) return;
    const isCorrect = option === word.meaning;
    setPicked(option);
    if (isCorrect) setCorrectCount((c) => c + 1);
    await onReview(word._id, isCorrect);
  }

  function next() {
    if (index + 1 >= words.length) {
      onFinish({ remembered: correctCount, forgot: words.length - correctCount });
      return;
    }
    setPicked(null);
    setIndex((i) => i + 1);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Câu {index + 1}/{words.length}
          </span>
          <span className="font-semibold text-emerald-600">{correctCount} đúng</span>
        </div>
        <ProgressBar value={(index / words.length) * 100} size="sm" />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center shadow-card">
        <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">Chọn nghĩa đúng</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-ink-900">{word.word}</p>
        {word.pronunciation && <p className="mt-1.5 text-sm text-ink-500">{word.pronunciation}</p>}
      </div>

      <div className="mt-4 space-y-2.5">
        {options.map((option) => {
          const isAnswer = option === word.meaning;
          const isPicked = picked === option;
          let tone = 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50';
          if (picked) {
            if (isAnswer) tone = 'border-emerald-400 bg-emerald-50';
            else if (isPicked) tone = 'border-rose-400 bg-rose-50';
            else tone = 'border-ink-200 bg-white opacity-60';
          }

          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(picked)}
              onClick={() => pick(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all ${tone}`}
            >
              <span className="text-ink-800">{option}</span>
              {picked && isAnswer && <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />}
              {picked && isPicked && !isAnswer && <XCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-4">
          {word.example && (
            <>
              <p className="text-sm leading-relaxed text-ink-800">{word.example}</p>
              {word.exampleMeaning && <p className="mt-1 text-sm text-ink-500">{word.exampleMeaning}</p>}
            </>
          )}
          <Button className="mt-4 w-full" onClick={next}>
            {index + 1 >= words.length ? 'Xem kết quả' : 'Câu tiếp theo'}
          </Button>
        </div>
      )}
    </div>
  );
}
