import { cn } from "@/lib/utils";

type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-5 shadow-sm transition-colors duration-200 hover:border-cyan-500/40 sm:p-6",
        className
      )}
    >
      {title ? (
        <h2 className="mb-4 text-lg font-bold tracking-tight text-cyan-400">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
