import { cn } from "@/lib/utils";

type BadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  new: "bg-zinc-100 text-zinc-700",
  analyzed: "bg-sky-100 text-sky-800",
  matched: "bg-violet-100 text-violet-800",
  exported: "bg-emerald-100 text-emerald-800",
  draft: "bg-amber-100 text-amber-800",
};

export function Badge({ status, className }: BadgeProps) {
  const normalized = status.trim().toLowerCase();
  const style = statusStyles[normalized] ?? "bg-zinc-100 text-zinc-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
