import React, { useState, useEffect } from 'react';

interface ReadingProgressBarProps {
  color?: string;
  height?: number;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  color = 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
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
        className="h-full transition-all duration-75 shadow-sm"
        style={{
          width: `${scrollProgress}%`,
          background: color,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
        }}
      />
    </div>
  );
};
