import React, { useState, useEffect } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  PanelRightClose,
  FolderPlus,
  FolderMinus,
  MoveUp,
  MoveDown,
  Lock,
  Unlock,
  Play,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { FONT_FAMILIES } from '../../constants/defaults';
import { triggerConfetti, playSound } from '../../utils/interactiveEffects';
import { executeElementAction } from '../../utils/actionExecutor';
import { MOTION_PRESETS } from '../../utils/motionAnimations';
import type { ActionType, StateVariant } from '../../types/editor';
import { SimplePropertiesPanel } from './SimplePropertiesPanel';

const S = {
  panel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0d0d10',
    color: '#d4d4d8',
    display: 'flex',
    flexDirection: 'column' as const,
    userSelect: 'none' as const,
    fontSize: 11,
    overflowY: 'auto' as const,
    borderLeft: '1px solid #1a1a20',
  },
  header: {
    height: 42,
    padding: '0 14px',
    borderBottom: '1px solid #1a1a20',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    backgroundColor: '#0d0d10',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    height: 26,
    backgroundColor: '#141418',
    border: '1px solid #222228',
    borderRadius: 6,
    padding: '0 8px',
    color: '#f4f4f5',
    fontSize: 11,
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.12s',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#8e8e98',
    flexShrink: 0,
    width: 60,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
    marginBottom: 8,
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 5,
    border: '1px solid #222228',
    backgroundColor: '#141418',
    color: '#a1a1aa',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
  },
};

function ColorPickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const displayVal = value || '#ffffff';
  const isTransparent = displayVal === 'transparent';

  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <label
          style={{
            position: 'relative',
            width: 22,
            height: 22,
            borderRadius: 5,
            border: '1px solid #2a2a35',
            backgroundColor: isTransparent ? '#18181b' : displayVal,
            cursor: 'pointer',
            flexShrink: 0,
            overflow: 'hidden',
          }}
          title="Click to pick color"
        >
          <input
            type="color"
            value={isTransparent ? '#ffffff' : displayVal.startsWith('#') ? displayVal : '#ffffff'}
            onChange={(e) => onChange(e.target.value)}
            style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
          />
        </label>
        <input
          type="text"
          value={displayVal}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...S.input, fontFamily: 'monospace', textTransform: 'uppercase', flex: 1 }}
        />
        {displayVal !== 'transparent' && (
          <button
            type="button"
            onClick={() => onChange('transparent')}
            title="Set Transparent"
            style={{
              fontSize: 10,
              color: '#71717a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export const PropertiesPanel: React.FC = () => {
  const {
    selectedElement,
    selectedElementIds,
    selectedElements,
    selectElements,
    updateElement,
    updateElementStyles,
    updateElementBehavior,
    updateElementLayout,
    deleteElement,
    duplicateElement,
    toggleLock,
    alignSelectedElements,
    groupSelectedElements,
    ungroupSelectedElements,
    project,
    activePage,
    setActivePage,
    updatePageSettings,
    toggleRightSidebar,
    setPreviewStateVariant,
    showToast,
    editorComplexity,
  } = useEditor();

  if (editorComplexity === 'simple') {
    return <SimplePropertiesPanel />;
  }

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [activeStateVariant, setActiveStateVariant] = useState<StateVariant>('default');

  useEffect(() => {
    setActiveStateVariant('default');
    setPreviewStateVariant('default');
  }, [selectedElement?.id, setPreviewStateVariant]);

  const handleStateTabChange = (variant: StateVariant) => {
    setActiveStateVariant(variant);
    setPreviewStateVariant(variant);
  };

  useEffect(() => {
    if (selectedElement?.behavior?.actionType === 'navigate-page') {
      const validOptions = ['__next__', '__prev__', ...project.pages.map((p) => p.id)];
      if (!validOptions.includes(selectedElement.behavior.actionPayload || '')) {
        updateElementBehavior(selectedElement.id, { actionPayload: '__next__' });
      }
    }
  }, [selectedElement?.id, selectedElement?.behavior?.actionType, selectedElement?.behavior?.actionPayload, project.pages]);

  // 1. Multi-Selection Inspector
  if (selectedElementIds.length > 1) {
    const hasGroup = selectedElements.some((e) => e.type === 'container' || e.type === 'section');

    return (
      <aside style={S.panel}>
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 600, color: '#f4f4f5' }}>Selection</span>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'monospace',
                backgroundColor: '#1e1e28',
                color: '#a5b4fc',
                padding: '1px 6px',
                borderRadius: 10,
              }}
            >
              {selectedElementIds.length} items
            </span>
          </div>
          <button
            type="button"
            onClick={() => selectElements([])}
            style={{ ...S.iconBtn, width: 'auto', padding: '0 8px', fontSize: 10 }}
          >
            Deselect
          </button>
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Batch Alignment */}
          <div>
            <div style={S.sectionTitle}>Align</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {[
                { type: 'left' as const, icon: <AlignLeft size={13} />, title: 'Align Left' },
                { type: 'center' as const, icon: <AlignCenter size={13} />, title: 'Align Center Horizontal' },
                { type: 'right' as const, icon: <AlignRight size={13} />, title: 'Align Right' },
                { type: 'top' as const, icon: <ArrowUp size={13} />, title: 'Align Top' },
                { type: 'middle' as const, icon: <AlignCenter size={13} style={{ transform: 'rotate(90deg)' }} />, title: 'Align Center Vertical' },
                { type: 'bottom' as const, icon: <ArrowDown size={13} />, title: 'Align Bottom' },
              ].map((btn) => (
                <button
                  key={btn.type}
                  type="button"
                  onClick={() => alignSelectedElements(btn.type)}
                  style={S.iconBtn}
                  title={btn.title}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Grouping */}
          <div>
            <div style={S.sectionTitle}>Grouping</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={groupSelectedElements}
                style={{
                  ...S.iconBtn,
                  flex: 1,
                  height: 28,
                  gap: 6,
                  color: '#e4e4e7',
                }}
              >
                <FolderPlus size={13} />
                <span>Group into Frame</span>
              </button>
              {hasGroup && (
                <button
                  type="button"
                  onClick={ungroupSelectedElements}
                  style={{
                    ...S.iconBtn,
                    flex: 1,
                    height: 28,
                    gap: 6,
                    color: '#e4e4e7',
                  }}
                >
                  <FolderMinus size={13} />
                  <span>Ungroup</span>
                </button>
              )}
            </div>
          </div>

          {/* Batch Actions */}
          <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                selectedElementIds.forEach((id) => deleteElement(id));
                selectElements([]);
                showToast(`Deleted ${selectedElementIds.length} elements`, 'info');
              }}
              style={{
                width: '100%',
                height: 28,
                borderRadius: 6,
                border: '1px solid #332020',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={13} />
              <span>Delete Selected Items</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 2. Page Settings (when no element is selected)
  if (!selectedElement) {
    return (
      <aside style={S.panel}>
        <div style={S.header}>
          <span style={{ fontWeight: 600, color: '#f4f4f5' }}>Page Settings</span>
          <button
            type="button"
            onClick={toggleRightSidebar}
            style={{ ...S.iconBtn, border: 'none', background: 'none' }}
            title="Close Panel"
          >
            <PanelRightClose size={15} />
          </button>
        </div>

        <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Page Name */}
          <div>
            <div style={S.sectionTitle}>General</div>
            <div style={S.row}>
              <span style={S.label}>Name</span>
              <input
                type="text"
                value={activePage.name}
                onChange={(e) => updatePageSettings(activePage.id, { name: e.target.value })}
                style={S.input}
              />
            </div>
          </div>

          {/* Canvas Background */}
          <div>
            <div style={S.sectionTitle}>Canvas Surface</div>
            <ColorPickerRow
              label="Fill"
              value={activePage.backgroundColor || '#ffffff'}
              onChange={(val) => updatePageSettings(activePage.id, { backgroundColor: val })}
            />
          </div>

          {/* Canvas Dimensions */}
          <div>
            <div style={S.sectionTitle}>Dimensions (Desktop)</div>
            <div style={S.grid2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#71717a', width: 14 }}>W</span>
                <input
                  type="number"
                  value={activePage.canvasWidth}
                  onChange={(e) => updatePageSettings(activePage.id, { canvasWidth: Number(e.target.value) || 1200 })}
                  style={S.input}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#71717a', width: 14 }}>H</span>
                <input
                  type="number"
                  value={activePage.canvasHeight}
                  onChange={(e) => updatePageSettings(activePage.id, { canvasHeight: Number(e.target.value) || 800 })}
                  style={S.input}
                />
              </div>
            </div>
          </div>

          {/* Scroll Progress Bar */}
          <div>
            <div style={S.sectionTitle}>Features</div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, color: '#d4d4d8' }}>Reading Progress Bar</span>
              <input
                type="checkbox"
                checked={activePage.showScrollProgress ?? false}
                onChange={(e) => updatePageSettings(activePage.id, { showScrollProgress: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Page Stats */}
          <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
            <div style={S.sectionTitle}>Structure</div>
            <div
              style={{
                backgroundColor: '#121216',
                border: '1px solid #1c1c24',
                borderRadius: 6,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                fontSize: 10.5,
                color: '#a1a1aa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Elements</span>
                <span style={{ fontFamily: 'monospace', color: '#e4e4e7' }}>{activePage.elements.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sections</span>
                <span style={{ fontFamily: 'monospace', color: '#e4e4e7' }}>
                  {activePage.elements.filter((e) => e.type === 'section').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 3. Single Element Inspector (Figma-grade clean UI)
  const el = selectedElement;
  const s = el.styles || {};
  const b = el.behavior || { actionType: 'none' };
  const hasText = el.type === 'text' || el.type === 'button';
  const hasFill = el.type !== 'divider';
  const isImage = el.type === 'image';
  const isContainerLike = el.type === 'container' || el.type === 'section';

  const handleNameSave = () => {
    setIsEditingName(false);
    if (nameValue.trim()) updateElement(el.id, { name: nameValue.trim() });
  };

  return (
    <aside style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          {isEditingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              style={{ ...S.input, height: 22, fontSize: 11 }}
            />
          ) : (
            <span
              onClick={() => {
                setNameValue(el.name);
                setIsEditingName(true);
              }}
              title="Click to rename layer"
              style={{
                fontWeight: 600,
                color: '#f4f4f5',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {el.name}
            </span>
          )}
          <span
            style={{
              fontSize: 9,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              backgroundColor: '#181820',
              color: '#888892',
              border: '1px solid #242430',
              padding: '1px 5px',
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            {el.type}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            onClick={() => toggleLock(el.id)}
            style={{ ...S.iconBtn, width: 22, height: 22, border: 'none', background: 'none' }}
            title={el.locked ? 'Unlock Element' : 'Lock Element'}
          >
            {el.locked ? <Lock size={12} color="#f59e0b" /> : <Unlock size={12} />}
          </button>
          <button
            type="button"
            onClick={toggleRightSidebar}
            style={{ ...S.iconBtn, width: 22, height: 22, border: 'none', background: 'none' }}
            title="Close Inspector"
          >
            <PanelRightClose size={14} />
          </button>
        </div>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* State Variant Segmented Control */}
        <div style={{ padding: '0 0 10px', borderBottom: '1px solid #1a1a20' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={11} color="#818cf8" />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Element State
              </span>
            </div>
            {activeStateVariant !== 'default' && (
              <span style={{ fontSize: 9.5, color: '#818cf8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#818cf8', display: 'inline-block' }} />
                Canvas Preview
              </span>
            )}
          </div>

          <div style={{ display: 'flex', backgroundColor: '#141418', border: '1px solid #1f1f28', borderRadius: 6, padding: 2, gap: 2 }}>
            {(['default', 'hover', 'active', 'focus'] as const).map((variant) => {
              const isSelected = activeStateVariant === variant;
              const label = variant === 'default' ? 'Normal' : `:${variant}`;
              const hasOverrides =
                variant === 'hover' ? Boolean(b.hoverStyles && Object.keys(b.hoverStyles).length > 0) :
                variant === 'active' ? Boolean(b.activeStyles && Object.keys(b.activeStyles).length > 0) :
                variant === 'focus' ? Boolean(b.focusStyles && Object.keys(b.focusStyles).length > 0) : false;

              return (
                <button
                  key={variant}
                  type="button"
                  onClick={() => handleStateTabChange(variant)}
                  style={{
                    flex: 1,
                    height: 23,
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: isSelected ? '#252532' : 'transparent',
                    color: isSelected ? '#ffffff' : '#71717a',
                    fontSize: 10,
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    transition: 'all 0.12s ease',
                  }}
                >
                  <span>{label}</span>
                  {hasOverrides && (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#38bdf8' : '#818cf8',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeStateVariant === 'default' && (
          <>
            {/* Alignment Bar */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3 }}>
            {[
              { type: 'left' as const, icon: <AlignLeft size={12} />, title: 'Align Left' },
              { type: 'center' as const, icon: <AlignCenter size={12} />, title: 'Align Center Horizontal' },
              { type: 'right' as const, icon: <AlignRight size={12} />, title: 'Align Right' },
              { type: 'top' as const, icon: <ArrowUp size={12} />, title: 'Align Top' },
              { type: 'middle' as const, icon: <AlignCenter size={12} style={{ transform: 'rotate(90deg)' }} />, title: 'Align Center Vertical' },
              { type: 'bottom' as const, icon: <ArrowDown size={12} />, title: 'Align Bottom' },
            ].map((btn) => (
              <button
                key={btn.type}
                type="button"
                onClick={() => alignSelectedElements(btn.type)}
                style={S.iconBtn}
                title={btn.title}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Frame / Geometry */}
        <div>
          <div style={S.sectionTitle}>Frame</div>
          <div style={S.grid2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>X</span>
              <input
                type="number"
                value={Math.round(el.x)}
                onChange={(e) => updateElement(el.id, { x: Number(e.target.value) || 0 })}
                style={S.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>Y</span>
              <input
                type="number"
                value={Math.round(el.y)}
                onChange={(e) => updateElement(el.id, { y: Number(e.target.value) || 0 })}
                style={S.input}
              />
            </div>
          </div>
          <div style={S.grid2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>W</span>
              <input
                type="number"
                value={Math.round(el.width)}
                onChange={(e) => updateElement(el.id, { width: Math.max(10, Number(e.target.value) || 10) })}
                style={S.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>H</span>
              <input
                type="number"
                value={Math.round(el.height)}
                onChange={(e) => updateElement(el.id, { height: Math.max(10, Number(e.target.value) || 10) })}
                style={S.input}
              />
            </div>
          </div>

          <div style={S.grid2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>R</span>
              <input
                type="number"
                value={s.borderRadius ?? 0}
                onChange={(e) => updateElementStyles(el.id, { borderRadius: Number(e.target.value) || 0 })}
                placeholder="0"
                style={S.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 12 }}>%</span>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round((s.opacity ?? 1) * 100)}
                onChange={(e) => updateElementStyles(el.id, { opacity: (Number(e.target.value) || 100) / 100 })}
                style={S.input}
              />
            </div>
          </div>
        </div>

        {/* Section: Content (for text, button, image) */}
        {hasText && (
          <div>
            <div style={S.sectionTitle}>Content</div>
            <textarea
              rows={2}
              value={el.content || ''}
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              placeholder="Text content..."
              style={{
                ...S.input,
                height: 'auto',
                padding: '6px 8px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {isImage && (
          <div>
            <div style={S.sectionTitle}>Image Source</div>
            <input
              type="text"
              value={el.content || ''}
              onChange={(e) => updateElement(el.id, { content: e.target.value })}
              placeholder="Image URL..."
              style={S.input}
            />
          </div>
        )}

        {/* Section: Poll Settings */}
        {el.type === 'poll' && (
          <div>
            <div style={S.sectionTitle}>Poll Configuration</div>
            <div style={S.row}>
              <span style={S.label}>Question</span>
              <input
                type="text"
                value={el.pollConfig?.question || ''}
                onChange={(e) => updateElement(el.id, {
                  pollConfig: {
                    ...(el.pollConfig || { question: '', options: [] }),
                    question: e.target.value,
                  },
                })}
                style={S.input}
              />
            </div>
            <div style={S.row}>
              <span style={S.label}>Theme</span>
              <input
                type="color"
                value={el.pollConfig?.themeColor || '#6366f1'}
                onChange={(e) => updateElement(el.id, {
                  pollConfig: {
                    ...(el.pollConfig || { question: '', options: [] }),
                    themeColor: e.target.value,
                  },
                })}
                style={{ ...S.input, width: 36, height: 24, padding: 0, cursor: 'pointer' }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ ...S.label, display: 'block', marginBottom: 4 }}>Poll Options</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(el.pollConfig?.options || []).map((opt, idx) => (
                  <div key={opt.id || idx} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOpts = [...(el.pollConfig?.options || [])];
                        newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                        updateElement(el.id, {
                          pollConfig: {
                            ...(el.pollConfig || { question: '', options: [] }),
                            options: newOpts,
                          },
                        });
                      }}
                      style={{ ...S.input, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOpts = (el.pollConfig?.options || []).filter((_, i) => i !== idx);
                        updateElement(el.id, {
                          pollConfig: {
                            ...(el.pollConfig || { question: '', options: [] }),
                            options: newOpts,
                          },
                        });
                      }}
                      style={{ ...S.iconBtn, width: 22, height: 22, color: '#ef4444' }}
                      title="Remove Option"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const currentOpts = el.pollConfig?.options || [];
                    const newOpt = {
                      id: `opt_${Date.now()}`,
                      label: `Option ${currentOpts.length + 1}`,
                      votes: 0,
                    };
                    updateElement(el.id, {
                      pollConfig: {
                        ...(el.pollConfig || { question: '', options: [] }),
                        options: [...currentOpts, newOpt],
                      },
                    });
                  }}
                  style={{
                    ...S.input,
                    height: 24,
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#1a1a24',
                    color: '#818cf8',
                    border: '1px dashed #313952',
                  }}
                >
                  + Add Option
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section: Guestbook Settings */}
        {el.type === 'guestbook' && (
          <div>
            <div style={S.sectionTitle}>Guestbook Wall</div>
            <div style={S.row}>
              <span style={S.label}>Title</span>
              <input
                type="text"
                value={el.guestbookConfig?.title || ''}
                onChange={(e) => updateElement(el.id, {
                  guestbookConfig: {
                    ...(el.guestbookConfig || { title: '', entries: [] }),
                    title: e.target.value,
                  },
                })}
                style={S.input}
              />
            </div>
            <div style={S.row}>
              <span style={S.label}>Subtitle</span>
              <input
                type="text"
                value={el.guestbookConfig?.subtitle || ''}
                onChange={(e) => updateElement(el.id, {
                  guestbookConfig: {
                    ...(el.guestbookConfig || { title: '', entries: [] }),
                    subtitle: e.target.value,
                  },
                })}
                style={S.input}
              />
            </div>
          </div>
        )}

        {/* Section: Reaction Settings */}
        {el.type === 'reaction' && (
          <div>
            <div style={S.sectionTitle}>Reaction Counter</div>
            <div style={S.row}>
              <span style={S.label}>Emoji</span>
              <input
                type="text"
                value={el.reactionConfig?.emoji || '🔥'}
                onChange={(e) => updateElement(el.id, {
                  reactionConfig: {
                    ...(el.reactionConfig || { emoji: '🔥', label: '', count: 0 }),
                    emoji: e.target.value,
                  },
                })}
                style={{ ...S.input, width: 44, textAlign: 'center' }}
              />
            </div>
            <div style={S.row}>
              <span style={S.label}>Label</span>
              <input
                type="text"
                value={el.reactionConfig?.label || ''}
                onChange={(e) => updateElement(el.id, {
                  reactionConfig: {
                    ...(el.reactionConfig || { emoji: '🔥', label: '', count: 0 }),
                    label: e.target.value,
                  },
                })}
                style={S.input}
              />
            </div>
            <div style={S.row}>
              <span style={S.label}>Base Count</span>
              <input
                type="number"
                value={el.reactionConfig?.count ?? 0}
                onChange={(e) => updateElement(el.id, {
                  reactionConfig: {
                    ...(el.reactionConfig || { emoji: '🔥', label: '', count: 0 }),
                    count: parseInt(e.target.value, 10) || 0,
                  },
                })}
                style={S.input}
              />
            </div>
            <div style={S.row}>
              <span style={S.label}>Sound</span>
              <select
                value={el.reactionConfig?.soundEffect || 'pop'}
                onChange={(e) => updateElement(el.id, {
                  reactionConfig: {
                    ...(el.reactionConfig || { emoji: '🔥', label: '', count: 0 }),
                    soundEffect: e.target.value as any,
                  },
                })}
                style={S.input}
              >
                <option value="pop">Pop</option>
                <option value="bell">Bell</option>
                <option value="chime">Chime</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        )}

        {/* Section: Typography (if text or button) */}
        {hasText && (
          <div>
            <div style={S.sectionTitle}>Typography</div>
            {/* Font Family */}
            <div style={S.row}>
              <span style={S.label}>Font</span>
              <select
                value={s.fontFamily || 'Inter'}
                onChange={(e) => updateElementStyles(el.id, { fontFamily: e.target.value })}
                style={S.input}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value} style={{ background: '#18181b', color: '#fff' }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Size & Weight */}
            <div style={S.grid2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: '#71717a', width: 14 }}>Px</span>
                <input
                  type="number"
                  value={s.fontSize || 16}
                  onChange={(e) => updateElementStyles(el.id, { fontSize: Number(e.target.value) || 16 })}
                  style={S.input}
                />
              </div>
              <div>
                <select
                  value={s.fontWeight || 'normal'}
                  onChange={(e) => updateElementStyles(el.id, { fontWeight: e.target.value })}
                  style={S.input}
                >
                  <option value="300" style={{ background: '#18181b' }}>Light (300)</option>
                  <option value="normal" style={{ background: '#18181b' }}>Regular (400)</option>
                  <option value="500" style={{ background: '#18181b' }}>Medium (500)</option>
                  <option value="600" style={{ background: '#18181b' }}>SemiBold (600)</option>
                  <option value="bold" style={{ background: '#18181b' }}>Bold (700)</option>
                  <option value="800" style={{ background: '#18181b' }}>Black (800)</option>
                </select>
              </div>
            </div>

            {/* Text Color */}
            <ColorPickerRow
              label="Color"
              value={s.color || '#ffffff'}
              onChange={(val) => updateElementStyles(el.id, { color: val })}
            />

            {/* Text Alignment */}
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {[
                { align: 'left', icon: <AlignLeft size={13} /> },
                { align: 'center', icon: <AlignCenter size={13} /> },
                { align: 'right', icon: <AlignRight size={13} /> },
              ].map((item) => (
                <button
                  key={item.align}
                  type="button"
                  onClick={() => updateElementStyles(el.id, { textAlign: item.align as any })}
                  style={{
                    ...S.iconBtn,
                    flex: 1,
                    backgroundColor: s.textAlign === item.align ? '#22222e' : '#141418',
                    color: s.textAlign === item.align ? '#ffffff' : '#71717a',
                    border: s.textAlign === item.align ? '1px solid #383848' : '1px solid #222228',
                  }}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section: Fill & Appearance */}
        {hasFill && (
          <div>
            <div style={S.sectionTitle}>Fill</div>
            <ColorPickerRow
              label="Background"
              value={s.backgroundColor || 'transparent'}
              onChange={(val) => updateElementStyles(el.id, { backgroundColor: val })}
            />
          </div>
        )}

        {/* Section: Stroke / Border */}
        <div>
          <div style={S.sectionTitle}>Stroke</div>
          <div style={S.grid2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#71717a', width: 22 }}>Width</span>
              <input
                type="number"
                min="0"
                value={s.borderWidth || 0}
                onChange={(e) => updateElementStyles(el.id, { borderWidth: Number(e.target.value) || 0 })}
                style={S.input}
              />
            </div>
            <div>
              <select
                value={s.borderStyle || 'solid'}
                onChange={(e) => updateElementStyles(el.id, { borderStyle: e.target.value as any })}
                style={S.input}
              >
                <option value="solid" style={{ background: '#18181b' }}>Solid</option>
                <option value="dashed" style={{ background: '#18181b' }}>Dashed</option>
                <option value="dotted" style={{ background: '#18181b' }}>Dotted</option>
              </select>
            </div>
          </div>
          {(s.borderWidth ?? 0) > 0 && (
            <ColorPickerRow
              label="Color"
              value={s.borderColor || '#333333'}
              onChange={(val) => updateElementStyles(el.id, { borderColor: val })}
            />
          )}
        </div>

        {/* Section: Layout & Padding (for container / section) */}
        {isContainerLike && (
          <div>
            <div style={S.sectionTitle}>Auto Layout</div>
            <div style={S.row}>
              <span style={S.label}>Padding</span>
              <input
                type="number"
                value={s.padding || 0}
                onChange={(e) => updateElementStyles(el.id, { padding: Number(e.target.value) || 0 })}
                style={S.input}
              />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => updateElementLayout(el.id, { direction: 'row' })}
                style={{
                  ...S.iconBtn,
                  flex: 1,
                  height: 24,
                  fontSize: 10,
                  backgroundColor: el.layout?.direction === 'row' ? '#22222e' : '#141418',
                  color: el.layout?.direction === 'row' ? '#fff' : '#71717a',
                  border: el.layout?.direction === 'row' ? '1px solid #383848' : '1px solid #222228',
                }}
              >
                Horizontal (Row)
              </button>
              <button
                type="button"
                onClick={() => updateElementLayout(el.id, { direction: 'column' })}
                style={{
                  ...S.iconBtn,
                  flex: 1,
                  height: 24,
                  fontSize: 10,
                  backgroundColor: el.layout?.direction !== 'row' ? '#22222e' : '#141418',
                  color: el.layout?.direction !== 'row' ? '#fff' : '#71717a',
                  border: el.layout?.direction !== 'row' ? '1px solid #383848' : '1px solid #222228',
                }}
              >
                Vertical (Column)
              </button>
            </div>
          </div>
        )}

        {/* Interactive States Trigger Card in Appearance */}
        <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 500, color: '#f4f4f5' }}>State Overrides</span>
            <span style={{ fontSize: 9.5, color: '#71717a' }}>hover &bull; active &bull; focus</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {(['hover', 'active', 'focus'] as const).map((st) => {
              const hasSt =
                st === 'hover' ? Boolean(b.hoverStyles && Object.keys(b.hoverStyles).length > 0) :
                st === 'active' ? Boolean(b.activeStyles && Object.keys(b.activeStyles).length > 0) :
                Boolean(b.focusStyles && Object.keys(b.focusStyles).length > 0);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStateTabChange(st)}
                  style={{
                    padding: '6px 4px',
                    borderRadius: 5,
                    border: hasSt ? '1px solid #6366f1' : '1px solid #22222a',
                    backgroundColor: hasSt ? 'rgba(99, 102, 241, 0.12)' : '#141418',
                    color: hasSt ? '#c7d2fe' : '#a1a1aa',
                    fontSize: 10,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                  }}
                >
                  <span>:{st}</span>
                  {hasSt && <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#818cf8' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Interactivity & Click Action */}
        <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
          <div style={S.sectionTitle}>
            <span>Interactivity</span>
            {b.actionType && b.actionType !== 'none' && (
              <span style={{ fontSize: 9.5, color: '#818cf8', fontWeight: 500 }}>Active</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Trigger Action</span>
            <select
              value={b.actionType || 'none'}
              onChange={(e) => {
                const act = e.target.value as ActionType;
                let nextPayload = b.actionPayload || '';
                if (act === 'navigate-page') {
                  nextPayload = '__next__';
                } else if (act === 'copy-text') {
                  if (!nextPayload || nextPayload.startsWith('http') || nextPayload === '__next__') {
                    nextPayload = 'SAVE2026';
                  }
                } else if (act === 'submit-form') {
                  if (!nextPayload || nextPayload.startsWith('http') || nextPayload === '__next__') {
                    nextPayload = '🎉 Thank you for signing up! Check your inbox.';
                  }
                } else if (act === 'navigate-url') {
                  if (!nextPayload || !nextPayload.startsWith('http')) {
                    nextPayload = 'https://example.com';
                  }
                } else if (act === 'alert') {
                  if (!nextPayload || nextPayload.startsWith('http') || nextPayload === '__next__') {
                    nextPayload = 'Button action triggered successfully!';
                  }
                }
                updateElementBehavior(el.id, {
                  actionType: act,
                  actionPayload: nextPayload,
                });
                if (act === 'confetti') triggerConfetti();
                if (act !== 'none') playSound('pop');
              }}
              style={S.input}
            >
              <option value="none" style={{ background: '#18181b' }}>None (Static)</option>
              <option value="navigate-page" style={{ background: '#18181b' }}>📄 Switch Page (Next, Prev, Specific)</option>
              <option value="submit-form" style={{ background: '#18181b' }}>🚀 Sign Up / Submit Form</option>
              <option value="open-modal" style={{ background: '#18181b' }}>🪟 Open Modal Popup</option>
              <option value="scroll-section" style={{ background: '#18181b' }}>⚓ Scroll to Section</option>
              <option value="navigate-url" style={{ background: '#18181b' }}>↗ Open External URL</option>
              <option value="confetti" style={{ background: '#18181b' }}>🎉 Trigger Confetti Burst</option>
              <option value="scroll-top" style={{ background: '#18181b' }}>↑ Scroll to Top</option>
              <option value="copy-text" style={{ background: '#18181b' }}>📋 Copy Promo / Text</option>
              <option value="alert" style={{ background: '#18181b' }}>🔔 Show Notification Alert</option>
            </select>
          </div>

          {/* If Page Navigation */}
          {b.actionType === 'navigate-page' && (() => {
            const validOptions = ['__next__', '__prev__', ...project.pages.map((p) => p.id)];
            const currentVal = validOptions.includes(b.actionPayload || '')
              ? b.actionPayload
              : '__next__';

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Target Page</span>
                <select
                  value={currentVal}
                  onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                  style={S.input}
                >
                  <option value="__next__" style={{ background: '#18181b' }}>→ Next Page in Flow</option>
                  <option value="__prev__" style={{ background: '#18181b' }}>← Previous Page</option>
                  <optgroup label="Specific Project Pages" style={{ background: '#18181b', color: '#818cf8' }}>
                    {project.pages.map((p) => (
                      <option key={p.id} value={p.id} style={{ background: '#18181b', color: '#e4e4e7' }}>
                        {p.name} {p.id === activePage.id ? '(Current)' : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
                {project.pages.length <= 1 && (
                  <div style={{ fontSize: 10, color: '#71717a', lineHeight: 1.3, marginTop: 2 }}>
                    Tip: Project currently has 1 page. Click the "+" button in the top header or Pages tab to add a 2nd page!
                  </div>
                )}
              </div>
            );
          })()}

          {/* If Submit Form / Sign Up */}
          {b.actionType === 'submit-form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Confirmation Message</span>
                <span style={{ fontSize: 9.5, color: '#71717a' }}>Form validation + celebration</span>
              </div>
              <input
                type="text"
                placeholder="e.g. Welcome aboard! Check your inbox."
                value={b.actionPayload || ''}
                onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                style={S.input}
              />
            </div>
          )}

          {/* If Scroll to Section */}
          {b.actionType === 'scroll-section' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Target Section</span>
              {activePage.elements.filter((e) => e.type === 'section').length > 0 ? (
                <select
                  value={b.actionPayload || ''}
                  onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                  style={S.input}
                >
                  <option value="" style={{ background: '#18181b' }}>Select a Section...</option>
                  {activePage.elements
                    .filter((e) => e.type === 'section')
                    .map((sec) => (
                      <option key={sec.id} value={`#${sec.id}`} style={{ background: '#18181b' }}>
                        {sec.name || `Section (${sec.id.slice(0, 6)})`}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="#section-id or #pricing"
                  value={b.actionPayload || ''}
                  onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                  style={S.input}
                />
              )}
            </div>
          )}

          {/* If Open Modal */}
          {b.actionType === 'open-modal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Modal Title</span>
              <input
                type="text"
                placeholder="Modal Title (e.g. Sign Up)"
                value={b.actionModalTitle || ''}
                onChange={(e) => updateElementBehavior(el.id, { actionModalTitle: e.target.value })}
                style={S.input}
              />
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500, marginTop: 4 }}>Modal Message</span>
              <input
                type="text"
                placeholder="Modal body or description..."
                value={b.actionModalBody || b.actionPayload || ''}
                onChange={(e) =>
                  updateElementBehavior(el.id, {
                    actionModalBody: e.target.value,
                    actionPayload: e.target.value,
                  })
                }
                style={S.input}
              />
            </div>
          )}

          {/* If Navigate URL */}
          {b.actionType === 'navigate-url' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Destination URL</span>
              <input
                type="text"
                placeholder="https://example.com"
                value={b.actionPayload || ''}
                onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                style={S.input}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '2px 0' }}>
                <input
                  type="checkbox"
                  checked={b.targetBlank ?? true}
                  onChange={(e) => updateElementBehavior(el.id, { targetBlank: e.target.checked })}
                  style={{ accentColor: '#6366f1' }}
                />
                <span style={{ fontSize: 10.5, color: '#a1a1aa' }}>Open link in new tab</span>
              </label>
            </div>
          )}

          {/* If Copy Text */}
          {b.actionType === 'copy-text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Text to Copy</span>
                <span style={{ fontSize: 9.5, color: '#71717a' }}>Copies to user's clipboard</span>
              </div>
              <input
                type="text"
                placeholder="e.g. DISCOUNT2026 or promo code"
                value={b.actionPayload || ''}
                onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                style={S.input}
              />
            </div>
          )}

          {/* If Alert */}
          {b.actionType === 'alert' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Notification Alert Message</span>
              <input
                type="text"
                placeholder="Message to display..."
                value={b.actionPayload || ''}
                onChange={(e) => updateElementBehavior(el.id, { actionPayload: e.target.value })}
                style={S.input}
              />
            </div>
          )}

          {/* Universal Test Action Live Button */}
          {b.actionType && b.actionType !== 'none' && (
            <button
              type="button"
              onClick={(e) => {
                executeElementAction(
                  el,
                  {
                    project,
                    activePage,
                    setActivePage,
                    updatePageSettings,
                    showToast,
                  },
                  e
                );
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                height: 28,
                marginTop: 6,
                borderRadius: 6,
                backgroundColor: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.22)';
                e.currentTarget.style.borderColor = '#6366f1';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.12)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.color = '#a5b4fc';
              }}
              title="Click to test this action immediately"
            >
              <Play size={11} style={{ fill: 'currentColor' }} />
              <span>Test Action Live</span>
            </button>
          )}
        </div>

        {/* Section: Motion & Animation */}
        <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
          <div style={S.sectionTitle}>
            <span>Motion & Animation</span>
            {s.animationName && s.animationName !== 'none' && (
              <span style={{ fontSize: 9.5, color: '#818cf8', fontWeight: 500 }}>Active</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Animation Preset</span>
            <select
              value={s.animationName || 'none'}
              onChange={(e) => {
                const name = e.target.value as any;
                const preset = MOTION_PRESETS.find((p) => p.id === name);
                updateElementStyles(el.id, {
                  animationName: name,
                  animationDuration: preset?.defaultDuration || 0.7,
                  animationIterationCount: preset?.defaultIteration || '1',
                  animationTimingFunction: preset?.defaultTiming || 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationTrigger: 'entrance',
                });
              }}
              style={S.input}
            >
              <option value="none" style={{ background: '#18181b' }}>None (Static)</option>
              <optgroup label="Entrance Motion" style={{ background: '#18181b', color: '#818cf8' }}>
                <option value="fadeIn" style={{ background: '#18181b', color: '#e4e4e7' }}>Fade In (Smooth Opacity)</option>
                <option value="slideUp" style={{ background: '#18181b', color: '#e4e4e7' }}>Slide Up (Upward Entrance)</option>
                <option value="slideDown" style={{ background: '#18181b', color: '#e4e4e7' }}>Slide Down</option>
                <option value="slideLeft" style={{ background: '#18181b', color: '#e4e4e7' }}>Slide Left</option>
                <option value="slideRight" style={{ background: '#18181b', color: '#e4e4e7' }}>Slide Right</option>
                <option value="zoomIn" style={{ background: '#18181b', color: '#e4e4e7' }}>Zoom In (Scale 85% → 100%)</option>
                <option value="popIn" style={{ background: '#18181b', color: '#e4e4e7' }}>Pop In (Spring Bounce)</option>
                <option value="blurIn" style={{ background: '#18181b', color: '#e4e4e7' }}>Blur In (Cinematic Focus)</option>
              </optgroup>
              <optgroup label="Ambient Loops" style={{ background: '#18181b', color: '#34d399' }}>
                <option value="float" style={{ background: '#18181b', color: '#e4e4e7' }}>Ambient Float (Gentle Hover)</option>
                <option value="pulse" style={{ background: '#18181b', color: '#e4e4e7' }}>Pulse Glow (Breathing Scale)</option>
                <option value="shimmer" style={{ background: '#18181b', color: '#e4e4e7' }}>Shimmer Sweep (Luminance)</option>
                <option value="spin" style={{ background: '#18181b', color: '#e4e4e7' }}>Continuous Spin (360° Loop)</option>
              </optgroup>
            </select>
          </div>

          {s.animationName && s.animationName !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>Trigger</span>
                <select
                  value={s.animationTrigger || 'entrance'}
                  onChange={(e) => updateElementStyles(el.id, { animationTrigger: e.target.value as any })}
                  style={S.input}
                >
                  <option value="entrance" style={{ background: '#18181b' }}>On Page Load (Entrance)</option>
                  <option value="hover" style={{ background: '#18181b' }}>On Hover Only</option>
                  <option value="scroll" style={{ background: '#18181b' }}>When Scrolled into View</option>
                </select>
              </div>

              {/* Duration & Delay */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10.5, color: '#8e8e98' }}>Duration (s)</span>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={s.animationDuration ?? 0.7}
                    onChange={(e) => updateElementStyles(el.id, { animationDuration: parseFloat(e.target.value) || 0.7 })}
                    style={S.input}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10.5, color: '#8e8e98' }}>Delay (s)</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={s.animationDelay ?? 0}
                    onChange={(e) => updateElementStyles(el.id, { animationDelay: parseFloat(e.target.value) || 0 })}
                    style={S.input}
                  />
                </div>
              </div>

              {/* Loop / Iteration */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                <span style={{ fontSize: 11, color: '#a1a1aa' }}>Loop Continuously</span>
                <button
                  type="button"
                  onClick={() =>
                    updateElementStyles(el.id, {
                      animationIterationCount: s.animationIterationCount === 'infinite' ? '1' : 'infinite',
                    })
                  }
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 10.5,
                    fontWeight: 600,
                    border: s.animationIterationCount === 'infinite' ? '1px solid #6366f1' : '1px solid #27272a',
                    backgroundColor: s.animationIterationCount === 'infinite' ? 'rgba(99,102,241,0.2)' : '#18181b',
                    color: s.animationIterationCount === 'infinite' ? '#a5b4fc' : '#71717a',
                    cursor: 'pointer',
                  }}
                >
                  {s.animationIterationCount === 'infinite' ? 'Infinite Loop' : 'Play Once'}
                </button>
              </div>

              {/* Re-trigger Preview Button */}
              <button
                type="button"
                onClick={() => {
                  const currentName = s.animationName;
                  updateElementStyles(el.id, { animationName: 'none' });
                  setTimeout(() => {
                    updateElementStyles(el.id, { animationName: currentName });
                  }, 30);
                }}
                style={{
                  ...S.iconBtn,
                  width: '100%',
                  height: 24,
                  fontSize: 10,
                  gap: 5,
                  backgroundColor: '#181822',
                  borderColor: '#2d2d3d',
                  color: '#a5b4fc',
                }}
              >
                <Sparkles size={11} />
                <span>Replay Animation</span>
              </button>
            </div>
          )}
        </div>

        {/* Section: Layer Arrange & Actions */}
        <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
          <div style={S.sectionTitle}>Arrange</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => updateElement(el.id, { zIndex: (el.zIndex || 1) + 1 })}
              style={{ ...S.iconBtn, width: '100%', gap: 5, fontSize: 10.5 }}
            >
              <MoveUp size={12} />
              <span>Bring Forward</span>
            </button>
            <button
              type="button"
              onClick={() => updateElement(el.id, { zIndex: Math.max(1, (el.zIndex || 1) - 1) })}
              style={{ ...S.iconBtn, width: '100%', gap: 5, fontSize: 10.5 }}
            >
              <MoveDown size={12} />
              <span>Send Backward</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              type="button"
              onClick={() => duplicateElement(el.id)}
              style={{ ...S.iconBtn, width: '100%', gap: 5, fontSize: 10.5 }}
            >
              <Copy size={12} />
              <span>Duplicate</span>
            </button>
            <button
              type="button"
              disabled={el.locked}
              onClick={() => {
                deleteElement(el.id);
                showToast(`Deleted ${el.name}`, 'info');
              }}
              style={{
                ...S.iconBtn,
                width: '100%',
                gap: 5,
                fontSize: 10.5,
                color: el.locked ? '#52525b' : '#f87171',
                borderColor: el.locked ? '#222228' : '#382222',
                backgroundColor: el.locked ? '#141418' : 'rgba(239, 68, 68, 0.08)',
                cursor: el.locked ? 'not-allowed' : 'pointer',
              }}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </>
    )}

        {/* ── STATE STUDIO: HOVER ─────────────────────────────── */}
        {activeStateVariant === 'hover' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#141418', border: '1px solid #1f1f28', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#818cf8', backgroundColor: '#1c1c28', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>:hover</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#f4f4f5' }}>Hover State</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateElementBehavior(el.id, { hoverStyles: undefined });
                  showToast('Cleared hover overrides', 'info');
                }}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                title="Reset to Normal State"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets */}
            <div>
              <div style={S.sectionTitle}>Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                {[
                  { label: 'Subtle Lift', styles: { translateY: -4, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.5)' } },
                  { label: 'Scale Pop', styles: { scale: 1.05, translateY: 0 } },
                  { label: 'Indigo Glow', styles: { borderColor: '#6366f1', boxShadow: '0 0 20px rgba(99,102,241,0.5)' } },
                  { label: 'Glass Glaze', styles: { backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 8px 16px rgba(0,0,0,0.3)' } },
                  { label: 'Emerald Glow', styles: { borderColor: '#10b981', boxShadow: '0 0 18px rgba(16,185,129,0.4)' } },
                  { label: 'Floating High', styles: { translateY: -6, scale: 1.02, boxShadow: '0 20px 30px -8px rgba(0,0,0,0.7)' } },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateElementBehavior(el.id, {
                        hoverStyles: {
                          ...b.hoverStyles,
                          ...preset.styles,
                        },
                      });
                      showToast(`Applied ${preset.label}`, 'success');
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      backgroundColor: '#141418',
                      border: '1px solid #1f1f28',
                      color: '#d4d4d8',
                      fontSize: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Colors</div>
              <ColorPickerRow
                label="Hover Fill"
                value={b.hoverStyles?.backgroundColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    hoverStyles: {
                      ...b.hoverStyles,
                      backgroundColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
              {hasText && (
                <ColorPickerRow
                  label="Hover Text"
                  value={b.hoverStyles?.color || 'transparent'}
                  onChange={(val: string) => {
                    updateElementBehavior(el.id, {
                      hoverStyles: {
                        ...b.hoverStyles,
                        color: val === 'transparent' ? undefined : val,
                      },
                    });
                  }}
                />
              )}
              <ColorPickerRow
                label="Hover Border"
                value={b.hoverStyles?.borderColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    hoverStyles: {
                      ...b.hoverStyles,
                      borderColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
            </div>

            {/* Transforms */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Transforms & Lift</div>
              <div style={S.row}>
                <span style={S.label}>Scale Zoom</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <input
                    type="number"
                    min="0.8"
                    max="1.5"
                    step="0.01"
                    value={b.hoverStyles?.scale !== undefined ? b.hoverStyles.scale : 1.0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1.0;
                      updateElementBehavior(el.id, {
                        hoverStyles: {
                          ...b.hoverStyles,
                          scale: val === 1.0 ? undefined : val,
                        },
                      });
                    }}
                    style={{ ...S.input, width: 60 }}
                  />
                  <span style={{ fontSize: 10, color: '#71717a' }}>
                    {(b.hoverStyles?.scale || 1.0) !== 1.0
                      ? `${(b.hoverStyles?.scale || 1.0) > 1.0 ? '+' : ''}${Math.round(((b.hoverStyles?.scale || 1.0) - 1) * 100)}%`
                      : 'None'}
                  </span>
                </div>
              </div>

              <div style={S.row}>
                <span style={S.label}>Elevation Lift (Y)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <input
                    type="number"
                    min="-30"
                    max="30"
                    step="1"
                    value={b.hoverStyles?.translateY !== undefined ? b.hoverStyles.translateY : 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      updateElementBehavior(el.id, {
                        hoverStyles: {
                          ...b.hoverStyles,
                          translateY: val === 0 ? undefined : val,
                        },
                      });
                    }}
                    style={{ ...S.input, width: 60 }}
                  />
                  <span style={{ fontSize: 10, color: '#71717a' }}>
                    {(b.hoverStyles?.translateY || 0) !== 0
                      ? `${b.hoverStyles?.translateY}px ${b.hoverStyles!.translateY! < 0 ? 'up' : 'down'}`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Effects */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Effects</div>
              <div style={S.row}>
                <span style={S.label}>Shadow Preset</span>
                <select
                  value={b.hoverStyles?.boxShadow || 'none'}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateElementBehavior(el.id, {
                      hoverStyles: {
                        ...b.hoverStyles,
                        boxShadow: val === 'none' ? undefined : val,
                      },
                    });
                  }}
                  style={S.input}
                >
                  <option value="none" style={{ background: '#18181b' }}>Default (Unchanged)</option>
                  <option value="0 12px 24px -4px rgba(0,0,0,0.5), 0 6px 12px -4px rgba(0,0,0,0.3)" style={{ background: '#18181b' }}>Elevated Drop</option>
                  <option value="0 20px 35px -8px rgba(0,0,0,0.7)" style={{ background: '#18181b' }}>Floating High</option>
                  <option value="0 0 25px rgba(99, 102, 241, 0.6)" style={{ background: '#18181b' }}>Indigo Glow</option>
                  <option value="0 0 25px rgba(16, 185, 129, 0.6)" style={{ background: '#18181b' }}>Emerald Glow</option>
                  <option value="0 0 25px rgba(244, 63, 94, 0.6)" style={{ background: '#18181b' }}>Rose Glow</option>
                  <option value="inset 0 2px 6px rgba(0,0,0,0.5)" style={{ background: '#18181b' }}>Inset Bevel</option>
                </select>
              </div>

              <div style={S.row}>
                <span style={S.label}>Opacity</span>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={b.hoverStyles?.opacity !== undefined ? b.hoverStyles.opacity : 1}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateElementBehavior(el.id, {
                      hoverStyles: {
                        ...b.hoverStyles,
                        opacity: isNaN(val) || val === 1 ? undefined : val,
                      },
                    });
                  }}
                  style={{ ...S.input, width: 60 }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStateTabChange('default')}
              style={{
                marginTop: 6,
                padding: '7px 12px',
                borderRadius: 6,
                backgroundColor: '#1b1b22',
                border: '1px solid #272732',
                color: '#d4d4d8',
                fontSize: 10.5,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Done Editing :hover &rarr;
            </button>
          </div>
        )}

        {/* ── STATE STUDIO: ACTIVE ────────────────────────────── */}
        {activeStateVariant === 'active' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#141418', border: '1px solid #1f1f28', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#c084fc', backgroundColor: '#201828', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>:active</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#f4f4f5' }}>Pressed State</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateElementBehavior(el.id, { activeStyles: undefined });
                  showToast('Cleared active overrides', 'info');
                }}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                title="Reset to Normal State"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets */}
            <div>
              <div style={S.sectionTitle}>Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                {[
                  { label: 'Push Down', styles: { scale: 0.96, translateY: 2, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' } },
                  { label: 'Subtle Click', styles: { scale: 0.98, translateY: 1 } },
                  { label: 'Color Flash', styles: { backgroundColor: '#4f46e5', scale: 0.97 } },
                  { label: 'Deep Depress', styles: { scale: 0.94, translateY: 3, boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.6)' } },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateElementBehavior(el.id, {
                        activeStyles: {
                          ...b.activeStyles,
                          ...preset.styles,
                        },
                      });
                      showToast(`Applied ${preset.label}`, 'success');
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      backgroundColor: '#141418',
                      border: '1px solid #1f1f28',
                      color: '#d4d4d8',
                      fontSize: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Colors</div>
              <ColorPickerRow
                label="Active Fill"
                value={b.activeStyles?.backgroundColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    activeStyles: {
                      ...b.activeStyles,
                      backgroundColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
              {hasText && (
                <ColorPickerRow
                  label="Active Text"
                  value={b.activeStyles?.color || 'transparent'}
                  onChange={(val: string) => {
                    updateElementBehavior(el.id, {
                      activeStyles: {
                        ...b.activeStyles,
                        color: val === 'transparent' ? undefined : val,
                      },
                    });
                  }}
                />
              )}
              <ColorPickerRow
                label="Active Border"
                value={b.activeStyles?.borderColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    activeStyles: {
                      ...b.activeStyles,
                      borderColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
            </div>

            {/* Transforms */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Press Dynamics</div>
              <div style={S.row}>
                <span style={S.label}>Pressed Scale</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <input
                    type="number"
                    min="0.8"
                    max="1.2"
                    step="0.01"
                    value={b.activeStyles?.scale !== undefined ? b.activeStyles.scale : 0.96}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0.96;
                      updateElementBehavior(el.id, {
                        activeStyles: {
                          ...b.activeStyles,
                          scale: val,
                        },
                      });
                    }}
                    style={{ ...S.input, width: 60 }}
                  />
                  <span style={{ fontSize: 10, color: '#71717a' }}>e.g. 0.96</span>
                </div>
              </div>

              <div style={S.row}>
                <span style={S.label}>Push Offset (Y)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                  <input
                    type="number"
                    min="-10"
                    max="15"
                    step="1"
                    value={b.activeStyles?.translateY !== undefined ? b.activeStyles.translateY : 2}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      updateElementBehavior(el.id, {
                        activeStyles: {
                          ...b.activeStyles,
                          translateY: val,
                        },
                      });
                    }}
                    style={{ ...S.input, width: 60 }}
                  />
                  <span style={{ fontSize: 10, color: '#71717a' }}>+2px down</span>
                </div>
              </div>
            </div>

            {/* Effects */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Effects</div>
              <div style={S.row}>
                <span style={S.label}>Pressed Shadow</span>
                <select
                  value={b.activeStyles?.boxShadow || 'inset 0 2px 4px rgba(0,0,0,0.4)'}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateElementBehavior(el.id, {
                      activeStyles: {
                        ...b.activeStyles,
                        boxShadow: val === 'none' ? undefined : val,
                      },
                    });
                  }}
                  style={S.input}
                >
                  <option value="none" style={{ background: '#18181b' }}>None</option>
                  <option value="inset 0 2px 4px rgba(0,0,0,0.4)" style={{ background: '#18181b' }}>Standard Inset</option>
                  <option value="inset 0 4px 8px rgba(0,0,0,0.6)" style={{ background: '#18181b' }}>Deep Bevel</option>
                  <option value="0 1px 2px rgba(0,0,0,0.2)" style={{ background: '#18181b' }}>Flat Pressed</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStateTabChange('default')}
              style={{
                marginTop: 6,
                padding: '7px 12px',
                borderRadius: 6,
                backgroundColor: '#1b1b22',
                border: '1px solid #272732',
                color: '#d4d4d8',
                fontSize: 10.5,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Done Editing :active &rarr;
            </button>
          </div>
        )}

        {/* ── STATE STUDIO: FOCUS ─────────────────────────────── */}
        {activeStateVariant === 'focus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Header & Reset */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#141418', border: '1px solid #1f1f28', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', backgroundColor: '#13202d', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>:focus</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: '#f4f4f5' }}>Focus State</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateElementBehavior(el.id, { focusStyles: undefined });
                  showToast('Cleared focus overrides', 'info');
                }}
                style={{ background: 'none', border: 'none', color: '#71717a', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                title="Reset to Normal State"
              >
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            </div>

            {/* Presets */}
            <div>
              <div style={S.sectionTitle}>Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                {[
                  { label: 'Indigo Ring', styles: { outlineColor: '#6366f1', outlineWidth: 2, boxShadow: '0 0 0 3px rgba(99,102,241,0.35)' } },
                  { label: 'High Contrast', styles: { outlineColor: '#ffffff', outlineWidth: 2, boxShadow: '0 0 0 3px rgba(0,0,0,0.8)' } },
                  { label: 'Emerald Ring', styles: { outlineColor: '#10b981', outlineWidth: 2, boxShadow: '0 0 0 3px rgba(16,185,129,0.35)' } },
                  { label: 'Subtle Border', styles: { borderColor: '#818cf8', outlineWidth: 1, outlineColor: '#818cf8' } },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateElementBehavior(el.id, {
                        focusStyles: {
                          ...b.focusStyles,
                          ...preset.styles,
                        },
                      });
                      showToast(`Applied ${preset.label}`, 'success');
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      backgroundColor: '#141418',
                      border: '1px solid #1f1f28',
                      color: '#d4d4d8',
                      fontSize: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus Ring & Outline */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Focus Ring & Outline</div>
              <ColorPickerRow
                label="Ring Color"
                value={b.focusStyles?.outlineColor || '#6366f1'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    focusStyles: {
                      ...b.focusStyles,
                      outlineColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />

              <div style={S.row}>
                <span style={S.label}>Ring Width</span>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {[1, 2, 3, 4].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        updateElementBehavior(el.id, {
                          focusStyles: {
                            ...b.focusStyles,
                            outlineWidth: w,
                          },
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        borderRadius: 4,
                        border: (b.focusStyles?.outlineWidth || 2) === w ? '1px solid #6366f1' : '1px solid #242430',
                        backgroundColor: (b.focusStyles?.outlineWidth || 2) === w ? '#222232' : '#141418',
                        color: (b.focusStyles?.outlineWidth || 2) === w ? '#fff' : '#a1a1aa',
                        fontSize: 10,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div style={{ borderTop: '1px solid #1a1a20', paddingTop: 12 }}>
              <div style={S.sectionTitle}>Border & Fill Highlights</div>
              <ColorPickerRow
                label="Focus Border"
                value={b.focusStyles?.borderColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    focusStyles: {
                      ...b.focusStyles,
                      borderColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
              <ColorPickerRow
                label="Focus Fill"
                value={b.focusStyles?.backgroundColor || 'transparent'}
                onChange={(val: string) => {
                  updateElementBehavior(el.id, {
                    focusStyles: {
                      ...b.focusStyles,
                      backgroundColor: val === 'transparent' ? undefined : val,
                    },
                  });
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleStateTabChange('default')}
              style={{
                marginTop: 6,
                padding: '7px 12px',
                borderRadius: 6,
                backgroundColor: '#1b1b22',
                border: '1px solid #272732',
                color: '#d4d4d8',
                fontSize: 10.5,
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Done Editing :focus &rarr;
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
