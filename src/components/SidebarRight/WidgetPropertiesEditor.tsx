import React, { useState } from 'react';
import type { CanvasElement } from '../../types/editor';
import {
  HelpCircle,
  PlaySquare,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  BarChart2,
  MessageSquare,
  Heart,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileText,
  Sparkle,
  ExternalLink,
  Timer,
  Headphones,
  SplitSquareVertical,
  Star,
  Music,
} from 'lucide-react';
import { playSound } from '../../utils/interactiveEffects';
import { LOTTIE_PRESETS } from '../Widgets/LottieWidget';

interface WidgetPropertiesEditorProps {
  element: CanvasElement;
  updateElement: (id: string, updates: Partial<CanvasElement>, recordHistory?: boolean) => void;
}

const S = {
  container: {
    backgroundColor: '#121217',
    border: '1px solid #232330',
    borderRadius: 8,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    marginBottom: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottom: '1px solid #1e1e28',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 11.5,
    fontWeight: 700,
    color: '#f4f4f5',
    letterSpacing: '-0.01em',
  },
  badge: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 600,
    padding: '1px 5px',
    borderRadius: 4,
    backgroundColor: 'rgba(99,102,241,0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99,102,241,0.25)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 10.5,
    color: '#a1a1aa',
    fontWeight: 500,
  },
  input: {
    backgroundColor: '#181820',
    border: '1px solid #282836',
    borderRadius: 5,
    color: '#f4f4f5',
    fontSize: 11,
    padding: '5px 8px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  textarea: {
    backgroundColor: '#181820',
    border: '1px solid #282836',
    borderRadius: 5,
    color: '#f4f4f5',
    fontSize: 11,
    padding: '6px 8px',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    minHeight: 52,
  },
  toggleTrack: (active: boolean) => ({
    width: 32,
    height: 18,
    borderRadius: 9999,
    backgroundColor: active ? '#6366f1' : '#272733',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.18s ease',
    border: 'none',
    padding: 0,
    flexShrink: 0,
  }),
  toggleThumb: (active: boolean) => ({
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute' as const,
    top: 2,
    left: active ? 16 : 2,
    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  }),
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px dashed #3a3a4d',
    backgroundColor: '#161620',
    color: '#a5b4fc',
    fontSize: 10.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  itemCard: {
    backgroundColor: '#161620',
    border: '1px solid #262634',
    borderRadius: 6,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  iconBtn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    border: 'none',
    background: 'none',
    color: '#71717a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
};

export const WidgetPropertiesEditor: React.FC<WidgetPropertiesEditorProps> = ({
  element: el,
  updateElement,
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Helper toggle switch component
  const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
    checked,
    onChange,
    label,
  }) => (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <button
        type="button"
        style={S.toggleTrack(checked)}
        onClick={() => onChange(!checked)}
      >
        <span style={S.toggleThumb(checked)} />
      </button>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 1. FAQ ACCORDION                                                            */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'accordion') {
    const config = el.accordionConfig || {
      allowMultiple: false,
      items: [
        { id: '1', title: 'How does this work?', content: 'Everything runs in real-time in the browser and cloud.' },
        { id: '2', title: 'Can I export clean code?', content: 'Yes, full semantic code export is supported.' },
      ],
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        accordionConfig: { ...config, ...patch },
      });
    };

    const handleAddItem = () => {
      const newItem = {
        id: `faq_${Date.now()}`,
        title: `New Question ${config.items.length + 1}`,
        content: 'Enter the answer or details for this question here.',
        isOpen: false,
      };
      updateConfig({ items: [...config.items, newItem] });
      setExpandedItemId(newItem.id);
      playSound('pop');
    };

    const handleRemoveItem = (id: string) => {
      updateConfig({ items: config.items.filter((i) => i.id !== id) });
    };

    const handleUpdateItem = (id: string, patch: Partial<(typeof config.items)[0]>) => {
      updateConfig({
        items: config.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <HelpCircle size={14} color="#818cf8" />
            <span style={S.title}>FAQ Accordion</span>
          </div>
          <span style={S.badge}>{config.items.length} items</span>
        </div>

        <Toggle
          label="Allow Multiple Open"
          checked={config.allowMultiple ?? false}
          onChange={(val) => updateConfig({ allowMultiple: val })}
        />

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#d4d4d8' }}>Questions & Answers</span>
          </div>

          {config.items.map((item, idx) => {
            const isExpanded = expandedItemId === item.id;
            return (
              <div key={item.id} style={S.itemCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    style={{
                      background: 'none', border: 'none', color: '#f4f4f5',
                      fontSize: 11, fontWeight: 600, textAlign: 'left',
                      flex: 1, cursor: 'pointer', padding: 0,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ color: '#818cf8', fontSize: 10 }}>#{idx + 1}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title || 'Untitled'}
                    </span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button
                      type="button"
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      style={S.iconBtn}
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {config.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ ...S.iconBtn, color: '#f87171' }}
                        title="Delete Question"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    <div>
                      <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Question Title</span>
                      <input
                        style={S.input}
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                        placeholder="e.g. How does billing work?"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Answer Content</span>
                      <textarea
                        style={S.textarea}
                        value={item.content}
                        onChange={(e) => handleUpdateItem(item.id, { content: e.target.value })}
                        placeholder="Detailed answer text..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddItem}
            style={S.addBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#3a3a4d';
              e.currentTarget.style.color = '#a5b4fc';
            }}
          >
            <Plus size={12} />
            <span>Add Question</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 2. IMAGE CAROUSEL / SLIDER                                                  */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'carousel') {
    const config = el.carouselConfig || {
      autoplay: true,
      interval: 4,
      showDots: true,
      showArrows: true,
      slides: [
        { id: '1', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80', caption: 'Neo Workspace' },
        { id: '2', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80', caption: 'Creative Studio' },
      ],
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        carouselConfig: { ...config, ...patch },
      });
    };

    const handleAddSlide = () => {
      const newSlide = {
        id: `slide_${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        caption: `Slide ${config.slides.length + 1}`,
      };
      updateConfig({ slides: [...config.slides, newSlide] });
      playSound('pop');
    };

    const handleRemoveSlide = (id: string) => {
      updateConfig({ slides: config.slides.filter((s) => s.id !== id) });
    };

    const handleUpdateSlide = (id: string, patch: Partial<(typeof config.slides)[0]>) => {
      updateConfig({
        slides: config.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Sliders size={14} color="#818cf8" />
            <span style={S.title}>Image Carousel</span>
          </div>
          <span style={S.badge}>{config.slides.length} slides</span>
        </div>

        {/* Toggles */}
        <Toggle
          label="Auto-Play Slides"
          checked={config.autoplay ?? true}
          onChange={(val) => updateConfig({ autoplay: val })}
        />

        {config.autoplay && (
          <div style={S.row}>
            <span style={S.label}>Interval ({config.interval || 4}s)</span>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={config.interval || 4}
              onChange={(e) => updateConfig({ interval: Number(e.target.value) })}
              style={{ flex: 1, maxWidth: 100, accentColor: '#6366f1' }}
            />
          </div>
        )}

        <Toggle
          label="Show Navigation Arrows"
          checked={config.showArrows ?? true}
          onChange={(val) => updateConfig({ showArrows: val })}
        />

        <Toggle
          label="Show Dot Indicators"
          checked={config.showDots ?? true}
          onChange={(val) => updateConfig({ showDots: val })}
        />

        {/* Slides Manager */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#d4d4d8' }}>Slides</span>

          {config.slides.map((slide, idx) => (
            <div key={slide.id} style={S.itemCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={slide.url}
                  alt={slide.caption || 'Slide'}
                  style={{ width: 36, height: 26, objectFit: 'cover', borderRadius: 4, backgroundColor: '#000', flexShrink: 0 }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    style={{ ...S.input, height: 22, fontSize: 10.5 }}
                    value={slide.caption || ''}
                    onChange={(e) => handleUpdateSlide(slide.id, { caption: e.target.value })}
                    placeholder={`Slide ${idx + 1} caption...`}
                  />
                </div>
                {config.slides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(slide.id)}
                    style={{ ...S.iconBtn, color: '#f87171' }}
                    title="Remove Slide"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <input
                style={{ ...S.input, fontSize: 10, height: 22 }}
                value={slide.url}
                onChange={(e) => handleUpdateSlide(slide.id, { url: e.target.value })}
                placeholder="Image URL..."
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddSlide}
            style={S.addBtn}
          >
            <Plus size={12} />
            <span>Add Slide</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 3. VIDEO PLAYER                                                             */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'video') {
    const config = el.videoConfig || {
      url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      videoType: 'youtube',
      autoplay: false,
      controls: true,
      muted: false,
      loop: false,
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      let inferredType = patch.videoType || config.videoType || 'youtube';
      if (patch.url) {
        if (patch.url.includes('youtube') || patch.url.includes('youtu.be')) inferredType = 'youtube';
        else if (patch.url.includes('vimeo')) inferredType = 'vimeo';
        else inferredType = 'mp4';
      }
      updateElement(el.id, {
        videoConfig: { ...config, videoType: inferredType, ...patch },
      });
    };

    const handleAspectRatio = (ratio: '16:9' | '4:3' | '1:1' | '9:16') => {
      let targetW = Math.round(el.width) || 560;
      let targetH = Math.round(el.height) || 315;
      if (ratio === '16:9') {
        targetH = Math.round((targetW * 9) / 16);
      } else if (ratio === '4:3') {
        targetH = Math.round((targetW * 3) / 4);
      } else if (ratio === '1:1') {
        targetH = targetW;
      } else if (ratio === '9:16') {
        targetW = 315;
        targetH = 560;
      }
      updateElement(el.id, { width: targetW, height: targetH });
      playSound('pop');
    };

    const VIDEO_PRESETS = [
      { label: '🌊 Nature 4K', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', type: 'youtube' as const },
      { label: '⛰️ Drone Reel', url: 'https://www.youtube.com/watch?v=ENGW7tLk6R8', type: 'youtube' as const },
      { label: '🐰 Big Buck Bunny (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'mp4' as const },
      { label: '🎬 Sintel Film (MP4)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', type: 'mp4' as const },
    ];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <PlaySquare size={14} color="#818cf8" />
            <span style={S.title}>Video Embed</span>
          </div>
          <span style={S.badge}>{config.videoType || 'youtube'}</span>
        </div>

        {/* Source Provider Tabs */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 4 }}>Video Platform</span>
          <div style={{ display: 'flex', gap: 3, backgroundColor: '#161620', padding: 2, borderRadius: 6, border: '1px solid #242432' }}>
            {[
              { type: 'youtube', label: 'YouTube' },
              { type: 'vimeo', label: 'Vimeo' },
              { type: 'mp4', label: 'MP4 File' },
            ].map((tab) => {
              const active = (config.videoType || 'youtube') === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => {
                    if (tab.type === 'youtube' && !config.url?.includes('youtu')) {
                      updateConfig({ videoType: 'youtube', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' });
                    } else if (tab.type === 'vimeo' && !config.url?.includes('vimeo')) {
                      updateConfig({ videoType: 'vimeo', url: 'https://vimeo.com/76979871' });
                    } else if (tab.type === 'mp4' && (config.url?.includes('youtu') || config.url?.includes('vimeo'))) {
                      updateConfig({ videoType: 'mp4', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' });
                    } else {
                      updateConfig({ videoType: tab.type as any });
                    }
                    playSound('pop');
                  }}
                  style={{
                    flex: 1,
                    padding: '3px 6px',
                    fontSize: 10,
                    fontWeight: active ? 600 : 400,
                    borderRadius: 4,
                    border: 'none',
                    background: active ? '#6366f1' : 'transparent',
                    color: active ? '#ffffff' : '#8e8e98',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Snap */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 4 }}>Aspect Ratio Snap</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {[
              { label: '16:9', ratio: '16:9' as const, sub: 'Cinema' },
              { label: '4:3', ratio: '4:3' as const, sub: 'Classic' },
              { label: '1:1', ratio: '1:1' as const, sub: 'Square' },
              { label: '9:16', ratio: '9:16' as const, sub: 'Reel' },
            ].map((ar) => (
              <button
                key={ar.ratio}
                type="button"
                onClick={() => handleAspectRatio(ar.ratio)}
                style={{
                  padding: '4px 2px',
                  borderRadius: 5,
                  border: '1px solid #282836',
                  background: '#181822',
                  color: '#d4d4d8',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
                title={`Snap element size to ${ar.label}`}
              >
                <span>{ar.label}</span>
                <span style={{ fontSize: 8, color: '#71717a', fontWeight: 400 }}>{ar.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video URL */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: 9.5, color: '#71717a' }}>Video URL</span>
            {config.url && (
              <a
                href={config.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 9, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none' }}
                title="Open in new window"
              >
                <span>Open</span>
                <ExternalLink size={9} />
              </a>
            )}
          </div>
          <input
            style={S.input}
            value={config.url || ''}
            onChange={(e) => updateConfig({ url: e.target.value })}
            placeholder={
              config.videoType === 'vimeo'
                ? 'https://vimeo.com/...'
                : config.videoType === 'mp4'
                ? 'https://domain.com/video.mp4'
                : 'https://www.youtube.com/watch?v=...'
            }
          />
        </div>

        {/* Poster Image URL (for MP4 / HTML5 Video) */}
        {config.videoType === 'mp4' && (
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 3 }}>Poster / Thumbnail Image</span>
            <input
              style={S.input}
              value={config.posterUrl || ''}
              onChange={(e) => updateConfig({ posterUrl: e.target.value })}
              placeholder="https://images.unsplash.com/... (optional)"
            />
          </div>
        )}

        {/* Curated Working Presets */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 4 }}>Sample Presets</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {VIDEO_PRESETS.map((vp) => (
              <button
                key={vp.label}
                type="button"
                onClick={() => {
                  updateConfig({ url: vp.url, videoType: vp.type });
                  playSound('pop');
                }}
                style={{
                  fontSize: 9.5,
                  padding: '4px 6px',
                  borderRadius: 4,
                  border: config.url === vp.url ? '1px solid #6366f1' : '1px solid #282836',
                  background: config.url === vp.url ? 'rgba(99,102,241,0.12)' : '#181822',
                  color: config.url === vp.url ? '#a5b4fc' : '#a1a1aa',
                  cursor: 'pointer',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {vp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 6, borderTop: '1px solid #1e1e28' }}>
          <Toggle
            label="Player Controls"
            checked={config.controls ?? true}
            onChange={(val) => updateConfig({ controls: val })}
          />
          <Toggle
            label="Autoplay Video"
            checked={config.autoplay ?? false}
            onChange={(val) => updateConfig({ autoplay: val, muted: val ? true : config.muted })}
          />
          <Toggle
            label="Muted Audio"
            checked={config.muted ?? false}
            onChange={(val) => updateConfig({ muted: val })}
          />
          <Toggle
            label="Loop Playback"
            checked={config.loop ?? false}
            onChange={(val) => updateConfig({ loop: val })}
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 4. STAT COUNTER                                                             */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'counter') {
    const config = el.counterConfig || {
      targetValue: 99.9,
      startValue: 0,
      prefix: '',
      suffix: '%',
      label: 'Uptime Reliability',
      duration: 2,
      decimals: 1,
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        counterConfig: { ...config, ...patch },
      });
    };

    const STAT_PRESETS = [
      { label: '99.9% Uptime', target: 99.9, suffix: '%', desc: 'Uptime Reliability' },
      { label: '50k+ Users', target: 50, suffix: 'k+', desc: 'Active Creators' },
      { label: '$2.4M Raised', prefix: '$', target: 2.4, suffix: 'M', desc: 'Seed Funding' },
      { label: '4.9★ Rating', target: 4.9, suffix: ' ★', desc: 'Customer Reviews' },
    ];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <TrendingUp size={14} color="#818cf8" />
            <span style={S.title}>Animated Stat Counter</span>
          </div>
          <span style={S.badge}>{config.prefix}{config.targetValue}{config.suffix}</span>
        </div>

        {/* Target and Start Value */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Target Number</span>
            <input
              type="number"
              style={S.input}
              value={config.targetValue}
              onChange={(e) => updateConfig({ targetValue: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Start Value</span>
            <input
              type="number"
              style={S.input}
              value={config.startValue ?? 0}
              onChange={(e) => updateConfig({ startValue: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Prefix and Suffix */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Prefix (e.g. $)</span>
            <input
              style={S.input}
              value={config.prefix || ''}
              onChange={(e) => updateConfig({ prefix: e.target.value })}
              placeholder="$"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Suffix (e.g. %, +)</span>
            <input
              style={S.input}
              value={config.suffix || ''}
              onChange={(e) => updateConfig({ suffix: e.target.value })}
              placeholder="%, k, +"
            />
          </div>
        </div>

        {/* Label */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Description Label</span>
          <input
            style={S.input}
            value={config.label || ''}
            onChange={(e) => updateConfig({ label: e.target.value })}
            placeholder="e.g. Happy Customers"
          />
        </div>

        {/* Duration */}
        <div style={S.row}>
          <span style={S.label}>Duration ({config.duration || 2}s)</span>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={config.duration || 2}
            onChange={(e) => updateConfig({ duration: Number(e.target.value) })}
            style={{ flex: 1, maxWidth: 100, accentColor: '#6366f1' }}
          />
        </div>

        {/* Quick Presets */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 4 }}>Presets</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {STAT_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  updateConfig({
                    targetValue: p.target,
                    prefix: p.prefix || '',
                    suffix: p.suffix || '',
                    label: p.desc,
                    decimals: p.target % 1 !== 0 ? 1 : 0,
                  });
                  playSound('pop');
                }}
                style={{
                  fontSize: 9.5, padding: '4px 6px', borderRadius: 4,
                  border: '1px solid #282836', background: '#161622',
                  color: '#a1a1aa', cursor: 'pointer', textAlign: 'left',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 5. PRODUCT CARD                                                             */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'product-card') {
    const config = el.productConfig || {
      title: 'Aura Studio Wireless',
      price: 199,
      compareAtPrice: 249,
      currency: '$',
      badge: 'BEST SELLER',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      buttonText: 'Add to Bag',
      variants: ['Matte Black', 'Lunar Silver', 'Cosmic Blue'],
      inStock: true,
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        productConfig: { ...config, ...patch },
      });
    };

    const PRODUCT_PRESETS = [
      { name: 'Headphones', price: 199, compare: 249, badge: 'BEST SELLER', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sneakers', price: 135, compare: 160, badge: 'HOT', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Smartwatch', price: 299, compare: 349, badge: 'NEW', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
    ];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <ShoppingBag size={14} color="#818cf8" />
            <span style={S.title}>Product Card</span>
          </div>
          <span style={S.badge}>{config.currency}{config.price}</span>
        </div>

        {/* Title */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Product Title</span>
          <input
            style={S.input}
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Product name..."
          />
        </div>

        {/* Pricing & Currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Currency</span>
            <input
              style={{ ...S.input, textAlign: 'center' }}
              value={config.currency}
              onChange={(e) => updateConfig({ currency: e.target.value })}
              placeholder="$"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Price</span>
            <input
              type="number"
              style={S.input}
              value={config.price}
              onChange={(e) => updateConfig({ price: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Original ($)</span>
            <input
              type="number"
              style={S.input}
              value={config.compareAtPrice ?? ''}
              onChange={(e) => updateConfig({ compareAtPrice: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Badge and Button Text */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Ribbon Badge</span>
            <input
              style={S.input}
              value={config.badge || ''}
              onChange={(e) => updateConfig({ badge: e.target.value })}
              placeholder="e.g. BEST SELLER"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Button Label</span>
            <input
              style={S.input}
              value={config.buttonText || 'Add to Bag'}
              onChange={(e) => updateConfig({ buttonText: e.target.value })}
              placeholder="Add to Bag"
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Image URL</span>
          <input
            style={S.input}
            value={config.imageUrl}
            onChange={(e) => updateConfig({ imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {/* Variants */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Variants (comma separated)</span>
          <input
            style={S.input}
            value={(config.variants || []).join(', ')}
            onChange={(e) => updateConfig({
              variants: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })}
            placeholder="e.g. Black, Silver, Blue"
          />
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: 4 }}>
          {PRODUCT_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                updateConfig({
                  title: p.name,
                  price: p.price,
                  compareAtPrice: p.compare,
                  badge: p.badge,
                  imageUrl: p.img,
                });
                playSound('pop');
              }}
              style={{
                fontSize: 9.5, padding: '3px 7px', borderRadius: 4,
                border: '1px solid #282836', background: '#181822',
                color: '#a1a1aa', cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 6. LOTTIE ANIMATION                                                         */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'lottie') {
    const config = el.lottieConfig || {
      url: LOTTIE_PRESETS[0].url,
      autoplay: true,
      loop: true,
      speed: 1,
      trigger: 'autoplay',
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        lottieConfig: { ...config, ...patch },
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Sparkles size={14} color="#818cf8" />
            <span style={S.title}>Lottie Animation</span>
          </div>
          <span style={S.badge}>{config.speed || 1}x</span>
        </div>

        {/* Presets Grid */}
        <div>
          <span style={{ fontSize: 10, color: '#71717a', display: 'block', marginBottom: 4 }}>Animation Presets</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {LOTTIE_PRESETS.map((lp) => {
              const active = config.url === lp.url;
              return (
                <button
                  key={lp.id}
                  type="button"
                  onClick={() => {
                    updateConfig({ url: lp.url });
                    playSound('pop');
                  }}
                  style={{
                    padding: '6px 8px', borderRadius: 6,
                    border: `1px solid ${active ? '#6366f1' : '#262634'}`,
                    background: active ? 'rgba(99,102,241,0.12)' : '#161620',
                    color: active ? '#a5b4fc' : '#a1a1aa',
                    fontSize: 10, fontWeight: 500, textAlign: 'left',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <Sparkle size={10} color={active ? '#818cf8' : '#71717a'} />
                  <span>{lp.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom URL */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Custom Lottie JSON URL</span>
          <input
            style={S.input}
            value={config.url}
            onChange={(e) => updateConfig({ url: e.target.value })}
            placeholder="https://assets.lottiefiles.com/...json"
          />
        </div>

        {/* Toggles */}
        <Toggle
          label="Loop Animation"
          checked={config.loop ?? true}
          onChange={(val) => updateConfig({ loop: val })}
        />

        <Toggle
          label="Autoplay"
          checked={config.autoplay ?? true}
          onChange={(val) => updateConfig({ autoplay: val })}
        />

        {/* Speed */}
        <div style={S.row}>
          <span style={S.label}>Speed</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => updateConfig({ speed: spd })}
                style={{
                  padding: '2px 7px', borderRadius: 4,
                  fontSize: 10, border: 'none', cursor: 'pointer',
                  background: (config.speed ?? 1) === spd ? '#6366f1' : '#22222e',
                  color: (config.speed ?? 1) === spd ? '#fff' : '#888894',
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 7. LIVE VISITOR POLL                                                        */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'poll') {
    const config = el.pollConfig || {
      question: 'What feature should we ship next? 🚀',
      themeColor: '#6366f1',
      options: [
        { id: '1', label: 'Dark Mode Themes', votes: 12 },
        { id: '2', label: 'AI Webpage Generator', votes: 28 },
        { id: '3', label: 'Mobile App Builder', votes: 9 },
      ],
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        pollConfig: { ...config, ...patch },
      });
    };

    const totalVotes = config.options.reduce((sum, o) => sum + (o.votes || 0), 0);

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <BarChart2 size={14} color="#818cf8" />
            <span style={S.title}>Interactive Poll</span>
          </div>
          <span style={S.badge}>{totalVotes} votes</span>
        </div>

        {/* Question */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Question</span>
          <input
            style={S.input}
            value={config.question}
            onChange={(e) => updateConfig({ question: e.target.value })}
            placeholder="Ask your visitors something..."
          />
        </div>

        {/* Theme Accent Color */}
        <div style={S.row}>
          <span style={S.label}>Theme Accent</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateConfig({ themeColor: c })}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: c, cursor: 'pointer', padding: 0,
                  border: config.themeColor === c ? '2px solid #fff' : '2px solid transparent',
                }}
              />
            ))}
            <input
              type="color"
              value={config.themeColor || '#6366f1'}
              onChange={(e) => updateConfig({ themeColor: e.target.value })}
              style={{ width: 22, height: 22, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#d4d4d8' }}>Options & Votes</span>
          {config.options.map((opt, idx) => (
            <div key={opt.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <input
                style={{ ...S.input, flex: 1, fontSize: 11 }}
                value={opt.label}
                onChange={(e) => {
                  const newOpts = [...config.options];
                  newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                  updateConfig({ options: newOpts });
                }}
                placeholder={`Option ${idx + 1}...`}
              />
              <span style={{ fontSize: 10, color: '#71717a', fontFamily: 'monospace', minWidth: 24, textAlign: 'right' }}>
                {opt.votes || 0}
              </span>
              {config.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => updateConfig({ options: config.options.filter((_, i) => i !== idx) })}
                  style={{ ...S.iconBtn, color: '#f87171' }}
                  title="Remove Option"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newOpt = {
                id: `opt_${Date.now()}`,
                label: `Option ${config.options.length + 1}`,
                votes: 0,
              };
              updateConfig({ options: [...config.options, newOpt] });
              playSound('pop');
            }}
            style={S.addBtn}
          >
            <Plus size={12} />
            <span>Add Option</span>
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 8. GUESTBOOK WALL                                                           */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'guestbook') {
    const config = el.guestbookConfig || {
      title: 'Community Guestbook',
      subtitle: 'Leave a note, shoutout, or feedback for the team.',
      allowSubmissions: true,
      entries: [],
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        guestbookConfig: { ...config, ...patch },
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <MessageSquare size={14} color="#818cf8" />
            <span style={S.title}>Guestbook Wall</span>
          </div>
          <span style={S.badge}>{config.entries?.length || 0} entries</span>
        </div>

        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Title</span>
          <input
            style={S.input}
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Guestbook Wall Title..."
          />
        </div>

        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Subtitle</span>
          <input
            style={S.input}
            value={config.subtitle || ''}
            onChange={(e) => updateConfig({ subtitle: e.target.value })}
            placeholder="Subtitle or prompt..."
          />
        </div>

        <Toggle
          label="Allow Public Submissions"
          checked={config.allowSubmissions ?? true}
          onChange={(val) => updateConfig({ allowSubmissions: val })}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 9. REACTION BUTTON                                                          */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'reaction') {
    const config = el.reactionConfig || {
      emoji: '🔥',
      label: 'Fire',
      count: 42,
      burstType: 'confetti',
      soundEffect: 'pop',
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        reactionConfig: { ...config, ...patch },
      });
    };

    const EMOJI_PALETTE = ['🔥', '❤️', '🚀', '👍', '👏', '🎉', '💎', '⚡', '🥑', '✨'];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Heart size={14} color="#818cf8" />
            <span style={S.title}>Reaction Counter</span>
          </div>
          <span style={S.badge}>{config.emoji} {config.count}</span>
        </div>

        {/* Emoji Quick Picker */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 4 }}>Emoji Selection</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {EMOJI_PALETTE.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => {
                  updateConfig({ emoji: em });
                  playSound('pop');
                }}
                style={{
                  fontSize: 14, width: 28, height: 28,
                  borderRadius: 6, border: 'none', cursor: 'pointer',
                  backgroundColor: config.emoji === em ? 'rgba(99,102,241,0.25)' : '#181822',
                  outline: config.emoji === em ? '1px solid #6366f1' : 'none',
                }}
              >
                {em}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9.5, color: '#71717a' }}>Custom:</span>
            <input
              style={{ ...S.input, width: 44, textAlign: 'center', fontSize: 13 }}
              value={config.emoji}
              onChange={(e) => updateConfig({ emoji: e.target.value })}
            />
          </div>
        </div>

        {/* Label and Starting Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Button Label</span>
            <input
              style={S.input}
              value={config.label}
              onChange={(e) => updateConfig({ label: e.target.value })}
              placeholder="e.g. Awesome"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Base Count</span>
            <input
              type="number"
              style={S.input}
              value={config.count}
              onChange={(e) => updateConfig({ count: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Burst Effect Selector */}
        <div style={S.row}>
          <span style={S.label}>Burst Animation</span>
          <select
            style={{ ...S.input, width: 'auto', flex: 1, height: 26 }}
            value={config.burstType || 'confetti'}
            onChange={(e) => updateConfig({ burstType: e.target.value as any })}
          >
            <option value="confetti">🎉 Confetti Burst</option>
            <option value="hearts">💖 Floating Hearts</option>
            <option value="stars">⭐ Shining Stars</option>
            <option value="emojis">😃 Floating Emojis</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 10. COUNTDOWN TIMER                                                         */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'countdown') {
    const config = el.countdownConfig || {
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      labelDays: 'Days',
      labelHours: 'Hours',
      labelMinutes: 'Mins',
      labelSeconds: 'Secs',
      expiredMessage: '🎉 Event Started!',
      showDays: true,
      showSeconds: true,
      themeColor: '#6366f1',
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        countdownConfig: { ...config, ...patch },
      });
    };

    const setOffsetDays = (days: number) => {
      const d = new Date(Date.now() + days * 86400000);
      updateConfig({ targetDate: d.toISOString() });
      playSound('pop');
    };

    const setOffsetHours = (hours: number) => {
      const d = new Date(Date.now() + hours * 3600000);
      updateConfig({ targetDate: d.toISOString() });
      playSound('pop');
    };

    const formattedDate = (() => {
      try {
        const d = new Date(config.targetDate);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
      } catch {
        return '';
      }
    })();

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Timer size={14} color="#818cf8" />
            <span style={S.title}>Countdown Timer</span>
          </div>
          <span style={S.badge}>Live Clock</span>
        </div>

        {/* Target Date Picker */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Target Date & Time</span>
          <input
            type="datetime-local"
            style={S.input}
            value={formattedDate}
            onChange={(e) => {
              if (e.target.value) {
                updateConfig({ targetDate: new Date(e.target.value).toISOString() });
              }
            }}
          />
        </div>

        {/* Quick Presets */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 3 }}>Quick Duration</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {[
              { label: '+1 Hr', fn: () => setOffsetHours(1) },
              { label: '+24 Hr', fn: () => setOffsetHours(24) },
              { label: '+7 Days', fn: () => setOffsetDays(7) },
              { label: '+30 Days', fn: () => setOffsetDays(30) },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={p.fn}
                style={{
                  padding: '4px',
                  borderRadius: 4,
                  border: '1px solid #282836',
                  background: '#181822',
                  color: '#a1a1aa',
                  fontSize: 9.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div style={S.row}>
          <span style={S.label}>Digits Color</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateConfig({ themeColor: c })}
                style={{
                  width: 18, height: 18, borderRadius: '50%',
                  backgroundColor: c, cursor: 'pointer', padding: 0,
                  border: config.themeColor === c ? '2px solid #fff' : '2px solid transparent',
                }}
              />
            ))}
            <input
              type="color"
              value={config.themeColor || '#6366f1'}
              onChange={(e) => updateConfig({ themeColor: e.target.value })}
              style={{ width: 22, height: 22, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid #1e1e28' }}>
          <Toggle
            label="Show Days Unit"
            checked={config.showDays ?? true}
            onChange={(val) => updateConfig({ showDays: val })}
          />
          <Toggle
            label="Show Seconds Unit"
            checked={config.showSeconds ?? true}
            onChange={(val) => updateConfig({ showSeconds: val })}
          />
        </div>

        {/* Expired Message */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Expired Message</span>
          <input
            style={S.input}
            value={config.expiredMessage || ''}
            onChange={(e) => updateConfig({ expiredMessage: e.target.value })}
            placeholder="Special Offer Ended 🎉"
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 11. AUDIO PLAYER                                                            */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'audio') {
    const config = el.audioConfig || {
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      title: 'Midnight Chill Lofi',
      artist: 'Craft Studio Radio',
      coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
      autoplay: false,
      loop: true,
      showWaveform: true,
      themeColor: '#818cf8',
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        audioConfig: { ...config, ...patch },
      });
    };

    const AUDIO_PRESETS = [
      {
        title: 'Midnight Chill Lofi',
        artist: 'Craft Studio Radio',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
        cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80',
      },
      {
        title: 'Coffee Shop Ambience',
        artist: 'Ambient Field Recordings',
        url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
        cover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
      },
    ];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Headphones size={14} color="#818cf8" />
            <span style={S.title}>Audio & Podcast Player</span>
          </div>
          <span style={S.badge}>HTML5</span>
        </div>

        {/* Track Title */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Track / Episode Title</span>
          <input
            style={S.input}
            value={config.title}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Track Title..."
          />
        </div>

        {/* Artist / Podcast Host */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Artist / Host</span>
          <input
            style={S.input}
            value={config.artist || ''}
            onChange={(e) => updateConfig({ artist: e.target.value })}
            placeholder="Artist or Podcast Name..."
          />
        </div>

        {/* Audio URL */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Audio File URL (MP3/OGG)</span>
          <input
            style={S.input}
            value={config.url}
            onChange={(e) => updateConfig({ url: e.target.value })}
            placeholder="https://.../audio.mp3"
          />
        </div>

        {/* Cover Art URL */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Cover Artwork URL</span>
          <input
            style={S.input}
            value={config.coverUrl || ''}
            onChange={(e) => updateConfig({ coverUrl: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {/* Sample Presets */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 3 }}>Sample Audio Tracks</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {AUDIO_PRESETS.map((ap) => (
              <button
                key={ap.title}
                type="button"
                onClick={() => {
                  updateConfig({
                    title: ap.title,
                    artist: ap.artist,
                    url: ap.url,
                    coverUrl: ap.cover,
                  });
                  playSound('pop');
                }}
                style={{
                  fontSize: 10,
                  padding: '5px 8px',
                  borderRadius: 5,
                  border: config.url === ap.url ? '1px solid #6366f1' : '1px solid #282836',
                  background: config.url === ap.url ? 'rgba(99,102,241,0.12)' : '#181822',
                  color: config.url === ap.url ? '#a5b4fc' : '#a1a1aa',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Music size={11} color="#818cf8" />
                <span style={{ fontWeight: 600 }}>{ap.title}</span>
                <span style={{ opacity: 0.6, fontSize: 9 }}>({ap.artist})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid #1e1e28' }}>
          <Toggle
            label="Loop Playback"
            checked={config.loop ?? true}
            onChange={(val) => updateConfig({ loop: val })}
          />
          <Toggle
            label="Show Audio Waveform"
            checked={config.showWaveform ?? true}
            onChange={(val) => updateConfig({ showWaveform: val })}
          />
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 12. BEFORE / AFTER IMAGE COMPARISON                                         */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'before-after') {
    const config = el.beforeAfterConfig || {
      beforeImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
      afterImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
      beforeLabel: 'Before',
      afterLabel: 'After',
      initialSliderPos: 50,
      showLabels: true,
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        beforeAfterConfig: { ...config, ...patch },
      });
    };

    const COMPARISON_PRESETS = [
      {
        name: '🌆 Night vs Day',
        before: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
        after: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
        beforeLabel: 'Night',
        afterLabel: 'Day',
      },
      {
        name: '🎨 Vintage vs Vibrant',
        before: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
        after: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        beforeLabel: 'Original',
        afterLabel: 'Graded',
      },
    ];

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <SplitSquareVertical size={14} color="#818cf8" />
            <span style={S.title}>Before / After Comparison</span>
          </div>
          <span style={S.badge}>{config.initialSliderPos ?? 50}%</span>
        </div>

        {/* Before Image */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Before Image URL</span>
          <input
            style={S.input}
            value={config.beforeImageUrl}
            onChange={(e) => updateConfig({ beforeImageUrl: e.target.value })}
            placeholder="https://... (Before)"
          />
        </div>

        {/* After Image */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>After Image URL</span>
          <input
            style={S.input}
            value={config.afterImageUrl}
            onChange={(e) => updateConfig({ afterImageUrl: e.target.value })}
            placeholder="https://... (After)"
          />
        </div>

        {/* Labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Left Badge</span>
            <input
              style={S.input}
              value={config.beforeLabel || ''}
              onChange={(e) => updateConfig({ beforeLabel: e.target.value })}
              placeholder="Before"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Right Badge</span>
            <input
              style={S.input}
              value={config.afterLabel || ''}
              onChange={(e) => updateConfig({ afterLabel: e.target.value })}
              placeholder="After"
            />
          </div>
        </div>

        {/* Initial Split */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 9.5, color: '#71717a' }}>Initial Divider Split</span>
            <span style={{ fontSize: 9.5, color: '#a5b4fc', fontFamily: 'monospace' }}>{config.initialSliderPos ?? 50}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={90}
            value={config.initialSliderPos ?? 50}
            onChange={(e) => updateConfig({ initialSliderPos: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#6366f1' }}
          />
        </div>

        {/* Presets */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 3 }}>Sample Comparisons</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {COMPARISON_PRESETS.map((cp) => (
              <button
                key={cp.name}
                type="button"
                onClick={() => {
                  updateConfig({
                    beforeImageUrl: cp.before,
                    afterImageUrl: cp.after,
                    beforeLabel: cp.beforeLabel,
                    afterLabel: cp.afterLabel,
                  });
                  playSound('pop');
                }}
                style={{
                  fontSize: 9.5,
                  padding: '4px 6px',
                  borderRadius: 4,
                  border: '1px solid #282836',
                  background: '#181822',
                  color: '#a1a1aa',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {cp.name}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          label="Show Floating Badges"
          checked={config.showLabels ?? true}
          onChange={(val) => updateConfig({ showLabels: val })}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 13. TESTIMONIAL & SOCIAL PROOF CARD                                         */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (el.type === 'testimonial') {
    const config = el.testimonialConfig || {
      quote: 'Craft Studio allowed our team to design, iterate, and publish clean client websites 10x faster.',
      author: 'Elena Rostova',
      role: 'Head of Product',
      company: 'Nexus Creative',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      rating: 5,
      verified: true,
      platform: 'trustpilot',
    };

    const updateConfig = (patch: Partial<typeof config>) => {
      updateElement(el.id, {
        testimonialConfig: { ...config, ...patch },
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span style={S.title}>Testimonial Card</span>
          </div>
          <span style={S.badge}>{config.rating || 5} Stars</span>
        </div>

        {/* Rating Stars Selector */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 3 }}>Star Rating</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  updateConfig({ rating: star });
                  playSound('pop');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <Star
                  size={16}
                  fill={(config.rating || 5) >= star ? '#f59e0b' : 'none'}
                  color={(config.rating || 5) >= star ? '#f59e0b' : '#52525b'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Review Quote</span>
          <textarea
            style={S.textarea}
            value={config.quote}
            onChange={(e) => updateConfig({ quote: e.target.value })}
            placeholder="Testimonial words..."
            rows={3}
          />
        </div>

        {/* Author & Role */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Author Name</span>
            <input
              style={S.input}
              value={config.author}
              onChange={(e) => updateConfig({ author: e.target.value })}
              placeholder="e.g. Alex Chen"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Role / Job</span>
            <input
              style={S.input}
              value={config.role || ''}
              onChange={(e) => updateConfig({ role: e.target.value })}
              placeholder="e.g. Founder"
            />
          </div>
        </div>

        {/* Company & Avatar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Company Name</span>
            <input
              style={S.input}
              value={config.company || ''}
              onChange={(e) => updateConfig({ company: e.target.value })}
              placeholder="e.g. Stripe"
            />
          </div>
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Avatar Photo URL</span>
            <input
              style={S.input}
              value={config.avatarUrl || ''}
              onChange={(e) => updateConfig({ avatarUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Platform Badge */}
        <div style={S.row}>
          <span style={S.label}>Source Badge</span>
          <select
            style={{ ...S.input, width: 'auto', flex: 1, height: 26 }}
            value={config.platform || 'trustpilot'}
            onChange={(e) => updateConfig({ platform: e.target.value as any })}
          >
            <option value="trustpilot">⭐ Trustpilot</option>
            <option value="google">🇬 Google Review</option>
            <option value="producthunt">😸 Product Hunt</option>
            <option value="twitter">𝕏 Twitter / X</option>
            <option value="none">None</option>
          </select>
        </div>

        <Toggle
          label="Verified Checkmark"
          checked={config.verified !== false}
          onChange={(val) => updateConfig({ verified: val })}
        />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────── */
  /* 10. FORM INPUT ELEMENTS                                                     */
  /* ─────────────────────────────────────────────────────────────────────────── */
  if (['input', 'textarea', 'select', 'checkbox'].includes(el.type)) {
    const formConfig = el.formConfig || {
      fieldName: el.name.toLowerCase().replace(/\s+/g, '_'),
      placeholder: el.content || '',
      required: false,
      inputType: 'text',
      options: ['Option 1', 'Option 2', 'Option 3'],
      checked: false,
    };

    const updateFormConfig = (patch: Partial<typeof formConfig>) => {
      updateElement(el.id, {
        formConfig: { ...formConfig, ...patch },
      });
    };

    return (
      <div style={S.container}>
        <div style={S.header}>
          <div style={S.headerLeft}>
            <FileText size={14} color="#818cf8" />
            <span style={S.title}>Form Field ({el.type})</span>
          </div>
          <span style={S.badge}>{formConfig.fieldName || el.type}</span>
        </div>

        {/* Field Name */}
        <div>
          <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Field Name (Key in Form Submissions)</span>
          <input
            style={S.input}
            value={formConfig.fieldName || ''}
            onChange={(e) => updateFormConfig({ fieldName: e.target.value })}
            placeholder="e.g. email, full_name, phone"
          />
        </div>

        {/* Input Type for text inputs */}
        {el.type === 'input' && (
          <div style={S.row}>
            <span style={S.label}>Input Type</span>
            <select
              style={{ ...S.input, width: 'auto', flex: 1, height: 26 }}
              value={formConfig.inputType || 'text'}
              onChange={(e) => updateFormConfig({ inputType: e.target.value as any })}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="tel">Phone (Tel)</option>
              <option value="number">Number</option>
              <option value="password">Password</option>
            </select>
          </div>
        )}

        {/* Placeholder for input & textarea */}
        {(el.type === 'input' || el.type === 'textarea') && (
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Placeholder Text</span>
            <input
              style={S.input}
              value={formConfig.placeholder ?? el.content ?? ''}
              onChange={(e) => {
                updateFormConfig({ placeholder: e.target.value });
                updateElement(el.id, { content: e.target.value });
              }}
              placeholder="e.g. alex@example.com"
            />
          </div>
        )}

        {/* Options for Select Dropdown */}
        {el.type === 'select' && (
          <div>
            <span style={{ fontSize: 9.5, color: '#71717a', display: 'block', marginBottom: 2 }}>Dropdown Options (one per line)</span>
            <textarea
              style={S.textarea}
              value={(formConfig.options || ['Option 1', 'Option 2', 'Option 3']).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                updateFormConfig({ options: lines });
              }}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </div>
        )}

        {/* Checkbox Default State */}
        {el.type === 'checkbox' && (
          <Toggle
            label="Default Checked"
            checked={formConfig.checked ?? false}
            onChange={(val) => updateFormConfig({ checked: val })}
          />
        )}

        {/* Required Field Toggle */}
        <Toggle
          label="Required Field"
          checked={formConfig.required ?? false}
          onChange={(val) => updateFormConfig({ required: val })}
        />
      </div>
    );
  }

  return null;
};
