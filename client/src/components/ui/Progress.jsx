import { forwardRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils";

const Progress = forwardRef(({ 
  className, 
  value = 0, 
  max = 100,
  variant = "default",
  size = "default",
  showLabel = false,
  ...props 
}, ref) => {
  const getVariantStyles = (variant) => {
    const variants = {
      default: "bg-primary-600",
      secondary: "bg-secondary-600",
      success: "bg-success-600",
      warning: "bg-warning-600",
      error: "bg-error-600",
    };
    return variants[variant] || variants.default;
  };

  const getSizeStyles = (size) => {
    const sizes = {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
    };
    return sizes[size] || sizes.default;
  };

  const percentage = Math.round((value / max) * 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-background-tertiary",
          getSizeStyles(size),
          className
        )}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out",
            getVariantStyles(variant)
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export default Progress;
