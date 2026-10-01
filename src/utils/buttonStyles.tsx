import React from 'react';
import type { ElementBehavior, ElementStyles, ButtonVariant, ButtonIconType } from '../types/editor';
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Download,
  Check,
  Heart,
  Star,
  Zap,
  Play,
  ShoppingBag,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Copy,
  Bell,
  Calendar,
  Gift,
  Share2,
  ChevronRight,
  Lock,
} from 'lucide-react';

export interface ButtonVariantMeta {
  value: ButtonVariant;
  label: string;
  description: string;
  badge: string;
}

export const BUTTON_VARIANTS: ButtonVariantMeta[] = [
  { value: 'filled', label: 'Filled Solid', description: 'High-contrast vibrant solid with smooth shadow', badge: 'Classic' },
  { value: 'gradient', label: 'Luminous Gradient', description: 'Vibrant modern multi-stop gradient glow', badge: 'Popular' },
  { value: 'outline', label: 'Border Outline', description: 'Sleek transparent background with crisp border', badge: 'Minimal' },
  { value: 'ghost', label: 'Ghost Tint', description: 'Border-free transparent button with soft hover', badge: 'Clean' },
  { value: 'glow', label: 'Cyber Glow', description: 'Neon border with intense radiant aura drop shadow', badge: 'Radiant' },
  { value: '3d-push', label: '3D Tactile Push', description: 'Dimensional button with press-down depth', badge: 'Tactile' },
  { value: 'glass', label: 'Frosted Glass', description: 'Backdrop blur glassmorphism with subtle border sheen', badge: 'Modern' },
  { value: 'pill', label: 'Pill Capsule', description: 'Ultra-smooth pill shape with rounded ends', badge: 'Capsule' },
];

export interface ButtonIconMeta {
  value: ButtonIconType;
  label: string;
  category: string;
}

export const BUTTON_ICONS: ButtonIconMeta[] = [
  { value: 'none', label: 'No Icon', category: 'None' },
  { value: 'arrow-right', label: 'Arrow Right (→)', category: 'Arrows' },
  { value: 'arrow-left', label: 'Arrow Left (←)', category: 'Arrows' },
  { value: 'chevron-right', label: 'Chevron Right (›)', category: 'Arrows' },
  { value: 'external-link', label: 'External Link (↗)', category: 'Arrows' },
  { value: 'sparkles', label: 'Sparkles (✨)', category: 'Engagement' },
  { value: 'zap', label: 'Lightning Zap (⚡)', category: 'Engagement' },
  { value: 'star', label: 'Favorite Star (★)', category: 'Engagement' },
  { value: 'heart', label: 'Love Heart (♥)', category: 'Engagement' },
  { value: 'gift', label: 'Reward Gift (🎁)', category: 'Engagement' },
  { value: 'download', label: 'Download File (↓)', category: 'Actions' },
  { value: 'check', label: 'Checkmark (✓)', category: 'Actions' },
  { value: 'play', label: 'Play Video (▶)', category: 'Actions' },
  { value: 'cart', label: 'Shopping Cart (🛒)', category: 'Commerce' },
  { value: 'send', label: 'Send Paper Plane (✈)', category: 'Communication' },
  { value: 'message-circle', label: 'Chat Bubble (💬)', category: 'Communication' },
  { value: 'phone', label: 'Phone Call (📞)', category: 'Communication' },
  { value: 'mail', label: 'Email Envelope (✉)', category: 'Communication' },
  { value: 'calendar', label: 'Calendar Event (📅)', category: 'Utility' },
  { value: 'copy', label: 'Copy Clipboard (📋)', category: 'Utility' },
  { value: 'share', label: 'Share Link (🔗)', category: 'Utility' },
  { value: 'bell', label: 'Notification Bell (🔔)', category: 'Utility' },
  { value: 'lock', label: 'Secure Lock (🔒)', category: 'Security' },
];

/**
 * Returns React Lucide Icon component for the button icon
 */
export function renderButtonIcon(icon: ButtonIconType, className = 'w-4 h-4 shrink-0') {
  switch (icon) {
    case 'arrow-right':
      return <ArrowRight className={className} />;
    case 'arrow-left':
      return <ArrowLeft className={className} />;
    case 'chevron-right':
      return <ChevronRight className={className} />;
    case 'external-link':
      return <ExternalLink className={className} />;
    case 'sparkles':
      return <Sparkles className={`${className} text-amber-300`} />;
    case 'zap':
      return <Zap className={`${className} text-amber-400`} />;
    case 'star':
      return <Star className={`${className} text-amber-400`} />;
    case 'heart':
      return <Heart className={`${className} text-rose-400 fill-rose-400/30`} />;
    case 'gift':
      return <Gift className={`${className} text-emerald-400`} />;
    case 'download':
      return <Download className={className} />;
    case 'check':
      return <Check className={`${className} text-emerald-400`} />;
    case 'play':
      return <Play className={`${className} fill-current`} />;
    case 'cart':
      return <ShoppingBag className={className} />;
    case 'send':
      return <Send className={className} />;
    case 'message-circle':
      return <MessageCircle className={className} />;
    case 'phone':
      return <Phone className={className} />;
    case 'mail':
      return <Mail className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'copy':
      return <Copy className={className} />;
    case 'share':
      return <Share2 className={className} />;
    case 'bell':
      return <Bell className={className} />;
    case 'lock':
      return <Lock className={className} />;
    case 'none':
    default:
      return null;
  }
}

/**
 * Computes CSS styles based on ButtonVariant and base element styles
 */
export function getComputedButtonStyles(
  behavior: ElementBehavior | undefined,
  baseStyles: ElementStyles = {}
): React.CSSProperties {
  const safeStyles = baseStyles;
  const variant = behavior?.buttonVariant || 'filled';
  const size = behavior?.buttonSize || 'md';

  // Base font size & padding per size
  let fontSize = safeStyles.fontSize;
  if (!fontSize) {
    if (size === 'sm') fontSize = 13;
    else if (size === 'lg') fontSize = 17;
    else if (size === 'xl') fontSize = 20;
    else fontSize = 15;
  }

  const customBg = safeStyles.backgroundColor;
  const customColor = safeStyles.color;
  const customBorder = safeStyles.borderColor;

  const styles: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: safeStyles.fontWeight || 600,
    cursor: 'pointer',
    userSelect: 'none',
  };

  switch (variant) {
    case 'gradient':
      styles.background =
        baseStyles.gradient ||
        (customBg
          ? `linear-gradient(135deg, ${customBg} 0%, #7c3aed 100%)`
          : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)');
      styles.color = customColor || '#ffffff';
      styles.boxShadow = baseStyles.boxShadow || '0 8px 22px -4px rgba(124, 58, 237, 0.45)';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '10px';
      styles.borderWidth = '0px';
      break;

    case 'outline':
      styles.backgroundColor = customBg || 'transparent';
      styles.color = customColor || '#818cf8';
      styles.borderColor = customBorder || '#6366f1';
      styles.borderWidth = baseStyles.borderWidth !== undefined ? `${baseStyles.borderWidth}px` : '2px';
      styles.borderStyle = 'solid';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '8px';
      styles.boxShadow = baseStyles.boxShadow || 'none';
      break;

    case 'ghost':
      styles.backgroundColor = customBg || 'transparent';
      styles.color = customColor || '#cbd5e1';
      styles.borderWidth = '0px';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '8px';
      styles.boxShadow = 'none';
      break;

    case 'glow':
      styles.backgroundColor = customBg || '#0f172a';
      styles.color = customColor || '#ffffff';
      styles.borderColor = customBorder || '#818cf8';
      styles.borderWidth = baseStyles.borderWidth !== undefined ? `${baseStyles.borderWidth}px` : '1px';
      styles.borderStyle = 'solid';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '10px';
      styles.boxShadow =
        baseStyles.boxShadow ||
        '0 0 24px rgba(99, 102, 241, 0.65), inset 0 0 14px rgba(99, 102, 241, 0.3)';
      break;

    case '3d-push':
      styles.backgroundColor = customBg || '#2563eb';
      styles.color = customColor || '#ffffff';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '10px';
      styles.borderBottom = '4px solid #1d4ed8';
      styles.boxShadow = baseStyles.boxShadow || '0 6px 0 0 #1e40af, 0 8px 18px rgba(0,0,0,0.3)';
      break;

    case 'glass':
      styles.backgroundColor = customBg || 'rgba(255, 255, 255, 0.08)';
      styles.backdropFilter = 'blur(16px)';
      styles.WebkitBackdropFilter = 'blur(16px)';
      styles.color = customColor || '#ffffff';
      styles.borderColor = customBorder || 'rgba(255, 255, 255, 0.22)';
      styles.borderWidth = '1px';
      styles.borderStyle = 'solid';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '12px';
      styles.boxShadow = baseStyles.boxShadow || '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
      break;

    case 'pill':
      styles.backgroundColor = customBg || '#4f46e5';
      styles.color = customColor || '#ffffff';
      styles.borderRadius = '9999px';
      styles.borderWidth = '0px';
      styles.boxShadow = baseStyles.boxShadow || '0 4px 14px 0 rgba(79, 70, 229, 0.35)';
      break;

    case 'filled':
    default:
      styles.backgroundColor = customBg || '#2563eb';
      styles.color = customColor || '#ffffff';
      styles.borderRadius = baseStyles.borderRadius !== undefined ? `${baseStyles.borderRadius}px` : '8px';
      styles.borderWidth = '0px';
      styles.boxShadow = baseStyles.boxShadow || '0 4px 14px 0 rgba(37, 99, 235, 0.35)';
      break;
  }

  return styles;
}

/**
 * Returns raw SVG icon markup string for export HTML
 */
export function getButtonIconSvg(icon: ButtonIconType): string {
  switch (icon) {
    case 'arrow-right':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
    case 'arrow-left':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
    case 'chevron-right':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
    case 'external-link':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    case 'sparkles':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
    case 'zap':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'star':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'heart':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="#fb7185" stroke="#fb7185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
    case 'download':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
    case 'check':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    case 'play':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    case 'cart':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
    case 'send':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    case 'message-circle':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`;
    case 'phone':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
    case 'mail':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;
    case 'calendar':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    case 'copy':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
    case 'share':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
    case 'bell':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
    case 'lock':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    case 'gift':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
    case 'none':
    default:
      return '';
  }
}
