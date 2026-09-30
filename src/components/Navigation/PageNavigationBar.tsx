import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Copy,
  Trash2,
  Check,
  Search,
  Edit2,
  X,
} from 'lucide-react';
import { createHeroSection, createFeatureGridSection } from '../../constants/templates';
import { LANDING_PAGE_ELEMENTS } from '../../constants/landingPageElements';

export const PageNavigationBar: React.FC = () => {
  const {
    project,
    activePage,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updatePageSettings,
    addElements,
    showToast,
  } = useEditor();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'blank' | 'full-landing' | 'landing' | 'features'>('full-landing');

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState('');
  const [menuPageId, setMenuPageId] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentPageIndex = project.pages.findIndex((p) => p.id === activePage.id);

  // Close menus on outside click
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPageId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Focus search input when search opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setActivePage(project.pages[currentPageIndex - 1].id);
    } else if (project.pages.length > 1) {
      setActivePage(project.pages[project.pages.length - 1].id);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < project.pages.length - 1) {
      setActivePage(project.pages[currentPageIndex + 1].id);
    } else if (project.pages.length > 1) {
      setActivePage(project.pages[0].id);
    }
  };

  const handleStartRename = (id: string, currentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPageId(id);
    setEditingPageName(currentName);
    setMenuPageId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editingPageName.trim()) {
      const cleanName = editingPageName.trim();
      const current = project.pages.find((p) => p.id === id);
      const isHome = current?.slug === '/';
      const cleanSlug = isHome ? '/' : `/${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
      updatePageSettings(id, { name: cleanName, slug: cleanSlug });
      showToast(`Page renamed to "${cleanName}"`, 'info');
    }
    setEditingPageId(null);
  };

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPageName.trim() || `Page ${project.pages.length + 1}`;
    addPage(name);

    // If template selected, add initial elements
    if (selectedTemplate === 'full-landing') {
      setTimeout(() => {
        addElements(LANDING_PAGE_ELEMENTS);
      }, 50);
    } else if (selectedTemplate === 'landing') {
      setTimeout(() => {
        addElements(createHeroSection());
      }, 50);
    } else if (selectedTemplate === 'features') {
      setTimeout(() => {
        addElements(createFeatureGridSection());
      }, 50);
    }

    setNewPageName('');
    setNewPageSlug('');
    setIsAddModalOpen(false);
  };

  const filteredPages = project.pages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-10 bg-[#121214] border-b border-[#222226] px-3 flex items-center justify-between select-none shrink-0 z-20 text-xs">
      {/* Left: Previous / Next buttons & Tabs Container */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 mr-2 py-0.5">
        {/* Navigation Step Arrows */}
        <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-md p-0.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={project.pages.length <= 1}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors"
            title="Previous Page (Alt + ←)"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-zinc-400 px-1.5 select-none">
            {currentPageIndex + 1}/{project.pages.length}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={project.pages.length <= 1}
            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded transition-colors"
            title="Next Page (Alt + →)"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-[#27272a] shrink-0 mx-0.5" />

        {/* Page Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {project.pages.map((p, idx) => {
            const isActive = p.id === activePage.id;
            const isEditing = editingPageId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => {
                  if (!isActive) setActivePage(p.id);
                }}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-all border shrink-0 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-transparent text-white border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.25)] font-semibold'
                    : 'bg-[#151926] text-zinc-400 border-[#22283a] hover:text-zinc-100 hover:bg-[#1c2233] hover:border-indigo-500/40'
                }`}
                title={`Switch to ${p.name} (${p.slug}) • Alt+${idx + 1}`}
              >
                <FileText
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'
                  }`}
                />

                {isEditing ? (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editingPageName}
                      onChange={(e) => setEditingPageName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(p.id);
                        if (e.key === 'Escape') setEditingPageId(null);
                      }}
                      autoFocus
                      className="bg-[#121214] border border-indigo-500/50 rounded px-1 py-0.5 text-xs text-white outline-none w-24"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(p.id)}
                      className="p-0.5 hover:text-white text-zinc-400"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                    </button>
                  </div>
                ) : (
                  <span
                    onDoubleClick={(e) => handleStartRename(p.id, p.name, e)}
                    className="truncate max-w-[120px] select-none"
                  >
                    {p.name}
                  </span>
                )}

                {/* Slug badge */}
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                  {p.slug}
                </span>

                {/* Element count tag */}
                <span className="text-[9px] font-mono bg-black/40 text-zinc-400 px-1 py-0.2 rounded-full">
                  {p.elements.length}
                </span>

                {/* Context Menu Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuPageId(menuPageId === p.id ? null : p.id);
                  }}
                  className={`p-0.5 rounded hover:bg-[#2e2e34] text-zinc-500 hover:text-white transition-opacity ${
                    isActive || menuPageId === p.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  title="Page Actions"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>

                {/* Context Dropdown Menu */}
                {menuPageId === p.id && (
                  <div
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-1 w-44 bg-[#18181b] border border-[#2e2e34] rounded-lg shadow-2xl p-1 z-50 text-zinc-300 animate-fade-in"
                  >
                    <button
                      type="button"
                      onClick={() => handleStartRename(p.id, p.name)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#27272a] text-zinc-300 hover:text-white text-left text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Rename Page</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        duplicatePage(p.id);
                        setMenuPageId(null);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#27272a] text-zinc-300 hover:text-white text-left text-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Duplicate Page</span>
                    </button>
                    {project.pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          deletePage(p.id);
                          setMenuPageId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 text-left text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Delete Page</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Page Fast Button */}
        <button
          type="button"
          onClick={() => {
            setNewPageName(`Page ${project.pages.length + 1}`);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-indigo-200 hover:text-white bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 hover:border-indigo-500/60 transition-all shrink-0 text-xs font-semibold shadow-sm"
          title="Create New Page"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-300" />
          <span className="hidden sm:inline">New Page</span>
        </button>
      </div>

      {/* Right: Quick Page Search & Jump */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-300 hover:text-white bg-[#141824] hover:bg-[#1c2234] border border-[#263148] hover:border-indigo-500/50 transition-all text-xs shadow-sm"
          title="Jump to Page (Search)"
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline font-medium text-zinc-300">Jump to Page</span>
          <span className="text-[10px] text-zinc-400 font-mono bg-[#0c0e14] px-1 py-0.5 rounded border border-zinc-700/50">Alt+P</span>
        </button>
      </div>

      {/* MODAL 1: CREATE NEW PAGE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full p-5 shadow-2xl relative text-zinc-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Create New Page</h3>
                <p className="text-[11px] text-zinc-400">Add a blank artboard or start from a layout template</p>
              </div>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Page Name</label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => {
                    setNewPageName(e.target.value);
                    setNewPageSlug(`/${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`);
                  }}
                  placeholder="e.g. Pricing, Features, Contact"
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e34] rounded-lg text-zinc-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">URL Route Path</label>
                <input
                  type="text"
                  value={newPageSlug || `/${newPageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="/pricing"
                  className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#2e2e34] rounded-lg text-zinc-300 font-mono outline-none"
                />
              </div>

              {/* Template Selector */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5">Starting Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'full-landing',
                      label: '✨ Full Landing Page',
                      desc: 'Navbar, Hero, Bento, Sign-Up Form, Testimonials, Pricing, FAQ & Footer',
                    },
                    {
                      id: 'landing',
                      label: 'Hero Landing',
                      desc: 'Hero headline, subtitle, badge & dual CTA buttons',
                    },
                    {
                      id: 'features',
                      label: 'Feature Grid',
                      desc: '3 showcase benefit cards with icons & descriptions',
                    },
                    {
                      id: 'blank',
                      label: 'Blank Canvas',
                      desc: 'Clean empty canvas artboard',
                    },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        selectedTemplate === tpl.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:border-[#38383e]'
                      }`}
                    >
                      <div className="font-medium text-xs mb-0.5">{tpl.label}</div>
                      <div className="text-[10px] text-zinc-500 leading-snug">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
                >
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SEARCH & JUMP TO PAGE */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl max-w-md w-full p-3 shadow-2xl relative text-zinc-100">
            <div className="flex items-center gap-2 px-2 pb-2.5 border-b border-[#27272a]">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search page by name or path (/)..."
                className="flex-1 bg-transparent text-xs text-white outline-none placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pt-2">
              {filteredPages.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActivePage(p.id);
                    setIsSearchOpen(false);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    p.id === activePage.id
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'hover:bg-[#222226] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <div>
                      <div className="font-medium text-xs text-white">{p.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{p.slug}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">
                      {p.elements.length} elements
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono bg-zinc-800 px-1 rounded">
                      Alt+{idx + 1}
                    </span>
                  </div>
                </div>
              ))}
              {filteredPages.length === 0 && (
                <div className="py-6 text-center text-zinc-500 text-xs">
                  No pages matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
