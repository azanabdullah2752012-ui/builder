import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/useEditor';
import type { CanvasElement } from '../../types/editor';
import { computeResponsiveLayout } from '../../utils/responsiveLayout';
import {
  ArrowLeft,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Layers,
  ChevronDown,
  X,
} from 'lucide-react';

export const PreviewView: React.FC = () => {
  const {
    project,
    activePage,
    setActivePage,
    setEditorMode,
    viewportMode,
    setViewportMode,
    showToast,
  } = useEditor();

  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ title: string; body: string } | null>(null);
  const [hiddenElementIds, setHiddenElementIds] = useState<Set<string>>(new Set());

  // Compute responsive layout for the preview viewport
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

  const handleElementClick = (element: CanvasElement, e: React.MouseEvent) => {
    const action = element.behavior.actionType;
    const payload = element.behavior.actionPayload;

    if (action === 'none') {
      return;
    }

    if (action === 'navigate-page' && payload) {
      e.preventDefault();
      const targetPage = project.pages.find((p) => p.id === payload);
      if (targetPage) {
        setActivePage(targetPage.id);
        showToast(`Navigated to ${targetPage.name}`, 'info');
      }
    } else if (action === 'navigate-url' && payload) {
      window.open(payload, element.behavior.targetBlank ? '_blank' : '_self', 'noopener,noreferrer');
    } else if (action === 'scroll-section') {
      e.preventDefault();
      const targetId = (payload || '').replace(/^#/, '');
      if (targetId) {
        const targetEl =
          document.getElementById(targetId) ||
          document.querySelector(`[data-element-id="${targetId}"]`) ||
          document.querySelector(`.${targetId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          showToast(`Scrolled to section #${targetId}`, 'info');
        } else {
          showToast(`Target section #${targetId} not found on canvas`, 'warning');
        }
      }
    } else if (action === 'scroll-top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
      showToast('Scrolled to top!', 'info');
    } else if (action === 'open-modal') {
      e.preventDefault();
      setActiveModal({
        title: element.behavior.actionModalTitle || 'Notification Dialog',
        body:
          element.behavior.actionModalBody ||
          payload ||
          'This is an interactive dialog triggered by the element action.',
      });
    } else if (action === 'toggle-visibility') {
      e.preventDefault();
      const targetId = element.behavior.actionTargetId || payload;
      if (targetId) {
        setHiddenElementIds((prev) => {
          const next = new Set(prev);
          if (next.has(targetId)) {
            next.delete(targetId);
            showToast(`Element #${targetId} is now visible`, 'info');
          } else {
            next.add(targetId);
            showToast(`Element #${targetId} is now hidden`, 'info');
          }
          return next;
        });
      }
    } else if (action === 'copy-text' && payload) {
      e.preventDefault();
      navigator.clipboard?.writeText(payload);
      showToast(`Copied to clipboard: "${payload}"`, 'success');
    } else if (action === 'alert' && payload) {
      e.preventDefault();
      showToast(payload, 'success');
    } else if (action === 'email-mailto' && payload) {
      window.location.href = payload.startsWith('mailto:') ? payload : `mailto:${payload}`;
    } else if (action === 'tel-call' && payload) {
      window.location.href = payload.startsWith('tel:') ? payload : `tel:${payload}`;
    } else if (action === 'download-file' && payload) {
      e.preventDefault();
      showToast(`Downloading: ${payload}`, 'info');
      const a = document.createElement('a');
      a.href = payload;
      a.download = '';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (action === 'custom-js' && payload) {
      e.preventDefault();
      try {
        const fn = new Function('element', 'toast', payload);
        fn(element, showToast);
      } catch (err: any) {
        showToast(`Custom JS Error: ${err.message}`, 'warning');
      }
    }
  };

  // Render individual semantic element in preview
  const renderPreviewElement = (element: CanvasElement) => {
    const s = element.styles;
    const h = element.behavior.hoverStyles;
    const isHovered = hoveredElementId === element.id;

    const l = element.layout;
    const bpSetting = element.responsive?.[viewportMode];
    if (bpSetting?.mode === 'hide' || bpSetting?.visible === false || hiddenElementIds.has(element.id)) {
      return null;
    }

    const effectiveDirection =
      bpSetting?.direction ||
      l?.responsiveDirection?.[viewportMode] ||
      l?.direction ||
      'column';

    // Apply base styles and active hover styles if hovered
    const computedStyles: React.CSSProperties = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      zIndex: element.zIndex || (element.type === 'section' ? 0 : 1),
      background: (isHovered && h?.backgroundColor) || s.gradient || s.backgroundColor || 'transparent',
      color: (isHovered && h?.color) || s.color || 'inherit',
      fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
      fontWeight: s.fontWeight || undefined,
      fontFamily: s.fontFamily || undefined,
      textAlign: s.textAlign || 'left',
      lineHeight: s.lineHeight || undefined,
      borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
      borderWidth: s.borderWidth !== undefined ? `${s.borderWidth}px` : undefined,
      borderStyle: s.borderStyle || 'none',
      borderColor: (isHovered && h?.borderColor) || (isHovered && s.hoverEffect === 'glow' ? '#818cf8' : s.borderColor || 'transparent'),
      boxShadow:
        (isHovered && h?.boxShadow) ||
        (isHovered && s.hoverShadow) ||
        (isHovered && s.hoverEffect === 'lift' ? '0 16px 32px -4px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,0,0,0.3)' : undefined) ||
        (isHovered && s.hoverEffect === 'glow' ? '0 0 25px rgba(99, 102, 241, 0.65)' : undefined) ||
        s.boxShadow ||
        undefined,
      opacity: isHovered && h?.opacity !== undefined ? h.opacity : s.opacity !== undefined ? s.opacity : 1,
      transform: (() => {
        if (!isHovered) return undefined;
        const scale = h?.scale || s.hoverScale || (s.hoverEffect === 'scale' ? 1.04 : undefined);
        const translateY = s.hoverTranslateY !== undefined ? s.hoverTranslateY : (s.hoverEffect === 'lift' ? -4 : undefined);
        const parts: string[] = [];
        if (translateY !== undefined && translateY !== 0) parts.push(`translateY(${translateY}px)`);
        if (scale !== undefined && scale !== 1) parts.push(`scale(${scale})`);
        return parts.length > 0 ? parts.join(' ') : undefined;
      })(),
      filter: isHovered && s.hoverEffect === 'brighten' ? 'brightness(1.15)' : undefined,
      cursor:
        element.role === 'button' ||
        element.role === 'link' ||
        element.behavior.actionType !== 'none'
          ? 'pointer'
          : 'default',
      transition: s.transitionDuration
        ? `all ${s.transitionDuration}ms ${s.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)'}`
        : 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: effectiveDirection,
      justifyContent:
        element.type === 'button' || element.role === 'button'
          ? 'center'
          : l?.justify === 'center'
          ? 'center'
          : l?.justify === 'end'
          ? 'flex-end'
          : l?.justify === 'space-between'
          ? 'space-between'
          : l?.justify === 'space-around'
          ? 'space-around'
          : s.textAlign === 'center'
          ? 'center'
          : 'flex-start',
      alignItems:
        element.type === 'button' || element.role === 'button'
          ? 'center'
          : l?.align === 'center'
          ? 'center'
          : l?.align === 'end'
          ? 'flex-end'
          : s.textAlign === 'center'
          ? 'center'
          : s.textAlign === 'right'
          ? 'flex-end'
          : 'flex-start',
      padding: l?.padding
        ? `${l.padding.top}px ${l.padding.right}px ${l.padding.bottom}px ${l.padding.left}px`
        : undefined,
      gap: l?.gap !== undefined ? `${l.gap}px` : undefined,
      overflow: 'hidden',
      textDecoration: element.role === 'link' ? 'none' : undefined,
    };

    const commonProps = {
      key: element.id,
      style: computedStyles,
      onMouseEnter: () => setHoveredElementId(element.id),
      onMouseLeave: () => setHoveredElementId(null),
      onClick: (e: React.MouseEvent) => handleElementClick(element, e),
      id: element.id,
      'data-element-id': element.id,
      'data-role': element.role,
    };

    if (element.type === 'section') {
      return (
        <section {...commonProps}>
          {element.content && <div className="p-2 select-none">{element.content}</div>}
        </section>
      );
    }

    // Render using true semantic role tags
    switch (element.role) {
      case 'heading-h1':
        return (
          <h1 {...commonProps}>
            <span className="w-full select-none p-1 block leading-tight">{element.content || 'Heading 1'}</span>
          </h1>
        );

      case 'heading-h2':
        return (
          <h2 {...commonProps}>
            <span className="w-full select-none p-1 block leading-tight">{element.content || 'Heading 2'}</span>
          </h2>
        );

      case 'heading-h3':
        return (
          <h3 {...commonProps}>
            <span className="w-full select-none p-1 block leading-tight">{element.content || 'Heading 3'}</span>
          </h3>
        );

      case 'blockquote':
        return (
          <blockquote {...commonProps}>
            <span className="w-full italic select-none p-2 block border-l-2 border-indigo-500 pl-3">
              {element.content || '“Quotation text...”'}
            </span>
          </blockquote>
        );

      case 'badge':
        return (
          <span {...commonProps} role="status">
            <span className="select-none px-2.5 py-0.5 inline-block text-center font-medium">
              {element.content || 'Badge'}
            </span>
          </span>
        );

      case 'header':
        return (
          <header {...commonProps} role="banner">
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </header>
        );

      case 'footer':
        return (
          <footer {...commonProps} role="contentinfo">
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </footer>
        );

      case 'main':
        return (
          <main {...commonProps} role="main">
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </main>
        );

      case 'aside':
        return (
          <aside {...commonProps} role="complementary">
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </aside>
        );

      case 'form':
        return (
          <form {...commonProps} onSubmit={(e) => e.preventDefault()}>
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </form>
        );

      case 'dialog':
        return (
          <div {...commonProps} role="dialog" aria-modal="true">
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </div>
        );

      case 'button':
        return (
          <button {...commonProps} type="button" role="button">
            <span className="w-full text-center select-none">{element.content || 'Button'}</span>
          </button>
        );

      case 'link':
        return (
          <a
            {...commonProps}
            href={
              element.behavior.actionType === 'navigate-url'
                ? element.behavior.actionPayload || '#'
                : '#'
            }
            target={element.behavior.targetBlank ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            <span className="w-full select-none">{element.content || 'Link'}</span>
          </a>
        );

      case 'image':
        return (
          <div {...commonProps}>
            <img
              src={
                element.content ||
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
              }
              alt={element.name}
              className="w-full h-full select-none"
              style={{ objectFit: s.objectFit || 'cover' }}
            />
          </div>
        );

      case 'input':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={element.content || 'Enter value...'}
            className="outline-none px-3"
            onChange={() => {}}
          />
        );

      case 'navigation':
        return (
          <nav {...commonProps} role="navigation">
            {element.content && <span className="p-2 select-none">{element.content}</span>}
          </nav>
        );

      case 'card':
        return (
          <article {...commonProps}>
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </article>
        );

      case 'container':
        return (
          <div {...commonProps}>
            {element.content && <div className="p-2 select-none">{element.content}</div>}
          </div>
        );

      case 'text':
      case 'none':
      default:
        if (element.type === 'text') {
          return (
            <div {...commonProps}>
              <span className="whitespace-pre-wrap select-none p-1">
                {element.content || ''}
              </span>
            </div>
          );
        }
        if (element.type === 'divider') {
          return (
            <div {...commonProps}>
              <div
                className="w-full"
                style={{
                  height: `${s.dividerHeight || 2}px`,
                  backgroundColor: s.backgroundColor || '#e2e8f0',
                }}
              />
            </div>
          );
        }
        return (
          <div {...commonProps}>
            {element.content && <div className="select-none p-1">{element.content}</div>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Floating Preview Top Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 text-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditorMode('design')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Design Mode</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Project & Page Title */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">{project.name}</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">{activePage.name}</span>
          </div>

          {/* Page Switcher in Preview */}
          <div className="relative">
            <button
              onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Switch Page</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPageDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-1.5 z-50 text-xs animate-scale-in">
                {project.pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePage(p.id);
                      setIsPageDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${
                      p.id === activePage.id
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-70">{p.slug}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Viewport Width Switcher (Desktop, Laptop, Tablet, Phone) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
              viewportMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop Viewport (1200px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewportMode('laptop')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
              viewportMode === 'laptop'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Laptop Viewport (1024px) - Auto Adjusted"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Laptop</span>
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
              viewportMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet Viewport (768px) - Auto Adjusted"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1.5 ${
              viewportMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Phone Viewport (390px) - Auto Reflow"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Phone</span>
          </button>
        </div>
      </header>

      {/* Main Preview Surface */}
      <main className="flex-1 flex justify-center p-8 overflow-auto bg-slate-950/80">
        <div
          style={{
            width: `${displayWidth}px`,
            minHeight: `${displayHeight}px`,
            backgroundColor: activePage.backgroundColor || '#ffffff',
            boxShadow:
              viewportMode === 'mobile'
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 8px #0f172a, 0 0 0 9px #334155'
                : '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1), min-height 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className={`relative overflow-hidden self-start ${viewportMode === 'mobile' ? 'rounded-3xl' : 'rounded-2xl'}`}
        >
          {/* Phone Top Speaker/Camera notch simulation when in phone mode */}
          {viewportMode === 'mobile' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-40 flex items-center justify-center opacity-80 pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-slate-950 mr-2" />
              <div className="w-10 h-1 bg-slate-800 rounded-full" />
            </div>
          )}

          {elementsToRender.map(renderPreviewElement)}
        </div>
      </main>

      {/* Interactive Modal Dialog triggered by open-modal action */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-zinc-100">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-lg text-white">{activeModal.title}</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
              {activeModal.body}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
