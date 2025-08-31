import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, useDragControls } from 'framer-motion';
import { cn } from '../../lib/utils';

// Advanced Modal with drag to dismiss
export const AdvancedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  draggable = false,
  closeOnEscape = true,
  closeOnBackdrop = true
}) => {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!closeOnEscape) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={closeOnBackdrop ? onClose : undefined}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            drag={draggable ? "y" : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className={cn(
              "relative bg-white rounded-lg shadow-xl w-full mx-4",
              sizeClasses[size]
            )}
          >
            {title && (
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  aria-label="Close modal"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Swipeable Cards
export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  threshold = 100 
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setStartX(clientX);
    setStartY(clientY);
    setCurrentX(clientX);
    setCurrentY(clientY);
    setIsDragging(true);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setCurrentX(clientX);
    setCurrentY(clientY);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const diffX = currentX - startX;
    const diffY = currentY - startY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (diffX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (diffY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
    
    setIsDragging(false);
    setCurrentX(0);
    setCurrentY(0);
  };

  const transform = isDragging 
    ? `translate(${currentX - startX}px, ${currentY - startY}px)`
    : 'translate(0px, 0px)';

  return (
    <div
      className="touch-none select-none cursor-grab active:cursor-grabbing transition-transform"
      style={{ transform }}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {children}
    </div>
  );
};

// Gesture-based Image Viewer
export const GestureImageViewer = ({ src, alt, className }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden cursor-zoom-in", className)}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img
        src={src}
        alt={alt}
        className="transition-transform duration-200 select-none"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
        }}
        draggable={false}
      />
    </div>
  );
};

// Advanced Tooltip with rich content
export const AdvancedTooltip = ({ 
  children, 
  content, 
  placement = 'top',
  trigger = 'hover',
  delay = 300,
  interactive = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (!interactive) {
      setIsVisible(false);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 100);
    }
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let x, y;

    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      default:
        x = triggerRect.left;
        y = triggerRect.top;
    }

    setPosition({ x, y });
  };

  const triggerProps = trigger === 'hover' 
    ? { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }
    : { onClick: () => setIsVisible(!isVisible) };

  return (
    <>
      <div ref={triggerRef} {...triggerProps}>
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-md px-3 py-2 shadow-lg pointer-events-none"
          style={{ left: position.x, top: position.y }}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          {content}
        </div>
      )}
    </>
  );
};

// Floating Action Button with menu
export const FloatingActionMenu = ({ 
  items = [], 
  placement = 'top',
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);


  const itemVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    })
  };

  const getItemPosition = (index) => {
    const angle = placement === 'top' ? Math.PI : 0;
    const spacing = 60;
    const x = Math.sin(angle + (index * Math.PI / (items.length - 1 || 1))) * spacing;
    const y = -Math.cos(angle + (index * Math.PI / (items.length - 1 || 1))) * spacing;
    
    return { x, y };
  };

  return (
    <div className={cn("relative", className)}>
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && items.map((item, index) => {
          const position = getItemPosition(index);
          return (
            <motion.button
              key={item.label}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute bg-white p-3 rounded-full shadow-lg 
                         hover:scale-110 transition-transform z-10"
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              aria-label={item.label}
            >
              {item.icon}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default {
  AdvancedModal,
  SwipeableCard,
  GestureImageViewer,
  AdvancedTooltip,
  FloatingActionMenu
};
