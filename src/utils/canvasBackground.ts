import React from 'react';
import type { Page, CanvasBackgroundPattern } from '../types/editor';

export interface CanvasPaletteItem {
  name: string;
  hex: string;
}

export interface CanvasGradientPreset {
  id: string;
  name: string;
  gradient: string;
  dark: boolean;
}

export interface CanvasPatternPreset {
  id: CanvasBackgroundPattern;
  name: string;
  iconName: string;
  description: string;
  cssBackground: (opacity: number) => {
    backgroundImage: string;
    backgroundSize?: string;
  };
}

export interface CanvasSizePreset {
  id: string;
  label: string;
  category: 'desktop' | 'tablet' | 'mobile' | 'social';
  width: number;
  height: number;
  icon: string;
  description: string;
}

// 1. Curated Anti-Slop Palette Categories
export const CANVAS_COLOR_CATEGORIES: {
  id: string;
  name: string;
  colors: CanvasPaletteItem[];
}[] = [
  {
    id: 'dark-luxury',
    name: 'Dark Luxury & Obsidian',
    colors: [
      { name: 'Deep Obsidian', hex: '#0c0e14' },
      { name: 'Rich Charcoal', hex: '#12151c' },
      { name: 'Forest Studio', hex: '#101510' },
      { name: 'Panel Dark', hex: '#1c241b' },
      { name: 'Midnight Navy', hex: '#0b1120' },
      { name: 'OLED Pitch', hex: '#050507' },
      { name: 'Deep Espresso', hex: '#1c1917' },
      { name: 'Slate Night', hex: '#1e2430' },
    ],
  },
  {
    id: 'editorial-light',
    name: 'Clean Editorial & Studio Light',
    colors: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Studio Slate', hex: '#f8fafc' },
      { name: 'Warm Linen', hex: '#F4F2EC' },
      { name: 'Cream Paper', hex: '#fbf9f5' },
      { name: 'Alabaster', hex: '#f5f5f0' },
      { name: 'Soft Sand', hex: '#f5f2eb' },
      { name: 'Celadon Frost', hex: '#f0fdf4' },
      { name: 'Ice White', hex: '#f1f5f9' },
    ],
  },
  {
    id: 'pickle-brand',
    name: 'Brand & Vibrant Accents',
    colors: [
      { name: 'Pickle Lime', hex: '#B8F36B' },
      { name: 'Biscuit Gold', hex: '#936639' },
      { name: 'Celadon Sage', hex: '#A4AC86' },
      { name: 'Olive Ink', hex: '#333D29' },
      { name: 'Electric Indigo', hex: '#4f46e5' },
      { name: 'Emerald Gem', hex: '#10b981' },
      { name: 'Solar Amber', hex: '#f59e0b' },
      { name: 'Crimson Ember', hex: '#ef4444' },
    ],
  },
  {
    id: 'pastels',
    name: 'Soft Tints & Pastels',
    colors: [
      { name: 'Linen Sand', hex: '#fef3c7' },
      { name: 'Sage Tint', hex: '#dcfce7' },
      { name: 'Sky Dew', hex: '#e0f2fe' },
      { name: 'Lavender Mist', hex: '#f3e8ff' },
      { name: 'Blush Rose', hex: '#ffe4e6' },
      { name: 'Peach Warmth', hex: '#ffedd5' },
      { name: 'Soft Mint', hex: '#ccfbf1' },
      { name: 'Muted Zinc', hex: '#e4e4e7' },
    ],
  },
];

// Flat list of all quick colors for simple picker
export const ALL_CANVAS_COLORS: string[] = CANVAS_COLOR_CATEGORIES.flatMap((c) =>
  c.colors.map((item) => item.hex)
);

// 2. Curated Anti-Slop Gradients
export const CANVAS_GRADIENTS: CanvasGradientPreset[] = [
  {
    id: 'obsidian-void',
    name: 'Obsidian Void',
    gradient: 'linear-gradient(135deg, #090a0f 0%, #151824 100%)',
    dark: true,
  },
  {
    id: 'pickle-forest',
    name: 'Deep Forest Studio',
    gradient: 'linear-gradient(180deg, #101510 0%, #1c241b 100%)',
    dark: true,
  },
  {
    id: 'midnight-emerald',
    name: 'Midnight Emerald',
    gradient: 'linear-gradient(135deg, #061712 0%, #0d281e 50%, #16382c 100%)',
    dark: true,
  },
  {
    id: 'warm-linen-fade',
    name: 'Warm Studio Linen',
    gradient: 'linear-gradient(180deg, #fbf9f5 0%, #f3efe6 100%)',
    dark: false,
  },
  {
    id: 'editorial-fog',
    name: 'Editorial Fog',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    dark: false,
  },
  {
    id: 'slate-monolith',
    name: 'Slate Monolith',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    dark: true,
  },
  {
    id: 'titanium-frost',
    name: 'Titanium Frost',
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    dark: false,
  },
  {
    id: 'cyber-abyss',
    name: 'Cyber Abyss',
    gradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)',
    dark: true,
  },
  {
    id: 'champagne-silk',
    name: 'Champagne Silk',
    gradient: 'linear-gradient(135deg, #faf5ef 0%, #f5ece1 100%)',
    dark: false,
  },
  {
    id: 'charcoal-minimal',
    name: 'Charcoal Minimal',
    gradient: 'linear-gradient(180deg, #12141a 0%, #1a1d26 100%)',
    dark: true,
  },
  {
    id: 'sage-dusk',
    name: 'Sage Dusk',
    gradient: 'linear-gradient(135deg, #141f18 0%, #1e2e24 100%)',
    dark: true,
  },
  {
    id: 'warm-sandstone',
    name: 'Warm Sandstone',
    gradient: 'linear-gradient(180deg, #fefae0 0%, #dda15e 100%)',
    dark: false,
  },
  {
    id: 'aurora-subtle',
    name: 'Aurora Dark Subtle',
    gradient: 'linear-gradient(135deg, #0c1a1a 0%, #092c28 50%, #13241b 100%)',
    dark: true,
  },
  {
    id: 'velvet-night',
    name: 'Velvet Night',
    gradient: 'linear-gradient(135deg, #0d0f18 0%, #161a29 100%)',
    dark: true,
  },
  {
    id: 'morning-mist',
    name: 'Morning Mist',
    gradient: 'linear-gradient(180deg, #f0fdfa 0%, #e0f2fe 100%)',
    dark: false,
  },
  {
    id: 'studio-spotlight',
    name: 'Studio Spotlight',
    gradient: 'radial-gradient(circle at 50% 30%, #1e2430 0%, #0c0e14 100%)',
    dark: true,
  },
];

// 3. Canvas Background Patterns
export const CANVAS_PATTERNS: CanvasPatternPreset[] = [
  {
    id: 'none',
    name: 'Solid / Flat',
    iconName: 'ban',
    description: 'Clean uniform surface without texture',
    cssBackground: () => ({
      backgroundImage: 'none',
    }),
  },
  {
    id: 'dots',
    name: 'Matrix Dots',
    iconName: 'grip',
    description: 'Figma-style millimeter dot matrix',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `radial-gradient(circle, rgba(140, 150, 160, ${alpha * 0.9}) 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
      };
    },
  },
  {
    id: 'grid',
    name: 'Architectural Grid',
    iconName: 'grid',
    description: 'Precision architectural layout grid lines',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `linear-gradient(to right, rgba(140, 150, 160, ${alpha * 0.6}) 1px, transparent 1px), linear-gradient(to bottom, rgba(140, 150, 160, ${alpha * 0.6}) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      };
    },
  },
  {
    id: 'diagonal',
    name: 'Diagonal Hatch',
    iconName: 'slash',
    description: 'Fine 45-degree drafting lines',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `repeating-linear-gradient(45deg, rgba(140, 150, 160, ${alpha * 0.5}), rgba(140, 150, 160, ${alpha * 0.5}) 1px, transparent 1px, transparent 16px)`,
      };
    },
  },
  {
    id: 'mesh',
    name: 'Ambient Studio Mesh',
    iconName: 'sparkles',
    description: 'Soft directional studio lighting spots',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `radial-gradient(at 0% 0%, rgba(184, 243, 107, ${alpha * 0.8}) 0px, transparent 55%), radial-gradient(at 100% 100%, rgba(99, 102, 241, ${alpha * 0.8}) 0px, transparent 55%)`,
      };
    },
  },
  {
    id: 'lines',
    name: 'Horizontal Rules',
    iconName: 'align-justify',
    description: 'Subtle notebook ledger horizontal rulings',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `linear-gradient(to bottom, rgba(140, 150, 160, ${alpha * 0.5}) 1px, transparent 1px)`,
        backgroundSize: '100% 28px',
      };
    },
  },
  {
    id: 'glow',
    name: 'Top Spotlight Glow',
    iconName: 'sun',
    description: 'Soft top-edge lighting halo',
    cssBackground: (opacity) => {
      const alpha = Math.min(1, Math.max(0.04, opacity));
      return {
        backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(184, 243, 107, ${alpha * 0.9}) 0%, transparent 70%)`,
      };
    },
  },
];

// 4. Curated Aesthetic Canvas Images
export const CURATED_CANVAS_IMAGES: {
  label: string;
  url: string;
  tag: string;
}[] = [
  {
    label: 'Dark Obsidian Geometry',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    tag: 'Abstract 3D',
  },
  {
    label: 'Warm Linen Paper',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    tag: 'Texture',
  },
  {
    label: 'Minimal Concrete Studio',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
    tag: 'Architectural',
  },
  {
    label: 'Moody Forest Mist',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
    tag: 'Nature',
  },
  {
    label: 'Ambient Studio Lights',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
    tag: 'Atmosphere',
  },
  {
    label: 'Cyber Fluid Waves',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80',
    tag: 'Fluid Dark',
  },
];

// 5. Canvas Size Presets
export const CANVAS_SIZE_PRESETS: CanvasSizePreset[] = [
  {
    id: 'desktop-standard',
    label: 'Standard Web (1200×800)',
    category: 'desktop',
    width: 1200,
    height: 800,
    icon: 'monitor',
    description: 'Classic desktop layout standard',
  },
  {
    id: 'desktop-hd',
    label: 'Figma HD (1440×900)',
    category: 'desktop',
    width: 1440,
    height: 900,
    icon: 'layout',
    description: 'Modern Figma standard artboard size',
  },
  {
    id: 'desktop-cinema',
    label: 'Cinema Full HD (1920×1080)',
    category: 'desktop',
    width: 1920,
    height: 1080,
    icon: 'tv',
    description: 'Widescreen presentation standard',
  },
  {
    id: 'laptop-compact',
    label: 'Compact Laptop (1280×800)',
    category: 'desktop',
    width: 1280,
    height: 800,
    icon: 'laptop',
    description: 'MacBook Air & 13" laptop screens',
  },
  {
    id: 'tablet-ipad',
    label: 'iPad Tablet (768×1024)',
    category: 'tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    description: 'Tablet portrait view',
  },
  {
    id: 'mobile-phone',
    label: 'iPhone Mobile (390×844)',
    category: 'mobile',
    width: 390,
    height: 844,
    icon: 'smartphone',
    description: 'Modern smartphone portrait view',
  },
  {
    id: 'social-square',
    label: 'Social Square (1080×1080)',
    category: 'social',
    width: 1080,
    height: 1080,
    icon: 'instagram',
    description: 'Square card & Instagram post',
  },
  {
    id: 'long-landing',
    label: 'Long Landing Page (1440×2400)',
    category: 'desktop',
    width: 1440,
    height: 2400,
    icon: 'scroll',
    description: 'High-converting multi-section landing page',
  },
];

// 6. Canvas Frame Presets
export const CANVAS_BORDER_RADIUS_PRESETS = [
  { label: 'Sharp (0px)', value: 0 },
  { label: 'Subtle (8px)', value: 8 },
  { label: 'Modern (16px)', value: 16 },
  { label: 'Smooth (24px)', value: 24 },
  { label: 'Device (44px)', value: 44 },
];

export const CANVAS_SHADOW_PRESETS = [
  {
    id: 'studio',
    label: 'Studio Elevation',
    shadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
  },
  {
    id: 'deep',
    label: 'Deep Obsidian',
    shadow: '0 35px 80px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.12)',
  },
  {
    id: 'subtle',
    label: 'Subtle Clean',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'neon',
    label: 'Pickle Lime Glow',
    shadow: '0 20px 50px -10px rgba(184, 243, 107, 0.2), 0 0 0 1px rgba(184, 243, 107, 0.35)',
  },
  {
    id: 'none',
    label: 'Flat / None',
    shadow: 'none',
  },
];

/**
 * Returns React inline CSS properties for the base canvas surface
 */
export function getCanvasSurfaceStyles(page: Page): React.CSSProperties {
  const styles: React.CSSProperties = {};

  const isGrad =
    page.backgroundGradient ||
    (page.backgroundColor &&
      (page.backgroundColor.startsWith('linear-gradient') ||
        page.backgroundColor.startsWith('radial-gradient')));

  if (page.backgroundImage) {
    styles.backgroundImage = `url("${page.backgroundImage}")`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center center';
    styles.backgroundColor = page.backgroundColor || '#0c0e14';
  } else if (isGrad) {
    styles.backgroundImage = page.backgroundGradient || page.backgroundColor;
  } else {
    styles.backgroundColor = page.backgroundColor || '#ffffff';
  }

  return styles;
}

/**
 * Returns React inline CSS properties for the pattern overlay div
 */
export function getCanvasPatternOverlayStyle(page: Page): React.CSSProperties | null {
  if (!page.backgroundPattern || page.backgroundPattern === 'none') {
    return null;
  }

  const preset = CANVAS_PATTERNS.find((p) => p.id === page.backgroundPattern);
  if (!preset) return null;

  const opacity = typeof page.patternOpacity === 'number' ? page.patternOpacity : 0.2;
  const patternCss = preset.cssBackground(opacity);

  return {
    ...patternCss,
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
  };
}

/**
 * Generates CSS rules string for export HTML
 */
export function getCanvasExportCss(page: Page): string {
  let css = '';
  const isGrad =
    page.backgroundGradient ||
    (page.backgroundColor &&
      (page.backgroundColor.startsWith('linear-gradient') ||
        page.backgroundColor.startsWith('radial-gradient')));

  if (page.backgroundImage) {
    css += `    background-image: url("${page.backgroundImage}");\n`;
    css += `    background-size: cover;\n`;
    css += `    background-position: center center;\n`;
    css += `    background-color: ${page.backgroundColor || '#0c0e14'};\n`;
  } else if (isGrad) {
    css += `    background-image: ${page.backgroundGradient || page.backgroundColor};\n`;
  } else {
    css += `    background-color: ${page.backgroundColor || '#ffffff'};\n`;
  }

  if (typeof page.canvasBorderRadius === 'number') {
    css += `    border-radius: ${page.canvasBorderRadius}px;\n`;
  }

  if (page.canvasShadow) {
    css += `    box-shadow: ${page.canvasShadow};\n`;
  }

  return css;
}
