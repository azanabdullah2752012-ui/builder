import React, { useState, useEffect, useMemo } from 'react';
import type { ProjectState, Page, CanvasElement } from '../../types/editor';
import { databaseService } from '../../services/databaseService';
import { computeResponsiveLayout } from '../../utils/responsiveLayout';
import { getComputedButtonStyles, renderButtonIcon } from '../../utils/buttonStyles';
import { SHAPE_DEFINITIONS, getShapeSvgNode } from '../../utils/shapeDefinitions';
import { executeElementAction } from '../../utils/actionExecutor';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import {
  AccordionWidget,
  CarouselWidget,
  VideoWidget,
  CounterWidget,
  PollWidget,
  GuestbookWidget,
  ReactionWidget,
  CountdownWidget,
  AudioWidget,
  BeforeAfterWidget,
  TestimonialWidget,
} from '../Widgets/InteractiveWidgets';
import { ProductCardWidget } from '../Widgets/ProductCardWidget';
import { CartDrawer } from '../Widgets/CartDrawer';
import { LottieWidget } from '../Widgets/LottieWidget';
import { ReadingProgressBar } from '../Widgets/ReadingProgressBar';

interface LivePublicViewProps {
  slugOrId: string;
  onEditInStudio?: () => void;
}

export const LivePublicView: React.FC<LivePublicViewProps> = ({ slugOrId, onEditInStudio }) => {
  const [project, setProject] = useState<ProjectState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [activeModal, setActiveModal] = useState<{ title: string; body: string } | null>(null);
  const [hiddenElementIds, setHiddenElementIds] = useState<Set<string>>(new Set());
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [scrolledIntoViewIds, setScrolledIntoViewIds] = useState<Set<string>>(new Set());

  // Resize listener for live responsive breakpoint updates
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll IntersectionObserver for live public visitor animations
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-element-id');
            if (id) {
              setScrolledIntoViewIds((prev) => new Set(prev).add(id));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    const targets = document.querySelectorAll('[data-live-motion-scroll="true"]');
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  });

  // Determine current active viewport mode based on physical window width
  const currentViewportMode = useMemo(() => {
    if (windowWidth < 640) return 'mobile';
    if (windowWidth < 1024) return 'tablet';
    return 'desktop';
  }, [windowWidth]);

  // Load project by slug or ID
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    databaseService
      .getProject(slugOrId)
      .then((proj) => {
        if (!isMounted) return;
        if (proj) {
          setProject(proj);
          setActivePageId(proj.activePageId || proj.pages[0]?.id || '');
          if (proj.publishConfig?.seoTitle) {
            document.title = proj.publishConfig.seoTitle;
          } else if (proj.name) {
            document.title = proj.name;
          }
        } else {
          setError('This website could not be found or has been set to private by the author.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading live website');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slugOrId]);

  const activePage: Page | null = useMemo(() => {
    if (!project || !project.pages || project.pages.length === 0) return null;
    return project.pages.find((p) => p.id === activePageId) || project.pages[0];
  }, [project, activePageId]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute responsive layout dynamically matched to device screen width
  const responsiveLayout = useMemo(() => {
    if (!activePage) return { elements: [], canvasWidth: 1200, canvasHeight: 800 };
    return computeResponsiveLayout(
      activePage.elements,
      currentViewportMode,
      activePage.canvasWidth || 1200,
      activePage.canvasHeight || 800,
      windowWidth > 0 && windowWidth < 1200 ? windowWidth : undefined
    );
  }, [activePage, currentViewportMode, windowWidth]);

  // Handle element clicks
  const handleElementClick = (element: CanvasElement, e: React.MouseEvent) => {
    if (!project || !activePage) return;
    executeElementAction(
      element,
      {
        project,
        activePage,
        setActivePage: (pageId: string) => setActivePageId(pageId),
        showToast,
        setHiddenElementIds,
        setActiveModal,
      },
      e
    );
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#090b10] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 p-0.5 animate-spin">
          <div className="w-full h-full bg-[#090b10] rounded-[14px]" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-semibold tracking-wide">Loading Live Website...</h2>
          <p className="text-xs text-zinc-500 mt-1 font-mono">{slugOrId}</p>
        </div>
      </div>
    );
  }

  // Error / Not Found Screen
  if (error || !project || !activePage) {
    return (
      <div className="w-full min-h-screen bg-[#090b10] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4">
          🌐
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Website Not Found</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          {error || 'This page does not exist or has been taken offline.'}
        </p>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 inline-flex items-center gap-2"
        >
          <span>Return to Pickle Studio</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Render element
  const renderElement = (element: CanvasElement) => {
    const s = element.styles || {};
    const beh = element.behavior || { actionType: 'none' };
    const h = beh.hoverStyles;
    const isHovered = hoveredElementId === element.id;

    const bpSetting = element.responsive?.[currentViewportMode];
    if (bpSetting?.mode === 'hide' || bpSetting?.visible === false || hiddenElementIds.has(element.id)) {
      return null;
    }

    const isBtn = element.type === 'button' || element.role === 'button';
    const btnStyles = isBtn ? getComputedButtonStyles(beh, s) : undefined;

    const computedStyles: React.CSSProperties = {
      position: s.isSticky ? 'sticky' : 'absolute',
      left: `${element.x}px`,
      top: s.isSticky ? `${s.stickyTop ?? 0}px` : `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      zIndex: s.isSticky ? 40 : (element.zIndex || (element.type === 'section' ? 0 : 1)),
      background:
        element.type === 'shape'
          ? 'transparent'
          : (isHovered && h?.backgroundColor) ||
            s.gradient ||
            s.backgroundColor ||
            (isBtn ? btnStyles?.background : undefined) ||
            'transparent',
      color:
        (isHovered && h?.color) ||
        s.color ||
        (isBtn ? btnStyles?.color : undefined) ||
        'inherit',
      fontSize: `${s.fontSize || (isBtn ? btnStyles?.fontSize : 16)}px`,
      fontFamily: s.fontFamily || 'Inter, sans-serif',
      fontWeight: s.fontWeight || (isBtn ? btnStyles?.fontWeight : 'normal'),
      fontStyle: s.fontStyle || 'normal',
      textDecoration: s.textDecoration || 'none',
      textAlign: s.textAlign || 'left',
      lineHeight: s.lineHeight || 1.4,
      letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : 'normal',
      borderRadius: `${s.borderRadius || (isBtn ? btnStyles?.borderRadius : 0)}px`,
      borderColor: (isHovered && h?.borderColor) || s.borderColor || (isBtn ? btnStyles?.borderColor : undefined),
      borderWidth: s.borderWidth ? `${s.borderWidth}px` : (isBtn ? btnStyles?.borderWidth : undefined),
      borderStyle: s.borderStyle || (isBtn ? btnStyles?.borderStyle : 'none'),
      boxShadow: (isHovered && h?.boxShadow) || s.boxShadow || (isBtn ? btnStyles?.boxShadow : undefined),
      opacity: (() => {
        const animName = s.animationName;
        const hasAnim = animName && animName !== 'none';
        const trigger = s.animationTrigger || 'entrance';
        if (hasAnim && trigger === 'scroll' && !scrolledIntoViewIds.has(element.id)) {
          return 0;
        }
        const baseOpacity = s.opacity !== undefined ? (s.opacity > 1 ? s.opacity / 100 : s.opacity) : 1;
        return isHovered && h?.opacity !== undefined ? (h.opacity > 1 ? h.opacity / 100 : h.opacity) : baseOpacity;
      })(),
      backdropFilter: s.backdropFilter,
      WebkitBackdropFilter: s.backdropFilter,
      transform: [
        isHovered && h?.scale ? `scale(${h.scale})` : '',
        isHovered && s.hoverTranslateY !== undefined ? `translateY(${s.hoverTranslateY}px)` : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
      animation: (() => {
        const animName = s.animationName;
        if (!animName || animName === 'none') return undefined;
        const trigger = s.animationTrigger || 'entrance';
        if (trigger === 'scroll' && !scrolledIntoViewIds.has(element.id)) return undefined;
        if (trigger === 'hover' && !isHovered) return undefined;
        const duration = s.animationDuration || 0.7;
        const timing = s.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
        const delay = s.animationDelay || 0;
        const iteration = s.animationIterationCount || '1';
        return `${animName} ${duration}s ${timing} ${delay}s ${iteration} both`;
      })(),
      transition: `all ${s.transitionDuration || 200}ms ease`,
      cursor: beh.actionType !== 'none' || isBtn ? 'pointer' : 'default',
      userSelect: 'none',
    };

    const animName = s.animationName;
    const hasAnim = animName && animName !== 'none';
    const isScroll = (s.animationTrigger || 'entrance') === 'scroll';

    if (element.type === 'shape') {
      const shapeKind = s.shapeKind || 'circle';
      const def = SHAPE_DEFINITIONS[shapeKind] || SHAPE_DEFINITIONS.circle;
      const gradId = `live-grad-${element.id}`;

      let gradColors: [string, string] | null = null;
      if (s.gradient) {
        const hexMatches = s.gradient.match(/#(?:[0-9a-fA-F]{3}){1,2}/g);
        if (hexMatches && hexMatches.length >= 2) {
          gradColors = [hexMatches[0], hexMatches[1]];
        } else {
          const rgbMatches = s.gradient.match(/rgba?\([^)]+\)/g);
          if (rgbMatches && rgbMatches.length >= 2) {
            gradColors = [rgbMatches[0], rgbMatches[1]];
          }
        }
      }

      const fillColor = gradColors ? `url(#${gradId})` : (s.backgroundColor || def.defaultColor);
      const strokeColor = s.borderColor || 'none';
      const strokeW = s.borderWidth || 0;
      const svgNode = getShapeSvgNode(shapeKind, fillColor, strokeColor, strokeW);

      return (
        <div
          key={element.id}
          id={element.id}
          data-element-id={element.id}
          data-live-motion-scroll={hasAnim && isScroll ? 'true' : undefined}
          style={computedStyles}
          onClick={(e) => handleElementClick(element, e)}
          onMouseEnter={() => setHoveredElementId(element.id)}
          onMouseLeave={() => setHoveredElementId(null)}
          className="outline-none"
        >
          <svg
            viewBox={def.viewBox}
            className="w-full h-full drop-shadow-sm select-none"
            preserveAspectRatio="none"
            style={{
              filter: s.boxShadow ? `drop-shadow(${s.boxShadow})` : undefined,
              transform: s.rotation ? `rotate(${s.rotation}deg)` : undefined,
            }}
          >
            {gradColors && (
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={gradColors[0]} />
                  <stop offset="100%" stopColor={gradColors[1]} />
                </linearGradient>
              </defs>
            )}
            {svgNode.tag === 'circle' && <circle {...svgNode.props} />}
            {svgNode.tag === 'rect' && <rect {...svgNode.props} />}
            {svgNode.tag === 'polygon' && <polygon {...svgNode.props} />}
            {svgNode.tag === 'path' && <path {...svgNode.props} />}
          </svg>
        </div>
      );
    }

    return (
      <div
        key={element.id}
        id={element.id}
        data-element-id={element.id}
        data-live-motion-scroll={hasAnim && isScroll ? 'true' : undefined}
        style={computedStyles}
        onClick={(e) => handleElementClick(element, e)}
        onMouseEnter={() => setHoveredElementId(element.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        className="outline-none"
      >
        {element.type === 'image' ? (
          <img
            src={element.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
            alt={element.name || 'Image'}
            className="w-full h-full object-cover rounded-[inherit] pointer-events-none"
            loading="lazy"
          />
        ) : isBtn ? (
          <div className="w-full h-full flex items-center justify-center gap-2 px-4 select-none">
            {beh.buttonIcon && beh.buttonIconPosition !== 'right' && renderButtonIcon(beh.buttonIcon)}
            <span>{element.content || 'Button'}</span>
            {beh.buttonIcon && beh.buttonIconPosition === 'right' && renderButtonIcon(beh.buttonIcon)}
          </div>
        ) : element.type === 'input' ? (
          <input
            id={`input-${element.id}`}
            data-field-id={element.id}
            type={
              element.formConfig?.inputType ||
              (element.name.toLowerCase().includes('email')
                ? 'email'
                : element.name.toLowerCase().includes('password')
                ? 'password'
                : 'text')
            }
            placeholder={element.formConfig?.placeholder || element.content || `Enter ${element.name || 'text'}...`}
            defaultValue=""
            required={element.formConfig?.required}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 px-3 cursor-text"
            onClick={(e) => e.stopPropagation()}
          />
        ) : element.type === 'textarea' ? (
          <textarea
            id={`input-${element.id}`}
            data-field-id={element.id}
            placeholder={element.formConfig?.placeholder || element.content || `Enter ${element.name || 'message'}...`}
            defaultValue=""
            required={element.formConfig?.required}
            rows={3}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 p-3 resize-none cursor-text"
            onClick={(e) => e.stopPropagation()}
          />
        ) : element.type === 'select' ? (
          <select
            id={`input-${element.id}`}
            data-field-id={element.id}
            required={element.formConfig?.required}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit px-3 cursor-pointer"
            style={{ backgroundColor: element.styles?.backgroundColor || '#131620' }}
            onClick={(e) => e.stopPropagation()}
          >
            {(element.formConfig?.options || ['Option 1', 'Option 2', 'Option 3']).map((opt, i) => (
              <option key={i} value={opt} className="bg-zinc-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        ) : element.type === 'checkbox' ? (
          <label className="w-full h-full flex items-center gap-2.5 px-2 select-none cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              id={`input-${element.id}`}
              data-field-id={element.id}
              type="checkbox"
              defaultChecked={element.formConfig?.checked}
              className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="truncate">{element.content || 'I agree'}</span>
          </label>
        ) : element.type === 'accordion' ? (
          <AccordionWidget element={element} isInteractive={true} />
        ) : element.type === 'carousel' ? (
          <CarouselWidget element={element} isInteractive={true} />
        ) : element.type === 'video' ? (
          <VideoWidget element={element} isInteractive={true} />
        ) : element.type === 'counter' ? (
          <CounterWidget element={element} isInteractive={true} />
        ) : element.type === 'product-card' ? (
          <ProductCardWidget element={element} isInteractive={true} />
        ) : element.type === 'lottie' ? (
          <LottieWidget element={element} isInteractive={true} />
        ) : element.type === 'poll' ? (
          <PollWidget element={element} isInteractive={true} />
        ) : element.type === 'guestbook' ? (
          <GuestbookWidget element={element} isInteractive={true} />
        ) : element.type === 'reaction' ? (
          <ReactionWidget element={element} isInteractive={true} />
        ) : element.type === 'countdown' ? (
          <CountdownWidget element={element} isInteractive={true} />
        ) : element.type === 'audio' ? (
          <AudioWidget element={element} isInteractive={true} />
        ) : element.type === 'before-after' ? (
          <BeforeAfterWidget element={element} isInteractive={true} />
        ) : element.type === 'testimonial' ? (
          <TestimonialWidget element={element} isInteractive={true} />
        ) : (element.role === 'input' || (element.type === 'container' && element.name.toLowerCase().includes('input'))) ? (
          <input
            id={`input-${element.id}`}
            data-field-id={element.id}
            type={
              element.formConfig?.inputType ||
              (element.name.toLowerCase().includes('email') ? 'email' : 'text')
            }
            placeholder={element.formConfig?.placeholder || element.content || `Enter ${element.name}...`}
            defaultValue=""
            className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 px-3 cursor-text"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full h-full overflow-hidden p-1 break-words">
            {element.content}
          </div>
        )}
      </div>
    );
  };

  const canvasWidth = responsiveLayout.canvasWidth;
  const canvasHeight = Math.max(responsiveLayout.canvasHeight, 800);

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden relative flex flex-col items-center"
      style={{
        backgroundColor: activePage.backgroundColor || '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Scroll-Linked Reading Progress Bar */}
      {activePage.showScrollProgress && (
        <ReadingProgressBar color={activePage.scrollProgressColor} />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white border border-indigo-500/40 shadow-2xl backdrop-blur-md text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Artboard Canvas Presentation */}
      <main
        className="relative overflow-visible mx-auto w-full"
        style={{
          width: '100%',
          maxWidth: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`,
        }}
      >
        {responsiveLayout.elements.map(renderElement)}
      </main>

      {/* Interactive Modal Dialog Overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            backgroundColor: 'rgba(4, 6, 11, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full space-y-4 text-white animate-scale-in"
            style={{
              backgroundColor: '#0d1017',
              border: '1px solid #202738',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.06)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{activeModal.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{activeModal.body}</p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Floating Footer Badge & Editor Jump */}
      <footer className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {onEditInStudio && (
          <button
            type="button"
            onClick={onEditInStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white font-semibold text-xs shadow-xl backdrop-blur-md transition-all hover:scale-105"
          >
            <span>⚡ Edit in Studio</span>
          </button>
        )}

        {!project.publishConfig?.removeBranding && (
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 hover:bg-slate-900 text-zinc-300 hover:text-white border border-slate-700/60 font-medium text-[11px] shadow-xl backdrop-blur-md transition-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Built with <strong>Pickle Studio</strong> by <strong>Pickle Corp™</strong></span>
          </a>
        )}
      </footer>

      {/* Interactive E-Commerce Cart Drawer */}
      <CartDrawer />
    </div>
  );
};
