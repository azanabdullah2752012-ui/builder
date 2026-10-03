import React, { useState, useRef, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import { Type, Square, Image as ImageIcon, Minus, Upload, ClipboardPaste, Shapes, Search, ChevronDown, MousePointerClick, Smile } from 'lucide-react';
import type { ShapeKind } from '../../types/editor';
import { SHAPE_DEFINITIONS } from '../../utils/shapeDefinitions';
import { EMOJI_CATALOG } from '../../constants/emojiCatalog';
import { STOCK_IMAGES } from '../../constants/stockMedia';
import { playSound } from '../../utils/interactiveEffects';

const toolbar: React.CSSProperties = {
  height: 38,
  background: '#0f0f0f',
  borderBottom: '1px solid #1a1a1a',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  flexShrink: 0,
  userSelect: 'none',
  position: 'relative',
  zIndex: 25,
  gap: 2,
};

function ToolBtn({ icon, label, active, onClick, title, children }: { icon: React.ReactNode; label?: string; active?: boolean; onClick?: () => void; title?: string; children?: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        height: 26, padding: label ? '0 9px' : '0 7px',
        borderRadius: 6, border: 'none',
        background: active ? '#1e1e1e' : hov ? '#161616' : 'transparent',
        color: active ? '#e8e8e8' : hov ? '#ccc' : '#666',
        cursor: 'pointer', fontSize: 11, fontWeight: 500,
        transition: 'background 0.1s, color 0.1s',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ opacity: active ? 1 : hov ? 0.9 : 0.7, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label && <span>{label}</span>}
      {children}
    </button>
  );
}

function Sep() {
  return <div style={{ width: 1, height: 14, background: '#222', margin: '0 4px', flexShrink: 0 }} />;
}

function Popover({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      background: '#111', border: '1px solid #252525', borderRadius: 10,
      boxShadow: '0 12px 40px rgba(0,0,0,0.7)', padding: '10px',
      zIndex: 100, minWidth: 240,
      animation: 'craftFadeIn 0.1s ease-out',
    }}>
      {children}
    </div>
  );
}

export const CanvasQuickDock: React.FC = () => {
  const { addElement, insertCustomImage, insertShape, insertEmoji, pasteElement, showToast } = useEditor();
  const [active, setActive] = useState<'shapes' | 'emojis' | 'image' | 'paste' | null>(null);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [emojiCat, setEmojiCat] = useState('All');
  const [imgUrl, setImgUrl] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Select a valid image', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      if (!url) return;
      new Image().addEventListener('load', () => {
        insertCustomImage(url, `Image (${file.name})`);
        playSound('success');
        showToast(`Inserted "${file.name}"`, 'success');
        setActive(null);
      });
      const img = new Image();
      img.onload = () => { insertCustomImage(url, `Image (${file.name})`); playSound('success'); setActive(null); };
      img.src = url;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const filteredEmojis = EMOJI_CATALOG.filter(item => {
    const matchCat = emojiCat === 'All' || item.category === emojiCat;
    const q = emojiSearch.toLowerCase();
    return matchCat && (!q || item.name.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q));
  });

  const cats = ['All', 'Popular', 'Tech & Code', 'Launch & Growth', 'Business', 'Reactions', 'Badges'];

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 600, color: '#444', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: 8,
  };

  return (
    <div ref={dockRef} style={toolbar}>
      <style>{`@keyframes craftFadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

      {/* Text */}
      <ToolBtn icon={<Type size={13} />} label="Text" onClick={() => { addElement('text'); playSound('click'); }} title="Add Text" />

      {/* Button */}
      <ToolBtn icon={<MousePointerClick size={13} />} label="Button" onClick={() => { addElement('button'); playSound('click'); }} title="Add Button" />

      <Sep />

      {/* Shapes */}
      <div style={{ position: 'relative' }}>
        <ToolBtn icon={<Shapes size={13} />} label="Shapes" active={active === 'shapes'} onClick={() => setActive(active === 'shapes' ? null : 'shapes')}>
          <ChevronDown size={10} style={{ marginLeft: 1 }} />
        </ToolBtn>
        {active === 'shapes' && (
          <Popover>
            <div style={sectionLabel}>Shapes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {(Object.keys(SHAPE_DEFINITIONS) as ShapeKind[]).map(kind => {
                const def = SHAPE_DEFINITIONS[kind];
                return (
                  <button
                    key={kind}
                    onClick={() => { insertShape(kind); playSound('pop'); setActive(null); }}
                    title={def.label}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #252525', cursor: 'pointer', gap: 4, transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#222')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1a1a1a')}
                  >
                    <svg viewBox={def.viewBox} style={{ width: 22, height: 22, color: def.defaultColor }}>
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
                    <span style={{ fontSize: 9, color: '#555' }}>{def.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </Popover>
        )}
      </div>

      {/* Emojis */}
      <div style={{ position: 'relative' }}>
        <ToolBtn icon={<Smile size={13} />} label="Emoji" active={active === 'emojis'} onClick={() => setActive(active === 'emojis' ? null : 'emojis')} />
        {active === 'emojis' && (
          <Popover>
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
              <input
                placeholder="Search..."
                value={emojiSearch}
                onChange={e => setEmojiSearch(e.target.value)}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #252525', borderRadius: 7, padding: '5px 8px 5px 26px', fontSize: 11, color: '#e8e8e8', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 8, paddingBottom: 4, scrollbarWidth: 'none' }}>
              {cats.map(c => (
                <button key={c} onClick={() => setEmojiCat(c)} style={{ padding: '3px 8px', borderRadius: 99, border: `1px solid ${emojiCat === c ? '#6366f1' : '#252525'}`, background: emojiCat === c ? 'rgba(99,102,241,0.1)' : 'transparent', color: emojiCat === c ? '#818cf8' : '#555', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, maxHeight: 160, overflowY: 'auto' }}>
              {filteredEmojis.map((item, i) => (
                <button key={i} title={item.name} onClick={() => { insertEmoji(item.emoji); playSound('pop'); setActive(null); }} style={{ width: 32, height: 32, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.1s, transform 0.1s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1e1e1e'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </Popover>
        )}
      </div>

      <Sep />

      {/* Image */}
      <div style={{ position: 'relative' }}>
        <ToolBtn icon={<ImageIcon size={13} />} label="Image" active={active === 'image'} onClick={() => setActive(active === 'image' ? null : 'image')} />
        {active === 'image' && (
          <Popover>
            <div style={sectionLabel}>Insert Image</div>
            <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #252525', color: '#ccc', cursor: 'pointer', fontSize: 11, marginBottom: 10, transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#222'}
              onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
            >
              <Upload size={13} />Upload from Computer
            </button>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 4 }}>Or paste URL</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input placeholder="https://..." value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && imgUrl.trim() && (insertCustomImage(imgUrl.trim(), 'Web Image'), setImgUrl(''), setActive(null))} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #252525', borderRadius: 7, padding: '5px 8px', fontSize: 11, color: '#e8e8e8', outline: 'none' }} />
              <button onClick={() => { if (imgUrl.trim()) { insertCustomImage(imgUrl.trim(), 'Web Image'); setImgUrl(''); setActive(null); } }} style={{ padding: '0 10px', borderRadius: 7, background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#ccc', cursor: 'pointer', fontSize: 11 }}>Add</button>
            </div>
            <div style={{ fontSize: 10, color: '#444', marginBottom: 6 }}>Stock photos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
              {STOCK_IMAGES.map(img => (
                <button key={img.id} onClick={() => { insertCustomImage(img.url, img.name); playSound('pop'); setActive(null); }} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 7, overflow: 'hidden', border: '1px solid #252525', cursor: 'pointer', padding: 0, background: 'none' }}>
                  <img src={img.thumbnail} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          </Popover>
        )}
      </div>

      {/* Container */}
      <ToolBtn icon={<Square size={13} />} label="Container" onClick={() => { addElement('container'); playSound('click'); }} title="Add Container" />

      {/* Divider */}
      <ToolBtn icon={<Minus size={13} />} label="Divider" onClick={() => { addElement('divider'); playSound('click'); }} title="Add Divider" />

      <Sep />

      {/* Paste */}
      <div style={{ position: 'relative' }}>
        <ToolBtn icon={<ClipboardPaste size={13} />} label="Paste" active={active === 'paste'} onClick={() => setActive(active === 'paste' ? null : 'paste')} />
        {active === 'paste' && (
          <Popover>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 10, lineHeight: 1.5 }}>
              Copy an image or text outside and press <kbd style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 5, padding: '2px 6px', fontSize: 11, color: '#e8e8e8' }}>⌘V</kbd> anywhere on canvas.
            </p>
            <button onClick={() => { pasteElement(); setActive(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '8px', borderRadius: 8, background: '#1a1a1a', border: '1px solid #252525', color: '#ccc', cursor: 'pointer', fontSize: 11 }}>
              <ClipboardPaste size={13} />Paste from Clipboard
            </button>
          </Popover>
        )}
      </div>

      {/* Right hint */}
      <div style={{ marginLeft: 'auto', fontSize: 10, color: '#333', letterSpacing: '0.02em', pointerEvents: 'none' }}>
        Shift+R Rulers · Alt Distances
      </div>
    </div>
  );
};
