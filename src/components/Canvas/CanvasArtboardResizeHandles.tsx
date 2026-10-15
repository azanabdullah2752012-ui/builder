import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { playSound } from '../../utils/interactiveEffects';

interface CanvasArtboardResizeHandlesProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  isLocked?: boolean;
  onLiveResize: (width: number, height: number, isDragging: boolean) => void;
  onCommitResize: (width: number, height: number) => void;
  onQuickAddHeight?: (additionalHeight: number) => void;
}

type ResizeDirection = 'right' | 'bottom' | 'corner' | null;

const SNAP_WIDTHS = [390, 768, 1024, 1200, 1280, 1366, 1440, 1536, 1920];
const SNAP_HEIGHTS = [800, 900, 1080, 1200, 1600, 2000, 2400];
const SNAP_THRESHOLD = 12;

export const CanvasArtboardResizeHandles: React.FC<CanvasArtboardResizeHandlesProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  isLocked = false,
  onLiveResize,
  onCommitResize,
  onQuickAddHeight,
}) => {
  const [activeDirection, setActiveDirection] = useState<ResizeDirection>(null);
  const [currentSize, setCurrentSize] = useState<{ width: number; height: number }>({
    width: canvasWidth,
    height: canvasHeight,
  });
  const [snappedWidth, setSnappedWidth] = useState<number | null>(null);
  const [snappedHeight, setSnappedHeight] = useState<number | null>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: ResizeDirection;
  } | null>(null);

  // Sync internal size when prop updates while not dragging
  useEffect(() => {
    if (!activeDirection) {
      setCurrentSize({ width: canvasWidth, height: canvasHeight });
    }
  }, [canvasWidth, canvasHeight, activeDirection]);

  const handleMouseDown = (direction: ResizeDirection, e: React.MouseEvent) => {
    if (isLocked) return;
    e.preventDefault();
    e.stopPropagation();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: canvasWidth,
      startHeight: canvasHeight,
      direction,
    };

    setActiveDirection(direction);
    onLiveResize(canvasWidth, canvasHeight, true);

    const cursor =
      direction === 'right' ? 'ew-resize' : direction === 'bottom' ? 'ns-resize' : 'nwse-resize';
    document.body.style.cursor = cursor;
    document.body.style.userSelect = 'none';

    let lastW = canvasWidth;
    let lastH = canvasHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;

      const { startX, startY, startWidth, startHeight, direction: dir } = dragStartRef.current;
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      let rawW = startWidth;
      let rawH = startHeight;

      if (dir === 'right' || dir === 'corner') {
        rawW = Math.max(320, Math.min(3840, Math.round(startWidth + deltaX)));
      }
      if (dir === 'bottom' || dir === 'corner') {
        rawH = Math.max(400, Math.min(12000, Math.round(startHeight + deltaY)));
      }

      // Check Smart Snapping
      let finalW = rawW;
      let snapW: number | null = null;
      if (dir === 'right' || dir === 'corner') {
        for (const snap of SNAP_WIDTHS) {
          if (Math.abs(rawW - snap) <= SNAP_THRESHOLD) {
            finalW = snap;
            snapW = snap;
            break;
          }
        }
      }

      let finalH = rawH;
      let snapH: number | null = null;
      if (dir === 'bottom' || dir === 'corner') {
        for (const snap of SNAP_HEIGHTS) {
          if (Math.abs(rawH - snap) <= SNAP_THRESHOLD) {
            finalH = snap;
            snapH = snap;
            break;
          }
        }
      }

      lastW = finalW;
      lastH = finalH;
      setSnappedWidth(snapW);
      setSnappedHeight(snapH);
      setCurrentSize({ width: finalW, height: finalH });
      onLiveResize(finalW, finalH, true);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      setActiveDirection(null);
      setSnappedWidth(null);
      setSnappedHeight(null);
      dragStartRef.current = null;

      onLiveResize(lastW, lastH, false);
      onCommitResize(lastW, lastH);
      playSound('pop');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (isLocked) return null;

  return (
    <>
      {/* 1. Right Edge Drag Handle & Hit Strip */}
      <div
        onMouseDown={(e) => handleMouseDown('right', e)}
        className="absolute top-0 -right-2 w-4 h-full cursor-ew-resize z-30 flex items-center justify-center group"
        title="Drag right edge to resize canvas width"
      >
        <div
          className={`w-1.5 h-14 rounded-full transition-all duration-150 flex flex-col items-center justify-center gap-1 shadow-sm ${
            activeDirection === 'right' || activeDirection === 'corner'
              ? 'bg-[#B8F36B] w-2.5 h-20 shadow-[0_0_12px_rgba(184,243,107,0.7)]'
              : 'bg-zinc-600/70 group-hover:bg-[#B8F36B] group-hover:w-2 group-hover:h-16'
          }`}
        >
          <span className="w-0.5 h-1 bg-black/40 rounded-full" />
          <span className="w-0.5 h-1 bg-black/40 rounded-full" />
          <span className="w-0.5 h-1 bg-black/40 rounded-full" />
        </div>
      </div>

      {/* 2. Bottom Edge Drag Handle & Hit Strip */}
      <div
        onMouseDown={(e) => handleMouseDown('bottom', e)}
        className="absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize z-30 flex items-center justify-center group"
        title="Drag bottom edge to resize canvas height"
      >
        <div
          className={`h-1.5 w-14 rounded-full transition-all duration-150 flex items-center justify-center gap-1 shadow-sm ${
            activeDirection === 'bottom' || activeDirection === 'corner'
              ? 'bg-[#B8F36B] h-2.5 w-20 shadow-[0_0_12px_rgba(184,243,107,0.7)]'
              : 'bg-zinc-600/70 group-hover:bg-[#B8F36B] group-hover:h-2 group-hover:w-16'
          }`}
        >
          <span className="h-0.5 w-1 bg-black/40 rounded-full" />
          <span className="h-0.5 w-1 bg-black/40 rounded-full" />
          <span className="h-0.5 w-1 bg-black/40 rounded-full" />
        </div>
      </div>

      {/* 3. Bottom-Right Corner Gripper Handle */}
      <div
        onMouseDown={(e) => handleMouseDown('corner', e)}
        className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-40 flex items-center justify-center group"
        title="Drag corner to resize canvas width and height"
      >
        <div
          className={`w-3.5 h-3.5 rounded-br-lg rounded-tl-sm transition-all duration-150 border-r-2 border-b-2 flex items-center justify-center shadow-sm ${
            activeDirection === 'corner'
              ? 'border-[#B8F36B] bg-[#B8F36B]/30 scale-125 shadow-[0_0_10px_rgba(184,243,107,0.8)]'
              : 'border-zinc-500 group-hover:border-[#B8F36B] group-hover:bg-[#B8F36B]/20 group-hover:scale-110'
          }`}
        >
          <div className="w-1 h-1 bg-white/70 rounded-full" />
        </div>
      </div>

      {/* 4. Active Live Dimensions Floating Tooltip Badge while dragging */}
      {activeDirection && (
        <div
          className="absolute z-50 pointer-events-none transform -translate-x-1/2 flex flex-col items-center gap-1 animate-scale-in"
          style={{
            left: activeDirection === 'right' ? `${canvasWidth + 50}px` : `${canvasWidth / 2}px`,
            top: activeDirection === 'bottom' ? `${canvasHeight + 20}px` : `${canvasHeight / 2}px`,
          }}
        >
          <div className="px-3 py-1.5 rounded-lg bg-zinc-950/95 border border-[#B8F36B] shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md text-white font-mono text-xs flex items-center gap-2">
            <span className="text-[#B8F36B] font-bold">
              {currentSize.width} × {currentSize.height} px
            </span>
            {(snappedWidth || snappedHeight) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B8F36B]/20 text-[#B8F36B] font-sans font-semibold">
                ✨ Snapped
              </span>
            )}
          </div>
        </div>
      )}

      {/* 5. Bottom Canvas Quick Add Bar (when not actively resizing) */}
      {!activeDirection && onQuickAddHeight && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => {
              onQuickAddHeight(400);
              playSound('pop');
            }}
            className="px-2.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-[10px] font-medium flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            title="Add 400px to canvas height"
          >
            <Plus className="w-3 h-3 text-[#B8F36B]" />
            <span>+400px Height</span>
          </button>
        </div>
      )}
    </>
  );
};
