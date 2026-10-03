import React from 'react';
import { useEditor } from '../../context/useEditor';
import {
  LayoutGrid,
  Layers,
  Files,
  LayoutTemplate,
  Shapes,
  Square,
  Maximize2,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

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

  const navItems = [
    {
      id: 'elements' as const,
      label: 'Components',
      icon: <LayoutGrid size={17} />,
      onClick: () => handleTabClick('elements'),
      isActive: leftSidebarOpen && activeTab === 'elements',
    },
    {
      id: 'layers' as const,
      label: 'Layers',
      icon: <Layers size={17} />,
      onClick: () => handleTabClick('layers'),
      isActive: leftSidebarOpen && activeTab === 'layers',
    },
    {
      id: 'pages' as const,
      label: 'Pages',
      icon: <Files size={17} />,
      badge: project.pages.length,
      onClick: () => handleTabClick('pages'),
      isActive: leftSidebarOpen && activeTab === 'pages',
    },
  ];

  const toolItems = [
    {
      id: 'templates',
      label: 'Templates',
      icon: <LayoutTemplate size={17} />,
      onClick: () => {
        window.dispatchEvent(new CustomEvent('studio:open-templates'));
        if (!leftSidebarOpen) setLeftSidebarOpen(true);
        setActiveTab('elements');
      },
    },
    {
      id: 'shapes',
      label: 'Shapes',
      icon: <Shapes size={17} />,
      onClick: () => {
        if (!leftSidebarOpen) setLeftSidebarOpen(true);
        setActiveTab('elements');
        window.dispatchEvent(new CustomEvent('studio:open-shapes'));
      },
    },
    {
      id: 'container',
      label: 'Container',
      icon: <Square size={17} />,
      onClick: () => {
        addElement('container');
        showToast('Added container frame', 'info');
      },
    },
  ];

  return (
    <aside
      style={{
        width: 62,
        height: '100%',
        backgroundColor: '#0c0c0e',
        borderRight: '1px solid #1a1a1f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0 12px 0',
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Top Navigation Strip */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            title={item.label}
            style={{
              position: 'relative',
              width: 52,
              height: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              borderRadius: 8,
              border: item.isActive ? '1px solid #2a2a35' : '1px solid transparent',
              backgroundColor: item.isActive ? '#1a1a24' : 'transparent',
              color: item.isActive ? '#ffffff' : '#888892',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              if (!item.isActive) {
                e.currentTarget.style.backgroundColor = '#14141a';
                e.currentTarget.style.color = '#e2e2e8';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#888892';
              }
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
              {item.badge !== undefined && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -7,
                    minWidth: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 36, height: 1, backgroundColor: '#1a1a22', margin: '4px 0' }} />

        {/* Quick Tools */}
        {toolItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            title={item.label}
            style={{
              width: 52,
              height: 48,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              borderRadius: 8,
              border: '1px solid transparent',
              backgroundColor: 'transparent',
              color: '#767682',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#14141a';
              e.currentTarget.style.color = '#e2e2e8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#767682';
            }}
          >
            {item.icon}
            <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Rail Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('canvas:fit-to-screen'));
            showToast('Canvas fitted to screen', 'info');
          }}
          title="Fit Canvas to Screen"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#60606d',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#14141a';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#60606d';
          }}
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={() => {
            showToast('💡 Tips: Double click text to edit • Drag elements onto canvas • Del to remove', 'info');
          }}
          title="Keyboard shortcuts & tips"
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#60606d',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#14141a';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#60606d';
          }}
        >
          <HelpCircle size={15} />
        </button>

        <button
          type="button"
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          title={leftSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            border: leftSidebarOpen ? '1px solid #272733' : 'none',
            backgroundColor: leftSidebarOpen ? '#171720' : 'transparent',
            color: leftSidebarOpen ? '#a5b4fc' : '#60606d',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!leftSidebarOpen) {
              e.currentTarget.style.backgroundColor = '#14141a';
              e.currentTarget.style.color = '#ffffff';
            }
          }}
          onMouseLeave={(e) => {
            if (!leftSidebarOpen) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#60606d';
            }
          }}
        >
          {leftSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
        </button>
      </div>
    </aside>
  );
};
