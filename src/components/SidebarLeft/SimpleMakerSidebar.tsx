import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Layout,
  Plus,
  Type,
  MousePointerClick,
  Image as ImageIcon,
  Quote,
  Zap,
} from 'lucide-react';
import {
  KID_STARTER_SITES,
  KID_LEGO_BLOCKS,
  MAGIC_THEMES,
  type KidStarterSite,
  type KidLegoBlock,
  type MagicThemePalette,
} from '../../constants/kidTemplates';
import { getSmartSectionOffsetY } from '../../constants/templates';
import { createElement } from '../../constants/defaults';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';

const FUN_STICKERS = [
  '🥒', '🚀', '⭐', '🎮', '🐶', '🍕', '🍦', '🏆',
  '🔥', '💡', '🌈', '🎉', '🐱', '🎸', '⚽', '🍩',
  '🎨', '👾', '💎', '🍿', '🧁', '🎯', '🥇', '🤖',
];

export const SimpleMakerSidebar: React.FC = () => {
  const {
    activePage,
    addElements,
    insertEmoji,
    updatePageSettings,
    updateElement,
    setEditorComplexity,
    showToast,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<'sites' | 'blocks' | 'themes' | 'stickers' | 'basics'>('sites');

  // Load a complete starter site
  const handleLoadSite = (site: KidStarterSite) => {
    playSound('pop');
    triggerConfetti();
    const els = site.createElements();
    updatePageSettings(activePage.id, {
      backgroundColor: site.id === 'site-lemonade' ? '#1c1917' : site.id === 'site-science' ? '#0c1222' : site.id === 'site-pet' ? '#111827' : '#0d1117',
    });
    addElements(els, true, true);
    showToast(`Loaded ${site.title}! 🎉`, 'success');
  };

  // Add a Lego Block
  const handleAddBlock = (block: KidLegoBlock) => {
    playSound('pop');
    const offsetY = getSmartSectionOffsetY(activePage.elements, 60);
    const els = block.create(offsetY);
    addElements(els);
    showToast(`Added ${block.name}! 🧱`, 'success');
  };

  // Apply Magic Theme
  const handleApplyTheme = (theme: MagicThemePalette) => {
    playSound('pop');
    triggerConfetti();
    updatePageSettings(activePage.id, { backgroundColor: theme.canvasBg });

    activePage.elements.forEach((el) => {
      if (el.type === 'section' || el.type === 'container') {
        updateElement(el.id, {
          styles: {
            ...el.styles,
            backgroundColor: theme.cardBg,
            borderColor: theme.cardBorder,
          },
        });
      } else if (el.type === 'button') {
        updateElement(el.id, {
          styles: {
            ...el.styles,
            backgroundColor: theme.buttonBg,
            color: theme.buttonText,
          },
        });
      }
    });

    showToast(`Applied ${theme.emoji} ${theme.name} Theme!`, 'success');
  };

  // Add Basic Element
  const handleAddBasic = (type: 'title' | 'button' | 'image' | 'box' | 'message') => {
    playSound('pop');
    const offsetY = getSmartSectionOffsetY(activePage.elements, 60);

    if (type === 'title') {
      const el = createElement('text', 40, offsetY);
      el.content = 'My Awesome New Section 🌟';
      el.width = 600;
      el.height = 48;
      el.styles = { ...el.styles, fontSize: 32, fontWeight: 800, color: '#ffffff' };
      addElements([el]);
      showToast('Added Big Title! ✏️', 'success');
    } else if (type === 'button') {
      const el = createElement('button', 40, offsetY);
      el.content = 'Click Me! 🎉';
      el.width = 160;
      el.height = 44;
      el.styles = { ...el.styles, backgroundColor: '#10b981', color: '#ffffff', borderRadius: 12, fontWeight: 700 };
      el.behavior = { actionType: 'confetti', actionSound: 'pop' };
      addElements([el]);
      showToast('Added Fun Button! 🔘', 'success');
    } else if (type === 'image') {
      const el = createElement('image', 40, offsetY);
      el.content = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80';
      el.width = 400;
      el.height = 260;
      el.styles = { ...el.styles, borderRadius: 16 };
      addElements([el]);
      showToast('Added Photo! 🖼️', 'success');
    } else if (type === 'box') {
      const el = createElement('container', 40, offsetY);
      el.name = 'Story Card';
      el.width = 400;
      el.height = 200;
      el.styles = { ...el.styles, backgroundColor: '#161926', borderColor: '#2b324c', borderWidth: 1, borderRadius: 16 };
      addElements([el]);
      showToast('Added Card Container! 📦', 'success');
    } else if (type === 'message') {
      const offsetY = getSmartSectionOffsetY(activePage.elements, 60);
      const els = KID_LEGO_BLOCKS.find((b) => b.id === 'block-guestbook')?.create(offsetY) || [];
      addElements(els);
      showToast('Added Message Box! 📬', 'success');
    }
  };

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0d0d10',
        color: '#d4d4d8',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        overflow: 'hidden',
        borderRight: '1px solid #1a1a20',
      }}
    >
      {/* ── Top Header ── */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #1a1a20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#12141c',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🧒</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Simple Maker
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              padding: '2px 6px',
              borderRadius: 6,
              textTransform: 'uppercase',
            }}
          >
            Zero Code
          </span>
        </div>

        <button
          onClick={() => {
            playSound('pop');
            setEditorComplexity('pro');
            showToast('Switched to Pro Mode 🛠️', 'info');
          }}
          title="Switch to Pro Mode"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            fontSize: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Zap size={11} className="text-amber-400" />
          <span>Pro</span>
        </button>
      </div>

      {/* ── Visual Navigation Pills ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          padding: '8px 10px',
          background: '#0f1118',
          borderBottom: '1px solid #1a1a20',
        }}
      >
        {[
          { id: 'sites' as const, label: 'Sites', icon: '🌟' },
          { id: 'blocks' as const, label: 'Blocks', icon: '🧱' },
          { id: 'themes' as const, label: 'Colors', icon: '🎨' },
          { id: 'stickers' as const, label: 'Stickers', icon: '🦄' },
          { id: 'basics' as const, label: 'Basics', icon: '➕' },
        ].map((tab) => {
          const on = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound('pop');
                setActiveTab(tab.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '6px 2px',
                borderRadius: 8,
                border: 'none',
                background: on ? '#1e2438' : 'transparent',
                color: on ? '#38bdf8' : '#71717a',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span style={{ fontSize: 10, fontWeight: on ? 700 : 500 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Scrollable Tab Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {/* 1. STARTER SITES TAB */}
        {activeTab === 'sites' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '4px 2px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                🌟 Complete Starter Sites
              </h4>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                Tap any site to load it instantly onto your canvas!
              </p>
            </div>

            {KID_STARTER_SITES.map((site) => (
              <div
                key={site.id}
                onClick={() => handleLoadSite(site)}
                style={{
                  background: '#151824',
                  border: '1px solid #23293d',
                  borderRadius: 14,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = site.themeColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#23293d';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{site.emoji}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: site.themeColor,
                      background: `${site.themeColor}1a`,
                      padding: '2px 6px',
                      borderRadius: 6,
                    }}
                  >
                    {site.badge}
                  </span>
                </div>
                <h5 style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                  {site.title}
                </h5>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {site.description}
                </p>
                <div
                  style={{
                    width: '100%',
                    padding: '6px 0',
                    borderRadius: 8,
                    background: site.gradient,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
                  Load This Site 🚀
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. LEGO BLOCKS TAB */}
        {activeTab === 'blocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '4px 2px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                🧱 Snap-Together Blocks
              </h4>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                Tap to drop a ready-made section onto your page!
              </p>
            </div>

            {KID_LEGO_BLOCKS.map((block) => (
              <div
                key={block.id}
                onClick={() => handleAddBlock(block)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  borderRadius: 12,
                  background: '#151824',
                  border: '1px solid #23293d',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#38bdf8';
                  e.currentTarget.style.background = '#1c2133';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#23293d';
                  e.currentTarget.style.background = '#151824';
                }}
              >
                <span style={{ fontSize: 24 }}>{block.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h5 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {block.name}
                  </h5>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {block.description}
                  </p>
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: '#38bdf8',
                    color: '#0f172a',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  + Add
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. MAGIC THEMES TAB */}
        {activeTab === 'themes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '4px 2px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                🎨 1-Click Magic Themes
              </h4>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                Tap a palette to transform your whole site's colors!
              </p>
            </div>

            {MAGIC_THEMES.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleApplyTheme(theme)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: theme.cardBg,
                  border: `2px solid ${theme.cardBorder}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accentColor;
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.cardBorder;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{theme.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: theme.textColor }}>
                    {theme.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.accentColor }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.buttonBg }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.canvasBg, border: '1px solid #444' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. STICKERS TAB */}
        {activeTab === 'stickers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '4px 2px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                🦄 Fun Stickers & Stamps
              </h4>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                Tap any sticker to stamp it onto the page!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {FUN_STICKERS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    playSound('pop');
                    insertEmoji(emoji);
                    showToast(`Added ${emoji} sticker!`, 'success');
                  }}
                  style={{
                    fontSize: 26,
                    background: '#151824',
                    border: '1px solid #23293d',
                    borderRadius: 10,
                    height: 48,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.15)';
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '#23293d';
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. BASICS TAB */}
        {activeTab === 'basics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ padding: '4px 2px' }}>
              <h4 style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                ➕ Simple Elements
              </h4>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                Quick single pieces you can drop anywhere:
              </p>
            </div>

            {[
              { type: 'title' as const, label: 'Big Title Words', icon: <Type size={16} className="text-emerald-400" />, desc: 'Large heading for your topic' },
              { type: 'button' as const, label: 'Confetti Button', icon: <MousePointerClick size={16} className="text-amber-400" />, desc: 'Clickable button with confetti explosion' },
              { type: 'image' as const, label: 'Picture Photo', icon: <ImageIcon size={16} className="text-sky-400" />, desc: 'Add a puppy or rocket photo' },
              { type: 'box' as const, label: 'Story Card Box', icon: <Layout size={16} className="text-purple-400" />, desc: 'A container card to put things inside' },
              { type: 'message' as const, label: 'Message Box', icon: <Quote size={16} className="text-rose-400" />, desc: 'Guestbook for friends to leave notes' },
            ].map((item) => (
              <div
                key={item.type}
                onClick={() => handleAddBasic(item.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  borderRadius: 10,
                  background: '#151824',
                  border: '1px solid #23293d',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#1a2030';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#23293d';
                  e.currentTarget.style.background = '#151824';
                }}
              >
                <div style={{ padding: 6, borderRadius: 8, background: '#1e2436' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h5 style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    {item.label}
                  </h5>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>
                    {item.desc}
                  </p>
                </div>
                <Plus size={14} className="text-emerald-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
