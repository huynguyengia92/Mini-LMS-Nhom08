import { useEffect, useMemo, useState } from 'react';
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

const ROUND_SIZE = 6;

/** Tìm cặp: ghép từ tiếng Anh với nghĩa tiếng Việt, mỗi lượt 6 cặp. */
export default function MatchMode({ words, onReview, onFinish }) {
  const rounds = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < words.length; i += ROUND_SIZE) chunks.push(words.slice(i, i + ROUND_SIZE));
    return chunks;
  }, [words]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [mistakes, setMistakes] = useState({});

  const round = rounds[roundIndex] ?? [];
  const shuffledMeanings = useMemo(() => shuffle(round), [round]);

  // Ghép đủ cặp thì sang lượt kế tiếp (hoặc kết thúc).
  useEffect(() => {
    if (round.length === 0 || matched.length < round.length) return;
    const timer = setTimeout(async () => {
      for (const word of round) {
        // eslint-disable-next-line no-await-in-loop
        await onReview(word._id, !mistakes[word._id]);
      }
      if (roundIndex + 1 >= rounds.length) {
        const forgot = Object.keys(mistakes).length;
        onFinish({ remembered: words.length - forgot, forgot });
      } else {
        setRoundIndex((i) => i + 1);
        setMatched([]);
        setSelectedWord(null);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [matched, round, roundIndex, rounds.length, mistakes, onReview, onFinish, words.length]);

  function pickMeaning(word) {
    if (!selectedWord || matched.includes(word._id)) return;

    if (selectedWord._id === word._id) {
      setMatched((m) => [...m, word._id]);
      setSelectedWord(null);
    } else {
      setWrongPair(word._id);
      setMistakes((m) => ({ ...m, [selectedWord._id]: true }));
      setTimeout(() => setWrongPair(null), 500);
      setSelectedWord(null);
    }
  }

  const totalMatched = roundIndex * ROUND_SIZE + matched.length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-ink-500">
            Lượt {roundIndex + 1}/{rounds.length} · đã ghép {totalMatched}/{words.length}
          </span>
        </div>
        <ProgressBar value={(totalMatched / words.length) * 100} size="sm" />
      </div>

      <p className="mb-4 text-center text-sm text-ink-500">
        Bấm một từ bên trái, rồi bấm nghĩa tương ứng bên phải.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {round.map((word) => {
            const done = matched.includes(word._id);
            const active = selectedWord?._id === word._id;
            return (
              <button
                key={word._id}
                type="button"
                disabled={done}
                onClick={() => setSelectedWord(word)}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all',
                  done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-70'
                    : active
                      ? 'border-brand-500 bg-brand-50 text-brand-800 ring-2 ring-brand-100'
                      : 'border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50',
                ].join(' ')}
              >
                {word.word}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {shuffledMeanings.map((word) => {
            const done = matched.includes(word._id);
            const wrong = wrongPair === word._id;
            return (
              <button
                key={word._id}
                type="button"
                disabled={done}
                onClick={() => pickMeaning(word)}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all',
                  done
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 opacity-70'
                    : wrong
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
                ].join(' ')}
              >
                {word.meaning}
              </button>
            );
          })}
        </div>
      </div>

      {rounds.length > 1 && (
        <p className="mt-5 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const forgot = Object.keys(mistakes).length;
              onFinish({ remembered: totalMatched - forgot, forgot });
            }}
          >
            Kết thúc sớm
          </Button>
        </p>
      )}
    </div>
  );
}
