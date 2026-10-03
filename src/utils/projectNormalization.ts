import type { ProjectState, CanvasElement } from '../types/editor';
import { INITIAL_PROJECT } from '../constants/defaults';

// Helper to normalize legacy projects for backwards compatibility & crash prevention
export function normalizeProjectState(proj: ProjectState): ProjectState {
  if (!proj || !proj.pages || !Array.isArray(proj.pages) || proj.pages.length === 0) {
    return INITIAL_PROJECT;
  }

  return {
    ...proj,
    id: proj.id || 'proj_default_studio',
    slug: proj.slug || proj.id || 'pickle-site',
    isPublic: proj.isPublic ?? false,
    publishedAt: proj.publishedAt,
    publishConfig: proj.publishConfig || {
      seoTitle: proj.name,
      seoDescription: `Built with Pickle Studio by Pickle Corp - ${proj.name}`,
    },
    pages: proj.pages.map((p) => {
      const elements = Array.isArray(p.elements) ? p.elements : [];

      // Ensure every element has guaranteed styles, behavior, layout, parentId, and responsive defaults
      const normalizedElements: CanvasElement[] = elements.map((el) => {
        const isContainerType = el.type === 'section' || el.type === 'container';

        const safeStyles = el.styles && typeof el.styles === 'object' ? { ...el.styles } : {};
        const safeBehavior = {
          actionType: 'none' as const,
          ...(el.behavior && typeof el.behavior === 'object' ? el.behavior : {}),
        };

        return {
          ...el,
          x: typeof el.x === 'number' ? el.x : 40,
          y: typeof el.y === 'number' ? el.y : 40,
          width: typeof el.width === 'number' && el.width > 0 ? el.width : 200,
          height: typeof el.height === 'number' && el.height > 0 ? el.height : 50,
          locked: Boolean(el.locked),
          zIndex: typeof el.zIndex === 'number' ? el.zIndex : isContainerType ? 0 : 1,
          role: el.role || (el.type === 'button' ? 'button' : el.type === 'text' ? 'text' : isContainerType ? 'container' : 'none'),
          styles: safeStyles,
          behavior: safeBehavior,
          parentId: el.parentId ?? null,
          children: el.children ?? (isContainerType ? [] : undefined),
          layout: isContainerType
            ? el.layout || {
                layoutType: 'flex' as const,
                direction: 'column' as const,
                alignItems: 'start' as const,
                justifyContent: 'start' as const,
                gap: 16,
                padding: { top: 20, right: 20, bottom: 20, left: 20 },
                responsiveDirection: { tablet: 'column' as const, mobile: 'column' as const },
              }
            : undefined,
          responsive: el.responsive || {
            desktop: { mode: 'auto' as const },
            tablet: { mode: 'auto' as const, visible: true },
            mobile: { mode: 'auto' as const, visible: true },
            locked: false,
          },
        };
      });

      return {
        ...p,
        canvasWidth: typeof p.canvasWidth === 'number' ? p.canvasWidth : 1200,
        canvasHeight: typeof p.canvasHeight === 'number' ? p.canvasHeight : 800,
        elements: normalizedElements,
      };
    }),
  };
}
