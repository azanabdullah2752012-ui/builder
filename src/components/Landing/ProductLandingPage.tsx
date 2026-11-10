import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Moon,
  Sun,
  Layout,
  Layers,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Menu,
  X,
  Check,
  Download,
  Share2,
  BarChart3,
  Inbox,
  Search,
  Database,
  History,
  Keyboard,
  Vote,
  MessageSquare,
  ThumbsUp,
  ShoppingBag,
  ChevronDown,
  Play,
  Pause,
  Clock,
  Sliders,
  Star,
  Activity,
  Maximize2,
  ShieldCheck,
  FileCode,
  MousePointer,
} from 'lucide-react';
import { useEditor } from '../../context/useEditor';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import { GummyMascot } from '../Gummy/GummyMascot';
import { PickleTorchSvg } from '../Brand/PickleCorpLogo';
import { SECTION_TEMPLATES } from '../../constants/templates';
import './ProductLandingPage.css';

interface ProductLandingPageProps {
  onLaunchEditor: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ onLaunchEditor }) => {
  const { toggleAppTheme, addElements, updatePageSettings } = useEditor();
  const [landingTheme, setLandingTheme] = useState<'dark' | 'light'>('light');
  const isLight = landingTheme === 'light';

  // Navigation Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Wix Studio Responsive Scrubber State (in Hero Showcase)
  const [heroCanvasWidth, setHeroCanvasWidth] = useState<number>(680);
  const [heroDevice, setHeroDevice] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');

  // Figma Multiplayer Cursors State (Vitra & Dieter Rams Workshop)
  const [cursors, setCursors] = useState([
    { id: 'kaiser', name: 'Kaiser', role: 'Design', color: '#C2410C', x: 120, y: 70 },
    { id: 'thanvi', name: 'Thanvi', role: 'Systems', color: '#3F624D', x: 380, y: 190 },
    { id: 'alex', name: 'Alex', role: 'Editorial', color: '#1D4ED8', x: 260, y: 310 },
  ]);

  // Responsive Preview Section Viewport State
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');

  // Interactive Widgets In-Page Demo States
  const [pollVotes, setPollVotes] = useState({ optionA: 82, optionB: 44 });
  const [hasVoted, setHasVoted] = useState(false);
  const [guestbookEntries, setGuestbookEntries] = useState([
    { name: 'Kaiser', msg: 'Built my portfolio in 15 minutes! ✨', time: '2m ago' },
    { name: 'Thanvi', msg: 'Sub-pixel snapping is buttery smooth.', time: '1h ago' },
  ]);
  const [guestName, setGuestName] = useState('');
  const [guestMsg, setGuestMsg] = useState('');
  const [reactionsClap, setReactionsClap] = useState(48);
  const [cartCount, setCartCount] = useState(0);
  const [accordionOpen, setAccordionOpen] = useState<number | null>(0);
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [beforeAfterSliderPos, setBeforeAfterSliderPos] = useState(50);
  const [countdownSeconds, setCountdownSeconds] = useState(86400 * 3 + 3600 * 14 + 1800);

  // Template Preview Modal State (keeps user on landing page until they choose to open)
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<typeof SECTION_TEMPLATES[0] | null>(null);

  // Interactive Raycast Demo Position
  const [demoPos, setDemoPos] = useState({ x: 140, y: 110 });
  const [isDraggingDemo, setIsDraggingDemo] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    const t = setInterval(() => {
      setCountdownSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Subtle natural floating motion for Figma multiplayer cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors((prev) =>
        prev.map((c) => ({
          ...c,
          x: Math.max(40, Math.min(520, c.x + (Math.random() * 16 - 8))),
          y: Math.max(30, Math.min(330, c.y + (Math.random() * 14 - 7))),
        }))
      );
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Enable natural viewport scrolling on landing page
  useEffect(() => {
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'auto';
    document.body.style.overflow = 'auto';
    return () => {
      document.documentElement.style.overflow = origHtmlOverflow;
      document.body.style.overflow = origBodyOverflow;
    };
  }, []);

  const handleLaunch = () => {
    playSound('click');
    onLaunchEditor();
  };

  const handleMountTemplateAndLaunch = (templateId: string) => {
    playSound('click');
    const tmpl = SECTION_TEMPLATES.find((t) => t.id === templateId) || SECTION_TEMPLATES[0];
    if (tmpl) {
      const elements = tmpl.create(60);
      addElements(elements, true, true);
      updatePageSettings('page_home', {
        backgroundColor: '#F7F5F0',
      });
    }
    setSelectedTemplateForPreview(null);
    onLaunchEditor();
  };

  const handleMakeGummyFlip = () => {
    playSound('boing');
    triggerConfetti();
    const gummyEl = document.getElementById('landing_story_gummy');
    if (gummyEl) {
      gummyEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    }
  };

  // Keyboard navigation for raycast stage
  const handleRaycastKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setDemoPos((p) => ({ ...p, x: Math.max(20, p.x - step) }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setDemoPos((p) => ({ ...p, x: Math.min(320, p.x + step) }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDemoPos((p) => ({ ...p, y: Math.max(20, p.y - step) }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDemoPos((p) => ({ ...p, y: Math.min(250, p.y + step) }));
    }
  };

  const carouselItems = [
    { title: 'Sovereign Code Export', desc: 'Single-file clean HTML5 bundle with 0 KB dependencies.' },
    { title: 'Sub-Pixel Raycasting', desc: 'Orthogonal alignment vectors with <0.5ms magnetic snapping.' },
    { title: 'Local-First Persistence', desc: 'IndexedDB storage with instantaneous cloud synchronization.' },
  ];

  const formatCountdown = (secs: number) => {
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return { d, h, m, s };
  };

  const countdownData = formatCountdown(countdownSeconds);

  return (
    <div className={`mce-root ${isLight ? 'mce-light' : 'mce-dark'}`} data-theme={landingTheme}>
      {/* ── 1. STICKY NAVIGATION ─────────────────────────────────────────── */}
      <header className="mce-header">
        <div className="mce-header-inner">
          <div className="mce-brand" onClick={handleLaunch}>
            <div className="pickle-brand-glyph">
              <PickleTorchSvg size={18} />
            </div>
            <div className="mce-brand-text">
              <span className="mce-brand-title">Pickle Studio</span>
              <span className="mce-brand-badge">WARM EDITORIAL CRAFT</span>
            </div>
          </div>

          <nav className="mce-nav-links" aria-label="Main Navigation">
            <a href="#features" className="mce-nav-link">Features</a>
            <a href="#templates" className="mce-nav-link">Templates</a>
            <a href="#toolkit" className="mce-nav-link">Product</a>
            <a href="#export" className="mce-nav-link">Documentation</a>
          </nav>

          <div className="mce-nav-actions">
            <button
              className="mce-gummy-nav-pill"
              onClick={handleMakeGummyFlip}
              title="Click to activate Gummy the layout companion"
            >
              <GummyMascot size="sm" />
              <span>Gummy</span>
            </button>

            <button
              className="mce-theme-toggle"
              onClick={() => {
                setLandingTheme(isLight ? 'dark' : 'light');
                toggleAppTheme();
              }}
              title="Toggle Theme"
              aria-label="Toggle Color Theme"
            >
              {isLight ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button className="mce-btn-launch" onClick={handleLaunch}>
              <span>Launch Studio</span>
              <ArrowRight size={14} />
            </button>

            <button
              className="mce-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION (Editorial Craft & Confidence) ─────────────── */}
      <section className="mce-hero">
        <div className="mce-hero-badge">
          <span className="mce-hero-badge-dot" />
          <span>WARM EDITORIAL CRAFT • VITRA & DIETER RAMS WORKSHOP</span>
        </div>

        <h1 className="mce-hero-title">
          Design without <em>boundaries</em>.
        </h1>

        <div className="mce-hero-supporting-title">
          Design. Build. Publish. Your Way.
        </div>

        <p className="mce-hero-desc">
          A professional visual website design studio, built for creative freedom. Drag, design and
          launch stunning websites with complete control over every detail.
        </p>

        <div className="mce-hero-ctas">
          <button className="mce-btn-primary" onClick={handleLaunch}>
            <span>Launch Studio</span>
            <ArrowRight size={16} />
          </button>
          <a href="#features" className="mce-btn-secondary">
            <span>Explore Features</span>
          </a>
        </div>

        <div className="mce-hero-pillars">
          <div className="mce-pillar-item">
            <Check size={14} className="mce-pillar-icon" />
            <span>Infinite creative canvas</span>
          </div>
          <div className="mce-pillar-item">
            <Check size={14} className="mce-pillar-icon" />
            <span>Functional interactive widgets</span>
          </div>
          <div className="mce-pillar-item">
            <Check size={14} className="mce-pillar-icon" />
            <span>Independent website exports</span>
          </div>
        </div>

        {/* ── Hero Visual: Layered Editor Showcase ─────────────────────────── */}
        <div className="mce-editor-showcase">
          <div className="mce-editor-topbar">
            <div className="mce-topbar-left">
              <div className="mce-mac-dots">
                <span className="mce-mac-dot" />
                <span className="mce-mac-dot" />
                <span className="mce-mac-dot" />
              </div>
              <div className="mce-file-pill">
                <Layout size={13} />
                <span>❖ Main Component • {heroDevice.toUpperCase()} • {heroCanvasWidth}px</span>
              </div>
            </div>

            {/* Wix Studio Responsive Breakpoint Scrubber */}
            <div className="mce-wix-scrubber-bar" title="Drag to test fluid responsive reflow across device sizes">
              <Monitor size={12} style={{ color: 'var(--mce-accent-secondary)' }} />
              <input
                type="range"
                min="390"
                max="820"
                value={heroCanvasWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHeroCanvasWidth(val);
                  if (val <= 420) setHeroDevice('mobile');
                  else if (val <= 600) setHeroDevice('tablet');
                  else if (val <= 750) setHeroDevice('laptop');
                  else setHeroDevice('desktop');
                }}
                className="mce-scrub-input"
              />
              <span style={{ fontSize: '11px', fontFamily: 'var(--mce-font-mono)', color: 'var(--mce-text-primary)', minWidth: '42px' }}>
                {heroCanvasWidth}px
              </span>
            </div>

            <div className="mce-topbar-right">
              <div className="mce-zoom-chip">100% ZOOM</div>
              <div className="mce-zoom-chip">50 UNDO</div>
            </div>
          </div>

          <div className="mce-editor-workspace">
            {/* Left Elements / Widgets Dock */}
            <div className="mce-editor-left-dock">
              <span className="mce-dock-title">ELEMENTS & WIDGETS</span>
              <div className="mce-element-list">
                <div className="mce-element-item active">
                  <Layout size={13} />
                  <span>❖ Hero Artboard</span>
                </div>
                <div className="mce-element-item">
                  <Vote size={13} />
                  <span>Interactive Poll</span>
                </div>
                <div className="mce-element-item">
                  <ShoppingBag size={13} />
                  <span>Product Card</span>
                </div>
                <div className="mce-element-item">
                  <Sliders size={13} />
                  <span>Before/After Slider</span>
                </div>
                <div className="mce-element-item">
                  <Layers size={13} />
                  <span>Footer Grid</span>
                </div>
              </div>
            </div>

            {/* Center Canvas Stage with Figma Multiplayer Cursors */}
            <div className="mce-editor-center-stage">
              <div
                className="mce-canvas-artboard"
                style={{
                  maxWidth: `${heroCanvasWidth}px`,
                }}
              >
                {/* Figma Live Multiplayer Cursors */}
                {cursors.map((c) => (
                  <div
                    key={c.id}
                    className="mce-figma-cursor"
                    style={{
                      transform: `translate(${c.x}px, ${c.y}px)`,
                    }}
                  >
                    <MousePointer size={15} style={{ color: c.color, fill: c.color }} />
                    <span className="mce-cursor-label" style={{ background: c.color }}>
                      {c.name} ({c.role})
                    </span>
                  </div>
                ))}

                <div className="mce-selected-bounding-box">
                  <span className="mce-resize-handle tl" />
                  <span className="mce-resize-handle tr" />
                  <span className="mce-resize-handle bl" />
                  <span className="mce-resize-handle br" />
                  <div className="mce-smart-guide-tag">❖ X: 170px • Y: 110px [SNAP]</div>
                </div>

                <div className="mce-artboard-sample-page">
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--mce-border-subtle)', paddingBottom: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mce-text-primary)' }}>Vitra Design Chronicle</span>
                    <span style={{ fontSize: '11px', color: 'var(--mce-text-muted)' }}>Specimens • Workshop</span>
                  </div>
                  <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 400, fontFamily: 'var(--mce-font-display)', letterSpacing: '-0.02em', color: 'var(--mce-text-primary)' }}>
                      Design Without Boundaries
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--mce-text-secondary)', lineHeight: 1.5 }}>
                      Real spatial freeform positioning on an archival linen plane with zero code lock-in.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Property Inspector */}
            <div className="mce-editor-inspector">
              <span className="mce-dock-title">PROPERTY INSPECTOR</span>
              <div className="mce-inspector-grid">
                <div className="mce-prop-field">
                  <span className="mce-prop-label">X POS</span>
                  <input className="mce-prop-input" readOnly value="170px" />
                </div>
                <div className="mce-prop-field">
                  <span className="mce-prop-label">Y POS</span>
                  <input className="mce-prop-input" readOnly value="110px" />
                </div>
              </div>
              <div className="mce-inspector-grid">
                <div className="mce-prop-field">
                  <span className="mce-prop-label">WIDTH</span>
                  <input className="mce-prop-input" readOnly value={`${heroCanvasWidth}px`} />
                </div>
                <div className="mce-prop-field">
                  <span className="mce-prop-label">HEIGHT</span>
                  <input className="mce-prop-input" readOnly value="190px" />
                </div>
              </div>
              <div className="mce-prop-field">
                <span className="mce-prop-label">AUTO-LAYOUT</span>
                <input className="mce-prop-input" readOnly value="Gap: 16px • Pad: 24px" />
              </div>
              <div className="mce-prop-field">
                <span className="mce-prop-label">COMPONENT</span>
                <input className="mce-prop-input" readOnly value="❖ Master Instance" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PRODUCT CAPABILITY STRIP ─────────────────────────────────── */}
      <section className="mce-capability-strip" aria-label="Product Capabilities">
        <div className="mce-capability-inner">
          <div className="mce-cap-card">
            <span className="mce-cap-value">13</span>
            <span className="mce-cap-title">Interactive Widgets</span>
          </div>
          <div className="mce-cap-card">
            <span className="mce-cap-value">50-Step</span>
            <span className="mce-cap-title">Undo History</span>
          </div>
          <div className="mce-cap-card">
            <span className="mce-cap-value">1-Click</span>
            <span className="mce-cap-title">Cloud Publishing</span>
          </div>
          <div className="mce-cap-card">
            <span className="mce-cap-value">Real-Time</span>
            <span className="mce-cap-title">Analytics</span>
          </div>
          <div className="mce-cap-card">
            <span className="mce-cap-value">Zero-Dep</span>
            <span className="mce-cap-title">Export</span>
          </div>
          <div className="mce-cap-card">
            <span className="mce-cap-value">Local-First</span>
            <span className="mce-cap-title">Storage</span>
          </div>
        </div>
      </section>

      {/* ── 4. CANVAS ENGINE SHOWCASE ────────────────────────────────────── */}
      <section id="engine" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">CANVAS ENGINE SHOWCASE</span>
          <h2 className="mce-section-headline">Precision at every pixel.</h2>
          <p className="mce-section-desc">
            Freeform 2D layout without rigid template cages. Drag elements anywhere with
            sub-millisecond magnetic alignment guides and four-way distance measurements.
          </p>
        </div>

        <div className="mce-engine-split">
          <div className="mce-engine-info">
            <div className="mce-engine-features-list">
              <div className="mce-engine-feature-item">
                <div className="mce-feature-badge-icon"><Check size={14} /></div>
                <div>
                  <div className="mce-engine-feature-title">Freeform 2D Positioning & Snapping</div>
                  <div className="mce-engine-feature-desc">
                    Absolute coordinate placement backed by Euclidean vector calculations for instant magnetic snapping.
                  </div>
                </div>
              </div>
              <div className="mce-engine-feature-item">
                <div className="mce-feature-badge-icon"><Check size={14} /></div>
                <div>
                  <div className="mce-engine-feature-title">Four-Way Caliper Distance Measurements</div>
                  <div className="mce-engine-feature-desc">
                    Real-time distance indicators measuring offsets to adjacent elements and artboard boundaries.
                  </div>
                </div>
              </div>
              <div className="mce-engine-feature-item">
                <div className="mce-feature-badge-icon"><Check size={14} /></div>
                <div>
                  <div className="mce-engine-feature-title">Infinite Canvas Navigation, Pan & Zoom</div>
                  <div className="mce-engine-feature-desc">
                    Fluid spacebar panning, wheel zooming from 25% to 300%, and multi-layer z-index management.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button className="mce-btn-primary" onClick={handleLaunch}>
                <span>Launch Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Raycast Stage */}
          <div
            className="mce-raycast-stage"
            tabIndex={0}
            role="region"
            aria-label="Interactive spatial raycast canvas: use arrow keys or drag to test magnetic alignment guides"
            onKeyDown={handleRaycastKeyDown}
            onMouseDown={() => setIsDraggingDemo(true)}
            onMouseUp={() => setIsDraggingDemo(false)}
            onMouseLeave={() => setIsDraggingDemo(false)}
            onMouseMove={(e) => {
              if (!isDraggingDemo) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(20, Math.min(rect.width - 170, e.clientX - rect.left - 75));
              const y = Math.max(20, Math.min(rect.height - 110, e.clientY - rect.top - 45));
              setDemoPos({ x, y });
            }}
          >
            <div className="mce-raycast-hud">
              <span className="mce-hud-tag active">X: {Math.round(demoPos.x)}px</span>
              <span className="mce-hud-tag active">Y: {Math.round(demoPos.y)}px</span>
              <span className="mce-hud-tag">Snap: 8px Grid</span>
              <span className="mce-hud-tag">Keyboard: Arrow Keys</span>
            </div>

            <div className="mce-guide-x" style={{ top: `${demoPos.y + 45}px` }} />
            <div className="mce-guide-y" style={{ left: `${demoPos.x + 75}px` }} />

            <div
              className="mce-draggable-element"
              style={{ transform: `translate(${demoPos.x}px, ${demoPos.y}px)` }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mce-text-primary)' }}>
                ❖ Raycast Component
              </span>
              <span style={{ fontFamily: 'var(--mce-font-mono)', fontSize: '9.5px', color: 'var(--mce-accent-secondary)' }}>
                {Math.round(demoPos.x)}, {Math.round(demoPos.y)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ALL 13 INTERACTIVE WIDGETS GALLERY (Canva & Figma Inspo) ─── */}
      <section id="features" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">INTERACTIVE WIDGETS</span>
          <h2 className="mce-section-headline">Bring your websites to life.</h2>
          <p className="mce-section-desc">
            All 13 interactive widgets are deeply integrated into the canvas engine.
            Experience every single widget running live below.
          </p>
        </div>

        <div className="mce-widgets-gallery-grid">
          {/* 1. Polls */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Vote size={16} /></div>
              <span className="mce-widget-tag">ENGAGEMENT</span>
            </div>
            <div>
              <h3 className="mce-widget-title">1. Live Poll</h3>
              <p className="mce-widget-desc">Real-time voting counters with automated percentage recalculation.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Visual canvas or raw code?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  className="mce-btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'space-between' }}
                  onClick={() => {
                    if (!hasVoted) {
                      setPollVotes((v) => ({ ...v, optionA: v.optionA + 1 }));
                      setHasVoted(true);
                      playSound('pop');
                    }
                  }}
                >
                  <span>Spatial Visual</span>
                  <span>{pollVotes.optionA}</span>
                </button>
                <button
                  className="mce-btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '11px', justifyContent: 'space-between' }}
                  onClick={() => {
                    if (!hasVoted) {
                      setPollVotes((v) => ({ ...v, optionB: v.optionB + 1 }));
                      setHasVoted(true);
                      playSound('pop');
                    }
                  }}
                >
                  <span>Raw Code</span>
                  <span>{pollVotes.optionB}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Guestbook */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><MessageSquare size={16} /></div>
              <span className="mce-widget-tag">COMMUNITY</span>
            </div>
            <div>
              <h3 className="mce-widget-title">2. Guestbook</h3>
              <p className="mce-widget-desc">Visitor log with signatures, gravatars, and XSS sanitization.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '70px', overflowY: 'auto', marginBottom: '8px' }}>
                {guestbookEntries.map((e, idx) => (
                  <div key={idx} style={{ fontSize: '11px', background: 'var(--mce-surface)', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--mce-border)' }}>
                    <strong>{e.name}:</strong> {e.msg}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  style={{ width: '65px', padding: '5px 8px', fontSize: '10px', background: 'var(--mce-surface)', border: '1px solid var(--mce-border)', borderRadius: '4px', color: 'var(--mce-text-primary)' }}
                  placeholder="Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <input
                  style={{ flex: 1, padding: '5px 8px', fontSize: '10px', background: 'var(--mce-surface)', border: '1px solid var(--mce-border)', borderRadius: '4px', color: 'var(--mce-text-primary)' }}
                  placeholder="Sign guestbook..."
                  value={guestMsg}
                  onChange={(e) => setGuestMsg(e.target.value)}
                />
                <button
                  className="mce-btn-primary"
                  style={{ padding: '4px 8px', fontSize: '10px' }}
                  onClick={() => {
                    if (guestMsg.trim()) {
                      setGuestbookEntries((prev) => [{ name: guestName.trim() || 'You', msg: guestMsg.trim(), time: 'Just now' }, ...prev]);
                      setGuestMsg('');
                      setGuestName('');
                      playSound('pop');
                    }
                  }}
                >
                  Sign
                </button>
              </div>
            </div>
          </div>

          {/* 3. Reactions */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><ThumbsUp size={16} /></div>
              <span className="mce-widget-tag">INTERACTION</span>
            </div>
            <div>
              <h3 className="mce-widget-title">3. Reactions</h3>
              <p className="mce-widget-desc">Clap & emoji feedback counters with micro-interactions.</p>
            </div>
            <div className="mce-widget-preview-box" style={{ alignItems: 'center' }}>
              <button
                className="mce-btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => {
                  setReactionsClap((c) => c + 1);
                  playSound('pop');
                }}
              >
                <ThumbsUp size={14} />
                <span>Clap ({reactionsClap})</span>
              </button>
            </div>
          </div>

          {/* 4. Product Card & Cart */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><ShoppingBag size={16} /></div>
              <span className="mce-widget-tag">COMMERCE</span>
            </div>
            <div>
              <h3 className="mce-widget-title">4. Product Cards & Cart</h3>
              <p className="mce-widget-desc">Embedded store item with price tag and slide-over cart drawer.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--mce-text-primary)' }}>Craft Studio Pass</div>
                  <div style={{ fontSize: '11px', color: 'var(--mce-accent-primary)' }}>$29.00 • Lifetime License</div>
                </div>
                <button
                  className="mce-btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  onClick={() => {
                    setCartCount((c) => c + 1);
                    playSound('chime');
                  }}
                >
                  Add ({cartCount})
                </button>
              </div>
            </div>
          </div>

          {/* 5. Accordion */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><ChevronDown size={16} /></div>
              <span className="mce-widget-tag">LAYOUT</span>
            </div>
            <div>
              <h3 className="mce-widget-title">5. Accordions</h3>
              <p className="mce-widget-desc">Collapsible FAQ disclosure cards with animated height transitions.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { q: 'Can I export clean code?', a: 'Yes, 100% self-contained semantic HTML & CSS.' },
                  { q: 'Is hosting included?', a: 'Optional 1-click cloud publishing via Supabase.' },
                ].map((item, i) => (
                  <div key={i} style={{ border: '1px solid var(--mce-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'var(--mce-surface)', display: 'flex', justifyContent: 'space-between' }}
                      onClick={() => setAccordionOpen(accordionOpen === i ? null : i)}
                    >
                      <span>{item.q}</span>
                      <ChevronDown size={12} style={{ transform: accordionOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {accordionOpen === i && (
                      <div style={{ padding: '6px 8px', fontSize: '10.5px', color: 'var(--mce-text-secondary)', background: 'var(--mce-surface-inset)' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Carousel */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Layers size={16} /></div>
              <span className="mce-widget-tag">MEDIA</span>
            </div>
            <div>
              <h3 className="mce-widget-title">6. Carousels</h3>
              <p className="mce-widget-desc">Multi-slide carousel with pagination dots and inertia sliding.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mce-accent-secondary)' }}>
                {carouselItems[carouselSlide].title}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--mce-text-secondary)', margin: '4px 0 8px' }}>
                {carouselItems[carouselSlide].desc}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
                  onClick={() => setCarouselSlide((s) => (s > 0 ? s - 1 : carouselItems.length - 1))}
                >
                  ← Prev
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {carouselItems.map((_, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: carouselSlide === idx ? 'var(--mce-accent-primary)' : 'var(--mce-border)',
                      }}
                    />
                  ))}
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--mce-text-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  onClick={() => setCarouselSlide((s) => (s < carouselItems.length - 1 ? s + 1 : 0))}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* 7. Audio Players */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Play size={16} /></div>
              <span className="mce-widget-tag">AUDIO</span>
            </div>
            <div>
              <h3 className="mce-widget-title">7. Audio Players</h3>
              <p className="mce-widget-desc">Waveform audio player with play/pause and progress scrub.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="mce-btn-primary"
                  style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center', borderRadius: '50%' }}
                  onClick={() => {
                    setIsPlayingAudio(!isPlayingAudio);
                    playSound('click');
                  }}
                >
                  {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mce-text-primary)' }}>Rams Studio Acoustic.mp3</div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--mce-border)', borderRadius: '2px', marginTop: '4px', position: 'relative' }}>
                    <div style={{ width: isPlayingAudio ? '65%' : '20%', height: '100%', background: 'var(--mce-accent-primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 8. Video Players */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Maximize2 size={16} /></div>
              <span className="mce-widget-tag">VIDEO</span>
            </div>
            <div>
              <h3 className="mce-widget-title">8. Video Players</h3>
              <p className="mce-widget-desc">High-DPI responsive video player supporting loop and autoplay.</p>
            </div>
            <div className="mce-widget-preview-box" style={{ background: 'var(--mce-surface-inset)', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-primary)', fontSize: '12px', fontWeight: 600 }}>
                <Play size={16} />
                <span>Vitra Workshop Precision Demo (1080p 60fps)</span>
              </div>
            </div>
          </div>

          {/* 9. Animated Counters */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Activity size={16} /></div>
              <span className="mce-widget-tag">METRICS</span>
            </div>
            <div>
              <h3 className="mce-widget-title">9. Animated Counters</h3>
              <p className="mce-widget-desc">Viewport-triggered count-up animations with smooth curves.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--mce-accent-primary)' }}>10,000+</div>
                  <div style={{ fontSize: '10px', color: 'var(--mce-text-muted)' }}>Created Sites</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--mce-highlight)' }}>99.98%</div>
                  <div style={{ fontSize: '10px', color: 'var(--mce-text-muted)' }}>Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* 10. Countdown Timers */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Clock size={16} /></div>
              <span className="mce-widget-tag">TIMER</span>
            </div>
            <div>
              <h3 className="mce-widget-title">10. Countdown Timers</h3>
              <p className="mce-widget-desc">Live days/hours/minutes/seconds ticker for product drops.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {[
                  { l: 'D', v: countdownData.d },
                  { l: 'H', v: countdownData.h },
                  { l: 'M', v: countdownData.m },
                  { l: 'S', v: countdownData.s },
                ].map((b, i) => (
                  <div key={i} style={{ background: 'var(--mce-surface)', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--mce-font-mono)' }}>{b.v}</div>
                    <div style={{ fontSize: '9px', color: 'var(--mce-text-muted)' }}>{b.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 11. Before/After Sliders */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Sliders size={16} /></div>
              <span className="mce-widget-tag">UTILITY</span>
            </div>
            <div>
              <h3 className="mce-widget-title">11. Before/After Sliders</h3>
              <p className="mce-widget-desc">Interactive dual-layer split comparison with drag divider.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ position: 'relative', height: '60px', background: 'var(--mce-surface-inset)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--mce-border)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '12px', fontSize: '11px', color: 'var(--mce-text-muted)', fontWeight: 500 }}>
                  Wireframe Caliper
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${beforeAfterSliderPos}%`,
                    background: 'var(--mce-surface)',
                    borderRight: '2px solid var(--mce-accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--mce-accent-primary)',
                    overflow: 'hidden',
                  }}
                >
                  Craft Specimen
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={beforeAfterSliderPos}
                onChange={(e) => setBeforeAfterSliderPos(Number(e.target.value))}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
          </div>

          {/* 12. Reviews */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Star size={16} /></div>
              <span className="mce-widget-tag">SOCIAL PROOF</span>
            </div>
            <div>
              <h3 className="mce-widget-title">12. Reviews</h3>
              <p className="mce-widget-desc">Verified customer testimonials with 5-star badges.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ display: 'flex', gap: '2px', color: '#F59E0B', marginBottom: '4px' }}>
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--mce-text-secondary)' }}>
                "Exported clean HTML in 10 seconds. Best visual builder ever."
              </div>
              <div style={{ fontSize: '10px', color: 'var(--mce-text-muted)', marginTop: '4px' }}>
                — Alex R., Frontend Engineer
              </div>
            </div>
          </div>

          {/* 13. Reading Progress */}
          <div className="mce-widget-card">
            <div className="mce-widget-header">
              <div className="mce-widget-icon-pill"><Sparkles size={16} /></div>
              <span className="mce-widget-tag">NAVIGATION</span>
            </div>
            <div>
              <h3 className="mce-widget-title">13. Reading Progress</h3>
              <p className="mce-widget-desc">Scroll-linked progress tracker for long-form documentation.</p>
            </div>
            <div className="mce-widget-preview-box">
              <div style={{ fontSize: '11px', color: 'var(--mce-text-secondary)', marginBottom: '6px' }}>
                Scroll Position Telemetry
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--mce-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', background: 'linear-gradient(90deg, #9365FF, #6D8DFF)' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--mce-accent-secondary)', marginTop: '4px', textAlign: 'right' }}>
                74% Read
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. PROFESSIONAL TOOLKIT ─────────────────────────────────────── */}
      <section id="toolkit" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">PROFESSIONAL TOOLKIT</span>
          <h2 className="mce-section-headline">Everything you need. One workspace.</h2>
          <p className="mce-section-desc">
            A comprehensive suite of pro-grade tools engineered into a single unified creative workspace.
          </p>
        </div>

        <div className="mce-toolkit-asymmetric-grid">
          {/* 1. Export Suite */}
          <div className="mce-toolkit-card featured">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Download size={18} />
              <span className="mce-toolkit-title">Export Suite</span>
            </div>
            <p className="mce-toolkit-desc">
              Generate standalone single-file HTML bundles or multi-file ZIP archives. Zero runtime dependencies,
              clean vanilla JavaScript, and pure CSS keyframe animations.
            </p>
            <div style={{ background: 'var(--mce-surface-inset)', padding: '10px', borderRadius: '6px', fontFamily: 'var(--mce-font-mono)', fontSize: '11px', color: 'var(--mce-accent-secondary)' }}>
              $ pickle export --bundle=clean-html5 --minify=false
            </div>
          </div>

          {/* 2. Cloud Publishing */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Share2 size={18} />
              <span className="mce-toolkit-title">Cloud Publishing</span>
            </div>
            <p className="mce-toolkit-desc">
              Deploy instantaneously with custom slugs, global CDN edge caching, and live QR code previews.
            </p>
          </div>

          {/* 3. Analytics */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <BarChart3 size={18} />
              <span className="mce-toolkit-title">Real-Time Analytics</span>
            </div>
            <p className="mce-toolkit-desc">
              Monitor page views, unique visitors, referral sources, and device breakdowns with complete privacy.
            </p>
          </div>

          {/* 4. Form Leads Inbox */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Inbox size={18} />
              <span className="mce-toolkit-title">Form Leads Inbox</span>
            </div>
            <p className="mce-toolkit-desc">
              Collect user inquiries and contact form submissions into a local spreadsheet with CSV export.
            </p>
          </div>

          {/* 5. SEO Audit */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Search size={18} />
              <span className="mce-toolkit-title">SEO Health Audit</span>
            </div>
            <p className="mce-toolkit-desc">
              Automated scoring engine checking heading hierarchy, meta tags, OpenGraph previews, and image alt attributes.
            </p>
          </div>

          {/* 6. Database Explorer */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Database size={18} />
              <span className="mce-toolkit-title">Database Explorer</span>
            </div>
            <p className="mce-toolkit-desc">
              Local-first IndexedDB project storage viewer with one-click snapshot backups and restoration.
            </p>
          </div>

          {/* 7. Template Library */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Layout size={18} />
              <span className="mce-toolkit-title">Template Library</span>
            </div>
            <p className="mce-toolkit-desc">
              Curated library of 10 production-tested section templates ready to inject directly onto your artboard.
            </p>
          </div>

          {/* 8. Version History */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <History size={18} />
              <span className="mce-toolkit-title">Version History</span>
            </div>
            <p className="mce-toolkit-desc">
              50-step undo/redo time-machine stack preserving every coordinate, color, and layer change.
            </p>
          </div>

          {/* 9. Keyboard Shortcuts */}
          <div className="mce-toolkit-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mce-accent-secondary)' }}>
              <Keyboard size={18} />
              <span className="mce-toolkit-title">Keyboard Shortcuts</span>
            </div>
            <p className="mce-toolkit-desc">
              Power accelerators: Space to pan, Z for undo, Shift for 10px nudges, and Cmd+K for command palette.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. RESPONSIVE PREVIEW ────────────────────────────────────────── */}
      <section id="preview" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">RESPONSIVE PREVIEW</span>
          <h2 className="mce-section-headline">Every screen. Every detail.</h2>
          <p className="mce-section-desc">
            Test and preview your creations across desktop, laptop, tablet, and mobile device viewports
            with real-time reflow and zero layout shifts.
          </p>
        </div>

        <div className="mce-preview-wrapper">
          <div className="mce-preview-top-toolbar">
            <div className="mce-preview-tablist" role="tablist" aria-label="Device Viewports">
              {(
                [
                  { id: 'desktop', label: 'Desktop 1440px', icon: <Monitor size={14} /> },
                  { id: 'laptop', label: 'Laptop 1024px', icon: <Laptop size={14} /> },
                  { id: 'tablet', label: 'Tablet 768px', icon: <Tablet size={14} /> },
                  { id: 'mobile', label: 'Mobile 390px', icon: <Smartphone size={14} /> },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  className={`mce-preview-tab ${previewViewport === tab.id ? 'active' : ''}`}
                  onClick={() => setPreviewViewport(tab.id)}
                  role="tab"
                  aria-selected={previewViewport === tab.id}
                  aria-controls="preview-simulator-stage"
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <span style={{ fontSize: '11px', color: 'var(--mce-accent-secondary)', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', fontFeatureSettings: "'tnum', 'zero'" }}>
              VIEWPORT: {previewViewport.toUpperCase()}
            </span>
          </div>

          <div id="preview-simulator-stage" className="mce-preview-viewport-center">
            <div
              className="mce-device-simulator-frame"
              style={{
                width:
                  previewViewport === 'mobile'
                    ? '390px'
                    : previewViewport === 'tablet'
                    ? '768px'
                    : previewViewport === 'laptop'
                    ? '1024px'
                    : '100%',
                maxWidth: '1140px',
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid var(--mce-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px' }}>Cosmic Portfolio Demo</span>
                <span style={{ fontSize: '11px', color: 'var(--mce-accent-secondary)' }}>Responsive Preview Mode</span>
              </div>
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <h4 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
                  Fluid Spatial Reflow
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--mce-text-secondary)', maxWidth: '520px', margin: '0 auto 24px' }}>
                  Elements automatically reflow and scale across all device breakpoints while maintaining precision.
                </p>
                <button className="mce-btn-launch" onClick={handleLaunch}>
                  Inspect in Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. TEMPLATE GALLERY (Canva Visual Richness) ─────────────────── */}
      <section id="templates" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">TEMPLATE GALLERY</span>
          <h2 className="mce-section-headline">Start with an idea. Finish with a website.</h2>
          <p className="mce-section-desc">
            Explore 10 production-tested section templates. Click any card to inspect its layout structure.
          </p>
        </div>

        <div className="mce-template-grid">
          {SECTION_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="mce-template-card"
              onClick={() => setSelectedTemplateForPreview(tmpl)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedTemplateForPreview(tmpl);
              }}
            >
              {/* Warm Archival Specimen Sheet Preview Artboard */}
              <div className="mce-template-artboard-preview">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '6px', background: 'var(--mce-accent-primary)', borderRadius: '2px' }} />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '12px', height: '4px', background: 'var(--mce-border-strong)', borderRadius: '1px' }} />
                    <div style={{ width: '12px', height: '4px', background: 'var(--mce-border-strong)', borderRadius: '1px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ width: '70%', height: '10px', background: 'var(--mce-text-primary)', borderRadius: '2px' }} />
                  <div style={{ width: '45%', height: '6px', background: 'var(--mce-border-strong)', borderRadius: '2px' }} />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '45px', height: '14px', background: 'var(--mce-accent-primary)', borderRadius: '2px' }} />
                  <div style={{ width: '45px', height: '14px', background: 'var(--mce-surface)', border: '1px solid var(--mce-border)', borderRadius: '2px' }} />
                </div>
              </div>

              <div className="mce-template-card-body">
                <span className="mce-template-badge">{tmpl.category}</span>
                <span className="mce-template-heading">{tmpl.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--mce-accent-primary)', marginTop: '4px', fontWeight: 600 }}>
                  Inspect Template Preview →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Template Detail Modal (stays on landing page with explicit Studio action) */}
        {selectedTemplateForPreview && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(28, 25, 23, 0.65)',
              backdropFilter: 'blur(12px)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setSelectedTemplateForPreview(null)}
          >
            <div
              style={{
                background: 'var(--mce-surface)',
                border: '1px solid var(--mce-border-strong)',
                borderRadius: 'var(--mce-radius-lg)',
                maxWidth: '540px',
                width: '100%',
                padding: '32px',
                boxShadow: 'var(--mce-shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="mce-template-badge">{selectedTemplateForPreview.category}</span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--mce-text-primary)', cursor: 'pointer' }}
                  onClick={() => setSelectedTemplateForPreview(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                {selectedTemplateForPreview.name}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--mce-text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                Ready to inject directly into your canvas with pre-configured responsive layouts, typography hierarchy, and interactive elements.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="mce-btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleMountTemplateAndLaunch(selectedTemplateForPreview.id)}
                >
                  <span>Mount & Open in Studio</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  className="mce-btn-secondary"
                  onClick={() => setSelectedTemplateForPreview(null)}
                >
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 9. OWNERSHIP AND EXPORT ──────────────────────────────────────── */}
      <section id="export" className="mce-section">
        <div className="mce-section-header">
          <span className="mce-section-eyebrow">OWNERSHIP AND EXPORT</span>
          <h2 className="mce-section-headline">Your work. Your code. Your control.</h2>
          <p className="mce-section-desc">
            Complete creative independence. Export production-grade HTML, CSS, and JavaScript.
          </p>
        </div>

        <div className="mce-ownership-grid">
          <div className="mce-ownership-col">
            <Download size={24} style={{ color: 'var(--mce-accent-secondary)' }} />
            <h3 className="mce-ownership-title">Standalone HTML Export</h3>
            <p className="mce-ownership-desc">
              Generate single-file self-contained HTML pages with embedded styles and widget logic. Host on any server.
            </p>
          </div>

          <div className="mce-ownership-col">
            <FileCode size={24} style={{ color: 'var(--mce-highlight)' }} />
            <h3 className="mce-ownership-title">Multi-File ZIP Export</h3>
            <p className="mce-ownership-desc">
              Download clean modular codebases with separated index.html, styles.css, and vanilla script bundles.
            </p>
          </div>

          <div className="mce-ownership-col">
            <ShieldCheck size={24} style={{ color: 'var(--mce-accent-primary)' }} />
            <h3 className="mce-ownership-title">Local-First Storage</h3>
            <p className="mce-ownership-desc">
              Your projects exist on your computer in browser storage. Zero mandatory accounts, zero subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. LIVING GUMMY PHYSICS COMPANION ───────────────────────────── */}
      <section className="mce-section" style={{ paddingTop: '20px' }}>
        <div className="mce-gummy-story-bay">
          <div className="mce-gummy-copy">
            <span className="mce-section-eyebrow">LIVING COMPANION</span>
            <h3 style={{ fontSize: '26px', fontWeight: 800 }}>Meet Gummy, the layout companion.</h3>
            <p style={{ fontSize: '14.5px', color: 'var(--mce-text-secondary)', lineHeight: 1.6 }}>
              Gummy lives on your canvas, reacting to your pointer movements and cheering when you snap
              elements into place. Double-click Gummy to trigger a 360° somersault!
            </p>
            <div>
              <button className="mce-btn-secondary" onClick={handleMakeGummyFlip}>
                <span>Make Gummy Somersault</span>
              </button>
            </div>
          </div>

          <div className="mce-gummy-stage" id="landing_story_gummy">
            <GummyMascot size="lg" showSpeech={true} enableConfetti={true} />
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CALL TO ACTION ─────────────────────────────────────── */}
      <section className="mce-final-cta-section">
        <h2 className="mce-final-title">Your next creation starts here.</h2>
        <p className="mce-final-desc">
          Everything you need to turn an idea into a fully functional website.
        </p>
        <button className="mce-btn-primary" style={{ padding: '16px 38px', fontSize: '16px' }} onClick={handleLaunch}>
          <span>Launch Pickle Studio</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* ── 12. COLOPHON FOOTER ──────────────────────────────────────────── */}
      <footer className="mce-footer">
        <div className="mce-footer-inner">
          <div className="mce-footer-grid">
            <div className="mce-footer-col">
              <div className="mce-brand" onClick={handleLaunch}>
                <div className="pickle-brand-glyph">
                  <PickleTorchSvg size={16} />
                </div>
                <span className="mce-brand-title">Pickle Studio</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--mce-text-muted)', maxWidth: '280px', marginTop: '8px' }}>
                A professional visual website design studio built for creative freedom.
              </p>
            </div>

            <div className="mce-footer-col">
              <span className="mce-footer-col-title">PRODUCT</span>
              <ul className="mce-footer-links">
                <li><a href="#engine" className="mce-footer-link">Features</a></li>
                <li><a href="#features" className="mce-footer-link">Widgets</a></li>
                <li><a href="#toolkit" className="mce-footer-link">Toolkit</a></li>
                <li><a href="#preview" className="mce-footer-link">Responsive Preview</a></li>
              </ul>
            </div>

            <div className="mce-footer-col">
              <span className="mce-footer-col-title">TEMPLATES</span>
              <ul className="mce-footer-links">
                <li><a href="#templates" className="mce-footer-link">SaaS Hero</a></li>
                <li><a href="#templates" className="mce-footer-link">Pricing Table</a></li>
                <li><a href="#templates" className="mce-footer-link">Client Testimonials Grid</a></li>
                <li><a href="#templates" className="mce-footer-link">Modern Footer</a></li>
              </ul>
            </div>

            <div className="mce-footer-col">
              <span className="mce-footer-col-title">DOCUMENTATION & LEGAL</span>
              <ul className="mce-footer-links">
                <li><a href="#export" className="mce-footer-link">Code Export</a></li>
                <li><a href="#export" className="mce-footer-link">Privacy & Local Storage</a></li>
                <li><a href="#" className="mce-footer-link" onClick={handleLaunch}>Launch Studio</a></li>
              </ul>
            </div>
          </div>

          <div className="mce-footer-bottom">
            <span>© 2026 Pickle Corp™. All rights reserved.</span>
            <span>Warm Editorial Craft • Version 2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default ProductLandingPage;
