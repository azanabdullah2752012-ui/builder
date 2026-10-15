import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Eye, Code2, Menu, Plus, Trash2, ChevronDown,
  Monitor, Tablet, Smartphone, Sliders, FileText, Copy,
  LogOut, User, Sparkles, Zap, Cloud, Loader2,
  FolderOpen, History, LogIn, MoreHorizontal, Keyboard, Globe,
  Inbox, SearchCheck, BarChart2, LayoutTemplate,
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
import { PickleTorchSvg } from '../Brand/PickleCorpLogo';

const S = {
  header: {
    height: 44,
    background: '#101510',
    borderBottom: '1px solid #354331',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    flexShrink: 0,
    userSelect: 'none' as const,
    zIndex: 30,
    fontSize: 12,
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#F4F5EF',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  brandStar: { color: '#B8F36B', fontSize: 14 },
  sep: { width: 1, height: 14, background: '#354331', margin: '0 8px' } as React.CSSProperties,
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 6, border: 'none',
    background: 'transparent', color: '#A0A99A', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s', fontSize: 12,
  } as React.CSSProperties,
  textBtn: {
    display: 'flex', alignItems: 'center', gap: 5, height: 28,
    padding: '0 10px', borderRadius: 6, border: '1px solid #354331',
    background: 'transparent', color: '#A0A99A', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
    fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  pagePill: {
    display: 'flex', alignItems: 'center', gap: 5, height: 26,
    padding: '0 8px', borderRadius: 6,
    background: '#1C241B', border: '1px solid #354331',
    color: '#F4F5EF', cursor: 'pointer', fontSize: 11, fontWeight: 500,
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', left: 0,
    width: 220, background: '#1C241B', border: '1px solid #354331',
    borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    padding: '4px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropdownR: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', right: 0,
    width: 220, background: '#1C241B', border: '1px solid #354331',
    borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    padding: '4px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
    borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#A0A99A',
    transition: 'background 0.1s, color 0.1s',
  } as React.CSSProperties,
  segGroup: {
    display: 'flex', alignItems: 'center', gap: 2, padding: '3px',
    background: '#1C241B', border: '1px solid #354331', borderRadius: 8,
  } as React.CSSProperties,
};

function DropRow({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...S.dropRow, background: hov ? (danger ? 'rgba(239,68,68,0.08)' : '#252F23') : 'transparent', color: hov ? (danger ? '#f87171' : '#F4F5EF') : (danger ? '#f87171' : '#A0A99A') }}
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
      style={{ ...S.iconBtn, background: active ? '#1e1e1e' : hov ? '#1a1a1a' : 'transparent', color: active || hov ? '#e8e8e8' : '#666' }}
    >
      {icon}
    </button>
  );
}

function TextBtn({ icon, label, title, active, accent, onClick }: { icon?: React.ReactNode; label: string; title?: string; active?: boolean; accent?: boolean; onClick?: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...S.textBtn,
        background: accent ? (hov ? '#c4f780' : '#B8F36B') : active ? '#252F23' : hov ? '#1C241B' : 'transparent',
        color: accent ? '#101510' : active || hov ? '#F4F5EF' : '#A0A99A',
        borderColor: accent ? 'transparent' : active ? '#B8F36B' : hov ? '#354331' : 'transparent',
        fontWeight: accent ? 600 : 400,
      }}
    >
      {icon}{label}
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
  } = useEditor();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconBtn icon={<Menu size={15} />} title="Toggle panel" onClick={toggleLeftSidebar} />

          <div style={{ ...S.sep, margin: '0 4px 0 6px' }} />

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
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.8'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <PickleTorchSvg size={22} theme="dark" style={{ marginRight: 6 }} />
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#F4F5EF' }}>Pickle</span>
            <span style={{ fontWeight: 600, color: '#B8F36B', marginLeft: 3 }}>Studio</span>
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 800,
                color: '#1076fc',
                backgroundColor: 'rgba(16, 118, 252, 0.12)',
                border: '1px solid rgba(16, 118, 252, 0.3)',
                padding: '1px 6px',
                borderRadius: 4,
                marginLeft: 6,
                letterSpacing: '0.06em',
              }}
            >
              CORP™
            </span>
          </button>

          <div style={S.sep} />

          {/* Project + Page breadcrumb */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setIsProjectManagerOpen(true)}
              title="Projects"
              style={{ ...S.iconBtn, width: 24 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLElement).style.color = '#e8e8e8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#666'; }}
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
                style={{ background: '#1C241B', border: '1px solid #B8F36B', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#F4F5EF', outline: 'none', width: 110 }}
              />
            ) : (
              <span
                onClick={() => { setTitleValue(project.name); setIsEditingTitle(true); }}
                style={{ fontSize: 12, color: '#A0A99A', cursor: 'text', fontWeight: 400 }}
              >
                {project.name}
              </span>
            )}

            <span style={{ color: '#354331', fontSize: 12, margin: '0 1px' }}>/</span>

            <button
              onClick={() => setIsPageDropOpen(!isPageDropOpen)}
              style={S.pagePill}
            >
              <FileText size={11} style={{ color: '#B8F36B' }} />
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.name}</span>
              <ChevronDown size={11} style={{ color: '#A0A99A', transform: isPageDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {/* Page dropdown */}
            {isPageDropOpen && (
              <div style={S.dropdown}>
                <div style={{ padding: '4px 10px 6px', fontSize: 10, fontWeight: 600, color: '#A0A99A', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pages</span><span style={{ color: '#A0A99A' }}>{project.pages.length}</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {project.pages.map(p => {
                    const active = p.id === activePage.id;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 7, background: active ? 'rgba(184,243,107,0.12)' : 'transparent', cursor: 'pointer' }}>
                        <button onClick={() => { setActivePage(p.id); setIsPageDropOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', color: active ? '#B8F36B' : '#A0A99A', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                          <FileText size={12} style={{ color: active ? '#B8F36B' : '#A0A99A' }} />{p.name}
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
                <form onSubmit={handleAddPage} style={{ display: 'flex', gap: 6, padding: '6px 4px 4px', borderTop: '1px solid #354331', marginTop: 4 }}>
                  <input
                    placeholder="New page..."
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    style={{ flex: 1, background: '#1C241B', border: '1px solid #354331', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#F4F5EF', outline: 'none' }}
                  />
                  <button type="submit" style={{ width: 26, height: 26, borderRadius: 6, background: '#B8F36B', border: 'none', color: '#101510', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    <Plus size={13} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Cloud sync */}
          <div style={{ marginLeft: 6 }}>
            {cloudSyncStatus === 'saving' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 11, color: '#818cf8' }}>
                <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving</span>
              </div>
            ) : cloudSyncStatus === 'saved' ? (
              <button onClick={() => saveToCloud(true)} title={`Saved${lastCloudSavedAt ? ` at ${lastCloudSavedAt}` : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 11, color: '#34d399', cursor: 'pointer' }}>
                <Cloud size={11} /><span>Saved</span>
              </button>
            ) : (
              <button onClick={() => saveToCloud(true)} title="Save to cloud" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 6, background: 'transparent', border: '1px solid #1e1e1e', fontSize: 11, color: '#555', cursor: 'pointer' }}>
                <Cloud size={11} /><span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Center: Viewport switcher ─────────────────── */}
        <div style={S.segGroup}>
          {vp.map(v => {
            const on = viewportMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setViewportMode(v.id)}
                title={v.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, height: 26, padding: '0 10px',
                  borderRadius: 6, border: on ? '1px solid #2a2a2a' : '1px solid transparent',
                  background: on ? '#1e1e1e' : 'transparent',
                  color: on ? '#e8e8e8' : '#555', cursor: 'pointer',
                  fontSize: 11, fontWeight: on ? 500 : 400, transition: 'all 0.12s',
                }}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right: Actions ───────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Mode Switcher (Simple / Kid Mode vs Pro Mode) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1C241B',
              border: '1px solid #354331',
              borderRadius: 8,
              padding: 2,
              gap: 2,
            }}
          >
            <button
              onClick={() => setEditorComplexity('simple')}
              title="Simple Mode: Perfect for kids, students, and beginners (1-Click Kits & Lego Blocks)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: 24,
                padding: '0 8px',
                borderRadius: 6,
                border: 'none',
                background: editorComplexity === 'simple' ? '#B8F36B' : 'transparent',
                color: editorComplexity === 'simple' ? '#101510' : '#A0A99A',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <span>🧒</span>
              <span>Simple</span>
            </button>
            <button
              onClick={() => setEditorComplexity('pro')}
              title="Pro Mode: Full sub-pixel styling, custom properties, and advanced layout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                height: 24,
                padding: '0 8px',
                borderRadius: 6,
                border: 'none',
                background: editorComplexity === 'pro' ? '#252F23' : 'transparent',
                color: editorComplexity === 'pro' ? '#F4F5EF' : '#A0A99A',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <Zap size={11} style={{ color: editorComplexity === 'pro' ? '#B8F36B' : '#A0A99A' }} />
              <span>Pro</span>
            </button>
          </div>

          <div style={S.sep} />

          <TextBtn icon={<LayoutTemplate size={13} />} label="Templates" onClick={() => setIsTemplatesOpen(true)} />
          <TextBtn icon={<Eye size={13} />} label="Preview" onClick={() => setEditorMode(editorMode === 'preview' ? 'design' : 'preview')} active={editorMode === 'preview'} />
          <TextBtn icon={<Code2 size={13} />} label="Export" onClick={() => setIsExportOpen(true)} />
          <button
            onClick={() => setIsPublishOpen(true)}
            title="Publish project to web with live URL, QR code, and custom domain"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              height: 28,
              padding: '0 12px',
              borderRadius: 8,
              border: isPublished ? '1px solid rgba(184, 243, 107, 0.4)' : 'none',
              background: isPublished
                ? 'rgba(184, 243, 107, 0.12)'
                : '#B8F36B',
              color: isPublished ? '#B8F36B' : '#101510',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: isPublished ? 'none' : '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'background 0.15s ease, opacity 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isPublished) (e.currentTarget as HTMLElement).style.background = '#cbf988';
            }}
            onMouseLeave={(e) => {
              if (!isPublished) (e.currentTarget as HTMLElement).style.background = '#B8F36B';
            }}
          >
            <Globe size={13} style={{ color: isPublished ? '#B8F36B' : '#101510' }} />
            <span>
              {editorComplexity === 'simple'
                ? (isPublished ? 'Live on Web 🚀' : 'Publish Live 🚀')
                : (isPublished ? 'Published' : 'Publish')}
            </span>
            {isPublished && (
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8F36B', boxShadow: '0 0 4px #B8F36B' }} />
            )}
          </button>

          {/* More */}
          <div style={{ position: 'relative' }}>
            <IconBtn icon={<MoreHorizontal size={15} />} onClick={() => setIsMoreOpen(!isMoreOpen)} active={isMoreOpen} title="More" />
            {isMoreOpen && (
              <div style={S.dropdownR}>
                <DropRow icon={<Inbox size={13} />} label="Form Leads & Submissions" onClick={() => { setIsMoreOpen(false); setIsLeadsOpen(true); }} />
                <DropRow icon={<SearchCheck size={13} />} label="SEO Health Audit" onClick={() => { setIsMoreOpen(false); setIsSeoOpen(true); }} />
                <DropRow icon={<BarChart2 size={13} />} label="Site Analytics & Traffic" onClick={() => { setIsMoreOpen(false); setIsAnalyticsOpen(true); }} />
                <div style={{ height: 1, background: '#1e1e1e', margin: '4px 0' }} />
                <DropRow icon={<Sparkles size={13} />} label="Getting Started" onClick={() => { setIsMoreOpen(false); setShowOnboarding(true); }} />
                <DropRow icon={<History size={13} />} label="Version History" onClick={() => { setIsMoreOpen(false); setIsVersionHistoryOpen(true); }} />
                <DropRow icon={<Keyboard size={13} />} label="Shortcuts" onClick={() => { setIsMoreOpen(false); setShowShortcutsModal(true); }} />
                <div style={{ height: 1, background: '#1e1e1e', margin: '4px 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', fontSize: 11, color: '#555' }}>
                  <span>Mode</span>
                  <button onClick={() => { setEditorComplexity(editorComplexity === 'pro' ? 'simple' : 'pro'); setIsMoreOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 5, background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#e8e8e8', cursor: 'pointer', fontSize: 11, fontWeight: 500 }}>
                    <Zap size={11} style={{ color: '#f59e0b' }} />{editorComplexity}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={S.sep} />

          {/* Inspector toggle */}
          <button
            onClick={toggleRightSidebar}
            title={rightSidebarOpen ? 'Hide Inspector' : 'Show Inspector'}
            style={{
              ...S.textBtn,
              background: rightSidebarOpen ? '#1e1e1e' : 'transparent',
              color: rightSidebarOpen ? '#e8e8e8' : '#666',
              borderColor: rightSidebarOpen ? '#2a2a2a' : '#1e1e1e',
            }}
          >
            <Sliders size={13} />
            <span>Inspector</span>
          </button>

          {/* Account */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderRadius: 7, background: '#1C241B', border: '1px solid #354331', cursor: 'pointer' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#B8F36B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#101510' }}>
                  {currentUser.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span style={{ fontSize: 11, color: '#aaa', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
                <ChevronDown size={11} style={{ color: '#444' }} />
              </button>
              {isUserMenuOpen && (
                <div style={S.dropdownR}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #1e1e1e', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e8e8' }}>{currentUser.name}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{currentUser.email}</div>
                  </div>
                  <DropRow icon={<FolderOpen size={13} />} label="My Projects" onClick={() => { setIsUserMenuOpen(false); setIsProjectManagerOpen(true); }} />
                  <DropRow icon={<History size={13} />} label="Version History" onClick={() => { setIsUserMenuOpen(false); setIsVersionHistoryOpen(true); }} />
                  <DropRow icon={<User size={13} />} label="Edit Profile" onClick={() => { setIsUserMenuOpen(false); setIsProfileOpen(true); }} />
                  <DropRow icon={<Inbox size={13} />} label="Form Submissions" onClick={() => { setIsLeadsOpen(true); setIsUserMenuOpen(false); }} />
                  <div style={{ height: 1, background: '#1e1e1e', margin: '4px 0' }} />
                  <DropRow icon={<LogOut size={13} />} label="Sign Out" danger onClick={() => { setIsUserMenuOpen(false); logout(); }} />
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 28, padding: '0 12px', borderRadius: 7, background: '#e8e8e8', border: 'none', color: '#080808', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              <LogIn size={13} />Sign In
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
    </>
  );
};
