import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

const VirtualScrollList = ({ 
  items, 
  renderItem, 
  itemHeight = 100,
  containerHeight = 600,
  className = '',
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRect, setContainerRect] = useState({ height: containerHeight });
  const containerRef = useRef();

  // Calculate visible range with overscan
  const visibleRange = useMemo(() => {
    const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEnd = Math.min(
      items.length,
      Math.ceil((scrollTop + containerRect.height) / itemHeight) + overscan
    );
    return { start: visibleStart, end: visibleEnd };
  }, [scrollTop, containerRect.height, itemHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange.start, visibleRange.end]);

  // Total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  // Throttled scroll handler
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerRect({
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ 
        height: containerHeight,
        contain: 'strict'
      }}
      onScroll={handleScroll}
    >
      <div 
        style={{ 
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            willChange: 'transform'
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                position: 'relative'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollList;
