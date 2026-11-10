import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Eye, Code2, Menu, Plus, Trash2, ChevronDown,
  Monitor, Tablet, Smartphone, Sliders, FileText, Copy,
  LogOut, User, Sparkles, Zap, Cloud, Loader2,
  FolderOpen, History, LogIn, MoreHorizontal, Keyboard,
  Inbox, SearchCheck, BarChart2, Sun, Moon, Layout,
} from 'lucide-react';
import { ExportModal } from '../Modals/ExportModal';
import { PublishModal } from '../Modals/PublishModal';
import { LeadsModal } from '../Modals/LeadsModal';
import { SeoAuditModal } from '../Modals/SeoAuditModal';
import { AnalyticsModal } from '../Modals/AnalyticsModal';
import { ProfileModal } from '../Modals/ProfileModal';
import { OnboardingModal } from '../Modals/OnboardingModal';
import { AuthModal } from '../Modals/AuthModal';
import { ProjectManagerModal } from '../Modals/ProjectManagerModal';
import { VersionHistoryModal } from '../Modals/VersionHistoryModal';
import { TemplateLibraryModal } from '../Modals/TemplateLibraryModal';
import { DatabaseModal } from '../Modals/DatabaseModal';
import { PickleTorchSvg } from '../Brand/PickleCorpLogo';

const S = {
  header: {
    height: 52,
    background: 'var(--studio-header-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--studio-header-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    flexShrink: 0,
    userSelect: 'none' as const,
    zIndex: 30,
    fontSize: 12,
    width: '100%',
    maxWidth: '100vw',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  brandStar: { color: 'var(--primary)', fontSize: 14 },
  sep: { width: 1, height: 14, background: 'var(--border-subtle)', margin: '0 8px' } as React.CSSProperties,
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 6, border: 'none',
    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s', fontSize: 12,
  } as React.CSSProperties,
  textBtn: {
    display: 'flex', alignItems: 'center', gap: 5, height: 28,
    padding: '0 10px', borderRadius: 9999, border: '1px solid var(--border-subtle)',
    background: 'var(--studio-pill-bg)', color: 'var(--text-muted)', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
    fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  pagePill: {
    display: 'flex', alignItems: 'center', gap: 5, height: 26,
    padding: '0 10px', borderRadius: 9999,
    background: 'var(--studio-pill-bg)', border: '1px solid var(--border-subtle)',
    color: 'var(--text-main)', cursor: 'pointer', fontSize: 11, fontWeight: 500,
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', left: 0,
    width: 220, background: 'var(--bg-sidebar)', border: '1px solid var(--border-dark)',
    borderRadius: 12, boxShadow: 'var(--studio-panel-shadow)',
    padding: '6px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropdownR: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', right: 0,
    width: 220, background: 'var(--bg-sidebar)', border: '1px solid var(--border-dark)',
    borderRadius: 12, boxShadow: 'var(--studio-panel-shadow)',
    padding: '6px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
    borderRadius: 7, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)',
    transition: 'background 0.1s, color 0.1s',
  } as React.CSSProperties,
  segGroup: {
    display: 'flex', alignItems: 'center', gap: 2, padding: '3px',
    background: 'var(--studio-pill-bg)', border: '1px solid var(--studio-pill-border)', borderRadius: 9999,
  } as React.CSSProperties,
};

function DropRow({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...S.dropRow, background: hov ? (danger ? 'rgba(239,68,68,0.12)' : '#1a1f2e') : 'transparent', color: hov ? (danger ? '#f87171' : '#f8fafc') : (danger ? '#f87171' : '#94a3b8') }}
    >
      {icon}{label}
    </div>
  );
}

function IconBtn({ icon, title, active, onClick }: { icon: React.ReactNode; title?: string; active?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.iconBtn,
        background: active ? 'var(--studio-pill-hover)' : hov ? 'var(--studio-pill-bg)' : 'transparent',
        color: active || hov ? 'var(--text-main)' : 'var(--text-muted)',
      }}
    >
      {icon}
    </button>
  );
}

function TextBtn({ icon, label, title, active, accent, responsive, onClick }: { icon?: React.ReactNode; label: string; title?: string; active?: boolean; accent?: boolean; responsive?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title || label}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.textBtn,
        background: accent ? (hov ? '#2584ff' : '#1076fc') : active ? 'var(--studio-pill-hover)' : hov ? 'var(--studio-pill-bg)' : 'transparent',
        color: accent ? '#ffffff' : active || hov ? 'var(--text-main)' : 'var(--text-muted)',
        borderColor: accent ? 'transparent' : active ? 'var(--primary)' : 'var(--border-subtle)',
        fontWeight: accent ? 600 : 400,
        padding: responsive ? '0 8px' : S.textBtn.padding,
      }}
    >
      {icon}
      <span className={responsive ? 'hidden xl:inline' : undefined}>{label}</span>
    </button>
  );
}

export const EditorHeader: React.FC = () => {
  const {
    project, activePage, setProjectName, setActivePage, addPage, duplicatePage, deletePage,
    editorMode, setEditorMode, viewportMode, setViewportMode,
    toggleLeftSidebar, rightSidebarOpen, toggleRightSidebar,
    editorComplexity, setEditorComplexity, showOnboarding, setShowOnboarding,
    currentUser, logout, cloudSyncStatus, lastCloudSavedAt, saveToCloud,
    isProjectManagerOpen, setIsProjectManagerOpen,
    isVersionHistoryOpen, setIsVersionHistoryOpen,
    isAuthModalOpen, setIsAuthModalOpen, setShowShortcutsModal,
    appTheme, toggleAppTheme,
  } = useEditor();

  const isLight = appTheme === 'light';

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.name);
  const [isPageDropOpen, setIsPageDropOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);

  // Trigger command palette via custom event from App.tsx
  useEffect(() => {
    const handler = () => setIsTemplatesOpen(true);
    window.addEventListener('header:open-templates', handler);
    return () => window.removeEventListener('header:open-templates', handler);
  }, []);

  useEffect(() => {
    if (!isMoreOpen && !isPageDropOpen && !isUserMenuOpen) return;
    const close = () => { setIsMoreOpen(false); setIsPageDropOpen(false); setIsUserMenuOpen(false); };
    const t = setTimeout(() => window.addEventListener('click', close), 10);
    return () => { clearTimeout(t); window.removeEventListener('click', close); };
  }, [isMoreOpen, isPageDropOpen, isUserMenuOpen]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) setProjectName(titleValue.trim());
    else setTitleValue(project.name);
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageName.trim()) { addPage(newPageName.trim()); setNewPageName(''); setIsPageDropOpen(false); }
  };

  const vp = [
    { id: 'desktop', icon: <Monitor size={13} />, label: 'Desktop' },
    { id: 'tablet',  icon: <Tablet size={13} />,  label: 'Tablet' },
    { id: 'mobile',  icon: <Smartphone size={13} />, label: 'Mobile' },
  ] as const;

  const isPublished = Boolean(project.publishedAt || project.isPublic);

  return (
    <>
      <style>{`
        @keyframes craftFadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }
        .craft-drop-row:hover { background:#1e1e1e; color:#e8e8e8; }
      `}</style>

      <header style={S.header}>
        {/* ── Left ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flexShrink: 1 }}>
          <IconBtn icon={<Menu size={15} />} title="Toggle Components & Layers Panel" onClick={toggleLeftSidebar} />

          <div style={{ ...S.sep, margin: '0 2px 0 4px' }} className="hidden sm:block" />

          {/* Brand / Home Link */}
          <button
            onClick={() => setEditorMode('landing')}
            title="Return to Pickle Studio Home"
            style={{
              ...S.brand,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: 6,
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <PickleTorchSvg size={20} theme={isLight ? "light" : "dark"} style={{ marginRight: 4 }} />
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', color: isLight ? '#0f172a' : '#f8fafc' }} className="hidden sm:inline">Pickle</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: 2 }} className="hidden sm:inline">Studio</span>
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 800,
                color: 'var(--primary)',
                backgroundColor: isLight ? 'rgba(2, 132, 199, 0.1)' : 'rgba(16, 118, 252, 0.12)',
                border: isLight ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(16, 118, 252, 0.3)',
                padding: '1px 5px',
                borderRadius: 4,
                marginLeft: 4,
                letterSpacing: '0.06em',
              }}
              className="hidden lg:inline"
            >
              CORP™
            </span>
          </button>

          <button
            onClick={() => setEditorMode('landing')}
            title="View Landing Page"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(147, 101, 255, 0.12)',
              border: '1px solid rgba(147, 101, 255, 0.25)',
              color: '#C1A1FF',
              cursor: 'pointer',
              marginLeft: 6,
            }}
          >
            ← Home
          </button>

          <div style={S.sep} className="hidden md:block" />

          {/* Project + Page breadcrumb */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setIsProjectManagerOpen(true)}
              title="Projects (Open Project Manager)"
              style={{ ...S.iconBtn, width: 24, height: 24, flexShrink: 0 }}
              className="shrink-0"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--studio-pill-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <FolderOpen size={13} />
            </button>

            {isEditingTitle ? (
              <input
                autoFocus
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
                style={{ background: 'var(--input-bg)', border: '1px solid var(--primary)', borderRadius: 5, padding: '2px 6px', fontSize: 11, color: 'var(--text-main)', outline: 'none', width: 90, flexShrink: 0 }}
              />
            ) : (
              <span
                onClick={() => { setTitleValue(project.name); setIsEditingTitle(true); }}
                style={{ fontSize: 11.5, color: 'var(--text-muted)', cursor: 'text', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}
                className="hidden sm:inline"
                title={`Project: ${project.name}`}
              >
                {project.name}
              </span>
            )}

            <span style={{ color: 'var(--border-subtle)', fontSize: 11, margin: '0 2px', flexShrink: 0 }} className="hidden sm:inline">/</span>

            <button
              onClick={() => setIsPageDropOpen(!isPageDropOpen)}
              style={{ ...S.pagePill, maxWidth: 110, height: 26, padding: '0 8px', fontSize: 11, flexShrink: 0 }}
              title={`Page: ${activePage.name}`}
            >
              <FileText size={11} style={{ color: '#38bdf8', flexShrink: 0 }} />
              <span style={{ maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.name}</span>
              <ChevronDown size={10} style={{ color: 'var(--text-muted)', transform: isPageDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
            </button>

            {/* Page dropdown */}
            {isPageDropOpen && (
              <div style={S.dropdown}>
                <div style={{ padding: '4px 10px 6px', fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pages</span><span style={{ color: '#94a3b8' }}>{project.pages.length}</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {project.pages.map(p => {
                    const active = p.id === activePage.id;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 7, background: active ? 'rgba(16,118,252,0.15)' : 'transparent', cursor: 'pointer' }}>
                        <button onClick={() => { setActivePage(p.id); setIsPageDropOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', color: active ? '#38bdf8' : '#94a3b8', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                          <FileText size={12} style={{ color: active ? '#38bdf8' : '#94a3b8' }} />{p.name}
                        </button>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button onClick={e => { e.stopPropagation(); duplicatePage(p.id); }} style={{ ...S.iconBtn, width: 22, height: 22 }} title="Duplicate">
                            <Copy size={11} />
                          </button>
                          {project.pages.length > 1 && (
                            <button onClick={e => { e.stopPropagation(); deletePage(p.id); }} style={{ ...S.iconBtn, width: 22, height: 22 }} title="Delete">
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleAddPage} style={{ display: 'flex', gap: 6, padding: '6px 4px 4px', borderTop: '1px solid #1f2433', marginTop: 4 }}>
                  <input
                    placeholder="New page..."
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    style={{ flex: 1, background: '#131620', border: '1px solid #23283a', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#f8fafc', outline: 'none' }}
                  />
                  <button type="submit" style={{ width: 26, height: 26, borderRadius: 6, background: '#1076fc', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    <Plus size={13} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Cloud sync */}
          <div style={{ marginLeft: 10, flexShrink: 0 }} className="hidden lg:flex items-center">
            {cloudSyncStatus === 'saving' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,118,252,0.1)', border: '1px solid rgba(16,118,252,0.3)', fontSize: 10.5, color: '#38bdf8' }}>
                <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving</span>
              </div>
            ) : cloudSyncStatus === 'saved' ? (
              <button onClick={() => saveToCloud(true)} title={`Saved${lastCloudSavedAt ? ` at ${lastCloudSavedAt}` : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 10.5, color: '#059669', cursor: 'pointer', fontWeight: 600 }}>
                <Cloud size={11} /><span>Saved</span>
              </button>
            ) : (
              <button onClick={() => saveToCloud(true)} title="Save to cloud" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: 'var(--studio-pill-bg)', border: '1px solid var(--border-subtle)', fontSize: 10.5, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Cloud size={11} /><span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Viewport + Actions (Pinned & Guaranteed Visible) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {/* Viewport switch icons pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--studio-pill-bg)',
              border: '1px solid var(--studio-pill-border)',
              borderRadius: 9999,
              padding: 2,
              gap: 1,
            }}
            className="hidden md:flex"
          >
            {vp.map((v) => {
              const on = viewportMode === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setViewportMode(v.id)}
                  title={`Switch to ${v.label} preview`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: 9999,
                    border: 'none',
                    background: on ? 'var(--studio-pill-active-bg)' : 'transparent',
                    color: on ? 'var(--primary)' : 'var(--studio-pill-inactive-text)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {v.icon}
                </button>
              );
            })}
          </div>

          <div style={{ ...S.sep, margin: '0 2px' }} className="hidden md:block" />

          <TextBtn icon={<Eye size={13} />} label="Preview" responsive onClick={() => setEditorMode(editorMode === 'preview' ? 'design' : 'preview')} active={editorMode === 'preview'} />
          <TextBtn icon={<Code2 size={13} />} label="Export" responsive onClick={() => setIsExportOpen(true)} />

          {/* Mint / Emerald Publish Pill Button */}
          <button
            onClick={() => setIsPublishOpen(true)}
            title="Publish project to web with live URL, QR code, and custom domain"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              height: 28,
              padding: '0 12px',
              borderRadius: 9999,
              border: 'none',
              background: '#10b981',
              color: '#062817',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
              transition: 'background 0.15s ease, transform 0.12s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#34d399';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#10b981';
            }}
          >
            <Sparkles size={12} style={{ color: '#062817' }} />
            <span>{isPublished ? 'Update' : 'Publish'}</span>
          </button>

          {/* More Menu (...) with all features */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <IconBtn icon={<MoreHorizontal size={15} />} onClick={() => setIsMoreOpen(!isMoreOpen)} active={isMoreOpen} title="More Features & Tools" />
            {isMoreOpen && (
              <div style={S.dropdownR}>
                <DropRow icon={<Inbox size={13} />} label="Form Leads & Submissions" onClick={() => { setIsMoreOpen(false); setIsLeadsOpen(true); }} />
                <DropRow icon={<SearchCheck size={13} />} label="SEO Health Audit" onClick={() => { setIsMoreOpen(false); setIsSeoOpen(true); }} />
                <DropRow icon={<BarChart2 size={13} />} label="Site Analytics & Traffic" onClick={() => { setIsMoreOpen(false); setIsAnalyticsOpen(true); }} />
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <DropRow icon={<Layout size={13} />} label="Section & Block Templates" onClick={() => { setIsMoreOpen(false); setIsTemplatesOpen(true); }} />
                <DropRow icon={<Code2 size={13} />} label="Export Code (HTML/CSS/ZIP)" onClick={() => { setIsMoreOpen(false); setIsExportOpen(true); }} />
                <DropRow icon={<Eye size={13} />} label="Toggle Live Preview" onClick={() => { setIsMoreOpen(false); setEditorMode(editorMode === 'preview' ? 'design' : 'preview'); }} />
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <DropRow icon={<Sparkles size={13} />} label="Getting Started" onClick={() => { setIsMoreOpen(false); setShowOnboarding(true); }} />
                <DropRow icon={<History size={13} />} label="Version History" onClick={() => { setIsMoreOpen(false); setIsVersionHistoryOpen(true); }} />
                <DropRow icon={<Keyboard size={13} />} label="Shortcuts" onClick={() => { setIsMoreOpen(false); setShowShortcutsModal(true); }} />
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Editor Complexity</span>
                  <button onClick={() => { setEditorComplexity(editorComplexity === 'pro' ? 'simple' : 'pro'); setIsMoreOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 5, background: 'var(--input-bg)', border: '1px solid var(--border-dark)', color: 'var(--text-main)', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
                    <Zap size={11} style={{ color: '#f59e0b' }} />{editorComplexity}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ ...S.sep, margin: '0 2px' }} />

          {/* Theme Mode Toggle (Dark / Light) - ALWAYS ACCESSIBLE */}
          <button
            onClick={toggleAppTheme}
            title={isLight ? 'Switch to Dark Mode (⌘T)' : 'Switch to Light Mode (⌘T)'}
            aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 9999,
              border: '1px solid var(--border-subtle)',
              background: 'var(--studio-pill-bg)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--studio-pill-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--studio-pill-bg)';
            }}
          >
            {isLight ? <Moon size={13} className="text-slate-700" /> : <Sun size={13} className="text-amber-400" />}
          </button>

          {/* Inspector toggle - ALWAYS ACCESSIBLE */}
          <button
            onClick={toggleRightSidebar}
            title={rightSidebarOpen ? 'Hide Inspector' : 'Show Inspector'}
            style={{
              ...S.textBtn,
              height: 28,
              padding: '0 8px',
              background: rightSidebarOpen ? 'var(--studio-pill-hover)' : 'transparent',
              color: rightSidebarOpen ? 'var(--text-main)' : 'var(--text-muted)',
              borderColor: rightSidebarOpen ? 'var(--border-strong)' : 'var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <Sliders size={13} />
            <span className="hidden xl:inline">Inspector</span>
          </button>

          {/* Account / User Menu - ALWAYS ACCESSIBLE */}
          {currentUser ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28, padding: '0 6px', borderRadius: 9999, background: 'var(--studio-pill-bg)', border: '1px solid var(--studio-pill-border)', cursor: 'pointer' }}
                title={`Signed in as ${currentUser.name}`}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1076fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ffffff' }}>
                  {currentUser.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 65, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden md:inline">{currentUser.name}</span>
                <ChevronDown size={10} style={{ color: 'var(--text-muted)' }} />
              </button>
              {isUserMenuOpen && (
                <div style={S.dropdownR}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{currentUser.email}</div>
                  </div>
                  <DropRow icon={<FolderOpen size={13} />} label="My Projects" onClick={() => { setIsUserMenuOpen(false); setIsProjectManagerOpen(true); }} />
                  <DropRow icon={<History size={13} />} label="Version History" onClick={() => { setIsUserMenuOpen(false); setIsVersionHistoryOpen(true); }} />
                  <DropRow icon={<User size={13} />} label="Edit Profile" onClick={() => { setIsUserMenuOpen(false); setIsProfileOpen(true); }} />
                  <DropRow icon={<Inbox size={13} />} label="Form Submissions" onClick={() => { setIsLeadsOpen(true); setIsUserMenuOpen(false); }} />
                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                  <DropRow icon={<LogOut size={13} />} label="Sign Out" danger onClick={() => { setIsUserMenuOpen(false); logout(); }} />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 9999, background: 'var(--text-main)', border: 'none', color: isLight ? '#ffffff' : '#080808', cursor: 'pointer', fontSize: 11, fontWeight: 600, flexShrink: 0 }}
              title="Sign In to Save & Sync Projects"
            >
              <LogIn size={12} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <PublishModal isOpen={isPublishOpen} onClose={() => setIsPublishOpen(false)} />
      <LeadsModal isOpen={isLeadsOpen} onClose={() => setIsLeadsOpen(false)} />
      <SeoAuditModal isOpen={isSeoOpen} onClose={() => setIsSeoOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProjectManagerModal isOpen={isProjectManagerOpen} onClose={() => setIsProjectManagerOpen(false)} />
      <VersionHistoryModal isOpen={isVersionHistoryOpen} onClose={() => setIsVersionHistoryOpen(false)} />
      <TemplateLibraryModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} />
      <DatabaseModal isOpen={isDatabaseOpen} onClose={() => setIsDatabaseOpen(false)} />
    </>
  );
};
