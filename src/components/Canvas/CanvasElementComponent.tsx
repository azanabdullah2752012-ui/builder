import React, { useState, useRef } from 'react';
import type { CanvasElement, ResizeHandleType } from '../../types/editor';
import { useEditor } from '../../context/useEditor';
import { ResizeHandles } from './ResizeHandles';
import { SHAPE_DEFINITIONS, getShapeSvgNode } from '../../utils/shapeDefinitions';
import { getComputedButtonStyles, renderButtonIcon } from '../../utils/buttonStyles';
import { executeElementAction } from '../../utils/actionExecutor';
import { computeSmartSnapping } from '../../utils/snappingEngine';
import {
  AccordionWidget,
  CarouselWidget,
  VideoWidget,
  CounterWidget,
  PollWidget,
  GuestbookWidget,
  ReactionWidget,
} from '../Widgets/InteractiveWidgets';
import { ProductCardWidget } from '../Widgets/ProductCardWidget';
import { LottieWidget } from '../Widgets/LottieWidget';

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
    project,
    activePage,
    selectedElementIds,
    selectElement,
    toggleSelectElement,
    moveSelectedElements,
    updateElement,
    updatePageSettings,
    setElementParent,
    zoom,
    editorMode,
    showToast,
    setActivePage,
    snapToObjects,
    snapToGuides,
    userGuides,
    previewStateVariant,
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

    // Multi-selection toggle with Shift or Meta/Ctrl
    if (e.shiftKey || e.metaKey) {
      e.preventDefault();
      toggleSelectElement(element.id, true);
      return;
    }

    // If element is not already part of multi-selection, select it singly
    if (!selectedElementIds.includes(element.id)) {
      selectElement(element.id);
    }

    // If locked or in inline edit, do not initiate drag
    if (element.locked || isEditingInline) return;

    // Prevent default browser text selection or ghost image drag
    e.preventDefault();

    const isMultiDragging = selectedElementIds.length > 1 && selectedElementIds.includes(element.id);
    let lastDeltaX = 0;
    let lastDeltaY = 0;

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

      if (isMultiDragging) {
        const stepDx = Math.round(deltaX - lastDeltaX);
        const stepDy = Math.round(deltaY - lastDeltaY);
        if (stepDx !== 0 || stepDy !== 0) {
          moveSelectedElements(stepDx, stepDy);
          lastDeltaX += stepDx;
          lastDeltaY += stepDy;
        }
        return;
      }

      let newX = Math.round(dragStartRef.current.elX + deltaX);
      let newY = Math.round(dragStartRef.current.elY + deltaY);

      // Smart Snapping Logic (disabled when Alt key is held)
      let snapLines: import('../../types/editor').SmartSnapLine[] = [];
      let equalSpacings: import('../../types/editor').EqualSpacingIndicator[] = [];

      if (!moveEvent.altKey) {
        const snapRes = computeSmartSnapping(
          element,
          newX,
          newY,
          activePage.elements,
          userGuides,
          canvasWidth,
          canvasHeight,
          {
            snapToObjects,
            snapToGuides,
            snapToCanvasCenter: true,
            snapToEqualSpacing: true,
            threshold: 6,
          }
        );

        newX = snapRes.snappedX;
        newY = snapRes.snappedY;
        snapLines = snapRes.snapLines;
        equalSpacings = snapRes.equalSpacings;
      }

      // Broadcast active alignment guides and equal spacings to canvas
      const vLine = snapLines.find((l) => l.type === 'vertical');
      const hLine = snapLines.find((l) => l.type === 'horizontal');
      window.dispatchEvent(
        new CustomEvent('canvas:guides', {
          detail: {
            snapLines,
            equalSpacings,
            x: vLine?.position ?? null,
            y: hLine?.position ?? null,
            labelX: vLine?.label,
            labelY: hLine?.label,
          },
        })
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
      window.dispatchEvent(
        new CustomEvent('canvas:guides', { detail: { snapLines: [], equalSpacings: [], x: null, y: null } })
      );
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (isMultiDragging) {
        if (lastDeltaX !== 0 || lastDeltaY !== 0) {
          updateElement(element.id, {}, true);
        }
        return;
      }

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

  // Click Behavior Handler for Interactive Elements (supports Preview and Alt+Click testing in Design mode)
  const handleElementClick = (e: React.MouseEvent) => {
    if (editorMode === 'preview' || e.altKey) {
      e.stopPropagation();
      executeElementAction(
        element,
        {
          project,
          activePage,
          setActivePage,
          updatePageSettings,
          showToast,
        },
        e
      );
    }
  };

  // Element styles object
  const s = element.styles || {};
  const l = element.layout;
  const b = element.behavior || { actionType: 'none' };
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

  const isPreviewingHover = isSelected && previewStateVariant === 'hover';
  const isPreviewingActive = isSelected && previewStateVariant === 'active';
  const isPreviewingFocus = isSelected && previewStateVariant === 'focus';

  const activeHover = isHovered || forceHover || isPreviewingHover;
  const activePressed = isPreviewingActive;
  const activeFocused = isPreviewingFocus;

  const hs = b?.hoverStyles;
  const as = b?.activeStyles;
  const fs = b?.focusStyles;

  // Compute transform and shadows for interactive states (hover, active/pressed, focus)
  const activeScale = activePressed
    ? as?.scale !== undefined ? as.scale : 0.96
    : activeHover
    ? hs?.scale || s.hoverScale || (s.hoverEffect === 'scale' ? 1.04 : undefined)
    : undefined;

  const activeTranslateY = activePressed
    ? as?.translateY !== undefined ? as.translateY : 2
    : activeHover
    ? (hs?.translateY !== undefined ? hs.translateY : (s.hoverTranslateY !== undefined ? s.hoverTranslateY : (s.hoverEffect === 'lift' ? -4 : undefined)))
    : undefined;

  const transformParts: string[] = [];
  if (activeTranslateY !== undefined && activeTranslateY !== 0) {
    transformParts.push(`translateY(${activeTranslateY}px)`);
  }
  if (activeScale !== undefined && activeScale !== 1) {
    transformParts.push(`scale(${activeScale})`);
  }
  if (s.rotation !== undefined && s.rotation !== 0) {
    transformParts.push(`rotate(${s.rotation}deg)`);
  }
  if (s.scale !== undefined && s.scale !== 1 && activeScale === undefined) {
    transformParts.push(`scale(${s.scale})`);
  }
  if (s.skewX !== undefined && s.skewX !== 0) {
    transformParts.push(`skewX(${s.skewX}deg)`);
  }
  if (s.skewY !== undefined && s.skewY !== 0) {
    transformParts.push(`skewY(${s.skewY}deg)`);
  }
  const computedTransform = transformParts.length > 0 ? transformParts.join(' ') : undefined;

  const activeShadow = activePressed
    ? as?.boxShadow || 'inset 0 2px 4px rgba(0,0,0,0.4)'
    : activeFocused
    ? fs?.boxShadow || (fs?.outlineColor ? `0 0 0 ${fs.outlineWidth || 2}px ${fs.outlineColor}` : '0 0 0 2px #6366f1, 0 0 12px rgba(99,102,241,0.5)')
    : activeHover
    ? hs?.boxShadow || s.hoverShadow || (s.hoverEffect === 'lift' ? '0 16px 32px -4px rgba(0,0,0,0.5), 0 8px 16px -4px rgba(0,0,0,0.3)' : s.hoverEffect === 'glow' ? '0 0 25px rgba(99, 102, 241, 0.65)' : undefined)
    : s.boxShadow || undefined;

  const isBtn = element.type === 'button';
  const btnStyles = isBtn ? getComputedButtonStyles(b, s) : undefined;

  // Inner Container: Handles clipping, borders, backgrounds/gradients, transitions, and flex layout
  const innerContentStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    background:
      element.type === 'shape'
        ? 'transparent'
        : activePressed && as?.backgroundColor
        ? as.backgroundColor
        : activeFocused && fs?.backgroundColor
        ? fs.backgroundColor
        : activeHover && hs?.backgroundColor
        ? hs.backgroundColor
        : s.gradient || btnStyles?.background || s.backgroundColor || btnStyles?.backgroundColor || (isSection ? 'transparent' : 'transparent'),
    color:
      activePressed && as?.color
        ? as.color
        : activeFocused && fs?.color
        ? fs.color
        : activeHover && hs?.color
        ? hs.color
        : s.color || btnStyles?.color || 'inherit',
    fontSize: s.fontSize ? `${s.fontSize}px` : btnStyles?.fontSize || undefined,
    fontWeight: s.fontWeight || btnStyles?.fontWeight || undefined,
    fontFamily: s.fontFamily || undefined,
    textAlign: s.textAlign || 'left',
    lineHeight: s.lineHeight || undefined,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    textTransform: s.textTransform || undefined,
    textDecoration: s.textDecoration || undefined,
    fontStyle: s.fontStyle || undefined,
    borderRadius: element.type === 'shape' ? undefined : s.borderRadius !== undefined ? `${s.borderRadius}px` : btnStyles?.borderRadius || undefined,
    borderWidth: element.type === 'shape' ? 0 : s.borderWidth !== undefined ? `${s.borderWidth}px` : btnStyles?.borderWidth || (isSection ? '1px' : undefined),
    borderStyle: element.type === 'shape' ? 'none' : s.borderStyle || btnStyles?.borderStyle || (isSection ? 'dashed' : 'none'),
    borderColor:
      element.type === 'shape'
        ? 'transparent'
        : activePressed && as?.borderColor
        ? as.borderColor
        : activeFocused && (fs?.borderColor || fs?.outlineColor)
        ? fs.borderColor || fs.outlineColor
        : activeHover && hs?.borderColor
        ? hs.borderColor
        : activeHover && s.hoverEffect === 'glow'
        ? '#818cf8'
        : s.borderColor || btnStyles?.borderColor || (isSection ? '#94a3b8' : 'transparent'),
    boxShadow: element.type === 'shape' ? undefined : activeShadow || btnStyles?.boxShadow,
    outline: activeFocused && fs?.outlineColor ? `${fs.outlineWidth || 2}px solid ${fs.outlineColor}` : undefined,
    outlineOffset: activeFocused ? '2px' : undefined,
    opacity:
      activePressed && as?.opacity !== undefined
        ? as.opacity
        : activeHover && hs?.opacity !== undefined
        ? hs.opacity
        : s.opacity !== undefined
        ? s.opacity
        : 1,
    transform: computedTransform,
    filter: [s.filter, activeHover && s.hoverEffect === 'brighten' ? 'brightness(1.15)' : ''].filter(Boolean).join(' ') || undefined,
    boxSizing: 'border-box',
    backdropFilter: s.backdropFilter || (btnStyles as any)?.backdropFilter,
    WebkitBackdropFilter: s.backdropFilter || (btnStyles as any)?.WebkitBackdropFilter,
    mixBlendMode: s.mixBlendMode || undefined,
    overflow: s.overflow || (isSection ? 'visible' : undefined),
    cursor: s.cursor || undefined,
    animation: (() => {
      if (!s.animationName || s.animationName === 'none') return undefined;
      const isHoverTrigger = s.animationTrigger === 'hover';
      if (isHoverTrigger && !isHovered) return undefined;
      const duration = s.animationDuration || 0.7;
      const timing = s.animationTimingFunction || 'cubic-bezier(0.16, 1, 0.3, 1)';
      const delay = s.animationDelay || 0;
      const iteration = s.animationIterationCount || '1';
      return `${s.animationName} ${duration}s ${timing} ${delay}s ${iteration} both`;
    })(),
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
          onFocus={(e) => e.currentTarget.select()}
          className="w-full h-full bg-transparent resize-none outline-none border-2 border-indigo-500 rounded p-1 shadow-inner"
          style={{
            color: s.color || 'inherit',
            fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
            fontWeight: s.fontWeight || undefined,
            fontFamily: s.fontFamily || undefined,
            textAlign: s.textAlign || 'left',
            lineHeight: s.lineHeight || 1.3,
            letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
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
        return (
          <div className={`w-full h-full whitespace-pre-wrap select-none pointer-events-none p-1 ${b?.actionType === 'navigate-url' ? 'underline underline-offset-4 decoration-indigo-400/50' : ''}`}>
            {element.content || 'Double-click to write text...'}
          </div>
        );

      case 'button': {
        const icon = b?.buttonIcon || 'none';
        const iconPos = b?.buttonIconPosition || 'right';
        const iconNode = renderButtonIcon(icon, 'w-4 h-4 shrink-0 transition-transform duration-200');
        return (
          <div className="w-full h-full flex items-center justify-center font-semibold px-4 select-none pointer-events-none gap-2">
            {iconPos === 'left' && iconNode}
            <span className="truncate">{element.content || 'Button'}</span>
            {iconPos === 'right' && iconNode}
          </div>
        );
      }

      case 'image':
        return (
          <img
            src={element.content || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'}
            alt={s.alt || element.name}
            className="w-full h-full pointer-events-none select-none"
            style={{
              objectFit: s.objectFit || 'cover',
              borderRadius: `${s.borderRadius || 0}px`,
              opacity: s.opacity ?? 1,
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
            }}
          />
        );

      case 'shape': {
        const shapeKind = s.shapeKind || 'circle';
        const def = SHAPE_DEFINITIONS[shapeKind] || SHAPE_DEFINITIONS.circle;
        const gradId = `grad-${element.id}`;

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
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg
              viewBox={def.viewBox}
              className="w-full h-full drop-shadow-sm"
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

      case 'input': {
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
            id={`input-${element.id}`}
            data-field-id={element.id}
            type={inputType}
            placeholder={placeholder}
            defaultValue=""
            required={element.formConfig?.required}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 px-3 cursor-text"
            style={{
              fontSize: s.fontSize ? `${s.fontSize}px` : '13px',
              fontFamily: s.fontFamily,
              color: s.color || '#ffffff',
            }}
            onClick={(e) => {
              if (editorMode === 'preview') {
                e.stopPropagation();
              }
            }}
          />
        );
      }

      case 'textarea': {
        const placeholder =
          element.formConfig?.placeholder || element.content || `Enter ${element.name || 'message'}...`;
        return (
          <textarea
            id={`input-${element.id}`}
            data-field-id={element.id}
            placeholder={placeholder}
            defaultValue=""
            required={element.formConfig?.required}
            rows={3}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 p-3 resize-none cursor-text"
            style={{
              fontSize: s.fontSize ? `${s.fontSize}px` : '13px',
              fontFamily: s.fontFamily,
              color: s.color || '#ffffff',
            }}
            onClick={(e) => {
              if (editorMode === 'preview') {
                e.stopPropagation();
              }
            }}
          />
        );
      }

      case 'select': {
        const options = element.formConfig?.options || ['Option 1', 'Option 2', 'Option 3'];
        return (
          <select
            id={`input-${element.id}`}
            data-field-id={element.id}
            required={element.formConfig?.required}
            className="w-full h-full bg-transparent border-0 outline-none text-inherit px-3 cursor-pointer"
            style={{
              fontSize: s.fontSize ? `${s.fontSize}px` : '13px',
              fontFamily: s.fontFamily,
              color: s.color || '#ffffff',
              backgroundColor: s.backgroundColor || '#131620',
            }}
            onClick={(e) => {
              if (editorMode === 'preview') {
                e.stopPropagation();
              }
            }}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt} className="bg-zinc-900 text-white">
                {opt}
              </option>
            ))}
          </select>
        );
      }

      case 'checkbox': {
        return (
          <label className="w-full h-full flex items-center gap-2.5 px-2 select-none cursor-pointer">
            <input
              id={`input-${element.id}`}
              data-field-id={element.id}
              type="checkbox"
              defaultChecked={element.formConfig?.checked}
              className="w-4 h-4 rounded text-indigo-600 bg-zinc-800 border-zinc-700 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              onClick={(e) => {
                if (editorMode === 'preview') {
                  e.stopPropagation();
                }
              }}
            />
            <span
              style={{
                fontSize: s.fontSize ? `${s.fontSize}px` : '12px',
                color: s.color || '#cbd5e1',
                fontFamily: s.fontFamily,
              }}
            >
              {element.content || 'I agree to the terms and privacy policy'}
            </span>
          </label>
        );
      }

      case 'accordion': {
        return <AccordionWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'carousel': {
        return <CarouselWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'video': {
        return <VideoWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'counter': {
        return <CounterWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'product-card': {
        return <ProductCardWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'lottie': {
        return <LottieWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'poll': {
        return <PollWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'guestbook': {
        return <GuestbookWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'reaction': {
        return <ReactionWidget element={element} isInteractive={editorMode === 'preview'} />;
      }

      case 'container': {
        // Smart input detection: if role is 'input' or name contains 'input', render an interactive input inside
        const isInputField =
          element.role === 'input' ||
          (element.name.toLowerCase().includes('input') && (!element.children || element.children.length === 0));

        if (isInputField) {
          const inputType =
            element.formConfig?.inputType ||
            (element.name.toLowerCase().includes('email')
              ? 'email'
              : element.name.toLowerCase().includes('password')
              ? 'password'
              : 'text');
          const placeholder =
            element.formConfig?.placeholder ||
            element.content ||
            (element.name.toLowerCase().includes('email')
              ? 'name@company.com'
              : element.name.toLowerCase().includes('name')
              ? 'Your Full Name'
              : 'Type here...');

          return (
            <input
              id={`input-${element.id}`}
              data-field-id={element.id}
              type={inputType}
              placeholder={placeholder}
              defaultValue=""
              className="w-full h-full bg-transparent border-0 outline-none text-inherit placeholder-zinc-500 px-3 cursor-text"
              style={{
                fontSize: s.fontSize ? `${s.fontSize}px` : '13px',
                fontFamily: s.fontFamily,
                color: s.color || '#ffffff',
              }}
              onClick={(e) => {
                if (editorMode === 'preview') {
                  e.stopPropagation();
                }
              }}
            />
          );
        }
        return null;
      }

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
          {selectedElementIds.length > 1 ? (
            <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-indigo-600/90 text-white text-[9px] font-medium shadow pointer-events-none select-none z-40 whitespace-nowrap">
              {element.name}
            </div>
          ) : (
            <ResizeHandles onResizeStart={handleResizeStart} />
          )}
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
          {/* Quick Action Test button on canvas for interactive elements */}
          {(element.type === 'button' || (b?.actionType && b.actionType !== 'none')) && !isDragging && !isResizing && (
            <div className="absolute -top-7 right-0 flex items-center gap-1 z-50 pointer-events-auto">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  executeElementAction(
                    element,
                    {
                      project,
                      activePage,
                      setActivePage,
                      updatePageSettings,
                      showToast,
                    },
                    e
                  );
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium shadow-lg shadow-black/50 border border-emerald-400/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="⚡ Click to test this action live (or Alt+Click)"
              >
                <span>⚡ Test Action</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
