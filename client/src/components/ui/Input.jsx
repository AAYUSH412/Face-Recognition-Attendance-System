import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(({ 
  className, 
  type = "text",
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border px-3 py-2 text-sm",
        "placeholder:text-text-muted",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all duration-200",
        // Default styles
        error 
          ? "border-error-300 bg-error-50 text-error-900 focus:border-error-500 focus:ring-error-500" 
          : "border-border-light bg-background-primary text-text-primary focus:border-primary-500 focus:ring-primary-500",
        disabled && "bg-background-secondary",
        className
      )}
      disabled={disabled}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;
