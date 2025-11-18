import React, { Suspense, lazy, useEffect, useState, useRef, useCallback } from 'react';
import { LoadingSpinner } from './Animation';

// Lazy loading wrapper with error boundary
export const LazyComponent = ({ 
  importFunc, 
  fallback = <LoadingSpinner />, 
  errorFallback = <div>Error loading component</div> 
}) => {
  const LazyComponentInner = lazy(importFunc);
  
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponentInner />
      </Suspense>
    </ErrorBoundary>
  );
};

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Image optimization with lazy loading
export const OptimizedImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  placeholder = 'blur',
  blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0eH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKrABBMAA=',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [src]);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      {isLoading && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            filter: 'blur(5px)'
          }}
        />
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
          Failed to load image
        </div>
      ) : (
        <img
          ref={imgRef}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

// Virtual scrolling for large lists
export const VirtualizedList = ({ 
  items, 
  itemHeight = 50, 
  containerHeight = 400,
  renderItem,
  overscan = 5 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Debounced input hook (moved to separate file)
// import { useDebouncedValue } from '../../hooks/useDebouncedValue';

// Memoized component wrapper
export const MemoizedComponent = React.memo(({ children, ...props }) => {
  return <div {...props}>{children}</div>;
});

MemoizedComponent.displayName = 'MemoizedComponent';

// Performance monitor
export const PerformanceMonitor = ({ children }) => {
  return children;
};

// Preload component for critical resources
export const PreloadResources = ({ resources = [] }) => {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as || 'fetch';
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }, [resources]);

  return null;
};

// Bundle analyzer helper (development only)
export const BundleAnalyzer = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/webpack-bundle-analyzer@4.5.0/lib/bin/analyzer.js';
      script.async = true;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return null;
};

export default {
  LazyComponent,
  OptimizedImage,
  VirtualizedList,
  MemoizedComponent,
  PerformanceMonitor,
  PreloadResources,
  BundleAnalyzer
};
