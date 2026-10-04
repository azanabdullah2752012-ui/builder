import React, { useState, useMemo, useEffect } from 'react';
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
import { SHAPE_DEFINITIONS, getShapeSvgNode } from '../../utils/shapeDefinitions';
import { getComputedButtonStyles, renderButtonIcon } from '../../utils/buttonStyles';
import { executeElementAction } from '../../utils/actionExecutor';
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

export const PreviewView: React.FC = () => {
  const {
    project,
    activePage,
    setActivePage,
    setEditorMode,
    viewportMode,
    setViewportMode,
    updatePageSettings,
    showToast,
  } = useEditor();

  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [pressedElementId, setPressedElementId] = useState<string | null>(null);
  const [focusedElementId, setFocusedElementId] = useState<string | null>(null);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<{ title: string; body: string } | null>(null);
  const [hiddenElementIds, setHiddenElementIds] = useState<Set<string>>(new Set());
  const [scrolledIntoViewIds, setScrolledIntoViewIds] = useState<Set<string>>(new Set());

  // Scroll IntersectionObserver for motion animations
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

    const targets = document.querySelectorAll('[data-preview-motion-scroll="true"]');
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  });

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
    executeElementAction(
      element,
      {
        project,
        activePage,
        setActivePage,
        updatePageSettings,
        showToast,
        setHiddenElementIds,
        setActiveModal,
      },
      e
    );
  };

  // Render individual semantic element in preview
  const renderPreviewElement = (element: CanvasElement) => {
    const s = element.styles || {};
    const beh = element.behavior || { actionType: 'none' };
    const h = beh.hoverStyles;
    const act = beh.activeStyles;
    const foc = beh.focusStyles;
    const isHovered = hoveredElementId === element.id;
    const isPressed = pressedElementId === element.id;
    const isFocused = focusedElementId === element.id;

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

    const isBtn = element.type === 'button' || element.role === 'button';
    const btnStyles = isBtn ? getComputedButtonStyles(beh, s) : undefined;

    // Apply base styles and active hover styles if hovered
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
          : (isPressed && act?.backgroundColor) ||
            (isFocused && foc?.backgroundColor) ||
            (isHovered && h?.backgroundColor) ||
            s.gradient ||
            btnStyles?.background ||
            s.backgroundColor ||
            btnStyles?.backgroundColor ||
            'transparent',
      color:
        (isPressed && act?.color) ||
        (isFocused && foc?.color) ||
        (isHovered && h?.color) ||
        s.color ||
        btnStyles?.color ||
        'inherit',
      fontSize: s.fontSize ? `${s.fontSize}px` : btnStyles?.fontSize || undefined,
      fontWeight: s.fontWeight || btnStyles?.fontWeight || undefined,
      fontFamily: s.fontFamily || undefined,
      textAlign: s.textAlign || 'left',
      lineHeight: s.lineHeight || undefined,
      letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
      textTransform: s.textTransform || undefined,
      textDecoration: s.textDecoration || (element.role === 'link' ? 'none' : undefined),
      fontStyle: s.fontStyle || undefined,
      borderRadius: element.type === 'shape' ? undefined : s.borderRadius !== undefined ? `${s.borderRadius}px` : btnStyles?.borderRadius || undefined,
      borderWidth: element.type === 'shape' ? 0 : s.borderWidth !== undefined ? `${s.borderWidth}px` : btnStyles?.borderWidth || undefined,
      borderStyle: element.type === 'shape' ? 'none' : s.borderStyle || btnStyles?.borderStyle || 'none',
      borderColor:
        element.type === 'shape'
          ? 'transparent'
          : (isPressed && act?.borderColor) ||
            (isFocused && (foc?.borderColor || foc?.outlineColor)) ||
            (isHovered && h?.borderColor) ||
            (isHovered && s.hoverEffect === 'glow' ? '#818cf8' : s.borderColor || btnStyles?.borderColor || 'transparent'),
      outline: isFocused && foc?.outlineColor ? `${foc.outlineWidth || 2}px solid ${foc.outlineColor}` : undefined,
      outlineOffset: isFocused ? '2px' : undefined,
      backdropFilter: s.backdropFilter || (btnStyles as any)?.backdropFilter,
      WebkitBackdropFilter: s.backdropFilter || (btnStyles as any)?.WebkitBackdropFilter,
      mixBlendMode: s.mixBlendMode || undefined,
      overflow: s.overflow || undefined,
      boxShadow:
        element.type === 'shape'
          ? undefined
          : (isPressed && act?.boxShadow) ||
            (isFocused && foc?.boxShadow) ||
            (isHovered && h?.boxShadow) ||
            (isHovered && s.hoverShadow) ||
            (isHovered && s.hoverEffect === 'lift' ? '0 16px 32px -4px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,0,0,0.3)' : undefined) ||
            (isHovered && s.hoverEffect === 'glow' ? '0 0 25px rgba(99, 102, 241, 0.65)' : undefined) ||
            s.boxShadow ||
            undefined,
      opacity: (() => {
        const animName = s.animationName;
        const hasAnim = animName && animName !== 'none';
        const trigger = s.animationTrigger || 'entrance';
        if (hasAnim && trigger === 'scroll' && !scrolledIntoViewIds.has(element.id)) {
          return 0;
        }
        return isHovered && h?.opacity !== undefined ? h.opacity : s.opacity !== undefined ? s.opacity : 1;
      })(),
      transform: (() => {
        const parts: string[] = [];
        if (s.rotation !== undefined && s.rotation !== 0) parts.push(`rotate(${s.rotation}deg)`);
        if (s.scale !== undefined && s.scale !== 1 && (!isHovered || !h?.scale) && (!isPressed || !act?.scale)) parts.push(`scale(${s.scale})`);
        if (s.skewX !== undefined && s.skewX !== 0) parts.push(`skewX(${s.skewX}deg)`);
        if (s.skewY !== undefined && s.skewY !== 0) parts.push(`skewY(${s.skewY}deg)`);
        if (isPressed) {
          const scale = act?.scale !== undefined ? act.scale : 0.97;
          const translateY = act?.translateY !== undefined ? act.translateY : 2;
          if (translateY !== 0) parts.push(`translateY(${translateY}px)`);
          if (scale !== 1) parts.push(`scale(${scale})`);
        } else if (isHovered) {
          const scale = h?.scale || s.hoverScale || (s.hoverEffect === 'scale' ? 1.04 : undefined);
          const translateY = h?.translateY !== undefined ? h.translateY : (s.hoverTranslateY !== undefined ? s.hoverTranslateY : (s.hoverEffect === 'lift' ? -4 : undefined));
          if (translateY !== undefined && translateY !== 0) parts.push(`translateY(${translateY}px)`);
          if (scale !== undefined && scale !== 1) parts.push(`scale(${scale})`);
        }
        return parts.length > 0 ? parts.join(' ') : undefined;
      })(),
      filter: [s.filter, isHovered && s.hoverEffect === 'brighten' ? 'brightness(1.15)' : ''].filter(Boolean).join(' ') || undefined,
      cursor:
        s.cursor ||
        (element.role === 'button' ||
        element.role === 'link' ||
        beh.actionType !== 'none'
          ? 'pointer'
          : 'default'),
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
    };

    const commonProps = {
      key: element.id,
      style: computedStyles,
      onMouseEnter: () => setHoveredElementId(element.id),
      onMouseLeave: () => {
        setHoveredElementId(null);
        setPressedElementId(null);
      },
      onMouseDown: () => setPressedElementId(element.id),
      onMouseUp: () => setPressedElementId(null),
      onFocus: () => setFocusedElementId(element.id),
      onBlur: () => setFocusedElementId(null),
      onClick: (e: React.MouseEvent) => handleElementClick(element, e),
      id: element.id,
      'data-element-id': element.id,
      'data-preview-motion-scroll': s.animationName && s.animationName !== 'none' && s.animationTrigger === 'scroll' ? 'true' : undefined,
      'data-role': element.role,
    };

    if (element.type === 'section') {
      return (
        <section {...commonProps}>
          {element.content && <div className="p-2 select-none">{element.content}</div>}
        </section>
      );
    }

    if (element.type === 'shape') {
      const shapeKind = s.shapeKind || 'circle';
      const def = SHAPE_DEFINITIONS[shapeKind] || SHAPE_DEFINITIONS.circle;
      const gradId = `prev-grad-${element.id}`;

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
        <div {...commonProps}>
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

    if (element.type === 'button' || element.role === 'button') {
      const icon = element.behavior.buttonIcon || 'none';
      const iconPos = element.behavior.buttonIconPosition || 'right';
      const iconNode = renderButtonIcon(icon, 'w-4 h-4 shrink-0 transition-transform duration-200');
      return (
        <button {...commonProps} type="button" role="button">
          <div className="w-full h-full flex items-center justify-center font-semibold px-4 select-none gap-2">
            {iconPos === 'left' && iconNode}
            <span className="truncate">{element.content || 'Button'}</span>
            {iconPos === 'right' && iconNode}
          </div>
        </button>
      );
    }

    if (element.type === 'input' || element.role === 'input') {
      const inputType =
        element.formConfig?.inputType ||
        (element.name.toLowerCase().includes('email')
          ? 'email'
          : element.name.toLowerCase().includes('password')
          ? 'password'
          : 'text');
      const placeholder =
        element.formConfig?.placeholder || element.content || `Enter ${element.name || 'text'}...`;
      return (
        <input
          {...commonProps}
          id={`input-${element.id}`}
          data-field-id={element.id}
          type={inputType}
          placeholder={placeholder}
          defaultValue=""
          required={element.formConfig?.required}
          className="outline-none px-3 cursor-text"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    if (element.type === 'textarea') {
      const placeholder =
        element.formConfig?.placeholder || element.content || `Enter ${element.name || 'message'}...`;
      return (
        <textarea
          {...commonProps}
          id={`input-${element.id}`}
          data-field-id={element.id}
          placeholder={placeholder}
          defaultValue=""
          required={element.formConfig?.required}
          rows={3}
          className="outline-none p-3 resize-none cursor-text"
          onClick={(e) => e.stopPropagation()}
        />
      );
    }

    if (element.type === 'select') {
      const options = element.formConfig?.options || ['Option 1', 'Option 2', 'Option 3'];
      return (
        <select
          {...commonProps}
          id={`input-${element.id}`}
          data-field-id={element.id}
          required={element.formConfig?.required}
          className="outline-none px-3 cursor-pointer"
          style={{ backgroundColor: s.backgroundColor || '#131620' }}
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((opt, i) => (
            <option key={i} value={opt} className="bg-zinc-900 text-white">
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (element.type === 'checkbox') {
      return (
        <label {...commonProps} className="flex items-center gap-2.5 px-2 select-none cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            id={`input-${element.id}`}
            data-field-id={element.id}
            type="checkbox"
            defaultChecked={element.formConfig?.checked}
            className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="truncate">{element.content || 'I agree'}</span>
        </label>
      );
    }

    if (element.type === 'accordion') {
      return (
        <div {...commonProps}>
          <AccordionWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'carousel') {
      return (
        <div {...commonProps}>
          <CarouselWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'video') {
      return (
        <div {...commonProps}>
          <VideoWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'counter') {
      return (
        <div {...commonProps}>
          <CounterWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'product-card') {
      return (
        <div {...commonProps}>
          <ProductCardWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'lottie') {
      return (
        <div {...commonProps}>
          <LottieWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'poll') {
      return (
        <div {...commonProps}>
          <PollWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'guestbook') {
      return (
        <div {...commonProps}>
          <GuestbookWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'reaction') {
      return (
        <div {...commonProps}>
          <ReactionWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'countdown') {
      return (
        <div {...commonProps}>
          <CountdownWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'audio') {
      return (
        <div {...commonProps}>
          <AudioWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'before-after') {
      return (
        <div {...commonProps}>
          <BeforeAfterWidget element={element} isInteractive={true} />
        </div>
      );
    }

    if (element.type === 'testimonial') {
      return (
        <div {...commonProps}>
          <TestimonialWidget element={element} isInteractive={true} />
        </div>
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

      case 'link':
        return (
          <a
            {...commonProps}
            href={
              beh.actionType === 'navigate-url'
                ? beh.actionPayload || '#'
                : '#'
            }
            target={beh.targetBlank ? '_blank' : '_self'}
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
      {/* Scroll-Linked Reading Progress Bar */}
      {activePage.showScrollProgress && (
        <ReadingProgressBar color={activePage.scrollProgressColor} />
      )}

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

      {/* Interactive E-Commerce Cart Drawer */}
      <CartDrawer />
    </div>
  );
};
