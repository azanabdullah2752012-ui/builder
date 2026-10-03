import type { CanvasElement, ViewportMode } from '../types/editor';

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
  baseHeight = 800,
  customViewportWidth?: number
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
  const targetWidth = customViewportWidth
    ? Math.min(baseWidth, Math.max(320, customViewportWidth))
    : config.width;
  let margin = config.margin;
  if (targetWidth <= 420) margin = Math.min(margin, 16);
  const contentWidth = Math.max(100, targetWidth - margin * 2);
  const scaleRatio = targetWidth / baseWidth;

  // 1. Identify container-child relationships
  const parentMap = new Map<string, string>(); // childId -> parentId
  const childrenMap = new Map<string, CanvasElement[]>(); // parentId -> child elements
  const containers = elements.filter(
    (el) =>
      el.type === 'section' ||
      el.type === 'container' ||
      el.role === 'container' ||
      el.role === 'card' ||
      el.role === 'navigation'
  );

  for (const el of elements) {
    let pId = el.parentId;
    if (!pId) {
      // Geometric fallback for legacy elements without explicit parentId
      for (const c of containers) {
        if (el.id === c.id) continue;
        const isInside =
          el.x >= c.x - 8 &&
          el.x + el.width <= c.x + c.width + 8 &&
          el.y >= c.y - 8 &&
          el.y + el.height <= c.y + c.height + 8;
        if (isInside) {
          pId = c.id;
          break;
        }
      }
    }
    if (pId) {
      parentMap.set(el.id, pId);
      const list = childrenMap.get(pId) || [];
      list.push(el);
      childrenMap.set(pId, list);
    }
  }

  const rootElements = elements.filter((el) => !parentMap.has(el.id));
  const responsiveElementsMap = new Map<string, CanvasElement>();

  // 2. Recursive layout function for containers and their child trees
  function layoutContainer(
    container: CanvasElement,
    startX: number,
    startY: number,
    availableW: number
  ): number {
    const bpSetting = getBreakpointSetting(container, viewportMode);
    const isLocked = container.responsive?.locked === true;

    // Check if container is explicitly hidden
    if (bpSetting.visible === false || bpSetting.mode === 'hide') {
      responsiveElementsMap.set(container.id, {
        ...container,
        styles: { ...container.styles, opacity: 0 },
        width: 0,
        height: 0,
        x: startX,
        y: startY,
      });
      const desc = childrenMap.get(container.id) || [];
      for (const d of desc) {
        responsiveElementsMap.set(d.id, { ...d, styles: { ...d.styles, opacity: 0 }, width: 0, height: 0 });
      }
      return 0;
    }

    // Check if container has RESPONSIVE LOCK or KEEP-POSITION
    if (isLocked || bpSetting.mode === 'keep-position') {
      let keptW = container.width;
      if (bpSetting.width) keptW = parseWidthOverride(bpSetting.width, availableW);
      const keptX = Math.min(container.x, Math.max(margin, targetWidth - keptW - margin));
      const adapted = adaptElement(container, keptX, container.y, keptW, container.height, viewportMode);
      responsiveElementsMap.set(container.id, adapted);
      return container.height;
    }

    // Determine container width
    let containerW = availableW;
    if (bpSetting.width) {
      containerW = parseWidthOverride(bpSetting.width, availableW);
    } else if (bpSetting.mode === 'full-width') {
      containerW = availableW;
    } else if (container.width >= 800 || container.type === 'section' || container.role === 'navigation') {
      containerW = availableW;
    } else {
      containerW = Math.min(availableW, Math.round(container.width * scaleRatio));
    }

    const children = childrenMap.get(container.id) || [];
    const layout = container.layout;
    const padding = layout?.padding || { top: 20, right: 20, bottom: 20, left: 20 };
    const gap = layout?.gap !== undefined ? layout.gap : 16;
    const innerW = Math.max(60, containerW - padding.left - padding.right);

    // If container has no children, return its height directly
    if (children.length === 0) {
      const adapted = adaptElement(container, startX, startY, containerW, container.height, viewportMode);
      responsiveElementsMap.set(container.id, adapted);
      return container.height;
    }

    const effectiveDir =
      container.responsive?.[viewportMode]?.direction ||
      layout?.responsiveDirection?.[viewportMode] ||
      layout?.direction ||
      (viewportMode === 'mobile' ? 'column' : 'auto');

    let runningChildY = startY + padding.top;
    let maxChildBottom = runningChildY;

    // Sort children by explicit index if present, else visual Y then X
    const sortedChildren = [...children].sort((a, b) => {
      if (container.children) {
        const idxA = container.children.indexOf(a.id);
        const idxB = container.children.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      }
      if (Math.abs(a.y - b.y) <= 30) return a.x - b.x;
      return a.y - b.y;
    });

    const isNavbar = container.role === 'navigation' || container.name.toLowerCase().includes('nav');

    // On mobile, if navbar: keep brand and primary action, hide desktop menu links to avoid collision
    if (isNavbar && viewportMode === 'mobile') {
      let navRunningX = startX + padding.left;
      for (const ch of sortedChildren) {
        const chBp = getBreakpointSetting(ch, viewportMode);
        const isNavLink = ch.name.toLowerCase().includes('nav -') || ch.role === 'link';
        if (isNavLink && chBp.mode === 'auto') {
          responsiveElementsMap.set(ch.id, { ...ch, styles: { ...ch.styles, opacity: 0 }, width: 0, height: 0 });
          continue;
        }
        if (chBp.visible === false || chBp.mode === 'hide') {
          responsiveElementsMap.set(ch.id, { ...ch, styles: { ...ch.styles, opacity: 0 }, width: 0, height: 0 });
          continue;
        }
        const chW = Math.min(innerW, ch.width);
        const chH = ch.height;
        const adapted = adaptElement(ch, navRunningX, startY + (container.height - chH) / 2, chW, chH, viewportMode);
        responsiveElementsMap.set(ch.id, adapted);
        navRunningX += chW + 12;
      }
      const adapted = adaptElement(container, startX, startY, containerW, Math.max(container.height, 60), viewportMode);
      responsiveElementsMap.set(container.id, adapted);
      return adapted.height;
    }

    // Determine if child items should stack vertically
    const shouldStackAll =
      effectiveDir === 'column' ||
      viewportMode === 'mobile' ||
      sortedChildren.some((c) => c.type === 'container' || c.role === 'card' || c.width > innerW * 0.6);

    if (shouldStackAll) {
      // Stack children vertically
      for (const ch of sortedChildren) {
        const chBp = getBreakpointSetting(ch, viewportMode);
        if (chBp.visible === false || chBp.mode === 'hide') {
          responsiveElementsMap.set(ch.id, { ...ch, styles: { ...ch.styles, opacity: 0 }, width: 0, height: 0 });
          continue;
        }

        const childX = startX + padding.left;
        let childW = innerW;
        if (chBp.width) {
          childW = parseWidthOverride(chBp.width, innerW);
        } else if (ch.type === 'button') {
          childW = Math.min(innerW, Math.max(ch.width, 160));
        } else if (ch.type === 'image') {
          childW = innerW;
        } else if (ch.type === 'container' || ch.role === 'card' || ch.type === 'section') {
          childW = innerW;
        } else {
          childW = Math.min(innerW, ch.width);
        }

        // If this child is itself a container with nested children, recurse!
        if (childrenMap.has(ch.id)) {
          const nestedHeight = layoutContainer(ch, childX, runningChildY, childW);
          runningChildY += nestedHeight + gap;
        } else {
          let childH = ch.height;
          if (ch.type === 'image') {
            const aspect = ch.height / (ch.width || 1);
            childH = Math.min(360, Math.max(120, Math.round(childW * aspect)));
          }
          const adapted = adaptElement(ch, childX, runningChildY, childW, childH, viewportMode);
          responsiveElementsMap.set(ch.id, adapted);
          runningChildY += childH + gap;
        }
      }
      maxChildBottom = runningChildY - gap + padding.bottom;
    } else {
      // Side-by-side or multi-column layout with wrapping (e.g. tablet rows)
      let rowRunningX = startX + padding.left;
      let rowMaxH = 0;

      for (const ch of sortedChildren) {
        const chBp = getBreakpointSetting(ch, viewportMode);
        if (chBp.visible === false || chBp.mode === 'hide') {
          responsiveElementsMap.set(ch.id, { ...ch, styles: { ...ch.styles, opacity: 0 }, width: 0, height: 0 });
          continue;
        }

        const chScaleW = Math.min(innerW, Math.round(ch.width * scaleRatio));
        if (rowRunningX + chScaleW > startX + containerW - padding.right && rowRunningX > startX + padding.left) {
          runningChildY += rowMaxH + gap;
          rowRunningX = startX + padding.left;
          rowMaxH = 0;
        }

        const childX = rowRunningX;
        let childW = chScaleW;

        if (childrenMap.has(ch.id)) {
          const nestedHeight = layoutContainer(ch, childX, runningChildY, childW);
          rowMaxH = Math.max(rowMaxH, nestedHeight);
          rowRunningX += childW + gap;
        } else {
          const adapted = adaptElement(ch, childX, runningChildY, childW, ch.height, viewportMode);
          responsiveElementsMap.set(ch.id, adapted);
          rowMaxH = Math.max(rowMaxH, ch.height);
          rowRunningX += childW + gap;
        }
      }
      runningChildY += rowMaxH;
      maxChildBottom = runningChildY + padding.bottom;
    }

    const finalContainerHeight = Math.max(container.height, maxChildBottom - startY);
    const adapted = adaptElement(container, startX, startY, containerW, finalContainerHeight, viewportMode);
    responsiveElementsMap.set(container.id, adapted);
    return finalContainerHeight;
  }

  // 3. Layout Root elements top-to-bottom
  const sortedRoots = [...rootElements].sort((a, b) => a.y - b.y);

  let currentY = margin;
  for (const root of sortedRoots) {
    const isLocked = root.responsive?.locked === true;
    const bpSetting = getBreakpointSetting(root, viewportMode);

    if (bpSetting.visible === false || bpSetting.mode === 'hide') {
      responsiveElementsMap.set(root.id, { ...root, styles: { ...root.styles, opacity: 0 }, width: 0, height: 0 });
      continue;
    }

    if (isLocked || bpSetting.mode === 'keep-position') {
      let keptW = root.width;
      if (bpSetting.width) keptW = parseWidthOverride(bpSetting.width, contentWidth);
      const keptX = Math.min(root.x, Math.max(margin, targetWidth - keptW - margin));
      const adapted = adaptElement(root, keptX, root.y, keptW, root.height, viewportMode);
      responsiveElementsMap.set(root.id, adapted);
      currentY = Math.max(currentY, root.y + root.height + 20);
      continue;
    }

    const height = layoutContainer(root, margin, currentY, contentWidth);
    currentY += height + (viewportMode === 'mobile' ? 20 : 28);
  }

  // 4. Assemble final adapted element list preserving original z-indices
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
