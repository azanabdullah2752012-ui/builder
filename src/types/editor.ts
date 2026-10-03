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

export type ElementType =
  | 'section'
  | 'container'
  | 'text'
  | 'button'
  | 'image'
  | 'divider'
  | 'shape'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'form'
  | 'accordion'
  | 'carousel'
  | 'video'
  | 'counter'
  | 'product-card'
  | 'lottie';

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
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontStyle?: 'normal' | 'italic';
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
  overflow?: 'visible' | 'hidden' | 'auto' | 'scroll';
  cursor?: 'default' | 'pointer' | 'grab' | 'not-allowed';
  // Glassmorphism & Visual Filters
  backdropFilter?: string; // e.g. 'blur(16px) saturate(180%)'
  filter?: string; // e.g. 'brightness(1.1) contrast(1.05)'
  mixBlendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  // 2D/3D Transforms
  rotation?: number; // degrees
  scale?: number;
  skewX?: number; // degrees
  skewY?: number; // degrees
  // Keyframe Animations & Motion Engine
  animationName?:
    | 'none'
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'zoomIn'
    | 'zoomOut'
    | 'popIn'
    | 'bounce'
    | 'flipUp'
    | 'float'
    | 'pulse'
    | 'shimmer'
    | 'spin'
    | 'blurIn';
  animationDuration?: number; // seconds
  animationDelay?: number; // seconds
  animationIterationCount?: 'infinite' | '1' | '2' | '3';
  animationTimingFunction?: string;
  animationTrigger?: 'entrance' | 'scroll' | 'hover';
  scrollTriggerOffset?: number; // percentage (0 - 50%)
  // Divider specific
  dividerHeight?: number;
  // Transitions & Animations
  transitionDuration?: number; // ms
  transitionTimingFunction?: string;
  hoverEffect?: 'none' | 'lift' | 'scale' | 'glow' | 'brighten';
  hoverShadow?: string;
  hoverScale?: number;
  hoverTranslateY?: number;
  // Scrollytelling & Sticky Pinning
  isSticky?: boolean;
  stickyTop?: number; // px from viewport top, e.g. 0 or 20
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
  | 'accordion-toggle'
  | 'open-cart'
  | 'add-to-cart'
  | 'checkout-stripe';

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

export interface ElementStateStyles {
  backgroundColor?: string;
  color?: string;
  opacity?: number;
  scale?: number;
  translateY?: number;
  borderColor?: string;
  borderWidth?: number;
  boxShadow?: string;
  outlineColor?: string;
  outlineWidth?: number;
}

export interface ElementBehavior {
  actionType: ActionType;
  actionPayload?: string; // URL, pageId, section ID, or notification message
  targetBlank?: boolean;
  actionModalTitle?: string;
  actionModalBody?: string;
  actionTargetId?: string;
  actionSound?: 'pop' | 'success' | 'chime' | 'click' | 'bell';
  actionConfirm?: boolean;
  actionConfirmText?: string;
  actionTrigger?: 'click' | 'double-click' | 'hover';
  buttonVariant?: ButtonVariant;
  buttonIcon?: ButtonIconType;
  buttonIconPosition?: ButtonIconPosition;
  buttonSize?: ButtonSize;
  hoverStyles?: ElementStateStyles;
  activeStyles?: ElementStateStyles;
  focusStyles?: ElementStateStyles;
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

export interface FormElementConfig {
  inputType?: 'text' | 'email' | 'tel' | 'number' | 'password';
  fieldName?: string; // e.g. "email", "full_name", "message", "company"
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select dropdown
  checked?: boolean; // for checkbox
  formName?: string; // form group name, e.g. "Waitlist", "Contact Us", "Lead Capture"
  submitEndpoint?: string; // custom webhook or default supabase
  successMessage?: string;
  redirectUrl?: string;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  isOpen?: boolean;
}

export interface AccordionWidgetConfig {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export interface CarouselSlide {
  id: string;
  url: string;
  caption?: string;
  link?: string;
}

export interface CarouselWidgetConfig {
  slides: CarouselSlide[];
  autoplay?: boolean;
  interval?: number; // seconds
  showDots?: boolean;
  showArrows?: boolean;
}

export interface VideoWidgetConfig {
  url: string;
  videoType: 'youtube' | 'vimeo' | 'mp4';
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  posterUrl?: string;
}

export interface CounterWidgetConfig {
  startValue?: number;
  targetValue: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  duration?: number;
  decimals?: number;
}

export interface ProductConfig {
  productId?: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  badge?: string;
  imageUrl: string;
  buttonText?: string;
  checkoutUrl?: string;
  variants?: string[];
  selectedVariant?: string;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  quantity: number;
  selectedVariant?: string;
}

export interface LottieWidgetConfig {
  url: string;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  trigger?: 'autoplay' | 'hover' | 'scroll';
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
  // Interactive Forms & Widgets
  formConfig?: FormElementConfig;
  accordionConfig?: AccordionWidgetConfig;
  carouselConfig?: CarouselWidgetConfig;
  videoConfig?: VideoWidgetConfig;
  counterConfig?: CounterWidgetConfig;
  productConfig?: ProductConfig;
  lottieConfig?: LottieWidgetConfig;
}

export interface Page {
  id: string;
  name: string;
  slug: string;
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  showScrollProgress?: boolean;
  scrollProgressColor?: string;
}

export interface ProjectPublishConfig {
  publishedAt?: string;
  customDomain?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  favicon?: string;
  removeBranding?: boolean;
  webhookUrl?: string;
}

export interface ProjectState {
  version: number;
  id: string;
  name: string;
  slug?: string;
  isPublic?: boolean;
  publishedAt?: string;
  publishConfig?: ProjectPublishConfig;
  activePageId: string;
  pages: Page[];
  updatedAt: string;
}

export type CloudSyncStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

export interface ProjectSummary {
  id: string;
  name: string;
  slug?: string | null;
  thumbnail_url?: string | null;
  updatedAt: string;
  pageCount: number;
  elementCount: number;
  isPublic?: boolean;
  userId?: string | null;
}

export interface ProjectRevision {
  id: string | number;
  projectId: string;
  name: string;
  createdAt: string;
  data?: ProjectState;
}

export type EditorMode = 'landing' | 'design' | 'preview';
export type ViewportMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type StateVariant = 'default' | 'hover' | 'active' | 'focus';

export type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

// Figma-Style Canvas Guides & Measurement Types
export interface UserGuide {
  id: string;
  orientation: 'horizontal' | 'vertical';
  position: number;
}

export interface SmartSnapLine {
  type: 'vertical' | 'horizontal';
  position: number;
  label?: string;
  origin?: number;
  length?: number;
  color?: string;
}

export interface EqualSpacingIndicator {
  axis: 'x' | 'y';
  gap: number;
  start: number;
  end: number;
  centerSpan: number;
  label: string;
}

export interface DistanceMeasurement {
  targetId?: string;
  isCanvasBounds: boolean;
  selectedRect: { x: number; y: number; width: number; height: number };
  targetRect: { x: number; y: number; width: number; height: number };
  topGap: number | null;
  bottomGap: number | null;
  leftGap: number | null;
  rightGap: number | null;
}
