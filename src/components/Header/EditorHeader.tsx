import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Eye,
  Code2,
  Menu,
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Sliders,
  FileText,
  Copy,
  ShieldCheck,
  LogOut,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ExportModal } from '../Modals/ExportModal';
import { DatabaseModal } from '../Modals/DatabaseModal';
import { ProfileModal } from '../Modals/ProfileModal';
import { OnboardingModal } from '../Modals/OnboardingModal';

export const EditorHeader: React.FC = () => {
  const {
    project,
    activePage,
    setProjectName,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    editorMode,
    setEditorMode,
    viewportMode,
    setViewportMode,
    toggleLeftSidebar,
    rightSidebarOpen,
    toggleRightSidebar,
    editorComplexity,
    setEditorComplexity,
    showOnboarding,
    setShowOnboarding,
    currentUser,
    logout,
  } = useEditor();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.name);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      setProjectName(titleValue.trim());
    } else {
      setTitleValue(project.name);
    }
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageName.trim()) {
      addPage(newPageName.trim());
      setNewPageName('');
      setIsPageDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="h-12 bg-[#121214] border-b border-[#222226] text-zinc-200 px-3.5 flex items-center justify-between select-none z-30 shrink-0 text-xs">
        {/* Left Section: Menu Toggle + Notebook Icon + Untitled Project with subtle chevron */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle matching reference Image 1 */}
          <button
            onClick={toggleLeftSidebar}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Project & Page Breadcrumb */}
          <div className="relative">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="px-1.5 py-0.5 text-xs font-normal bg-[#18181b] border border-[#3f3f46] rounded text-white outline-none w-28"
                />
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setTitleValue(project.name);
                    setIsEditingTitle(true);
                  }}
                  className="font-normal text-zinc-400 hover:text-zinc-200 text-xs tracking-tight transition-colors"
                  title="Click to rename project"
                >
                  {project.name}
                </span>
              )}

              <span className="text-zinc-600 font-mono text-xs">/</span>

              {/* Active Page Pill with Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#18181b] border border-[#27272a] hover:border-[#38383e] text-zinc-200 font-medium transition-colors"
                title="Switch or Manage Pages"
              >
                <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[120px]">{activePage.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            {/* Page Switcher Dropdown */}
            {isPageDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#141417] border border-[#2a2a30] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in">
                <div className="text-[10px] font-medium text-zinc-500 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Project Pages</span>
                  <span className="font-mono text-[9px] text-zinc-400">{project.pages.length}</span>
                </div>
                <div className="space-y-0.5 my-1 max-h-56 overflow-y-auto">
                  {project.pages.map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        p.id === activePage.id
                          ? 'bg-[#222226] text-white font-medium border border-indigo-500/30'
                          : 'text-zinc-400 hover:bg-[#1c1c20] hover:text-zinc-200'
                      }`}
                      onClick={() => {
                        setActivePage(p.id);
                        setIsPageDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <FileText className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate text-xs">{p.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500">({p.slug})</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => duplicatePage(p.id)}
                          className="p-1 hover:text-white text-zinc-500 rounded hover:bg-[#27272a]"
                          title="Duplicate Page"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {project.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deletePage(p.id)}
                            className="p-1 hover:text-red-400 text-zinc-500 rounded hover:bg-[#27272a]"
                            title="Delete Page"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddPage} className="pt-1.5 border-t border-[#222226] mt-1 flex gap-1">
                  <input
                    type="text"
                    placeholder="New page..."
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    className="flex-1 px-2 py-0.5 text-xs bg-[#0c0c0e] border border-[#2a2a30] rounded text-zinc-200 placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-[#222226] hover:bg-[#2c2c31] text-white rounded font-medium"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Viewport Switcher + Simple/Pro Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Simple vs Pro Mode Pill Toggle */}
          <div className="flex items-center bg-[#101420] p-0.5 rounded-lg border border-[#232c3f] shadow-inner">
            <button
              type="button"
              onClick={() => setEditorComplexity('simple')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                editorComplexity === 'simple'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Simple Mode: Clean, focused canvas with essential controls (recommended for beginners)"
            >
              <Sparkles className="w-3 h-3 text-emerald-200" />
              <span>Simple</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorComplexity('pro')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                editorComplexity === 'pro'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Pro Mode: Advanced CSS, responsive flexbox, page navigation ribbon, and full inspector"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>Pro</span>
            </button>
          </div>

          {/* Sleek Dark Segmented Viewport Switcher */}
          <div className="flex items-center bg-[#101420] p-1 rounded-lg border border-[#232c3f] gap-1 shadow-inner">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] transition-all ${
                viewportMode === 'desktop'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
              title="Desktop (1200px)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`flex items-center px-2.5 py-1 rounded-md text-[11px] transition-all ${
                viewportMode === 'tablet'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`flex items-center px-2.5 py-1 rounded-md text-[11px] transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
              title="Phone (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Section: Guide, Preview, Export Code, Inspector & User Profile */}
        <div className="flex items-center gap-2">
          {/* Quick 3-Step Guide Tour Button */}
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#262f44] bg-[#151926] text-zinc-300 hover:text-white hover:border-amber-400/40 hover:bg-[#1c2233] text-xs transition-all shadow-sm"
            title="Open 3-Step Guided Tour & Starter Templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-medium">Guide</span>
          </button>

          {/* Admin Database & Supabase Studio Button - Strictly Admin Only */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setIsDatabaseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all bg-[#151926] text-zinc-300 border-[#262f44] hover:text-white hover:border-[#384666] hover:bg-[#1a2030]"
              title="Studio Admin Database (Administrator Console)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-semibold text-emerald-300">Admin DB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* Radiant Gradient Preview Button */}
          <button
            onClick={() => setEditorMode(editorMode === 'preview' ? 'design' : 'preview')}
            className="btn-primary"
            title="Toggle Live Interactive Preview (Ctrl+P)"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-100" />
            <span>Preview</span>
          </button>

          {/* Sleek Slate Export Code Button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-secondary"
            title="Export Production Code"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Code</span>
          </button>

          {/* Inspector Panel Toggle Button */}
          <button
            onClick={toggleRightSidebar}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
              rightSidebarOpen
                ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500/50 font-medium shadow-sm'
                : 'bg-[#151926] text-zinc-400 border-[#262f44] hover:text-white hover:border-[#384666]'
            }`}
            title={rightSidebarOpen ? 'Hide Inspector' : 'Show Inspector'}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Inspector</span>
          </button>

          {/* Authenticated User Account Menu */}
          {currentUser && (
            <div className="relative ml-1">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#151926] border border-[#262f44] hover:border-indigo-500/40 text-zinc-200 transition-all text-xs"
                title={`Account: ${currentUser.name} (${currentUser.email})`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                  {currentUser.name ? currentUser.name[0] : 'U'}
                </div>
                <span className="hidden md:inline font-medium text-zinc-300 max-w-[90px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#141417] border border-[#2a2a30] rounded-xl shadow-2xl p-2 z-50 animate-fade-in text-xs">
                  <div className="px-2.5 py-2 border-b border-[#222226] mb-1.5">
                    <div className="font-semibold text-white truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{currentUser.email}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium text-[10px]">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>100% Free • All Features Unlocked</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-indigo-300 hover:bg-indigo-500/10 transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Edit Profile & Account</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsDatabaseOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Admin Database</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 3-Step Guided Onboarding Tour Modal */}
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Profile & Account Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Export Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* Database Modal (Restricted to Administrator Only) */}
      {currentUser?.role === 'admin' && (
        <DatabaseModal isOpen={isDatabaseOpen} onClose={() => setIsDatabaseOpen(false)} />
      )}
    </>
  );
};
