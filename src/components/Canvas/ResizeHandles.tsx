import React from 'react';
import type { ResizeHandleType } from '../../types/editor';

interface ResizeHandlesProps {
  onResizeStart: (handle: ResizeHandleType, e: React.MouseEvent) => void;
}

interface CornerHandleConfig {
  type: ResizeHandleType;
  cursor: string;
  style: React.CSSProperties;
}

interface EdgeHandleConfig {
  type: ResizeHandleType;
  cursor: string;
  style: React.CSSProperties;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onResizeStart }) => {
  // 4 corner handles (10x10 white squares with crisp 1.5px indigo border & shadow)
  const cornerHandles: CornerHandleConfig[] = [
    { type: 'nw', cursor: 'nwse-resize', style: { top: -5, left: -5 } },
    { type: 'ne', cursor: 'nesw-resize', style: { top: -5, right: -5 } },
    { type: 'se', cursor: 'nwse-resize', style: { bottom: -5, right: -5 } },
    { type: 'sw', cursor: 'nesw-resize', style: { bottom: -5, left: -5 } },
  ];

  // 4 edge handles (ergonomic pills for north/south and east/west)
  const edgeHandles: EdgeHandleConfig[] = [
    { type: 'n', cursor: 'ns-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)', width: 16, height: 7 } },
    { type: 's', cursor: 'ns-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 16, height: 7 } },
    { type: 'w', cursor: 'ew-resize', style: { top: '50%', left: -4, transform: 'translateY(-50%)', width: 7, height: 16 } },
    { type: 'e', cursor: 'ew-resize', style: { top: '50%', right: -4, transform: 'translateY(-50%)', width: 7, height: 16 } },
  ];

  // Generous invisible edge strip hit-zones along entire borders
  const edgeStrips: EdgeHandleConfig[] = [
    { type: 'n', cursor: 'ns-resize', style: { top: -5, left: 10, right: 10, height: 10 } },
    { type: 's', cursor: 'ns-resize', style: { bottom: -5, left: 10, right: 10, height: 10 } },
    { type: 'w', cursor: 'ew-resize', style: { left: -5, top: 10, bottom: 10, width: 10 } },
    { type: 'e', cursor: 'ew-resize', style: { right: -5, top: 10, bottom: 10, width: 10 } },
  ];

  const handleStart = (type: ResizeHandleType, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onResizeStart(type, e);
  };

  return (
    <>
      {/* Invisible border hit-zones for easy edge drag-to-resize */}
      {edgeStrips.map((strip) => (
        <div
          key={`strip-${strip.type}`}
          onMouseDown={(e) => handleStart(strip.type, e)}
          style={{
            ...strip.style,
            cursor: strip.cursor,
          }}
          className="absolute z-20 pointer-events-auto"
        />
      ))}

      {/* Visual edge mid-point pill handles */}
      {edgeHandles.map((h) => (
        <div
          key={h.type}
          onMouseDown={(e) => handleStart(h.type, e)}
          style={{
            ...h.style,
            cursor: h.cursor,
          }}
          className="absolute bg-white border-[1.5px] border-indigo-600 rounded-full z-30 shadow-[0_1px_4px_rgba(0,0,0,0.5)] hover:scale-125 hover:bg-indigo-50 hover:border-indigo-400 transition-all before:absolute before:-inset-2.5 before:content-['']"
        />
      ))}

      {/* Visual corner handles */}
      {cornerHandles.map((h) => (
        <div
          key={h.type}
          onMouseDown={(e) => handleStart(h.type, e)}
          style={{
            ...h.style,
            cursor: h.cursor,
          }}
          className="absolute w-2.5 h-2.5 bg-white border-[1.5px] border-indigo-600 rounded-[2px] z-30 shadow-[0_1px_4px_rgba(0,0,0,0.5)] hover:scale-125 hover:bg-indigo-50 hover:border-indigo-400 transition-all before:absolute before:-inset-2.5 before:content-['']"
        />
      ))}
    </>
  );
};
