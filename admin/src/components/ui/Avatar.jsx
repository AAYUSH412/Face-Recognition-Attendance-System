import { cn, getInitials } from '../../lib/utils';

export function Avatar({ 
  children, 
  className, 
  src, 
  alt, 
  name,
  size = 'default',
  ...props 
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };
  
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt || name || 'Avatar'}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <span className="font-medium text-muted-foreground">
            {children || (name ? getInitials(name) : '?')}
          </span>
        </div>
      )}
    </div>
  );
}
