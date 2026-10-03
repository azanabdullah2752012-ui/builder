import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UserGuide } from '../../types/editor';

interface CanvasRulersProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  showRulers: boolean;
  userGuides: UserGuide[];
  onAddGuide: (orientation: 'horizontal' | 'vertical', position: number) => void;
  onUpdateGuide: (id: string, position: number) => void;
  onRemoveGuide: (id: string) => void;
  children: React.ReactNode;
}

const RULER_THICKNESS = 20; // 20px ruler bar thickness

export const CanvasRulers: React.FC<CanvasRulersProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  showRulers,
  userGuides,
  onAddGuide,
  onUpdateGuide,
  onRemoveGuide,
  children,
}) => {
  const [cursorPos, setCursorPos] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const [draggingGuide, setDraggingGuide] = useState<{
    id?: string;
    isNew: boolean;
    orientation: 'horizontal' | 'vertical';
    currentPos: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse coordinates relative to artboard surface
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const artboardEl = containerRef.current.querySelector('[data-canvas-surface="true"]');
      if (!artboardEl) return;
      const rect = artboardEl.getBoundingClientRect();
      const rawX = Math.round((e.clientX - rect.left) / zoom);
      const rawY = Math.round((e.clientY - rect.top) / zoom);
      setCursorPos({ x: rawX, y: rawY });
    },
    [zoom]
  );

  const handleMouseLeave = () => {
    setCursorPos({ x: null, y: null });
  };

  // Start dragging new guide from Top Horizontal Ruler
  const handleStartTopRulerDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const artboardEl = containerRef.current.querySelector('[data-canvas-surface="true"]');
    if (!artboardEl) return;
    const rect = artboardEl.getBoundingClientRect();
    const initialY = Math.round((e.clientY - rect.top) / zoom);

    setDraggingGuide({
      isNew: true,
      orientation: 'horizontal',
      currentPos: initialY,
    });
  };

  // Start dragging new guide from Left Vertical Ruler
  const handleStartLeftRulerDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const artboardEl = containerRef.current.querySelector('[data-canvas-surface="true"]');
    if (!artboardEl) return;
    const rect = artboardEl.getBoundingClientRect();
    const initialX = Math.round((e.clientX - rect.left) / zoom);

    setDraggingGuide({
      isNew: true,
      orientation: 'vertical',
      currentPos: initialX,
    });
  };

  // Global mousemove and mouseup listeners for guide dragging
  useEffect(() => {
    if (!draggingGuide) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const artboardEl = containerRef.current.querySelector('[data-canvas-surface="true"]');
      if (!artboardEl) return;
      const rect = artboardEl.getBoundingClientRect();

      if (draggingGuide.orientation === 'horizontal') {
        const posY = Math.round((e.clientY - rect.top) / zoom);
        setDraggingGuide((prev) => (prev ? { ...prev, currentPos: posY } : null));
      } else {
        const posX = Math.round((e.clientX - rect.left) / zoom);
        setDraggingGuide((prev) => (prev ? { ...prev, currentPos: posX } : null));
      }
    };

    const onGlobalMouseUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const artboardEl = containerRef.current.querySelector('[data-canvas-surface="true"]');
      if (!artboardEl) return;
      const rect = artboardEl.getBoundingClientRect();

      if (draggingGuide.orientation === 'horizontal') {
        const posY = Math.round((e.clientY - rect.top) / zoom);
        // Dragging back into ruler or outside artboard deletes guide
        if (posY < 0 || posY > canvasHeight) {
          if (draggingGuide.id) {
            onRemoveGuide(draggingGuide.id);
          }
        } else {
          if (draggingGuide.isNew) {
            onAddGuide('horizontal', posY);
          } else if (draggingGuide.id) {
            onUpdateGuide(draggingGuide.id, posY);
          }
        }
      } else {
        const posX = Math.round((e.clientX - rect.left) / zoom);
        if (posX < 0 || posX > canvasWidth) {
          if (draggingGuide.id) {
            onRemoveGuide(draggingGuide.id);
          }
        } else {
          if (draggingGuide.isNew) {
            onAddGuide('vertical', posX);
          } else if (draggingGuide.id) {
            onUpdateGuide(draggingGuide.id, posX);
          }
        }
      }

      setDraggingGuide(null);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };
  }, [draggingGuide, zoom, canvasWidth, canvasHeight, onAddGuide, onUpdateGuide, onRemoveGuide]);

  if (!showRulers) {
    return <>{children}</>;
  }

  // Render Horizontal Ruler tick marks (every 10px, 50px, 100px)
  const renderHorizontalTicks = () => {
    const ticks: React.ReactNode[] = [];
    const step = 10;
    const totalSteps = Math.ceil(canvasWidth / step);

    for (let i = 0; i <= totalSteps; i++) {
      const x = i * step;
      const isMajor = x % 100 === 0;
      const isMedium = x % 50 === 0 && !isMajor;

      ticks.push(
        <div
          key={`h-${x}`}
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: `${x * zoom}px` }}
        >
          <div
            className={`w-[1px] ${
              isMajor
                ? 'h-[12px] bg-zinc-500'
                : isMedium
                ? 'h-[7px] bg-zinc-700'
                : 'h-[4px] bg-zinc-800'
            }`}
          />
          {isMajor && (
            <span
              className="absolute left-1 top-[2px] text-[8px] font-mono text-zinc-400 select-none pointer-events-none leading-none"
              style={{ fontSize: '8px' }}
            >
              {x}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  // Render Vertical Ruler tick marks
  const renderVerticalTicks = () => {
    const ticks: React.ReactNode[] = [];
    const step = 10;
    const totalSteps = Math.ceil(canvasHeight / step);

    for (let i = 0; i <= totalSteps; i++) {
      const y = i * step;
      const isMajor = y % 100 === 0;
      const isMedium = y % 50 === 0 && !isMajor;

      ticks.push(
        <div
          key={`v-${y}`}
          className="absolute left-0 right-0 pointer-events-none"
          style={{ top: `${y * zoom}px` }}
        >
          <div
            className={`h-[1px] ${
              isMajor
                ? 'w-[12px] bg-zinc-500'
                : isMedium
                ? 'w-[7px] bg-zinc-700'
                : 'w-[4px] bg-zinc-800'
            }`}
          />
          {isMajor && (
            <span
              className="absolute left-[3px] top-1 text-[8px] font-mono text-zinc-400 select-none pointer-events-none leading-none -rotate-90 origin-top-left"
              style={{ fontSize: '8px' }}
            >
              {y}
            </span>
          )}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col"
    >
      {/* Top Bar: Corner Unit Block + Top Horizontal Ruler */}
      <div className="flex items-center select-none z-20 sticky top-0 bg-[#0c0e14]">
        {/* Corner Intersection Block */}
        <div
          className="shrink-0 bg-[#12141c] border-r border-b border-zinc-800/80 flex items-center justify-center text-[9px] font-mono text-zinc-500 shadow-sm"
          style={{ width: `${RULER_THICKNESS}px`, height: `${RULER_THICKNESS}px` }}
          title="Figma Canvas Rulers (Pixels)"
        >
          px
        </div>

        {/* Horizontal Top Ruler */}
        <div
          onMouseDown={handleStartTopRulerDrag}
          className="relative overflow-hidden bg-[#12141c] border-b border-zinc-800/80 cursor-ns-resize hover:bg-[#161a24] transition-colors"
          style={{
            width: `${canvasWidth * zoom}px`,
            height: `${RULER_THICKNESS}px`,
          }}
          title="Click and drag down to place a Horizontal Guide"
        >
          {renderHorizontalTicks()}

          {/* Cursor X Tracker Line on Top Ruler */}
          {cursorPos.x !== null && cursorPos.x >= 0 && cursorPos.x <= canvasWidth && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
              style={{ left: `${cursorPos.x * zoom}px` }}
            >
              <div className="w-[1.5px] h-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.9)]" />
              <div className="absolute top-0.5 px-1 py-0 rounded bg-cyan-500 text-[8px] font-mono font-bold text-black pointer-events-none leading-tight">
                {cursorPos.x}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Row: Left Vertical Ruler + Artboard */}
      <div className="flex select-none">
        {/* Left Vertical Ruler */}
        <div
          onMouseDown={handleStartLeftRulerDrag}
          className="shrink-0 relative overflow-hidden bg-[#12141c] border-r border-zinc-800/80 cursor-ew-resize hover:bg-[#161a24] transition-colors z-20"
          style={{
            width: `${RULER_THICKNESS}px`,
            height: `${canvasHeight * zoom}px`,
          }}
          title="Click and drag right to place a Vertical Guide"
        >
          {renderVerticalTicks()}

          {/* Cursor Y Tracker Line on Left Ruler */}
          {cursorPos.y !== null && cursorPos.y >= 0 && cursorPos.y <= canvasHeight && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-30 flex items-center"
              style={{ top: `${cursorPos.y * zoom}px` }}
            >
              <div className="h-[1.5px] w-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.9)]" />
              <div className="absolute left-0.5 px-1 py-0 rounded bg-cyan-500 text-[8px] font-mono font-bold text-black pointer-events-none leading-tight -rotate-90">
                {cursorPos.y}
              </div>
            </div>
          )}
        </div>

        {/* Canvas Children Container with Guide Overlay */}
        <div className="relative">
          {children}

          {/* User Custom Guides Overlay */}
          {userGuides.map((guide) => (
            <UserGuideLine
              key={guide.id}
              guide={guide}
              zoom={zoom}
              onStartDrag={(id, orientation) => {
                setDraggingGuide({
                  id,
                  isNew: false,
                  orientation,
                  currentPos: guide.position,
                });
              }}
              onDelete={() => onRemoveGuide(guide.id)}
            />
          ))}

          {/* Active Dragging Guide Preview */}
          {draggingGuide && (
            <div
              className="absolute pointer-events-none z-50 transition-none"
              style={
                draggingGuide.orientation === 'horizontal'
                  ? {
                      left: 0,
                      right: 0,
                      top: `${draggingGuide.currentPos * zoom}px`,
                    }
                  : {
                      top: 0,
                      bottom: 0,
                      left: `${draggingGuide.currentPos * zoom}px`,
                    }
              }
            >
              {draggingGuide.orientation === 'horizontal' ? (
                <div className="w-full h-[1.5px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] relative flex items-center">
                  <div className="absolute left-3 -top-5 px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-black shadow-lg border border-cyan-300">
                    Y: {draggingGuide.currentPos}px
                  </div>
                </div>
              ) : (
                <div className="h-full w-[1.5px] bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] relative flex justify-center">
                  <div className="absolute top-3 px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-mono font-bold text-black shadow-lg border border-cyan-300">
                    X: {draggingGuide.currentPos}px
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for an individual user guide line
const UserGuideLine: React.FC<{
  guide: UserGuide;
  zoom: number;
  onStartDrag: (id: string, orientation: 'horizontal' | 'vertical') => void;
  onDelete: () => void;
}> = ({ guide, zoom, onStartDrag, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const isHorizontal = guide.orientation === 'horizontal';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        e.stopPropagation();
        onStartDrag(guide.id, guide.orientation);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onDelete();
      }}
      onDoubleClick={onDelete}
      className={`absolute z-35 group transition-colors select-none ${
        isHorizontal
          ? 'left-0 right-0 cursor-ns-resize h-3 -mt-1.5'
          : 'top-0 bottom-0 cursor-ew-resize w-3 -ml-1.5'
      }`}
      style={
        isHorizontal
          ? { top: `${guide.position * zoom}px` }
          : { left: `${guide.position * zoom}px` }
      }
      title={`${isHorizontal ? 'Horizontal' : 'Vertical'} Guide at ${guide.position}px • Drag to move or double-click to remove`}
    >
      {/* Center 1.5px guideline */}
      <div
        className={`absolute ${
          isHorizontal
            ? 'left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px]'
            : 'top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px]'
        } ${
          isHovered
            ? 'bg-cyan-300 shadow-[0_0_12px_rgba(6,182,212,1)]'
            : 'bg-cyan-500/80 shadow-[0_0_6px_rgba(6,182,212,0.4)]'
        }`}
      />

      {/* Hover coordinate badge */}
      {isHovered && (
        <div
          className={`absolute pointer-events-none rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-cyan-600 text-white shadow-xl border border-cyan-400 whitespace-nowrap z-40 ${
            isHorizontal
              ? 'left-4 -top-6'
              : 'top-4 -left-7'
          }`}
        >
          {isHorizontal ? `Y: ${guide.position}px` : `X: ${guide.position}px`}
        </div>
      )}
    </div>
  );
};
