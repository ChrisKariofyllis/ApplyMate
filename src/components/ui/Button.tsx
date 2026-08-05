"use client";

import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ButtonProps = {
  variant: "primary" | "secondary";
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export function Button({
  variant,
  isLoading = false,
  disabled = false,
  onClick,
  children,
  type = "button",
  className,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      onClick={() => {
        if (isLoading || disabled) {
          return;
        }
        onClick?.();
      }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:scale-[1.02] hover:from-cyan-400 hover:to-teal-400 hover:shadow-cyan-500/50 active:scale-[0.99]",
        variant === "secondary" &&
          "border border-cyan-500/70 bg-transparent text-cyan-400 hover:scale-[1.02] hover:bg-cyan-500/10 active:scale-[0.99]",
        className
      )}
    >
      {isLoading ? <LoadingSpinner className="h-4 w-4 text-current" /> : null}
      {children}
    </button>
  );
}
