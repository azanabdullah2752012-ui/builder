import type { ProjectState } from '../types/editor';
import { INITIAL_PROJECT } from '../constants/defaults';

// Helper to normalize legacy projects for backwards compatibility
export function normalizeProjectState(proj: ProjectState): ProjectState {
  if (!proj || !proj.pages) return INITIAL_PROJECT;

  return {
    ...proj,
    pages: proj.pages.map((p) => {
      const elements = p.elements || [];

      // Ensure every element has parentId, layout, and responsive defaults
      const normalizedElements = elements.map((el) => {
        const isContainerType = el.type === 'section' || el.type === 'container';

        return {
          ...el,
          height: el.height,
          y: el.y,
          locked: el.locked,
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
        elements: normalizedElements,
      };
    }),
  };
}
