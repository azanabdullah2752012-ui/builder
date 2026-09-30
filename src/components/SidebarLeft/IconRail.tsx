import React from 'react';
import { useEditor } from '../../context/useEditor';
import {
  LayoutGrid,
  MoveHorizontal,
  Square,
  Layers,
  Files,
  Copy,
  Crop,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import type { ElementType } from '../../types/editor';

interface IconRailProps {
  activeTab: 'elements' | 'layers' | 'pages';
  setActiveTab: (tab: 'elements' | 'layers' | 'pages') => void;
}

export const IconRail: React.FC<IconRailProps> = ({ activeTab, setActiveTab }) => {
  const {
    project,
    leftSidebarOpen,
    setLeftSidebarOpen,
    addElement,
    selectElement,
    showToast,
  } = useEditor();

  const handleTabClick = (tab: 'elements' | 'layers' | 'pages') => {
    if (!leftSidebarOpen) {
      setLeftSidebarOpen(true);
      setActiveTab(tab);
    } else if (activeTab === tab) {
      setLeftSidebarOpen(false);
    } else {
      setActiveTab(tab);
    }
  };

  const handleQuickAdd = (type: ElementType) => {
    addElement(type);
  };

  return (
    <div className="w-12 h-full bg-[#121214] border-r border-[#222226] flex flex-col items-center py-3 select-none shrink-0 z-20 justify-between text-zinc-400">
      {/* Top Tools Matching Reference Mockup */}
      <div className="flex flex-col items-center gap-2">
        {/* 1. Grid / Elements (Active pill outline) */}
        <button
          onClick={() => handleTabClick('elements')}
          className={`p-2 rounded-lg transition-all ${
            leftSidebarOpen && activeTab === 'elements'
              ? 'bg-[#222226] text-white shadow-sm'
              : 'hover:bg-[#1c1c20] hover:text-zinc-200'
          }`}
          title="Components & Elements"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* 2. Move / Selection Tool */}
        <button
          onClick={() => {
            selectElement(null);
            showToast('Selection cleared • Drag mode active', 'info');
          }}
          className="p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors text-zinc-400"
          title="Move & Select Tool (Clear Selection)"
        >
          <MoveHorizontal className="w-4 h-4" />
        </button>

        {/* 3. Rectangle / Container Frame */}
        <button
          onClick={() => handleQuickAdd('container')}
          className="p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors text-zinc-400"
          title="Add Container / Frame"
        >
          <Square className="w-4 h-4" />
        </button>

        {/* 4. Layers Tree */}
        <button
          onClick={() => handleTabClick('layers')}
          className={`p-2 rounded-lg transition-all ${
            leftSidebarOpen && activeTab === 'layers'
              ? 'bg-[#222226] text-white shadow-sm'
              : 'hover:bg-[#1c1c20] hover:text-zinc-200'
          }`}
          title="Layers & Hierarchy"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* 5. Pages & Multi-page Routing */}
        <button
          onClick={() => handleTabClick('pages')}
          className={`p-2 rounded-lg transition-all relative ${
            leftSidebarOpen && activeTab === 'pages'
              ? 'bg-[#222226] text-white shadow-sm'
              : 'hover:bg-[#1c1c20] hover:text-zinc-200'
          }`}
          title="Pages & Routing"
        >
          <Files className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-600 text-[9px] font-bold text-white rounded-full flex items-center justify-center">
            {project.pages.length}
          </span>
        </button>

        {/* 5. Components / Cards */}
        <button
          onClick={() => handleQuickAdd('section')}
          className="p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors text-zinc-400"
          title="Add Section"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* 6. Crop / Fit to Screen Tool */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('canvas:fit-to-screen'));
            showToast('Canvas fitted to screen', 'info');
          }}
          className="p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors text-zinc-400"
          title="Fit Canvas to Screen"
        >
          <Crop className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Rail Actions Matching Reference Mockup */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => {
            showToast('💡 Double-click text to edit • Drag handles/edges to resize • Backspace to delete', 'info');
          }}
          className="p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors text-zinc-500 hover:text-zinc-300"
          title="Help & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={() => setLeftSidebarOpen((o) => !o)}
          className={`p-2 rounded-lg hover:bg-[#1c1c20] hover:text-zinc-200 transition-colors ${
            leftSidebarOpen ? 'text-zinc-400' : 'text-blue-400'
          }`}
          title={leftSidebarOpen ? 'Collapse Left Drawer' : 'Expand Left Drawer'}
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
