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

const EditorLayout: React.FC = () => {
  const { editorMode, setEditorMode, leftSidebarOpen, rightSidebarOpen } = useEditor();

  const [leftSidebarTab, setLeftSidebarTab] = React.useState<'elements' | 'layers' | 'pages' | 'theme'>('elements');

  const [publicSlug, setPublicSlug] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('p') || params.get('site') || params.get('slug') || null;
    }
    return null;
  });

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
      <div className="w-full h-full min-h-screen bg-[#090a0f] flex flex-col">
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
      <div className="w-full h-full min-h-screen bg-[#0c0c0e] overflow-hidden flex flex-col">
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
      style={{ background: '#0c0c0e' }}
    >
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
          className="shrink-0 z-10 border-r border-[#1a1a20] bg-[#0d0d10] overflow-hidden"
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
        </div>

        {/* Right Properties Panel (Inspector) */}
        <aside
          style={{
            width: rightSidebarOpen ? 270 : 0,
            transition: 'width 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shrink-0 z-10 border-l border-[#1a1a20] bg-[#0d0d10] overflow-hidden"
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
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Craft Studio Error">
      <EditorProvider>
        <ErrorBoundary fallbackTitle="Craft Studio Error">
          <EditorLayout />
        </ErrorBoundary>
      </EditorProvider>
    </ErrorBoundary>
  );
}
