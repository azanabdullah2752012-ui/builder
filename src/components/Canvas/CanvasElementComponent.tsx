import React, { useState, useRef } from 'react';
import type { CanvasElement, ResizeHandleType } from '../../types/editor';
import { useEditor } from '../../context/useEditor';
import { ResizeHandles } from './ResizeHandles';
import { Rocket, LayoutGrid, Layers, ArrowRight, ExternalLink, Sparkles, Download } from 'lucide-react';

interface CanvasElementComponentProps {
  element: CanvasElement;
  isSelected: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export const CanvasElementComponent: React.FC<CanvasElementComponentProps> = ({
  element,
  isSelected,
  canvasWidth,
  canvasHeight,
}) => {
  const {
    activePage,
    selectElement,
    updateElement,
    setElementParent,
    zoom,
    editorMode,
    showToast,
    setActivePage,
  } = useEditor();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [inlineText, setInlineText] = useState(element.content || '');
  const [isHovered, setIsHovered] = useState(false);
  const [forceHover, setForceHover] = useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id === element.id) {
        setForceHover(!!detail.hover);
      } else if (!detail?.id) {
        setForceHover(false);
      }
    };
    window.addEventListener('canvas:force-hover', handler);
    return () => window.removeEventListener('canvas:force-hover', handler);
  }, [element.id]);

  const elementRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; elX: number; elY: number }>({
    startX: 0,
    startY: 0,
    elX: 0,
    elY: 0,
  });

  const lastPosRef = useRef<{ x: number; y: number }>({
    x: element.x,
    y: element.y,
  });

  const resizeStartRef = useRef<{
    handle: ResizeHandleType;
    startX: number;
    startY: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  }>({
    handle: 'se',
    startX: 0,
    startY: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
  });

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return;
    e.stopPropagation();

    selectElement(element.id);

    // If locked or in inline edit, do not initiate drag
    if (element.locked || isEditingInline) return;

    // Prevent default browser text selection or ghost image drag
    e.preventDefault();

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elX: element.x,
      elY: element.y,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let deltaX = (moveEvent.clientX - dragStartRef.current.startX) / zoom;
      let deltaY = (moveEvent.clientY - dragStartRef.current.startY) / zoom;

      // Shift key axis-lock: locks movement strictly to horizontal or vertical axis (Figma standard)
      if (moveEvent.shiftKey) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          deltaY = 0;
        } else {
          deltaX = 0;
        }
      }

      let newX = Math.round(dragStartRef.current.elX + deltaX);
      let newY = Math.round(dragStartRef.current.elY + deltaY);

      // Smart Snapping Logic (disabled when Alt key is held)
      let snapX: number | null = null;
      let snapY: number | null = null;
      let labelX: string | undefined = undefined;
      let labelY: string | undefined = undefined;
      const threshold = 6;

      if (!moveEvent.altKey) {
        const elRight = newX + element.width;
        const elCenter = newX + element.width / 2;
        const elBottom = newY + element.height;
        const elCenterY = newY + element.height / 2;

        // 1. Center of canvas snap
        const canvasCenter = Math.round(canvasWidth / 2);
        if (Math.abs(elCenter - canvasCenter) <= threshold) {
          newX = Math.round(canvasCenter - element.width / 2);
          snapX = canvasCenter;
          labelX = 'Canvas Center';
        }

        const canvasCenterY = Math.round(canvasHeight / 2);
        if (Math.abs(elCenterY - canvasCenterY) <= threshold) {
          newY = Math.round(canvasCenterY - element.height / 2);
          snapY = canvasCenterY;
          labelY = 'Canvas Middle';
        }

        // 2. Snap to sibling elements' boundaries & centers
        for (const other of activePage.elements) {
          if (other.id === element.id) continue;
          const otherRight = other.x + other.width;
          const otherCenter = other.x + other.width / 2;
          const otherBottom = other.y + other.height;
          const otherCenterY = other.y + other.height / 2;

          // Horizontal alignment
          if (snapX === null) {
            // Left to Left
            if (Math.abs(newX - other.x) <= threshold) {
              newX = other.x;
              snapX = other.x;
              labelX = 'Align Left';
            }
            // Center to Center
            else if (Math.abs(elCenter - otherCenter) <= threshold) {
              newX = Math.round(otherCenter - element.width / 2);
              snapX = Math.round(otherCenter);
              labelX = 'Align Center';
            }
            // Right to Right
            else if (Math.abs(elRight - otherRight) <= threshold) {
              newX = otherRight - element.width;
              snapX = otherRight;
              labelX = 'Align Right';
            }
            // Adjacent: Left to sibling Right
            else if (Math.abs(newX - otherRight) <= threshold) {
              newX = otherRight;
              snapX = otherRight;
              labelX = 'Snap Edge';
            }
            // Adjacent: Right to sibling Left
            else if (Math.abs(elRight - other.x) <= threshold) {
              newX = other.x - element.width;
              snapX = other.x;
              labelX = 'Snap Edge';
            }
          }

          // Vertical alignment
          if (snapY === null) {
            // Top to Top
            if (Math.abs(newY - other.y) <= threshold) {
              newY = other.y;
              snapY = other.y;
              labelY = 'Align Top';
            }
            // Center to Center
            else if (Math.abs(elCenterY - otherCenterY) <= threshold) {
              newY = Math.round(otherCenterY - element.height / 2);
              snapY = Math.round(otherCenterY);
              labelY = 'Align Middle';
            }
            // Bottom to Bottom
            else if (Math.abs(elBottom - otherBottom) <= threshold) {
              newY = otherBottom - element.height;
              snapY = otherBottom;
              labelY = 'Align Bottom';
            }
            // Adjacent: Top to sibling Bottom
            else if (Math.abs(newY - otherBottom) <= threshold) {
              newY = otherBottom;
              snapY = otherBottom;
              labelY = 'Snap Edge';
            }
            // Adjacent: Bottom to sibling Top
            else if (Math.abs(elBottom - other.y) <= threshold) {
              newY = other.y - element.height;
              snapY = other.y;
              labelY = 'Snap Edge';
            }
          }

          if (snapX !== null && snapY !== null) break;
        }

        // 3. Fallback 8px grid snapping
        if (snapX === null) {
          const gridX = Math.round(newX / 8) * 8;
          if (Math.abs(newX - gridX) <= 3) newX = gridX;
        }
        if (snapY === null) {
          const gridY = Math.round(newY / 8) * 8;
          if (Math.abs(newY - gridY) <= 3) newY = gridY;
        }
      }

      // Broadcast active alignment guides to canvas
      window.dispatchEvent(
        new CustomEvent('canvas:guides', { detail: { x: snapX, y: snapY, labelX, labelY } })
      );

      // Clamping inside canvas bounds
      newX = Math.max(0, Math.min(canvasWidth - element.width, newX));
      newY = Math.max(0, Math.min(canvasHeight - element.height, newY));

      lastPosRef.current = { x: newX, y: newY };
      updateElement(element.id, { x: newX, y: newY }, false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.dispatchEvent(new CustomEvent('canvas:guides', { detail: { x: null, y: null } }));
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Record history on drag completion
      updateElement(element.id, {}, true);

      // Check if dropped into a container or section
      if (element.type !== 'section') {
        const descendants = new Set<string>();
        const stack = [element.id];
        while (stack.length > 0) {
          const cur = stack.pop()!;
          for (const item of activePage.elements) {
            if (item.parentId === cur && !descendants.has(item.id)) {
              descendants.add(item.id);
              stack.push(item.id);
            }
          }
        }

        const candidateParents = activePage.elements.filter(
          (c) =>
            (c.type === 'section' || c.type === 'container') &&
            c.id !== element.id &&
            !descendants.has(c.id)
        );

        // Find candidate parent where element center is located inside
        const finalX = lastPosRef.current.x;
        const finalY = lastPosRef.current.y;
        const centerX = finalX + element.width / 2;
        const centerY = finalY + element.height / 2;
        let bestParent: CanvasElement | null = null;
        let smallestArea = Infinity;

        for (const p of candidateParents) {
          if (centerX >= p.x && centerX <= p.x + p.width && centerY >= p.y && centerY <= p.y + p.height) {
            const area = p.width * p.height;
            if (area < smallestArea) {
              smallestArea = area;
              bestParent = p;
            }
          }
        }

        if (bestParent && bestParent.id !== element.parentId) {
          setElementParent(element.id, bestParent.id);
        } else if (!bestParent && element.parentId) {
          setElementParent(element.id, null);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Helper for resize cursor
  const getCursorForHandle = (h: ResizeHandleType) => {
    switch (h) {
      case 'n':
      case 's': return 'ns-resize';
      case 'e':
      case 'w': return 'ew-resize';
      case 'nw':
      case 'se': return 'nwse-resize';
      case 'ne':
      case 'sw': return 'nesw-resize';
    }
  };

  // Handle Resizing
  const handleResizeStart = (handle: ResizeHandleType, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (element.locked) return;

    setIsResizing(true);
    document.body.style.cursor = getCursorForHandle(handle);
    document.body.style.userSelect = 'none';

    resizeStartRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      elX: element.x,
      elY: element.y,
      elW: element.width,
      elH: element.height,
    };

    const aspectRatio = resizeStartRef.current.elW / Math.max(1, resizeStartRef.current.elH);

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - resizeStartRef.current.startX) / zoom;
      const deltaY = (moveEvent.clientY - resizeStartRef.current.startY) / zoom;

      const startX = resizeStartRef.current.elX;
      const startY = resizeStartRef.current.elY;
      const startW = resizeStartRef.current.elW;
      const startH = resizeStartRef.current.elH;

      let newX = startX;
      let newY = startY;
      let newW = startW;
      let newH = startH;

      const minW = 24;
      const minH = 16;

      // Handle horizontal adjustments
      if (handle.includes('e')) {
        newW = Math.max(minW, Math.round(startW + deltaX));
      }
      if (handle.includes('w')) {
        newW = Math.max(minW, Math.round(startW - deltaX));
        newX = startX + (startW - newW);
      }

      // Handle vertical adjustments
      if (handle.includes('s')) {
        newH = Math.max(minH, Math.round(startH + deltaY));
      }
      if (handle.includes('n')) {
        newH = Math.max(minH, Math.round(startH - deltaY));
        newY = startY + (startH - newH);
      }

      // Proportional ratio lock when Shift is held
      if (moveEvent.shiftKey) {
        if (handle === 'e' || handle === 'w') {
          newH = Math.max(minH, Math.round(newW / aspectRatio));
          if (handle.includes('n')) newY = startY + (startH - newH);
        } else if (handle === 'n' || handle === 's') {
          newW = Math.max(minW, Math.round(newH * aspectRatio));
          if (handle.includes('w')) newX = startX + (startW - newW);
        } else {
          // Corner resize: preserve aspect ratio based on maximum scale
          const scaleW = newW / startW;
          const scaleH = newH / startH;
          const scale = Math.max(scaleW, scaleH);
          newW = Math.max(minW, Math.round(startW * scale));
          newH = Math.max(minH, Math.round(startH * scale));
          if (handle.includes('w')) newX = startX + (startW - newW);
          if (handle.includes('n')) newY = startY + (startH - newH);
        }
      } else if (!moveEvent.altKey) {
        // Magnetic 8px grid snapping for dimensions
        const snapW = Math.round(newW / 8) * 8;
        if (Math.abs(newW - snapW) <= 3) {
          if (handle.includes('w')) newX = startX + (startW - snapW);
          newW = snapW;
        }
        const snapH = Math.round(newH / 8) * 8;
        if (Math.abs(newH - snapH) <= 3) {
          if (handle.includes('n')) newY = startY + (startH - snapH);
          newH = snapH;
        }
      }

      // Clamping inside canvas limits without jumping
      if (newX < 0) {
        newW = Math.max(minW, newW + newX);
        newX = 0;
      }
      if (newY < 0) {
        newH = Math.max(minH, newH + newY);
        newY = 0;
      }
      if (newX + newW > canvasWidth) {
        newW = Math.max(minW, canvasWidth - newX);
      }
      if (newY + newH > canvasHeight) {
        newH = Math.max(minH, canvasHeight - newY);
      }

      updateElement(element.id, { x: newX, y: newY, width: newW, height: newH }, false);
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      // Record history on resize completion
      updateElement(element.id, {}, true);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  // Inline editing for text content
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.locked) return;
    if (element.type === 'text' || element.type === 'button') {
      setIsEditingInline(true);
      setInlineText(element.content || '');
    }
  };

  const handleInlineBlur = () => {
    setIsEditingInline(false);
    updateElement(element.id, { content: inlineText }, true);
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditingInline(false);
      updateElement(element.id, { content: inlineText }, true);
    } else if (e.key === 'Escape') {
      setIsEditingInline(false);
      setInlineText(element.content || '');
    }
  };

  // Preview Mode Click Behavior Handler for Buttons & Links
  const handleElementClick = (e: React.MouseEvent) => {
    if (editorMode === 'preview') {
      e.stopPropagation();
      const action = element.behavior?.actionType;
      const payload = element.behavior?.actionPayload;
      if (action === 'navigate-url' && payload) {
        window.open(payload, element.behavior?.targetBlank ? '_blank' : '_self');
      } else if (action === 'navigate-page' && payload) {
        setActivePage(payload);
      } else if (action === 'alert') {
        showToast(payload || 'Action triggered successfully!', 'info');
      } else if (action === 'scroll-top') {
        window.dispatchEvent(new CustomEvent('canvas:scroll-top'));
      }
    }
  };

  // Element styles object
  const s = element.styles;
  const l = element.layout;
  const b = element.behavior;
  const isSection = element.type === 'section';

  // Outer Wrapper: Unclipped, handles positioning, selection outline, ResizeHandles, and HUD
  const outerWrapperStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: isDragging ? 1000 : isSelected ? 50 : element.zIndex || (isSection ? 0 : 1),
    cursor: element.locked ? 'default' : isDragging ? 'grabbing' : editorMode === 'preview' && (element.type === 'button' || b?.actionType !== 'none') ? 'pointer' : 'grab',
    boxSizing: 'border-box',
    overflow: 'visible', // CRITICAL: Never clip handles or floating HUD!
  };

  const activeHover = isHovered || forceHover;
  const hs = b?.hoverStyles;

  // Compute transform and shadows for hover
  const activeScale = activeHover
    ? hs?.scale || s.hoverScale || (s.hoverEffect === 'scale' ? 1.04 : undefined)
    : undefined;
  const activeTranslateY = activeHover
    ? (s.hoverTranslateY !== undefined ? s.hoverTranslateY : (s.hoverEffect === 'lift' ? -4 : undefined))
    : undefined;
  const transformParts: string[] = [];
  if (activeTranslateY !== undefined && activeTranslateY !== 0) {
    transformParts.push(`translateY(${activeTranslateY}px)`);
  }
  if (activeScale !== undefined && activeScale !== 1) {
    transformParts.push(`scale(${activeScale})`);
  }
  const computedTransform = transformParts.length > 0 ? transformParts.join(' ') : undefined;

  const activeShadow = activeHover
    ? hs?.boxShadow || s.hoverShadow || (s.hoverEffect === 'lift' ? '0 16px 32px -4px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,0,0,0.3)' : s.hoverEffect === 'glow' ? '0 0 25px rgba(99, 102, 241, 0.65)' : undefined)
    : s.boxShadow || undefined;

  // Inner Container: Handles clipping, borders, backgrounds/gradients, transitions, and flex layout
  const innerContentStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: activeHover && hs?.backgroundColor ? hs.backgroundColor : s.gradient || s.backgroundColor || (isSection ? 'transparent' : 'transparent'),
    color: activeHover && hs?.color ? hs.color : s.color || 'inherit',
    fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
    fontWeight: s.fontWeight || undefined,
    fontFamily: s.fontFamily || undefined,
    textAlign: s.textAlign || 'left',
    lineHeight: s.lineHeight || undefined,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
    borderWidth: s.borderWidth !== undefined ? `${s.borderWidth}px` : isSection ? '1px' : undefined,
    borderStyle: s.borderStyle || (isSection ? 'dashed' : 'none'),
    borderColor: activeHover && hs?.borderColor ? hs.borderColor : activeHover && s.hoverEffect === 'glow' ? '#818cf8' : s.borderColor || (isSection ? '#94a3b8' : 'transparent'),
    boxShadow: activeShadow,
    opacity: activeHover && hs?.opacity !== undefined ? hs.opacity : s.opacity !== undefined ? s.opacity : 1,
    transform: computedTransform,
    filter: activeHover && s.hoverEffect === 'brighten' ? 'brightness(1.15)' : undefined,
    boxSizing: 'border-box',
    userSelect: isEditingInline ? 'text' : 'none',
    display: 'flex',
    flexDirection: l?.direction || 'column',
    justifyContent:
      element.type === 'button'
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
      element.type === 'button'
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
    overflow: 'hidden',
    transition: s.transitionDuration
      ? `all ${s.transitionDuration}ms ${s.transitionTimingFunction || 'cubic-bezier(0.4, 0, 0.2, 1)'}`
      : 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Render Inner Content
  const renderContent = () => {
    if (isEditingInline) {
      return (
        <textarea
          value={inlineText}
          onChange={(e) => setInlineText(e.target.value)}
          onBlur={handleInlineBlur}
          onKeyDown={handleInlineKeyDown}
          autoFocus
          className="w-full h-full bg-transparent resize-none outline-none border border-blue-400 p-1"
          style={{
            color: s.color || 'inherit',
            fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
            fontWeight: s.fontWeight || undefined,
            fontFamily: s.fontFamily || undefined,
            textAlign: s.textAlign || 'left',
          }}
        />
      );
    }

    switch (element.type) {
      case 'section':
        return (
          <div className="w-full h-full pointer-events-none relative select-none">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 opacity-60">
              <span className="text-[9px] font-mono uppercase font-semibold text-purple-600 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                § Section
              </span>
              <span className="text-[11px] font-medium text-slate-500">{element.name}</span>
            </div>
            {element.content && <div className="mt-8 text-xs text-slate-600 p-2">{element.content}</div>}
          </div>
        );

      case 'text':
        if (element.id === 'el_nav_logo' || element.content === '⬢') {
          return (
            <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#818cf8" strokeWidth="1.75" strokeLinejoin="round" />
                <path d="M12 12L21 7M12 12V22M12 12L3 7" stroke="#60a5fa" strokeWidth="1.75" strokeLinejoin="round" />
              </svg>
            </div>
          );
        }
        if (element.id === 'el_card_1_icon' || element.content === '🚀') {
          return (
            <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
              <Rocket className="w-5 h-5 text-indigo-400" />
            </div>
          );
        }
        if (element.id === 'el_card_2_icon' || element.content === '⚏') {
          return (
            <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
              <LayoutGrid className="w-5 h-5 text-sky-400" />
            </div>
          );
        }
        if (element.id === 'el_card_3_icon' || element.content === '▤') {
          return (
            <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          );
        }
        return (
          <div className={`w-full h-full whitespace-pre-wrap select-none pointer-events-none p-1 ${b?.actionType === 'navigate-url' ? 'underline underline-offset-4 decoration-indigo-400/50' : ''}`}>
            {element.content || 'Double-click to write text...'}
          </div>
        );

      case 'button': {
        const icon = b?.buttonIcon;
        return (
          <div className="w-full h-full flex items-center justify-center font-medium px-4 select-none pointer-events-none gap-2">
            {icon === 'sparkles' && <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />}
            {icon === 'download' && <Download className="w-4 h-4 shrink-0" />}
            <span>{element.content || 'Button'}</span>
            {icon === 'arrow-right' && <ArrowRight className="w-4 h-4 shrink-0" />}
            {icon === 'external-link' && <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />}
          </div>
        );
      }

      case 'image':
        return (
          <img
            src={element.content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
            alt={element.name}
            className="w-full h-full pointer-events-none select-none"
            style={{ objectFit: s.objectFit || 'cover' }}
          />
        );

      case 'divider':
        return (
          <div
            className="w-full"
            style={{
              height: `${s.dividerHeight || 2}px`,
              backgroundColor: s.backgroundColor || '#e2e8f0',
            }}
          />
        );

      case 'container':
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      data-element-id={element.id}
      onClick={handleElementClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={outerWrapperStyles}
      className={`group transition-[outline] duration-75 ${
        isSelected
          ? element.locked
            ? 'outline outline-2 outline-amber-500 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]'
            : isSection
            ? 'outline outline-2 outline-purple-500 shadow-[0_0_0_1px_rgba(168,85,247,0.25)]'
            : 'outline outline-2 outline-indigo-500 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
          : isSection
          ? 'hover:outline hover:outline-1 hover:outline-purple-400/40'
          : 'hover:outline hover:outline-1 hover:outline-indigo-400/35'
      }`}
    >
      {/* Inner Render Container (styled with background/gradient, border, radius, transitions, hover) */}
      <div style={innerContentStyles}>
        {renderContent()}
      </div>

      {/* Selected Chrome - 8 Prominent Resize Handles & Live Coordinate HUD (unclipped in outer wrapper) */}
      {isSelected && !element.locked && (
        <>
          <ResizeHandles onResizeStart={handleResizeStart} />
          {/* Subtle real-time dimension & position HUD indicator */}
          {isDragging && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-zinc-950/95 text-indigo-300 text-[10px] font-mono border border-indigo-500/50 shadow-2xl pointer-events-none select-none z-50 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span>X: <strong className="text-white font-semibold">{Math.round(element.x)}</strong></span>
              <span className="opacity-30 text-indigo-300">|</span>
              <span>Y: <strong className="text-white font-semibold">{Math.round(element.y)}</strong></span>
            </div>
          )}
          {isResizing && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-zinc-950/95 text-indigo-300 text-[10px] font-mono border border-indigo-500/50 shadow-2xl pointer-events-none select-none z-50 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
              <span>W: <strong className="text-white font-semibold">{Math.round(element.width)}</strong></span>
              <span className="opacity-30 text-indigo-300">×</span>
              <span>H: <strong className="text-white font-semibold">{Math.round(element.height)}</strong></span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
