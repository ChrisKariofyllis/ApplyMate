import { cn } from "@/lib/utils";

type BadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  new: "bg-slate-100 text-slate-700",
  analyzed: "bg-blue-50 text-blue-800",
  matched: "bg-blue-100 text-blue-900",
  exported: "bg-emerald-50 text-emerald-800",
  draft: "bg-amber-50 text-amber-800",
  strong_match: "bg-emerald-50 text-emerald-800",
  "strong match": "bg-emerald-50 text-emerald-800",
  good_match: "bg-blue-50 text-blue-800",
  "good match": "bg-blue-50 text-blue-800",
  possible: "bg-amber-50 text-amber-800",
  long_shot: "bg-slate-100 text-slate-700",
  "long shot": "bg-slate-100 text-slate-700",
};

export function Badge({ status, className }: BadgeProps) {
  const normalized = status.trim().toLowerCase();
  const style = statusStyles[normalized] ?? "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
