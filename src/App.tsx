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
  const { editorMode, setEditorMode, leftSidebarOpen, rightSidebarOpen } = useEditor();

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

  // 1. Landing page
  if (editorMode === 'landing') {
    return (
      <div className="w-full h-full min-h-screen bg-[#101510] flex flex-col">
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
      <div className="w-full h-full min-h-screen bg-[#101510] overflow-hidden flex flex-col">
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
      className="w-full h-full min-h-screen overflow-hidden flex flex-col relative text-zinc-100 font-sans"
      style={{ background: '#101510' }}
    >
      {/* ── Mobile Screen Guidance Banner ─────────────────────────────── */}
      {isSmallScreen && !dismissedMobileNotice && (
        <aside
          aria-label="Desktop screen notice"
          style={{
            backgroundColor: '#1C241B',
            borderBottom: '1px solid #354331',
            color: '#B8F36B',
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
              <strong>Desktop Notice:</strong> Pickle Studio's visual editor canvas is optimized for a keyboard and mouse. You can preview published sites on mobile, but switch to a laptop or computer to design smoothly!
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
              color: '#A0A99A',
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

      {/* ── Row 1: Top Header Bar ─────────────────────────────────────── */}
      <ErrorBoundary fallbackTitle="Header Error">
        <EditorHeader />
      </ErrorBoundary>

      {/* ── Row 2: Sub-Toolbar (element insertion dock) ───────────────── */}
      <ErrorBoundary fallbackTitle="Toolbar Error">
        <CanvasQuickDock />
      </ErrorBoundary>

      {/* ── Row 4: Main Workspace ─────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Components, Layers, Pages) */}
        <aside
          style={{
            width: leftSidebarOpen ? 260 : 0,
            transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shrink-0 z-10 border-r border-[#354331] bg-[#101510] overflow-hidden"
          aria-hidden={!leftSidebarOpen}
        >
          <div className="w-[260px] h-full">
            <ErrorBoundary fallbackTitle="Sidebar Error">
              <ElementsSidebar activeTab={leftSidebarTab} setActiveTab={setLeftSidebarTab} />
            </ErrorBoundary>
          </div>
        </aside>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
          <ErrorBoundary fallbackTitle="Canvas Error">
            <Canvas />
          </ErrorBoundary>
          <ErrorBoundary fallbackTitle="Dock Error">
            <KidFriendlyDock />
          </ErrorBoundary>
        </div>

        {/* Right Properties Panel (Inspector) */}
        <aside
          style={{
            width: rightSidebarOpen ? 270 : 0,
            transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shrink-0 z-10 border-l border-[#354331] bg-[#101510] overflow-hidden"
          aria-hidden={!rightSidebarOpen}
        >
          <div className="w-[270px] h-full">
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
