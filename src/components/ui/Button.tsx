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
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100",
        className
      )}
    >
      {isLoading ? <LoadingSpinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
