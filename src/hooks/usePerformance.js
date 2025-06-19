import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Performance optimization hook for smooth scrolling
 * Implements throttling, debouncing, and GPU optimization
 */
export const useScrollPerformance = () => {
  const rafId = useRef();
  const lastScrollTime = useRef(0);

  // Throttled scroll handler
  const throttledScrollHandler = useCallback((callback, delay = 16) => {
    return (...args) => {
      const now = Date.now();
      if (now - lastScrollTime.current >= delay) {
        lastScrollTime.current = now;
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
        rafId.current = requestAnimationFrame(() => callback(...args));
      }
    };
  }, []);

  // Optimize container for GPU acceleration
  const optimizeElement = useCallback((element) => {
    if (element) {
      element.style.willChange = 'transform';
      element.style.transform = 'translateZ(0)';
      element.style.backfaceVisibility = 'hidden';
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    throttledScrollHandler,
    optimizeElement
  };
};

/**
 * Virtual scrolling optimization for large lists
 */
export const useVirtualScrolling = (items, containerHeight = 600, itemHeight = 100) => {
  const containerRef = useRef();
  const scrollTop = useRef(0);

  const visibleStart = Math.floor(scrollTop.current / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e) => {
    scrollTop.current = e.target.scrollTop;
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  };
};

/**
 * Debounced state updates for better performance
 */
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return [debouncedValue, setValue];
};
