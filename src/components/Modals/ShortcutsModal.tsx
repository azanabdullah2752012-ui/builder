import React, { useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Keyboard,
  X,
  Undo2,
  Redo2,
  Copy,
  ClipboardPaste,
  Scissors,
  Files,
  Lock,
  Trash2,
  ArrowRight,
  Layers,
  Save,
  HelpCircle,
} from 'lucide-react';

interface ShortcutRowProps {
  keys: string[];
  label: string;
  description: string;
  icon?: React.ReactNode;
}

const ShortcutRow: React.FC<ShortcutRowProps> = ({ keys, label, description, icon }) => (
  <div className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors">
    <div className="flex items-center gap-2.5 min-w-0">
      {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
      <div>
        <div className="text-xs font-medium text-zinc-200">{label}</div>
        <div className="text-[11px] text-zinc-400 truncate">{description}</div>
      </div>
    </div>
    <div className="flex items-center gap-1 shrink-0 ml-3">
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium text-zinc-200 bg-zinc-800 border border-zinc-700/80 rounded shadow-sm">
            {k}
          </kbd>
          {i < keys.length - 1 && <span className="text-zinc-600 text-xs">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const ShortcutsModal: React.FC = () => {
  const { showShortcutsModal, setShowShortcutsModal } = useEditor();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const cmd = isMac ? '⌘' : 'Ctrl';
  const alt = isMac ? '⌥' : 'Alt';
  const shift = '⇧';

  useEffect(() => {
    const handleClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showShortcutsModal) {
        setShowShortcutsModal(false);
      }
    };
    window.addEventListener('keydown', handleClose);
    return () => window.removeEventListener('keydown', handleClose);
  }, [showShortcutsModal, setShowShortcutsModal]);

  if (!showShortcutsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Keyboard Commands & Shortcuts</h2>
              <p className="text-xs text-zinc-400">Boost your design productivity with rapid shortcuts</p>
            </div>
          </div>
          <button
            onClick={() => setShowShortcutsModal(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Categories Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Category 1: Essential Commands */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 px-1">
              Core Actions & Clipboard
            </h3>
            <div className="bg-[#141416] border border-[#27272a] rounded-xl p-1.5 divide-y divide-zinc-800/40">
              <ShortcutRow
                icon={<Undo2 className="w-3.5 h-3.5" />}
                label="Reverse / Undo"
                description="Undo the last design action"
                keys={[cmd, 'Z']}
              />
              <ShortcutRow
                icon={<Redo2 className="w-3.5 h-3.5" />}
                label="Redo"
                description="Replay the previously reversed action"
                keys={[cmd, shift, 'Z']}
              />
              <ShortcutRow
                icon={<Copy className="w-3.5 h-3.5" />}
                label="Copy"
                description="Copy selected element & children to clipboard"
                keys={[cmd, 'C']}
              />
              <ShortcutRow
                icon={<ClipboardPaste className="w-3.5 h-3.5" />}
                label="Paste"
                description="Paste element from clipboard to canvas"
                keys={[cmd, 'V']}
              />
              <ShortcutRow
                icon={<Scissors className="w-3.5 h-3.5" />}
                label="Cut"
                description="Cut element to clipboard"
                keys={[cmd, 'X']}
              />
              <ShortcutRow
                icon={<Files className="w-3.5 h-3.5" />}
                label="Duplicate"
                description="Instant duplicate element in place"
                keys={[cmd, 'D']}
              />
              <ShortcutRow
                icon={<Save className="w-3.5 h-3.5" />}
                label="Quick Save"
                description="Persist project to Local Storage"
                keys={[cmd, 'S']}
              />
            </div>
          </div>

          {/* Category 2: Element Manipulation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 px-1">
              Elements & Selection
            </h3>
            <div className="bg-[#141416] border border-[#27272a] rounded-xl p-1.5 divide-y divide-zinc-800/40">
              <ShortcutRow
                icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                label="Delete"
                description="Remove selected element"
                keys={['Backspace', 'Delete']}
              />
              <ShortcutRow
                icon={<Lock className="w-3.5 h-3.5 text-amber-400" />}
                label="Toggle Lock"
                description="Lock or unlock element from editing"
                keys={[cmd, 'L']}
              />
              <ShortcutRow
                label="Clear Selection"
                description="Deselect active element"
                keys={['Esc']}
              />
              <ShortcutRow
                label="Cycle Elements"
                description="Cycle through root artboard elements"
                keys={[cmd, 'A']}
              />
              <ShortcutRow
                label="Nudge Position"
                description="Move element by 1px"
                keys={['Arrow keys']}
              />
              <ShortcutRow
                label="Super Nudge"
                description="Move element by 10px"
                keys={[shift, 'Arrow keys']}
              />
            </div>
          </div>

          {/* Category 3: Layer Stacking */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 px-1">
              Layer Ordering
            </h3>
            <div className="bg-[#141416] border border-[#27272a] rounded-xl p-1.5 divide-y divide-zinc-800/40">
              <ShortcutRow
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Bring Forward"
                description="Move layer forward one step"
                keys={[cmd, ']']}
              />
              <ShortcutRow
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Send Backward"
                description="Move layer backward one step"
                keys={[cmd, '[']}
              />
              <ShortcutRow
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Bring to Front"
                description="Move layer to top of all elements"
                keys={[cmd, shift, ']']}
              />
              <ShortcutRow
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Send to Back"
                description="Move layer to bottom of all elements"
                keys={[cmd, shift, '[']}
              />
            </div>
          </div>

          {/* Category 4: Page Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 px-1">
              Page Navigation
            </h3>
            <div className="bg-[#141416] border border-[#27272a] rounded-xl p-1.5 divide-y divide-zinc-800/40">
              <ShortcutRow
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                label="Next Page"
                description="Navigate to subsequent page"
                keys={[alt, '→']}
              />
              <ShortcutRow
                label="Previous Page"
                description="Navigate to previous page"
                keys={[alt, '←']}
              />
              <ShortcutRow
                label="Direct Page Jump"
                description="Switch straight to Page 1 through 9"
                keys={[alt, '1..9']}
              />
              <ShortcutRow
                label="Quick Page Search"
                description="Open page jump & search palette"
                keys={[alt, 'P']}
              />
              <ShortcutRow
                icon={<HelpCircle className="w-3.5 h-3.5" />}
                label="Toggle Shortcuts Cheatsheet"
                description="Open or close this dialog"
                keys={['?']}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#27272a] bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400 shrink-0">
          <span>💡 <span className="text-zinc-300">Pro-tip:</span> Right-click any element on the canvas to open the Context Menu.</span>
          <button
            onClick={() => setShowShortcutsModal(false)}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
