import React from 'react';
import { EditorProvider } from './context/EditorContext';
import { useEditor } from './context/useEditor';
import { EditorHeader } from './components/Header/EditorHeader';
import { ElementsSidebar } from './components/SidebarLeft/ElementsSidebar';
import { Canvas } from './components/Canvas/Canvas';
import { CanvasQuickDock } from './components/Canvas/CanvasQuickDock';
import { PropertiesPanel } from './components/SidebarRight/PropertiesPanel';
import { PreviewView } from './components/Preview/PreviewView';
import { LivePublicView } from './components/Preview/LivePublicView';
import { ProductLandingPage } from './components/Landing/ProductLandingPage';
import { ToastContainer } from './components/Toast/ToastContainer';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { KidFriendlyDock } from './components/SimpleMode/KidFriendlyDock';
import { CommandPalette } from './components/CommandPalette/CommandPalette';

const EditorLayout: React.FC = () => {
  const { editorMode, setEditorMode, leftSidebarOpen, rightSidebarOpen, appTheme } = useEditor();
  const isLight = appTheme === 'light';

  const [leftSidebarTab, setLeftSidebarTab] = React.useState<'elements' | 'layers' | 'pages' | 'theme'>('elements');
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

  // Cmd+K or / to open command palette
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    const openHandler = () => setCommandPaletteOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('editor:open-command-palette', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('editor:open-command-palette', openHandler);
    };
  }, []);

  const [publicSlug, setPublicSlug] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('p') || params.get('site') || params.get('slug') || null;
    }
    return null;
  });

  const [dismissedMobileNotice, setDismissedMobileNotice] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pickle_dismissed_mobile_notice') === 'true';
    }
    return false;
  });
  const [isSmallScreen, setIsSmallScreen] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setPublicSlug(params.get('p') || params.get('site') || params.get('slug') || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 0. Live Public View
  if (publicSlug) {
    return (
      <ErrorBoundary fallbackTitle="Live Website Error">
        <LivePublicView
          slugOrId={publicSlug}
          onEditInStudio={() => {
            setPublicSlug(null);
            try {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch {}
            setEditorMode('design');
          }}
        />
      </ErrorBoundary>
    );
  }

  // 1. Landing page mode
  if (editorMode === 'landing') {
    return (
      <div
        className={`w-full h-full min-h-screen flex flex-col ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
        style={{ background: 'var(--ps-canvas-bg, var(--studio-ambient))', height: '100vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <ErrorBoundary fallbackTitle="Landing Page Error">
          <ProductLandingPage onLaunchEditor={() => setEditorMode('design')} />
        </ErrorBoundary>
        <ToastContainer />
      </div>
    );
  }

  // 2. Preview mode
  if (editorMode === 'preview') {
    return (
      <div className="w-full h-full min-h-screen bg-[#08090d] overflow-hidden flex flex-col">
        <ErrorBoundary fallbackTitle="Preview Error">
          <PreviewView />
        </ErrorBoundary>
        <ToastContainer />
        <ShortcutsModal />
      </div>
    );
  }

  // 3. Design editor
  return (
    <div
      className={`w-full h-screen max-h-screen overflow-hidden flex flex-col relative font-sans select-none ${isLight ? 'text-slate-900' : 'text-slate-100'}`}
      style={{
        background: 'var(--studio-ambient)',
      }}
    >
      {/* ── Mobile Screen Guidance Banner ─────────────────────────────── */}
      {isSmallScreen && !dismissedMobileNotice && (
        <aside
          aria-label="Desktop screen notice"
          style={{
            backgroundColor: isLight ? '#f1f5f9' : '#0f1118',
            borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#23283a'}`,
            color: isLight ? '#0284c7' : '#60a5fa',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 12,
            zIndex: 60,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>💻</span>
            <span style={{ lineHeight: 1.4 }}>
              <strong>Desktop Notice:</strong> Pickle Studio's visual editor canvas is optimized for keyboard and mouse. Switch to a computer or laptop to design smoothly!
            </span>
          </div>
          <button
            onClick={() => {
              setDismissedMobileNotice(true);
              try {
                sessionStorage.setItem('pickle_dismissed_mobile_notice', 'true');
              } catch {}
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#64748b' : '#94a3b8',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
            }}
            title="Dismiss notice"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ── Row 1: Top Floating Header Bar ─────────────────────────────── */}
      <ErrorBoundary fallbackTitle="Header Error">
        <EditorHeader />
      </ErrorBoundary>

      {/* ── Main Workspace Stage with Floating Inset Glass Panels ───────── */}
      <div className="flex-1 flex overflow-hidden relative p-1.5 sm:p-2 md:p-3 gap-1.5 sm:gap-2 md:gap-3">
        {/* Left Floating Sidebar Card (Components, Layers, Pages) */}
        <aside
          style={{
            width: leftSidebarOpen ? 272 : 0,
            opacity: leftSidebarOpen ? 1 : 0,
            transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
            marginRight: leftSidebarOpen ? 0 : -12,
            background: 'var(--studio-panel-bg)',
            borderColor: 'var(--studio-panel-border)',
            boxShadow: 'var(--studio-panel-shadow)',
          }}
          className="shrink-0 z-20 rounded-2xl border backdrop-blur-2xl overflow-hidden flex flex-col min-h-0 h-full"
          aria-hidden={!leftSidebarOpen}
        >
          <div className="w-[272px] h-full flex flex-col min-h-0 overflow-hidden">
            <ErrorBoundary fallbackTitle="Sidebar Error">
              <ElementsSidebar activeTab={leftSidebarTab} setActiveTab={setLeftSidebarTab} />
            </ErrorBoundary>
          </div>
        </aside>

        {/* Center Canvas with Ambient Glow */}
        <div
          style={{
            background: 'var(--studio-stage-bg)',
            borderColor: 'var(--studio-stage-border)',
          }}
          className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 rounded-2xl border backdrop-blur-sm shadow-inner"
        >
          <ErrorBoundary fallbackTitle="Canvas Error">
            <Canvas />
          </ErrorBoundary>

          {/* Floating Quick Creation Dock */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-transform hover:scale-[1.02] active:scale-[0.99]">
            <ErrorBoundary fallbackTitle="Toolbar Error">
              <CanvasQuickDock />
            </ErrorBoundary>
          </div>

          <ErrorBoundary fallbackTitle="Dock Error">
            <KidFriendlyDock />
          </ErrorBoundary>
        </div>

        {/* Right Floating Properties Panel Card (Inspector) */}
        <aside
          style={{
            width: rightSidebarOpen ? 288 : 0,
            opacity: rightSidebarOpen ? 1 : 0,
            transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease',
            marginLeft: rightSidebarOpen ? 0 : -12,
            background: 'var(--studio-panel-bg)',
            borderColor: 'var(--studio-panel-border)',
            boxShadow: 'var(--studio-panel-shadow)',
          }}
          className="shrink-0 z-20 rounded-2xl border backdrop-blur-2xl overflow-hidden flex flex-col min-h-0 h-full"
          aria-hidden={!rightSidebarOpen}
        >
          <div className="w-[288px] h-full flex flex-col min-h-0 overflow-hidden">
            <ErrorBoundary fallbackTitle="Inspector Error">
              <PropertiesPanel />
            </ErrorBoundary>
          </div>
        </aside>
      </div>

      <ToastContainer />
      <ShortcutsModal />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Pickle Studio Error">
      <EditorProvider>
        <ErrorBoundary fallbackTitle="Pickle Studio Error">
          <EditorLayout />
        </ErrorBoundary>
      </EditorProvider>
    </ErrorBoundary>
  );
}
