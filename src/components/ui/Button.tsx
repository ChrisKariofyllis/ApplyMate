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
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" &&
          "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
        className
      )}
    >
      {isLoading ? <LoadingSpinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
