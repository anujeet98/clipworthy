import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible validation / helper message below the field. */
  hint?: string;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { hint, invalid, className, id, ...props },
  ref,
) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11 w-full rounded-control bg-surface px-4 text-sm text-foreground",
          "border border-border placeholder:text-muted",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          invalid && "border-primary",
          className,
        )}
        {...props}
      />
      {hint && (
        <p className={cn("mt-2 text-xs", invalid ? "text-primary" : "text-muted")}>{hint}</p>
      )}
    </div>
  );
});
