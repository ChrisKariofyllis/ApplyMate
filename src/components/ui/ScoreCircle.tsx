import { cn } from "@/lib/utils";

type ScoreCircleProps = {
  score: number;
  size?: "sm" | "md" | "lg";
};

function clampScore(score: number): number {
  if (Number.isNaN(score)) {
    return 0;
  }
  return Math.min(10, Math.max(0, score));
}

function getScoreColor(score: number): string {
  if (score <= 3) {
    return "#dc2626";
  }
  if (score <= 6) {
    return "#d97706";
  }
  if (score <= 8) {
    return "#2563eb";
  }
  return "#16a34a";
}

const sizeClasses = {
  sm: "h-16 w-16 text-sm",
  md: "h-24 w-24 text-base",
  lg: "h-32 w-32 text-lg",
};

export function ScoreCircle({ score, size = "md" }: ScoreCircleProps) {
  const clamped = clampScore(score);
  const color = getScoreColor(clamped);
  const percent = (clamped / 10) * 100;
  const display = Number.isInteger(clamped)
    ? String(clamped)
    : clamped.toFixed(1);

  return (
    <div
      role="img"
      aria-label={`Match score ${display} out of 10`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shadow-sm",
        sizeClasses[size]
      )}
      style={{
        background: `conic-gradient(${color} ${percent}%, #e2e8f0 ${percent}% 100%)`,
      }}
    >
      <div className="absolute inset-[10%] flex items-center justify-center rounded-full bg-white">
        <span className="font-semibold text-slate-900">
          {display}
          <span className="text-slate-500">/10</span>
        </span>
      </div>
    </div>
  );
}
