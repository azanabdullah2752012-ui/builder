import React, { useState, useEffect } from 'react';
import type { CanvasElement } from '../../types/editor';
import { computeDistanceMeasurements } from '../../utils/snappingEngine';

interface FigmaDistanceOverlayProps {
  selectedElement: CanvasElement | null;
  allElements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export const FigmaDistanceOverlay: React.FC<FigmaDistanceOverlayProps> = ({
  selectedElement,
  allElements,
  canvasWidth,
  canvasHeight,
  zoom,
}) => {
  const [isAltActive, setIsAltActive] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<CanvasElement | null>(null);

  // Track Alt / Option keydown and keyup globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || e.altKey) {
        setIsAltActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' || !e.altKey) {
        setIsAltActive(false);
        setHoveredElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', () => setIsAltActive(false));

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', () => setIsAltActive(false));
    };
  }, []);

  // Track mouse coordinates on canvas while Alt is held to detect hovered element
  useEffect(() => {
    if (!isAltActive || !selectedElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const artboardEl = document.querySelector('[data-canvas-surface="true"]');
      if (!artboardEl) return;
      const rect = artboardEl.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;

      // Find top-most element under cursor (excluding the selected element itself)
      const hitCandidates = allElements.filter((el) => {
        if (el.id === selectedElement.id) return false;
        return (
          mouseX >= el.x &&
          mouseX <= el.x + el.width &&
          mouseY >= el.y &&
          mouseY <= el.y + el.height
        );
      });

      if (hitCandidates.length > 0) {
        // Pick element with highest z-index or last in DOM
        const target = hitCandidates[hitCandidates.length - 1];
        setHoveredElement(target);
      } else {
        setHoveredElement(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAltActive, selectedElement, allElements, zoom]);

  if (!isAltActive || !selectedElement) {
    return null;
  }

  const measurements = computeDistanceMeasurements(
    selectedElement,
    hoveredElement,
    canvasWidth,
    canvasHeight
  );

  const sel = measurements.selectedRect;
  const tgt = measurements.targetRect;

  return (
    <div className="absolute inset-0 pointer-events-none z-45 overflow-visible">
      {/* 1. Target Element Bounding Box Highlight (Figma Rose Crimson) */}
      {!measurements.isCanvasBounds && hoveredElement && (
        <div
          className="absolute border-2 border-[#f43f5e] bg-[#f43f5e]/10 shadow-[0_0_12px_rgba(244,63,94,0.4)] pointer-events-none rounded transition-none"
          style={{
            left: `${tgt.x}px`,
            top: `${tgt.y}px`,
            width: `${tgt.width}px`,
            height: `${tgt.height}px`,
          }}
        >
          <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#f43f5e] text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-md">
            {hoveredElement.name || 'Target Object'} ({tgt.width} × {tgt.height})
          </div>
        </div>
      )}

      {/* 2. Top Gap Measurement Line */}
      {measurements.topGap !== null && measurements.topGap > 0 && (
        <MeasurementLine
          orientation="vertical"
          x={sel.x + sel.width / 2}
          start={measurements.isCanvasBounds ? 0 : tgt.y + tgt.height}
          end={sel.y}
          value={measurements.topGap}
        />
      )}

      {/* 3. Bottom Gap Measurement Line */}
      {measurements.bottomGap !== null && measurements.bottomGap > 0 && (
        <MeasurementLine
          orientation="vertical"
          x={sel.x + sel.width / 2}
          start={sel.y + sel.height}
          end={measurements.isCanvasBounds ? canvasHeight : tgt.y}
          value={measurements.bottomGap}
        />
      )}

      {/* 4. Left Gap Measurement Line */}
      {measurements.leftGap !== null && measurements.leftGap > 0 && (
        <MeasurementLine
          orientation="horizontal"
          y={sel.y + sel.height / 2}
          start={measurements.isCanvasBounds ? 0 : tgt.x + tgt.width}
          end={sel.x}
          value={measurements.leftGap}
        />
      )}

      {/* 5. Right Gap Measurement Line */}
      {measurements.rightGap !== null && measurements.rightGap > 0 && (
        <MeasurementLine
          orientation="horizontal"
          y={sel.y + sel.height / 2}
          start={sel.x + sel.width}
          end={measurements.isCanvasBounds ? canvasWidth : tgt.x}
          value={measurements.rightGap}
        />
      )}

      {/* Floating HUD Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-zinc-950/90 border border-[#f43f5e]/60 text-zinc-100 text-[11px] font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 pointer-events-none z-50 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-[#f43f5e] shadow-[0_0_8px_#f43f5e]" />
        <span>
          <strong className="text-[#f43f5e]">⌥ Option / Alt Distance Tool:</strong>{' '}
          {measurements.isCanvasBounds
            ? 'Measuring distance to Canvas Artboard bounds'
            : `Measuring distance to "${hoveredElement?.name || 'Target'}"`}
        </span>
      </div>
    </div>
  );
};

// Render a single Figma-style crimson dimension line with tick caps and center pixel badge
const MeasurementLine: React.FC<{
  orientation: 'horizontal' | 'vertical';
  x?: number;
  y?: number;
  start: number;
  end: number;
  value: number;
}> = ({ orientation, x = 0, y = 0, start, end, value }) => {
  const lineStart = Math.min(start, end);
  const lineEnd = Math.max(start, end);
  const length = lineEnd - lineStart;

  if (length <= 0) return null;

  const isVertical = orientation === 'vertical';

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={
        isVertical
          ? {
              left: `${x}px`,
              top: `${lineStart}px`,
              height: `${length}px`,
              width: '1px',
            }
          : {
              top: `${y}px`,
              left: `${lineStart}px`,
              width: `${length}px`,
              height: '1px',
            }
      }
    >
      {/* Dimension Line Body */}
      <div
        className={`bg-[#f43f5e] shadow-[0_0_8px_rgba(244,63,94,0.8)] ${
          isVertical ? 'w-full h-full' : 'w-full h-full'
        }`}
      />

      {/* Start Tick Cap */}
      <div
        className={`absolute bg-[#f43f5e] ${
          isVertical
            ? 'w-2 h-[1px] left-1/2 -translate-x-1/2 top-0'
            : 'h-2 w-[1px] top-1/2 -translate-y-1/2 left-0'
        }`}
      />

      {/* End Tick Cap */}
      <div
        className={`absolute bg-[#f43f5e] ${
          isVertical
            ? 'w-2 h-[1px] left-1/2 -translate-x-1/2 bottom-0'
            : 'h-2 w-[1px] top-1/2 -translate-y-1/2 right-0'
        }`}
      />

      {/* Central Numeric Value Pill Badge */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#f43f5e] text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-lg border border-[#fb7185] pointer-events-none"
      >
        {value}
      </div>
    </div>
  );
};
