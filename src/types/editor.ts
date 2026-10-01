export type SemanticRole =
  | 'none'
  | 'button'
  | 'link'
  | 'heading-h1'
  | 'heading-h2'
  | 'heading-h3'
  | 'text'
  | 'blockquote'
  | 'badge'
  | 'image'
  | 'input'
  | 'form'
  | 'container'
  | 'card'
  | 'navigation'
  | 'header'
  | 'footer'
  | 'main'
  | 'aside'
  | 'dialog';

export type ShapeKind =
  | 'rectangle'
  | 'rounded-rect'
  | 'circle'
  | 'pill'
  | 'triangle'
  | 'star'
  | 'diamond'
  | 'heart'
  | 'hexagon'
  | 'arrow-right';

export type ElementType = 'section' | 'container' | 'text' | 'button' | 'image' | 'divider' | 'shape';

export interface ElementStyles {
  // Fill & Colors
  backgroundColor?: string;
  gradient?: string; // e.g. 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
  color?: string;
  // Typography
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  // Borders & Corners
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
  // Shapes
  shapeKind?: ShapeKind;
  strokeColor?: string;
  strokeWidth?: number;
  // Layout & Effects
  opacity?: number;
  boxShadow?: string;
  padding?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  alt?: string;
  // Divider specific
  dividerHeight?: number;
  // Transitions & Animations
  transitionDuration?: number; // ms
  transitionTimingFunction?: string;
  hoverEffect?: 'none' | 'lift' | 'scale' | 'glow' | 'brighten';
  hoverShadow?: string;
  hoverScale?: number;
  hoverTranslateY?: number;
  rotation?: number; // degrees
}

export type ActionType =
  | 'none'
  | 'navigate-url'
  | 'navigate-page'
  | 'scroll-section'
  | 'scroll-top'
  | 'scroll-bottom'
  | 'back-to-previous'
  | 'copy-text'
  | 'open-modal'
  | 'toggle-visibility'
  | 'alert'
  | 'email-mailto'
  | 'tel-call'
  | 'open-sms'
  | 'download-file'
  | 'custom-js'
  | 'confetti'
  | 'play-sound'
  | 'toggle-dark-mode'
  | 'whatsapp'
  | 'share-page'
  | 'print-page'
  | 'launch-fullscreen'
  | 'vibrate-device'
  | 'reload-page'
  | 'discount-reveal'
  | 'submit-form'
  | 'accordion-toggle';

export type ButtonVariant =
  | 'filled'
  | 'gradient'
  | 'outline'
  | 'ghost'
  | 'glow'
  | '3d-push'
  | 'glass'
  | 'pill';

export type ButtonIconType =
  | 'none'
  | 'arrow-right'
  | 'arrow-left'
  | 'external-link'
  | 'sparkles'
  | 'download'
  | 'check'
  | 'heart'
  | 'star'
  | 'zap'
  | 'play'
  | 'cart'
  | 'phone'
  | 'mail'
  | 'send'
  | 'message-circle'
  | 'copy'
  | 'bell'
  | 'calendar'
  | 'gift'
  | 'share'
  | 'chevron-right'
  | 'lock';

export type ButtonIconPosition = 'left' | 'right';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ElementBehavior {
  actionType: ActionType;
  actionPayload?: string; // URL, pageId, section ID, or notification message
  targetBlank?: boolean;
  actionModalTitle?: string;
  actionModalBody?: string;
  actionTargetId?: string;
  buttonVariant?: ButtonVariant;
  buttonIcon?: ButtonIconType;
  buttonIconPosition?: ButtonIconPosition;
  buttonSize?: ButtonSize;
  hoverStyles?: {
    backgroundColor?: string;
    color?: string;
    opacity?: number;
    scale?: number;
    borderColor?: string;
    boxShadow?: string;
  };
}

// Layout Configuration for Section and Container
export type LayoutDirection = 'row' | 'column';
export type LayoutAlign = 'start' | 'center' | 'end';
export type LayoutJustify = 'start' | 'center' | 'end' | 'space-between' | 'space-around';

export interface ElementPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ContainerLayoutConfig {
  layoutType: 'absolute' | 'flex';
  direction: LayoutDirection;
  align?: LayoutAlign;
  alignItems?: LayoutAlign;
  justify?: LayoutJustify;
  justifyContent?: LayoutJustify;
  gap: number;
  padding: ElementPadding;
  wrap?: boolean;
  responsiveDirection?: Partial<Record<ViewportMode, LayoutDirection>>;
}

// User-Controlled Responsive Behaviour
export type ResponsivePositionMode = 'auto' | 'keep-position' | 'stack' | 'full-width' | 'hide';

export interface BreakpointResponsiveSettings {
  mode?: ResponsivePositionMode;
  width?: number | string;
  visible?: boolean;
  direction?: LayoutDirection; // flex direction override for containers/sections
}

export interface ElementResponsiveConfig {
  desktop?: BreakpointResponsiveSettings;
  laptop?: BreakpointResponsiveSettings;
  tablet?: BreakpointResponsiveSettings;
  mobile?: BreakpointResponsiveSettings;
  locked?: boolean; // When true: engine will not heuristically modify this element's position
}

export interface CanvasElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // Text content, button label, or image src
  imageUrl?: string;
  styles: ElementStyles;
  role: SemanticRole;
  behavior: ElementBehavior;
  locked: boolean;
  zIndex: number;
  // Hierarchy
  parentId?: string | null;
  children?: string[]; // IDs of children in display order
  // Container & Section layout
  layout?: ContainerLayoutConfig;
  // Responsive Configuration
  responsive?: ElementResponsiveConfig;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}

export interface ProjectState {
  version: number;
  id: string;
  name: string;
  activePageId: string;
  pages: Page[];
  updatedAt: string;
}

export type EditorMode = 'landing' | 'design' | 'preview';
export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
