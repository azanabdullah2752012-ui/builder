import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import { FONT_FAMILIES } from '../../constants/defaults';
import {
  Undo2,
  Redo2,
  Grid,
  Copy,
  ClipboardPaste,
  Scissors,
  Files,
  Trash2,
  Lock,
  Unlock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PanelLeft,
  PanelRight,
  Sparkles,
  Keyboard,
  Ruler,
  Magnet,
} from 'lucide-react';

const SWATCHES = ['#ffffff', '#0f172a', '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ContextBar: React.FC = () => {
  const {
    activePage,
    selectedElement,
    updateElementStyles,
    duplicateElement,
    copyElement,
    cutElement,
    pasteElement,
    hasClipboard,
    deleteElement,
    toggleLock,
    alignElement,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    setZoom,
    zoomToFit,
    showGrid,
    setShowGrid,
    showRulers,
    toggleRulers,
    snapToObjects,
    setSnapToObjects,
    leftSidebarOpen,
    toggleLeftSidebar,
    rightSidebarOpen,
    toggleRightSidebar,
    resetToDefaultDemo,
    setShowShortcutsModal,
  } = useEditor();

  const [showColorPicker, setShowColorPicker] = useState(false);

  const el = selectedElement;
  const isLocked = !!el?.locked;
  const isTextType = el?.type === 'text' || el?.type === 'button';
  const fontSize = el?.styles.fontSize || 16;

  return (
    <div className="h-10 bg-zinc-900 border-b border-zinc-800 text-zinc-300 px-3 flex items-center justify-between select-none z-20 shrink-0 text-xs">
      {/* Left: Context-sensitive element controls or Page Overview */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {/* Toggle Left Sidebar */}
        <button
          onClick={toggleLeftSidebar}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
            leftSidebarOpen ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Toggle Layers & Assets (Left Panel)"
        >
          <PanelLeft className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline font-medium text-[11px]">Layers</span>
        </button>

        <span className="w-px h-4 bg-zinc-800" />

        {el ? (
          <>
            {/* Selected Element Identity */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 font-medium text-zinc-200 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="capitalize">{el.type}</span>
              <span className="text-zinc-400 font-mono text-[10px] max-w-[100px] truncate">
                {el.name}
              </span>
            </div>

            {/* Typography Controls (if Text or Button) */}
            {isTextType && (
              <>
                <select
                  disabled={isLocked}
                  value={el.styles.fontFamily || FONT_FAMILIES[0].value}
                  onChange={(e) => updateElementStyles(el.id, { fontFamily: e.target.value })}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-[11px] text-zinc-200 outline-none max-w-[120px]"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.label} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>

                {/* Font Size Stepper */}
                <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded px-1">
                  <button
                    disabled={isLocked}
                    onClick={() =>
                      updateElementStyles(el.id, { fontSize: Math.max(10, fontSize - 2) })
                    }
                    className="px-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-1 text-[11px] font-mono min-w-[24px] text-center">
                    {fontSize}
                  </span>
                  <button
                    disabled={isLocked}
                    onClick={() =>
                      updateElementStyles(el.id, { fontSize: Math.min(96, fontSize + 2) })
                    }
                    className="px-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded p-0.5 gap-0.5">
                  <button
                    disabled={isLocked}
                    onClick={() => updateElementStyles(el.id, { textAlign: 'left' })}
                    className={`p-1 rounded ${
                      el.styles.textAlign === 'left' || !el.styles.textAlign
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft className="w-3 h-3" />
                  </button>
                  <button
                    disabled={isLocked}
                    onClick={() => updateElementStyles(el.id, { textAlign: 'center' })}
                    className={`p-1 rounded ${
                      el.styles.textAlign === 'center'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter className="w-3 h-3" />
                  </button>
                  <button
                    disabled={isLocked}
                    onClick={() => updateElementStyles(el.id, { textAlign: 'right' })}
                    className={`p-1 rounded ${
                      el.styles.textAlign === 'right'
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}

            {/* Fill Color Picker */}
            <div className="relative">
              <button
                disabled={isLocked}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-750 transition-colors"
                title="Fill Color"
              >
                <span
                  className="w-3.5 h-3.5 rounded border border-white/20 shadow-sm"
                  style={{ backgroundColor: el.styles.backgroundColor || '#2563eb' }}
                />
                <span className="text-[11px] font-mono text-zinc-300">
                  {el.styles.backgroundColor || 'Color'}
                </span>
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl flex items-center gap-1.5 z-50 animate-scale-in">
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        updateElementStyles(el.id, { backgroundColor: c });
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-4 bg-zinc-800" />

            {/* Quick Alignment on Canvas */}
            <div className="flex items-center gap-0.5">
              <button
                disabled={isLocked}
                onClick={() => alignElement(el.id, 'left')}
                className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                title="Align to Left Edge"
              >
                Align L
              </button>
              <button
                disabled={isLocked}
                onClick={() => alignElement(el.id, 'center')}
                className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                title="Center Horizontally"
              >
                Center
              </button>
              <button
                disabled={isLocked}
                onClick={() => alignElement(el.id, 'right')}
                className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                title="Align to Right Edge"
              >
                Align R
              </button>
            </div>

            <span className="w-px h-4 bg-zinc-800" />

            {/* Element Actions: Copy, Cut, Paste, Duplicate, Lock, Delete */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => copyElement(el.id)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Copy (Cmd+C)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => cutElement(el.id)}
                disabled={isLocked}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                title="Cut (Cmd+X)"
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => pasteElement()}
                disabled={!hasClipboard}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                title="Paste (Cmd+V)"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => duplicateElement(el.id)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Duplicate (Cmd+D)"
              >
                <Files className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => toggleLock(el.id)}
                className={`p-1 rounded transition-colors ${
                  isLocked ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={isLocked ? 'Unlock Element (Cmd+L)' : 'Lock Element (Cmd+L)'}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => deleteElement(el.id)}
                disabled={isLocked}
                className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 transition-colors"
                title="Delete (Backspace / Del)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <span className="font-medium text-zinc-300">{activePage.name}</span>
            <span>&bull;</span>
            <span className="font-mono text-zinc-400">
              {activePage.canvasWidth} × {activePage.canvasHeight} px
            </span>
            <span>&bull;</span>
            <span className="text-zinc-500">Click any element or drag to customize</span>
          </div>
        )}
      </div>

      {/* Right: Global View Controls (Zoom, History, Grid, Inspector Toggle) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Undo / Redo / Paste */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors"
            title="Reverse / Undo (Cmd+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition-colors"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          {hasClipboard && (
            <button
              onClick={() => pasteElement()}
              className="p-1 text-indigo-400 hover:text-white bg-indigo-500/10 rounded hover:bg-indigo-500/20 transition-colors"
              title="Paste from Clipboard (Cmd+V)"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="w-px h-4 bg-zinc-800" />

        {/* Shortcuts Modal Button */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="flex items-center gap-1 px-1.5 py-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/60 rounded border border-zinc-750 transition-colors"
          title="Keyboard Shortcuts Cheatsheet (?)"
        >
          <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline text-[10px] font-mono">⌘/</span>
        </button>

        <span className="w-px h-4 bg-zinc-800" />

        {/* Zoom Stepper & Fit Button */}
        <div className="flex items-center bg-zinc-800/80 border border-zinc-700/60 rounded px-1 py-0.5 gap-1">
          <button
            onClick={zoomToFit}
            className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white bg-zinc-700/60 hover:bg-zinc-600 rounded transition-colors"
            title="Fit Canvas to Screen (Auto Zoom)"
          >
            Fit
          </button>
          <span className="w-px h-3 bg-zinc-700" />
          <button
            onClick={() => setZoom((z) => Math.max(0.3, Number((z - 0.1).toFixed(1))))}
            className="text-zinc-400 hover:text-white text-xs px-0.5"
            title="Zoom Out"
          >
            -
          </button>
          <span
            onClick={() => setZoom(1)}
            className="font-mono text-[10px] text-zinc-300 hover:text-white px-1 cursor-pointer min-w-[32px] text-center"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))))}
            className="text-zinc-400 hover:text-white text-xs px-0.5"
            title="Zoom In"
          >
            +
          </button>
        </div>

        {/* Toggle Grid */}
        <button
          onClick={() => setShowGrid((g) => !g)}
          className={`p-1 rounded transition-colors ${
            showGrid ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Toggle Grid (G)"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Rulers & Custom Guides */}
        <button
          onClick={toggleRulers}
          className={`p-1 rounded transition-colors ${
            showRulers ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Toggle Rulers & User Guides (Shift+R)"
        >
          <Ruler className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Smart Magnetic Snapping */}
        <button
          onClick={() => setSnapToObjects((s) => !s)}
          className={`p-1 rounded transition-colors ${
            snapToObjects ? 'text-pink-400 bg-pink-500/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Toggle Smart Snapping to Objects & Center"
        >
          <Magnet className="w-3.5 h-3.5" />
        </button>

        {/* Load Demo */}
        <button
          onClick={resetToDefaultDemo}
          className="flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded border border-zinc-700/80 transition-colors"
          title="Load Demo Website"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden md:inline">Demo</span>
        </button>

        <span className="w-px h-4 bg-zinc-800" />

        {/* Toggle Right Inspector */}
        <button
          onClick={toggleRightSidebar}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
            rightSidebarOpen ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Toggle Inspector (Right Panel)"
        >
          <span className="hidden sm:inline font-medium text-[11px]">Inspector</span>
          <PanelRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
