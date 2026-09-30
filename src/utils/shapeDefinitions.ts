import type { ShapeKind } from '../types/editor';

export interface ShapeDefinition {
  kind: ShapeKind;
  label: string;
  category: 'Geometric' | 'Symbols' | 'Badges';
  defaultColor: string;
  defaultBorderColor?: string;
  viewBox: string;
}

export const SHAPE_DEFINITIONS: Record<ShapeKind, ShapeDefinition> = {
  rectangle: {
    kind: 'rectangle',
    label: 'Rectangle',
    category: 'Geometric',
    defaultColor: '#3b82f6',
    viewBox: '0 0 100 100',
  },
  'rounded-rect': {
    kind: 'rounded-rect',
    label: 'Rounded Box',
    category: 'Geometric',
    defaultColor: '#6366f1',
    viewBox: '0 0 100 100',
  },
  circle: {
    kind: 'circle',
    label: 'Circle',
    category: 'Geometric',
    defaultColor: '#8b5cf6',
    viewBox: '0 0 100 100',
  },
  pill: {
    kind: 'pill',
    label: 'Pill / Capsule',
    category: 'Badges',
    defaultColor: '#10b981',
    viewBox: '0 0 160 80',
  },
  triangle: {
    kind: 'triangle',
    label: 'Triangle',
    category: 'Geometric',
    defaultColor: '#f59e0b',
    viewBox: '0 0 100 100',
  },
  star: {
    kind: 'star',
    label: '5-Point Star',
    category: 'Symbols',
    defaultColor: '#eab308',
    viewBox: '0 0 100 100',
  },
  diamond: {
    kind: 'diamond',
    label: 'Diamond / Rhombus',
    category: 'Geometric',
    defaultColor: '#06b6d4',
    viewBox: '0 0 100 100',
  },
  heart: {
    kind: 'heart',
    label: 'Heart',
    category: 'Symbols',
    defaultColor: '#ec4899',
    viewBox: '0 0 100 100',
  },
  hexagon: {
    kind: 'hexagon',
    label: 'Hexagon',
    category: 'Geometric',
    defaultColor: '#14b8a6',
    viewBox: '0 0 100 100',
  },
  'arrow-right': {
    kind: 'arrow-right',
    label: 'Arrow Right',
    category: 'Symbols',
    defaultColor: '#f97316',
    viewBox: '0 0 100 100',
  },
};

/**
 * Returns the SVG element representation for a given shape.
 */
export function getShapeSvgNode(
  kind: ShapeKind,
  fill: string,
  stroke?: string,
  strokeWidth = 0
) {
  const commonProps = {
    fill,
    stroke: stroke || 'none',
    strokeWidth,
    vectorEffect: 'non-scaling-stroke',
  };

  switch (kind) {
    case 'rectangle':
      return { tag: 'rect', props: { ...commonProps, x: 2, y: 2, width: 96, height: 96 } };
    case 'rounded-rect':
      return { tag: 'rect', props: { ...commonProps, x: 2, y: 2, width: 96, height: 96, rx: 16 } };
    case 'circle':
      return { tag: 'circle', props: { ...commonProps, cx: 50, cy: 50, r: 47 } };
    case 'pill':
      return { tag: 'rect', props: { ...commonProps, x: 2, y: 4, width: 156, height: 72, rx: 36 } };
    case 'triangle':
      return { tag: 'polygon', props: { ...commonProps, points: '50,6 94,94 6,94' } };
    case 'star':
      return {
        tag: 'polygon',
        props: {
          ...commonProps,
          points: '50,6 64,36 97,36 70,57 80,90 50,69 20,90 30,57 3,36 36,36',
        },
      };
    case 'diamond':
      return { tag: 'polygon', props: { ...commonProps, points: '50,4 96,50 50,96 4,50' } };
    case 'heart':
      return {
        tag: 'path',
        props: {
          ...commonProps,
          d: 'M50,88 C20,62 6,48 6,30 C6,15 17,6 31,6 C40,6 47,11 50,18 C53,11 60,6 69,6 C83,6 94,15 94,30 C94,48 80,62 50,88 Z',
        },
      };
    case 'hexagon':
      return {
        tag: 'polygon',
        props: {
          ...commonProps,
          points: '50,5 93,28 93,72 50,95 7,72 7,28',
        },
      };
    case 'arrow-right':
      return {
        tag: 'path',
        props: {
          ...commonProps,
          d: 'M8,36 L58,36 L58,16 L94,50 L58,84 L58,64 L8,64 Z',
        },
      };
    default:
      return { tag: 'rect', props: { ...commonProps, x: 2, y: 2, width: 96, height: 96 } };
  }
}
