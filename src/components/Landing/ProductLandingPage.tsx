import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Database,
  Layers,
  Lock,
  ArrowRight,
  Check,
  X,
  Mail,
  User,
  Key,
  Layout,
  MousePointerClick,
  ChevronDown,
  ChevronUp,
  Cpu,
  Terminal,
  Code2,
  FileCode,
  Zap,
  Eye,
  Copy,
  ExternalLink,
  ShieldCheck,
  Play,
  QrCode,
  CheckCircle2,
  Activity,
  ShoppingBag,
  CreditCard,
  Sliders,
  Gauge,
  Plus,
  Minus,
  Globe,
} from 'lucide-react';
import { databaseService } from '../../services/databaseService';
import { useEditor } from '../../context/useEditor';
import './ProductLandingPage.css';

interface ProductLandingPageProps {
  onLaunchEditor: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ onLaunchEditor }) => {
  const { currentUser, setCurrentUser, logout, showToast } = useEditor();

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Workbench Interactive States
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [workbenchViewMode, setWorkbenchViewMode] = useState<'canvas' | 'code'>('canvas');
  const [activeInspectorElement, setActiveInspectorElement] = useState<'hero' | 'button' | 'card' | 'badge' | 'fintech' | 'storefront'>('button');
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Studio Playground Customizer States
  const [workbenchTemplate, setWorkbenchTemplate] = useState<'saas' | 'fintech' | 'storefront'>('saas');
  const [accentColor, setAccentColor] = useState<string>('#10b981');
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [stateVariant, setStateVariant] = useState<'default' | 'hover' | 'active'>('default');

  // Interactive Elements within Templates
  const [fintechRevealed, setFintechRevealed] = useState<boolean>(true);
  const [storefrontQty, setStorefrontQty] = useState<number>(1);
  const [storefrontCartCount, setStorefrontCartCount] = useState<number>(0);

  // Engine Showcase Pod States
  const [motionAnimation, setMotionAnimation] = useState<'spring' | 'stagger' | 'tilt' | 'fade'>('spring');
  const [motionKey, setMotionKey] = useState<number>(0);
  const [snapPreset, setSnapPreset] = useState<'left' | 'center' | 'right' | 'gap'>('center');
  const [publishStep, setPublishStep] = useState<'idle' | 'building' | 'deployed'>('idle');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Open modal in specific mode
  const openModal = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // 1-Click Instant Demo Login (Pickle Corp)
  const handleQuickDemoAccess = () => {
    const demoUser = {
      name: 'Azan Abdullah',
      email: 'azanmail2022@gmail.com',
      plan: 'Pickle Corp Unlocked ($0.00)',
      role: 'owner',
    };
    setCurrentUser(demoUser);
    showToast('Welcome Azan Abdullah! Entering Pickle Studio...', 'success');
    setIsAuthModalOpen(false);
    onLaunchEditor();
  };

  // Google OAuth via Supabase
  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      showToast('Connecting to Google OAuth via Supabase...', 'info');
      const res = await databaseService.signInWithGoogle();
      if (!res.success) {
        showToast(res.error || 'Failed to initialize Google Sign In', 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'Google sign-in error', 'warning');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Submit Handler for Sign Up & Sign In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    if (!authPassword || (authMode === 'signup' && authPassword.length < 6)) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'signup') {
        const cleanName =
          authName.trim() ||
          authEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()) ||
          'Azan Abdullah';
        const res = await databaseService.signup({
          name: cleanName,
          email: authEmail.trim(),
          password: authPassword,
          plan: 'Pickle Corp Unlocked ($0.00)',
        });

        if (res.success) {
          setAuthSuccess(true);
          const authedUser = {
            name: cleanName,
            email: authEmail.trim(),
            plan: 'Pickle Corp Unlocked ($0.00)',
            role: 'owner',
          };
          setCurrentUser(authedUser);
          showToast('Account created! Entering Pickle Studio...', 'success');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthSuccess(false);
            setAuthName('');
            setAuthEmail('');
            setAuthPassword('');
            onLaunchEditor();
          }, 600);
        } else {
          showToast(res.message || 'Registration failed', 'warning');
        }
      } else {
        const res = await databaseService.signin({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (res.success) {
          setAuthSuccess(true);
          const authedUser = {
            name: res.user?.name || authEmail.split('@')[0],
            email: authEmail.trim(),
            plan: res.user?.plan || 'Pickle Corp Unlocked ($0.00)',
          };
          setCurrentUser(authedUser);
          showToast(`Welcome back, ${authedUser.name}! Entering Pickle Studio...`, 'success');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthSuccess(false);
            setAuthName('');
            setAuthEmail('');
            setAuthPassword('');
            onLaunchEditor();
          }, 600);
        } else {
          showToast(res.message || 'Login failed', 'warning');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDynamicWorkbenchCode = () => {
    if (workbenchTemplate === 'fintech') {
      return `<!-- Standalone Fintech Card Compiled by Pickle Studio -->
<article class="fintech-card" style="border-radius: ${borderRadius}px; border-color: ${accentColor}44;">
  <div class="card-chip"></div>
  <div class="card-balance">${fintechRevealed ? '$48,290.40 USD' : '••••••••••••'}</div>
  <div class="card-number">•••• •••• •••• 9284</div>
  <div class="card-footer">
    <span>CARDHOLDER: AZAN ABDULLAH</span>
    <span class="card-brand">VISA INFINITE</span>
  </div>
</article>

<style>
.fintech-card {
  background: linear-gradient(135deg, rgba(22, 28, 45, 0.95), rgba(12, 16, 26, 0.98));
  border: 1px solid ${accentColor}55;
  box-shadow: 0 20px 40px -15px ${accentColor}33;
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}
.fintech-card:hover {
  transform: translateY(-4px);
  border-color: ${accentColor};
}
</style>`;
    }
    if (workbenchTemplate === 'storefront') {
      return `<!-- Standalone E-Commerce Storefront Card Compiled by Pickle Studio -->
<article class="product-card" style="border-radius: ${borderRadius}px;">
  <div class="product-badge" style="background: ${accentColor};">LIMITED RELEASE</div>
  <h3 class="product-title">Hyper-Frequency Mechanical Keyboard</h3>
  <div class="product-price">$249.00</div>
  <button class="add-to-cart-btn" style="background: ${accentColor}; border-radius: ${borderRadius}px;">
    Add to Cart • Qty ${storefrontQty}
  </button>
</article>

<style>
.add-to-cart-btn {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.add-to-cart-btn:hover {
  filter: brightness(1.15);
  transform: translateY(-2px);
}
.add-to-cart-btn:active {
  transform: translateY(1px) scale(0.98);
}
</style>`;
    }
    return `<!-- Standalone SaaS Kinetic Architecture Compiled by Pickle Studio -->
<section class="kinetic-hero" id="hero-banner">
  <div class="hero-badge" style="color: ${accentColor}; border-color: ${accentColor}40;">
    ● KINETIC ARCHITECTURE v4.2
  </div>
  <h1 class="hero-title">Spatial Intelligence & Autonomous Web Systems</h1>
  <p class="hero-desc">Engineered for sub-millisecond edge latency and pure semantic markup.</p>
  <button class="cta-primary" role="button" style="background: ${accentColor}; border-radius: ${borderRadius}px;">
    Launch Visual Studio ($0.00 Free) →
  </button>
</section>

<style>
.cta-primary {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px ${accentColor}66;
}
.cta-primary:active {
  transform: translateY(1px) scale(0.98);
}
</style>`;
  };

  const copyWorkbenchCode = () => {
    const codeSnippet = getDynamicWorkbenchCode();
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    showToast('Pruned semantic HTML copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const faqItems = [
    {
      q: 'How does Pickle Studio differ from Webflow, Framer, or generic builders?',
      a: 'Generic builders compile visual layouts into heavily nested <div> soup with proprietary JavaScript runtimes and strict vendor lock-in. Pickle Studio operates as a visual compiler: every canvas element maps directly to authentic semantic HTML (<button>, <nav>, <section>, <form>), strict element locking (Cmd+L), and direct Supabase database bindings without vendor lock-in or subscription paywalls.',
    },
    {
      q: 'How does the automatic responsive reflow engine work?',
      a: 'The engine evaluates element geometry across Desktop (1200px), Laptop (1024px), Tablet (768px), and Phone (390px). Multi-column section layouts automatically adapt into ergonomic vertical stacks, typography scales proportionally, and relative parent-child coordinates are preserved.',
    },
    {
      q: 'Can I export clean standalone code and self-host anywhere?',
      a: 'Yes. With one click, export 100% production-ready, standalone HTML and CSS. There are zero framework runtimes or external script dependencies. For developers, Pickle Studio also generates a complete Next.js 15 & React Tailwind ZIP package.',
    },
    {
      q: 'How does the Supabase & SQLite persistence work?',
      a: 'Pickle Studio connects natively to Supabase Auth and PostgreSQL. User sign-ups, session auth, and custom form submissions automatically synchronize with cloud public.profiles and public.submissions tables, backed by client-side SQLite storage.',
    },
    {
      q: 'Is Pickle Studio really 100% free with all features?',
      a: 'Yes. In the spirit of Pickle Corp ("Cash declined. Zero fiat. $0.00 invoices"), all visual studio tools, layout templates, responsive controls, motion animations, cloud connections, and code exports are unlocked for every creator.',
    },
    {
      q: 'Who created Pickle Studio?',
      a: 'Pickle Studio is engineered by Kaiser & Thanvi — two 14-year-old builders who run Pickle Corp™, an independent freelance studio paid strictly in favors. We built Pickle Studio because we needed a visual builder that writes clean, production-grade code without corporate bloat or monthly retainers.',
    },
  ];

  return (
    <div className="craft-landing-root">
      {/* Ambient Lighting Backdrops */}
      <div className="craft-ambient-glow-top" />
      <div className="craft-ambient-glow-center" />
      <div className="craft-ambient-grid" />

      {/* ==================================================================== */}
      {/* 1. STICKY TOP NAVIGATION BAR                                         */}
      {/* ==================================================================== */}
      <header className="craft-navbar">
        <div className="craft-container">
          <div className="craft-nav-inner">
            {/* Brand Logo & Tag */}
            <div
              className="craft-logo-group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="craft-logo-icon">
                <span className="craft-logo-pickle-glyph">🥒</span>
                <span className="craft-logo-dot" />
              </div>
              <div className="craft-logo-text">
                <div className="craft-logo-title-row">
                  <span className="craft-logo-title">PICKLE STUDIO</span>
                  <span className="craft-studio-tag">BY PICKLE CORP™</span>
                </div>
                <span className="craft-logo-subtitle">Visual Web Architecture</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="craft-nav-links-wrap">
              <ul className="craft-nav-links">
                <li><a href="#workbench" className="craft-nav-link">Studio Canvas</a></li>
                <li><a href="#engine-showcase" className="craft-nav-link">Engine Showcase</a></li>
                <li><a href="#features" className="craft-nav-link">Semantic Engine</a></li>
                <li><a href="#specs" className="craft-nav-link">Specifications</a></li>
                <li><a href="#makers" className="craft-nav-link">The Makers</a></li>
                <li><a href="#faq" className="craft-nav-link">Documentation</a></li>
              </ul>
            </nav>

            {/* Nav Actions */}
            <div className="craft-nav-actions">
              {currentUser ? (
                <>
                  <div className="craft-user-badge">
                    <div className="craft-user-avatar">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'P'}
                    </div>
                    <span className="craft-user-name">{currentUser.name}</span>
                  </div>
                  <button onClick={onLaunchEditor} className="craft-btn-nav-primary">
                    <Layout size={14} />
                    <span>Enter Studio</span>
                  </button>
                  <button onClick={logout} className="craft-btn-ghost craft-btn-signout">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openModal('signin')} className="craft-btn-ghost">
                    <User size={13} />
                    <span>Sign In</span>
                  </button>
                  <button onClick={onLaunchEditor} className="craft-btn-nav-primary">
                    <Sparkles size={13} />
                    <span>Launch Studio</span>
                    <ArrowRight size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. PRODUCT HERO SECTION                                              */}
      {/* ==================================================================== */}
      <section className="craft-hero">
        <div className="craft-container">
          <div className="craft-hero-editorial">
            {/* Architectural Eyebrow Badge */}
            <div className="craft-hero-eyebrow">
              <span className="craft-eyebrow-pulse" />
              <span className="craft-eyebrow-text">
                PICKLE STUDIO // NO AI • NO CODE • NO SLOP • $0.00 UNLOCKED
              </span>
            </div>

            {/* Product Headline */}
            <h1 className="craft-hero-title">
              No AI. No Code.
              <span className="craft-hero-title-accent">No Slop.</span>
            </h1>

            {/* Product Subtitle */}
            <p className="craft-hero-subtitle">
              The visual web design and 1-click publishing platform for people who refuse generic AI sludge. Design with authentic human taste, snap with sub-pixel precision, and publish live to the edge without writing a single line of code. <strong>Completely unlocked — $0.00 invoices.</strong>
            </p>

            {/* Action CTAs */}
            <div className="craft-hero-actions">
              <button
                onClick={onLaunchEditor}
                className="craft-btn-hero-primary"
                title="Launch Pickle Studio visual editor"
              >
                <div className="craft-btn-glow" />
                <span className="craft-btn-icon-wrap"><Zap size={16} /></span>
                <span>Enter Studio Editor ($0.00)</span>
                <span className="craft-btn-shortcut">⌘↵</span>
              </button>

              <button
                onClick={handleQuickDemoAccess}
                className="craft-btn-hero-secondary"
                title="Instant access as owner Azan Abdullah"
              >
                <Sparkles size={15} className="text-amber" />
                <span>1-Click Instant Demo</span>
              </button>

              <a href="#features" className="craft-btn-hero-tertiary">
                <span>View Anti-Slop Specs</span>
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Spec Dock Bar */}
            <div className="craft-spec-dock">
              <div className="craft-spec-pill">
                <span className="craft-spec-dot green" />
                <span>Zero AI Slop</span>
              </div>
              <div className="craft-spec-pill">
                <span className="craft-spec-dot emerald" />
                <span>100% No-Code Canvas</span>
              </div>
              <div className="craft-spec-pill">
                <span className="craft-spec-dot amber" />
                <span>1-Click Edge Publish</span>
              </div>
              <div className="craft-spec-pill">
                <span className="craft-spec-dot cyan" />
                <span>Pure Semantic HTML5</span>
              </div>
              <div className="craft-spec-pill">
                <span className="craft-spec-dot mint" />
                <span>Zero Invoices ($0.00)</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. SIGNATURE FOCAL OBJECT: STUDIO WORKBENCH INSTRUMENT           */}
          {/* ================================================================ */}
          <div className="craft-workbench-wrapper" id="workbench">
            {/* Precision Instrument Chassis Header */}
            <div className="craft-workbench-chassis">
              {/* Left Mac Window Chrome & Title */}
              <div className="craft-chassis-left">
                <div className="craft-window-dots">
                  <span className="craft-dot red" />
                  <span className="craft-dot yellow" />
                  <span className="craft-dot green" />
                </div>
                <div className="craft-chassis-title-badge">
                  <span className="craft-chassis-pulse" />
                  <span className="craft-chassis-title">PICKLE WORKBENCH</span>
                  <span className="craft-chassis-divider">/</span>
                  <span className="craft-chassis-doc">studio-canvas.artboard</span>
                </div>
              </div>

              {/* Viewport Switcher Controls */}
              <div className="craft-viewport-switcher">
                <button
                  onClick={() => setActiveDeviceTab('desktop')}
                  className={`craft-vp-btn ${activeDeviceTab === 'desktop' ? 'active' : ''}`}
                >
                  <Monitor size={13} />
                  <span>Desktop (1200px)</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('tablet')}
                  className={`craft-vp-btn ${activeDeviceTab === 'tablet' ? 'active' : ''}`}
                >
                  <Tablet size={13} />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('mobile')}
                  className={`craft-vp-btn ${activeDeviceTab === 'mobile' ? 'active' : ''}`}
                >
                  <Smartphone size={13} />
                  <span>Mobile (390px)</span>
                </button>
              </div>

              {/* View Mode Switcher (Canvas vs Pruned Code) */}
              <div className="craft-chassis-right">
                <div className="craft-mode-toggle">
                  <button
                    onClick={() => setWorkbenchViewMode('canvas')}
                    className={`craft-mode-btn ${workbenchViewMode === 'canvas' ? 'active' : ''}`}
                  >
                    <Eye size={12} />
                    <span>Visual</span>
                  </button>
                  <button
                    onClick={() => setWorkbenchViewMode('code')}
                    className={`craft-mode-btn ${workbenchViewMode === 'code' ? 'active' : ''}`}
                  >
                    <Code2 size={12} />
                    <span>HTML/CSS</span>
                  </button>
                </div>
                <span className="craft-chassis-status">
                  <span className="craft-status-ping" />
                  LIVE COMPILER
                </span>
              </div>
            </div>

            {/* Interactive Live Playground Bar & Live Styler */}
            <div className="craft-playground-bar">
              <div className="craft-playground-left">
                <span className="craft-playground-label">Interactive Preset:</span>
                <button
                  type="button"
                  onClick={() => {
                    setWorkbenchTemplate('saas');
                    setActiveInspectorElement('button');
                  }}
                  className={`craft-preset-btn ${workbenchTemplate === 'saas' ? 'active' : ''}`}
                >
                  <Sparkles size={12} />
                  <span>✦ SaaS Velocity</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkbenchTemplate('fintech');
                    setActiveInspectorElement('fintech');
                  }}
                  className={`craft-preset-btn ${workbenchTemplate === 'fintech' ? 'active' : ''}`}
                >
                  <CreditCard size={12} />
                  <span>💳 Fintech Glass</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkbenchTemplate('storefront');
                    setActiveInspectorElement('storefront');
                  }}
                  className={`craft-preset-btn ${workbenchTemplate === 'storefront' ? 'active' : ''}`}
                >
                  <ShoppingBag size={12} />
                  <span>🛍️ Storefront Mini</span>
                </button>
              </div>

              <div className="craft-playground-right">
                {/* Accent Swatches */}
                <div className="craft-tweak-group">
                  <span className="craft-playground-label">Accent:</span>
                  {[
                    { hex: '#10b981', label: 'Mint' },
                    { hex: '#06b6d4', label: 'Cyan' },
                    { hex: '#f59e0b', label: 'Amber' },
                    { hex: '#8b5cf6', label: 'Violet' },
                    { hex: '#f43f5e', label: 'Rose' },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setAccentColor(c.hex)}
                      className={`craft-swatch ${accentColor === c.hex ? 'active' : ''}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>

                {/* Border Radius */}
                <div className="craft-tweak-group">
                  <span className="craft-playground-label">Radius:</span>
                  {[4, 8, 16, 999].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setBorderRadius(r)}
                      className={`craft-radius-pill ${borderRadius === r ? 'active' : ''}`}
                    >
                      {r === 999 ? 'Pill' : `${r}px`}
                    </button>
                  ))}
                </div>

                {/* State Variant */}
                <div className="craft-tweak-group">
                  <span className="craft-playground-label">State:</span>
                  {(['default', 'hover', 'active'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setStateVariant(v)}
                      className={`craft-variant-badge ${stateVariant === v ? 'active' : ''}`}
                    >
                      :{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workbench Body */}
            <div className="craft-workbench-body">
              {/* Left Toolbox & DOM Tree */}
              <div className="craft-workbench-sidebar-left">
                <div className="craft-sidebar-heading">DOM Architecture</div>
                <div className="craft-tree-group">
                  <div
                    className={`craft-sidebar-item ${activeInspectorElement === 'hero' ? 'active' : ''}`}
                    onClick={() => setActiveInspectorElement('hero')}
                  >
                    <Layout size={13} className="text-emerald" />
                    <span>&lt;section.hero&gt;</span>
                    <span className="craft-item-badge">root</span>
                  </div>
                  <div
                    className={`craft-sidebar-item indent-1 ${activeInspectorElement === 'badge' ? 'active' : ''}`}
                    onClick={() => setActiveInspectorElement('badge')}
                  >
                    <Sparkles size={12} className="text-amber" />
                    <span>&lt;span.kicker&gt;</span>
                  </div>
                  <div
                    className={`craft-sidebar-item indent-1 ${activeInspectorElement === 'button' ? 'active' : ''}`}
                    onClick={() => setActiveInspectorElement('button')}
                  >
                    <MousePointerClick size={12} className="text-emerald" />
                    <span>&lt;button.cta-primary&gt;</span>
                    <span className="craft-tag-locked">Cmd+L</span>
                  </div>
                  <div
                    className={`craft-sidebar-item indent-1 ${activeInspectorElement === 'card' ? 'active' : ''}`}
                    onClick={() => setActiveInspectorElement('card')}
                  >
                    <Layers size={12} className="text-cyan" />
                    <span>&lt;article.bento-card&gt;</span>
                  </div>
                  <div className="craft-sidebar-item indent-1">
                    <Database size={12} className="text-emerald" />
                    <span>&lt;form.supabase-sync&gt;</span>
                  </div>
                </div>

                <div className="craft-workbench-lock-status">
                  <Lock size={12} />
                  <span>Strict Cmd+L Lock Active</span>
                </div>
              </div>

              {/* Center Live Artboard Canvas / Code Mode */}
              <div className="craft-workbench-artboard-stage">
                {workbenchViewMode === 'canvas' ? (
                  <div className={`craft-artboard-container ${activeDeviceTab}`}>
                    {/* Simulated High-Craft Website Header */}
                    <div className="craft-artboard-nav">
                      <div className="craft-artboard-brand">
                        <span className="craft-brand-glyph">✦</span>
                        <span>{workbenchTemplate === 'fintech' ? 'NOVA INFINITE' : workbenchTemplate === 'storefront' ? 'CYBER CRAFT' : 'VELOCITY LABS'}</span>
                        <span className="craft-artboard-pill">v4.2</span>
                      </div>
                      <div className="craft-artboard-menu">
                        <span className="active">Architecture</span>
                        <span>Telemetry</span>
                        <span>Neural Edge</span>
                      </div>
                    </div>

                    {/* Template 1: SaaS Velocity Hero */}
                    {workbenchTemplate === 'saas' && (
                      <div
                        className={`craft-artboard-hero ${activeInspectorElement === 'hero' ? 'artboard-highlighted' : ''}`}
                        onClick={() => setActiveInspectorElement('hero')}
                      >
                        <div
                          className={`craft-artboard-kicker-wrap ${activeInspectorElement === 'badge' ? 'artboard-highlighted' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveInspectorElement('badge');
                          }}
                        >
                          <span className="craft-artboard-kicker" style={{ color: accentColor }}>
                            ⚡ AUTONOMOUS SPATIAL WEB ENGINE
                          </span>
                        </div>

                        <h2 className="craft-artboard-title">
                          Spatial Intelligence & High-Velocity Web Architecture
                        </h2>
                        <p className="craft-artboard-text">
                          Engineered for sub-millisecond edge latency, automatic 4-breakpoint reflow, and pure semantic HTML tags. Zero framework runtime debt.
                        </p>

                        {/* Interactive Clickable CTA Button with Live Styling */}
                        <div
                          className={`craft-interactive-element ${activeInspectorElement === 'button' ? 'highlighted' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveInspectorElement('button');
                          }}
                        >
                          <span className="craft-element-tag">&lt;button.cta-primary role="button"&gt;</span>
                          <button
                            className="craft-artboard-cta"
                            onClick={() => onLaunchEditor()}
                            style={{
                              background: accentColor,
                              borderRadius: `${borderRadius}px`,
                              color: '#04120a',
                              transform:
                                stateVariant === 'hover'
                                  ? 'translateY(-2px)'
                                  : stateVariant === 'active'
                                  ? 'translateY(1px) scale(0.98)'
                                  : 'none',
                              boxShadow:
                                stateVariant === 'hover'
                                  ? `0 10px 25px -5px ${accentColor}66`
                                  : 'none',
                            }}
                          >
                            <span>Launch Visual Studio ($0.00)</span>
                            <ArrowRight size={13} />
                          </button>
                          {/* Live Resize Handles */}
                          <div className="craft-handle handle-tl" />
                          <div className="craft-handle handle-tr" />
                          <div className="craft-handle handle-bl" />
                          <div className="craft-handle handle-br" />
                        </div>
                      </div>
                    )}

                    {/* Template 2: Fintech Glassmorphic Card */}
                    {workbenchTemplate === 'fintech' && (
                      <div className="craft-fintech-card" style={{ borderRadius: `${borderRadius}px`, borderColor: `${accentColor}44` }}>
                        <div className="craft-fintech-header">
                          <div className="craft-fintech-chip" />
                          <span className="craft-fintech-brand">NOVA PLATINUM</span>
                        </div>
                        <div className="craft-fintech-balance-row">
                          <div className="craft-fintech-balance-label">
                            <span>TOTAL AVAILABLE BALANCE</span>
                            <button
                              type="button"
                              onClick={() => setFintechRevealed(!fintechRevealed)}
                              className="text-zinc-400 hover:text-white transition-colors text-[10px] underline"
                            >
                              {fintechRevealed ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <div className="craft-fintech-balance" style={{ color: accentColor }}>
                            {fintechRevealed ? '$48,290.40 USD' : '••••••••••••'}
                          </div>
                        </div>
                        <div className="craft-fintech-num">•••• •••• •••• 9284</div>
                        <div className="craft-fintech-footer">
                          <span>CARDHOLDER: AZAN ABDULLAH</span>
                          <span className="text-zinc-400">EXP 08/29</span>
                        </div>
                      </div>
                    )}

                    {/* Template 3: Storefront Mini Card */}
                    {workbenchTemplate === 'storefront' && (
                      <div className="craft-storefront-wrapper" style={{ borderRadius: `${borderRadius}px` }}>
                        <div className="craft-storefront-badge" style={{ background: accentColor, borderRadius: `${borderRadius > 8 ? 6 : 3}px` }}>
                          <span>LIMITED DROP • BATCH 04</span>
                        </div>
                        <h3 className="craft-storefront-title">Hyper-Frequency Mechanical Keyboard</h3>
                        <p className="craft-storefront-desc">
                          Hot-swappable magnetic Hall-effect switches with rapid trigger and custom CNC anodized aluminum chassis.
                        </p>
                        <div className="craft-storefront-price-row">
                          <span className="craft-storefront-price" style={{ color: accentColor }}>$249.00 USD</span>
                          <div className="craft-storefront-counter">
                            <button type="button" onClick={() => setStorefrontQty((q) => Math.max(1, q - 1))}>
                              <Minus size={11} />
                            </button>
                            <span>{storefrontQty}</span>
                            <button type="button" onClick={() => setStorefrontQty((q) => q + 1)}>
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStorefrontCartCount((c) => c + storefrontQty);
                            showToast(`Added ${storefrontQty} item(s) to Cart! Total in cart: ${storefrontCartCount + storefrontQty}`, 'success');
                          }}
                          className="craft-storefront-cta"
                          style={{
                            background: accentColor,
                            borderRadius: `${borderRadius}px`,
                            transform: stateVariant === 'active' ? 'translateY(1px) scale(0.98)' : 'none',
                          }}
                        >
                          <ShoppingBag size={14} />
                          <span>Add to Cart ({storefrontQty})</span>
                        </button>
                      </div>
                    )}

                    {/* Responsive Bento Grid Cards */}
                    <div className="craft-artboard-grid">
                      <div
                        className={`craft-grid-item ${activeInspectorElement === 'card' ? 'highlighted' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveInspectorElement('card');
                        }}
                      >
                        <div className="craft-grid-item-header">
                          <Cpu size={14} className="text-emerald" />
                          <span>Distributed Edge Relays</span>
                          <span className="craft-grid-metric">99.998%</span>
                        </div>
                        <p>Zero-cold-start packet routing over high-concurrency mesh networks.</p>
                      </div>

                      <div className="craft-grid-item">
                        <div className="craft-grid-item-header">
                          <Database size={14} className="text-emerald" />
                          <span>Supabase PostgreSQL</span>
                          <span className="craft-grid-metric">0.8ms</span>
                        </div>
                        <p>Direct relational schema binding with client-side SQLite offline sync.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="craft-code-view-container">
                    <div className="craft-code-view-header">
                      <div className="craft-code-lang">
                        <FileCode size={14} className="text-emerald" />
                        <span>output.html — 100% Standalone Semantic Markup</span>
                      </div>
                      <button onClick={copyWorkbenchCode} className="craft-copy-btn">
                        {copiedCode ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="craft-code-block">
                      <code>{getDynamicWorkbenchCode()}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Right Live Property Inspector */}
              <div className="craft-workbench-sidebar-right">
                <div className="craft-sidebar-heading">Computed Inspector</div>
                <div className="craft-inspector-block">
                  <div className="craft-inspector-label">Active DOM Selector</div>
                  <div className="craft-inspector-code">
                    {workbenchTemplate === 'fintech'
                      ? '<article.fintech-card>'
                      : workbenchTemplate === 'storefront'
                      ? '<article.product-card>'
                      : activeInspectorElement === 'button'
                      ? '<button.cta-primary>'
                      : activeInspectorElement === 'hero'
                      ? '<section.hero-banner>'
                      : '<span.kicker>'}
                  </div>
                </div>

                <div className="craft-inspector-grid">
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">display</span>
                    <span className="craft-prop-value">inline-flex</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">accentColor</span>
                    <span className="craft-prop-value" style={{ color: accentColor }}>
                      {accentColor}
                    </span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">borderRadius</span>
                    <span className="craft-prop-value">{borderRadius}px</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">stateVariant</span>
                    <span className="craft-prop-value text-amber">:{stateVariant}</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">lockState</span>
                    <span className="craft-prop-value text-emerald">Cmd+L Locked</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">persistence</span>
                    <span className="craft-prop-value">Supabase + SQLite</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">runtimeWeight</span>
                    <span className="craft-prop-value text-cyan">0.00 KB</span>
                  </div>
                </div>

                <button
                  onClick={onLaunchEditor}
                  className="craft-btn-inspect-launch"
                >
                  <Terminal size={13} />
                  <span>Open Full Studio Inspector</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3.5. INTERACTIVE FEATURE ENGINE SHOWCASE (PLAYGROUND PODS)            */}
      {/* ==================================================================== */}
      <section className="craft-section craft-showcase-section" id="engine-showcase">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ENGINE SHOWCASE</span>
            <h2 className="craft-section-title">Play with the Core Studio Engines</h2>
            <p className="craft-section-desc">
              Interact directly with the real algorithms powering Pickle Studio: spring-mass motion physics, magnetic snapping geometry, one-click publishing, and automated SEO auditing.
            </p>
          </div>

          <div className="craft-showcase-grid">
            {/* Pod 1: Motion & Spring Physics */}
            <div className="craft-showcase-pod">
              <div className="craft-pod-badge">
                <Activity size={12} />
                <span>Motion Physics Engine</span>
              </div>
              <h3 className="craft-pod-title">Hardware Spring & Easing Physics</h3>
              <p className="craft-pod-desc">
                Real-time cubic-bezier and spring overshoot curves compiled to native CSS keyframes without bloated JS runtime animators.
              </p>
              <div className="craft-pod-stage">
                <div
                  key={motionKey}
                  className={`craft-physics-box anim-${motionAnimation}`}
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, #06b6d4)`,
                    boxShadow: `0 12px 32px -6px ${accentColor}66`,
                  }}
                >
                  <span>{motionAnimation.toUpperCase()}</span>
                </div>
              </div>
              <div className="craft-pod-controls">
                {(['spring', 'stagger', 'tilt', 'fade'] as const).map((anim) => (
                  <button
                    key={anim}
                    type="button"
                    onClick={() => {
                      setMotionAnimation(anim);
                      setMotionKey((k) => k + 1);
                    }}
                    className={`craft-pod-btn ${motionAnimation === anim ? 'active' : ''}`}
                  >
                    <Play size={11} />
                    <span>{anim === 'spring' ? 'Spring Pop' : anim === 'stagger' ? 'Stagger' : anim === 'tilt' ? '3D Tilt' : 'Fade Up'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pod 2: Figma-Style Smart Snapping & Alt Distance HUD */}
            <div className="craft-showcase-pod">
              <div className="craft-pod-badge">
                <Sliders size={12} />
                <span>Smart Snapping & Guides</span>
              </div>
              <h3 className="craft-pod-title">Magnetic Guides & Alt-Key HUD</h3>
              <p className="craft-pod-desc">
                Sub-pixel geometry detection across sibling bounding boxes with millimeter distance callouts and magnetic snap threshold.
              </p>
              <div className="craft-pod-stage">
                <div className="craft-snapping-field">
                  <div className="craft-snap-fixed">
                    <span>Base El</span>
                  </div>
                  {/* Dynamic Laser Guides */}
                  {snapPreset === 'center' && (
                    <div className="craft-laser-guide-v" style={{ left: '165px' }} />
                  )}
                  {snapPreset === 'left' && (
                    <div className="craft-laser-guide-v" style={{ left: '30px' }} />
                  )}
                  {snapPreset === 'gap' && (
                    <div className="craft-laser-guide-h" style={{ top: '70px' }} />
                  )}
                  {/* Snapping Target Box */}
                  <div
                    className="craft-snap-target"
                    style={{
                      left: snapPreset === 'left' ? '30px' : snapPreset === 'center' ? '130px' : snapPreset === 'right' ? '220px' : '150px',
                      top: '45px',
                      borderColor: accentColor,
                      color: accentColor,
                    }}
                  >
                    <span>Moving El</span>
                  </div>
                  {/* Distance Measurement Badge */}
                  <div
                    className="craft-distance-badge"
                    style={{
                      left: snapPreset === 'left' ? '45px' : snapPreset === 'center' ? '102px' : '110px',
                      top: '20px',
                    }}
                  >
                    {snapPreset === 'left' ? '0px (Edge)' : snapPreset === 'center' ? 'Center Snap' : snapPreset === 'gap' ? '48px Equal' : '120px'}
                  </div>
                </div>
              </div>
              <div className="craft-pod-controls">
                {(['left', 'center', 'right', 'gap'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSnapPreset(p)}
                    className={`craft-pod-btn ${snapPreset === p ? 'active' : ''}`}
                  >
                    <span>{p === 'left' ? 'Snap Left' : p === 'center' ? 'Center' : p === 'right' ? 'Snap Right' : '48px Gap'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pod 3: 1-Click Publishing & Vector QR */}
            <div className="craft-showcase-pod">
              <div className="craft-pod-badge">
                <Globe size={12} />
                <span>One-Click Publishing</span>
              </div>
              <h3 className="craft-pod-title">Instant Live URL & Vector QR</h3>
              <p className="craft-pod-desc">
                Compiles your project into edge-distributed static assets and generates deterministic vector SVG QR codes with instant live sharing.
              </p>
              <div className="craft-pod-stage">
                <div className="craft-pub-box">
                  <div className="craft-qr-frame">
                    <svg width="68" height="68" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="2" fill="#ffffff" />
                      <rect x="2" y="2" width="8" height="8" rx="1" fill="#0c0d14" />
                      <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
                      <rect x="14" y="2" width="8" height="8" rx="1" fill="#0c0d14" />
                      <rect x="16" y="4" width="4" height="4" fill="#ffffff" />
                      <rect x="2" y="14" width="8" height="8" rx="1" fill="#0c0d14" />
                      <rect x="4" y="16" width="4" height="4" fill="#ffffff" />
                      <rect x="14" y="14" width="3" height="3" fill="#0c0d14" />
                      <rect x="19" y="14" width="3" height="3" fill="#0c0d14" />
                      <rect x="14" y="19" width="8" height="3" fill="#0c0d14" />
                    </svg>
                  </div>
                  <div className="craft-pub-link-pill">
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>craftstudio.dev/?p=velocity-live</span>
                  </div>
                </div>
              </div>
              <div className="craft-pod-controls">
                <button
                  type="button"
                  onClick={() => {
                    setPublishStep('building');
                    showToast('Deploying site to global edge CDN...', 'info');
                    setTimeout(() => {
                      setPublishStep('deployed');
                      showToast('Site is live! URL copied to clipboard.', 'success');
                      navigator.clipboard.writeText('https://azanabdullah2752012-ui.github.io/builder/?p=velocity-live');
                    }, 800);
                  }}
                  className="craft-pod-btn active"
                >
                  <QrCode size={12} />
                  <span>{publishStep === 'building' ? 'Compiling CDN...' : 'Simulate 1-Click Publish'}</span>
                </button>
              </div>
            </div>

            {/* Pod 4: Real-Time SEO & Lighthouse Command Gauge */}
            <div className="craft-showcase-pod">
              <div className="craft-pod-badge">
                <Gauge size={12} />
                <span>SEO Command Center</span>
              </div>
              <h3 className="craft-pod-title">100/100 Lighthouse & Meta Audit</h3>
              <p className="craft-pod-desc">
                Continuous real-time auditing of semantic landmarks, OpenGraph social cards, ARIA roles, and zero-JS runtime compliance.
              </p>
              <div className="craft-pod-stage">
                <div className="craft-gauge-wrapper">
                  <div className="craft-score-circle" style={{ borderColor: accentColor }}>
                    <span className="craft-score-number">100</span>
                    <span className="craft-score-label" style={{ color: accentColor }}>GRADE A+</span>
                  </div>
                  <div className="craft-seo-checklist">
                    <div className="craft-seo-checklist-item">
                      <Check size={12} className="text-emerald" />
                      <span>Single &lt;h1&gt; Semantic Root</span>
                    </div>
                    <div className="craft-seo-checklist-item">
                      <Check size={12} className="text-emerald" />
                      <span>OpenGraph & Twitter Meta Tags</span>
                    </div>
                    <div className="craft-seo-checklist-item">
                      <Check size={12} className="text-emerald" />
                      <span>ARIA Landmarks & Button Roles</span>
                    </div>
                    <div className="craft-seo-checklist-item">
                      <Check size={12} className="text-emerald" />
                      <span>0.00 KB Framework JavaScript Debt</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="craft-pod-controls">
                <button
                  type="button"
                  onClick={() => showToast('All 8 SEO validation checks passed with 100% score!', 'success')}
                  className="craft-pod-btn"
                >
                  <ShieldCheck size={12} className="text-emerald" />
                  <span>Run Live Audit Scan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. PRODUCT FEATURES & ARCHITECTURAL PILLARS (Bento Grid)             */}
      {/* ==================================================================== */}
      <section className="craft-section" id="features">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ARCHITECTURAL COMPILER</span>
            <h2 className="craft-section-title">Built like a compiler, not a drag-and-drop toy.</h2>
            <p className="craft-section-desc">
              Visual builders historically treat the DOM as an afterthought. Pickle Studio operates on strict semantic abstractions, direct database bindings, and zero runtime dependencies.
            </p>
          </div>

          <div className="craft-bento-grid">
            {/* Bento 1: Large Flagship Semantic Compiler */}
            <div className="craft-bento-card bento-hero">
              <div className="craft-bento-glow" />
              <div className="craft-bento-badge">
                <Code2 size={13} />
                <span>THE ANTI-DIV-SOUP ENGINE</span>
              </div>
              <h3 className="craft-card-title">Pure Semantic HTML5 Output</h3>
              <p className="craft-card-desc">
                Other visual builders bury your design inside 20 layers of wrapper divs. Pickle Studio compiles elements to authentic &lt;header&gt;, &lt;nav&gt;, &lt;section&gt;, &lt;article&gt;, &lt;button&gt;, and &lt;form&gt; tags with perfect SEO rankability and ARIA accessibility.
              </p>

              <div className="craft-comparison-split">
                <div className="craft-comparison-col bad">
                  <div className="craft-col-header">
                    <span className="craft-col-dot red" />
                    <span>Generic Builders (Div Soup)</span>
                  </div>
                  <code>{`<div class="w-section-wrapper">
  <div class="container-outer">
    <div class="div-block-9281">
      <div class="hero-inner-div">
        <div class="text-div-styled">
          Visual Clutter
        </div>
      </div>
    </div>
  </div>
</div>`}</code>
                </div>
                <div className="craft-comparison-col good">
                  <div className="craft-col-header">
                    <span className="craft-col-dot green" />
                    <span>Pickle Studio (Pure Semantic)</span>
                  </div>
                  <code>{`<section class="hero-container">
  <h1 class="display-title">Visual Precision</h1>
  <button class="cta-primary">Instant Launch →</button>
</section>`}</code>
                </div>
              </div>
            </div>

            {/* Bento 2: 4-Breakpoint Fluid Reflow */}
            <div className="craft-bento-card">
              <div className="craft-bento-badge">
                <Monitor size={13} />
                <span>RESPONSIVE ENGINE</span>
              </div>
              <h3 className="craft-card-title">Cross-Breakpoint Fluid Reflow</h3>
              <p className="craft-card-desc">
                Design on Desktop (1200px), preview across Laptop (1024px), Tablet (768px), and Phone (390px). The engine automatically stacks multi-column sections and scales optical margins with zero manual media query hacking.
              </p>
              <div className="craft-reflow-visual">
                <span className="craft-screen-chip">Desktop (1200)</span>
                <span className="craft-screen-arrow">→</span>
                <span className="craft-screen-chip">Tablet (768)</span>
                <span className="craft-screen-arrow">→</span>
                <span className="craft-screen-chip active">Mobile (390)</span>
              </div>
            </div>

            {/* Bento 3: Figma Snapping & Cmd+L Lock */}
            <div className="craft-bento-card">
              <div className="craft-bento-badge">
                <Lock size={13} />
                <span>PRECISION LOCK</span>
              </div>
              <h3 className="craft-card-title">Cmd+L Precision Canvas Lock</h3>
              <p className="craft-card-desc">
                Lock background containers, logos, and navbars with one keystroke. Locked layers cannot be accidentally dragged or nudged while remaining fully inspectable in the sidebar.
              </p>
              <div className="craft-shortcut-display">
                <kbd>Cmd</kbd> + <kbd>L</kbd>
                <span className="craft-shortcut-label">Toggle Layer Lock</span>
              </div>
            </div>

            {/* Bento 4: Supabase Postgres & Offline SQLite */}
            <div className="craft-bento-card">
              <div className="craft-bento-badge">
                <Database size={13} />
                <span>DUAL PERSISTENCE</span>
              </div>
              <h3 className="craft-card-title">Supabase & Offline SQLite</h3>
              <p className="craft-card-desc">
                All artboard changes persist locally in your browser SQLite database and synchronize with Supabase Cloud Postgres in real time. Full point-in-time rollback history included.
              </p>
              <div className="craft-pill-tags">
                <span className="craft-mini-pill">Cloud Postgres</span>
                <span className="craft-mini-pill">Local SQLite</span>
                <span className="craft-mini-pill">Offline First</span>
              </div>
            </div>

            {/* Bento 5: 1-Click Standalone Export */}
            <div className="craft-bento-card">
              <div className="craft-bento-badge">
                <FileCode size={13} />
                <span>ZERO LOCK-IN</span>
              </div>
              <h3 className="craft-card-title">1-Click Standalone Export</h3>
              <p className="craft-card-desc">
                Download single-file production HTML and CSS ready to host anywhere with zero npm installs. Or export a complete Next.js 15 & React Tailwind ZIP archive ready for Vercel.
              </p>
              <div className="craft-pill-tags">
                <span className="craft-mini-pill">Single HTML/CSS</span>
                <span className="craft-mini-pill">Next.js 15 App</span>
                <span className="craft-mini-pill">Tailwind CSS</span>
              </div>
            </div>

            {/* Bento 6: Physics & Motion Presets */}
            <div className="craft-bento-card">
              <div className="craft-bento-badge">
                <Zap size={13} />
                <span>HARDWARE MOTION</span>
              </div>
              <h3 className="craft-card-title">16 Motion Physics Presets</h3>
              <p className="craft-card-desc">
                Hardware-accelerated keyframe animations, spring overshoot physics, scroll-triggered cascade staggers, and sticky pinned sections with zero external libraries.
              </p>
              <div className="craft-pill-tags">
                <span className="craft-mini-pill">Spring Physics</span>
                <span className="craft-mini-pill">Stagger Reveals</span>
                <span className="craft-mini-pill">Zero JS Bloat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. PRODUCT SPECIFICATIONS & UNCONDITIONAL FREEDOM                    */}
      {/* ==================================================================== */}
      <section className="craft-section" id="specs">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">UNCONDITIONAL COMMITMENT</span>
            <h2 className="craft-section-title">100% Free Forever. Zero Paywalls.</h2>
            <p className="craft-section-desc">
              All visual studio tools, pre-built layout sections, cloud database connections, and production code exports are unlocked for every creator.
            </p>
          </div>

          <div className="craft-unlocked-card">
            <div className="craft-unlocked-header">
              <div>
                <span className="craft-unlocked-kicker">PICKLE STUDIO COMPLETE ARCHITECTURE</span>
                <h3 className="craft-unlocked-title">Complete Visual Engineering Suite</h3>
              </div>
              <div className="craft-unlocked-badge">
                <ShieldCheck size={14} className="text-emerald" />
                <span>$0.00 / UNLOCKED & UNRESTRICTED</span>
              </div>
            </div>

            <div className="craft-unlocked-grid">
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Unlimited</strong> projects, pages, and canvas artboards</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Cross-Device Engine:</strong> Desktop, Tablet, and Mobile</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Production Export:</strong> Clean standalone HTML and CSS</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Next.js 15 Export:</strong> Full React + Tailwind ZIP bundle</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Supabase Cloud:</strong> Real-time Auth & Postgres synchronization</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Figma Snapping:</strong> Smart guides, ruler lines, and Alt distance</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>Interactive Forms:</strong> Lead capture database & CSV export</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-emerald" />
                <span><strong>E-Commerce:</strong> Product cards, slide-over cart, Stripe checkout</span>
              </div>
            </div>

            <div className="craft-unlocked-footer">
              <button
                onClick={onLaunchEditor}
                className="craft-btn-hero-primary"
              >
                <Zap size={16} />
                <span>Launch Visual Studio Now ($0.00)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. THE MAKERS (PICKLE CORP™ CALLOUT BANNER)                          */}
      {/* ==================================================================== */}
      <section className="craft-section" id="makers">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ABOUT THE PARENT STUDIO</span>
            <h2 className="craft-section-title">Engineered by Pickle Corp™.</h2>
            <p className="craft-section-desc">
              Pickle Studio was designed and built to power our own high-octane client builds.
            </p>
          </div>

          <div className="pickle-makers-box">
            <div className="pickle-makers-header">
              <div className="pickle-makers-avatar">🥒</div>
              <div>
                <h3 className="pickle-makers-title">Pickle Corp™</h3>
                <span className="pickle-makers-tagline">
                  Independent Freelance Studio. Paid Strictly in Favors.
                </span>
              </div>
            </div>

            <p className="pickle-makers-body">
              Founded by <strong>Kaiser & Thanvi</strong> — two 14-year-old builders engineering systems and designing products that punch far above their weight. <strong>Cash declined. Zero fiat. $0.00 invoices.</strong> We needed a visual builder to ship client builds at lightspeed with zero framework debt and clean semantic code, so we built <strong>Pickle Studio</strong> and unlocked it for the world.
            </p>

            <div className="pickle-makers-founders-row">
              <div className="pickle-mini-founder">
                <div className="pickle-mini-name">
                  <span>Kaiser</span>
                  <span className="text-emerald text-[11px]">(Co-Founder)</span>
                </div>
                <div className="pickle-mini-role">50% Architecture & Systems • Codes after school</div>
              </div>

              <div className="pickle-mini-founder">
                <div className="pickle-mini-name">
                  <span>Thanvi</span>
                  <span className="text-emerald text-[11px]">(Co-Founder)</span>
                </div>
                <div className="pickle-mini-role">50% Product Direction & Aesthetics</div>
              </div>

              <div className="pickle-mini-founder">
                <div className="pickle-mini-name">
                  <span>Gummy 🍬</span>
                  <span className="text-emerald text-[11px]">(Mascot)</span>
                </div>
                <div className="pickle-mini-role">Flat mint gumdrop • Appointed to management</div>
              </div>
            </div>

            <div className="pickle-makers-contact-bar">
              <span>Primary Dispatch: <a href="mailto:azanmail2022@gmail.com" className="pickle-makers-link">azanmail2022@gmail.com</a></span>
              <span>Direct Hotline: <a href="tel:+917010059290" className="pickle-makers-link">+91 70100 59290</a></span>
              <span>Ethos: <em>"When you're in a pickle, cash won't get you out. A favor will."</em></span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. PRODUCT FAQ ACCORDION                                             */}
      {/* ==================================================================== */}
      <section className="craft-section" id="faq">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ENGINEERING FAQ</span>
            <h2 className="craft-section-title">Frequently Asked Questions</h2>
            <p className="craft-section-desc">
              Concrete answers on architecture, code export, and responsive reflow mechanics.
            </p>
          </div>

          <div className="craft-faq-wrapper">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`craft-faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="craft-faq-question"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-emerald" /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="craft-faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. GROUNDED FOOTER                                                   */}
      {/* ==================================================================== */}
      <footer className="craft-footer">
        <div className="craft-container">
          <div className="craft-footer-inner">
            <div className="craft-footer-left">
              <div className="craft-footer-brand">
                <span className="craft-brand-glyph" style={{ fontSize: 18 }}>🥒</span>
                <span className="craft-brand-name">PICKLE STUDIO</span>
              </div>
              <p className="craft-footer-tagline">
                The visual website builder built with pure semantic precision. A product by Pickle Corp™.
              </p>
            </div>

            <div className="craft-footer-shortcuts">
              <span className="craft-shortcut-chip"><kbd>Cmd</kbd>+<kbd>C</kbd> Copy</span>
              <span className="craft-shortcut-chip"><kbd>Cmd</kbd>+<kbd>V</kbd> Paste</span>
              <span className="craft-shortcut-chip"><kbd>Cmd</kbd>+<kbd>L</kbd> Lock</span>
              <span className="craft-shortcut-chip"><kbd>Cmd</kbd>+<kbd>Z</kbd> Undo</span>
            </div>
          </div>

          <div className="craft-footer-bottom">
            <span>© 2026 Pickle Studio by Pickle Corp. Kaiser & Thanvi. Zero framework bloat.</span>
            <span>Authored by Azan Abdullah • Dispatch: <a href="mailto:azanmail2022@gmail.com" style={{ color: '#34d399', textDecoration: 'none' }}>azanmail2022@gmail.com</a></span>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 9. AUTH & DEMO MODAL                                                 */}
      {/* ==================================================================== */}
      {isAuthModalOpen && (
        <div className="craft-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="craft-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsAuthModalOpen(false)} className="craft-modal-close">
              <X size={16} />
            </button>

            <div className="craft-modal-tabs">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`craft-modal-tab ${authMode === 'signup' ? 'active' : ''}`}
              >
                Sign Up ($0.00)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`craft-modal-tab ${authMode === 'signin' ? 'active' : ''}`}
              >
                Sign In
              </button>
            </div>

            <div className="craft-modal-header">
              <h3 className="craft-modal-title">
                {authMode === 'signup' ? 'Create Pickle Studio Account' : 'Sign In to Pickle Studio'}
              </h3>
              <p className="craft-modal-sub">
                {authMode === 'signup'
                  ? 'All visual engineering features unlocked forever. Instant SQLite & Cloud sync.'
                  : 'Enter your credentials to access your studio projects.'}
              </p>
            </div>

            {authSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div className="craft-modal-success-icon">
                  <Check size={24} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
                  {authMode === 'signup' ? 'Account Created Successfully' : 'Signed In Successfully'}
                </h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Synchronizing session and launching Pickle Studio workspace...
                </p>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="craft-demo-access-btn"
                >
                  <Sparkles size={14} className="text-amber" />
                  <span>1-Click Demo (Azan Abdullah / Owner)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting}
                  className="craft-google-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{isGoogleSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <div className="craft-divider">
                  <span>or continue with email</span>
                </div>

                <form onSubmit={handleSubmit}>
                  {authMode === 'signup' && (
                    <div className="craft-form-group">
                      <label className="craft-form-label">Full Name</label>
                      <div className="craft-input-wrap">
                        <User className="craft-input-icon" />
                        <input
                          type="text"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Azan Abdullah"
                          className="craft-modal-input"
                        />
                      </div>
                    </div>
                  )}

                  <div className="craft-form-group">
                    <label className="craft-form-label">Email Address</label>
                    <div className="craft-input-wrap">
                      <Mail className="craft-input-icon" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="azanmail2022@gmail.com"
                        className="craft-modal-input"
                      />
                    </div>
                  </div>

                  <div className="craft-form-group">
                    <label className="craft-form-label">Password</label>
                    <div className="craft-input-wrap">
                      <Key className="craft-input-icon" />
                      <input
                        type="password"
                        required
                        minLength={authMode === 'signup' ? 6 : 1}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="craft-modal-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="craft-modal-submit-btn"
                  >
                    {isSubmitting
                      ? 'Synchronizing...'
                      : authMode === 'signup'
                      ? 'Create Free Account & Launch Studio'
                      : 'Sign In & Launch Studio'}
                  </button>

                  <div className="craft-modal-footer-toggle">
                    {authMode === 'signup' ? (
                      <span>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className="craft-toggle-link"
                        >
                          Sign In
                        </button>
                      </span>
                    ) : (
                      <span>
                        Need an account?{' '}
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className="craft-toggle-link"
                        >
                          Sign Up Free
                        </button>
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
