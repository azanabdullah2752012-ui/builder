import React, { useState, useEffect } from 'react';

interface ReadingProgressBarProps {
  color?: string;
  height?: number;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  color = '#10b981',
  height = 3,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const totalHeight = el.scrollHeight - el.clientHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY || el.scrollTop;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99990] pointer-events-none transition-all duration-75"
      style={{ height: `${height}px` }}
    >
      <div
        className="h-full transition-all duration-75"
        style={{
          width: `${scrollProgress}%`,
          background: color,
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.35)',
        }}
      />
    </div>
  );
};
