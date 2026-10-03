import React from 'react';
import { useEditor } from '../../context/useEditor';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Ruler,
  Magnet,
  Undo2,
  Redo2,
  HelpCircle,
} from 'lucide-react';

export const CanvasFloatingControls: React.FC = () => {
  const {
    zoom,
    setZoom,
    zoomToFit,
    showGrid,
    setShowGrid,
    showRulers,
    toggleRulers,
    snapToObjects,
    setSnapToObjects,
    undo,
    redo,
    canUndo,
    canRedo,
    setShowShortcutsModal,
  } = useEditor();

  const zoomPercent = Math.round(zoom * 100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.5, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.3, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#8e8e99',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 30,
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '3px 6px',
          borderRadius: 10,
          backgroundColor: 'rgba(18, 18, 22, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(0,0,0,0.5)',
          color: '#8e8e99',
          fontSize: 11,
        }}
      >
        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (Ctrl -)"
          style={btnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8e8e99';
          }}
        >
          <ZoomOut size={13} />
        </button>

        {/* Zoom Value / Reset */}
        <button
          type="button"
          onClick={handleResetZoom}
          title="Click to reset zoom to 100%"
          style={{
            ...btnStyle,
            width: 'auto',
            padding: '0 8px',
            fontFamily: 'monospace',
            fontWeight: 600,
            fontSize: 11,
            color: '#e2e2e8',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#e2e2e8';
          }}
        >
          {zoomPercent}%
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (Ctrl +)"
          style={btnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8e8e99';
          }}
        >
          <ZoomIn size={13} />
        </button>

        {/* Separator */}
        <div style={{ width: 1, height: 14, backgroundColor: '#282832', margin: '0 3px' }} />

        {/* Undo */}
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          style={{
            ...btnStyle,
            opacity: canUndo ? 1 : 0.35,
            cursor: canUndo ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            if (canUndo) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (canUndo) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8e8e99';
            }
          }}
        >
          <Undo2 size={13} />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          style={{
            ...btnStyle,
            opacity: canRedo ? 1 : 0.35,
            cursor: canRedo ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => {
            if (canRedo) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (canRedo) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8e8e99';
            }
          }}
        >
          <Redo2 size={13} />
        </button>

        {/* Separator */}
        <div style={{ width: 1, height: 14, backgroundColor: '#282832', margin: '0 3px' }} />

        {/* Grid Toggle */}
        <button
          type="button"
          onClick={() => setShowGrid((prev) => !prev)}
          title="Toggle Grid (Shift+G)"
          style={{
            ...btnStyle,
            backgroundColor: showGrid ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: showGrid ? '#a5b4fc' : '#8e8e99',
            border: showGrid ? '1px solid rgba(99,102,241,0.35)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!showGrid) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!showGrid) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8e8e99';
            }
          }}
        >
          <Grid size={13} />
        </button>

        {/* Rulers Toggle */}
        <button
          type="button"
          onClick={toggleRulers}
          title="Toggle Rulers (Shift+R)"
          style={{
            ...btnStyle,
            backgroundColor: showRulers ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: showRulers ? '#a5b4fc' : '#8e8e99',
            border: showRulers ? '1px solid rgba(99,102,241,0.35)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!showRulers) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!showRulers) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8e8e99';
            }
          }}
        >
          <Ruler size={13} />
        </button>

        {/* Snapping Toggle */}
        <button
          type="button"
          onClick={() => setSnapToObjects((prev) => !prev)}
          title="Toggle Magnet & Smart Snapping"
          style={{
            ...btnStyle,
            backgroundColor: snapToObjects ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: snapToObjects ? '#a5b4fc' : '#8e8e99',
            border: snapToObjects ? '1px solid rgba(99,102,241,0.35)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!snapToObjects) {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!snapToObjects) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8e8e99';
            }
          }}
        >
          <Magnet size={13} />
        </button>

        {/* Fit to Screen */}
        <button
          type="button"
          onClick={zoomToFit}
          title="Fit to Screen (Shift+1)"
          style={btnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8e8e99';
          }}
        >
          <Maximize2 size={13} />
        </button>

        {/* Shortcuts */}
        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          title="Shortcuts (?)"
          style={btnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#8e8e99';
          }}
        >
          <HelpCircle size={13} />
        </button>
      </div>
    </div>
  );
};
