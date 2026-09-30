import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Code2,
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
  FileCode,
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

  // Active Device Mockup Viewport Tab
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeInspectorElement, setActiveInspectorElement] = useState<'button' | 'hero' | 'card'>('button');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Open modal in specific mode
  const openModal = (mode: 'signup' | 'signin') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // 1-Click Instant Demo Login
  const handleQuickDemoAccess = () => {
    const demoUser = {
      name: 'Azan Abdullah',
      email: 'azan@craftstudio.dev',
      plan: 'Full Access (Free Forever)',
      role: 'owner',
    };
    setCurrentUser(demoUser);
    showToast('Welcome Azan Abdullah! Entering Craft Studio...', 'success');
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
        const cleanName = authName.trim() || authEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Azan Abdullah';
        const res = await databaseService.signup({
          name: cleanName,
          email: authEmail.trim(),
          password: authPassword,
          plan: 'Full Access (Free Forever)',
        });

        if (res.success) {
          setAuthSuccess(true);
          const authedUser = {
            name: cleanName,
            email: authEmail.trim(),
            plan: 'Full Access (Free Forever)',
            role: 'owner',
          };
          setCurrentUser(authedUser);
          showToast('Account created! Entering Craft Studio...', 'success');
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
            plan: res.user?.plan || 'Full Access (Free Forever)',
          };
          setCurrentUser(authedUser);
          showToast(`Welcome back, ${authedUser.name}! Entering Craft Studio...`, 'success');
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

  const faqItems = [
    {
      q: 'How does Craft Studio differ from Webflow, Framer, or generic builders?',
      a: 'Generic builders compile designs into nested <div> wrappers with heavy proprietary JavaScript runtimes. Craft Studio operates as a visual compiler: every canvas element carries authentic semantic HTML (<button>, <nav>, <section>, <form>), strict element locking (Cmd+L), and direct Supabase database bindings without vendor lock-in.',
    },
    {
      q: 'How does the automatic responsive reflow engine work?',
      a: 'The engine evaluates element geometry across Desktop (1200px), Laptop (1024px), Tablet (768px), and Phone (390px). Multi-column section layouts automatically adapt into ergonomic vertical stacks, typography scales proportionally, and relative parent-child coordinates are preserved.',
    },
    {
      q: 'Can I export clean standalone code and self-host anywhere?',
      a: 'Yes. With one click, export 100% production-ready, standalone HTML and CSS. There are zero framework runtimes or external script dependencies. You can deploy directly to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any web server.',
    },
    {
      q: 'How does the Supabase Cloud integration work?',
      a: 'Craft Studio connects natively to Supabase Auth and PostgreSQL. User sign-ups, session auth, and custom form submissions automatically synchronize with cloud public.profiles and public.submissions tables, backed by client-side SQLite storage.',
    },
    {
      q: 'Is Craft Studio really 100% free with all features?',
      a: 'Yes. All visual building tools, layout templates, responsive controls, Supabase integrations, and code export are completely free forever. There are no paywalls, hidden tiers, or subscriptions.',
    },
  ];

  return (
    <div className="craft-landing-root">
      {/* ==================================================================== */}
      {/* 1. STICKY TOP NAVIGATION BAR (Authored, De-slopped)                   */}
      {/* ==================================================================== */}
      <header className="craft-navbar">
        <div className="craft-container">
          <div className="craft-nav-inner">
            {/* Logo */}
            <div
              className="craft-logo-group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="craft-logo-icon">
                <span>C</span>
              </div>
              <div className="craft-logo-text">
                <span className="craft-logo-title">
                  Craft <span className="craft-studio-tag">ENGINE</span>
                </span>
                <span className="craft-logo-subtitle">Visual Web Architecture</span>
              </div>
            </div>

            {/* Nav Links */}
            <ul className="craft-nav-links">
              <li><a href="#workbench" className="craft-nav-link">Interactive Workbench</a></li>
              <li><a href="#architecture" className="craft-nav-link">Architecture</a></li>
              <li><a href="#specifications" className="craft-nav-link">Specifications</a></li>
              <li><a href="#faq" className="craft-nav-link">Documentation</a></li>
            </ul>

            {/* Nav Actions */}
            <div className="craft-nav-actions">
              {currentUser ? (
                <>
                  <div className="craft-user-badge">
                    <div className="craft-user-avatar">
                      {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                    </div>
                    <span>{currentUser.name}</span>
                  </div>
                  <button onClick={onLaunchEditor} className="craft-btn-nav-primary">
                    <Layout size={14} />
                    <span>Enter Studio</span>
                  </button>
                  <button onClick={logout} className="craft-btn-ghost">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onLaunchEditor} className="craft-btn-ghost" title="Launch Visual Editor directly">
                    <Layout size={14} />
                    <span>Launch Studio</span>
                  </button>
                  <button onClick={() => openModal('signin')} className="craft-btn-ghost">
                    <User size={14} />
                    <span>Sign In</span>
                  </button>
                  <button onClick={() => openModal('signup')} className="craft-btn-nav-primary">
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION — Asymmetric, Commanding, Zero Slop                 */}
      {/* ==================================================================== */}
      <section className="craft-hero">
        <div className="craft-container">
          <div className="craft-hero-editorial">
            {/* Architectural Eyebrow */}
            <div className="craft-hero-eyebrow">
              <span className="craft-eyebrow-rule" />
              <span className="craft-eyebrow-text">VISUAL WEB COMPILER // CLIENT-SIDE RUNTIME</span>
            </div>

            {/* Headline with High Contrast, Zero Cliché Gradient Text */}
            <h1 className="craft-hero-title">
              Visual web engineering with zero framework debt.
            </h1>

            {/* Subtitle */}
            <p className="craft-hero-subtitle">
              Every canvas element maps directly to semantic HTML, responsive container hierarchies, and client-side database persistence. Design visually, lock with strict precision, and export clean standalone code ready for production.
            </p>

            {/* Action CTAs — Tactile, High-Contrast */}
            <div className="craft-hero-actions">
              <button
                onClick={() => (currentUser ? onLaunchEditor() : openModal('signup'))}
                className="craft-btn-hero-primary"
              >
                <span>{currentUser ? 'Enter Studio Editor' : 'Launch Visual Studio Free'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={handleQuickDemoAccess}
                className="craft-btn-hero-secondary"
              >
                <Sparkles size={15} />
                <span>1-Click Instant Demo</span>
              </button>
            </div>

            {/* Authentic Architectural Spec Bar */}
            <div className="craft-spec-strip">
              <div className="craft-spec-item">
                <Check size={14} className="craft-spec-check" />
                <span>100% Vanilla HTML & CSS Output</span>
              </div>
              <div className="craft-spec-item">
                <Check size={14} className="craft-spec-check" />
                <span>Native SQLite & Supabase Cloud</span>
              </div>
              <div className="craft-spec-item">
                <Check size={14} className="craft-spec-check" />
                <span>Full Responsive Breakpoint Reflow</span>
              </div>
              <div className="craft-spec-item">
                <Check size={14} className="craft-spec-check" />
                <span>Strict Cmd+L Canvas Lock</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 3. SIGNATURE FOCAL OBJECT: STUDIO WORKBENCH INSTRUMENT           */}
          {/* ================================================================ */}
          <div className="craft-workbench-wrapper" id="workbench">
            {/* Precision Instrument Chassis Header */}
            <div className="craft-workbench-chassis">
              <div className="craft-chassis-left">
                <div className="craft-chassis-indicator" />
                <span className="craft-chassis-title">CRAFT WORKBENCH</span>
                <span className="craft-chassis-divider">/</span>
                <span className="craft-chassis-doc">interactive-viewport.canvas</span>
              </div>

              {/* Viewport Switcher Controls */}
              <div className="craft-viewport-switcher">
                <button
                  onClick={() => setActiveDeviceTab('desktop')}
                  className={`craft-vp-btn ${activeDeviceTab === 'desktop' ? 'active' : ''}`}
                >
                  <Monitor size={12} />
                  <span>Desktop (1200px)</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('tablet')}
                  className={`craft-vp-btn ${activeDeviceTab === 'tablet' ? 'active' : ''}`}
                >
                  <Tablet size={12} />
                  <span>Tablet (768px)</span>
                </button>
                <button
                  onClick={() => setActiveDeviceTab('mobile')}
                  className={`craft-vp-btn ${activeDeviceTab === 'mobile' ? 'active' : ''}`}
                >
                  <Smartphone size={12} />
                  <span>Phone (390px)</span>
                </button>
              </div>

              <div className="craft-chassis-right">
                <span className="craft-chassis-metric">ZOOM: 100%</span>
                <span className="craft-chassis-status">● LIVE CANVAS</span>
              </div>
            </div>

            {/* Workbench Body */}
            <div className="craft-workbench-body">
              {/* Left Toolbox */}
              <div className="craft-workbench-sidebar-left">
                <div className="craft-sidebar-heading">DOM Elements</div>
                <div
                  className={`craft-sidebar-item ${activeInspectorElement === 'hero' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorElement('hero')}
                >
                  <Layout size={13} />
                  <span>&lt;section.hero&gt;</span>
                </div>
                <div
                  className={`craft-sidebar-item ${activeInspectorElement === 'button' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorElement('button')}
                >
                  <MousePointerClick size={13} />
                  <span>&lt;button.cta&gt;</span>
                </div>
                <div
                  className={`craft-sidebar-item ${activeInspectorElement === 'card' ? 'active' : ''}`}
                  onClick={() => setActiveInspectorElement('card')}
                >
                  <Layers size={13} />
                  <span>&lt;article.card&gt;</span>
                </div>
                <div className="craft-sidebar-item">
                  <Database size={13} />
                  <span>&lt;form.supabase&gt;</span>
                </div>

                <div className="craft-workbench-lock-status">
                  <Lock size={12} />
                  <span>Cmd+L Lock Engaged</span>
                </div>
              </div>

              {/* Center Live Artboard Canvas */}
              <div className="craft-workbench-artboard-stage">
                <div className={`craft-artboard-container ${activeDeviceTab}`}>
                  {/* Mock Site Navbar */}
                  <div className="craft-artboard-nav">
                    <div className="craft-artboard-brand">
                      <span className="craft-brand-glyph">✦</span>
                      <span>Apex Global Logistics</span>
                    </div>
                    <div className="craft-artboard-menu">
                      <span>Network</span>
                      <span>Telemetry</span>
                      <span>Rates</span>
                    </div>
                  </div>

                  {/* Mock Site Hero Content */}
                  <div className="craft-artboard-hero">
                    <span className="craft-artboard-kicker">INFRASTRUCTURE PLATFORM</span>
                    <h2 className="craft-artboard-title">
                      Autonomous Freight Telemetry & Routing
                    </h2>
                    <p className="craft-artboard-text">
                      High-throughput cold chain tracking and global route optimization with microsecond sensor reporting.
                    </p>

                    {/* Interactive Clickable Element */}
                    <div
                      className={`craft-interactive-element ${activeInspectorElement === 'button' ? 'highlighted' : ''}`}
                      onClick={() => setActiveInspectorElement('button')}
                    >
                      <span className="craft-element-tag">&lt;button.primary role="button"&gt;</span>
                      <button className="craft-artboard-cta" onClick={() => openModal('signup')}>
                        Deploy Sensor Fleet →
                      </button>
                    </div>
                  </div>

                  {/* Responsive Grid Cards */}
                  <div className="craft-artboard-grid">
                    <div
                      className={`craft-grid-item ${activeInspectorElement === 'card' ? 'highlighted' : ''}`}
                      onClick={() => setActiveInspectorElement('card')}
                    >
                      <div className="craft-grid-item-header">
                        <Cpu size={14} />
                        <span>Telemetry Node</span>
                      </div>
                      <p>99.998% packet delivery over distributed mesh relays.</p>
                    </div>
                    <div className="craft-grid-item">
                      <div className="craft-grid-item-header">
                        <Database size={14} />
                        <span>Edge PostgreSQL</span>
                      </div>
                      <p>Sub-millisecond query execution on edge instances.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Property Inspector */}
              <div className="craft-workbench-sidebar-right">
                <div className="craft-sidebar-heading">Computed Inspector</div>
                <div className="craft-inspector-block">
                  <div className="craft-inspector-label">Element Target</div>
                  <div className="craft-inspector-code">
                    {activeInspectorElement === 'button'
                      ? '<button class="cta-primary">'
                      : activeInspectorElement === 'hero'
                      ? '<section class="hero-container">'
                      : '<article class="telemetry-card">'}
                  </div>
                </div>

                <div className="craft-inspector-grid">
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">display</span>
                    <span className="craft-prop-value">inline-flex</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">width</span>
                    <span className="craft-prop-value">
                      {activeDeviceTab === 'desktop' ? '1200px' : activeDeviceTab === 'tablet' ? '768px' : '390px'}
                    </span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">box-sizing</span>
                    <span className="craft-prop-value">border-box</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">actionType</span>
                    <span className="craft-prop-value text-amber">openModal</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">lockState</span>
                    <span className="craft-prop-value text-emerald">Cmd+L Locked</span>
                  </div>
                  <div className="craft-inspector-row">
                    <span className="craft-prop-name">persistence</span>
                    <span className="craft-prop-value">Supabase + SQLite</span>
                  </div>
                </div>

                <button
                  onClick={onLaunchEditor}
                  className="craft-btn-inspect-launch"
                >
                  <Terminal size={13} />
                  <span>Open Full Studio Inspector</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. ARCHITECTURAL PILLARS — Asymmetric, Technical, Anti-Slop         */}
      {/* ==================================================================== */}
      <section className="craft-section" id="architecture">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ENGINEERING STANDARDS</span>
            <h2 className="craft-section-title">Built like a compiler, not a drag-and-drop toy.</h2>
            <p className="craft-section-desc">
              Visual design tools historically treat the DOM as an afterthought. Craft operates on strict semantic abstractions, direct database bindings, and zero runtime dependencies.
            </p>
          </div>

          <div className="craft-arch-grid">
            {/* 1. Large Spotlight Pillar */}
            <div className="craft-arch-card spotlight">
              <div className="craft-arch-content">
                <div className="craft-arch-icon">
                  <Monitor size={22} />
                </div>
                <h3 className="craft-card-title">Cross-Breakpoint Responsive Reflow</h3>
                <p className="craft-card-desc">
                  Design on Desktop, preview across Laptop, Tablet, and Mobile. The layout engine calculates proportional typography adjustments, switches container flow from row to column, and preserves optical gutters automatically.
                </p>
                <div className="craft-code-preview">
                  <code>@media (max-width: 768px) &#123; .section &#123; flex-direction: column; &#125; &#125;</code>
                </div>
              </div>
            </div>

            {/* 2. Semantic Roles */}
            <div className="craft-arch-card">
              <div className="craft-arch-icon">
                <Code2 size={20} />
              </div>
              <h3 className="craft-card-title">Pure Semantic HTML Tags</h3>
              <p className="craft-card-desc">
                No div-soup. Every element is explicitly typed as &lt;button&gt;, &lt;header&gt;, &lt;nav&gt;, &lt;section&gt;, or &lt;article&gt; for complete accessibility and search engine fidelity.
              </p>
            </div>

            {/* 3. Strict Lock */}
            <div className="craft-arch-card">
              <div className="craft-arch-icon">
                <Lock size={20} />
              </div>
              <h3 className="craft-card-title">Cmd+L Element Protection</h3>
              <p className="craft-card-desc">
                Lock backgrounds, navbars, and anchor sections with one shortcut. Locked layers cannot be nudged, misaligned, or accidentally removed.
              </p>
            </div>

            {/* 4. Dual Persistence */}
            <div className="craft-arch-card">
              <div className="craft-arch-icon">
                <Database size={20} />
              </div>
              <h3 className="craft-card-title">Supabase & SQLite Persistence</h3>
              <p className="craft-card-desc">
                All changes persist instantly to your local browser SQLite database and synchronize with Supabase Cloud Postgres when online.
              </p>
            </div>

            {/* 5. Clean Code Export */}
            <div className="craft-arch-card">
              <div className="craft-arch-icon">
                <FileCode size={20} />
              </div>
              <h3 className="craft-card-title">Vanilla HTML/CSS Export</h3>
              <p className="craft-card-desc">
                Click Export to download single-bundle production HTML and CSS. Zero npm installs, zero JavaScript framework runtime requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. HONEST TRANSPARENCY & UNLOCKED ACCESS                            */}
      {/* ==================================================================== */}
      <section className="craft-section" id="specifications">
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
                <span className="craft-unlocked-kicker">CRAFT STUDIO FULL SYSTEM</span>
                <h3 className="craft-unlocked-title">Complete Visual Engineering Suite</h3>
              </div>
              <div className="craft-unlocked-badge">
                <span>FREE & UNRESTRICTED</span>
              </div>
            </div>

            <div className="craft-unlocked-grid">
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Unlimited</strong> projects, pages, and canvas artboards</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Cross-Device Engine:</strong> Desktop, Tablet, and Mobile</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Production Export:</strong> Clean standalone HTML and CSS</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Supabase Cloud:</strong> Real-time Auth & Postgres synchronization</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Extended Controls:</strong> Custom shapes, emoji stickers, image uploads</span>
              </div>
              <div className="craft-unlocked-feature">
                <Check size={16} className="text-amber" />
                <span><strong>Interactive Engine:</strong> Confetti, sound triggers, navigation links</span>
              </div>
            </div>

            <div className="craft-unlocked-footer">
              <button
                onClick={onLaunchEditor}
                className="craft-btn-hero-primary"
              >
                <span>Launch Visual Studio Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. FAQ ACCORDION                                                     */}
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
                    {isOpen ? <ChevronUp size={16} className="text-amber" /> : <ChevronDown size={16} />}
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
      {/* 7. GROUNDED FOOTER                                                   */}
      {/* ==================================================================== */}
      <footer className="craft-footer">
        <div className="craft-container">
          <div className="craft-footer-inner">
            <div className="craft-footer-left">
              <div className="craft-footer-brand">
                <span className="craft-brand-glyph">✦</span>
                <span className="craft-brand-name">CRAFT STUDIO</span>
              </div>
              <p className="craft-footer-tagline">
                The visual web builder built with pure semantic precision.
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
            <span>© 2026 Craft Visual Website Builder. Client-side compiled with zero framework bloat.</span>
            <span>Authored by Azan Abdullah</span>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 8. AUTH MODAL (Clean, Honest, Direct)                                */}
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
                Sign Up Free
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
                {authMode === 'signup' ? 'Create Your Free Account' : 'Sign In to Craft Studio'}
              </h3>
              <p className="craft-modal-sub">
                {authMode === 'signup'
                  ? 'All features unlocked forever. Instant Supabase & SQLite sync.'
                  : 'Enter your credentials to access your workspaces.'}
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
                  Synchronizing session and launching Visual Studio workspace...
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
                  <span>1-Click Instant Demo (Azan Abdullah / Owner)</span>
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
                    <label className="craft-form-label">Work Email</label>
                    <div className="craft-input-wrap">
                      <Mail className="craft-input-icon" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="azan@domain.com"
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
                      ? 'Syncing with Supabase...'
                      : authMode === 'signup'
                      ? 'Create Free Account & Enter Studio'
                      : 'Sign In & Enter Studio'}
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
