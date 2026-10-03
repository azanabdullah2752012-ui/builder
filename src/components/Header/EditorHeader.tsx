import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Eye, Code2, Menu, Plus, Trash2, ChevronDown,
  Monitor, Tablet, Smartphone, Sliders, FileText, Copy,
  LogOut, User, Sparkles, Zap, Cloud, Loader2,
  FolderOpen, History, LogIn, MoreHorizontal, Keyboard, Globe,
  Inbox, SearchCheck, BarChart2, Crown, Star,
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

const S = {
  header: {
    height: 44,
    background: '#0f0f0f',
    borderBottom: '1px solid #1e1e1e',
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
    color: '#e8e8e8',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  brandStar: { color: '#6366f1', fontSize: 14 },
  sep: { width: 1, height: 14, background: '#2a2a2a', margin: '0 8px' } as React.CSSProperties,
  iconBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 6, border: 'none',
    background: 'transparent', color: '#666', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s', fontSize: 12,
  } as React.CSSProperties,
  textBtn: {
    display: 'flex', alignItems: 'center', gap: 5, height: 28,
    padding: '0 10px', borderRadius: 6, border: '1px solid #222',
    background: 'transparent', color: '#999', cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s, border-color 0.12s',
    fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  pagePill: {
    display: 'flex', alignItems: 'center', gap: 5, height: 26,
    padding: '0 8px', borderRadius: 6,
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#e8e8e8', cursor: 'pointer', fontSize: 11, fontWeight: 500,
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', left: 0,
    width: 220, background: '#141414', border: '1px solid #262626',
    borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    padding: '4px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropdownR: {
    position: 'absolute' as const, top: 'calc(100% + 6px)', right: 0,
    width: 220, background: '#141414', border: '1px solid #262626',
    borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    padding: '4px', zIndex: 100,
    animation: 'craftFadeIn 0.1s ease-out',
  } as React.CSSProperties,
  dropRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
    borderRadius: 7, cursor: 'pointer', fontSize: 12, color: '#bbb',
    transition: 'background 0.1s, color 0.1s',
  } as React.CSSProperties,
  segGroup: {
    display: 'flex', alignItems: 'center', gap: 2, padding: '3px',
    background: '#141414', border: '1px solid #222', borderRadius: 8,
  } as React.CSSProperties,
};

function DropRow({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...S.dropRow, background: hov ? (danger ? 'rgba(239,68,68,0.08)' : '#1e1e1e') : 'transparent', color: hov ? (danger ? '#f87171' : '#e8e8e8') : (danger ? '#f87171' : '#bbb') }}
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
        background: accent ? (hov ? '#5b5bd6' : '#6366f1') : active ? '#1e1e1e' : hov ? '#1a1a1a' : 'transparent',
        color: accent ? '#fff' : active || hov ? '#e8e8e8' : '#888',
        borderColor: accent ? 'transparent' : active ? '#333' : hov ? '#2a2a2a' : '#222',
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
    userPlanTier, openUpgradeModal,
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

          {/* Brand */}
          <div style={S.brand}>
            <span style={S.brandStar}>✦</span>
            <span>Craft</span>
          </div>

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
                style={{ background: '#1a1a1a', border: '1px solid #6366f1', borderRadius: 5, padding: '2px 8px', fontSize: 11, color: '#e8e8e8', outline: 'none', width: 110 }}
              />
            ) : (
              <span
                onClick={() => { setTitleValue(project.name); setIsEditingTitle(true); }}
                style={{ fontSize: 12, color: '#999', cursor: 'text', fontWeight: 400 }}
              >
                {project.name}
              </span>
            )}

            <span style={{ color: '#333', fontSize: 12, margin: '0 1px' }}>/</span>

            <button
              onClick={() => setIsPageDropOpen(!isPageDropOpen)}
              style={S.pagePill}
            >
              <FileText size={11} style={{ color: '#6366f1' }} />
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activePage.name}</span>
              <ChevronDown size={11} style={{ color: '#555', transform: isPageDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>

            {/* Page dropdown */}
            {isPageDropOpen && (
              <div style={S.dropdown}>
                <div style={{ padding: '4px 10px 6px', fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pages</span><span style={{ color: '#444' }}>{project.pages.length}</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {project.pages.map(p => {
                    const active = p.id === activePage.id;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 7, background: active ? 'rgba(99,102,241,0.1)' : 'transparent', cursor: 'pointer' }}>
                        <button onClick={() => { setActivePage(p.id); setIsPageDropOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, background: 'none', border: 'none', color: active ? '#818cf8' : '#bbb', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                          <FileText size={12} style={{ color: active ? '#6366f1' : '#444' }} />{p.name}
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
                <form onSubmit={handleAddPage} style={{ display: 'flex', gap: 6, padding: '6px 4px 4px', borderTop: '1px solid #1e1e1e', marginTop: 4 }}>
                  <input
                    placeholder="New page..."
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#e8e8e8', outline: 'none' }}
                  />
                  <button type="submit" style={{ width: 26, height: 26, borderRadius: 6, background: '#6366f1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              padding: '0 10px',
              borderRadius: 6,
              border: isPublished ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(99,102,241,0.4)',
              background: isPublished
                ? 'rgba(16,185,129,0.12)'
                : '#6366f1',
              color: isPublished ? '#34d399' : '#ffffff',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              boxShadow: isPublished ? '0 0 10px rgba(16,185,129,0.15)' : '0 0 10px rgba(99,102,241,0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Globe size={13} style={{ color: isPublished ? '#34d399' : '#ffffff' }} />
            <span>{isPublished ? 'Published' : 'Publish'}</span>
            {isPublished && (
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 4px #34d399' }} />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
              {/* Plan Tier Badge / Upgrade Button */}
              {userPlanTier === 'free' ? (
                <button
                  type="button"
                  onClick={() => openUpgradeModal('Upgrade your workspace for unlimited projects and Next.js code export.')}
                  title="On Free Plan — Click to Upgrade"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    height: 28,
                    padding: '0 9px',
                    borderRadius: 7,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: '1px solid #6366f1',
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Zap size={11} fill="#ffffff" />
                  <span>Upgrade</span>
                </button>
              ) : userPlanTier === 'pro' ? (
                <button
                  type="button"
                  onClick={() => openUpgradeModal()}
                  title="Pro Studio Plan Active — Click to manage"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    height: 28,
                    padding: '0 8px',
                    borderRadius: 7,
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    color: '#818cf8',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Star size={11} fill="#818cf8" />
                  <span>PRO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openUpgradeModal()}
                  title="Enterprise Plan Active — Click to manage"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    height: 28,
                    padding: '0 8px',
                    borderRadius: 7,
                    background: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    color: '#c084fc',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Crown size={11} fill="#c084fc" />
                  <span>ENTERPRISE</span>
                </button>
              )}

              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 8px', borderRadius: 7, background: '#141414', border: '1px solid #222', cursor: 'pointer' }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {currentUser.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span style={{ fontSize: 11, color: '#aaa', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</span>
                <ChevronDown size={11} style={{ color: '#444' }} />
              </button>
              {isUserMenuOpen && (
                <div style={S.dropdownR}>
                  <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #1e1e1e', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e8e8e8' }}>{currentUser.name}</div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: '#25293d', color: '#818cf8', border: '1px solid #363d59' }}>
                        {userPlanTier.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{currentUser.email}</div>
                  </div>
                  <DropRow icon={<Zap size={13} style={{ color: '#818cf8' }} />} label="Subscription & Pricing" onClick={() => { setIsUserMenuOpen(false); openUpgradeModal(); }} />
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
    </>
  );
};
