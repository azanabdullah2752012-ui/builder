import React, { useState, useMemo, useCallback } from 'react';
import { useEditor } from '../../context/useEditor';
import type { ElementType, CanvasElement, ShapeKind } from '../../types/editor';
import {
  Type,
  Square,
  Image as ImageIcon,
  Minus,
  Box,
  Layers,
  Lock,
  Unlock,
  Trash2,
  Copy,
  MousePointerClick,
  Layout,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Plus,
  PanelLeftClose,
  Shapes,
  CheckSquare,
  Quote,
  Palette,
  Check,
  BarChart2,
  MessageSquare,
  Heart,
  Sliders,
  PlaySquare,
  Activity,
  ShoppingBag,
  Sparkles,
  Timer,
  Headphones,
  SplitSquareVertical,
  Star,
} from 'lucide-react';
import { SECTION_TEMPLATES, getSmartSectionOffsetY } from '../../constants/templates';
import { SHAPE_DEFINITIONS } from '../../utils/shapeDefinitions';
import { EMOJI_CATALOG } from '../../constants/emojiCatalog';
import { playSound } from '../../utils/interactiveEffects';
import { SimpleMakerSidebar } from './SimpleMakerSidebar';

interface ElementsSidebarProps {
  activeTab: 'elements' | 'layers' | 'pages' | 'theme';
  setActiveTab: (tab: 'elements' | 'layers' | 'pages' | 'theme') => void;
}

const BASIC_ELEMENTS: { type: ElementType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <Type size={16} /> },
  { type: 'button', label: 'Button', icon: <MousePointerClick size={16} /> },
  { type: 'container', label: 'Container', icon: <Box size={16} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
  { type: 'section', label: 'Section', icon: <Layout size={16} /> },
  { type: 'divider', label: 'Divider', icon: <Minus size={16} /> },
  { type: 'input', label: 'Text Input', icon: <FileText size={16} /> },
  { type: 'textarea', label: 'Text Area', icon: <Quote size={16} /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={16} /> },
];

const INTERACTIVE_WIDGETS: { type: ElementType; label: string; icon: React.ReactNode; badge?: string }[] = [
  { type: 'poll', label: 'Live Poll', icon: <BarChart2 size={16} />, badge: 'VOTE' },
  { type: 'guestbook', label: 'Guestbook', icon: <MessageSquare size={16} />, badge: 'WALL' },
  { type: 'reaction', label: 'Reaction', icon: <Heart size={16} />, badge: 'TAP' },
  { type: 'accordion', label: 'Accordion', icon: <ChevronDown size={16} /> },
  { type: 'carousel', label: 'Carousel', icon: <Sliders size={16} /> },
  { type: 'video', label: 'Video Player', icon: <PlaySquare size={16} /> },
  { type: 'counter', label: 'Counter', icon: <Activity size={16} /> },
  { type: 'product-card', label: 'Store Card', icon: <ShoppingBag size={16} />, badge: 'SHOP' },
  { type: 'lottie', label: 'Lottie FX', icon: <Sparkles size={16} />, badge: 'ANIM' },
  { type: 'countdown', label: 'Countdown', icon: <Timer size={16} />, badge: 'TIME' },
  { type: 'audio', label: 'Audio Player', icon: <Headphones size={16} />, badge: 'PLAY' },
  { type: 'before-after', label: 'Before/After', icon: <SplitSquareVertical size={16} />, badge: 'DIFF' },
  { type: 'testimonial', label: 'Review Card', icon: <Star size={16} />, badge: 'STAR' },
];

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    project,
    activePage,
    selectedElementId,
    selectElement,
    addElement,
    addElements,
    insertShape,
    insertEmoji,
    updateElement,
    deleteElement,
    duplicateElement,
    toggleLock,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updatePageSettings,
    setLeftSidebarOpen,
    showToast,
    editorComplexity,
  } = useEditor();

  if (editorComplexity === 'simple') {
    return <SimpleMakerSidebar />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'shapes' | 'emojis' | 'templates'>('all');
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState('');
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [newPageName, setNewPageName] = useState('');

  // Handle element quick-add
  const handleAdd = (type: ElementType) => {
    addElement(type);
    playSound('pop');
  };

  // Build hierarchy tree for Layers
  const { rootElements, childMap } = useMemo(() => {
    const map = new Map<string, CanvasElement[]>();
    const roots: CanvasElement[] = [];
    const elementsById = new Map<string, CanvasElement>();

    for (const el of activePage.elements) {
      elementsById.set(el.id, el);
    }

    for (const el of activePage.elements) {
      if (el.parentId && elementsById.has(el.parentId)) {
        const list = map.get(el.parentId) || [];
        list.push(el);
        map.set(el.parentId, list);
      } else {
        roots.push(el);
      }
    }

    return { rootElements: roots, childMap: map };
  }, [activePage.elements]);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [layerSearchQuery, setLayerSearchQuery] = useState('');

  // Check if an element or any of its descendants matches the layer search query
  const doesElementOrDescendantMatch = useCallback((el: CanvasElement, query: string): boolean => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = el.name?.toLowerCase().includes(q) ?? false;
    const typeMatch = el.type.toLowerCase().includes(q);
    const contentMatch = el.content ? el.content.toLowerCase().includes(q) : false;
    if (nameMatch || typeMatch || contentMatch) return true;

    const children = childMap.get(el.id) || [];
    return children.some((child) => doesElementOrDescendantMatch(child, query));
  }, [childMap]);

  // Total matching layers count
  const matchingLayersCount = useMemo(() => {
    if (!layerSearchQuery.trim()) return activePage.elements.length;
    const q = layerSearchQuery.toLowerCase().trim();
    return activePage.elements.filter(
      (el) =>
        (el.name && el.name.toLowerCase().includes(q)) ||
        el.type.toLowerCase().includes(q) ||
        (el.content && el.content.toLowerCase().includes(q))
    ).length;
  }, [layerSearchQuery, activePage.elements]);

  // Render tree node in Layers
  const renderTreeNode = (element: CanvasElement, depth = 0): React.ReactNode => {
    if (layerSearchQuery.trim() && !doesElementOrDescendantMatch(element, layerSearchQuery)) {
      return null;
    }

    const isSelected = selectedElementId === element.id;
    const children = childMap.get(element.id) || [];
    const hasChildren = children.length > 0;
    const isCollapsed = layerSearchQuery.trim() ? false : (collapsedIds[element.id] ?? false);
    const isEditing = editingLayerId === element.id;
    const isDirectMatch = Boolean(
      layerSearchQuery.trim() &&
        ((element.name && element.name.toLowerCase().includes(layerSearchQuery.toLowerCase().trim())) ||
          element.type.toLowerCase().includes(layerSearchQuery.toLowerCase().trim()) ||
          (element.content && element.content.toLowerCase().includes(layerSearchQuery.toLowerCase().trim())))
    );

    return (
      <div key={element.id} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => selectElement(element.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px',
            paddingLeft: `${depth * 14 + 8}px`,
            borderRadius: 5,
            backgroundColor: isSelected
              ? '#252F23'
              : isDirectMatch
              ? 'rgba(184, 243, 107, 0.08)'
              : 'transparent',
            border: isDirectMatch && !isSelected ? '1px solid rgba(184, 243, 107, 0.25)' : '1px solid transparent',
            color: isSelected ? '#B8F36B' : isDirectMatch ? '#F4F5EF' : '#A0A99A',
            cursor: 'pointer',
            fontSize: 11,
            transition: 'all 0.1s ease',
            position: 'relative',
          }}
          className="group hover:bg-[#1C241B]"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
            {hasChildren ? (
              <span
                onClick={(e) => toggleCollapse(element.id, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 14,
                  height: 14,
                  color: '#71717a',
                }}
              >
                {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              </span>
            ) : (
              <span style={{ width: 14 }} />
            )}

            {/* Element Type Icon */}
            <span style={{ color: isSelected ? '#818cf8' : '#6366f1', flexShrink: 0 }}>
              {element.type === 'text' && <Type size={12} />}
              {element.type === 'button' && <MousePointerClick size={12} />}
              {element.type === 'container' && <Square size={12} />}
              {element.type === 'section' && <Layout size={12} />}
              {element.type === 'image' && <ImageIcon size={12} />}
              {element.type === 'shape' && <Shapes size={12} />}
              {element.type === 'divider' && <Minus size={12} />}
              {element.type === 'input' && <FileText size={12} />}
              {!['text', 'button', 'container', 'section', 'image', 'shape', 'divider', 'input'].includes(element.type) && (
                <Box size={12} />
              )}
            </span>

            {/* Layer Name */}
            {isEditing ? (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  autoFocus
                  value={editingLayerName}
                  onChange={(e) => setEditingLayerName(e.target.value)}
                  onBlur={() => {
                    if (editingLayerName.trim()) updateElement(element.id, { name: editingLayerName.trim() });
                    setEditingLayerId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editingLayerName.trim()) updateElement(element.id, { name: editingLayerName.trim() });
                      setEditingLayerId(null);
                    }
                  }}
                  style={{
                    backgroundColor: '#1C241B',
                    border: '1px solid #B8F36B',
                    borderRadius: 4,
                    color: '#F4F5EF',
                    fontSize: 11,
                    padding: '1px 5px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingLayerId(element.id);
                  setEditingLayerName(element.name);
                }}
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: isSelected ? 500 : 400,
                }}
                title="Double click to rename"
              >
                {element.name}
              </span>
            )}
          </div>

          {/* Quick Hover Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              opacity: isSelected ? 1 : 0,
            }}
            className="group-hover:opacity-100"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(element.id);
              }}
              style={{
                background: 'none',
                padding: 2,
              }}
              title={element.locked ? 'Unlock' : 'Lock'}
            >
              {element.locked ? <Lock size={11} /> : <Unlock size={11} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement(element.id);
                showToast(`Duplicated ${element.name}`, 'info');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                padding: 2,
              }}
              className="hover:text-white"
              title="Duplicate Layer"
            >
              <Copy size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                padding: 2,
              }}
              className="hover:text-red-400"
              title="Delete Layer"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && !isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#101510',
        color: '#F4F5EF',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        fontSize: 11,
        overflow: 'hidden',
        borderRight: '1px solid #354331',
      }}
    >
      {/* 1. Header with Clean Segmented Switcher */}
      <div
        style={{
          height: 42,
          padding: '0 10px',
          borderBottom: '1px solid #354331',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1C241B',
            border: '1px solid #354331',
            borderRadius: 6,
            padding: 2,
            flex: 1,
            gap: 2,
          }}
        >
          {(['elements', 'layers', 'pages', 'theme'] as const).map((tab) => {
            const on = activeTab === tab;
            const label = tab === 'elements' ? 'Build' : tab === 'layers' ? 'Layers' : tab === 'pages' ? 'Pages' : 'Theme';
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  height: 24,
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: on ? '#252F23' : 'transparent',
                  color: on ? '#B8F36B' : '#A0A99A',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: on ? 600 : 400,
                  transition: 'all 0.12s ease',
                  padding: 0,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setLeftSidebarOpen(false)}
          style={{
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: '#71717a',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          title="Collapse Panel"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* TAB 1: COMPONENTS & INSERT */}
      {activeTab === 'elements' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search Box */}
          <div style={{ padding: '10px 12px 6px', backgroundColor: '#101510' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1C241B',
                border: '1px solid #354331',
                borderRadius: 6,
                padding: '0 8px',
                height: 28,
                gap: 6,
              }}
            >
              <Search size={13} color="#A0A99A" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F4F5EF',
                  fontSize: 11,
                  outline: 'none',
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#A0A99A', cursor: 'pointer', fontSize: 10 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sub Categories: All | Shapes | Emojis | Templates */}
          <div style={{ display: 'flex', gap: 4, padding: '0 12px 8px', borderBottom: '1px solid #354331' }}>
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'shapes' as const, label: 'Shapes' },
              { id: 'emojis' as const, label: 'Emojis' },
              { id: 'templates' as const, label: 'Templates' },
            ].map((cat) => {
              const on = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: on ? '1px solid #354331' : '1px solid transparent',
                    backgroundColor: on ? '#252F23' : 'transparent',
                    color: on ? '#B8F36B' : '#A0A99A',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: on ? 500 : 400,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Content Views */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {/* View A: All Basics */}
            {activeCategory === 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 2-Column Grid */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Basics
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {BASIC_ELEMENTS.filter(
                      (item) => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/studio-element-type', item.type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handleAdd(item.type)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 64,
                          padding: '8px 4px',
                          borderRadius: 8,
                          backgroundColor: '#1C241B',
                          border: '1px solid #354331',
                          color: '#F4F5EF',
                          cursor: 'pointer',
                          gap: 6,
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#252F23';
                          e.currentTarget.style.borderColor = '#B8F36B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1C241B';
                          e.currentTarget.style.borderColor = '#354331';
                        }}
                        title={`Click to add or drag onto canvas`}
                      >
                        <span style={{ color: '#A0A99A' }}>{item.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Engagement Widgets */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#A0A99A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Interactive Widgets</span>
                    <span style={{ fontSize: 9, color: '#B8F36B', fontWeight: 700 }}>LIVE</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {INTERACTIVE_WIDGETS.filter(
                      (item) => !searchQuery || item.label.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/studio-element-type', item.type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => handleAdd(item.type)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 64,
                          padding: '8px 4px',
                          borderRadius: 8,
                          backgroundColor: '#1C241B',
                          border: '1px solid #354331',
                          color: '#F4F5EF',
                          cursor: 'pointer',
                          gap: 6,
                          position: 'relative',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#252F23';
                          e.currentTarget.style.borderColor = '#B8F36B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1C241B';
                          e.currentTarget.style.borderColor = '#354331';
                        }}
                        title={`Click to add or drag ${item.label} onto canvas`}
                      >
                        {item.badge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              fontSize: 8,
                              fontWeight: 800,
                              color: '#6366f1',
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              padding: '1px 4px',
                              borderRadius: 4,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span style={{ color: '#818cf8' }}>{item.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pre-Built Sections Quick List */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    SaaS Sections
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {SECTION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          const smartY = getSmartSectionOffsetY(activePage.elements);
                          const elements = tmpl.create(smartY);
                          addElements(elements, true);
                          showToast(`Added ${tmpl.name}`, 'info');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          borderRadius: 6,
                          backgroundColor: '#1C241B',
                          border: '1px solid #354331',
                          color: '#F4F5EF',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#252F23';
                          e.currentTarget.style.borderColor = '#B8F36B';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1C241B';
                          e.currentTarget.style.borderColor = '#354331';
                        }}
                      >
                        <span style={{ fontSize: 11, fontWeight: 500 }}>{tmpl.name}</span>
                        <Plus size={12} color="#A0A99A" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View B: Vector Shapes */}
            {activeCategory === 'shapes' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {(Object.keys(SHAPE_DEFINITIONS) as ShapeKind[]).map((kind) => {
                  const def = SHAPE_DEFINITIONS[kind];
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => insertShape(kind)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 64,
                        padding: '8px',
                        borderRadius: 8,
                        backgroundColor: '#1C241B',
                        border: '1px solid #354331',
                        color: '#F4F5EF',
                        cursor: 'pointer',
                        gap: 6,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#252F23';
                        e.currentTarget.style.borderColor = '#B8F36B';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1C241B';
                        e.currentTarget.style.borderColor = '#354331';
                      }}
                    >
                      <svg viewBox={def.viewBox} style={{ width: 22, height: 22, color: '#B8F36B' }}>
                        {kind === 'circle' && <circle cx="50" cy="50" r="44" fill="currentColor" />}
                        {kind === 'rectangle' && <rect x="8" y="8" width="84" height="84" fill="currentColor" />}
                        {kind === 'rounded-rect' && <rect x="8" y="8" width="84" height="84" rx="18" fill="currentColor" />}
                        {kind === 'pill' && <rect x="6" y="14" width="148" height="52" rx="26" fill="currentColor" />}
                        {kind === 'triangle' && <polygon points="50,10 90,90 10,90" fill="currentColor" />}
                        {kind === 'star' && <polygon points="50,8 63,36 94,36 69,56 78,88 50,68 22,88 31,56 6,36 37,36" fill="currentColor" />}
                        {kind === 'heart' && <path d="M50,84 C22,60 8,46 8,30 C8,16 18,8 31,8 C39,8 46,12 50,18 C54,12 61,8 69,8 C82,8 92,16 92,30 C92,46 78,60 50,84 Z" fill="currentColor" />}
                      </svg>
                      <span style={{ fontSize: 10.5 }}>{def.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* View C: Emojis */}
            {activeCategory === 'emojis' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {EMOJI_CATALOG.slice(0, 48).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertEmoji(item.emoji)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 44,
                      borderRadius: 6,
                      backgroundColor: '#1C241B',
                      border: '1px solid #354331',
                      fontSize: 20,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#252F23';
                      e.currentTarget.style.borderColor = '#B8F36B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1C241B';
                      e.currentTarget.style.borderColor = '#354331';
                    }}
                    title={item.name}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            )}

            {/* View D: Templates */}
            {activeCategory === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SECTION_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      const smartY = getSmartSectionOffsetY(activePage.elements);
                      const elements = tmpl.create(smartY);
                      addElements(elements, true);
                      showToast(`Added ${tmpl.name}`, 'info');
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '8px 10px',
                      borderRadius: 6,
                      backgroundColor: '#1C241B',
                      border: '1px solid #354331',
                      color: '#F4F5EF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: 3,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#252F23';
                      e.currentTarget.style.borderColor = '#B8F36B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#1C241B';
                      e.currentTarget.style.borderColor = '#354331';
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{tmpl.name}</span>
                    <span style={{ fontSize: 10, color: '#A0A99A' }}>{tmpl.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LAYERS */}
      {activeTab === 'layers' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Layer Search & Filter Bar */}
          <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #354331', backgroundColor: '#101510', flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1C241B',
                border: '1px solid #354331',
                borderRadius: 6,
                padding: '0 8px',
                height: 28,
                gap: 6,
              }}
            >
              <Search size={13} color="#B8F36B" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Filter layers (name, type, text)..."
                value={layerSearchQuery}
                onChange={(e) => setLayerSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F4F5EF',
                  fontSize: 11,
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              {layerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLayerSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#A0A99A', cursor: 'pointer', fontSize: 11, padding: 0 }}
                  title="Clear filter"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Stats & Collapse/Expand All */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#A0A99A' }}>
              <span>
                {layerSearchQuery
                  ? `${matchingLayersCount} match${matchingLayersCount === 1 ? '' : 'es'}`
                  : `${activePage.elements.length} total layers`}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    const allOpen: Record<string, boolean> = {};
                    activePage.elements.forEach((e) => {
                      allOpen[e.id] = false;
                    });
                    setCollapsedIds(allOpen);
                  }}
                  style={{ background: 'none', border: 'none', color: '#B8F36B', cursor: 'pointer', fontSize: 10, padding: 0 }}
                >
                  Expand
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    const allCollapsed: Record<string, boolean> = {};
                    activePage.elements.forEach((e) => {
                      allCollapsed[e.id] = true;
                    });
                    setCollapsedIds(allCollapsed);
                  }}
                  style={{ background: 'none', border: 'none', color: '#A0A99A', cursor: 'pointer', fontSize: 10, padding: 0 }}
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>

          {/* Layers Tree */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {activePage.elements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#71717a' }}>
                <Layers size={24} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 11 }}>No layers yet</p>
              </div>
            ) : matchingLayersCount === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: '#71717a' }}>
                <Search size={20} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 11 }}>No layers match &ldquo;{layerSearchQuery}&rdquo;</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rootElements.map((el) => renderTreeNode(el, 0))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PAGES */}
      {activeTab === 'pages' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '12px', gap: 12 }}>
          {/* Add Page Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newPageName.trim()) {
                addPage(newPageName.trim());
                setNewPageName('');
              }
            }}
            style={{ display: 'flex', gap: 6 }}
          >
            <input
              type="text"
              placeholder="New page name..."
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              style={{
                flex: 1,
                height: 26,
                backgroundColor: '#1C241B',
                border: '1px solid #354331',
                borderRadius: 5,
                padding: '0 8px',
                color: '#F4F5EF',
                fontSize: 11,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newPageName.trim()}
              style={{
                width: 26,
                height: 26,
                borderRadius: 5,
                border: 'none',
                backgroundColor: '#B8F36B',
                color: '#101510',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                opacity: newPageName.trim() ? 1 : 0.4,
              }}
              title="Add Page"
            >
              <Plus size={13} />
            </button>
          </form>

          {/* Pages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {project.pages.map((p, idx) => {
              const isActive = p.id === activePage.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActivePage(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    borderRadius: 6,
                    backgroundColor: isActive ? '#252F23' : '#1C241B',
                    border: isActive ? '1px solid #B8F36B' : '1px solid #354331',
                    color: isActive ? '#F4F5EF' : '#A0A99A',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={12} color={isActive ? '#B8F36B' : '#A0A99A'} />
                    <span style={{ fontSize: 9.5, fontFamily: 'monospace', color: '#A0A99A' }}>#{idx + 1}</span>
                    <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>{p.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicatePage(p.id);
                      }}
                      style={{ background: 'none', border: 'none', color: '#A0A99A', cursor: 'pointer', padding: 2 }}
                      title="Duplicate"
                    >
                      <Copy size={11} />
                    </button>
                    {project.pages.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(p.id);
                        }}
                        style={{ background: 'none', border: 'none', color: '#A0A99A', cursor: 'pointer', padding: 2 }}
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* TAB 4: GLOBAL THEME & TOKENS */}
      {activeTab === 'theme' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '12px 14px' }}>
          {/* Header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Palette size={14} color="#B8F36B" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#F4F5EF' }}>Theme & Tokens</span>
            </div>
            <p style={{ fontSize: 10.5, color: '#A0A99A', margin: 0, lineHeight: 1.4 }}>
              Cascade color palettes, canvas tones, typography, and corner radii across your site.
            </p>
          </div>

          {/* 1. Theme Presets */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#A0A99A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Design Systems
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                {
                  id: 'pickle-dark',
                  name: 'Pickle Botanical',
                  accent: '#B8F36B',
                  bg: '#101510',
                  card: '#1C241B',
                  text: '#F4F5EF',
                  font: 'Cabinet Grotesk',
                  radius: 8,
                },
                {
                  id: 'pickle-corp',
                  name: 'Pickle Corp Warm Linen',
                  accent: '#936639',
                  bg: '#FCFBFA',
                  card: '#F4F2EC',
                  text: '#333D29',
                  font: 'Instrument Serif',
                  radius: 8,
                },
                {
                  id: 'emerald',
                  name: 'Emerald Minimal',
                  accent: '#10b981',
                  bg: '#080d0a',
                  card: '#101813',
                  text: '#ecfdf5',
                  font: 'Plus Jakarta Sans',
                  radius: 10,
                },
                {
                  id: 'rose',
                  name: 'Sunset Rose',
                  accent: '#f43f5e',
                  bg: '#0e0b10',
                  card: '#18121d',
                  text: '#fff1f2',
                  font: 'Outfit',
                  radius: 12,
                },
                {
                  id: 'cyan',
                  name: 'Electric Cyan',
                  accent: '#06b6d4',
                  bg: '#070d12',
                  card: '#0f1722',
                  text: '#f0fdfa',
                  font: 'Inter',
                  radius: 6,
                },
                {
                  id: 'amber',
                  name: 'Amber Solar',
                  accent: '#f59e0b',
                  bg: '#0e0c08',
                  card: '#1c160e',
                  text: '#fffbeb',
                  font: 'Outfit',
                  radius: 8,
                },
                {
                  id: 'violet',
                  name: 'Violet Luxe',
                  accent: '#8b5cf6',
                  bg: '#0c0a14',
                  card: '#161222',
                  text: '#faf5ff',
                  font: 'Plus Jakarta Sans',
                  radius: 14,
                },
                {
                  id: 'light',
                  name: 'Clean Studio Light',
                  accent: '#2563eb',
                  bg: '#f8fafc',
                  card: '#ffffff',
                  text: '#0f172a',
                  font: 'Inter',
                  radius: 8,
                },
              ].map((theme) => {
                const isActive = (activePage.backgroundColor || '#09090b') === theme.bg;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      // Apply canvas background
                      updatePageSettings(activePage.id, { backgroundColor: theme.bg });

                      // Cascade to elements
                      const updated = activePage.elements.map((el) => {
                        const s = { ...el.styles };
                        if (el.type === 'button') {
                          s.backgroundColor = theme.accent;
                          s.color = '#ffffff';
                          s.borderRadius = theme.radius;
                          s.fontFamily = theme.font;
                        } else if (el.type === 'container' || el.type === 'section') {
                          if (s.backgroundColor && s.backgroundColor !== 'transparent') {
                            s.backgroundColor = theme.card;
                          }
                          s.borderRadius = theme.radius;
                        } else if (el.type === 'text') {
                          s.fontFamily = theme.font;
                          if (theme.bg === '#f8fafc' && (!s.color || s.color === '#ffffff' || s.color === '#f4f4f5')) {
                            s.color = '#0f172a';
                          } else if (theme.bg !== '#f8fafc' && (s.color === '#000000' || s.color === '#0f172a')) {
                            s.color = '#f4f4f5';
                          }
                        }
                        return { ...el, styles: s };
                      });
                      updatePageSettings(activePage.id, { elements: updated });
                      showToast(`Applied ${theme.name} design tokens`, 'success');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      backgroundColor: '#121216',
                      border: isActive ? `1px solid ${theme.accent}` : '1px solid #1c1c24',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          backgroundColor: theme.accent,
                          border: `2px solid ${theme.bg}`,
                          boxShadow: `0 0 8px ${theme.accent}40`,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#f4f4f5' }}>{theme.name}</div>
                        <div style={{ fontSize: 9.5, color: '#71717a' }}>{theme.font} &bull; {theme.radius}px</div>
                      </div>
                    </div>
                    {isActive && <Check size={12} color={theme.accent} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Primary Brand Accent */}
          <div style={{ marginBottom: 18, padding: '10px 12px', backgroundColor: '#1C241B', borderRadius: 8, border: '1px solid #354331' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#A0A99A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Brand Accent Color
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['#B8F36B', '#936639', '#A4AC86', '#10b981', '#f59e0b', '#70B8FF', '#ffffff', '#101510'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    const updated = activePage.elements.map((el) => {
                      if (el.type === 'button') {
                        return {
                          ...el,
                          styles: {
                            ...el.styles,
                            backgroundColor: color,
                            color: color === '#ffffff' || color === '#B8F36B' ? '#101510' : '#ffffff',
                          },
                        };
                      }
                      return el;
                    });
                    updatePageSettings(activePage.id, { elements: updated });
                    showToast(`Updated button accent to ${color}`, 'success');
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    backgroundColor: color,
                    border: '2px solid #354331',
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                  title={`Apply ${color} to all buttons`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="color"
                defaultValue="#6366f1"
                onChange={(e) => {
                  const color = e.target.value;
                  const updated = activePage.elements.map((el) => {
                    if (el.type === 'button') {
                      return { ...el, styles: { ...el.styles, backgroundColor: color } };
                    }
                    return el;
                  });
                  updatePageSettings(activePage.id, { elements: updated });
                }}
                style={{
                  width: 26,
                  height: 26,
                  padding: 0,
                  borderRadius: 4,
                  border: '1px solid #27272a',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 10, color: '#71717a' }}>Custom Button Accent</span>
            </div>
          </div>

          {/* 3. Canvas Background Tone */}
          <div style={{ marginBottom: 18, padding: '10px 12px', backgroundColor: '#121216', borderRadius: 8, border: '1px solid #1c1c24' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Canvas Tone
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 10 }}>
              {[
                { hex: '#09090b', name: 'Obsidian' },
                { hex: '#121216', name: 'Charcoal' },
                { hex: '#000000', name: 'Pitch' },
                { hex: '#0f172a', name: 'Slate' },
                { hex: '#ffffff', name: 'White' },
              ].map((tone) => (
                <button
                  key={tone.hex}
                  type="button"
                  onClick={() => {
                    updatePageSettings(activePage.id, { backgroundColor: tone.hex });
                    showToast(`Canvas tone: ${tone.name}`, 'info');
                  }}
                  style={{
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: tone.hex,
                    border: (activePage.backgroundColor || '#09090b') === tone.hex ? '2px solid #6366f1' : '1px solid #27272a',
                    cursor: 'pointer',
                  }}
                  title={tone.name}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const currentBg = activePage.backgroundColor || '#09090b';
                project.pages.forEach((p) => {
                  updatePageSettings(p.id, { backgroundColor: currentBg });
                });
                showToast(`Applied canvas tone to all ${project.pages.length} pages`, 'success');
              }}
              style={{
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                backgroundColor: '#1b1b22',
                border: '1px solid #272732',
                color: '#d4d4d8',
                fontSize: 10.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
              }}
            >
              Sync Tone to All Pages
            </button>
          </div>

          {/* 4. Corner Radius Scale */}
          <div style={{ marginBottom: 18, padding: '10px 12px', backgroundColor: '#1C241B', borderRadius: 8, border: '1px solid #354331' }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: '#A0A99A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Corner Radius
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {[
                { label: '0px', val: 0 },
                { label: '6px', val: 6 },
                { label: '12px', val: 12 },
                { label: 'Full', val: 9999 },
              ].map((rad) => (
                <button
                  key={rad.label}
                  type="button"
                  onClick={() => {
                    const updated = activePage.elements.map((el) => {
                      if (['button', 'container', 'input', 'textarea', 'image'].includes(el.type)) {
                        return {
                          ...el,
                          styles: {
                            ...el.styles,
                            borderRadius: rad.val,
                          },
                        };
                      }
                      return el;
                    });
                    updatePageSettings(activePage.id, { elements: updated });
                    showToast(`Standardized radius to ${rad.label}`, 'success');
                  }}
                  style={{
                    padding: '5px 0',
                    borderRadius: 4,
                    backgroundColor: '#252F23',
                    border: '1px solid #354331',
                    color: '#F4F5EF',
                    fontSize: 10.5,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  {rad.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
