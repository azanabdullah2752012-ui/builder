import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Type,
  Square,
  Image as ImageIcon,
  Minus,
  Upload,
  ClipboardPaste,
  Smile,
  Shapes,
  Search,
  ChevronDown,
  MousePointerClick,
  PartyPopper,
} from 'lucide-react';
import type { ShapeKind } from '../../types/editor';
import { SHAPE_DEFINITIONS } from '../../utils/shapeDefinitions';
import { EMOJI_CATALOG } from '../../constants/emojiCatalog';
import { STOCK_IMAGES } from '../../constants/stockMedia';
import { triggerConfetti, playSound } from '../../utils/interactiveEffects';

export const CanvasQuickDock: React.FC = () => {
  const {
    addElement,
    insertCustomImage,
    insertShape,
    insertEmoji,
    pasteElement,
    showToast,
  } = useEditor();

  const [activeMenu, setActiveMenu] = useState<'shapes' | 'emojis' | 'image' | 'paste' | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [emojiCategory, setEmojiCategory] = useState<string>('All');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || 380;
        let h = img.naturalHeight || 250;
        const maxW = 460;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }

        insertCustomImage(dataUrl, file.name ? `Image (${file.name})` : 'Uploaded Image');
        playSound('success');
        showToast(`Inserted uploaded image "${file.name}"! 📸`, 'success');
        setActiveMenu(null);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-selecting same file triggers change
    e.target.value = '';
  };

  const handleInsertUrlImage = () => {
    if (!imageUrlInput.trim()) return;
    insertCustomImage(imageUrlInput.trim(), 'Web Image');
    playSound('pop');
    setImageUrlInput('');
    setActiveMenu(null);
  };

  const filteredEmojis = EMOJI_CATALOG.filter((item) => {
    const matchesCat = emojiCategory === 'All' || item.category === emojiCategory;
    const q = emojiSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.emoji.includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const categories = ['All', 'Popular', 'Tech & Code', 'Launch & Growth', 'Business', 'Reactions', 'Badges'];

  return (
    <div
      ref={dockRef}
      className="relative z-30 mb-3 flex items-center justify-center select-none"
    >
      {/* Floating Action Dock Container */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#11141d]/90 backdrop-blur-md border border-[#232c3f] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6),0_0_20px_rgba(99,102,241,0.15)] text-zinc-300">
        {/* Hidden File Input for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* 1. Add Text */}
        <button
          type="button"
          onClick={() => {
            addElement('text');
            playSound('click');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-[#1f2638] hover:text-white transition-all text-zinc-300 group"
          title="Add Text / Heading"
        >
          <Type className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>Text</span>
        </button>

        {/* 2. Add Button */}
        <button
          type="button"
          onClick={() => {
            addElement('button');
            playSound('click');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-[#1f2638] hover:text-white transition-all text-zinc-300 group"
          title="Add Interactive Button"
        >
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Button</span>
        </button>

        <div className="w-[1px] h-4 bg-[#263148] mx-0.5" />

        {/* 3. Shapes Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'shapes' ? null : 'shapes')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all group ${
              activeMenu === 'shapes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:bg-[#1f2638] hover:text-white text-zinc-300'
            }`}
            title="Geometric & Symbol Shapes"
          >
            <Shapes className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>Shapes</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'shapes' ? 'rotate-180' : ''}`} />
          </button>

          {/* Shapes Dropdown Menu */}
          {activeMenu === 'shapes' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 bg-[#131722] border border-[#273248] rounded-2xl shadow-2xl backdrop-blur-xl animate-scale-in z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232c3f]">
                <span className="text-[11px] font-bold text-zinc-200 tracking-wide uppercase">
                  Geometric Shapes
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">10 Shapes</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(SHAPE_DEFINITIONS) as ShapeKind[]).map((kind) => {
                  const def = SHAPE_DEFINITIONS[kind];
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => {
                        insertShape(kind);
                        playSound('pop');
                        setActiveMenu(null);
                      }}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#181e2e] hover:bg-[#20283d] border border-[#263148] hover:border-indigo-500/50 hover:scale-105 transition-all group"
                      title={`Insert ${def.label}`}
                    >
                      <svg
                        viewBox={def.viewBox}
                        className="w-7 h-7 mb-1 drop-shadow-md"
                        style={{ color: def.defaultColor }}
                      >
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
                      <span className="text-[9px] text-zinc-400 group-hover:text-zinc-200 truncate w-full text-center">
                        {def.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Emojis & Stickers Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'emojis' ? null : 'emojis')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all group ${
              activeMenu === 'emojis'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'hover:bg-[#1f2638] hover:text-white text-zinc-300'
            }`}
            title="Emoji Stickers & Icons"
          >
            <Smile className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Emojis</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'emojis' ? 'rotate-180' : ''}`} />
          </button>

          {/* Emoji Popover */}
          {activeMenu === 'emojis' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 bg-[#131722] border border-[#273248] rounded-2xl shadow-2xl backdrop-blur-xl animate-scale-in z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232c3f]">
                <div className="flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-zinc-200 tracking-wide uppercase">
                    Emoji Stickers
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">{filteredEmojis.length} emojis</span>
              </div>

              {/* Search */}
              <div className="relative mb-2">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search emojis (rocket, fire, star)..."
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  className="w-full bg-[#181e2e] border border-[#263148] rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1.5 mb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEmojiCategory(cat)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                      emojiCategory === cat
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-[#181e2e] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto pr-1">
                {filteredEmojis.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      insertEmoji(item.emoji);
                      playSound('pop');
                      setActiveMenu(null);
                    }}
                    className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-[#20283d] hover:scale-125 transition-all cursor-pointer"
                    title={item.name}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-[#263148] mx-0.5" />

        {/* 5. Image & Upload Own Image Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'image' ? null : 'image')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all group ${
              activeMenu === 'image'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'hover:bg-[#1f2638] hover:text-white text-zinc-300'
            }`}
            title="Insert or Upload Image"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Image</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'image' ? 'rotate-180' : ''}`} />
          </button>

          {/* Image Popover */}
          {activeMenu === 'image' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 bg-[#131722] border border-[#273248] rounded-2xl shadow-2xl backdrop-blur-xl animate-scale-in z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232c3f]">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-zinc-200 tracking-wide uppercase">
                    Insert Image
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">File or URL</span>
              </div>

              {/* 1. Upload Own Image from Disk Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 mb-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md transition-all group"
              >
                <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Image from Computer</span>
              </button>

              {/* 2. Paste Web Image URL */}
              <div className="mb-3">
                <span className="text-[10px] text-zinc-400 block mb-1">Or paste Image URL:</span>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInsertUrlImage()}
                    className="flex-1 bg-[#181e2e] border border-[#263148] rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleInsertUrlImage}
                    disabled={!imageUrlInput.trim()}
                    className="px-2.5 py-1 bg-[#20283d] hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 3. Curated Stock Presets */}
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1.5">Quick Stock Presets:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {STOCK_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        insertCustomImage(img.url, img.name);
                        playSound('pop');
                        setActiveMenu(null);
                      }}
                      className="relative rounded-lg overflow-hidden border border-[#263148] hover:border-indigo-500 group aspect-[4/3]"
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                      <span className="absolute bottom-1 left-1 right-1 text-[8px] font-medium text-white truncate drop-shadow-md">
                        {img.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Add Container / Frame */}
        <button
          type="button"
          onClick={() => {
            addElement('container');
            playSound('click');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-[#1f2638] hover:text-white transition-all text-zinc-300 group"
          title="Add Container / Frame"
        >
          <Square className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Container</span>
        </button>

        {/* 7. Add Divider */}
        <button
          type="button"
          onClick={() => {
            addElement('divider');
            playSound('click');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium hover:bg-[#1f2638] hover:text-white transition-all text-zinc-300 group"
          title="Add Horizontal Divider"
        >
          <Minus className="w-3.5 h-3.5 text-zinc-400 group-hover:scale-110 transition-transform" />
          <span>Divider</span>
        </button>

        <div className="w-[1px] h-4 bg-[#263148] mx-0.5" />

        {/* 8. Paste from Outside Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === 'paste' ? null : 'paste')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all group ${
              activeMenu === 'paste'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-[#1f2638] hover:text-white text-zinc-300'
            }`}
            title="Paste images, text, or elements from outside (Cmd+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span>Paste</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'paste' ? 'rotate-180' : ''}`} />
          </button>

          {activeMenu === 'paste' && (
            <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-[#131722] border border-[#273248] rounded-2xl shadow-2xl backdrop-blur-xl animate-scale-in z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#232c3f]">
                <span className="text-[11px] font-bold text-zinc-200 tracking-wide uppercase">
                  Paste From Outside
                </span>
                <span className="text-[10px] text-sky-400 font-mono font-bold">Cmd+V</span>
              </div>

              <p className="text-xs text-zinc-300 mb-2.5 leading-relaxed">
                You can copy any <strong>image screenshot</strong>, <strong>text</strong>, or <strong>image URL</strong> from outside and press <code className="bg-[#1c2333] px-1 py-0.5 rounded text-sky-300 text-[11px]">Cmd+V</code> anywhere on the canvas!
              </p>

              <button
                type="button"
                onClick={() => {
                  pasteElement();
                  setActiveMenu(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Paste from Clipboard Now</span>
              </button>
            </div>
          )}
        </div>

        {/* 9. Celebration Confetti Button */}
        <button
          type="button"
          onClick={() => {
            triggerConfetti();
            playSound('success');
            showToast('🎉 Confetti Celebration!', 'success');
          }}
          className="p-1.5 rounded-full hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 transition-all"
          title="Trigger Confetti Effect"
        >
          <PartyPopper className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
