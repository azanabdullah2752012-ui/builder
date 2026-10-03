import React from 'react';
import { useEditor } from '../../context/useEditor';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Zap,
  Globe,
  Palette,
} from 'lucide-react';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';

const QUICK_COLORS = [
  { name: 'Pickle Mint', color: '#10b981' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Sky Blue', color: '#38bdf8' },
  { name: 'Ocean Blue', color: '#2563eb' },
  { name: 'Electric Purple', color: '#8b5cf6' },
  { name: 'Bubblegum Pink', color: '#ec4899' },
  { name: 'Solar Amber', color: '#f59e0b' },
  { name: 'Flame Red', color: '#ef4444' },
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Deep Slate', color: '#1e293b' },
  { name: 'Obsidian Black', color: '#090a0f' },
];

const CURATED_KID_IMAGES = [
  { label: '🐶 Golden Pup', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80' },
  { label: '🚀 Space Rocket', url: 'https://images.unsplash.com/photo-1517976487545-5d9c22eb44e0?auto=format&fit=crop&w=800&q=80' },
  { label: '🎮 Gamer Zone', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80' },
  { label: '🍋 Fresh Lemonade', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },
  { label: '🍕 Pizza Feast', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
  { label: '🌲 Cool Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
];

export const SimplePropertiesPanel: React.FC = () => {
  const {
    activePage,
    selectedElement,
    updateElement,
    updateElementStyles,
    updateElementBehavior,
    deleteElement,
    duplicateElement,
    updatePageSettings,
    setEditorComplexity,
    showToast,
  } = useEditor();

  // If no element is selected: show Page Level Quick Controls
  if (!selectedElement) {
    return (
      <aside
        style={{
          width: '100%',
          height: '100%',
          background: '#0d0d10',
          color: '#d4d4d8',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          userSelect: 'none',
          overflowY: 'auto',
          borderLeft: '1px solid #1a1a20',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              🧒 Simple Inspector
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>Page Settings</h3>
          </div>
          <button
            onClick={() => {
              setEditorComplexity('pro');
              showToast('Switched to Pro Mode 🛠️', 'info');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 8,
              background: '#1a1a24',
              border: '1px solid #282e42',
              color: '#818cf8',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Zap size={11} className="text-amber-400" />
            <span>Pro Mode</span>
          </button>
        </div>

        {/* Canvas Background Color */}
        <div style={{ background: '#13151f', border: '1px solid #202434', borderRadius: 16, padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Palette size={14} className="text-emerald-400" />
            <span>Canvas Background</span>
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {QUICK_COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => {
                  playSound('pop');
                  updatePageSettings(activePage.id, { backgroundColor: c.color });
                }}
                title={c.name}
                style={{
                  height: 34,
                  borderRadius: 8,
                  background: c.color,
                  border: activePage.backgroundColor === c.color ? '2px solid #ffffff' : '1px solid #333',
                  cursor: 'pointer',
                  boxShadow: activePage.backgroundColor === c.color ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Friendly Maker Tip */}
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 16, padding: 14 }}>
          <h5 style={{ fontSize: 12, fontWeight: 800, color: '#34d399', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💡</span>
            <span>Maker Tip</span>
          </h5>
          <p style={{ fontSize: 11, color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
            Click on any text, photo, or button on the canvas to change its words, colors, or action!
          </p>
        </div>
      </aside>
    );
  }

  // Element IS selected
  const hasText = ['text', 'button', 'input', 'textarea'].includes(selectedElement.type);
  const isImage = selectedElement.type === 'image';
  const isButton = selectedElement.type === 'button';

  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        background: '#0d0d10',
        color: '#d4d4d8',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        userSelect: 'none',
        overflowY: 'auto',
        borderLeft: '1px solid #1a1a20',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1a1a20', paddingBottom: 12 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🧒 Simple Inspector
          </span>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
            {selectedElement.name || selectedElement.type}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => {
              playSound('pop');
              duplicateElement(selectedElement.id);
            }}
            title="Duplicate element"
            style={{
              background: '#161924',
              border: '1px solid #282f45',
              borderRadius: 8,
              padding: 6,
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => {
              playSound('pop');
              deleteElement(selectedElement.id);
            }}
            title="Delete element"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: 6,
              color: '#f87171',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* 1. TEXT EDITING (If element has text) */}
      {hasText && (
        <div style={{ background: '#13151f', border: '1px solid #202434', borderRadius: 14, padding: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
            ✏️ Change Text Content
          </label>
          <textarea
            value={selectedElement.content || ''}
            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              background: '#090a0f',
              border: '1px solid #282e42',
              borderRadius: 10,
              color: '#ffffff',
              padding: '8px 10px',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'vertical',
            }}
            placeholder="Type your words here..."
          />

          {/* Text Size & Alignment */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            {/* Size Buttons */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  const current = selectedElement.styles?.fontSize || 16;
                  updateElementStyles(selectedElement.id, { fontSize: Math.max(10, current - 2) });
                }}
                style={{
                  background: '#1a1d2c',
                  border: '1px solid #2a3047',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                A-
              </button>
              <button
                onClick={() => {
                  const current = selectedElement.styles?.fontSize || 16;
                  updateElementStyles(selectedElement.id, { fontSize: Math.min(80, current + 2) });
                }}
                style={{
                  background: '#1a1d2c',
                  border: '1px solid #2a3047',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                A+
              </button>
              <button
                onClick={() => {
                  const isBold = Number(selectedElement.styles?.fontWeight || 400) >= 700;
                  updateElementStyles(selectedElement.id, { fontWeight: isBold ? 400 : 800 });
                }}
                style={{
                  background: Number(selectedElement.styles?.fontWeight || 400) >= 700 ? '#3b82f6' : '#1a1d2c',
                  border: '1px solid #2a3047',
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                B
              </button>
            </div>

            {/* Alignment */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { align: 'left', icon: <AlignLeft size={13} /> },
                { align: 'center', icon: <AlignCenter size={13} /> },
                { align: 'right', icon: <AlignRight size={13} /> },
              ].map((al) => (
                <button
                  key={al.align}
                  onClick={() => updateElementStyles(selectedElement.id, { textAlign: al.align as any })}
                  style={{
                    background: selectedElement.styles?.textAlign === al.align ? '#3b82f6' : '#1a1d2c',
                    border: '1px solid #2a3047',
                    borderRadius: 6,
                    padding: 5,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {al.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. IMAGE PICKER (If element is an image) */}
      {isImage && (
        <div style={{ background: '#13151f', border: '1px solid #202434', borderRadius: 14, padding: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
            🖼️ Quick Photo Library
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {CURATED_KID_IMAGES.map((img) => (
              <button
                key={img.label}
                onClick={() => {
                  playSound('pop');
                  updateElement(selectedElement.id, { content: img.url });
                  showToast(`Selected ${img.label}!`, 'success');
                }}
                style={{
                  background: '#1a1d2c',
                  border: '1px solid #2a3047',
                  borderRadius: 8,
                  padding: '6px 8px',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {img.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 4 }}>Or paste image link:</label>
            <input
              type="text"
              value={selectedElement.content || ''}
              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              placeholder="https://..."
              style={{
                width: '100%',
                background: '#090a0f',
                border: '1px solid #282e42',
                borderRadius: 8,
                color: '#ffffff',
                padding: '6px 8px',
                fontSize: 11,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* 3. QUICK COLOR PALETTE (Background / Accent) */}
      <div style={{ background: '#13151f', border: '1px solid #202434', borderRadius: 14, padding: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
          🎨 Pick a Color
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {QUICK_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                playSound('pop');
                if (selectedElement.type === 'text') {
                  updateElementStyles(selectedElement.id, { color: c.color });
                } else {
                  updateElementStyles(selectedElement.id, { backgroundColor: c.color });
                }
              }}
              title={c.name}
              style={{
                height: 32,
                borderRadius: 8,
                background: c.color,
                border: '1px solid #333',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. BUTTON ACTION (If element is a button) */}
      {isButton && (
        <div style={{ background: '#13151f', border: '1px solid #202434', borderRadius: 14, padding: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
            🔥 What happens when clicked?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => {
                playSound('pop');
                triggerConfetti();
                updateElementBehavior(selectedElement.id, { actionType: 'confetti', actionSound: 'success' });
                showToast('Set to Pop Confetti! 🎉', 'success');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: selectedElement.behavior?.actionType === 'confetti' ? '#10b981' : '#1a1d2c',
                color: '#ffffff',
                border: '1px solid #2a3047',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <span>🎉</span>
              <span>Pop Confetti & Cheer!</span>
            </button>
            <button
              onClick={() => {
                playSound('pop');
                updateElementBehavior(selectedElement.id, { actionType: 'navigate-url', actionPayload: 'https://' });
                showToast('Set to Open Web Link 🌐', 'info');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: selectedElement.behavior?.actionType === 'navigate-url' ? '#3b82f6' : '#1a1d2c',
                color: '#ffffff',
                border: '1px solid #2a3047',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Globe size={14} />
              <span>Open a Website Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Switch to Pro Footer */}
      <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #1a1a20', textAlign: 'center' }}>
        <button
          onClick={() => {
            playSound('pop');
            setEditorComplexity('pro');
            showToast('Switched to Pro Mode 🛠️', 'info');
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#71717a',
            fontSize: 11,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Need advanced CSS or responsive controls? Switch to Pro Mode
        </button>
      </div>
    </aside>
  );
};
