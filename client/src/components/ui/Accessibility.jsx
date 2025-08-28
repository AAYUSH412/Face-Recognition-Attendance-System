import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Skip Link component for keyboard navigation
export const SkipLink = ({ href = "#main-content", children = "Skip to main content" }) => {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-primary text-white px-4 py-2 rounded-md z-50 font-medium
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      {children}
    </a>
  );
};

// Live Region component for dynamic content announcements
export const LiveRegion = ({ 
  children, 
  politeness = 'polite', 
  atomic = false,
  relevant = 'additions text',
  className 
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
};

// Screen Reader Only component
export const ScreenReaderOnly = ({ children, className }) => {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
};

// Focus Trap component for modals and dialogs
export const FocusTrap = ({ children, isActive = true, initialFocus, restoreFocus = true }) => {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus initial element or first focusable element
    if (initialFocus && container.contains(initialFocus)) {
      initialFocus.focus();
    } else if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab (backward)
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab (forward)
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when component unmounts
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive, initialFocus, restoreFocus]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

// High Contrast Mode Toggle
export const HighContrastToggle = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('high-contrast');
    if (saved === 'true') {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
      localStorage.setItem('high-contrast', 'true');
    } else {
      document.documentElement.classList.remove('high-contrast');
      localStorage.setItem('high-contrast', 'false');
    }
  };

  return (
    <button
      onClick={toggleHighContrast}
      className="p-2 rounded-md border border-border hover:bg-accent focus:outline-none 
                 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
      </svg>
    </button>
  );
};

// Reduced Motion Toggle
export const ReducedMotionToggle = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const saved = localStorage.getItem('reduced-motion');
    if (saved === 'true') {
      setIsReducedMotion(true);
      document.documentElement.classList.add('reduce-motion');
    }

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleReducedMotion = () => {
    const newValue = !isReducedMotion;
    setIsReducedMotion(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
      localStorage.setItem('reduced-motion', 'true');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      localStorage.setItem('reduced-motion', 'false');
    }
  };

  return (
    <button
      onClick={toggleReducedMotion}
      className="p-2 rounded-md border border-border hover:bg-accent focus:outline-none 
                 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label={`${isReducedMotion ? 'Enable' : 'Disable'} animations`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6" />
        <path d="m9 9 3 3 3-3" />
      </svg>
    </button>
  );
};

// Font Size Adjustment
export const FontSizeAdjuster = () => {
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    const saved = localStorage.getItem('font-size') || 'medium';
    setFontSize(saved);
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    
    const sizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl'
    }[saved];
    
    if (sizeClass) {
      document.documentElement.classList.add(sizeClass);
    }
  }, []);

  const changeFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('font-size', size);
    
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    
    const sizeClass = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
      'extra-large': 'text-xl'
    }[size];
    
    if (sizeClass) {
      document.documentElement.classList.add(sizeClass);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="font-size-select" className="text-sm font-medium">
        Font Size:
      </label>
      <select
        id="font-size-select"
        value={fontSize}
        onChange={(e) => changeFontSize(e.target.value)}
        className="px-3 py-1 border border-border rounded-md bg-background text-foreground
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
        <option value="extra-large">Extra Large</option>
      </select>
    </div>
  );
};

// Accessibility Panel
export const AccessibilityPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <FocusTrap isActive={isOpen}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Accessibility Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Close accessibility panel"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">High Contrast</label>
                <HighContrastToggle />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Reduce Motion</label>
                <ReducedMotionToggle />
              </div>
              
              <FontSizeAdjuster />
            </div>
          </div>
        </FocusTrap>
      </div>
    </AnimatePresence>,
    document.body
  );
};

// Accessibility Floating Button
export const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg
                   hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-primary z-40 transition-colors"
        aria-label="Open accessibility settings"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6" />
          <path d="M3 12h6m6 0h6" />
        </svg>
      </button>
      
      <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default {
  SkipLink,
  LiveRegion,
  ScreenReaderOnly,
  FocusTrap,
  HighContrastToggle,
  ReducedMotionToggle,
  FontSizeAdjuster,
  AccessibilityPanel,
  AccessibilityButton
};
