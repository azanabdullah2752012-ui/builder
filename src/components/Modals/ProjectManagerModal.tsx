import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import type { ProjectSummary } from '../../types/editor';
import {
  X,
  Plus,
  FolderOpen,
  Copy,
  Trash2,
  History,
  Cloud,
  Layers,
  FileText,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    project,
    cloudProjects,
    loadCloudProject,
    createNewProject,
    duplicateCurrentProject,
    deleteCloudProject,
    refreshCloudProjects,
    setIsVersionHistoryOpen,
    lastCloudSavedAt,
    showToast,
  } = useEditor();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshCloudProjects();
    }
  }, [isOpen, refreshCloudProjects]);

  if (!isOpen) return null;

  const filteredProjects = cloudProjects.filter((p) => {
    if (!p.name) return false;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleOpenProject = async (p: ProjectSummary) => {
    if (p.id === project.id) {
      showToast('Project is already open on canvas', 'info');
      onClose();
      return;
    }
    await loadCloudProject(p.id);
    onClose();
  };

  const handleCreateSubmit = (templateType: 'blank' | 'landing') => {
    createNewProject(newProjectName.trim() || undefined, templateType);
    setNewProjectName('');
    setIsCreatingNew(false);
    onClose();
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#12141a] border border-[#262c3d] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden text-zinc-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#202533] flex items-center justify-between bg-[#151923] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">Project Manager</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {cloudProjects.length} Projects
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Supabase Cloud Sync active</span>
                {lastCloudSavedAt && <span className="text-zinc-500">• Last saved {lastCloudSavedAt}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create New Project Drawer */}
        {isCreatingNew && (
          <div className="p-4 bg-[#171b26] border-b border-[#252c3e] flex flex-col sm:flex-row items-center gap-3 animate-in slide-in-from-top-2">
            <input
              type="text"
              placeholder="Project Name (e.g. NextGen SaaS Landing)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#10131c] border border-[#273042] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCreateSubmit('blank')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#232b3d] hover:bg-[#2c374d] text-zinc-200 text-xs font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Blank Canvas</span>
              </button>
              <button
                onClick={() => handleCreateSubmit('landing')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                <span>With Starter Template</span>
              </button>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="p-2 text-zinc-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-[#1c212e] flex items-center justify-between gap-3 bg-[#131620]">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search designs by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#171b26] border border-[#252c3d] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => duplicateCurrentProject()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#252c3d] bg-[#171b26] text-zinc-300 hover:text-white hover:border-indigo-500/40 transition-colors"
              title="Duplicate current project"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Clone Current</span>
            </button>
          </div>
        </div>

        {/* Projects Grid / List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <FolderOpen className="w-10 h-10 mx-auto text-zinc-600 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-zinc-400">No projects found</p>
              <p className="text-[11px] text-zinc-600 mt-1">
                Create a new project or reset your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProjects.map((p) => {
                const isCurrent = p.id === project.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all text-left group relative ${
                      isCurrent
                        ? 'bg-[#181d2b] border-indigo-500/50 ring-1 ring-indigo-500/30'
                        : 'bg-[#151822] border-[#252b3b] hover:border-[#38435d] hover:bg-[#191d2a]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-semibold text-white truncate">{p.name}</h3>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                          ID: {p.id}
                        </p>
                      </div>

                      {/* Quick Action Icons */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            loadCloudProject(p.id);
                            setIsVersionHistoryOpen(true);
                            onClose();
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                          title="View Version History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {filteredProjects.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteCloudProject(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[#1f2535]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-zinc-500" />
                          {p.pageCount || 1} {p.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-zinc-500" />
                          {p.elementCount || 0} elements
                        </span>
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(p.updatedAt)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenProject(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          isCurrent
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-default'
                            : 'bg-[#232b3d] hover:bg-indigo-600 hover:text-white text-zinc-300'
                        }`}
                      >
                        {isCurrent ? 'Currently Open' : 'Open Project'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0d0f14] border-t border-[#1a1f2b] flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">Database Engine: Supabase Cloud & SQLite</span>
          </div>
          <span>Pickle Studio v2.4 • By Pickle Corp™</span>
        </div>
      </div>
    </div>
  );
};
