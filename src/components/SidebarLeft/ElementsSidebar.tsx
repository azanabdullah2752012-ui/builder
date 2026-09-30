import React, { useState, useMemo, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import type { ElementType, CanvasElement } from '../../types/editor';
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
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  FolderMinus,
  Check,
  Search,
  ChevronsUpDown,
  ChevronsDownUp,
  FileText,
  Plus,
  Sparkles,
  CreditCard,
  Quote,
  HelpCircle,
  Megaphone,
  PanelBottom,
  Compass,
  LayoutTemplate,
  Grid,
  PanelLeftClose,
  UserPlus,
} from 'lucide-react';
import {
  SECTION_TEMPLATES,
  getSmartSectionOffsetY,
  type SectionTemplate,
} from '../../constants/templates';
import { Shapes, Smile, Upload, ClipboardPaste } from 'lucide-react';
import { SHAPE_DEFINITIONS } from '../../utils/shapeDefinitions';
import { EMOJI_CATALOG } from '../../constants/emojiCatalog';
import { STOCK_IMAGES } from '../../constants/stockMedia';
import type { ShapeKind } from '../../types/editor';

interface ElementToolItem {
  type: ElementType;
  label: string;
  hint: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface ElementCategory {
  title: string;
  items: ElementToolItem[];
}

const CATEGORIES: ElementCategory[] = [
  {
    title: 'Structure & Layout',
    items: [
      {
        type: 'section',
        label: 'Section',
        hint: 'Flex page region',
        icon: <Layout className="w-4 h-4 text-purple-400" />,
        badge: 'Layout',
        badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      },
      {
        type: 'container',
        label: 'Container',
        hint: 'Card or grouping frame',
        icon: <Box className="w-4 h-4 text-indigo-400" />,
      },
    ],
  },
  {
    title: 'Content & Media',
    items: [
      {
        type: 'text',
        label: 'Text',
        hint: 'Heading or paragraph',
        icon: <Type className="w-4 h-4 text-blue-400" />,
      },
      {
        type: 'button',
        label: 'Button',
        hint: 'Interactive click trigger',
        icon: <MousePointerClick className="w-4 h-4 text-emerald-400" />,
        badge: 'Action',
        badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      },
      {
        type: 'image',
        label: 'Image',
        hint: 'Photos and graphics',
        icon: <ImageIcon className="w-4 h-4 text-amber-400" />,
      },
    ],
  },
  {
    title: 'Separators',
    items: [
      {
        type: 'divider',
        label: 'Divider',
        hint: 'Horizontal line separator',
        icon: <Minus className="w-4 h-4 text-slate-400" />,
      },
    ],
  },
];

interface ElementsSidebarProps {
  activeTab?: 'elements' | 'layers' | 'pages';
  setActiveTab?: (tab: 'elements' | 'layers' | 'pages') => void;
}

export const ElementsSidebar: React.FC<ElementsSidebarProps> = ({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}) => {
  const {
    project,
    activePage,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updatePageSettings,
    addElement,
    addElements,
    insertCustomImage,
    insertShape,
    insertEmoji,
    pasteElement,
    selectedElementId,
    selectElement,
    toggleLock,
    deleteElement,
    duplicateElement,
    setElementParent,
    reorderChild,
    updateElement,
    setLeftSidebarOpen,
    showToast,
  } = useEditor();

  const [internalTab, setInternalTab] = useState<'elements' | 'layers' | 'pages'>('layers');
  const activeTab = propActiveTab || internalTab;
  const setActiveTab = propSetActiveTab || setInternalTab;

  // Elements Sub-tabs: primitives | shapes | emojis | media | templates
  const [elementsSubTab, setElementsSubTab] = useState<'primitives' | 'shapes' | 'emojis' | 'media' | 'templates'>('primitives');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [emojiSearch, setEmojiSearch] = useState<string>('');
  const [emojiCategory, setEmojiCategory] = useState<string>('All');
  const uploadFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenTemplates = () => {
      setLeftSidebarOpen(true);
      setActiveTab('elements');
      setElementsSubTab('templates');
    };
    window.addEventListener('studio:open-templates', handleOpenTemplates);
    return () => window.removeEventListener('studio:open-templates', handleOpenTemplates);
  }, [setLeftSidebarOpen, setActiveTab]);

  // Page Management state
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [newPageInput, setNewPageInput] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState('');

  // Containers start collapsed by default to prevent vertical clutter
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const current = prev[id] !== undefined ? prev[id] : true;
      return { ...prev, [id]: !current };
    });
  };

  const handleStartRename = (el: CanvasElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNameId(el.id);
    setEditingNameValue(el.name);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    if (editingNameValue.trim()) {
      updateElement(id, { name: editingNameValue.trim() }, true);
    }
    setEditingNameId(null);
  };

  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'section':
        return <Layout className="w-3.5 h-3.5 text-zinc-400" />;
      case 'container':
        return <Square className="w-3.5 h-3.5 text-zinc-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-zinc-400" />;
      case 'button':
        return <MousePointerClick className="w-3.5 h-3.5 text-zinc-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />;
      case 'divider':
        return <Minus className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Square className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const filteredTemplates = useMemo(() => {
    return SECTION_TEMPLATES.filter((t) => {
      const matchesCategory =
        templateCategoryFilter === 'all' || t.category === templateCategoryFilter;
      const q = templateSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [templateCategoryFilter, templateSearchQuery]);

  const handleInsertSection = (template: SectionTemplate) => {
    const smartY = getSmartSectionOffsetY(activePage.elements);
    const elements = template.create(smartY);
    addElements(elements, true);
    showToast(`Added ${template.name} at Y: ${smartY}px`, 'info');
  };

  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'LayoutGrid':
        return <Layout className="w-4 h-4 text-sky-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-purple-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-indigo-400" />;
      case 'Quote':
        return <Quote className="w-4 h-4 text-orange-400" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4 text-blue-400" />;
      case 'Megaphone':
        return <Megaphone className="w-4 h-4 text-pink-400" />;
      case 'PanelBottom':
        return <PanelBottom className="w-4 h-4 text-zinc-400" />;
      case 'UserPlus':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      default:
        return <LayoutTemplate className="w-4 h-4 text-indigo-400" />;
    }
  };

  // Build hierarchy tree
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

    map.forEach((children, parentId) => {
      const parent = elementsById.get(parentId);
      if (parent?.children && parent.children.length > 0) {
        children.sort((a, b) => {
          const idxA = parent.children!.indexOf(a.id);
          const idxB = parent.children!.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return a.y - b.y;
        });
      }
    });

    return { rootElements: roots, childMap: map };
  }, [activePage.elements]);

  // Toggle expand/collapse all
  const allExpandableIds = useMemo(() => {
    return activePage.elements
      .filter((el) => (el.type === 'section' || el.type === 'container') && (childMap.get(el.id) || []).length > 0)
      .map((el) => el.id);
  }, [activePage.elements, childMap]);

  const areAllExpanded = allExpandableIds.length > 0 && allExpandableIds.every((id) => collapsedIds[id] === false);

  const toggleExpandAll = () => {
    const targetState = !areAllExpanded;
    const next: Record<string, boolean> = {};
    for (const id of allExpandableIds) {
      next[id] = !targetState; // collapsed is opposite of expanded
    }
    setCollapsedIds(next);
  };

  // Filtered elements if search query is active
  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return activePage.elements.filter(
      (el) => el.name.toLowerCase().includes(q) || el.type.toLowerCase().includes(q) || (el.content && el.content.toLowerCase().includes(q))
    );
  }, [activePage.elements, searchQuery]);

  // Recursive tree node renderer
  const renderTreeNode = (element: CanvasElement, depth = 0) => {
    const isSelected = selectedElementId === element.id;
    const isContainerLike = element.type === 'section' || element.type === 'container';
    const children = childMap.get(element.id) || [];
    const hasChildren = children.length > 0;
    // Default collapsed to true for container-like elements with children
    const isCollapsed = collapsedIds[element.id] !== undefined ? collapsedIds[element.id] : isContainerLike && hasChildren;
    const isRenaming = editingNameId === element.id;

    const parent = element.parentId ? activePage.elements.find((el) => el.id === element.parentId) : null;
    const siblings = parent ? childMap.get(parent.id) || [] : rootElements;
    const siblingIndex = siblings.findIndex((s) => s.id === element.id);
    const canMoveUp = parent && siblingIndex > 0;
    const canMoveDown = parent && siblingIndex < siblings.length - 1;

    return (
      <div key={element.id} className="flex flex-col">
        <div
          onClick={() => selectElement(element.id)}
          style={{ paddingLeft: `${Math.max(6, depth * 12 + 6)}px` }}
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-md text-xs cursor-pointer transition-all ${
            isSelected
              ? 'bg-[#222226] text-white font-medium shadow-sm'
              : 'text-zinc-400 hover:bg-[#18181b] hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isContainerLike && hasChildren ? (
              <button
                onClick={(e) => toggleCollapse(element.id, e)}
                className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-3 shrink-0" />
            )}

            <div className="shrink-0 text-zinc-400">{getElementIcon(element.type)}</div>

            {isRenaming ? (
              <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingNameValue}
                  onChange={(e) => setEditingNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(element.id, e);
                    if (e.key === 'Escape') setEditingNameId(null);
                  }}
                  autoFocus
                  className="bg-[#18181b] border border-[#3f3f46] rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                />
                <button
                  onClick={(e) => handleSaveRename(element.id, e)}
                  className="p-1 hover:text-white text-zinc-400"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span
                onDoubleClick={(e) => handleStartRename(element, e)}
                className="truncate select-none text-[11px]"
                title="Double click to rename"
              >
                {element.name}
              </span>
            )}

            {isContainerLike && hasChildren && isCollapsed && (
              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-800/60 px-1 py-0.2 rounded shrink-0">
                {children.length}
              </span>
            )}
          </div>

          {/* Quick Hover Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {parent && (
              <>
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderChild(parent.id, element.id, 'up');
                  }}
                  className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                  title="Move Up"
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderChild(parent.id, element.id, 'down');
                  }}
                  className="p-0.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-20"
                  title="Move Down"
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setElementParent(element.id, null);
                  }}
                  className="p-0.5 text-zinc-500 hover:text-amber-400"
                  title="Unparent"
                >
                  <FolderMinus className="w-2.5 h-2.5" />
                </button>
              </>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(element.id);
              }}
              className={`p-1 ${element.locked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-200'}`}
              title={element.locked ? 'Unlock' : 'Lock'}
            >
              {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateElement(element.id);
              }}
              className="p-1 text-zinc-500 hover:text-zinc-200"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(element.id);
              }}
              disabled={element.locked}
              className={`p-1 ${element.locked ? 'opacity-20 cursor-not-allowed text-zinc-700' : 'text-zinc-500 hover:text-red-400'}`}
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="flex flex-col space-y-0.5 relative before:absolute before:left-4 before:top-0 before:bottom-2 before:w-px before:bg-[#222226]">
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full bg-[#121214] text-zinc-300 flex flex-col select-none text-xs overflow-hidden">
      {/* 1. Header with Clean Tab Pills and Collapse Toggle */}
      <div className="p-2 border-b border-[#1e2434] flex items-center justify-between gap-1.5 shrink-0 bg-[#11141d]">
        <div className="flex-1 flex bg-[#0e121c] p-1 rounded-lg border border-[#22283a] gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('elements')}
            className={`flex-1 py-1 px-2 text-xs rounded-md transition-all text-center font-medium ${
              activeTab === 'elements'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Elements
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-1 px-1.5 text-xs rounded-md transition-all text-center font-medium ${
              activeTab === 'layers'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            Layers
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-1 px-1.5 text-xs rounded-md transition-all text-center flex items-center justify-center gap-1 font-medium ${
              activeTab === 'pages'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            <span>Pages</span>
            <span
              className={`text-[9px] font-mono px-1 rounded-full ${
                activeTab === 'pages' ? 'bg-indigo-900 text-indigo-100' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {project.pages.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => setLeftSidebarOpen(false)}
          className="p-1.5 rounded-md hover:bg-[#1c2233] text-zinc-400 hover:text-white transition-colors shrink-0"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Clean Categorized Elements & Pre-Built Section Templates */}
      {activeTab === 'elements' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-Switch: Primitives vs Shapes vs Emojis vs Media vs Sections */}
          <div className="p-2 border-b border-[#1e2434] bg-[#0c0e14]">
            {/* Hidden File Input for Image Upload */}
            <input
              ref={uploadFileInputRef}
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
                  insertCustomImage(dataUrl, file.name ? `Image (${file.name})` : 'Uploaded Image');
                  showToast(`Uploaded "${file.name}" to canvas! 📸`, 'success');
                };
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />

            <div className="flex bg-[#141824] p-0.5 rounded-lg border border-[#232c3f] gap-0.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setElementsSubTab('primitives')}
                className={`py-1.5 px-2 text-[11px] rounded-md transition-all font-medium flex items-center justify-center gap-1 shrink-0 ${
                  elementsSubTab === 'primitives'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Basic Elements"
              >
                <Grid className="w-3 h-3 text-indigo-300" />
                <span>Basic</span>
              </button>

              <button
                type="button"
                onClick={() => setElementsSubTab('shapes')}
                className={`py-1.5 px-2 text-[11px] rounded-md transition-all font-medium flex items-center justify-center gap-1 shrink-0 ${
                  elementsSubTab === 'shapes'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Geometric & Symbol Shapes"
              >
                <Shapes className="w-3 h-3 text-purple-300" />
                <span>Shapes</span>
              </button>

              <button
                type="button"
                onClick={() => setElementsSubTab('emojis')}
                className={`py-1.5 px-2 text-[11px] rounded-md transition-all font-medium flex items-center justify-center gap-1 shrink-0 ${
                  elementsSubTab === 'emojis'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Emoji Stickers"
              >
                <Smile className="w-3 h-3 text-amber-300" />
                <span>Emojis</span>
              </button>

              <button
                type="button"
                onClick={() => setElementsSubTab('media')}
                className={`py-1.5 px-2 text-[11px] rounded-md transition-all font-medium flex items-center justify-center gap-1 shrink-0 ${
                  elementsSubTab === 'media'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Upload & Stock Media"
              >
                <ImageIcon className="w-3 h-3 text-emerald-300" />
                <span>Media</span>
              </button>

              <button
                type="button"
                onClick={() => setElementsSubTab('templates')}
                className={`py-1.5 px-2 text-[11px] rounded-md transition-all font-medium flex items-center justify-center gap-1 shrink-0 ${
                  elementsSubTab === 'templates'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Pre-built Section Templates"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Sections</span>
                <span className="text-[9px] font-mono bg-indigo-900 text-indigo-200 px-1 rounded-full font-bold">
                  {SECTION_TEMPLATES.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sub-View A: Primitive Elements */}
          {elementsSubTab === 'primitives' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90 px-1 mb-2">
                    {cat.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/studio-element-type', item.type);
                          e.dataTransfer.effectAllowed = 'copy';
                        }}
                        onClick={() => addElement(item.type)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#242c3e] bg-[#141824] hover:bg-[#1a2233] hover:border-indigo-500/60 hover:shadow-[0_4px_16px_rgba(99,102,241,0.22)] transition-all text-center group cursor-grab active:cursor-grabbing relative overflow-hidden"
                        title={`Click or drag onto canvas to add ${item.label}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#0f131f] border border-[#263148] flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-500/50 group-hover:bg-[#161d2e] transition-all mb-2 text-zinc-300 shadow-inner">
                          {item.icon}
                        </div>
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 group-hover:text-zinc-300">
                          {item.hint}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-View B: Shapes Catalog */}
          {elementsSubTab === 'shapes' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90 px-1">
                Geometric & Symbol Shapes
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(SHAPE_DEFINITIONS) as ShapeKind[]).map((kind) => {
                  const def = SHAPE_DEFINITIONS[kind];
                  return (
                    <button
                      key={kind}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/studio-shape-kind', kind);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => insertShape(kind)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-[#242c3e] bg-[#141824] hover:bg-[#1a2233] hover:border-purple-500/60 hover:shadow-[0_4px_16px_rgba(168,85,247,0.22)] transition-all text-center group cursor-grab active:cursor-grabbing"
                      title={`Click or drag onto canvas to add ${def.label}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#0f131f] border border-[#263148] flex items-center justify-center group-hover:scale-110 group-hover:border-purple-500/50 transition-all mb-2 shadow-inner">
                        <svg viewBox={def.viewBox} className="w-7 h-7" style={{ color: def.defaultColor }}>
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
                      </div>
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                        {def.label}
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">
                        {def.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-View C: Emojis Catalog */}
          {elementsSubTab === 'emojis' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search emojis (rocket, fire, star)..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="w-full bg-[#141824] border border-[#232c3f] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Popular', 'Tech & Code', 'Launch & Growth', 'Business', 'Reactions', 'Badges'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEmojiCategory(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                      emojiCategory === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#141824] text-zinc-400 hover:text-zinc-200 border border-[#232c3f]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emojis Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 pr-1">
                {EMOJI_CATALOG.filter((item) => {
                  const matchesCat = emojiCategory === 'All' || item.category === emojiCategory;
                  const q = emojiSearch.toLowerCase().trim();
                  const matchesQ = !q || item.emoji.includes(q) || item.name.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q);
                  return matchesCat && matchesQ;
                }).map((item, idx) => (
                  <button
                    key={idx}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/studio-emoji', item.emoji);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => insertEmoji(item.emoji)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-[#242c3e] bg-[#141824] hover:bg-[#1d2334] hover:border-amber-500/50 hover:scale-105 transition-all text-center group cursor-grab active:cursor-grabbing"
                    title={`Click or drag "${item.name}" onto canvas`}
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform select-none">
                      {item.emoji}
                    </span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200 truncate w-full">
                      {item.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-View D: Media & Image Upload */}
          {elementsSubTab === 'media' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* Upload Dropzone */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90 px-1 mb-2">
                  Upload Own Image
                </div>
                <div
                  onClick={() => uploadFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#263148] hover:border-emerald-500/60 bg-[#121622] hover:bg-[#181e2e] rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-inner"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    Choose an image file
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1">
                    PNG, JPG, SVG, WebP, GIF from your computer
                  </span>
                </div>
              </div>

              {/* Paste from Clipboard */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-400/90 px-1 mb-2">
                  Clipboard Paste
                </div>
                <button
                  type="button"
                  onClick={() => pasteElement()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-all group"
                >
                  <ClipboardPaste className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Paste Image / Text (Cmd+V)</span>
                </button>
              </div>

              {/* Curated Stock Photos */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400/90 px-1 mb-2">
                  Curated Stock Photos
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STOCK_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => insertCustomImage(img.url, img.name)}
                      className="relative rounded-xl overflow-hidden border border-[#242c3e] hover:border-indigo-500 group aspect-[4/3] text-left"
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-1.5 left-2 right-2 text-white">
                        <span className="text-[10px] font-semibold block truncate drop-shadow-md">
                          {img.name}
                        </span>
                        <span className="text-[8px] text-zinc-400 font-mono">
                          {img.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-View B: Pre-Built Section Templates Catalog */}
          {elementsSubTab === 'templates' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter & Search Bar */}
              <div className="p-2 border-b border-[#1e2434] space-y-2 bg-[#0d1017]">
                <div className="flex items-center bg-[#141824] border border-[#232c3f] rounded-lg px-2 py-1 gap-1.5 text-zinc-400">
                  <Search className="w-3 h-3 text-zinc-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search templates (e.g. Hero, Pricing)..."
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-full"
                  />
                  {templateSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setTemplateSearchQuery('')}
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'auth', label: 'Auth & Lead' },
                    { id: 'hero', label: 'Hero' },
                    { id: 'features', label: 'Features' },
                    { id: 'pricing', label: 'Pricing' },
                    { id: 'social', label: 'Social' },
                    { id: 'faq', label: 'FAQ' },
                    { id: 'cta', label: 'CTA' },
                    { id: 'nav', label: 'Nav' },
                    { id: 'footer', label: 'Footer' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all shrink-0 ${
                        templateCategoryFilter === cat.id
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'bg-[#151926] text-zinc-400 hover:text-white border border-[#232c3f]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No section templates found matching &ldquo;{templateSearchQuery}&rdquo;
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/studio-section-template-id', template.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="rounded-xl border border-[#242c3e] bg-[#121624] hover:bg-[#161c2e] hover:border-indigo-500/50 transition-all p-3 flex flex-col gap-2 group cursor-grab active:cursor-grabbing shadow-sm"
                    >
                      {/* Gradient Accent Bar + Icon Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0c0f18] border border-[#263148] flex items-center justify-center shadow-inner">
                            {renderTemplateIcon(template.iconName)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-100 group-hover:text-white">
                              {template.name}
                            </div>
                            <span className="text-[9px] font-mono text-indigo-300">
                              {template.categoryLabel}
                            </span>
                          </div>
                        </div>

                        {template.badge && (
                          <span className="text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            {template.badge}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#1c2234] mt-0.5">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Drag or Click to Insert
                        </span>
                        <button
                          type="button"
                          onClick={() => handleInsertSection(template)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-indigo-500 transition-all shadow-sm"
                          title="Insert Section Below Existing Canvas Content"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert Below</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Clean Layers Hierarchy Tree */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Search & Expand All */}
          <div className="px-2 pt-2 pb-1.5 flex items-center gap-1.5 border-b border-[#222226] shrink-0">
            <div className="flex-1 flex items-center bg-[#18181b] border border-[#27272a] rounded-md px-2 py-1 gap-1.5 text-zinc-400">
              <Search className="w-3 h-3 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Filter layers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-zinc-500 hover:text-white text-xs">
                  ✕
                </button>
              )}
            </div>
            {allExpandableIds.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1c1c20] transition-colors"
                title={areAllExpanded ? 'Collapse All' : 'Expand All'}
              >
                {areAllExpanded ? <ChevronsDownUp className="w-3.5 h-3.5" /> : <ChevronsUpDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activePage.elements.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Layers className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-40" />
                <p className="text-xs text-zinc-500 font-normal">No elements yet</p>
              </div>
            ) : filteredElements ? (
              <div className="space-y-0.5 pt-1">
                {filteredElements.map((el) => (
                  <div
                    key={el.id}
                    onClick={() => selectElement(el.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer ${
                      selectedElementId === el.id ? 'bg-[#222226] text-white' : 'text-zinc-400 hover:bg-[#18181b]'
                    }`}
                  >
                    {getElementIcon(el.type)}
                    <span className="truncate">{el.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5 pt-1">
                {rootElements.map((rootEl) => renderTreeNode(rootEl, 0))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Pages & Routing Management */}
      {activeTab === 'pages' && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Search pages */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search pages..."
              value={pageSearchQuery}
              onChange={(e) => setPageSearchQuery(e.target.value)}
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Add Page Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newPageInput.trim()) {
                addPage(newPageInput.trim());
                setNewPageInput('');
              }
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="New page name..."
              value={newPageInput}
              onChange={(e) => setNewPageInput(e.target.value)}
              className="flex-1 bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!newPageInput.trim()}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shrink-0"
              title="Add Page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Pages List */}
          <div className="space-y-1.5 flex-1">
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 px-1 mb-1">
              Project Pages ({project.pages.length})
            </div>

            {project.pages
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(pageSearchQuery.toLowerCase()) ||
                  p.slug.toLowerCase().includes(pageSearchQuery.toLowerCase())
              )
              .map((p, idx) => {
                const isActive = p.id === activePage.id;
                const isEditing = editingPageId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isActive) setActivePage(p.id);
                    }}
                    className={`group p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#1e1e24] border-indigo-500/50 shadow-sm'
                        : 'bg-[#18181b] border-[#27272a] hover:bg-[#1d1d22] hover:border-[#38383e]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? 'text-indigo-400' : 'text-zinc-500'
                          }`}
                        />
                        <span className="text-[10px] text-zinc-500 font-mono px-1 py-0.2 rounded bg-zinc-800/80 shrink-0">
                          #{idx + 1}
                        </span>
                        {isEditing ? (
                          <div
                            className="flex items-center gap-1 flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingPageName}
                              onChange={(e) => setEditingPageName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editingPageName.trim()) {
                                    updatePageSettings(p.id, { name: editingPageName.trim() });
                                    showToast(`Page renamed to "${editingPageName.trim()}"`, 'info');
                                  }
                                  setEditingPageId(null);
                                }
                                if (e.key === 'Escape') setEditingPageId(null);
                              }}
                              autoFocus
                              className="bg-[#121214] border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editingPageName.trim()) {
                                  updatePageSettings(p.id, { name: editingPageName.trim() });
                                }
                                setEditingPageId(null);
                              }}
                              className="p-1 text-emerald-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingPageId(p.id);
                              setEditingPageName(p.name);
                            }}
                            className={`font-medium text-xs truncate ${
                              isActive ? 'text-white' : 'text-zinc-300'
                            }`}
                          >
                            {p.name}
                          </span>
                        )}
                      </div>

                      {/* Active Indicator or Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isActive && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePage(p.id);
                          }}
                          className="p-1 text-zinc-500 hover:text-white rounded hover:bg-[#27272a] transition-colors"
                          title="Duplicate Page"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {project.pages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(p.id);
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/20 transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="font-mono text-zinc-400 bg-black/40 px-1 py-0.5 rounded">
                        {p.slug}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{p.elements.length} elements</span>
                        <span className="font-mono">{p.canvasWidth}×{p.canvasHeight}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </aside>
  );
};
