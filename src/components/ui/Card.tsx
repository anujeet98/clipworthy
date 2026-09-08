import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Surface container with the standard border, radius, and shadow. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}
