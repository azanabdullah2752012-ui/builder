import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Palette,
  Maximize2,
  Plus,
  Check,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import {
  CANVAS_COLOR_CATEGORIES,
  CANVAS_GRADIENTS,
  CANVAS_PATTERNS,
  CURATED_CANVAS_IMAGES,
  CANVAS_SIZE_PRESETS,
  CANVAS_BORDER_RADIUS_PRESETS,
  CANVAS_SHADOW_PRESETS,
} from '../../utils/canvasBackground';
import type { CanvasBackgroundPattern } from '../../types/editor';
import { playSound } from '../../utils/interactiveEffects';

export const CanvasPropertiesEditor: React.FC = () => {
  const { activePage, updatePageSettings, showToast, appTheme } = useEditor();
  const isLight = appTheme === 'light';

  const [bgTab, setBgTab] = useState<'solid' | 'gradient' | 'pattern' | 'image'>('solid');
  const [selectedColorCat, setSelectedColorCat] = useState<string>('candy-playful');

  // Custom Gradient Builder local state
  const [gradStart, setGradStart] = useState<string>(isLight ? '#f8fafc' : '#0c0e14');
  const [gradEnd, setGradEnd] = useState<string>(isLight ? '#e2e8f0' : '#131620');
  const [gradAngle, setGradAngle] = useState<string>('180deg');

  // Apply custom gradient
  const applyCustomGradient = (start = gradStart, end = gradEnd, angle = gradAngle) => {
    let gradString = '';
    if (angle === 'radial') {
      gradString = `radial-gradient(circle at 50% 30%, ${start} 0%, ${end} 100%)`;
    } else {
      gradString = `linear-gradient(${angle}, ${start} 0%, ${end} 100%)`;
    }
    updatePageSettings(activePage.id, {
      backgroundGradient: gradString,
      backgroundColor: start,
      backgroundImage: undefined,
    });
    playSound('pop');
    showToast('Applied custom gradient ✨', 'success');
  };

  // Fit canvas height to fit all content with comfortable breathing room
  const handleFitElementsHeight = () => {
    if (!activePage.elements || activePage.elements.length === 0) {
      updatePageSettings(activePage.id, { canvasHeight: 800 });
      showToast('Set default height 800px', 'info');
      return;
    }
    const maxBottom = activePage.elements.reduce(
      (max, el) => Math.max(max, el.y + el.height),
      0
    );
    const newHeight = Math.max(800, maxBottom + 120);
    updatePageSettings(activePage.id, { canvasHeight: newHeight });
    playSound('pop');
    showToast(`Canvas height fitted to content: ${newHeight}px 📐`, 'success');
  };

  const currentBg = activePage.backgroundColor || '#ffffff';
  const currentGrad = activePage.backgroundGradient;
  const currentPattern = activePage.backgroundPattern || 'none';
  const currentImage = activePage.backgroundImage;

  // Reusable card styling
  const cardStyle: React.CSSProperties = {
    background: 'var(--studio-card-item-bg)',
    border: '1px solid var(--studio-card-item-border)',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: 11,
    outline: 'none',
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none" style={{ color: 'var(--text-main)' }}>
      {/* 1. Page Name & Slug */}
      <div style={cardStyle}>
        <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Page Title & Identifier
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            value={activePage.name}
            onChange={(e) => updatePageSettings(activePage.id, { name: e.target.value })}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Home Page"
          />
          <span style={{ fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{activePage.slug || 'home'}</span>
        </div>
      </div>

      {/* 2. Canvas Surface & Background Styling */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-main)' }}>Canvas Surface</span>
          </div>

          {/* Quick Clear / Reset Background */}
          {(currentGrad || currentPattern !== 'none' || currentImage) && (
            <button
              type="button"
              onClick={() => {
                updatePageSettings(activePage.id, {
                  backgroundGradient: undefined,
                  backgroundPattern: 'none',
                  backgroundImage: undefined,
                  backgroundColor: '#ffffff',
                });
                playSound('pop');
                showToast('Reset surface to plain white', 'info');
              }}
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Surface Fill Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--studio-pill-bg)',
            border: '1px solid var(--studio-pill-border)',
            borderRadius: 8,
            padding: 2,
            gap: 2,
          }}
        >
          {(['solid', 'gradient', 'pattern', 'image'] as const).map((tab) => {
            const on = bgTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setBgTab(tab)}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 10.5,
                  fontWeight: on ? 600 : 500,
                  background: on ? 'var(--studio-pill-active-bg)' : 'transparent',
                  color: on ? 'var(--studio-pill-active-text)' : 'var(--studio-pill-inactive-text)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.12s ease',
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SOLID COLORS */}
        {bgTab === 'solid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
              {CANVAS_COLOR_CATEGORIES.map((cat) => {
                const on = selectedColorCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedColorCat(cat.id)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: on ? 600 : 400,
                      whiteSpace: 'nowrap',
                      background: on ? 'var(--primary)' : 'var(--studio-pill-bg)',
                      border: on ? '1px solid transparent' : '1px solid var(--studio-pill-border)',
                      color: on ? '#ffffff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Color Swatch Grid */}
            {(() => {
              const currentCat =
                CANVAS_COLOR_CATEGORIES.find((c) => c.id === selectedColorCat) ||
                CANVAS_COLOR_CATEGORIES[0];
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {currentCat.colors.map((color) => {
                    const isSelected =
                      !currentGrad &&
                      !currentImage &&
                      currentBg.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={`${color.name}-${color.hex}`}
                        type="button"
                        onClick={() => {
                          updatePageSettings(activePage.id, {
                            backgroundColor: color.hex,
                            backgroundGradient: undefined,
                            backgroundImage: undefined,
                          });
                          playSound('pop');
                        }}
                        title={color.name}
                        style={{
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: color.hex,
                          border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(120, 120, 120, 0.25)',
                          boxShadow: isSelected ? '0 0 10px rgba(16, 118, 252, 0.4)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: isSelected ? 'scale(1.05)' : 'none',
                          transition: 'transform 0.12s',
                        }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 drop-shadow ${
                              ['#ffffff', '#f8fafc', '#F4F2EC', '#fbf9f5'].includes(color.hex)
                                ? 'text-black'
                                : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Custom Hex Picker Input & Pipette */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4, borderTop: '1px solid var(--studio-card-item-border)' }}>
              <label
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: '1px solid var(--studio-card-item-border)',
                  backgroundColor: currentBg,
                  flexShrink: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                title="Open native color picker"
              >
                <input
                  type="color"
                  value={currentBg.startsWith('#') && currentBg.length === 7 ? currentBg : '#ffffff'}
                  onChange={(e) =>
                    updatePageSettings(activePage.id, {
                      backgroundColor: e.target.value,
                      backgroundGradient: undefined,
                      backgroundImage: undefined,
                    })
                  }
                  style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </label>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  borderRadius: 8,
                  padding: '4px 8px',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11, marginRight: 4 }}>#</span>
                <input
                  type="text"
                  value={currentBg.replace('#', '')}
                  onChange={(e) => {
                    const val = '#' + e.target.value.replace('#', '');
                    updatePageSettings(activePage.id, {
                      backgroundColor: val,
                      backgroundGradient: undefined,
                      backgroundImage: undefined,
                    });
                  }}
                  style={{ background: 'transparent', color: 'var(--input-text)', fontFamily: 'monospace', fontSize: 11, outline: 'none', width: '100%', textTransform: 'uppercase' }}
                  placeholder="FFFFFF"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  updatePageSettings(activePage.id, {
                    backgroundColor: 'transparent',
                    backgroundGradient: undefined,
                    backgroundImage: undefined,
                  })
                }
                style={{
                  padding: '5px 10px',
                  background: 'var(--studio-pill-bg)',
                  border: '1px solid var(--studio-pill-border)',
                  color: 'var(--text-main)',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Clear background to transparent"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GRADIENTS */}
        {bgTab === 'gradient' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Curated Gradients Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {CANVAS_GRADIENTS.map((grad) => {
                const isSelected = currentGrad === grad.gradient;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => {
                      updatePageSettings(activePage.id, {
                        backgroundGradient: grad.gradient,
                        backgroundImage: undefined,
                      });
                      playSound('pop');
                    }}
                    style={{
                      height: 44,
                      borderRadius: 8,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(120, 120, 120, 0.25)',
                      padding: 6,
                      textAlign: 'left',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      backgroundImage: grad.gradient,
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: grad.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                        color: grad.dark ? '#ffffff' : '#0f172a',
                        maxWidth: 'fit-content',
                      }}
                    >
                      {grad.name}
                    </span>
                    {isSelected && (
                      <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Gradient Builder */}
            <div style={{ paddingTop: 8, borderTop: '1px solid var(--studio-card-item-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Custom Gradient Studio
              </span>

              {/* Angle Direction Selector */}
              <div style={{ display: 'flex', gap: 2, background: 'var(--studio-pill-bg)', border: '1px solid var(--studio-pill-border)', borderRadius: 8, padding: 2 }}>
                {[
                  { label: '180° ↓', value: '180deg' },
                  { label: '135° ↘', value: '135deg' },
                  { label: '90° →', value: '90deg' },
                  { label: '45° ↗', value: '45deg' },
                  { label: 'Radial ⊙', value: 'radial' },
                ].map((a) => {
                  const on = gradAngle === a.value;
                  return (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => {
                        setGradAngle(a.value);
                        applyCustomGradient(gradStart, gradEnd, a.value);
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: 10,
                        fontWeight: on ? 700 : 500,
                        background: on ? 'var(--primary)' : 'transparent',
                        color: on ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>

              {/* Color Stop 1 & Color Stop 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '4px 8px' }}>
                  <label
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '1px solid var(--studio-card-item-border)',
                      backgroundColor: gradStart,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="color"
                      value={gradStart}
                      onChange={(e) => {
                        setGradStart(e.target.value);
                        applyCustomGradient(e.target.value, gradEnd, gradAngle);
                      }}
                      style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                  </label>
                  <span style={{ fontSize: 10.5, color: 'var(--text-main)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {gradStart}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 8, padding: '4px 8px' }}>
                  <label
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '1px solid var(--studio-card-item-border)',
                      backgroundColor: gradEnd,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="color"
                      value={gradEnd}
                      onChange={(e) => {
                        setGradEnd(e.target.value);
                        applyCustomGradient(gradStart, e.target.value, gradAngle);
                      }}
                      style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                  </label>
                  <span style={{ fontSize: 10.5, color: 'var(--text-main)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {gradEnd}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PATTERNS */}
        {bgTab === 'pattern' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {CANVAS_PATTERNS.map((pat) => {
                const isSelected = currentPattern === pat.id;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => {
                      updatePageSettings(activePage.id, {
                        backgroundPattern: pat.id as CanvasBackgroundPattern,
                      });
                      playSound('pop');
                    }}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--studio-card-item-border)',
                      background: isSelected ? 'var(--studio-pill-active-bg)' : 'var(--studio-pill-bg)',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 11 }}>{pat.name}</span>
                      {isSelected && <Check className="w-3 h-3" style={{ color: 'var(--primary)' }} />}
                    </div>
                    <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{pat.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Pattern Opacity Slider */}
            {currentPattern !== 'none' && (
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--studio-card-item-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>Pattern Opacity</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>
                    {Math.round((activePage.patternOpacity ?? 0.2) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.6"
                  step="0.02"
                  value={activePage.patternOpacity ?? 0.2}
                  onChange={(e) =>
                    updatePageSettings(activePage.id, {
                      patternOpacity: parseFloat(e.target.value),
                    })
                  }
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMAGE */}
        {bgTab === 'image' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Custom Image URL input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Image URL
              </span>
              <input
                type="text"
                value={activePage.backgroundImage || ''}
                onChange={(e) =>
                  updatePageSettings(activePage.id, {
                    backgroundImage: e.target.value.trim() || undefined,
                  })
                }
                style={inputStyle}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Curated Aesthetic Backdrops */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Curated Studio Backdrops
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {CURATED_CANVAS_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => {
                      updatePageSettings(activePage.id, {
                        backgroundImage: img.url,
                        backgroundGradient: undefined,
                      });
                      playSound('pop');
                      showToast(`Loaded ${img.label}`, 'success');
                    }}
                    style={{
                      height: 60,
                      borderRadius: 8,
                      border: activePage.backgroundImage === img.url ? '2px solid var(--primary)' : '1px solid var(--studio-card-item-border)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: 6, display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: '#ffffff' }}>
                        {img.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Canvas Dimensions & Quick Sizing Presets */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Maximize2 className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-main)' }}>Dimensions & Presets</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>Desktop Base</span>
        </div>

        {/* Width & Height Number Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', width: 14 }}>W</span>
            <input
              type="number"
              value={activePage.canvasWidth}
              onChange={(e) =>
                updatePageSettings(activePage.id, {
                  canvasWidth: Math.max(320, Number(e.target.value) || 1200),
                })
              }
              style={{ background: 'transparent', color: 'var(--input-text)', fontFamily: 'monospace', fontSize: 11, outline: 'none', width: '100%', border: 'none' }}
            />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>px</span>
          </div>

          <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', width: 14 }}>H</span>
            <input
              type="number"
              value={activePage.canvasHeight}
              onChange={(e) =>
                updatePageSettings(activePage.id, {
                  canvasHeight: Math.max(400, Number(e.target.value) || 800),
                })
              }
              style={{ background: 'transparent', color: 'var(--input-text)', fontFamily: 'monospace', fontSize: 11, outline: 'none', width: '100%', border: 'none' }}
            />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>px</span>
          </div>
        </div>

        {/* 1-Click Popular Size Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Quick Artboard Presets
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {CANVAS_SIZE_PRESETS.map((preset) => {
              const isActive =
                activePage.canvasWidth === preset.width && activePage.canvasHeight === preset.height;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    updatePageSettings(activePage.id, {
                      canvasWidth: preset.width,
                      canvasHeight: preset.height,
                    });
                    playSound('pop');
                    showToast(`Canvas resized to ${preset.label} 📐`, 'info');
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isActive ? 'var(--primary)' : 'var(--studio-pill-bg)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: 11 }}>{preset.label.split(' ')[0]}</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: isActive ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)' }}>
                    {preset.width}w
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Height Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingTop: 6, borderTop: '1px solid var(--studio-card-item-border)' }}>
          <button
            type="button"
            onClick={() => {
              updatePageSettings(activePage.id, {
                canvasHeight: (activePage.canvasHeight || 800) + 400,
              });
              playSound('pop');
              showToast('Added 400px height ↕', 'info');
            }}
            style={{
              padding: '6px 10px',
              background: 'var(--studio-pill-bg)',
              border: '1px solid var(--studio-pill-border)',
              borderRadius: 8,
              color: 'var(--text-main)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
          >
            <Plus className="w-3 h-3" style={{ color: 'var(--primary)' }} />
            <span>+ 400px Height</span>
          </button>

          <button
            type="button"
            onClick={handleFitElementsHeight}
            style={{
              padding: '6px 10px',
              background: 'var(--studio-pill-bg)',
              border: '1px solid var(--studio-pill-border)',
              borderRadius: 8,
              color: 'var(--text-main)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'background 0.12s',
            }}
          >
            <Sliders className="w-3 h-3" style={{ color: 'var(--primary)' }} />
            <span>Fit to Content</span>
          </button>
        </div>
      </div>

      {/* 4. Canvas Frame (Radius & Shadow) */}
      <div style={cardStyle}>
        <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-main)' }}>Frame Styling</span>

        {/* Corner Radius Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
            <span>Corner Radius</span>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-main)', fontWeight: 600 }}>{activePage.canvasBorderRadius ?? 16}px</span>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--studio-pill-bg)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 3 }}>
            {CANVAS_BORDER_RADIUS_PRESETS.map((rad) => {
              const on = (activePage.canvasBorderRadius ?? 16) === rad.value;
              return (
                <button
                  key={rad.value}
                  type="button"
                  onClick={() => {
                    updatePageSettings(activePage.id, { canvasBorderRadius: rad.value });
                    playSound('pop');
                  }}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 10.5,
                    fontWeight: on ? 700 : 500,
                    background: on ? 'var(--primary)' : 'transparent',
                    color: on ? '#ffffff' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                  }}
                >
                  {rad.value}px
                </button>
              );
            })}
          </div>
        </div>

        {/* Shadow Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Artboard Elevation</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {CANVAS_SHADOW_PRESETS.map((shad) => {
              const isSelected = (activePage.canvasShadow ?? CANVAS_SHADOW_PRESETS[0].shadow) === shad.shadow;
              return (
                <button
                  key={shad.id}
                  type="button"
                  onClick={() => {
                    updatePageSettings(activePage.id, { canvasShadow: shad.shadow });
                    playSound('pop');
                  }}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary)' : 'var(--studio-pill-bg)',
                    color: isSelected ? '#ffffff' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 10.5,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                  }}
                >
                  {shad.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Reading Progress Bar */}
      <div style={{ ...cardStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-main)' }}>Reading Progress Bar</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Top sticky indicator as visitor scrolls</span>
        </div>
        <input
          type="checkbox"
          checked={activePage.showScrollProgress ?? false}
          onChange={(e) => updatePageSettings(activePage.id, { showScrollProgress: e.target.checked })}
          style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};
