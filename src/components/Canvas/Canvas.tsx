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
import { KID_STARTER_SITES, KID_LEGO_BLOCKS } from '../../constants/kidTemplates';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import { CanvasContextMenu } from './CanvasContextMenu';
import { CanvasFloatingControls } from './CanvasFloatingControls';
import { CanvasRulers } from './CanvasRulers';
import { FigmaDistanceOverlay } from './FigmaDistanceOverlay';
import { SmartGuidesOverlay } from './SmartGuidesOverlay';
import type { ShapeKind, SmartSnapLine, EqualSpacingIndicator } from '../../types/editor';

export const Canvas: React.FC = () => {
  const {
    activePage,
    selectedElementId,
    selectedElement,
    selectedElementIds,
    selectElement,
    selectElements,
    zoom,
    setZoom,
    showGrid,
    showRulers,
    userGuides,
    addUserGuide,
    updateUserGuide,
    removeUserGuide,
    viewportMode,
    addElement,
    addElements,
    insertCustomImage,
    insertShape,
    insertEmoji,
    showToast,
    resetToDefaultDemo,
    editorComplexity,
    setEditorComplexity,
    updatePageSettings,
  } = useEditor();

  const canvasRef = useRef<HTMLDivElement>(null);
  const pageSurfaceRef = useRef<HTMLDivElement>(null);

  const [marqueeBox, setMarqueeBox] = React.useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [smartGuides, setSmartGuides] = React.useState<{
    snapLines: SmartSnapLine[];
    equalSpacings: EqualSpacingIndicator[];
  }>({ snapLines: [], equalSpacings: [] });

  useEffect(() => {
    const handleGuides = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) {
        setSmartGuides({ snapLines: [], equalSpacings: [] });
        return;
      }
      setSmartGuides({
        snapLines: detail.snapLines || [],
        equalSpacings: detail.equalSpacings || [],
      });
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
      selectElements([]);
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

  // Handle Marquee Drag Selection on Canvas Surface
  const handleSurfaceMouseDown = useCallback((e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    // Ensure user clicked on the canvas surface, background, or artboard wrapper, not on interactive element
    if (target.closest('[data-element-id]')) return;

    if (contextMenu) setContextMenu(null);

    const surface = pageSurfaceRef.current;
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    const startX = (e.clientX - rect.left) / zoom;
    const startY = (e.clientY - rect.top) / zoom;

    let hasDragged = false;
    const initialSelected = (e.shiftKey || e.metaKey) ? [...selectedElementIds] : [];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const curX = (moveEvent.clientX - rect.left) / zoom;
      const curY = (moveEvent.clientY - rect.top) / zoom;
      const dist = Math.hypot(curX - startX, curY - startY);

      if (dist > 4) {
        hasDragged = true;
        setMarqueeBox({ startX, startY, currentX: curX, currentY: curY });

        const minX = Math.min(startX, curX);
        const maxX = Math.max(startX, curX);
        const minY = Math.min(startY, curY);
        const maxY = Math.max(startY, curY);

        const intersecting = elementsToRender.filter((el) => {
          return (
            el.x < maxX &&
            el.x + el.width > minX &&
            el.y < maxY &&
            el.y + el.height > minY
          );
        });

        const newIds = intersecting.map((el) => el.id);
        const merged = Array.from(new Set([...initialSelected, ...newIds]));
        selectElements(merged);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setMarqueeBox(null);
      if (!hasDragged && !e.shiftKey && !e.metaKey) {
        selectElements([]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [contextMenu, zoom, selectedElementIds, elementsToRender, selectElements]);

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
      onMouseDown={handleSurfaceMouseDown}
      onContextMenu={handleContextMenu}
      className="flex-1 bg-[#0c0c0e] overflow-auto relative flex flex-col items-center justify-start p-8 pb-24 select-none"
      style={{
        backgroundImage: showGrid
          ? 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)'
          : 'none',
        backgroundSize: '24px 24px',
      }}
    >

      {/* Scaled Canvas Container Wrapper with Rulers and Guides */}
      <div
        style={{
          width: `${displayWidth * zoom + (showRulers ? 20 : 0)}px`,
          minHeight: `${displayHeight * zoom + (showRulers ? 20 : 0) + 32}px`,
          transition: 'width 0.12s ease-out, height 0.12s ease-out',
        }}
        className="relative my-auto shrink-0 flex flex-col z-10"
      >
        {/* Artboard Header Badge */}
        <div className="text-[11px] text-zinc-400 font-mono font-medium mb-2.5 pl-0.5 select-none flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="font-sans font-semibold text-zinc-300 tracking-tight">Artboard</span>
            <span className="text-zinc-600 font-normal">/</span>
            <span className="text-zinc-300 font-sans">{activePage.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-500 font-mono">
              {viewportMode === 'mobile' ? 'Mobile (iPhone 15 Pro • 390×844)' : viewportMode === 'tablet' ? 'Tablet (iPad • 768×1024)' : `Desktop (${displayWidth}×${displayHeight})`}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">• Shift+R: Rulers • Alt: Distances</span>
          </div>
        </div>

        <CanvasRulers
          canvasWidth={displayWidth}
          canvasHeight={displayHeight}
          zoom={zoom}
          showRulers={showRulers}
          userGuides={userGuides}
          onAddGuide={addUserGuide}
          onUpdateGuide={updateUserGuide}
          onRemoveGuide={removeUserGuide}
        >
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
              onMouseDown={handleSurfaceMouseDown}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                width: `${displayWidth}px`,
                minHeight: `${displayHeight}px`,
                backgroundColor: activePage.backgroundColor || '#ffffff',
                boxShadow:
                  viewportMode === 'mobile'
                    ? '0 30px 80px -15px rgba(0, 0, 0, 0.9), 0 0 0 10px #18181b, 0 0 0 12px #27272a, 0 0 0 13px #09090b'
                    : viewportMode === 'tablet'
                    ? '0 25px 70px -15px rgba(0, 0, 0, 0.8), 0 0 0 10px #18181b, 0 0 0 11px #27272a'
                    : '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className={`relative overflow-hidden ${viewportMode === 'mobile' ? 'rounded-[44px]' : viewportMode === 'tablet' ? 'rounded-2xl' : 'rounded-xl'}`}
            >
              {/* Dynamic Island pill simulation when in phone mode */}
              {viewportMode === 'mobile' && (
                <>
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
                    <div className="w-2 h-2 rounded-full bg-indigo-950/60" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-zinc-400/30 rounded-full z-40 pointer-events-none" />
                </>
              )}

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
                  isSelected={selectedElementIds.includes(element.id)}
                  canvasWidth={displayWidth}
                  canvasHeight={displayHeight}
                />
              ))}

              {/* Marquee Selection Box Overlay */}
              {marqueeBox && (
                <div
                  className="absolute pointer-events-none rounded border border-indigo-400 bg-indigo-500/15 backdrop-blur-[0.5px] shadow-[0_0_12px_rgba(99,102,241,0.35)] z-50 transition-none"
                  style={{
                    left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}px`,
                    top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}px`,
                    width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}px`,
                    height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}px`,
                  }}
                />
              )}

              {/* Dynamic Magnetic Smart Alignment Guides & Equal Spacing (Figma & Canva standard) */}
              <SmartGuidesOverlay
                snapLines={smartGuides.snapLines}
                equalSpacings={smartGuides.equalSpacings}
              />

              {/* Figma Alt / Option Distance Inspector */}
              <FigmaDistanceOverlay
                selectedElement={selectedElement}
                allElements={activePage.elements}
                canvasWidth={displayWidth}
                canvasHeight={displayHeight}
                zoom={zoom}
              />

          {/* Welcoming Empty State Starter Hub (Active & Engaging) */}
          {activePage.elements.length === 0 && (
            <div
              data-canvas-surface="true"
              className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none"
            >
              {editorComplexity === 'simple' ? (
                <div className="max-w-xl w-full bg-[#12141c]/95 border border-[#262c3f] rounded-3xl p-8 shadow-2xl backdrop-blur-md animate-scale-in">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl">
                    🥒
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 tracking-tight">
                    Welcome to Pickle Studio!
                  </h3>
                  <p className="text-xs text-zinc-400 mb-6 max-w-md mx-auto">
                    Pick a 100% complete, beautiful starter site below, or choose one from the Simple Maker on the left:
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-left mb-6">
                    {KID_STARTER_SITES.map((site) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => {
                          playSound('pop');
                          triggerConfetti();
                          const els = site.createElements();
                          updatePageSettings(activePage.id, {
                            backgroundColor: site.id === 'site-lemonade' ? '#1c1917' : site.id === 'site-science' ? '#0c1222' : site.id === 'site-pet' ? '#111827' : '#0d1117',
                          });
                          addElements(els, true, true);
                          showToast(`Loaded ${site.title}! 🎉`, 'success');
                        }}
                        className="p-3.5 rounded-2xl border border-zinc-800 bg-[#161928] hover:border-emerald-500 hover:scale-[1.02] transition-all flex items-start gap-3 cursor-pointer group shadow-sm text-left"
                      >
                        <span className="text-3xl shrink-0">{site.emoji}</span>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {site.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {site.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('pop');
                        const block = KID_LEGO_BLOCKS[0];
                        const els = block.create(60);
                        addElements(els);
                        showToast('Added Big Friendly Banner! 🏷️', 'success');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>+ Start with Big Banner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorComplexity('pro')}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-all cursor-pointer"
                    >
                      Switch to Pro Mode 🛠️
                    </button>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          )}
        </div>
        </div>
        </CanvasRulers>
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

    {/* Floating Ergonomic Canvas Controls (Zoom, Grid, Rulers, Snapping, Undo/Redo) */}
    <CanvasFloatingControls />
  </main>
  );
};
