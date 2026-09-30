import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Scissors,
  Files,
  Lock,
  Unlock,
  Trash2,
  Layers,
  Keyboard,
} from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  targetElementId: string | null;
  onClose: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  x,
  y,
  targetElementId,
  onClose,
}) => {
  const {
    activePage,
    undo,
    redo,
    canUndo,
    canRedo,
    copyElement,
    cutElement,
    pasteElement,
    hasClipboard,
    duplicateElement,
    toggleLock,
    deleteElement,
    reorderElement,
    setShowShortcutsModal,
  } = useEditor();

  const menuRef = useRef<HTMLDivElement>(null);

  const targetEl = targetElementId
    ? activePage.elements.find((el) => el.id === targetElementId)
    : null;
  const isLocked = targetEl?.locked || false;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const cmd = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust position to stay inside viewport
  const menuWidth = 220;
  const menuHeight = 340;
  const safeX = Math.min(x, window.innerWidth - menuWidth - 10);
  const safeY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(10, safeX)}px`, top: `${Math.max(10, safeY)}px` }}
      className="fixed z-50 w-56 bg-[#18181b]/95 backdrop-blur-md border border-[#2e2e33] rounded-xl shadow-2xl p-1.5 text-xs text-zinc-200 select-none animate-scale-in"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Target Element Name pill if element clicked */}
      {targetEl && (
        <div className="px-2.5 py-1.5 mb-1 bg-zinc-800/80 rounded-lg flex items-center justify-between border border-zinc-700/50">
          <span className="font-medium text-white truncate max-w-[130px]">{targetEl.name}</span>
          <span className="text-[10px] text-zinc-400 font-mono capitalize">{targetEl.type}</span>
        </div>
      )}

      {/* Undo & Redo */}
      <div className="space-y-0.5">
        <button
          onClick={() => {
            undo();
            onClose();
          }}
          disabled={!canUndo}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Undo2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reverse (Undo)</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}Z</span>
        </button>

        <button
          onClick={() => {
            redo();
            onClose();
          }}
          disabled={!canRedo}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Redo2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Redo</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}⇧Z</span>
        </button>
      </div>

      <div className="my-1 border-t border-zinc-800/80" />

      {/* Clipboard actions */}
      <div className="space-y-0.5">
        <button
          onClick={() => {
            if (targetElementId) copyElement(targetElementId);
            onClose();
          }}
          disabled={!targetEl}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}C</span>
        </button>

        <button
          onClick={() => {
            if (targetElementId) cutElement(targetElementId);
            onClose();
          }}
          disabled={!targetEl || isLocked}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Scissors className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cut</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}X</span>
        </button>

        <button
          onClick={() => {
            pasteElement();
            onClose();
          }}
          disabled={!hasClipboard}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-3.5 h-3.5 text-zinc-400" />
            <span>Paste</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}V</span>
        </button>

        <button
          onClick={() => {
            if (targetElementId) duplicateElement(targetElementId);
            onClose();
          }}
          disabled={!targetEl}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Files className="w-3.5 h-3.5 text-zinc-400" />
            <span>Duplicate</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{cmd}D</span>
        </button>
      </div>

      {targetEl && (
        <>
          <div className="my-1 border-t border-zinc-800/80" />

          {/* Layer order & Lock */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                reorderElement(targetEl.id, 'forward');
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bring Forward</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">{cmd}]</span>
            </button>

            <button
              onClick={() => {
                reorderElement(targetEl.id, 'backward');
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Send Backward</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">{cmd}[</span>
            </button>

            <button
              onClick={() => {
                toggleLock(targetEl.id);
                onClose();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {isLocked ? (
                  <Unlock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                )}
                <span>{isLocked ? 'Unlock Element' : 'Lock Element'}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">{cmd}L</span>
            </button>

            <button
              onClick={() => {
                deleteElement(targetEl.id);
                onClose();
              }}
              disabled={isLocked}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-red-500/15 text-red-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete</span>
              </div>
              <span className="text-[10px] text-red-400 font-mono">⌫</span>
            </button>
          </div>
        </>
      )}

      <div className="my-1 border-t border-zinc-800/80" />

      {/* Shortcuts Modal Link */}
      <button
        onClick={() => {
          setShowShortcutsModal(true);
          onClose();
        }}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-indigo-600/20 text-indigo-300 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Keyboard className="w-3.5 h-3.5" />
          <span>Shortcuts Cheatsheet</span>
        </div>
        <span className="text-[10px] text-indigo-400 font-mono">?</span>
      </button>
    </div>
  );
};
