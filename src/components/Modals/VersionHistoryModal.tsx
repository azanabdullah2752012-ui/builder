import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import type { ProjectRevision } from '../../types/editor';
import {
  X,
  History,
  RotateCcw,
  Camera,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const {
    project,
    revisions,
    refreshRevisions,
    createSnapshot,
    restoreRevision,
  } = useEditor();

  const [snapshotName, setSnapshotName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refreshRevisions();
    }
  }, [isOpen, refreshRevisions]);

  if (!isOpen) return null;

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createSnapshot(snapshotName.trim() || undefined);
    setSnapshotName('');
    setIsSubmitting(false);
  };

  const handleRestore = (rev: ProjectRevision) => {
    if (confirm(`Restore project to "${rev.name}"? Current unsaved edits will be moved to undo history.`)) {
      restoreRevision(rev);
      onClose();
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12141a] border border-[#262c3d] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-zinc-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#202533] flex items-center justify-between bg-[#151923] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Version History</h2>
                <span className="text-xs text-zinc-400 font-normal">({project.name})</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Point-in-time snapshots and instant rollbacks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create Snapshot Bar */}
        <form
          onSubmit={handleCreateSnapshot}
          className="p-4 bg-[#161a25] border-b border-[#222838] flex items-center gap-2.5 shrink-0"
        >
          <input
            type="text"
            placeholder="Snapshot label (e.g. Before hero redesign)..."
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#10131c] border border-[#273042] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Create Snapshot</span>
          </button>
        </form>

        {/* Revision Timeline List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {/* Current Working Draft */}
          <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">Current Working Draft</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                  <span>{project.pages?.length || 1} pages</span>
                  <span>•</span>
                  <span>
                    {(project.pages || []).reduce((acc, p) => acc + (p.elements?.length || 0), 0)} elements
                  </span>
                </p>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400">Editing now</span>
          </div>

          {revisions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">
              <History className="w-8 h-8 mx-auto text-zinc-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-zinc-400">No previous snapshots recorded</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                Use "Create Snapshot" above to save checkpoints before making major design changes.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider px-1 pt-1">
                Saved Revisions ({revisions.length})
              </h4>
              {revisions.map((rev) => {
                const elementCount = rev.data
                  ? (rev.data.pages || []).reduce((acc, p) => acc + (p.elements?.length || 0), 0)
                  : null;
                const pageCount = rev.data ? rev.data.pages?.length || 1 : null;

                return (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-[#23293a] bg-[#151822] hover:border-[#35405a] hover:bg-[#181c28] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-[#1f2535] flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-zinc-200 truncate">{rev.name}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                          <span>{formatTimestamp(rev.createdAt)}</span>
                          {elementCount !== null && (
                            <>
                              <span>•</span>
                              <span>
                                {pageCount}p / {elementCount} elements
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestore(rev)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22293b] hover:bg-amber-500 hover:text-black text-zinc-300 text-xs font-medium transition-all shrink-0"
                      title="Rollback to this snapshot"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rollback</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d0f14] border-t border-[#1a1f2b] flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Revisions are backed up to PostgreSQL schema</span>
          </div>
          <span>Storage: Supabase Cloud</span>
        </div>
      </div>
    </div>
  );
};
