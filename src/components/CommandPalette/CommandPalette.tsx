import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditor } from '../../context/useEditor';
import type { ElementType } from '../../types/editor';
import {
  Search, Type, MousePointerClick, Box, Image, Layout, Minus,
  FileText, Quote, CheckSquare, BarChart2, MessageSquare, Heart,
  ChevronDown, Sliders, PlaySquare, Activity, ShoppingBag,
  LayoutTemplate, Trash2, Copy, Undo2, Redo2, Eye,
  Plus, Zap, Command, Star, Sparkles, ArrowRight,
  Timer, Headphones, SplitSquareVertical, Layers,
} from 'lucide-react';
import {
  SECTION_TEMPLATES,
  getSmartSectionOffsetY,
} from '../../constants/templates';
import { playSound } from '../../utils/interactiveEffects';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
  action: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ORDER = ['Quick Actions', 'Canvas Elements', 'Add Element', 'Add Section', 'Pages', 'View'];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Quick Actions': <Zap size={11} />,
  'Canvas Elements': <Layers size={11} />,
  'Add Element': <Plus size={11} />,
  'Add Section': <LayoutTemplate size={11} />,
  'Pages': <FileText size={11} />,
  'View': <Eye size={11} />,
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    addElement,
    addElements,
    activePage,
    deleteElement,
    duplicateElement,
    undo,
    redo,
    canUndo,
    canRedo,
    setEditorMode,
    showToast,
    project,
    setActivePage,
    addPage,
    selectElement,
  } = useEditor();

  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const getSmartDropPos = useCallback(() => {
    const offsetY = getSmartSectionOffsetY(activePage.elements, 80);
    const centerX = Math.round((activePage.canvasWidth || 1200) / 2 - 150);
    return { x: centerX, y: offsetY };
  }, [activePage]);

  const handleAddElement = useCallback((type: ElementType, label: string) => {
    const { x, y } = getSmartDropPos();
    addElement(type, x, y);
    playSound('pop');
    showToast(`✨ Added ${label}`, 'success');
    onClose();
  }, [addElement, getSmartDropPos, showToast, onClose]);

  const commands: CommandItem[] = useMemo(() => {
    const cmds: CommandItem[] = [
      // ── Quick Actions ──────────────────────────────────────────────────
      {
        id: 'undo', label: 'Undo', description: 'Reverse last action',
        icon: <Undo2 size={15} />, category: 'Quick Actions',
        keywords: ['undo', 'reverse', 'back', 'ctrl z'],
        badge: '⌘Z', badgeColor: '#3f3f46',
        action: () => { if (canUndo) { undo(); onClose(); } else showToast('Nothing to undo', 'warning'); },
      },
      {
        id: 'redo', label: 'Redo', description: 'Re-apply last undone action',
        icon: <Redo2 size={15} />, category: 'Quick Actions',
        keywords: ['redo', 'forward', 'ctrl y'],
        badge: '⌘⇧Z', badgeColor: '#3f3f46',
        action: () => { if (canRedo) { redo(); onClose(); } else showToast('Nothing to redo', 'warning'); },
      },
      {
        id: 'duplicate', label: 'Duplicate Selection', description: 'Duplicate the selected element',
        icon: <Copy size={15} />, category: 'Quick Actions',
        keywords: ['duplicate', 'copy', 'clone'],
        badge: '⌘D', badgeColor: '#3f3f46',
        action: () => { duplicateElement(); onClose(); },
      },
      {
        id: 'delete', label: 'Delete Selection', description: 'Delete the selected element',
        icon: <Trash2 size={15} />, category: 'Quick Actions',
        keywords: ['delete', 'remove', 'trash'],
        badge: '⌫', badgeColor: '#7f1d1d',
        action: () => { deleteElement(); onClose(); },
      },
      {
        id: 'preview', label: 'Preview Site', description: 'Open full preview mode',
        icon: <Eye size={15} />, category: 'Quick Actions',
        keywords: ['preview', 'view', 'live'],
        badge: '⌘P', badgeColor: '#3f3f46',
        action: () => { setEditorMode('preview'); onClose(); },
      },
      {
        id: 'find-replace', label: 'Find & Replace', description: 'Search and replace text in canvas elements',
        icon: <Search size={15} />, category: 'Quick Actions',
        keywords: ['find', 'search', 'replace', 'lookup', 'text'],
        badge: '⌘F', badgeColor: '#252F23',
        action: () => {
          onClose();
          window.dispatchEvent(new CustomEvent('editor:open-find-replace'));
        },
      },
      // ── Canvas Elements (Dynamic Canvas Index) ──────────────────────────
      ...activePage.elements.map((el) => {
        const title = el.name || (el.content ? (el.content.length > 32 ? el.content.slice(0, 32) + '…' : el.content) : el.type);
        const sub = `${el.type.toUpperCase()} • ${Math.round(el.width)}×${Math.round(el.height)} at (${Math.round(el.x)}, ${Math.round(el.y)})`;
        const keywords = [
          el.name?.toLowerCase() || '',
          el.type.toLowerCase(),
          el.id.toLowerCase(),
          ...(el.content ? [el.content.toLowerCase()] : []),
        ].filter(Boolean);

        return {
          id: `canvas-el-${el.id}`,
          label: title,
          description: sub,
          icon: el.type === 'text' ? <Type size={14} /> :
                el.type === 'button' ? <MousePointerClick size={14} /> :
                el.type === 'image' ? <Image size={14} /> :
                el.type === 'container' || el.type === 'section' ? <Layout size={14} /> :
                <Box size={14} />,
          category: 'Canvas Elements',
          keywords,
          badge: el.type.slice(0, 4).toUpperCase(),
          badgeColor: '#1C241B',
          action: () => {
            selectElement(el.id);
            onClose();
            setTimeout(() => {
              const node =
                document.getElementById(`canvas-element-${el.id}`) ||
                document.querySelector(`[data-element-id="${el.id}"]`);
              if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                node.classList.add('search-highlight-pulse');
                setTimeout(() => node.classList.remove('search-highlight-pulse'), 1400);
              }
            }, 60);
            showToast(`Selected "${el.name || el.type}" on canvas`, 'info');
          },
        };
      }),
      // ── Add Element ─────────────────────────────────────────────────────
      {
        id: 'el-text', label: 'Text', description: 'Add a text block',
        icon: <Type size={15} />, category: 'Add Element',
        keywords: ['text', 'heading', 'paragraph', 'label', 'type'],
        action: () => handleAddElement('text', 'Text'),
      },
      {
        id: 'el-button', label: 'Button', description: 'Add an interactive button',
        icon: <MousePointerClick size={15} />, category: 'Add Element',
        keywords: ['button', 'cta', 'click', 'link', 'action'],
        badge: 'CTA', badgeColor: '#1e3a5f',
        action: () => handleAddElement('button', 'Button'),
      },
      {
        id: 'el-image', label: 'Image', description: 'Add an image element',
        icon: <Image size={15} />, category: 'Add Element',
        keywords: ['image', 'photo', 'picture', 'img', 'media'],
        action: () => handleAddElement('image', 'Image'),
      },
      {
        id: 'el-container', label: 'Container / Frame', description: 'Add a layout container',
        icon: <Box size={15} />, category: 'Add Element',
        keywords: ['container', 'frame', 'box', 'div', 'layout', 'wrapper'],
        action: () => handleAddElement('container', 'Container'),
      },
      {
        id: 'el-section', label: 'Section', description: 'Add a full-width section block',
        icon: <Layout size={15} />, category: 'Add Element',
        keywords: ['section', 'row', 'block', 'stripe'],
        action: () => handleAddElement('section', 'Section'),
      },
      {
        id: 'el-divider', label: 'Divider Line', description: 'Add a horizontal divider',
        icon: <Minus size={15} />, category: 'Add Element',
        keywords: ['divider', 'line', 'separator', 'hr', 'rule'],
        action: () => handleAddElement('divider', 'Divider'),
      },
      {
        id: 'el-input', label: 'Text Input', description: 'Add a form text input field',
        icon: <FileText size={15} />, category: 'Add Element',
        keywords: ['input', 'form', 'field', 'text input', 'name', 'email'],
        action: () => handleAddElement('input', 'Input'),
      },
      {
        id: 'el-textarea', label: 'Text Area', description: 'Add a multiline text area',
        icon: <Quote size={15} />, category: 'Add Element',
        keywords: ['textarea', 'multiline', 'message', 'comment'],
        action: () => handleAddElement('textarea', 'Textarea'),
      },
      {
        id: 'el-checkbox', label: 'Checkbox', description: 'Add a checkbox input',
        icon: <CheckSquare size={15} />, category: 'Add Element',
        keywords: ['checkbox', 'toggle', 'check', 'agree', 'terms'],
        action: () => handleAddElement('checkbox', 'Checkbox'),
      },
      {
        id: 'el-poll', label: 'Live Poll', description: 'Add an interactive voting poll',
        icon: <BarChart2 size={15} />, category: 'Add Element',
        keywords: ['poll', 'vote', 'survey', 'question', 'interactive'],
        badge: 'VOTE', badgeColor: '#1a2e5f',
        action: () => handleAddElement('poll', 'Poll'),
      },
      {
        id: 'el-guestbook', label: 'Guestbook', description: 'Add a visitor message wall',
        icon: <MessageSquare size={15} />, category: 'Add Element',
        keywords: ['guestbook', 'messages', 'wall', 'comments', 'community'],
        badge: 'WALL', badgeColor: '#1a2e5f',
        action: () => handleAddElement('guestbook', 'Guestbook'),
      },
      {
        id: 'el-reaction', label: 'Reaction Button', description: 'Add an emoji reaction widget',
        icon: <Heart size={15} />, category: 'Add Element',
        keywords: ['reaction', 'emoji', 'like', 'heart', 'tap'],
        badge: 'TAP', badgeColor: '#3b1a3f',
        action: () => handleAddElement('reaction', 'Reaction'),
      },
      {
        id: 'el-accordion', label: 'FAQ Accordion', description: 'Add collapsible FAQ items',
        icon: <ChevronDown size={15} />, category: 'Add Element',
        keywords: ['accordion', 'faq', 'collapse', 'expand', 'q&a'],
        action: () => handleAddElement('accordion', 'Accordion'),
      },
      {
        id: 'el-carousel', label: 'Image Carousel', description: 'Add a sliding image carousel',
        icon: <Sliders size={15} />, category: 'Add Element',
        keywords: ['carousel', 'slider', 'gallery', 'slideshow', 'images'],
        action: () => handleAddElement('carousel', 'Carousel'),
      },
      {
        id: 'el-video', label: 'Video Embed', description: 'Embed a YouTube / Vimeo video',
        icon: <PlaySquare size={15} />, category: 'Add Element',
        keywords: ['video', 'youtube', 'vimeo', 'embed', 'media', 'player'],
        action: () => handleAddElement('video', 'Video'),
      },
      {
        id: 'el-counter', label: 'Stat Counter', description: 'Add an animated number counter',
        icon: <Activity size={15} />, category: 'Add Element',
        keywords: ['counter', 'stats', 'number', 'count', 'animated'],
        action: () => handleAddElement('counter', 'Counter'),
      },
      {
        id: 'el-product', label: 'Product Card', description: 'Add an e-commerce product card',
        icon: <ShoppingBag size={15} />, category: 'Add Element',
        keywords: ['product', 'card', 'shop', 'store', 'ecommerce', 'buy', 'price'],
        badge: 'SHOP', badgeColor: '#1a3a20',
        action: () => handleAddElement('product-card', 'Product Card'),
      },
      {
        id: 'el-lottie', label: 'Lottie Animation', description: 'Add a high-fps JSON vector animation',
        icon: <Sparkles size={15} />, category: 'Add Element',
        keywords: ['lottie', 'animation', 'fx', 'vector', 'json', 'motion'],
        badge: 'ANIM', badgeColor: '#3a1a3a',
        action: () => handleAddElement('lottie', 'Lottie Animation'),
      },
      {
        id: 'el-countdown', label: 'Countdown Timer', description: 'Add an event / flash sale countdown',
        icon: <Timer size={15} />, category: 'Add Element',
        keywords: ['countdown', 'timer', 'clock', 'deadline', 'sale', 'launch'],
        badge: 'TIME', badgeColor: '#2d1f47',
        action: () => handleAddElement('countdown', 'Countdown Timer'),
      },
      {
        id: 'el-audio', label: 'Audio / Podcast Player', description: 'Embed a music or podcast player',
        icon: <Headphones size={15} />, category: 'Add Element',
        keywords: ['audio', 'music', 'podcast', 'player', 'mp3', 'sound', 'track'],
        badge: 'PLAY', badgeColor: '#1b2d47',
        action: () => handleAddElement('audio', 'Audio Player'),
      },
      {
        id: 'el-before-after', label: 'Before/After Slider', description: 'Interactive image comparison slider',
        icon: <SplitSquareVertical size={15} />, category: 'Add Element',
        keywords: ['before', 'after', 'compare', 'comparison', 'slider', 'diff', 'image'],
        badge: 'DIFF', badgeColor: '#3d2d14',
        action: () => handleAddElement('before-after', 'Before/After Slider'),
      },
      {
        id: 'el-testimonial', label: 'Review / Testimonial', description: 'Social proof card with 5-star rating',
        icon: <Star size={15} />, category: 'Add Element',
        keywords: ['testimonial', 'review', 'rating', 'stars', 'social proof', 'quote', 'feedback'],
        badge: 'STAR', badgeColor: '#3d3414',
        action: () => handleAddElement('testimonial', 'Testimonial Card'),
      },
      // ── Add Section Templates ──────────────────────────────────────────
      ...SECTION_TEMPLATES.map((tmpl) => ({
        id: `tmpl-${tmpl.id}`,
        label: tmpl.name,
        description: tmpl.description,
        icon: <LayoutTemplate size={15} />,
        category: 'Add Section',
        keywords: [tmpl.name.toLowerCase(), tmpl.category, tmpl.categoryLabel.toLowerCase(), 'template', 'section'],
        badge: tmpl.categoryLabel,
        badgeColor: '#1e2840',
        action: () => {
          const offsetY = getSmartSectionOffsetY(activePage.elements, 80);
          const elements = tmpl.create(offsetY);
          addElements(elements, true);
          playSound('success');
          showToast(`✨ Added "${tmpl.name}" section`, 'success');
          onClose();
        },
      })),
      // ── Pages ──────────────────────────────────────────────────────────
      ...project.pages.map((page) => ({
        id: `page-${page.id}`,
        label: `Go to: ${page.name}`,
        description: `Switch to the "${page.name}" page`,
        icon: <FileText size={15} />,
        category: 'Pages',
        keywords: [page.name.toLowerCase(), 'page', 'navigate', 'switch'],
        badge: page.id === activePage.id ? 'CURRENT' : undefined,
        badgeColor: '#1a3020',
        action: () => { setActivePage(page.id); showToast(`Switched to "${page.name}"`, 'info'); onClose(); },
      })),
      {
        id: 'add-page', label: 'Add New Page', description: 'Create a new blank page',
        icon: <Plus size={15} />, category: 'Pages',
        keywords: ['page', 'new', 'add', 'create'],
        action: () => { addPage('New Page'); onClose(); },
      },
    ];
    return cmds;
  }, [
    canUndo, canRedo, undo, redo, duplicateElement, deleteElement,
    setEditorMode, handleAddElement, addElements, activePage, project.pages,
    setActivePage, addPage, selectElement, showToast, onClose,
  ]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q))
    );
  }, [commands, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  const flatList = useMemo(() => filtered, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatList.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        flatList[selectedIdx]?.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, flatList, selectedIdx, onClose]);

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`) as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  // Reset idx on query change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  if (!isOpen) return null;

  let globalIdx = 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '14vh',
        animation: 'paletteBackdropIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes paletteBackdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes paletteSlideIn { from { opacity:0; transform:scale(0.96) translateY(-8px) } to { opacity:1; transform:scale(1) translateY(0) } }
        .palette-item { transition: background 0.08s, color 0.08s; }
        .palette-item:hover { background: rgba(184,243,107,0.12) !important; }
      `}</style>

      <div
        style={{
          width: '100%', maxWidth: 620,
          backgroundColor: '#101510',
          border: '1px solid #354331',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,243,107,0.15)',
          overflow: 'hidden',
          animation: 'paletteSlideIn 0.15s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid #354331',
        }}>
          <Search size={16} color="#B8F36B" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, element, or section…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#F4F5EF', fontSize: 15, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: 12 }}
            >
              Clear
            </button>
          )}
          <kbd style={{
            fontSize: 10, color: '#52525b', background: '#1c1c22',
            border: '1px solid #2a2a35', borderRadius: 4, padding: '2px 6px',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 420, overflowY: 'auto', padding: '6px 0' }}>
          {flatList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#52525b', fontSize: 13 }}>
              <Sparkles size={20} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              No results for "<strong>{query}</strong>"
            </div>
          ) : (
            CATEGORY_ORDER.concat(
              Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c))
            )
              .filter((cat) => grouped[cat]?.length > 0)
              .map((cat) => {
                const items = grouped[cat];
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px 4px',
                      fontSize: 10, fontWeight: 600, color: '#52525b',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>
                      {CATEGORY_ICONS[cat]}
                      {cat}
                    </div>

                    {items.map((cmd) => {
                      const idx = flatList.indexOf(cmd);
                      const isSelected = idx === selectedIdx;
                      globalIdx++;
                      return (
                        <div
                          key={cmd.id}
                          data-idx={idx}
                          className="palette-item"
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIdx(idx)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 16px', cursor: 'pointer',
                            background: isSelected ? 'rgba(184,243,107,0.12)' : 'transparent',
                            borderLeft: isSelected ? '2px solid #B8F36B' : '2px solid transparent',
                          }}
                        >
                          <span style={{
                            color: isSelected ? '#B8F36B' : '#A0A99A',
                            flexShrink: 0, display: 'flex', alignItems: 'center',
                          }}>
                            {cmd.icon}
                          </span>
                          <span style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 500,
                              color: isSelected ? '#F4F5EF' : '#A0A99A',
                            }}>
                              {cmd.label}
                            </span>
                            {cmd.description && (
                              <span style={{ fontSize: 11, color: '#A0A99A', marginLeft: 8 }}>
                                {cmd.description}
                              </span>
                            )}
                          </span>
                          {cmd.badge && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                              padding: '2px 6px', borderRadius: 4,
                              background: cmd.badgeColor || '#252F23',
                              color: '#B8F36B',
                            }}>
                              {cmd.badge}
                            </span>
                          )}
                          {isSelected && (
                            <ArrowRight size={12} color="#B8F36B" style={{ flexShrink: 0 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #1e1e28',
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 11, color: '#3f3f46',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Command size={10} /> K to open
          </span>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={10} /> {flatList.length} commands
          </span>
        </div>
      </div>
    </div>
  );
};
