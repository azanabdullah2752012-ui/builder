import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Sparkles,
  Palette,
  Smile,
  Layout,
  X,
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
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import { getSmartSectionOffsetY } from '../../constants/templates';

const QUICK_STICKERS = ['🥒', '🚀', '⭐', '🎮', '🐶', '🍕', '🍦', '🏆', '🔥', '💡', '🌈', '🎉'];

export const KidFriendlyDock: React.FC = () => {
  const {
    editorComplexity,
    setEditorComplexity,
    activePage,
    addElements,
    insertEmoji,
    updatePageSettings,
    updateElement,
    showToast,
  } = useEditor();

  const [activeModal, setActiveModal] = useState<'sites' | 'blocks' | 'themes' | 'stickers' | null>(null);

  if (editorComplexity !== 'simple') return null;

  // Handle Loading a Starter Site
  const handleLoadStarterSite = (site: KidStarterSite) => {
    playSound('pop');
    triggerConfetti();
    const elements = site.createElements();
    updatePageSettings(activePage.id, {
      backgroundColor: site.id === 'site-lemonade' ? '#1c1917' : site.id === 'site-science' ? '#0c1222' : site.id === 'site-pet' ? '#111827' : '#0d1117',
    });
    // Replace elements cleanly with the complete starter kit
    addElements(elements, true, true);
    showToast(`Loaded ${site.title}! 🎉`, 'success');
    setActiveModal(null);
  };

  // Handle Adding a Lego Block
  const handleAddBlock = (block: KidLegoBlock) => {
    playSound('pop');
    const offsetY = getSmartSectionOffsetY(activePage.elements, 60);
    const elements = block.create(offsetY);
    addElements(elements);
    showToast(`Added ${block.name}! 🧱`, 'success');
    setActiveModal(null);
  };

  // Handle Applying a Magic Theme
  const handleApplyTheme = (theme: MagicThemePalette) => {
    playSound('pop');
    triggerConfetti();
    // 1. Update page background
    updatePageSettings(activePage.id, { backgroundColor: theme.canvasBg });

    // 2. Harmonize section cards & buttons
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
    setActiveModal(null);
  };

  // Handle Adding a Quick Sticker
  const handleAddSticker = (emoji: string) => {
    playSound('pop');
    insertEmoji(emoji);
    showToast(`Added ${emoji} sticker!`, 'success');
  };

  return (
    <>
      {/* ── Floating Kid / Simple Dock at Canvas Bottom ── */}
      <aside
        aria-label="Simple Maker Tools"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(15, 17, 23, 0.94)',
          border: '1px solid #2a3147',
          boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.2)',
          borderRadius: 20,
          padding: '6px 10px',
          backdropFilter: 'blur(16px)',
          userSelect: 'none',
        }}
      >
        {/* Simple Mode Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 14,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
          title="Simple Maker Mode: Built for kids, students, and beginners"
        >
          <span>🧒</span>
          <span>Simple Mode</span>
        </div>

        <div style={{ width: 1, height: 18, background: '#272c3d' }} />

        {/* 1. Starter Sites Button */}
        <button
          onClick={() => {
            playSound('pop');
            setActiveModal(activeModal === 'sites' ? null : 'sites');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: activeModal === 'sites' ? '#6366f1' : 'rgba(99, 102, 241, 0.14)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={14} className="text-amber-300" />
          <span>Starter Sites</span>
        </button>

        {/* 2. Add Story Blocks */}
        <button
          onClick={() => {
            playSound('pop');
            setActiveModal(activeModal === 'blocks' ? null : 'blocks');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: activeModal === 'blocks' ? '#3b82f6' : 'rgba(59, 130, 246, 0.14)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Layout size={14} className="text-sky-300" />
          <span>+ Add Block</span>
        </button>

        {/* 3. Magic Themes */}
        <button
          onClick={() => {
            playSound('pop');
            setActiveModal(activeModal === 'themes' ? null : 'themes');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: activeModal === 'themes' ? '#ec4899' : 'rgba(236, 72, 153, 0.14)',
            border: '1px solid rgba(236, 72, 153, 0.35)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Palette size={14} className="text-pink-300" />
          <span>Magic Colors</span>
        </button>

        {/* 4. Stickers */}
        <button
          onClick={() => {
            playSound('pop');
            setActiveModal(activeModal === 'stickers' ? null : 'stickers');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: activeModal === 'stickers' ? '#eab308' : 'rgba(234, 179, 8, 0.14)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Smile size={14} className="text-yellow-300" />
          <span>Stickers</span>
        </button>

        <div style={{ width: 1, height: 18, background: '#272c3d' }} />

        {/* Pro Mode Switch */}
        <button
          onClick={() => {
            playSound('pop');
            setEditorComplexity('pro');
            showToast('Switched to Pro Designer Mode 🛠️', 'info');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 9px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid #232736',
            color: '#71717a',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
          title="Switch to Pro Designer mode for advanced CSS and sub-pixel tools"
        >
          <Zap size={11} className="text-amber-400" />
          <span>Pro Mode</span>
        </button>
      </aside>

      {/* ── MODAL 1: 1-Click Starter Sites ── */}
      {activeModal === 'sites' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 720,
              background: '#12141c',
              border: '1px solid #282e42',
              borderRadius: 24,
              boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #1f2536',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#151926',
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🌟</span>
                  <span>Pick Your Dream Starter Site</span>
                </h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                  100% complete, fully designed, and ready to publish. Even an 8-year-old can make it their own!
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Grid of Starter Sites */}
            <div
              style={{
                padding: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
                maxHeight: '65vh',
                overflowY: 'auto',
              }}
            >
              {KID_STARTER_SITES.map((site) => (
                <div
                  key={site.id}
                  onClick={() => handleLoadStarterSite(site)}
                  style={{
                    background: '#181b28',
                    border: '1px solid #262c3f',
                    borderRadius: 18,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = site.themeColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 12px 24px -6px ${site.themeColor}33`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#262c3f';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ fontSize: 32 }}>{site.emoji}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: site.themeColor,
                          background: `${site.themeColor}1a`,
                          border: `1px solid ${site.themeColor}44`,
                          padding: '3px 8px',
                          borderRadius: 8,
                          textTransform: 'uppercase',
                        }}
                      >
                        {site.badge}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>{site.title}</h4>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{site.description}</p>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        borderRadius: 10,
                        background: site.gradient,
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: `0 4px 12px ${site.themeColor}44`,
                      }}
                    >
                      Use This Site 🚀
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Add Story Blocks ── */}
      {activeModal === 'blocks' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              background: '#12141c',
              border: '1px solid #282e42',
              borderRadius: 24,
              boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #1f2536',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#151926',
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  🧱 Snap-Together Story Blocks
                </h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                  Click any block to snap it onto your page!
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {KID_LEGO_BLOCKS.map((block) => (
                <div
                  key={block.id}
                  onClick={() => handleAddBlock(block)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 14,
                    background: '#181b28',
                    border: '1px solid #282e42',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.background = '#1e2336';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#282e42';
                    e.currentTarget.style.background = '#181b28';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 28 }}>{block.emoji}</span>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0 }}>{block.name}</h4>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{block.description}</p>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: '#3b82f6',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    + Snap Block
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Magic Colors ── */}
      {activeModal === 'themes' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#12141c',
              border: '1px solid #282e42',
              borderRadius: 24,
              boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #1f2536',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#151926',
              }}
            >
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  🎨 1-Click Magic Color Palettes
                </h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                  Tap any color theme to instantly transform your whole website!
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {MAGIC_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => handleApplyTheme(theme)}
                  style={{
                    background: theme.cardBg,
                    border: `2px solid ${theme.cardBorder}`,
                    borderRadius: 16,
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
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
                  <span style={{ fontSize: 26 }}>{theme.emoji}</span>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: theme.textColor, margin: 0 }}>
                      {theme.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.accentColor }} />
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.buttonBg }} />
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: theme.canvasBg, border: '1px solid #444' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Stickers Popover ── */}
      {activeModal === 'stickers' && (
        <div
          onClick={() => setActiveModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: 90,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#161926',
              border: '1px solid #2a3147',
              borderRadius: 20,
              padding: '16px 20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxWidth: 420,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>⭐ Tap to Add Sticker</span>
              <button onClick={() => setActiveModal(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {QUICK_STICKERS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleAddSticker(emoji)}
                  style={{
                    fontSize: 28,
                    background: '#1e2338',
                    border: '1px solid #2f3752',
                    borderRadius: 12,
                    width: 52,
                    height: 52,
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
                    e.currentTarget.style.borderColor = '#2f3752';
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
