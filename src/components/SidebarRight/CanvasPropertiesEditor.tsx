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
  const { activePage, updatePageSettings, showToast } = useEditor();

  const [bgTab, setBgTab] = useState<'solid' | 'gradient' | 'pattern' | 'image'>('solid');
  const [selectedColorCat, setSelectedColorCat] = useState<string>('dark-luxury');

  // Custom Gradient Builder local state
  const [gradStart, setGradStart] = useState<string>('#101510');
  const [gradEnd, setGradEnd] = useState<string>('#1c241b');
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

  return (
    <div className="flex flex-col gap-5 text-xs text-zinc-300">
      {/* 1. Page Name & Slug */}
      <div className="bg-[#141914] border border-[#2a3528] rounded-xl p-3">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
          Page Title & Identifier
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={activePage.name}
            onChange={(e) => updatePageSettings(activePage.id, { name: e.target.value })}
            className="flex-1 bg-[#1c241b] border border-[#354331] rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs outline-none focus:border-[#B8F36B] transition-colors"
            placeholder="Home Page"
          />
          <span className="text-[10px] text-zinc-500 font-mono">/{activePage.slug || 'home'}</span>
        </div>
      </div>

      {/* 2. Canvas Surface & Background Styling */}
      <div className="bg-[#141914] border border-[#2a3528] rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-[#B8F36B]" />
            <span className="font-semibold text-zinc-100 text-xs">Canvas Surface</span>
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
              className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Surface Fill Tabs */}
        <div className="flex items-center bg-[#101510] border border-[#2a3528] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setBgTab('solid')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
              bgTab === 'solid'
                ? 'bg-[#222c20] text-[#B8F36B] shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Solid
          </button>
          <button
            type="button"
            onClick={() => setBgTab('gradient')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
              bgTab === 'gradient'
                ? 'bg-[#222c20] text-[#B8F36B] shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Gradient
          </button>
          <button
            type="button"
            onClick={() => setBgTab('pattern')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
              bgTab === 'pattern'
                ? 'bg-[#222c20] text-[#B8F36B] shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Pattern
          </button>
          <button
            type="button"
            onClick={() => setBgTab('image')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
              bgTab === 'image'
                ? 'bg-[#222c20] text-[#B8F36B] shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Image
          </button>
        </div>

        {/* TAB 1: SOLID COLORS */}
        {bgTab === 'solid' && (
          <div className="flex flex-col gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CANVAS_COLOR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedColorCat(cat.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-colors ${
                    selectedColorCat === cat.id
                      ? 'bg-[#B8F36B] text-black font-semibold'
                      : 'bg-[#1c241b] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Color Swatch Grid */}
            {(() => {
              const currentCat =
                CANVAS_COLOR_CATEGORIES.find((c) => c.id === selectedColorCat) ||
                CANVAS_COLOR_CATEGORIES[0];
              return (
                <div className="grid grid-cols-4 gap-2">
                  {currentCat.colors.map((color) => {
                    const isSelected =
                      !currentGrad &&
                      !currentImage &&
                      currentBg.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
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
                        className={`h-9 rounded-lg border relative flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[#B8F36B] shadow-[0_0_10px_rgba(184,243,107,0.5)] scale-105 z-10'
                            : 'border-[#2f3c2c] hover:border-zinc-400 hover:scale-[1.02]'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 drop-shadow ${
                              ['#ffffff', '#f8fafc', '#F4F2EC', '#fbf9f5', '#B8F36B'].includes(
                                color.hex
                              )
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
            <div className="flex items-center gap-2 pt-1 border-t border-[#2a3528]">
              <label
                className="w-7 h-7 rounded-lg border border-[#354331] shrink-0 cursor-pointer overflow-hidden relative shadow-sm"
                style={{ backgroundColor: currentBg }}
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
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
              </label>

              <div className="flex-1 flex items-center bg-[#1c241b] border border-[#354331] rounded-lg px-2 py-1">
                <span className="text-zinc-500 font-mono text-[11px] mr-1">#</span>
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
                  className="bg-transparent text-zinc-100 font-mono text-xs outline-none w-full uppercase"
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
                className="px-2 py-1 bg-[#1c241b] hover:bg-[#253023] border border-[#354331] rounded-lg text-zinc-400 hover:text-zinc-200 text-[10px] font-medium transition-colors"
                title="Clear background to transparent"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GRADIENTS */}
        {bgTab === 'gradient' && (
          <div className="flex flex-col gap-3">
            {/* Curated Gradients Grid */}
            <div className="grid grid-cols-2 gap-2">
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
                    className={`h-11 rounded-lg border p-1.5 text-left relative flex flex-col justify-end transition-all ${
                      isSelected
                        ? 'border-[#B8F36B] shadow-[0_0_12px_rgba(184,243,107,0.5)] scale-[1.02]'
                        : 'border-[#2f3c2c] hover:border-zinc-400'
                    }`}
                    style={{ backgroundImage: grad.gradient }}
                  >
                    <span
                      className={`text-[9px] font-semibold tracking-tight px-1 py-0.5 rounded ${
                        grad.dark ? 'text-zinc-200 bg-black/40' : 'text-zinc-800 bg-white/60'
                      }`}
                    >
                      {grad.name}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B8F36B] shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Gradient Builder */}
            <div className="pt-2 border-t border-[#2a3528] flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Custom Gradient Studio
              </span>

              {/* Angle Direction Selector */}
              <div className="flex items-center gap-1 bg-[#101510] border border-[#2a3528] rounded-lg p-0.5">
                {[
                  { label: '180° ↓', value: '180deg' },
                  { label: '135° ↘', value: '135deg' },
                  { label: '90° →', value: '90deg' },
                  { label: '45° ↗', value: '45deg' },
                  { label: 'Radial ⊙', value: 'radial' },
                ].map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => {
                      setGradAngle(a.value);
                      applyCustomGradient(gradStart, gradEnd, a.value);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                      gradAngle === a.value
                        ? 'bg-[#222c20] text-[#B8F36B] font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Color Stop 1 & Color Stop 2 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 bg-[#1c241b] border border-[#354331] rounded-lg px-2 py-1">
                  <label
                    className="w-4 h-4 rounded border border-[#354331] shrink-0 cursor-pointer overflow-hidden relative"
                    style={{ backgroundColor: gradStart }}
                  >
                    <input
                      type="color"
                      value={gradStart}
                      onChange={(e) => {
                        setGradStart(e.target.value);
                        applyCustomGradient(e.target.value, gradEnd, gradAngle);
                      }}
                      className="opacity-0 absolute inset-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase truncate">
                    {gradStart}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#1c241b] border border-[#354331] rounded-lg px-2 py-1">
                  <label
                    className="w-4 h-4 rounded border border-[#354331] shrink-0 cursor-pointer overflow-hidden relative"
                    style={{ backgroundColor: gradEnd }}
                  >
                    <input
                      type="color"
                      value={gradEnd}
                      onChange={(e) => {
                        setGradEnd(e.target.value);
                        applyCustomGradient(gradStart, e.target.value, gradAngle);
                      }}
                      className="opacity-0 absolute inset-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase truncate">
                    {gradEnd}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PATTERNS */}
        {bgTab === 'pattern' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
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
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'border-[#B8F36B] bg-[#1c241b] shadow-[0_0_10px_rgba(184,243,107,0.3)]'
                        : 'border-[#2f3c2c] bg-[#141914] hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-100 text-[11px]">{pat.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[#B8F36B]" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-1">{pat.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Pattern Opacity Slider */}
            {currentPattern !== 'none' && (
              <div className="pt-2 border-t border-[#2a3528] flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Pattern Opacity</span>
                  <span className="font-mono text-zinc-200">
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
                  className="w-full accent-[#B8F36B] cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IMAGE */}
        {bgTab === 'image' && (
          <div className="flex flex-col gap-3">
            {/* Custom Image URL input */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
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
                className="bg-[#1c241b] border border-[#354331] rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs outline-none focus:border-[#B8F36B] transition-colors"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Curated Aesthetic Backdrops */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Curated Studio Backdrops
              </span>
              <div className="grid grid-cols-2 gap-2">
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
                    className={`h-16 rounded-lg border overflow-hidden relative group text-left transition-all ${
                      activePage.backgroundImage === img.url
                        ? 'border-[#B8F36B] shadow-[0_0_10px_rgba(184,243,107,0.4)]'
                        : 'border-[#2f3c2c] hover:border-zinc-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[9px] font-semibold text-white truncate">
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
      <div className="bg-[#141914] border border-[#2a3528] rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-[#B8F36B]" />
            <span className="font-semibold text-zinc-100 text-xs">Dimensions & Presets</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Desktop Base</span>
        </div>

        {/* Width & Height Number Inputs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center bg-[#1c241b] border border-[#354331] rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-zinc-500 w-4">W</span>
            <input
              type="number"
              value={activePage.canvasWidth}
              onChange={(e) =>
                updatePageSettings(activePage.id, {
                  canvasWidth: Math.max(320, Number(e.target.value) || 1200),
                })
              }
              className="bg-transparent text-zinc-100 font-mono text-xs outline-none w-full"
            />
            <span className="text-[10px] text-zinc-500 font-mono">px</span>
          </div>

          <div className="flex items-center bg-[#1c241b] border border-[#354331] rounded-lg px-2.5 py-1.5">
            <span className="text-[10px] font-bold text-zinc-500 w-4">H</span>
            <input
              type="number"
              value={activePage.canvasHeight}
              onChange={(e) =>
                updatePageSettings(activePage.id, {
                  canvasHeight: Math.max(400, Number(e.target.value) || 800),
                })
              }
              className="bg-transparent text-zinc-100 font-mono text-xs outline-none w-full"
            />
            <span className="text-[10px] text-zinc-500 font-mono">px</span>
          </div>
        </div>

        {/* 1-Click Popular Size Presets */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Quick Artboard Presets
          </span>
          <div className="grid grid-cols-2 gap-1.5">
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
                  className={`px-2 py-1.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                    isActive
                      ? 'border-[#B8F36B] bg-[#222c20] text-[#B8F36B] font-semibold'
                      : 'border-[#2f3c2c] bg-[#101510] text-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <span className="text-[11px] truncate">{preset.label.split(' ')[0]}</span>
                  <span className="text-[9px] font-mono text-zinc-500">{preset.width}w</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Height Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a3528]">
          <button
            type="button"
            onClick={() => {
              updatePageSettings(activePage.id, {
                canvasHeight: (activePage.canvasHeight || 800) + 400,
              });
              playSound('pop');
              showToast('Added 400px height ↕', 'info');
            }}
            className="px-2.5 py-1.5 bg-[#1c241b] hover:bg-[#253023] border border-[#354331] rounded-lg text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3 h-3 text-[#B8F36B]" />
            <span>+ 400px Height</span>
          </button>

          <button
            type="button"
            onClick={handleFitElementsHeight}
            className="px-2.5 py-1.5 bg-[#1c241b] hover:bg-[#253023] border border-[#354331] rounded-lg text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3 h-3 text-sky-400" />
            <span>Fit to Content</span>
          </button>
        </div>
      </div>

      {/* 4. Canvas Frame (Radius & Shadow) */}
      <div className="bg-[#141914] border border-[#2a3528] rounded-xl p-3 flex flex-col gap-3">
        <span className="font-semibold text-zinc-100 text-xs">Frame Styling</span>

        {/* Corner Radius Presets */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <span>Corner Radius</span>
            <span className="font-mono text-zinc-200">{activePage.canvasBorderRadius ?? 16}px</span>
          </div>
          <div className="flex items-center gap-1 bg-[#101510] border border-[#2a3528] rounded-lg p-0.5">
            {CANVAS_BORDER_RADIUS_PRESETS.map((rad) => (
              <button
                key={rad.value}
                type="button"
                onClick={() => {
                  updatePageSettings(activePage.id, { canvasBorderRadius: rad.value });
                  playSound('pop');
                }}
                className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
                  (activePage.canvasBorderRadius ?? 16) === rad.value
                    ? 'bg-[#222c20] text-[#B8F36B] font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {rad.value}px
              </button>
            ))}
          </div>
        </div>

        {/* Shadow Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-zinc-400">Artboard Elevation</span>
          <div className="grid grid-cols-2 gap-1.5">
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
                  className={`px-2 py-1 rounded-lg border text-left text-[10px] transition-colors ${
                    isSelected
                      ? 'border-[#B8F36B] bg-[#222c20] text-[#B8F36B] font-semibold'
                      : 'border-[#2f3c2c] bg-[#101510] text-zinc-400 hover:border-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {shad.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Reading Progress Bar */}
      <div className="bg-[#141914] border border-[#2a3528] rounded-xl p-3 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-zinc-100 text-xs">Reading Progress Bar</span>
          <span className="text-[10px] text-zinc-500">Top sticky indicator as visitor scrolls</span>
        </div>
        <input
          type="checkbox"
          checked={activePage.showScrollProgress ?? false}
          onChange={(e) => updatePageSettings(activePage.id, { showScrollProgress: e.target.checked })}
          className="accent-[#B8F36B] w-4 h-4 cursor-pointer"
        />
      </div>
    </div>
  );
};
