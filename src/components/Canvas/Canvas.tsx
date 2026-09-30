import React, { useRef, useMemo, useCallback, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import { CanvasElementComponent } from './CanvasElementComponent';
import { computeResponsiveLayout } from '../../utils/responsiveLayout';
import type { ElementType } from '../../types/editor';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  CreditCard,
  LayoutTemplate,
  Plus,
  UserPlus,
} from 'lucide-react';
import {
  SECTION_TEMPLATES,
  createHeroSection,
  createHeroSplitSection,
  createNavbarSection,
  createFeatureGridSection,
  createPricingSection,
  createSignUpSection,
} from '../../constants/templates';
import { CanvasContextMenu } from './CanvasContextMenu';
import { CanvasQuickDock } from './CanvasQuickDock';
import type { ShapeKind } from '../../types/editor';

export const Canvas: React.FC = () => {
  const {
    activePage,
    selectedElementId,
    selectElement,
    zoom,
    setZoom,
    showGrid,
    viewportMode,
    addElement,
    addElements,
    insertCustomImage,
    insertShape,
    insertEmoji,
    showToast,
    resetToDefaultDemo,
  } = useEditor();

  const canvasRef = useRef<HTMLDivElement>(null);
  const pageSurfaceRef = useRef<HTMLDivElement>(null);

  const [guides, setGuides] = React.useState<{
    x: number | null;
    y: number | null;
    labelX?: string;
    labelY?: string;
  }>({ x: null, y: null });

  useEffect(() => {
    const handleGuides = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGuides(detail || { x: null, y: null });
    };
    window.addEventListener('canvas:guides', handleGuides);
    return () => window.removeEventListener('canvas:guides', handleGuides);
  }, []);

  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    targetElementId: string | null;
  } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (contextMenu) setContextMenu(null);
    // Only deselect if clicked directly on canvas background or page wrapper, not on elements
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvasSurface === 'true') {
      selectElement(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const elementNode = (e.target as HTMLElement).closest('[data-element-id]');
    const clickedElementId = elementNode ? elementNode.getAttribute('data-element-id') : null;
    if (clickedElementId) {
      selectElement(clickedElementId);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      targetElementId: clickedElementId || selectedElementId,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const surface = pageSurfaceRef.current;
    let dropX = 100;
    let dropY = 100;
    if (surface) {
      const rect = surface.getBoundingClientRect();
      dropX = Math.max(0, Math.round((e.clientX - rect.left) / zoom));
      dropY = Math.max(0, Math.round((e.clientY - rect.top) / zoom));
    }

    // 1. Check if dropping image files from Desktop / Finder
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          if (!dataUrl) return;
          const img = new Image();
          img.onload = () => {
            let w = img.naturalWidth || 380;
            let h = img.naturalHeight || 250;
            const maxW = 460;
            if (w > maxW) {
              h = Math.round((h * maxW) / w);
              w = maxW;
            }
            insertCustomImage(dataUrl, file.name ? `Image (${file.name})` : 'Dropped Image', dropX, dropY);
            showToast(`Dropped image "${file.name}" onto canvas! 📸`, 'success');
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
        return;
      }
    }

    // 2. Check if dropping a Shape
    const shapeKind = e.dataTransfer.getData('application/studio-shape-kind') as ShapeKind;
    if (shapeKind) {
      insertShape(shapeKind, undefined, dropX, dropY);
      return;
    }

    // 3. Check if dropping an Emoji
    const emojiChar = e.dataTransfer.getData('application/studio-emoji');
    if (emojiChar) {
      insertEmoji(emojiChar, dropX, dropY);
      return;
    }

    // 4. Check if dropping a full section template
    const templateId = e.dataTransfer.getData('application/studio-section-template-id');
    if (templateId) {
      const template = SECTION_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        const newElements = template.create(dropY);
        addElements(newElements, false);
        return;
      }
    }

    // 5. Check if dropping an atomic primitive element
    const elementType = e.dataTransfer.getData('application/studio-element-type') as ElementType;
    if (!elementType) return;

    addElement(elementType, Math.max(0, Math.min(displayWidth - 80, dropX)), dropY);
  };

  // Compute automatic responsive layout based on active viewport mode
  const responsiveLayout = useMemo(() => {
    return computeResponsiveLayout(
      activePage.elements,
      viewportMode,
      activePage.canvasWidth || 1200,
      activePage.canvasHeight || 800
    );
  }, [activePage.elements, viewportMode, activePage.canvasWidth, activePage.canvasHeight]);

  const displayWidth = responsiveLayout.canvasWidth;
  const displayHeight = responsiveLayout.canvasHeight;
  const elementsToRender = responsiveLayout.elements;

  // Auto-fit function: scales canvas to fit available container width without horizontal clipping
  const fitToScreen = useCallback(() => {
    if (!canvasRef.current) return;
    const paddingX = 48; // 24px each side
    const containerWidth = canvasRef.current.clientWidth - paddingX;
    if (containerWidth <= 0) return;

    const scaleX = containerWidth / displayWidth;
    // Scale comfortably to fit container width, capped at 1.0 (100%) and min 0.5 (50%)
    const newZoom = Math.min(1.0, Math.max(0.5, Math.floor(scaleX * 100) / 100));
    setZoom(newZoom);
  }, [displayWidth, setZoom]);

  // Listen to global 'canvas:fit-to-screen' event triggered by ContextBar 'Fit' button
  useEffect(() => {
    const handleFit = () => fitToScreen();
    window.addEventListener('canvas:fit-to-screen', handleFit);
    return () => window.removeEventListener('canvas:fit-to-screen', handleFit);
  }, [fitToScreen]);

  // Initial auto-fit or viewport change auto-fit if content overflows available width
  const hasAutoFittedRef = useRef(false);
  useEffect(() => {
    if (!hasAutoFittedRef.current && canvasRef.current) {
      const timer = setTimeout(() => {
        fitToScreen();
        hasAutoFittedRef.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [fitToScreen]);

  // Auto-fit when viewportMode changes or window resizes if canvas overflows
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      // If canvas at current zoom overflows available container width, auto-fit
      if (width > 0 && displayWidth * zoom > width - 32) {
        fitToScreen();
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [displayWidth, zoom, fitToScreen]);

  return (
    <main
      ref={canvasRef}
      onClick={handleCanvasClick}
      onContextMenu={handleContextMenu}
      className="flex-1 bg-[#0b0e14] overflow-auto relative flex flex-col items-center justify-start p-6 lg:p-8 select-none"
      style={{
        backgroundImage: showGrid
          ? 'radial-gradient(circle, rgba(147, 197, 253, 0.08) 1px, transparent 1px)'
          : 'none',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Radiant Studio Nebula Glow behind Artboard */}
      <div
        className="absolute pointer-events-none -inset-10 overflow-hidden opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 950px 650px at 50% 36%, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.09), transparent 75%)',
        }}
      />

      {/* Floating Canvas Quick Insertion Dock */}
      <CanvasQuickDock />

      {/* Scaled Canvas Container Wrapper */}
      <div
        style={{
          width: `${displayWidth * zoom}px`,
          minHeight: `${displayHeight * zoom + 32}px`,
          transition: 'width 0.12s ease-out, height 0.12s ease-out',
        }}
        className="relative my-auto shrink-0 flex flex-col z-10"
      >
        {/* Artboard Header Badge */}
        <div className="text-[11px] text-indigo-300 font-mono font-medium mb-2.5 pl-0.5 select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
            <span className="font-sans font-semibold text-zinc-300 tracking-tight">Artboard</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-indigo-400 font-sans">{activePage.name}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{displayWidth} × {displayHeight}px</span>
        </div>

        <div
          style={{
            width: `${displayWidth}px`,
            minHeight: `${displayHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.12s ease-out',
          }}
          className="relative"
        >
          {/* Page Boundary */}
          <div
            ref={pageSurfaceRef}
            data-canvas-surface="true"
            onClick={handleCanvasClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              width: `${displayWidth}px`,
              minHeight: `${displayHeight}px`,
              backgroundColor: activePage.backgroundColor || '#ffffff',
              boxShadow:
                viewportMode === 'mobile'
                  ? '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 10px #11141e, 0 0 0 11px #262f44, 0 0 35px rgba(99, 102, 241, 0.15)'
                  : '0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.14), 0 0 40px rgba(99, 102, 241, 0.1)',
              transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className={`relative overflow-hidden ${viewportMode === 'mobile' ? 'rounded-3xl' : 'rounded-xl'}`}
          >
          {/* Phone Top Speaker/Camera notch simulation when in phone mode */}
          {viewportMode === 'mobile' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-40 flex items-center justify-center opacity-80 pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-zinc-950 mr-2" />
              <div className="w-10 h-1 bg-zinc-800 rounded-full" />
            </div>
          )}

          {/* Ambient Studio Hero Lighting Glow (vibrant, modern studio depth) */}
          <div
            data-canvas-surface="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
              background:
                'radial-gradient(ellipse 700px 380px at 50% 26%, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.08), transparent 72%)',
            }}
          />

          {/* Subtle grid on canvas surface if enabled */}
          {showGrid && (
            <div
              data-canvas-surface="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {/* Render Elements with Auto-Adjusted Responsive Positions */}
          {elementsToRender.map((element) => (
            <CanvasElementComponent
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              canvasWidth={displayWidth}
              canvasHeight={displayHeight}
            />
          ))}

          {/* Dynamic Magnetic Smart Alignment Guides (Figma & Canva standard) */}
          {guides.x !== null && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40 flex flex-col items-center"
              style={{ left: `${guides.x}px` }}
            >
              <div className="w-[1.5px] h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
              {guides.labelX && (
                <div className="absolute top-3 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-mono font-medium text-white shadow-xl pointer-events-none whitespace-nowrap border border-indigo-400/50 backdrop-blur-sm -translate-x-1/2">
                  {guides.labelX} • {guides.x}px
                </div>
              )}
            </div>
          )}

          {guides.y !== null && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-40 flex items-center"
              style={{ top: `${guides.y}px` }}
            >
              <div className="h-[1.5px] w-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
              {guides.labelY && (
                <div className="absolute left-4 -top-6 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-mono font-medium text-white shadow-xl pointer-events-none whitespace-nowrap border border-indigo-400/50 backdrop-blur-sm">
                  {guides.labelY} • {guides.y}px
                </div>
              )}
            </div>
          )}

          {/* Welcoming Empty State Starter Hub (Active & Engaging) */}
          {activePage.elements.length === 0 && (
            <div
              data-canvas-surface="true"
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none"
            >
              <div className="max-w-xl w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm animate-scale-in">
                {/* Header */}
                <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 mb-1">
                  Start Designing Your Page
                </h3>
                <p className="text-xs text-zinc-400 mb-5">
                  Pick a curated section to drop in instantly, browse the library, or drag elements from the left panel.
                </p>

                {/* 1-Click Starter Section Cards */}
                <div className="grid grid-cols-3 gap-2.5 text-left mb-4">
                  <button
                    type="button"
                    onClick={() => addElements(createHeroSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-indigo-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>SaaS Hero (Centered)</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">Headline & dual CTAs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElements(createHeroSplitSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-sky-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-sky-400">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Split Hero with UI Mockup</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">Text + Media preview</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElements(createNavbarSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-purple-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-purple-400">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      <span>Floating Glass Navbar</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">Brand & navigation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElements(createFeatureGridSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-emerald-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3-Column Benefit Cards</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">3 glass highlight cards</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElements(createPricingSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-amber-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-amber-400">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>3-Tier Pricing Table</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">3 tiered pricing plans</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => addElements(createSignUpSection(), true)}
                    className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:border-cyan-500 hover:bg-zinc-800/80 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 group-hover:text-cyan-400">
                      <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sign-Up & Lead Card</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">Database-ready auth card</div>
                  </button>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addElement('section')}
                      className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Blank Section</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('studio:open-templates'))}
                      className="px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Browse All 9 Templates</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetToDefaultDemo}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>Load Demo Website</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Right-Click Pro Context Menu */}
    {contextMenu && (
      <CanvasContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        targetElementId={contextMenu.targetElementId}
        onClose={() => setContextMenu(null)}
      />
    )}
  </main>
  );
};
