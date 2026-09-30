import type { CanvasElement, ViewportMode, LayoutDirection } from '../types/editor';

export const VIEWPORT_CONFIG: Record<
  ViewportMode,
  { width: number; label: string; icon: string; margin: number }
> = {
  desktop: { width: 1200, label: 'Desktop', icon: 'monitor', margin: 40 },
  laptop: { width: 1024, label: 'Laptop', icon: 'laptop', margin: 32 },
  tablet: { width: 768, label: 'Tablet', icon: 'tablet', margin: 24 },
  mobile: { width: 390, label: 'Phone', icon: 'smartphone', margin: 16 },
};

export interface ResponsiveResult {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Computes responsive layout with explicit user overrides taking priority
 * over automatic heuristics, respecting responsive lock and section/container hierarchy.
 */
export function computeResponsiveLayout(
  elements: CanvasElement[],
  viewportMode: ViewportMode,
  baseWidth = 1200,
  baseHeight = 800
): ResponsiveResult {
  if (elements.length === 0) {
    return {
      elements,
      canvasWidth: baseWidth,
      canvasHeight: baseHeight,
    };
  }

  // On desktop, elements render with their desktop coordinates unless explicitly overridden
  if (viewportMode === 'desktop') {
    const desktopElements = elements.map((el) => {
      const desktopSetting = el.responsive?.desktop;
      if (desktopSetting?.mode === 'hide' || desktopSetting?.visible === false) {
        return {
          ...el,
          styles: { ...el.styles, opacity: 0 },
          width: 0,
          height: 0,
        };
      }
      if (desktopSetting?.width) {
        const customW =
          typeof desktopSetting.width === 'number'
            ? desktopSetting.width
            : Math.round(baseWidth * (parseFloat(desktopSetting.width) / 100));
        return { ...el, width: customW };
      }
      return el;
    });

    return {
      elements: desktopElements,
      canvasWidth: baseWidth,
      canvasHeight: baseHeight,
    };
  }

  const config = VIEWPORT_CONFIG[viewportMode];
  const targetWidth = config.width;
  const margin = config.margin;
  const contentWidth = targetWidth - margin * 2;
  const scaleRatio = targetWidth / baseWidth;

  // 1. Identify container-child relationships
  // Priority: Explicit el.parentId first; fallback to spatial geometry
  const parentMap = new Map<string, string>(); // childId -> parentId
  const containers = elements.filter(
    (el) =>
      el.type === 'section' ||
      el.type === 'container' ||
      el.role === 'container' ||
      el.role === 'card' ||
      el.role === 'navigation'
  );

  for (const el of elements) {
    if (el.parentId) {
      parentMap.set(el.id, el.parentId);
    } else {
      // Geometric fallback for legacy elements without explicit parentId
      for (const c of containers) {
        if (el.id === c.id) continue;
        const isInside =
          el.x >= c.x - 8 &&
          el.x + el.width <= c.x + c.width + 8 &&
          el.y >= c.y - 8 &&
          el.y + el.height <= c.y + c.height + 8;
        if (isInside) {
          parentMap.set(el.id, c.id);
          break;
        }
      }
    }
  }

  // 2. Separate into Root elements and Child elements
  const rootElements = elements.filter((el) => !parentMap.has(el.id));
  const childElements = elements.filter((el) => parentMap.has(el.id));

  // Sort roots by Y position, then X position
  const sortedRoots = [...rootElements].sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 40) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // 3. Group root elements into horizontal visual rows
  const rows: CanvasElement[][] = [];
  let currentRow: CanvasElement[] = [];
  let currentRowY = -1;

  for (const el of sortedRoots) {
    if (currentRow.length === 0) {
      currentRow.push(el);
      currentRowY = el.y;
    } else {
      if (Math.abs(el.y - currentRowY) <= 55) {
        currentRow.push(el);
      } else {
        rows.push(currentRow);
        currentRow = [el];
        currentRowY = el.y;
      }
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // 4. Reflow root elements based on device width & explicit user overrides
  const responsiveElementsMap = new Map<string, CanvasElement>();
  let runningY = margin;

  for (const row of rows) {
    const totalRowWidth = row.reduce((sum, item) => sum + item.width, 0);
    const hasMultipleItems = row.length > 1;

    for (const el of row) {
      const bpSetting = getBreakpointSetting(el, viewportMode);
      const isLocked = el.responsive?.locked === true;

      // Check if element is explicitly hidden at this breakpoint
      if (bpSetting.visible === false || bpSetting.mode === 'hide') {
        responsiveElementsMap.set(el.id, {
          ...el,
          styles: { ...el.styles, opacity: 0 },
          width: 0,
          height: 0,
        });
        continue;
      }

      // Check if element has RESPONSIVE LOCK or KEEP-POSITION mode
      if (isLocked || bpSetting.mode === 'keep-position') {
        let keptW = el.width;
        if (bpSetting.width) {
          keptW = parseWidthOverride(bpSetting.width, contentWidth);
        }
        // Preserve desktop coordinates, clamping if exceeding target width
        const keptX = Math.min(el.x, Math.max(margin, targetWidth - keptW - margin));
        const adapted = adaptElement(el, keptX, el.y, keptW, el.height, viewportMode);
        responsiveElementsMap.set(el.id, adapted);
        runningY = Math.max(runningY, el.y + el.height + 20);
        continue;
      }

      // Check explicit FULL-WIDTH mode
      if (bpSetting.mode === 'full-width') {
        const fw = contentWidth;
        const fh = el.type === 'image' ? Math.min(340, Math.round(fw * (el.height / (el.width || 1)))) : el.height;
        const adapted = adaptElement(el, margin, runningY, fw, fh, viewportMode);
        responsiveElementsMap.set(el.id, adapted);
        runningY += fh + (viewportMode === 'mobile' ? 16 : 24);
        continue;
      }

      // Check explicit STACK mode or automatic stacking heuristic
      const shouldAutoStack =
        bpSetting.mode === 'stack' ||
        (bpSetting.mode === 'auto' &&
          (viewportMode === 'mobile' ? hasMultipleItems : totalRowWidth + (row.length - 1) * 16 > contentWidth));

      if (shouldAutoStack) {
        let newWidth = el.width;
        let newHeight = el.height;
        const newX = margin;

        if (bpSetting.width) {
          newWidth = parseWidthOverride(bpSetting.width, contentWidth);
        } else if (
          el.type === 'section' ||
          el.type === 'container' ||
          el.type === 'image' ||
          el.role === 'card' ||
          el.role === 'container' ||
          el.role === 'navigation'
        ) {
          newWidth = contentWidth;
          if (el.type === 'image') {
            const aspect = el.height / (el.width || 1);
            newHeight = Math.min(340, Math.max(160, Math.round(contentWidth * aspect)));
          }
        } else if (el.type === 'text') {
          newWidth = contentWidth;
          newHeight = Math.round(el.height * 1.1);
        } else if (el.type === 'button') {
          newWidth = Math.min(el.width, contentWidth);
        } else if (el.type === 'divider') {
          newWidth = contentWidth;
        }

        const adaptedEl = adaptElement(el, newX, runningY, newWidth, newHeight, viewportMode);
        responsiveElementsMap.set(el.id, adaptedEl);

        const verticalGap = viewportMode === 'mobile' ? 16 : 20;
        runningY += newHeight + verticalGap;
      } else {
        // Fits horizontally or single item
        let newWidth = el.width;
        let newHeight = el.height;
        let newX = margin;

        if (bpSetting.width) {
          newWidth = parseWidthOverride(bpSetting.width, contentWidth);
          newX = Math.round(margin + (el.x - 40) * scaleRatio);
        } else if (
          el.type === 'section' ||
          el.type === 'container' ||
          el.role === 'navigation' ||
          el.type === 'divider' ||
          el.width >= 800
        ) {
          newWidth = contentWidth;
          newX = margin;
        } else {
          newWidth = Math.min(contentWidth, Math.round(el.width * scaleRatio));
          newX = Math.round(margin + (el.x - 40) * scaleRatio);
          newX = Math.max(margin, Math.min(targetWidth - newWidth - margin, newX));
        }

        const adaptedEl = adaptElement(el, newX, runningY, newWidth, newHeight, viewportMode);
        responsiveElementsMap.set(el.id, adaptedEl);
        runningY += newHeight + (viewportMode === 'mobile' ? 16 : 24);
      }
    }
  }

  // 5. Position child elements inside their adapted parent sections & containers
  // Group children by parentId
  const childrenByParent = new Map<string, CanvasElement[]>();
  for (const child of childElements) {
    const pId = parentMap.get(child.id)!;
    const list = childrenByParent.get(pId) || [];
    list.push(child);
    childrenByParent.set(pId, list);
  }

  for (const [parentId, childrenList] of childrenByParent.entries()) {
    const originalParent = elements.find((e) => e.id === parentId);
    const adaptedParent = responsiveElementsMap.get(parentId);

    if (!originalParent || !adaptedParent) {
      for (const child of childrenList) {
        responsiveElementsMap.set(child.id, child);
      }
      continue;
    }

    // Determine layout direction for this container/section at target breakpoint
    const layout = originalParent.layout;
    const isFlexLayout = layout?.layoutType === 'flex';

    // Check responsive direction override (e.g. desktop: Row -> mobile: Column)
    const effectiveDirection: LayoutDirection =
      originalParent.responsive?.[viewportMode]?.direction ||
      layout?.responsiveDirection?.[viewportMode] ||
      layout?.direction ||
      (viewportMode === 'mobile' ? 'column' : 'row');

    const padding = layout?.padding || { top: 20, right: 20, bottom: 20, left: 20 };
    const gap = layout?.gap !== undefined ? layout.gap : 16;

    if (isFlexLayout) {
      // Flex Layout model for Section / Container
      let childRunningX = adaptedParent.x + padding.left;
      let childRunningY = adaptedParent.y + padding.top;
      const innerAvailableW = Math.max(60, adaptedParent.width - padding.left - padding.right);

      // Sort children by originalParent.children array if defined, else by Y then X
      const orderedChildren = [...childrenList].sort((a, b) => {
        if (originalParent.children) {
          const idxA = originalParent.children.indexOf(a.id);
          const idxB = originalParent.children.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        }
        return a.y - b.y;
      });

      for (const child of orderedChildren) {
        const childSetting = getBreakpointSetting(child, viewportMode);
        if (childSetting.visible === false || childSetting.mode === 'hide') {
          responsiveElementsMap.set(child.id, {
            ...child,
            styles: { ...child.styles, opacity: 0 },
            width: 0,
            height: 0,
          });
          continue;
        }

        let childW = child.width;
        let childH = child.height;

        if (childSetting.width) {
          childW = parseWidthOverride(childSetting.width, innerAvailableW);
        } else if (effectiveDirection === 'column' || childSetting.mode === 'full-width') {
          if (child.type === 'container' || child.role === 'card' || child.type === 'text') {
            childW = innerAvailableW;
          } else {
            childW = Math.min(child.width, innerAvailableW);
          }
        } else {
          childW = Math.min(child.width, innerAvailableW);
        }

        if (effectiveDirection === 'column') {
          const adaptedChild = adaptElement(child, childRunningX, childRunningY, childW, childH, viewportMode);
          responsiveElementsMap.set(child.id, adaptedChild);
          childRunningY += childH + gap;
        } else {
          // Row direction
          const adaptedChild = adaptElement(child, childRunningX, childRunningY, childW, childH, viewportMode);
          responsiveElementsMap.set(child.id, adaptedChild);
          childRunningX += childW + gap;
        }
      }

      // Adjust parent height if children expand past original parent height
      const childrenBottom = childRunningY + padding.bottom - gap;
      if (effectiveDirection === 'column' && childrenBottom > adaptedParent.y + adaptedParent.height) {
        adaptedParent.height = childrenBottom - adaptedParent.y;
      }
    } else {
      // Absolute positioning inside parent
      for (const child of childrenList) {
        const childSetting = getBreakpointSetting(child, viewportMode);
        if (childSetting.visible === false || childSetting.mode === 'hide') {
          responsiveElementsMap.set(child.id, {
            ...child,
            styles: { ...child.styles, opacity: 0 },
            width: 0,
            height: 0,
          });
          continue;
        }

        const relXRatio = (child.x - originalParent.x) / (originalParent.width || 1);
        const relY = child.y - originalParent.y;

        let newChildX = adaptedParent.x + Math.round(relXRatio * adaptedParent.width);
        let newChildY = adaptedParent.y + relY;
        let newChildWidth = Math.min(adaptedParent.width - 24, child.width);

        if (childSetting.width) {
          newChildWidth = parseWidthOverride(childSetting.width, adaptedParent.width - 24);
        }

        // Clamp to parent
        if (newChildX + newChildWidth > adaptedParent.x + adaptedParent.width - 8) {
          newChildX = Math.max(adaptedParent.x + 8, adaptedParent.x + adaptedParent.width - newChildWidth - 8);
          newChildWidth = Math.min(newChildWidth, adaptedParent.width - 16);
        }

        const adaptedChild = adaptElement(child, newChildX, newChildY, newChildWidth, child.height, viewportMode);
        responsiveElementsMap.set(child.id, adaptedChild);
      }
    }
  }

  // 6. Assemble final adapted element list preserving original z-indices
  const finalElements = elements.map((original) => {
    return responsiveElementsMap.get(original.id) || original;
  });

  // Calculate dynamic canvas height with breathing room
  const maxBottom = finalElements.reduce((max, el) => Math.max(max, el.y + el.height), 0);
  const calculatedHeight = Math.max(baseHeight, maxBottom + 60);

  return {
    elements: finalElements,
    canvasWidth: targetWidth,
    canvasHeight: calculatedHeight,
  };
}

/**
 * Safely extracts breakpoint responsive setting with sensible defaults
 */
function getBreakpointSetting(el: CanvasElement, viewport: ViewportMode) {
  const resp = el.responsive;
  if (!resp) {
    return { mode: 'auto' as const, visible: true };
  }

  let setting = resp[viewport];
  if (!setting) {
    if (viewport === 'laptop' && resp.desktop) {
      setting = resp.desktop;
    } else {
      setting = { mode: 'auto', visible: true };
    }
  }

  return {
    mode: setting.mode || 'auto',
    width: setting.width,
    visible: setting.visible !== false,
    direction: setting.direction,
  };
}

/**
 * Parses numeric or percentage width overrides
 */
function parseWidthOverride(widthVal: number | string, containerWidth: number): number {
  if (typeof widthVal === 'number') {
    return Math.min(containerWidth, widthVal);
  }
  if (typeof widthVal === 'string' && widthVal.endsWith('%')) {
    const pct = parseFloat(widthVal) / 100;
    return Math.round(containerWidth * Math.min(1, Math.max(0.05, pct)));
  }
  const parsed = parseFloat(widthVal);
  return isNaN(parsed) ? containerWidth : Math.min(containerWidth, parsed);
}

/**
 * Adapt individual element styles (typography, padding, etc.) for target viewport
 */
function adaptElement(
  el: CanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: ViewportMode
): CanvasElement {
  const currentStyles = { ...el.styles };

  // Responsive Typography adjustments
  if (currentStyles.fontSize) {
    const origSize = currentStyles.fontSize;

    if (viewport === 'mobile') {
      if (origSize >= 40) {
        currentStyles.fontSize = Math.round(origSize * 0.65);
      } else if (origSize >= 30) {
        currentStyles.fontSize = Math.round(origSize * 0.75);
      } else if (origSize >= 20) {
        currentStyles.fontSize = Math.max(16, Math.round(origSize * 0.85));
      } else {
        currentStyles.fontSize = Math.max(12, origSize);
      }
    } else if (viewport === 'tablet') {
      if (origSize >= 40) {
        currentStyles.fontSize = Math.round(origSize * 0.82);
      } else if (origSize >= 30) {
        currentStyles.fontSize = Math.round(origSize * 0.88);
      }
    } else if (viewport === 'laptop') {
      if (origSize >= 40) {
        currentStyles.fontSize = Math.round(origSize * 0.94);
      }
    }
  }

  return {
    ...el,
    x,
    y,
    width,
    height,
    styles: currentStyles,
  };
}
