import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  loading = false,
  disabled = false,
  children,
  ...props 
}, ref) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = (variant) => {
    const variants = {
      default: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
      destructive: "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500",
      outline: "border border-border-light bg-background-primary text-text-primary hover:bg-background-secondary",
      secondary: "bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500",
      ghost: "text-text-primary hover:bg-background-secondary",
      link: "text-primary-600 underline-offset-4 hover:underline",
    };
    return variants[variant] || variants.default;
  };

  const getSizeStyles = (size) => {
    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
      xl: "h-14 px-8 text-lg",
      icon: "h-10 w-10",
    };
    return sizes[size] || sizes.default;
  };

  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-95",
        // Variant styles
        getVariantStyles(variant),
        // Size styles
        getSizeStyles(size),
        className
      )}
      disabled={isDisabled}
      ref={ref}
      {...props}
    >
      {loading && (
        <Loader2 className={cn(
          "animate-spin",
          size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
          children ? "mr-2" : ""
        )} />
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
export default Button;
