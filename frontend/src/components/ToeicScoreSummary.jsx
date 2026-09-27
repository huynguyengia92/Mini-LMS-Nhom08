import { Award, BookOpen, Headphones, Info, TrendingDown } from 'lucide-react';
import Badge from './ui/Badge';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Alert } from './ui/Feedback';
import ProgressBar from './ui/ProgressBar';

function SkillCard({ icon: Icon, label, correct, total, score }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-sm text-ink-500">
        <Icon className="h-4 w-4" />
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-ink-900">
        {score != null ? score : '—'}
        {score != null && <span className="text-base font-medium text-ink-400">/495</span>}
      </p>
      <p className="mt-1 text-xs text-ink-500">
        Đúng {correct}/{total} câu
      </p>
    </div>
  );
}

export default function ToeicScoreSummary({ attempt, breakdown }) {
  const isFull = attempt.mode === 'FULL';
  const listeningTotal = breakdown.byPart
    .filter((p) => p.skill === 'LISTENING')
    .reduce((s, p) => s + p.total, 0);
  const readingTotal = breakdown.byPart
    .filter((p) => p.skill === 'READING')
    .reduce((s, p) => s + p.total, 0);

  // Dạng bài làm sai nhiều nhất — gợi ý học viên nên ôn phần nào.
  const weakTags = breakdown.byTag.filter((t) => t.correct < t.total).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Điểm tổng */}
      <Card className="overflow-hidden">
        <div
          className={`px-6 py-3 text-sm font-semibold text-white ${
            isFull ? 'bg-brand-600' : 'bg-ink-700'
          }`}
        >
          {isFull ? 'Kết quả full test — quy đổi thang 990' : 'Kết quả luyện tập từng phần'}
        </div>
        <CardBody>
          {isFull ? (
            <>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <div className="text-center">
                  <p className="text-sm text-ink-500">Tổng điểm ước tính</p>
                  <p className="mt-1 text-6xl font-bold tracking-tight text-brand-700">
                    {attempt.totalScore ?? '—'}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">trên thang 990</p>
                  {breakdown.proficiency && (
                    <Badge tone={breakdown.proficiency.tone} className="mt-3">
                      {breakdown.proficiency.label} · {breakdown.proficiency.level}
                    </Badge>
                  )}
                </div>

                <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
                  <SkillCard
                    icon={Headphones}
                    label="Listening"
                    correct={attempt.listeningCorrect ?? 0}
                    total={listeningTotal}
                    score={attempt.listeningScore}
                  />
                  <SkillCard
                    icon={BookOpen}
                    label="Reading"
                    correct={attempt.readingCorrect ?? 0}
                    total={readingTotal}
                    score={attempt.readingScore}
                  />
                </div>
              </div>

              {breakdown.estimated && (
                <Alert tone="info" className="mt-5">
                  Đề này ngắn hơn đề thi thật (200 câu) nên điểm quy đổi là{' '}
                  <strong>ước lượng</strong> dựa trên tỉ lệ câu đúng của từng kỹ năng.
                </Alert>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <p className="text-sm text-ink-500">Độ chính xác</p>
              <p className="text-5xl font-bold text-ink-900">{attempt.score}%</p>
              <Alert tone="info" className="mt-3 text-left">
                Chế độ luyện từng phần không quy đổi sang thang 990 — hãy làm <strong>full test</strong>{' '}
                để biết điểm ước tính của bạn.
              </Alert>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Kết quả theo từng part */}
      <Card>
        <CardHeader title="Kết quả theo từng phần thi" description="Phần nào có tỉ lệ đúng thấp là phần bạn nên ưu tiên ôn." />
        <CardBody className="space-y-4">
          {breakdown.byPart.map((part) => {
            const percent = part.total ? (part.correct / part.total) * 100 : 0;
            return (
              <div key={part.part}>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-800">
                    {part.skill === 'LISTENING' ? (
                      <Headphones className="h-4 w-4 text-ink-400" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-ink-400" />
                    )}
                    {part.name}
                  </span>
                  <span className="text-sm text-ink-600">
                    <strong className="text-ink-900">{part.correct}</strong>/{part.total} câu ·{' '}
                    {Math.round(percent)}%
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  size="sm"
                  tone={percent >= 80 ? 'success' : percent >= 50 ? 'warning' : 'danger'}
                />
              </div>
            );
          })}
        </CardBody>
      </Card>

      {/* Dạng bài cần cải thiện */}
      {weakTags.length > 0 && (
        <Card>
          <CardHeader
            title="Dạng bài cần cải thiện"
            description="Thống kê theo tag của từng câu hỏi trong đề."
          />
          <CardBody>
            <ul className="space-y-2.5">
              {weakTags.map((tag) => {
                const percent = (tag.correct / tag.total) * 100;
                return (
                  <li key={tag.tag} className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm text-ink-700">
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                      {tag.tag}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="w-28">
                        <ProgressBar
                          value={percent}
                          size="sm"
                          tone={percent >= 80 ? 'success' : percent >= 50 ? 'warning' : 'danger'}
                        />
                      </span>
                      <span className="w-14 text-right text-sm text-ink-600">
                        {tag.correct}/{tag.total}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      )}

      {isFull && attempt.totalScore != null && (
        <Card className="border-brand-200 bg-brand-50/50">
          <CardBody className="flex items-start gap-3">
            <Award className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm leading-relaxed text-ink-700">
              Điểm TOEIC được tính riêng cho Listening và Reading (mỗi kỹ năng 5–495 điểm), tổng tối đa
              990. Mốc <strong>450–600</strong> thường là yêu cầu tốt nghiệp của nhiều trường, còn{' '}
              <strong>700+</strong> là mức nhiều nhà tuyển dụng mong muốn.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
