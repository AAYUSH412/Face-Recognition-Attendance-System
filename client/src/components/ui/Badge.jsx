import { cn } from "../../lib/utils";

const Badge = ({ 
  className, 
  variant = "default", 
  size = "default",
  children,
  ...props 
}) => {
  const getVariantStyles = (variant) => {
    const variants = {
      default: "bg-primary-100 text-primary-800 border-primary-200",
      secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
      success: "bg-success-100 text-success-800 border-success-200",
      warning: "bg-warning-100 text-warning-800 border-warning-200",
      error: "bg-error-100 text-error-800 border-error-200",
      outline: "text-text-primary border-border-light bg-transparent",
    };
    return variants[variant] || variants.default;
  };

  const getSizeStyles = (size) => {
    const sizes = {
      default: "px-2.5 py-0.5 text-xs",
      sm: "px-2 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };
    return sizes[size] || sizes.default;
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        "transition-colors duration-200",
        getVariantStyles(variant),
        getSizeStyles(size),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
