import React from 'react';
import { EditorProvider } from './context/EditorContext';
import { useEditor } from './context/useEditor';
import { EditorHeader } from './components/Header/EditorHeader';
import { IconRail } from './components/SidebarLeft/IconRail';
import { ElementsSidebar } from './components/SidebarLeft/ElementsSidebar';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/SidebarRight/PropertiesPanel';
import { PreviewView } from './components/Preview/PreviewView';
import { ProductLandingPage } from './components/Landing/ProductLandingPage';
import { ToastContainer } from './components/Toast/ToastContainer';
import { PageNavigationBar } from './components/Navigation/PageNavigationBar';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { ErrorBoundary } from './components/ErrorBoundary';

const EditorLayout: React.FC = () => {
  const { editorMode, setEditorMode, leftSidebarOpen, rightSidebarOpen, editorComplexity } = useEditor();

  const [leftSidebarTab, setLeftSidebarTab] = React.useState<'elements' | 'layers' | 'pages'>('elements');

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

  if (editorMode === 'preview') {
    return (
      <div className="w-full h-full min-h-screen bg-[#0c0c0e] overflow-hidden flex flex-col">
        <ErrorBoundary fallbackTitle="Preview Encountered an Error">
          <PreviewView />
        </ErrorBoundary>
        <ToastContainer />
        <ShortcutsModal />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-[#0e0e11] overflow-hidden flex flex-col relative text-zinc-100 font-sans">
      {/* 1. Single Unified Top Bar */}
      <ErrorBoundary fallbackTitle="Header Error">
        <EditorHeader />
      </ErrorBoundary>

      {/* 2. Studio Workspace: IconRail + Left Drawer + Canvas + Inspector Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        {leftSidebarOpen ? (
          <aside className="w-64 h-full shrink-0 z-10 border-r border-[#222226] bg-[#121214] overflow-hidden">
            <ErrorBoundary fallbackTitle="Sidebar Error">
              <ElementsSidebar activeTab={leftSidebarTab} setActiveTab={setLeftSidebarTab} />
            </ErrorBoundary>
          </aside>
        ) : (
          <IconRail activeTab={leftSidebarTab} setActiveTab={setLeftSidebarTab} />
        )}

        {/* Center Workspace: Artboard Canvas */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
          {editorComplexity === 'pro' && (
            <ErrorBoundary fallbackTitle="Navigation Error">
              <PageNavigationBar />
            </ErrorBoundary>
          )}
          <ErrorBoundary fallbackTitle="Canvas Error">
            <Canvas />
          </ErrorBoundary>
        </div>

        {/* Right Inspector Properties Panel */}
        <aside
          style={{
            width: rightSidebarOpen ? 288 : 0,
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="shrink-0 z-10 border-l border-[#222226] bg-[#121214] overflow-hidden"
          aria-hidden={!rightSidebarOpen}
        >
          <div className="w-72 h-full">
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
    <ErrorBoundary fallbackTitle="Craft Studio Encountered an Unexpected Error">
      <EditorProvider>
        <EditorLayout />
      </EditorProvider>
    </ErrorBoundary>
  );
}
