import { cn } from "@/lib/utils";

type BadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  new: "border-slate-500/50 bg-slate-500/10 text-slate-300",
  analyzed: "border-cyan-400/50 bg-cyan-500/10 text-cyan-300",
  matched: "border-cyan-400/60 bg-cyan-500/15 text-cyan-300",
  exported: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  draft: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  strong_match: "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  "strong match": "border-emerald-400/50 bg-emerald-500/10 text-emerald-300",
  good_match: "border-cyan-400/50 bg-cyan-500/10 text-cyan-300",
  "good match": "border-cyan-400/50 bg-cyan-500/10 text-cyan-300",
  possible: "border-amber-400/50 bg-amber-500/10 text-amber-300",
  long_shot: "border-slate-500/50 bg-slate-500/10 text-slate-300",
  "long shot": "border-slate-500/50 bg-slate-500/10 text-slate-300",
};

export function Badge({ status, className }: BadgeProps) {
  const normalized = status.trim().toLowerCase();
  const style =
    statusStyles[normalized] ??
    "border-slate-500/50 bg-slate-500/10 text-slate-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
