import React from 'react';
import type { SmartSnapLine, EqualSpacingIndicator } from '../../types/editor';

interface SmartGuidesOverlayProps {
  snapLines: SmartSnapLine[];
  equalSpacings: EqualSpacingIndicator[];
}

export const SmartGuidesOverlay: React.FC<SmartGuidesOverlayProps> = ({
  snapLines,
  equalSpacings,
}) => {
  if (snapLines.length === 0 && equalSpacings.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
      {/* 1. Dynamic Magnetic Snap Lines */}
      {snapLines.map((line, idx) => {
        const isVertical = line.type === 'vertical';
        const color = line.color || '#ec4899'; // Figma Magenta

        return (
          <div
            key={`snap-${idx}`}
            className="absolute pointer-events-none transition-none"
            style={
              isVertical
                ? {
                    left: `${line.position}px`,
                    top: 0,
                    bottom: 0,
                    width: '1px',
                  }
                : {
                    top: `${line.position}px`,
                    left: 0,
                    right: 0,
                    height: '1px',
                  }
            }
          >
            {/* Snap Line Beam */}
            <div
              className="w-full h-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}`,
              }}
            />

            {/* Snap Line Label Badge */}
            {line.label && (
              <div
                className={`absolute px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-white shadow-xl pointer-events-none whitespace-nowrap border backdrop-blur-sm ${
                  isVertical
                    ? 'top-3 left-1/2 -translate-x-1/2'
                    : 'left-4 -top-6'
                }`}
                style={{
                  backgroundColor: color,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {line.label} • {line.position}px
              </div>
            )}
          </div>
        );
      })}

      {/* 2. Equal Spacing Distribution Indicators */}
      {equalSpacings.map((spacing, idx) => {
        const isHorizontal = spacing.axis === 'x';
        const length = spacing.end - spacing.start;

        return (
          <div
            key={`eq-${idx}`}
            className="absolute pointer-events-none z-45"
            style={
              isHorizontal
                ? {
                    left: `${spacing.start}px`,
                    top: `${spacing.centerSpan}px`,
                    width: `${length}px`,
                    height: '1px',
                  }
                : {
                    top: `${spacing.start}px`,
                    left: `${spacing.centerSpan}px`,
                    height: `${length}px`,
                    width: '1px',
                  }
            }
          >
            {/* Guide line connecting equal gap objects */}
            <div className="w-full h-full bg-violet-400 border-t border-dashed border-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />

            {/* Equal Spacing Pill */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-mono font-bold shadow-lg border border-violet-300 flex items-center gap-1">
              <span>=</span>
              <span>{spacing.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
