import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import type {
  SemanticRole,
  ActionType,
  ButtonIconType,
  ShapeKind,
} from '../../types/editor';
import { FONT_FAMILIES } from '../../constants/defaults';
import { STOCK_IMAGES } from '../../constants/stockMedia';
import { SHAPE_DEFINITIONS } from '../../utils/shapeDefinitions';
import { triggerConfetti, playSound, type SoundEffectType } from '../../utils/interactiveEffects';
import { ColorPickerControl } from './ColorPickerControl';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
  Layout,
  Rows,
  Columns,
  FolderMinus,
  Maximize2,
  Sparkles,
  Play,
  Palette,
  Eye,
  Type,
  PanelRightClose,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Shapes,
  PartyPopper,
  Volume2,
} from 'lucide-react';

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle: number;
  color1: string;
  color2: string;
}

const GRADIENT_PRESETS = [
  { name: 'Electric Indigo', color1: '#4f46e5', color2: '#7c3aed', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
  { name: 'Sunset Blaze', color1: '#f97316', color2: '#ec4899', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { name: 'Cyber Neon', color1: '#06b6d4', color2: '#8b5cf6', value: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' },
  { name: 'Emerald Aurora', color1: '#10b981', color2: '#06b6d4', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
  { name: 'Cosmic Violet', color1: '#6366f1', color2: '#d946ef', value: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)' },
  { name: 'Golden Fire', color1: '#f59e0b', color2: '#ef4444', value: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { name: 'Obsidian Night', color1: '#27272a', color2: '#09090b', value: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)' },
  { name: 'Ocean Breeze', color1: '#2563eb', color2: '#38bdf8', value: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)' },
  { name: 'Rose Velvet', color1: '#e11d48', color2: '#fda4af', value: 'linear-gradient(135deg, #e11d48 0%, #fda4af 100%)' },
  { name: 'Midnight Plum', color1: '#581c87', color2: '#1e1b4b', value: 'linear-gradient(135deg, #581c87 0%, #1e1b4b 100%)' },
  { name: 'Sunburst Gold', color1: '#d97706', color2: '#fbbf24', value: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)' },
  { name: 'Glass Frost', color1: 'rgba(255,255,255,0.18)', color2: 'rgba(255,255,255,0.03)', value: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 100%)' },
];

function parseGradient(grad?: string): GradientConfig {
  if (!grad) {
    return { type: 'linear', angle: 135, color1: '#4f46e5', color2: '#7c3aed' };
  }
  const isRadial = grad.includes('radial');
  const angleMatch = grad.match(/(\d+)deg/);
  const angle = angleMatch ? parseInt(angleMatch[1], 10) : 135;
  const colors = grad.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  const color1 = colors && colors[0] ? colors[0] : '#4f46e5';
  const color2 = colors && colors[1] ? colors[1] : '#7c3aed';
  return { type: isRadial ? 'radial' : 'linear', angle, color1, color2 };
}

function buildGradient(type: 'linear' | 'radial', angle: number, color1: string, color2: string): string {
  if (type === 'radial') {
    return `radial-gradient(circle at center, ${color1} 0%, ${color2} 100%)`;
  }
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
}

const SEMANTIC_ROLES: { value: SemanticRole; label: string; tag: string; group: string; description: string }[] = [
  // Interactive & Triggers
  { value: 'button', label: 'Button', tag: '<button>', group: 'Interactive', description: 'Interactive trigger for clicks and actions' },
  { value: 'link', label: 'Hyperlink', tag: '<a>', group: 'Interactive', description: 'Navigates to external URL or page' },
  { value: 'input', label: 'Input Field', tag: '<input>', group: 'Interactive', description: 'Interactive form input field' },
  { value: 'form', label: 'Form Wrapper', tag: '<form>', group: 'Interactive', description: 'Semantic form enclosure' },
  { value: 'dialog', label: 'Modal Dialog', tag: '<dialog>', group: 'Interactive', description: 'Popup dialog or interactive modal overlay' },

  // Typography & Content
  { value: 'heading-h1', label: 'Heading 1', tag: '<h1>', group: 'Typography', description: 'Top-level primary document title' },
  { value: 'heading-h2', label: 'Heading 2', tag: '<h2>', group: 'Typography', description: 'Major section heading' },
  { value: 'heading-h3', label: 'Heading 3', tag: '<h3>', group: 'Typography', description: 'Sub-section or card heading' },
  { value: 'text', label: 'Paragraph Text', tag: '<p>', group: 'Typography', description: 'Standard readable paragraph body text' },
  { value: 'blockquote', label: 'Blockquote', tag: '<blockquote>', group: 'Typography', description: 'Quotation, testimonial, or cited excerpt' },
  { value: 'badge', label: 'Status Badge', tag: '<span>', group: 'Typography', description: 'Status pill, label tag, or category badge' },

  // Structure & Landmarks
  { value: 'header', label: 'Page Header', tag: '<header>', group: 'Structure', description: 'Banner header or site navigation bar' },
  { value: 'navigation', label: 'Navigation', tag: '<nav>', group: 'Structure', description: 'Menu or navigational links container' },
  { value: 'main', label: 'Main Landmark', tag: '<main>', group: 'Structure', description: 'Primary unique content of document' },
  { value: 'container', label: 'Section Container', tag: '<section>', group: 'Structure', description: 'Thematic content group section' },
  { value: 'card', label: 'Card Article', tag: '<article>', group: 'Structure', description: 'Self-contained reusable component card' },
  { value: 'aside', label: 'Sidebar / Aside', tag: '<aside>', group: 'Structure', description: 'Complementary sidebar or callout box' },
  { value: 'footer', label: 'Page Footer', tag: '<footer>', group: 'Structure', description: 'Footer containing copyright and links' },

  // Visual & Generic
  { value: 'image', label: 'Image Graphic', tag: '<img>', group: 'Media', description: 'Visual media graphics with alt tag' },
  { value: 'none', label: 'Generic Div', tag: '<div>', group: 'Media', description: 'Unstyled plain visual block' },
];

const ACTION_TYPES: { value: ActionType; label: string; icon: string; category: string; description: string }[] = [
  { value: 'none', label: 'No Action', icon: '⊘', category: 'General', description: 'No click interaction' },
  { value: 'navigate-url', label: 'Open External URL', icon: '↗', category: 'Navigation', description: 'Visit website link (supports new tab)' },
  { value: 'navigate-page', label: 'Switch Page', icon: '📄', category: 'Navigation', description: 'Navigate to internal project page' },
  { value: 'scroll-section', label: 'Scroll to Section', icon: '⚓', category: 'Navigation', description: 'Smooth scroll to element or anchor ID' },
  { value: 'scroll-top', label: 'Scroll to Top', icon: '↑', category: 'Navigation', description: 'Smooth scroll viewport back to top' },
  { value: 'open-modal', label: 'Open Modal Popup', icon: '🪟', category: 'Interactive', description: 'Display interactive dialog overlay' },
  { value: 'toggle-visibility', label: 'Toggle Element Visibility', icon: '👁️', category: 'Interactive', description: 'Toggle show/hide of target element' },
  { value: 'confetti', label: 'Trigger Confetti Burst', icon: '🎉', category: 'Effects', description: 'Celebratory particle confetti explosion' },
  { value: 'play-sound', label: 'Play Sound Effect', icon: '🔊', category: 'Effects', description: 'Web Audio API synthesized sound tone' },
  { value: 'toggle-dark-mode', label: 'Toggle Light/Dark Theme', icon: '🌓', category: 'Interactive', description: 'Toggle page dark and light mode' },
  { value: 'whatsapp', label: 'Chat on WhatsApp', icon: '💬', category: 'Communication', description: 'Direct WhatsApp link with custom message' },
  { value: 'share-page', label: 'Share / Copy Page Link', icon: '🔗', category: 'Utility', description: 'Web Share API or clipboard copy' },
  { value: 'copy-text', label: 'Copy to Clipboard', icon: '📋', category: 'Utility', description: 'Copy coupon code, promo or text' },
  { value: 'alert', label: 'Show Toast Alert', icon: '🔔', category: 'Utility', description: 'Trigger notification toast popup' },
  { value: 'email-mailto', label: 'Send Email (mailto:)', icon: '✉️', category: 'Communication', description: 'Open default email composer' },
  { value: 'tel-call', label: 'Call Phone (tel:)', icon: '📞', category: 'Communication', description: 'Direct call dialer on mobile & desktop' },
  { value: 'download-file', label: 'Download File', icon: '⬇', category: 'Utility', description: 'Trigger browser file download' },
  { value: 'custom-js', label: 'Execute Custom JS', icon: '⚡', category: 'Advanced', description: 'Run JavaScript callback logic' },
];

const CANVAS_BG_SWATCHES = [
  { label: 'White', color: '#ffffff' },
  { label: 'Slate 50', color: '#f8fafc' },
  { label: 'Warm', color: '#fafaf9' },
  { label: 'Dark', color: '#090d16' },
];

const HOVER_SHADOW_OPTIONS = [
  { label: 'Default / None', value: '' },
  { label: 'Soft Ambient Float', value: '0 10px 25px -5px rgba(0,0,0,0.4), 0 8px 10px -6px rgba(0,0,0,0.3)' },
  { label: 'Deep High Elevation', value: '0 20px 40px -10px rgba(0,0,0,0.6), 0 12px 18px -8px rgba(0,0,0,0.4)' },
  { label: 'Electric Indigo Glow', value: '0 0 25px rgba(99, 102, 241, 0.65)' },
  { label: 'Sunset Orange Glow', value: '0 0 25px rgba(249, 115, 22, 0.6)' },
  { label: 'Cyber Cyan Glow', value: '0 0 25px rgba(6, 182, 212, 0.6)' },
];

export const PropertiesPanel: React.FC = () => {
  const {
    project,
    activePage,
    selectedElement,
    updateElement,
    updateElementStyles,
    updateElementBehavior,
    updateElementLayout,
    setElementParent,
    reorderChild,
    alignElement,
    updatePageSettings,
    toggleRightSidebar,
    showToast,
    setActivePage,
    editorComplexity,
  } = useEditor();

  // 3 Primary Focused Tabs
  const [activeTab, setActiveTab] = useState<'style' | 'hover' | 'layout'>('style');
  const [gradientSubTab, setGradientSubTab] = useState<'presets' | 'custom'>('presets');
  const [isLiveHoverPreview, setIsLiveHoverPreview] = useState(false);

  // Progressive Disclosure states for simplified, uncluttered experience
  const [showGradients, setShowGradients] = useState<boolean>(false);
  const [showBorders, setShowBorders] = useState<boolean>(false);
  const [showElevation, setShowElevation] = useState<boolean>(false);

  // Auto-expand sections if the selected element already has active styling
  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.styles.gradient) {
        setShowGradients(true);
      }
      if (selectedElement.styles.borderWidth && selectedElement.styles.borderWidth > 0) {
        setShowBorders(true);
      }
      if (selectedElement.styles.boxShadow) {
        setShowElevation(true);
      }
    }
  }, [selectedElement?.id]);

  // If no element is selected, display Page Settings
  if (!selectedElement) {
    return (
      <aside className="w-full h-full bg-[#121214] text-zinc-300 flex flex-col select-none overflow-y-auto text-xs">
        <div className="h-10 px-3.5 border-b border-[#222226] flex items-center justify-between shrink-0 bg-[#121214]">
          <span className="font-semibold text-white text-xs tracking-wide">Inspector</span>
          <button
            onClick={toggleRightSidebar}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1c1c20] transition-colors"
            title="Close Inspector"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3.5 space-y-4">
          <div>
            <label className="text-zinc-400 font-medium block mb-1 text-[11px]">Page Name</label>
            <input
              type="text"
              value={activePage.name}
              onChange={(e) => updatePageSettings(activePage.id, { name: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-[#18181b] border border-[#2a2a30] rounded-md text-zinc-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-400 font-medium text-[11px]">Canvas Background</label>
              <div className="flex gap-1">
                {CANVAS_BG_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => updatePageSettings(activePage.id, { backgroundColor: swatch.color })}
                    className="w-4 h-4 rounded-full border border-zinc-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.label}
                  />
                ))}
              </div>
            </div>
            <ColorPickerControl
              label="Custom Color"
              value={activePage.backgroundColor || '#ffffff'}
              onChange={(val) => updatePageSettings(activePage.id, { backgroundColor: val })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222226]">
            <div>
              <label className="text-zinc-400 font-medium block mb-1 text-[11px]">Width</label>
              <div className="flex items-center bg-[#18181b] border border-[#2a2a30] rounded-md px-2 py-1">
                <input
                  type="number"
                  value={activePage.canvasWidth}
                  onChange={(e) => updatePageSettings(activePage.id, { canvasWidth: Number(e.target.value) || 1200 })}
                  className="w-full bg-transparent text-zinc-200 outline-none text-xs"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1 text-[11px]">Height</label>
              <div className="flex items-center bg-[#18181b] border border-[#2a2a30] rounded-md px-2 py-1">
                <input
                  type="number"
                  value={activePage.canvasHeight}
                  onChange={(e) => updatePageSettings(activePage.id, { canvasHeight: Number(e.target.value) || 800 })}
                  className="w-full bg-transparent text-zinc-200 outline-none text-xs"
                />
                <span className="text-[10px] text-zinc-500">px</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#222226]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Page Structure
            </div>
            <div className="p-3 rounded-lg bg-[#18181b] border border-[#2a2a30] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Total Components</span>
                <span className="font-mono text-zinc-200 font-semibold">{activePage.elements.length}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Sections</span>
                <span className="font-mono text-zinc-200 font-semibold">
                  {activePage.elements.filter((e) => e.type === 'section').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Viewport</span>
                <span className="text-indigo-400 font-medium">Desktop (1200px)</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const el = selectedElement;
  const s = el.styles;
  const b = el.behavior;
  const l = el.layout;
  const isLocked = el.locked;
  const isSection = el.type === 'section';
  const isContainer = el.type === 'container';
  const isLayoutParent = isSection || isContainer;
  const hasTextContent = el.type === 'text' || el.type === 'button';
  const isImage = el.type === 'image';
  const isShape = el.type === 'shape';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Toggle live hover preview on canvas
  const handleToggleLiveHover = () => {
    const next = !isLiveHoverPreview;
    setIsLiveHoverPreview(next);
    window.dispatchEvent(new CustomEvent('canvas:force-hover', { detail: { id: el.id, hover: next } }));
    showToast(next ? 'Live Hover Preview ON' : 'Live Hover Preview OFF', 'info');
  };

  // Pulse animation on canvas
  const handlePulseHover = () => {
    window.dispatchEvent(new CustomEvent('canvas:force-hover', { detail: { id: el.id, hover: true } }));
    setTimeout(() => {
      if (!isLiveHoverPreview) {
        window.dispatchEvent(new CustomEvent('canvas:force-hover', { detail: { id: el.id, hover: false } }));
      }
    }, 1200);
  };

  // Potential parents (Sections and Containers, excluding self and descendants)
  const getDescendantIds = (elementId: string): Set<string> => {
    const descendants = new Set<string>();
    const stack = [elementId];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      for (const item of activePage.elements) {
        if (item.parentId === currentId && !descendants.has(item.id)) {
          descendants.add(item.id);
          stack.push(item.id);
        }
      }
    }
    return descendants;
  };

  const disallowedParentIds = getDescendantIds(el.id);
  disallowedParentIds.add(el.id);

  const availableParents = activePage.elements.filter(
    (item) => (item.type === 'section' || item.type === 'container') && !disallowedParentIds.has(item.id)
  );

  const childElements = activePage.elements.filter((item) => item.parentId === el.id);

  const hasActiveHoverSettings =
    (s.hoverEffect && s.hoverEffect !== 'none') ||
    b.hoverStyles?.backgroundColor ||
    b.hoverStyles?.color ||
    b.hoverStyles?.borderColor ||
    b.hoverStyles?.scale ||
    s.hoverScale ||
    s.hoverTranslateY !== undefined;

  return (
    <aside className="w-full h-full bg-[#121214] text-zinc-300 flex flex-col select-none overflow-hidden text-xs">
      {/* 1. Inspector Header */}
      <div className="h-10 px-3 border-b border-[#222226] bg-[#121214] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-white text-xs truncate max-w-[140px]">{el.name}</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {el.type}
          </span>
        </div>
        <button
          onClick={toggleRightSidebar}
          className="p-1 rounded hover:bg-[#1c1c20] text-zinc-400 hover:text-white transition-colors"
          title="Close Inspector"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* 2. 3 Clean Focused Tabs */}
      <div className="flex items-center p-1.5 bg-[#131622] border-b border-[#1e2434] shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-[11px] transition-all ${
            activeTab === 'style'
              ? 'bg-indigo-600 text-white shadow-[0_2px_10px_rgba(99,102,241,0.45)]'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1c2233]'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-300" />
          <span>Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hover')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-[11px] transition-all relative ${
            activeTab === 'hover'
              ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-[0_2px_10px_rgba(245,158,11,0.4)]'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1c2233]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Hover</span>
          {hasActiveHoverSettings && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold text-[11px] transition-all ${
            activeTab === 'layout'
              ? 'bg-indigo-600 text-white shadow-[0_2px_10px_rgba(99,102,241,0.45)]'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1c2233]'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-emerald-300" />
          <span>Layout</span>
        </button>
      </div>

      {/* 3. Tab Content Viewport */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-4 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* ============================================================== */}
        {/* TAB 1: 🎨 STYLE TAB                                            */}
        {/* ============================================================== */}
        {activeTab === 'style' && (
          <div className="space-y-3.5">
            {/* Simple Mode Guidance Banner */}
            {editorComplexity === 'simple' && (
              <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Simple Essentials Mode</span>
                </span>
                <span className="text-[10px] text-zinc-400">Click accordions for more</span>
              </div>
            )}

            {/* 1. TEXT & CONTENT (Prominent & Top for Text/Buttons) */}
            {hasTextContent && (
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-blue-400" />
                    <span>Text & Content</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                    Direct Edit
                  </span>
                </div>

                {/* Direct Text Input */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">Text Content</label>
                  <textarea
                    rows={2}
                    value={el.content || ''}
                    onChange={(e) => updateElement(el.id, { content: e.target.value }, true)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-md text-white outline-none resize-y transition-colors"
                    placeholder="Enter text..."
                  />
                </div>

                {/* Color & Size Row */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Text Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={s.color || '#ffffff'}
                        onChange={(e) => updateElementStyles(el.id, { color: e.target.value })}
                        className="w-7 h-7 rounded border border-[#27272a] bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={s.color || '#ffffff'}
                        onChange={(e) => updateElementStyles(el.id, { color: e.target.value })}
                        className="w-full bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Font Size</label>
                    <div className="flex items-center bg-[#121214] border border-[#27272a] rounded px-2 py-1">
                      <input
                        type="number"
                        min={9}
                        max={120}
                        value={s.fontSize || 15}
                        onChange={(e) => updateElementStyles(el.id, { fontSize: Number(e.target.value) || 12 })}
                        className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                      />
                      <span className="text-[10px] text-zinc-500">px</span>
                    </div>
                  </div>
                </div>

                {/* Alignment & Weight */}
                <div className="flex items-center justify-between pt-1">
                  {/* Alignment segmented toggle */}
                  <div className="flex items-center bg-[#101420] border border-[#232c3f] rounded-lg p-0.5 gap-0.5">
                    {[
                      { align: 'left', icon: <AlignLeft className="w-3.5 h-3.5" /> },
                      { align: 'center', icon: <AlignCenter className="w-3.5 h-3.5" /> },
                      { align: 'right', icon: <AlignRight className="w-3.5 h-3.5" /> },
                    ].map((a) => (
                      <button
                        key={a.align}
                        type="button"
                        onClick={() => updateElementStyles(el.id, { textAlign: a.align as any })}
                        className={`p-1.5 rounded transition-all ${
                          (s.textAlign || 'left') === a.align
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                        title={`Align ${a.align}`}
                      >
                        {a.icon}
                      </button>
                    ))}
                  </div>

                  {/* Font Weight */}
                  <select
                    value={s.fontWeight || '400'}
                    onChange={(e) => updateElementStyles(el.id, { fontWeight: e.target.value })}
                    className="bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-zinc-200 outline-none text-xs"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>

                {/* Font Family */}
                <div className="pt-1.5 border-t border-[#222226] flex items-center justify-between">
                  <span className="text-zinc-400 text-[10px]">Font Family</span>
                  <select
                    value={s.fontFamily || FONT_FAMILIES[0].value}
                    onChange={(e) => updateElementStyles(el.id, { fontFamily: e.target.value })}
                    className="w-36 bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-zinc-200 outline-none text-xs"
                  >
                    <option value="Inter, -apple-system, sans-serif">Inter UI</option>
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.label} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 1.1 IMAGE MEDIA & SOURCE */}
            {isImage && (
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Image Media & Source</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                    Photo / Graphic
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (!dataUrl) return;
                      const img = new Image();
                      img.onload = () => {
                        let w = img.naturalWidth || el.width;
                        let h = img.naturalHeight || el.height;
                        const maxW = 500;
                        if (w > maxW) {
                          h = Math.round((h * maxW) / w);
                          w = maxW;
                        }
                        updateElement(
                          el.id,
                          {
                            content: dataUrl,
                            width: w,
                            height: h,
                            name: file.name ? `Image (${file.name})` : el.name,
                          },
                          true
                        );
                        showToast(`Uploaded image "${file.name}"! 📸`, 'success');
                      };
                      img.src = dataUrl;
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />

                {/* Image Preview & Upload Button */}
                <div className="flex gap-2.5 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#2e2e34] bg-zinc-900 shrink-0 relative group">
                    <img
                      src={
                        el.content ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={el.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                    <span className="text-[10px] text-zinc-500 block text-center">
                      PNG, JPG, SVG, WebP supported
                    </span>
                  </div>
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">Image Source URL</label>
                  <input
                    type="text"
                    value={el.content || ''}
                    onChange={(e) => updateElement(el.id, { content: e.target.value }, true)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-md text-white outline-none font-mono transition-colors"
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                    Alt Description (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={s.alt || ''}
                    onChange={(e) => updateElementStyles(el.id, { alt: e.target.value })}
                    placeholder="Describe the image..."
                    className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#27272a] focus:border-indigo-500 rounded-md text-white outline-none transition-colors"
                  />
                </div>

                {/* Object Fit & Aspect Ratio */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Object Fit</label>
                    <select
                      value={s.objectFit || 'cover'}
                      onChange={(e) => updateElementStyles(el.id, { objectFit: e.target.value as any })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-zinc-200 outline-none text-xs"
                    >
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="contain">Contain (Full View)</option>
                      <option value="fill">Fill (Stretch)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Shape Preset</label>
                    <div className="flex bg-[#121214] border border-[#27272a] rounded p-0.5 gap-0.5">
                      <button
                        type="button"
                        onClick={() => updateElementStyles(el.id, { borderRadius: 0 })}
                        className={`flex-1 py-0.5 text-[10px] font-medium rounded ${
                          !s.borderRadius ? 'bg-[#27272a] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Square
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElementStyles(el.id, { borderRadius: 12 })}
                        className={`flex-1 py-0.5 text-[10px] font-medium rounded ${
                          s.borderRadius === 12 ? 'bg-[#27272a] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Round
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElementStyles(el.id, { borderRadius: 9999 })}
                        className={`flex-1 py-0.5 text-[10px] font-medium rounded ${
                          s.borderRadius === 9999 ? 'bg-[#27272a] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Circle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Presets Row */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1">Quick Stock Presets</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {STOCK_IMAGES.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => updateElement(el.id, { content: img.url, name: img.name }, true)}
                        className="rounded-lg overflow-hidden border border-[#2a2a30] hover:border-indigo-500 aspect-[4/3] relative group"
                        title={img.name}
                      >
                        <img src={img.thumbnail} alt={img.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 left-1 right-1 text-[8px] text-white truncate drop-shadow">
                          {img.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 1.2 SHAPE GEOMETRY & STYLING */}
            {isShape && (
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                  <span className="flex items-center gap-1.5">
                    <Shapes className="w-3.5 h-3.5 text-purple-400" />
                    <span>Shape Geometry</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">
                    SVG Vector
                  </span>
                </div>

                {/* Shape Type Picker */}
                <div>
                  <label className="text-[10px] text-zinc-400 font-medium block mb-1.5">Choose Shape</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(Object.keys(SHAPE_DEFINITIONS) as ShapeKind[]).map((kind) => {
                      const def = SHAPE_DEFINITIONS[kind];
                      const isCurrent = (s.shapeKind || 'circle') === kind;
                      return (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => updateElementStyles(el.id, { shapeKind: kind })}
                          className={`p-1.5 rounded-lg flex flex-col items-center justify-center border transition-all ${
                            isCurrent
                              ? 'bg-purple-600/20 border-purple-500 text-white'
                              : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-600'
                          }`}
                          title={def.label}
                        >
                          <svg viewBox={def.viewBox} className="w-5 h-5 mb-0.5" style={{ color: def.defaultColor }}>
                            {kind === 'circle' && <circle cx="50" cy="50" r="44" fill="currentColor" />}
                            {kind === 'rectangle' && <rect x="8" y="8" width="84" height="84" fill="currentColor" />}
                            {kind === 'rounded-rect' && <rect x="8" y="8" width="84" height="84" rx="18" fill="currentColor" />}
                            {kind === 'pill' && <rect x="6" y="14" width="148" height="52" rx="26" fill="currentColor" />}
                            {kind === 'triangle' && <polygon points="50,10 90,90 10,90" fill="currentColor" />}
                            {kind === 'star' && <polygon points="50,8 63,36 94,36 69,56 78,88 50,68 22,88 31,56 6,36 37,36" fill="currentColor" />}
                            {kind === 'diamond' && <polygon points="50,8 92,50 50,92 8,50" fill="currentColor" />}
                            {kind === 'heart' && <path d="M50,84 C22,60 8,46 8,30 C8,16 18,8 31,8 C39,8 46,12 50,18 C54,12 61,8 69,8 C82,8 92,16 92,30 C92,46 78,60 50,84 Z" fill="currentColor" />}
                            {kind === 'hexagon' && <polygon points="50,8 90,29 90,71 50,92 10,71 10,29" fill="currentColor" />}
                            {kind === 'arrow-right' && <path d="M12,38 L56,38 L56,20 L88,50 L56,80 L56,62 L12,62 Z" fill="currentColor" />}
                          </svg>
                          <span className="text-[8px] truncate w-full text-center">{def.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rotation & Stroke Width */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">
                      Rotation ({s.rotation || 0}°)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={s.rotation || 0}
                      onChange={(e) => updateElementStyles(el.id, { rotation: Number(e.target.value) })}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Stroke Width</label>
                    <div className="flex items-center bg-[#121214] border border-[#27272a] rounded px-2 py-1">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={s.borderWidth || 0}
                        onChange={(e) => updateElementStyles(el.id, { borderWidth: Number(e.target.value) || 0 })}
                        className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                      />
                      <span className="text-[10px] text-zinc-500">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Click Action / Link for Buttons & Links */}
            {(el.type === 'button' || el.role === 'button' || el.role === 'link') && (
              <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Click Action / Destination</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <select
                    value={b.actionType || 'none'}
                    onChange={(e) => updateElementBehavior(el.id, { actionType: e.target.value as ActionType })}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-2.5 py-1 text-zinc-200 outline-none text-xs"
                  >
                    <option value="none">No Action (Static)</option>
                    <option value="navigate-url">Open Web Link (URL)</option>
                    <option value="navigate-page">Switch to Page</option>
                    <option value="confetti">🎉 Trigger Confetti Burst</option>
                    <option value="play-sound">🔊 Play Sound Effect</option>
                    <option value="toggle-dark-mode">🌓 Toggle Dark/Light Theme</option>
                    <option value="whatsapp">💬 WhatsApp Direct Chat</option>
                    <option value="share-page">🔗 Share Page Link</option>
                    <option value="scroll-section">Scroll to Section</option>
                    <option value="scroll-top">Scroll to Top</option>
                  </select>

                  {b.actionType === 'confetti' && (
                    <button
                      type="button"
                      onClick={() => triggerConfetti()}
                      className="w-full py-1.5 px-2 bg-pink-600 hover:bg-pink-500 text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <PartyPopper className="w-3.5 h-3.5" />
                      <span>Test Confetti Now</span>
                    </button>
                  )}

                  {b.actionType === 'play-sound' && (
                    <div className="flex gap-1.5">
                      <select
                        value={b.actionPayload || 'success'}
                        onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                        className="flex-1 bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-xs text-white outline-none"
                      >
                        <option value="success">Success Chime</option>
                        <option value="chime">Triple Chime</option>
                        <option value="pop">Bubbly Pop</option>
                        <option value="click">Subtle Click</option>
                        <option value="bell">Notification Bell</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => playSound((b.actionPayload as SoundEffectType) || 'success')}
                        className="px-2.5 py-1 bg-[#222226] hover:bg-[#27272a] text-white rounded text-xs transition-colors flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Test</span>
                      </button>
                    </div>
                  )}

                  {b.actionType === 'whatsapp' && (
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="Phone with country code (e.g. +14155552671)"
                      className="w-full px-2.5 py-1 text-xs bg-[#121214] border border-[#27272a] rounded text-white outline-none font-mono"
                    />
                  )}

                  {b.actionType === 'navigate-url' && (
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="https://example.com or /signup"
                      className="w-full px-2.5 py-1 text-xs bg-[#121214] border border-[#27272a] rounded text-white outline-none"
                    />
                  )}

                  {b.actionType === 'navigate-page' && (
                    <select
                      value={b.actionPayload || activePage.id}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2.5 py-1 text-zinc-200 outline-none text-xs"
                    >
                      {project.pages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Fill & Gradients */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                <span>Fill & Background</span>
                {s.gradient && (
                  <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    Gradient Active
                  </span>
                )}
              </div>

              {/* Solid Color Picker */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-zinc-400 text-[11px]">Solid Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.backgroundColor && s.backgroundColor !== 'transparent' ? s.backgroundColor : '#4f46e5'}
                    onChange={(e) => updateElementStyles(el.id, { backgroundColor: e.target.value, gradient: undefined })}
                    className="w-7 h-7 rounded-md border border-[#2e2e34] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={s.backgroundColor || '#4f46e5'}
                    onChange={(e) => updateElementStyles(el.id, { backgroundColor: e.target.value, gradient: undefined })}
                    className="w-24 bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-zinc-200 outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => updateElementStyles(el.id, { backgroundColor: 'transparent', gradient: undefined })}
                    className="w-7 h-7 rounded-md border border-[#2e2e34] bg-[#121214] text-zinc-500 hover:text-zinc-300 flex items-center justify-center text-xs"
                    title="Clear fill"
                  >
                    ⊘
                  </button>
                </div>
              </div>

              {/* 6 Quick Palette Swatches */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-zinc-500">Quick Swatches</span>
                <div className="flex items-center gap-1.5">
                  {[
                    { color: '#4f46e5', label: 'Indigo' },
                    { color: '#7c3aed', label: 'Purple' },
                    { color: '#10b981', label: 'Emerald' },
                    { color: '#0ea5e9', label: 'Sky' },
                    { color: '#18181b', label: 'Dark' },
                    { color: '#ffffff', label: 'White' },
                  ].map((sw) => (
                    <button
                      key={sw.color}
                      type="button"
                      onClick={() => updateElementStyles(el.id, { backgroundColor: sw.color, gradient: undefined })}
                      style={{ backgroundColor: sw.color }}
                      className="w-4 h-4 rounded-full border border-white/20 hover:scale-125 transition-transform"
                      title={sw.label}
                    />
                  ))}
                </div>
              </div>

              {/* Collapsible Gradients & Advanced Effects Toggle */}
              <div className="pt-2 border-t border-[#222226]">
                <button
                  type="button"
                  onClick={() => setShowGradients(!showGradients)}
                  className="w-full flex items-center justify-between text-xs text-indigo-300 hover:text-indigo-200 transition-colors py-0.5"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gradients & Special Effects</span>
                  </span>
                  {showGradients ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showGradients && (
                  <div className="pt-2.5 space-y-2.5">
                    {/* Solid vs Gradient Segmented Switch */}
                    <div className="flex items-center bg-[#101420] border border-[#232c3f] rounded-lg p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          if (s.gradient) {
                            updateElementStyles(el.id, { gradient: undefined, backgroundColor: s.backgroundColor || '#4f46e5' });
                          }
                        }}
                        className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                          !s.gradient ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Solid Color
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!s.gradient) {
                            updateElementStyles(el.id, { gradient: GRADIENT_PRESETS[0].value });
                          }
                        }}
                        className={`flex-1 py-1 rounded text-center font-medium flex items-center justify-center gap-1 transition-all ${
                          s.gradient ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Gradient</span>
                      </button>
                    </div>

                    {s.gradient && (
                      (() => {
                        const currentGrad = parseGradient(s.gradient);

                  const handleUpdateCustom = (updates: Partial<GradientConfig>) => {
                    const merged = { ...currentGrad, ...updates };
                    const nextVal = buildGradient(merged.type, merged.angle, merged.color1, merged.color2);
                    updateElementStyles(el.id, { gradient: nextVal });
                  };

                  return (
                    <div className="space-y-3 pt-1">
                      {/* Live Gradient Preview Bar */}
                      <div
                        style={{
                          background: s.gradient,
                          height: '42px',
                          minHeight: '42px',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#ffffff',
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                          }}
                        >
                          {currentGrad.type === 'radial' ? 'Radial' : `${currentGrad.angle}° Linear`}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateElementStyles(el.id, { gradient: undefined, backgroundColor: currentGrad.color1 })}
                          style={{
                            fontSize: '10px',
                            color: '#ffffff',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            cursor: 'pointer',
                          }}
                          title="Revert back to solid color"
                        >
                          Revert to Solid
                        </button>
                      </div>

                      {/* Sub-tab: Presets vs Custom Stops */}
                      <div className="flex bg-[#101420] p-0.5 rounded-lg border border-[#232c3f] gap-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setGradientSubTab('presets')}
                          className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                            gradientSubTab === 'presets'
                              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Presets (12)
                        </button>
                        <button
                          type="button"
                          onClick={() => setGradientSubTab('custom')}
                          className={`flex-1 py-1 rounded text-center font-medium transition-all ${
                            gradientSubTab === 'custom'
                              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Custom Stops & Angle
                        </button>
                      </div>

                      {/* Sub-Tab 1: 12 Presets Grid */}
                      {gradientSubTab === 'presets' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {GRADIENT_PRESETS.map((preset) => {
                            const isSelected = s.gradient === preset.value;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => updateElementStyles(el.id, { gradient: preset.value })}
                                style={{
                                  background: preset.value,
                                  height: '42px',
                                  minHeight: '42px',
                                  borderRadius: '8px',
                                  border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.15)',
                                  boxShadow: isSelected ? '0 0 12px rgba(255,255,255,0.45)' : 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  padding: '2px',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  transition: 'all 0.15s ease',
                                }}
                                title={preset.name}
                              >
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    color: '#ffffff',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.85)',
                                    backgroundColor: 'rgba(0,0,0,0.45)',
                                    borderRadius: '4px',
                                    padding: '1px 3px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {preset.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Sub-Tab 2: Custom Color Stops & Direction */
                        <div className="space-y-3 pt-1">
                          {/* Type: Linear vs Radial */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-zinc-400">Gradient Shape</span>
                            <div className="flex bg-[#121214] border border-[#27272a] rounded-lg p-0.5 gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateCustom({ type: 'linear' })}
                                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                                  currentGrad.type === 'linear'
                                    ? 'bg-[#27272a] text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                Linear
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateCustom({ type: 'radial' })}
                                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-all ${
                                  currentGrad.type === 'radial'
                                    ? 'bg-[#27272a] text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                              >
                                Radial
                              </button>
                            </div>
                          </div>

                          {/* Color Stops Row */}
                          <div className="p-2.5 bg-[#121214] border border-[#27272a] rounded-lg space-y-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                              Color Stops
                            </span>
                            <div className="flex items-center justify-between gap-1.5">
                              {/* Stop 1 */}
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <input
                                  type="color"
                                  value={currentGrad.color1}
                                  onChange={(e) => handleUpdateCustom({ color1: e.target.value })}
                                  className="w-7 h-7 rounded border border-[#2e2e34] bg-transparent cursor-pointer shrink-0"
                                />
                                <input
                                  type="text"
                                  value={currentGrad.color1}
                                  onChange={(e) => handleUpdateCustom({ color1: e.target.value })}
                                  className="w-full bg-[#18181b] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 text-xs font-mono"
                                />
                              </div>

                              {/* Swap Button */}
                              <button
                                type="button"
                                onClick={() => handleUpdateCustom({ color1: currentGrad.color2, color2: currentGrad.color1 })}
                                className="p-1.5 rounded-md bg-[#222226] hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                                title="Swap Colors"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                              </button>

                              {/* Stop 2 */}
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <input
                                  type="color"
                                  value={currentGrad.color2}
                                  onChange={(e) => handleUpdateCustom({ color2: e.target.value })}
                                  className="w-7 h-7 rounded border border-[#2e2e34] bg-transparent cursor-pointer shrink-0"
                                />
                                <input
                                  type="text"
                                  value={currentGrad.color2}
                                  onChange={(e) => handleUpdateCustom({ color2: e.target.value })}
                                  className="w-full bg-[#18181b] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Angle & Direction (if linear) */}
                          {currentGrad.type === 'linear' && (
                            <div className="p-2.5 bg-[#121214] border border-[#27272a] rounded-lg space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-400 font-medium">Angle Direction</span>
                                <span className="font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                  {currentGrad.angle}°
                                </span>
                              </div>

                              {/* 8 Directional Buttons */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                {[
                                  { label: '↖ 315°', angle: 315 },
                                  { label: '↑ 0°', angle: 0 },
                                  { label: '↗ 45°', angle: 45 },
                                  { label: '→ 90°', angle: 90 },
                                  { label: '↘ 135°', angle: 135 },
                                  { label: '↓ 180°', angle: 180 },
                                  { label: '↙ 225°', angle: 225 },
                                  { label: '← 270°', angle: 270 },
                                ].map((dir) => (
                                  <button
                                    key={dir.angle}
                                    type="button"
                                    onClick={() => handleUpdateCustom({ angle: dir.angle })}
                                    className={`py-1 px-1 rounded text-[10px] font-mono border transition-all text-center ${
                                      currentGrad.angle === dir.angle
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                        : 'bg-[#18181b] text-zinc-400 border-[#27272a] hover:text-white hover:bg-[#222226]'
                                    }`}
                                  >
                                    {dir.label}
                                  </button>
                                ))}
                              </div>

                              {/* Smooth Angle Slider */}
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={360}
                                  step={5}
                                  value={currentGrad.angle}
                                  onChange={(e) => handleUpdateCustom({ angle: Number(e.target.value) })}
                                  className="w-full accent-indigo-500 cursor-pointer"
                                />
                                <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded px-1.5 py-0.5 shrink-0">
                                  <input
                                    type="number"
                                    min={0}
                                    max={360}
                                    value={currentGrad.angle}
                                    onChange={(e) => handleUpdateCustom({ angle: Number(e.target.value) || 0 })}
                                    className="w-8 bg-transparent text-center text-xs text-white outline-none font-mono"
                                  />
                                  <span className="text-[10px] text-zinc-500">°</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
                  </div>
                )}
              </div>
            </div>

            {/* Dimensions & Size (Essential sizing) */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <span className="text-zinc-200 font-medium text-xs block">Dimensions & Sizing</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Width</span>
                  <div className="flex items-center bg-[#121214] border border-[#27272a] rounded px-2 py-1">
                    <input
                      type="number"
                      value={el.width}
                      onChange={(e) => updateElement(el.id, { width: Math.max(10, Number(e.target.value) || 10) }, true)}
                      className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                    />
                    <span className="text-[10px] text-zinc-500">px</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block mb-1">Height</span>
                  <div className="flex items-center bg-[#121214] border border-[#27272a] rounded px-2 py-1">
                    <input
                      type="number"
                      value={el.height}
                      onChange={(e) => updateElement(el.id, { height: Math.max(10, Number(e.target.value) || 10) }, true)}
                      className="w-full bg-transparent text-zinc-200 outline-none text-xs font-mono"
                    />
                    <span className="text-[10px] text-zinc-500">px</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progressive Disclosure: Borders & Rounded Corners */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <button
                type="button"
                onClick={() => setShowBorders(!showBorders)}
                className="w-full flex items-center justify-between text-xs text-zinc-200 hover:text-white transition-colors"
              >
                <span className="font-medium">Borders & Rounded Corners</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 bg-[#121214] px-1.5 py-0.5 rounded border border-[#27272a]">
                    {s.borderRadius === 9999 ? 'Pill' : `${s.borderRadius ?? 0}px`}
                  </span>
                  {showBorders ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                </div>
              </button>

              {showBorders && (
                <div className="pt-2 space-y-2.5 border-t border-[#222226]">
                  {/* Radius */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Radius</span>
                    <div className="flex items-center gap-1">
                      {[0, 8, 12, 16, 9999].map((rad) => (
                        <button
                          key={rad}
                          type="button"
                          onClick={() => updateElementStyles(el.id, { borderRadius: rad })}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                            (s.borderRadius ?? 0) === rad
                              ? 'bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm'
                              : 'bg-[#141824] text-zinc-400 border-[#263148] hover:text-white hover:border-indigo-500/40'
                          }`}
                        >
                          {rad === 9999 ? 'Pill' : `${rad}px`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stroke Width & Color */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-zinc-400 text-[11px]">Stroke</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={s.borderColor || '#27272a'}
                        onChange={(e) =>
                          updateElementStyles(el.id, {
                            borderColor: e.target.value,
                            borderWidth: s.borderWidth || 1,
                            borderStyle: 'solid',
                          })
                        }
                        className="w-7 h-7 rounded-md border border-[#2e2e34] bg-transparent cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0}
                        max={12}
                        value={s.borderWidth || 0}
                        onChange={(e) =>
                          updateElementStyles(el.id, {
                            borderWidth: Number(e.target.value) || 0,
                            borderStyle: Number(e.target.value) > 0 ? 'solid' : 'none',
                          })
                        }
                        className="w-12 bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs text-center font-mono"
                        placeholder="0px"
                      />
                      <button
                        type="button"
                        onClick={() => updateElementStyles(el.id, { borderWidth: 0, borderStyle: 'none' })}
                        className="w-7 h-7 rounded-md border border-[#2e2e34] bg-[#121214] text-zinc-500 hover:text-zinc-300 flex items-center justify-center text-xs"
                        title="Clear stroke"
                      >
                        ⊘
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progressive Disclosure: Elevation & Shadows */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <button
                type="button"
                onClick={() => setShowElevation(!showElevation)}
                className="w-full flex items-center justify-between text-xs text-zinc-200 hover:text-white transition-colors"
              >
                <span className="font-medium">Elevation & Shadows</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 bg-[#121214] px-1.5 py-0.5 rounded border border-[#27272a]">
                    {s.boxShadow ? 'Shadowed' : 'Flat'}
                  </span>
                  {showElevation ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                </div>
              </button>

              {showElevation && (
                <div className="pt-2 space-y-2.5 border-t border-[#222226]">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Shadow</span>
                      <select
                        value={s.boxShadow || ''}
                        onChange={(e) => updateElementStyles(el.id, { boxShadow: e.target.value || undefined })}
                        className="w-40 bg-[#121214] border border-[#27272a] rounded px-2 py-1 text-zinc-200 outline-none text-xs"
                      >
                        <option value="">None</option>
                        <option value="0 4px 12px rgba(0,0,0,0.15)">Subtle Soft</option>
                        <option value="0 10px 25px -5px rgba(0,0,0,0.4)">Elevated Card</option>
                        <option value="0 20px 40px -10px rgba(0,0,0,0.6)">Deep Float</option>
                        <option value="0 0 25px rgba(99, 102, 241, 0.4)">Indigo Glow</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-[11px]">Opacity</span>
                      <div className="flex items-center gap-2 w-40">
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={s.opacity ?? 1}
                          onChange={(e) => updateElementStyles(el.id, { opacity: Number(e.target.value) })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                        <span className="font-mono text-[11px] text-zinc-300 w-8 text-right">
                          {Math.round((s.opacity ?? 1) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ✨ HOVER STUDIO (Rich options requested by user)         */}
        {/* ============================================================== */}
        {activeTab === 'hover' && (
          <div className="space-y-3.5">
            {/* Live Canvas Hover Preview Switch */}
            <div className="p-3 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <div>
                    <span className="font-medium text-white text-xs block">Preview Hover on Canvas</span>
                    <span className="text-[10px] text-zinc-400">Lock hover state to preview styles live</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLiveHover}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isLiveHoverPreview ? 'bg-indigo-600' : 'bg-[#27272a]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isLiveHoverPreview ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Pulse Test Trigger */}
              <button
                type="button"
                onClick={handlePulseHover}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-400/30 flex items-center justify-center gap-1.5 font-medium text-[11px] transition-all shadow-sm"
              >
                <Play className="w-3 h-3 text-indigo-300" />
                <span>Test Hover Animation (Pulse)</span>
              </button>
            </div>

            {/* Hover Motion Presets */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                <span>Hover Animation Preset</span>
              </div>

              <select
                value={s.hoverEffect || 'none'}
                onChange={(e) =>
                  updateElementStyles(el.id, {
                    hoverEffect: e.target.value as any,
                    transitionDuration: s.transitionDuration || 200,
                  })
                }
                className="w-full bg-[#121214] border border-[#27272a] rounded px-2.5 py-1.5 text-zinc-200 outline-none text-xs"
              >
                <option value="none">None (Standard)</option>
                <option value="lift">Card Lift & Float (-4px + Shadow)</option>
                <option value="scale">Scale Pop (1.04x Zoom)</option>
                <option value="glow">Electric Indigo Border Glow</option>
                <option value="brighten">Brighten & Highlight</option>
              </select>
            </div>

            {/* Custom Block Hover Color & Appearance */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-3">
              <span className="text-zinc-200 font-medium text-xs block">Hover Color Overrides</span>

              {/* Hover Background Color */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Hover Background</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={b.hoverStyles?.backgroundColor || s.backgroundColor || '#4f46e5'}
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, backgroundColor: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border border-[#27272a] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={b.hoverStyles?.backgroundColor || ''}
                    placeholder="Inherit"
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, backgroundColor: e.target.value },
                      })
                    }
                    className="w-20 bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 text-xs font-mono"
                  />
                  {b.hoverStyles?.backgroundColor && (
                    <button
                      type="button"
                      onClick={() =>
                        updateElementBehavior(el.id, {
                          hoverStyles: { ...b.hoverStyles, backgroundColor: undefined },
                        })
                      }
                      className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Hover Text Color */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Hover Text Color</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={b.hoverStyles?.color || s.color || '#ffffff'}
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, color: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border border-[#27272a] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={b.hoverStyles?.color || ''}
                    placeholder="Inherit"
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, color: e.target.value },
                      })
                    }
                    className="w-20 bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 text-xs font-mono"
                  />
                  {b.hoverStyles?.color && (
                    <button
                      type="button"
                      onClick={() =>
                        updateElementBehavior(el.id, {
                          hoverStyles: { ...b.hoverStyles, color: undefined },
                        })
                      }
                      className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Hover Border Color */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 text-[11px]">Hover Border</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={b.hoverStyles?.borderColor || s.borderColor || '#6366f1'}
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, borderColor: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border border-[#27272a] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={b.hoverStyles?.borderColor || ''}
                    placeholder="Inherit"
                    onChange={(e) =>
                      updateElementBehavior(el.id, {
                        hoverStyles: { ...b.hoverStyles, borderColor: e.target.value },
                      })
                    }
                    className="w-20 bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 text-xs font-mono"
                  />
                  {b.hoverStyles?.borderColor && (
                    <button
                      type="button"
                      onClick={() =>
                        updateElementBehavior(el.id, {
                          hoverStyles: { ...b.hoverStyles, borderColor: undefined },
                        })
                      }
                      className="text-zinc-500 hover:text-zinc-300 text-xs p-1"
                      title="Clear"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Lift Elevation & Scale */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-3">
              <span className="text-zinc-200 font-medium text-xs block">Hover Motion & Lift</span>

              {/* Lift Elevation (translateY) */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-zinc-400">Elevation Lift</span>
                  <span className="font-mono text-zinc-300">
                    {s.hoverTranslateY !== undefined ? `${s.hoverTranslateY}px` : s.hoverEffect === 'lift' ? '-4px' : '0px'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[0, -2, -4, -8].map((liftVal) => (
                    <button
                      key={liftVal}
                      type="button"
                      onClick={() => updateElementStyles(el.id, { hoverTranslateY: liftVal })}
                      className={`py-1 rounded text-[11px] font-mono border transition-all ${
                        (s.hoverTranslateY === liftVal || (s.hoverTranslateY === undefined && liftVal === (s.hoverEffect === 'lift' ? -4 : 0)))
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#121214] text-zinc-400 border-[#27272a] hover:text-white'
                      }`}
                    >
                      {liftVal === 0 ? 'None' : `${liftVal}px`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale Zoom */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-zinc-400">Scale Zoom</span>
                  <span className="font-mono text-zinc-300">
                    {b.hoverStyles?.scale ? `${b.hoverStyles.scale}x` : s.hoverScale ? `${s.hoverScale}x` : (s.hoverEffect === 'scale' ? '1.04x' : '1.00x')}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1.0, 1.02, 1.04, 1.08].map((scaleVal) => (
                    <button
                      key={scaleVal}
                      type="button"
                      onClick={() => {
                        updateElementBehavior(el.id, {
                          hoverStyles: { ...b.hoverStyles, scale: scaleVal },
                        });
                        updateElementStyles(el.id, { hoverScale: scaleVal });
                      }}
                      className={`py-1 rounded text-[11px] font-mono border transition-all ${
                        (b.hoverStyles?.scale === scaleVal || s.hoverScale === scaleVal)
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-[#121214] text-zinc-400 border-[#27272a] hover:text-white'
                      }`}
                    >
                      {scaleVal === 1 ? '1.0x' : `${scaleVal}x`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hover Shadow */}
              <div>
                <span className="text-zinc-400 text-[11px] block mb-1">Hover Shadow Glow</span>
                <select
                  value={b.hoverStyles?.boxShadow || s.hoverShadow || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateElementBehavior(el.id, {
                      hoverStyles: { ...b.hoverStyles, boxShadow: val || undefined },
                    });
                    updateElementStyles(el.id, { hoverShadow: val || undefined });
                  }}
                  className="w-full bg-[#121214] border border-[#27272a] rounded px-2.5 py-1.5 text-zinc-200 outline-none text-xs"
                >
                  {HOVER_SHADOW_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Speed & Transition Duration */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <span className="text-zinc-200 font-medium text-xs block">Transition Timing</span>
              <div className="grid grid-cols-3 gap-1 bg-[#121214] border border-[#27272a] rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => updateElementStyles(el.id, { transitionDuration: 150 })}
                  className={`py-1 rounded text-center font-medium transition-all ${
                    (s.transitionDuration || 180) <= 150
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  150ms Fast
                </button>
                <button
                  type="button"
                  onClick={() => updateElementStyles(el.id, { transitionDuration: 250 })}
                  className={`py-1 rounded text-center font-medium transition-all ${
                    s.transitionDuration === 250
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  250ms Smooth
                </button>
                <button
                  type="button"
                  onClick={() => updateElementStyles(el.id, { transitionDuration: 400 })}
                  className={`py-1 rounded text-center font-medium transition-all ${
                    s.transitionDuration === 400
                      ? 'bg-[#27272a] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  400ms Gentle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: 📐 LAYOUT & ACTION TAB                                  */}
        {/* ============================================================== */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Dimensions & Position (Clean 4-column row) */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-200 font-medium text-xs">
                <span>Dimensions & Coordinates</span>
                <Maximize2 className="w-3.5 h-3.5 text-zinc-500" />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-0.5 text-center font-medium">X</span>
                  <input
                    type="number"
                    value={el.x}
                    onChange={(e) => updateElement(el.id, { x: Number(e.target.value) || 0 }, true)}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-0.5 text-center font-medium">Y</span>
                  <input
                    type="number"
                    value={el.y}
                    onChange={(e) => updateElement(el.id, { y: Number(e.target.value) || 0 }, true)}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-0.5 text-center font-medium">W</span>
                  <input
                    type="number"
                    value={el.width}
                    onChange={(e) => updateElement(el.id, { width: Math.max(10, Number(e.target.value) || 10) }, true)}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs text-center font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-0.5 text-center font-medium">H</span>
                  <input
                    type="number"
                    value={el.height}
                    onChange={(e) => updateElement(el.id, { height: Math.max(10, Number(e.target.value) || 10) }, true)}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-1.5 py-1 text-zinc-200 outline-none text-xs text-center font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Alignment & Distribution */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5">
              <span className="text-zinc-200 font-medium text-xs block">Alignment & Layout</span>

              <div className="space-y-2 text-xs">
                {/* Flex Direction if container or section */}
                {isLayoutParent && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-[11px]">Direction</span>
                    <div className="flex items-center bg-[#121214] border border-[#27272a] rounded-lg p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => updateElementLayout(el.id, { direction: 'row' })}
                        className={`px-3 py-1 rounded transition-all ${
                          l?.direction === 'row' ? 'bg-[#27272a] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Row (Horizontal)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateElementLayout(el.id, { direction: 'column' })}
                        className={`px-3 py-1 rounded transition-all ${
                          l?.direction === 'column' || !l?.direction ? 'bg-[#27272a] text-white' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Column (Vertical)
                      </button>
                    </div>
                  </div>
                )}

                {/* Alignment */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Align</span>
                  <div className="flex items-center bg-[#121214] border border-[#27272a] rounded-lg p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => alignElement(el.id, 'left')}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alignElement(el.id, 'center')}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Align Center"
                    >
                      <AlignHorizontalJustifyCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alignElement(el.id, 'middle')}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Align Middle"
                    >
                      <AlignVerticalJustifyCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => alignElement(el.id, 'right')}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distribution */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 text-[11px]">Distribute</span>
                  <div className="flex items-center bg-[#121214] border border-[#27272a] rounded-lg p-0.5 gap-0.5">
                    <button
                      type="button"
                      onClick={() => updateElementLayout(el.id, { justifyContent: 'start' })}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Start"
                    >
                      <Rows className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateElementLayout(el.id, { justifyContent: 'center' })}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Center"
                    >
                      <Columns className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateElementLayout(el.id, { justifyContent: 'space-between' })}
                      className="p-1.5 rounded hover:bg-[#27272a] text-zinc-400 hover:text-white transition-colors"
                      title="Space Between"
                    >
                      <Layout className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Frame & Nesting */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2">
              <span className="text-zinc-200 font-medium text-xs block">Hierarchy Parent Frame</span>
              <select
                value={el.parentId || ''}
                onChange={(e) => setElementParent(el.id, e.target.value ? e.target.value : null)}
                className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
              >
                <option value="">None (Canvas Root Element)</option>
                {availableParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.type === 'section' ? '§ ' : '□ '} {p.name}
                  </option>
                ))}
              </select>

              {isLayoutParent && childElements.length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-[#121214] border border-[#27272a] space-y-1 max-h-28 overflow-y-auto">
                  {childElements.map((child, idx) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-[11px] text-zinc-300"
                    >
                      <span className="truncate max-w-[120px]">{child.name}</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderChild(el.id, child.id, 'up')}
                          className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === childElements.length - 1}
                          onClick={() => reorderChild(el.id, child.id, 'down')}
                          className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setElementParent(child.id, null)}
                          className="p-0.5 hover:text-amber-400 text-zinc-500 ml-1"
                          title="Unparent"
                        >
                          <FolderMinus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Click Action & Destination */}
            <div className="p-3 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-zinc-200 font-medium text-xs">
                <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                <span>Click Actions & Role</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Button Icon (if button) */}
                {el.type === 'button' && (
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Button Icon</span>
                    <select
                      value={b.buttonIcon || 'none'}
                      onChange={(e) => updateElementBehavior(el.id, { buttonIcon: e.target.value as ButtonIconType })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                    >
                      <option value="none">No Icon</option>
                      <option value="arrow-right">Right Arrow (→)</option>
                      <option value="external-link">External Link (↗)</option>
                      <option value="sparkles">Sparkles (✨)</option>
                      <option value="download">Download (↓)</option>
                    </select>
                  </div>
                )}

                {/* Semantic HTML Role */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-zinc-400">Semantic Role & Tag</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">
                      {SEMANTIC_ROLES.find((r) => r.value === el.role)?.tag || '<div>'}
                    </span>
                  </div>
                  <select
                    value={el.role}
                    onChange={(e) => updateElement(el.id, { role: e.target.value as SemanticRole }, true)}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                  >
                    {['Interactive', 'Typography', 'Structure', 'Media'].map((grp) => (
                      <optgroup key={grp} label={`— ${grp} —`}>
                        {SEMANTIC_ROLES.filter((r) => r.group === grp).map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label} ({r.tag})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {SEMANTIC_ROLES.find((r) => r.value === el.role)?.description}
                  </p>
                </div>

                {/* Destination Action Type */}
                <div className="pt-2 border-t border-[#222226]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-zinc-400">Action Trigger</span>
                    <span className="text-[10px] text-zinc-500">
                      {ACTION_TYPES.find((a) => a.value === b.actionType)?.category}
                    </span>
                  </div>
                  <select
                    value={b.actionType}
                    onChange={(e) => updateElementBehavior(el.id, { actionType: e.target.value as ActionType })}
                    className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                  >
                    {['General', 'Navigation', 'Interactive', 'Effects', 'Utility', 'Communication', 'Advanced'].map((cat) => (
                      <optgroup key={cat} label={`— ${cat} —`}>
                        {ACTION_TYPES.filter((a) => a.category === cat).map((a) => (
                          <option key={a.value} value={a.value}>
                            {a.icon} {a.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* ACTION PAYLOAD CONTROLS */}

                {/* 1. Internal Page Selector */}
                {b.actionType === 'navigate-page' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Target Page</span>
                    <select
                      value={b.actionPayload || activePage.id}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                    >
                      {project.pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. External URL */}
                {b.actionType === 'navigate-url' && (
                  <div className="space-y-1.5 pt-1">
                    <input
                      type="url"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300 text-[11px]">
                      <input
                        type="checkbox"
                        checked={b.targetBlank ?? true}
                        onChange={(e) => updateElementBehavior(el.id, { targetBlank: e.target.checked })}
                        className="rounded bg-[#121214] border-[#27272a] text-indigo-600 focus:ring-0"
                      />
                      <span>Open link in new tab</span>
                    </label>
                  </div>
                )}

                {/* 3. Scroll to Section / Element */}
                {b.actionType === 'scroll-section' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Target Element / Anchor</span>
                    <select
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                    >
                      <option value="">Select Target Element...</option>
                      {activePage.elements
                        .filter((item) => item.id !== el.id)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            #{item.id} ({item.name || item.type})
                          </option>
                        ))}
                    </select>
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="Or enter custom ID (e.g. features or #pricing)"
                      className="w-full px-2 py-1 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 4. Scroll to Top */}
                {b.actionType === 'scroll-top' && (
                  <div className="p-2 bg-[#121214] border border-[#27272a] rounded text-[11px] text-zinc-400">
                    Smoothly scrolls the browser viewport back to the top of the page.
                  </div>
                )}

                {/* 5. Open Modal Dialog */}
                {b.actionType === 'open-modal' && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Modal Title</span>
                      <input
                        type="text"
                        value={b.actionModalTitle ?? 'Special Announcement'}
                        onChange={(e) => updateElementBehavior(el.id, { actionModalTitle: e.target.value })}
                        placeholder="Modal Title"
                        className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block mb-1">Modal Content</span>
                      <textarea
                        rows={2}
                        value={b.actionModalBody ?? 'Get 25% off this week only with code SPRING26.'}
                        onChange={(e) => updateElementBehavior(el.id, { actionModalBody: e.target.value })}
                        placeholder="Detailed message or announcement..."
                        className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 6. Toggle Element Visibility */}
                {b.actionType === 'toggle-visibility' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Target Element to Toggle</span>
                    <select
                      value={b.actionTargetId || b.actionPayload || ''}
                      onChange={(e) =>
                        updateElementBehavior(el.id, {
                          actionTargetId: e.target.value,
                          actionPayload: e.target.value,
                        })
                      }
                      className="w-full bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                    >
                      <option value="">Select Element to Toggle...</option>
                      {activePage.elements
                        .filter((item) => item.id !== el.id)
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || item.type} ({item.id})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* 7. Copy Text to Clipboard */}
                {b.actionType === 'copy-text' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Text to Copy</span>
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="e.g. DISCOUNT2026 or promo link"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 8. Alert Toast Message */}
                {b.actionType === 'alert' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Alert Message</span>
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="Action successful!"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none"
                    />
                  </div>
                )}

                {/* 9. Email (mailto:) */}
                {b.actionType === 'email-mailto' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Recipient Email</span>
                    <input
                      type="email"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="contact@example.com"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 10. Phone Call (tel:) */}
                {b.actionType === 'tel-call' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Phone Number</span>
                    <input
                      type="tel"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 11. Download File */}
                {b.actionType === 'download-file' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Download File URL</span>
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="https://example.com/assets/guide.pdf"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 12. Custom JS Snippet */}
                {b.actionType === 'custom-js' && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-zinc-400 block">JavaScript Snippet</span>
                    <textarea
                      rows={3}
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="alert('Clicked!'); console.log('Event fired');"
                      className="w-full px-2 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono resize-none text-[11px]"
                    />
                  </div>
                )}

                {/* 13. Confetti Effect */}
                {b.actionType === 'confetti' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Confetti Trigger Effect</span>
                    <p className="text-[11px] text-zinc-400 bg-[#121214] p-2 rounded border border-[#27272a] leading-relaxed">
                      Launches an interactive celebratory confetti explosion with gravity, particle drag, and physics when clicked.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        triggerConfetti();
                        playSound('success');
                        showToast('🎉 Confetti Celebration!', 'success');
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                      <PartyPopper className="w-3.5 h-3.5" />
                      <span>Launch Preview Confetti</span>
                    </button>
                  </div>
                )}

                {/* 14. Sound Effect */}
                {b.actionType === 'play-sound' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Sound Tone</span>
                    <div className="flex gap-2">
                      <select
                        value={b.actionPayload || 'success'}
                        onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                        className="flex-1 bg-[#121214] border border-[#27272a] rounded px-2 py-1.5 text-zinc-200 outline-none text-xs"
                      >
                        <option value="success">Success Chime</option>
                        <option value="chime">Triple Ascending Chime</option>
                        <option value="pop">Bubbly Pop</option>
                        <option value="click">Subtle Click</option>
                        <option value="bell">Notification Bell</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => playSound((b.actionPayload as SoundEffectType) || 'success')}
                        className="px-3 py-1.5 bg-[#222226] hover:bg-[#27272a] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 15. Toggle Dark/Light Theme */}
                {b.actionType === 'toggle-dark-mode' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Theme Toggle</span>
                    <p className="text-[11px] text-zinc-400 bg-[#121214] p-2 rounded border border-[#27272a] leading-relaxed">
                      Toggles between dark mode (#0c0e14) and light mode (#ffffff) on the canvas and preview mode.
                    </p>
                  </div>
                )}

                {/* 16. WhatsApp Direct Link */}
                {b.actionType === 'whatsapp' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">WhatsApp Number (with Country Code)</span>
                    <input
                      type="text"
                      value={b.actionPayload || ''}
                      onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                      placeholder="+14155552671"
                      className="w-full px-2.5 py-1.5 text-xs bg-[#121214] border border-[#27272a] rounded text-zinc-200 outline-none font-mono"
                    />
                  </div>
                )}

                {/* 17. Share Page */}
                {b.actionType === 'share-page' && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-zinc-400 block">Share Link</span>
                    <p className="text-[11px] text-zinc-400 bg-[#121214] p-2 rounded border border-[#27272a] leading-relaxed">
                      Triggers native Web Share API on mobile devices or copies page URL to clipboard on desktop.
                    </p>
                  </div>
                )}

                {/* Live Action Test Trigger */}
                {b.actionType !== 'none' && (
                  <div className="pt-2 border-t border-[#222226]">
                    <button
                      type="button"
                      onClick={() => {
                        if (b.actionType === 'navigate-url' && b.actionPayload) {
                          window.open(b.actionPayload, b.targetBlank ? '_blank' : '_self');
                        } else if (b.actionType === 'navigate-page' && b.actionPayload) {
                          setActivePage(b.actionPayload);
                          showToast(`Navigated to page: ${b.actionPayload}`, 'info');
                        } else if (b.actionType === 'scroll-section') {
                          const targetId = b.actionPayload?.replace(/^#/, '');
                          if (targetId) {
                            showToast(`Scroll triggered for target: #${targetId}`, 'info');
                          }
                        } else if (b.actionType === 'scroll-top') {
                          window.dispatchEvent(new CustomEvent('canvas:scroll-top'));
                          showToast('Scrolled to top!', 'info');
                        } else if (b.actionType === 'open-modal') {
                          showToast(
                            `Modal Dialog: "${b.actionModalTitle || 'Notice'}" - ${b.actionModalBody || 'Popup triggered'}`,
                            'info'
                          );
                        } else if (b.actionType === 'toggle-visibility') {
                          const targetId = b.actionTargetId || b.actionPayload;
                          showToast(`Toggled visibility for element #${targetId}`, 'info');
                        } else if (b.actionType === 'confetti') {
                          triggerConfetti();
                          playSound('success');
                          showToast('🎉 Confetti Celebration!', 'success');
                        } else if (b.actionType === 'play-sound') {
                          playSound((b.actionPayload as SoundEffectType) || 'success');
                          showToast('Played synthesized sound effect! 🔊', 'info');
                        } else if (b.actionType === 'toggle-dark-mode') {
                          const isDark = activePage.backgroundColor.toLowerCase() !== '#ffffff' && activePage.backgroundColor.toLowerCase() !== '#f8fafc';
                          updatePageSettings(activePage.id, { backgroundColor: isDark ? '#ffffff' : '#0c0e14' });
                          showToast(`Toggled ${isDark ? 'Light' : 'Dark'} theme`, 'info');
                        } else if (b.actionType === 'whatsapp') {
                          const cleanNumber = (b.actionPayload || '').replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${cleanNumber}`, '_blank');
                        } else if (b.actionType === 'share-page') {
                          if (navigator.share) {
                            navigator.share({ title: project.name, url: window.location.href }).catch(() => {});
                          } else {
                            navigator.clipboard?.writeText(window.location.href);
                            showToast('Copied page link to clipboard!', 'success');
                          }
                        } else if (b.actionType === 'copy-text') {
                          if (b.actionPayload) {
                            navigator.clipboard?.writeText(b.actionPayload);
                            showToast(`Copied: "${b.actionPayload}"`, 'success');
                          }
                        } else if (b.actionType === 'alert') {
                          showToast(b.actionPayload || 'Action triggered successfully!', 'info');
                        } else if (b.actionType === 'email-mailto') {
                          showToast(`Email mailto trigger: ${b.actionPayload}`, 'info');
                        } else if (b.actionType === 'tel-call') {
                          showToast(`Phone call trigger: ${b.actionPayload}`, 'info');
                        } else if (b.actionType === 'download-file') {
                          showToast(`File download trigger: ${b.actionPayload}`, 'info');
                        } else if (b.actionType === 'custom-js') {
                          try {
                            // Safe execution
                            const fn = new Function('toast', b.actionPayload || '');
                            fn(showToast);
                            showToast('Custom JS executed successfully', 'success');
                          } catch (err: any) {
                            showToast(`Custom JS Error: ${err.message}`, 'warning');
                          }
                        }
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 font-medium text-[11px] transition-all"
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Test Action Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
