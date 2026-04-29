type ScoreBadgeProps = {
  score: number;
};

function getTone(score: number) {
  if (score >= 75) {
    return {
      ring: "stroke-moss",
      text: "text-moss",
      trail: "stroke-moss/15"
    };
  }

  if (score >= 50) {
    return {
      ring: "stroke-gold",
      text: "text-gold",
      trail: "stroke-gold/15"
    };
  }

  return {
    ring: "stroke-ember",
    text: "text-ember",
    trail: "stroke-ember/15"
  };
}

function getProgress(score: number) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return { radius, circumference, offset };
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const tone = getTone(score);
  const { radius, circumference, offset } = getProgress(score);

  return (
    <div className="relative h-36 w-36">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          className={tone.trail}
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          strokeWidth="10"
        />
        <circle
          className={`${tone.ring} transition-all duration-700 ease-out`}
          cx="60"
          cy="60"
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="10"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full">
        <span className={`font-display text-3xl ${tone.text}`}>{score}%</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate">
          Match Score
        </span>
      </div>
    </div>
  );
}
