import React, { useRef, useEffect, useState } from 'react';

interface WheelPickerProps {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  itemHeight?: number;
  className?: string;
  label?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  value,
  onChange,
  options,
  itemHeight = 40,
  className = '',
  label
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const visibleCount = 3; // Always center the selected value
  const padCount = Math.floor(visibleCount / 2);
  const paddedOptions = [
    ...Array(padCount).fill(null),
    ...options,
    ...Array(padCount).fill(null),
  ];

  // Track the current center index
  const [centerIdx, setCenterIdx] = useState(() => {
    const initialIdx = options.indexOf(value);
    return initialIdx !== -1 ? initialIdx + padCount : padCount;
  });
  
  // Track if component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // Snap-to-center timer
  const snapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
    const idx = options.indexOf(value);
    if (listRef.current && idx !== -1) {
      const newCenterIdx = idx + padCount;
      setCenterIdx(newCenterIdx);
      // Force immediate scroll on mount
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTo({
            top: newCenterIdx * itemHeight,
            behavior: 'auto',
          });
        }
      }, 0);
    }
  }, []);

  // Value change effect
  useEffect(() => {
    if (!isMounted) return;
    const idx = options.indexOf(value);
    if (listRef.current && idx !== -1) {
      const newCenterIdx = idx + padCount;
      setCenterIdx(newCenterIdx);
      listRef.current.scrollTo({
        top: newCenterIdx * itemHeight,
        behavior: 'smooth',
      });
    }
  }, [value, options, itemHeight, padCount, isMounted]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (snapTimeout.current) clearTimeout(snapTimeout.current);
    snapTimeout.current = setTimeout(() => {
      if (listRef.current) {
        const scrollTop = listRef.current.scrollTop;
        const nearestIdx = Math.round(scrollTop / itemHeight);
        setCenterIdx(nearestIdx);
        const newValue = paddedOptions[nearestIdx];
        if (newValue !== null && newValue !== value) {
          onChange(newValue);
        } else {
          // Even if value is the same, snap to the correct position
          const snapTop = nearestIdx * itemHeight;
          listRef.current.scrollTo({
            top: snapTop,
            behavior: 'smooth',
          });
        }
      }
    }, 120); // 120ms after scroll stops
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (snapTimeout.current) clearTimeout(snapTimeout.current);
    };
  }, []);

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ width: itemHeight * 2.2, minWidth: itemHeight * 2.2 }}
    >
      {label && <span className="text-xs text-muted-foreground mb-1">{label}</span>}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="relative overflow-y-scroll rounded-xl bg-muted shadow-lg no-scrollbar"
        style={{
          height: itemHeight * visibleCount,
          width: '100%',
          maxWidth: '100%',
          padding: 0,
          margin: 0,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        tabIndex={0}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>
        <div style={{ height: itemHeight * paddedOptions.length, width: '100%' }}>
          {paddedOptions.map((opt, i) => {
            const isSelected = i === centerIdx; // Only highlight the center cell
            // Fade for non-selected values
            const distance = Math.abs(centerIdx - i);
            const fade = opt === null ? 0 : distance === 0 ? 1 : distance === 1 ? 0.5 : 0.2;
            return (
              <div
                key={i + '-' + opt}
                className={`flex items-center justify-center select-none transition-all duration-200 ${
                  isSelected
                    ? 'text-primary font-extrabold z-10'
                    : 'text-muted-foreground'
                }`}
                style={{
                  height: itemHeight,
                  fontSize: isSelected ? 32 : 20,
                  opacity: fade,
                  background: isSelected
                    ? 'linear-gradient(90deg, #232323 0%, #232323 100%)'
                    : 'transparent',
                  borderRadius: isSelected ? 12 : 0,
                  boxShadow: isSelected
                    ? '0 2px 12px 0 rgba(255,214,0,0.18), 0 0px 0px 0 #FFD600'
                    : 'none',
                  transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
                  margin: 0,
                  padding: 0,
                  color: isSelected ? '#FFD600' : undefined,
                }}
              >
                {opt !== null ? opt : ''}
              </div>
            );
          })}
        </div>
        {/* Center highlight overlay */}
        <div
          className="pointer-events-none absolute left-0 right-0 flex items-center justify-center"
          style={{
            top: itemHeight * padCount,
            height: itemHeight,
            zIndex: 20,
            borderRadius: 12,
            boxShadow: '0 0 0 2px #FFD600, 0 2px 12px 0 rgba(255,214,0,0.10)',
            background: 'rgba(255,214,0,0.04)',
            borderTop: '2px solid #FFD600',
            borderBottom: '2px solid #FFD600',
          }}
        />
      </div>
    </div>
  );
}; 