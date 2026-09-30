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
  Zap,
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
  const [selectedPlan, setSelectedPlan] = useState('Pro Studio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Active Device Mockup Viewport Tab
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Open modal in specific mode
  const openModal = (mode: 'signup' | 'signin', plan?: string) => {
    setAuthMode(mode);
    if (plan) setSelectedPlan(plan);
    setIsAuthModalOpen(true);
  };

  // 1-Click Instant Demo Login
  const handleQuickDemoAccess = () => {
    const demoUser = {
      name: 'Alex Morgan',
      email: 'alex@craftstudio.dev',
      plan: selectedPlan || 'Pro Studio',
    };
    setCurrentUser(demoUser);
    showToast('🚀 Welcome Alex Morgan! Entering Craft Studio...', 'success');
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
        const res = await databaseService.signup({
          name: authName.trim() || 'Craft Creator',
          email: authEmail.trim(),
          password: authPassword,
          plan: selectedPlan,
        });

        if (res.success) {
          setAuthSuccess(true);
          const authedUser = {
            name: authName.trim() || 'Craft Creator',
            email: authEmail.trim(),
            plan: selectedPlan,
          };
          setCurrentUser(authedUser);
          showToast('🎉 Account created! Entering Craft Studio...', 'success');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthSuccess(false);
            setAuthName('');
            setAuthEmail('');
            setAuthPassword('');
            onLaunchEditor();
          }, 700);
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
            plan: res.user?.plan || selectedPlan,
          };
          setCurrentUser(authedUser);
          showToast(`🎉 Welcome back, ${authedUser.name}! Entering Craft Studio...`, 'success');
          setTimeout(() => {
            setIsAuthModalOpen(false);
            setAuthSuccess(false);
            setAuthName('');
            setAuthEmail('');
            setAuthPassword('');
            onLaunchEditor();
          }, 700);
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
      a: 'Generic builders compile designs into nested unsemantic <div> soups with bloated client-side JavaScript. Craft Studio lets you visually design while attaching real HTML semantic tags (<button>, <nav>, <form>), strict element locking (Cmd+L), and direct Supabase database bindings without code lock-in.',
    },
    {
      q: 'Does it automatically make my website responsive?',
      a: 'Yes. The automatic responsive reflow engine analyzes your layout across Desktop (1200px), Laptop (1024px), Tablet (768px), and Phone (390px), adjusting typography, spacing, and vertical card flow seamlessly.',
    },
    {
      q: 'Can I export clean standalone code and host it anywhere?',
      a: 'Absolutely. You can export 100% production-ready standalone HTML and CSS with zero proprietary framework runtimes. You can host it on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any traditional server.',
    },
    {
      q: 'How does the Supabase Cloud integration work?',
      a: 'Craft Studio connects natively to Supabase Auth and PostgreSQL. User registrations and form submissions automatically sync to your cloud public.profiles and public.submissions tables with local SQLite backup support.',
    },
    {
      q: 'Is there a free tier for experiments and personal projects?',
      a: 'Yes! The Starter tier is $0 and free forever, including 3 active web projects, drag-and-drop canvas, and standard HTML/CSS code export without a credit card.',
    },
  ];

  return (
    <div className="craft-landing-root">
      {/* ==================================================================== */}
      {/* 1. STICKY TOP NAVIGATION BAR                                         */}
      {/* ==================================================================== */}
      <header className="craft-navbar">
        <div className="craft-container">
          <div className="craft-nav-inner">
            {/* Logo */}
            <div
              className="craft-logo-group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="craft-logo-icon">✦</div>
              <div className="craft-logo-text">
                <span className="craft-logo-title">
                  Craft <span className="craft-studio-pill">STUDIO</span>
                </span>
                <span className="craft-logo-subtitle">Visual Website Builder</span>
              </div>
            </div>

            {/* Nav Links */}
            <ul className="craft-nav-links">
              <li><a href="#features" className="craft-nav-link">Features</a></li>
              <li><a href="#responsive" className="craft-nav-link">Responsive Engine</a></li>
              <li><a href="#pricing" className="craft-nav-link">Pricing</a></li>
              <li><a href="#faq" className="craft-nav-link">FAQ</a></li>
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
                    <span>Enter Studio →</span>
                  </button>
                  <button onClick={logout} className="craft-btn-ghost">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onLaunchEditor} className="craft-btn-ghost" title="Open Visual Editor directly">
                    <Layout size={14} color="#818cf8" />
                    <span>Launch Studio</span>
                  </button>
                  <button onClick={() => openModal('signin')} className="craft-btn-ghost">
                    <User size={14} />
                    <span>Sign In</span>
                  </button>
                  <button onClick={() => openModal('signup')} className="craft-btn-nav-primary">
                    <span>Sign Up Free</span>
                    <ArrowRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section className="craft-hero">
        <div className="craft-container">
          {/* Badge */}
          <div className="craft-hero-badge">
            <span className="craft-pulse-dot" />
            <span>Craft 3.0 • Pure Human Visual Design. Zero AI Clutter.</span>
          </div>

          {/* Headline */}
          <h1 className="craft-hero-title">
            Design it. Define it.{' '}
            <span className="craft-hero-gradient">Ship it.</span>
          </h1>

          {/* Subtitle */}
          <p className="craft-hero-subtitle">
            The visual website builder where canvas shapes carry <strong>true semantic meaning</strong>.
            Experience automatic responsive reflow across Desktop, Tablet, and Mobile, native Supabase cloud persistence, and 100% clean standalone HTML/CSS code export.
          </p>

          {/* Action CTAs */}
          <div className="craft-hero-actions">
            <button
              onClick={() => (currentUser ? onLaunchEditor() : openModal('signup'))}
              className="craft-hero-btn-primary"
            >
              <span>{currentUser ? '🚀 Open Studio Editor' : '🚀 Sign Up Free — Start Building'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onLaunchEditor}
              className="craft-hero-btn-secondary"
            >
              <Layout size={16} />
              <span>Launch Studio Editor</span>
            </button>
          </div>

          {/* Social Proof Subtitle */}
          <div className="craft-hero-social-proof">
            <span className="craft-stars">★★★★★</span>
            <span>4.9/5 from 2,500+ creators</span>
            <span>•</span>
            <span>No credit card required</span>
            <span>•</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Instant Supabase Sync</span>
          </div>

          {/* ================================================================ */}
          {/* 3. INTERACTIVE STUDIO APP WINDOW MOCKUP                          */}
          {/* ================================================================ */}
          <div className="craft-mockup-wrapper" id="responsive">
            {/* macOS Title Bar */}
            <div className="craft-mockup-titlebar">
              <div className="craft-traffic-lights">
                <span className="craft-dot craft-dot-red" />
                <span className="craft-dot craft-dot-yellow" />
                <span className="craft-dot craft-dot-green" />
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px', fontFamily: 'JetBrains Mono' }}>
                  craft-studio://canvas/interactive-preview
                </span>
              </div>

              {/* Viewport Switcher Tabs */}
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

              <div className="craft-mockup-status">
                <span className="craft-pulse-dot" />
                <span>Supabase Live Sync</span>
              </div>
            </div>

            {/* Studio Workspace Layout */}
            <div className="craft-mockup-workspace">
              {/* Left Mini Sidebar */}
              <div className="craft-mockup-sidebar-left">
                <div className="craft-mockup-label">Elements</div>
                <div className="craft-tool-item selected">
                  <Layout size={14} color="#818cf8" />
                  <span>Hero Section</span>
                </div>
                <div className="craft-tool-item">
                  <MousePointerClick size={14} color="#c084fc" />
                  <span>Button & CTA</span>
                </div>
                <div className="craft-tool-item">
                  <Database size={14} color="#34d399" />
                  <span>Supabase Form</span>
                </div>
                <div className="craft-tool-item">
                  <Layers size={14} color="#fbbf24" />
                  <span>Grid Cards</span>
                </div>
                <div style={{ marginTop: 'auto' }} className="craft-lock-indicator">
                  <Lock size={12} />
                  <span>🔒 Cmd+L Locked</span>
                </div>
              </div>

              {/* Center Artboard Area */}
              <div className="craft-mockup-canvas-area">
                <div className={`craft-artboard ${activeDeviceTab}`}>
                  <div className="craft-artboard-nav">
                    <span className="craft-artboard-brand">✦ Lumina Finance</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Features • Pricing • Contact</span>
                  </div>

                  <div className="craft-artboard-hero">
                    <span className="craft-artboard-tag">NEW RELEASE 2026</span>
                    <h3 className="craft-artboard-heading">Intelligent Wealth Management</h3>
                    <p className="craft-artboard-desc">
                      Automate investments, track international portfolios, and ship financial growth with zero hidden fees.
                    </p>

                    {/* Active Selected Element with Selection Handles */}
                    <div className="craft-selected-element">
                      <span className="craft-role-badge-tag">&lt;button.primary&gt; 🔒</span>
                      <button className="craft-artboard-btn" onClick={() => openModal('signup')}>
                        Open Account Free →
                      </button>
                    </div>
                  </div>

                  {/* Feature Cards inside Artboard */}
                  <div className="craft-artboard-cards">
                    <div className="craft-mini-card">
                      <div className="craft-mini-card-icon"><Zap size={13} /></div>
                      <div className="craft-mini-card-title">Real-time Reflow</div>
                    </div>
                    <div className="craft-mini-card">
                      <div className="craft-mini-card-icon"><Database size={13} /></div>
                      <div className="craft-mini-card-title">Postgres Leads</div>
                    </div>
                    <div className="craft-mini-card">
                      <div className="craft-mini-card-icon"><Code2 size={13} /></div>
                      <div className="craft-mini-card-title">Clean HTML Export</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Inspector Panel */}
              <div className="craft-mockup-sidebar-right">
                <div className="craft-mockup-label">Inspector</div>
                <div className="craft-prop-row">
                  <span className="craft-prop-label">Semantic Role</span>
                  <span className="craft-prop-val">&lt;button&gt;</span>
                </div>
                <div className="craft-prop-row">
                  <span className="craft-prop-label">Width</span>
                  <span className="craft-prop-val">{activeDeviceTab === 'desktop' ? '1200px' : activeDeviceTab === 'tablet' ? '768px' : '390px'}</span>
                </div>
                <div className="craft-prop-row">
                  <span className="craft-prop-label">Position</span>
                  <span className="craft-prop-val">X: 180 Y: 240</span>
                </div>
                <div className="craft-prop-row">
                  <span className="craft-prop-label">Action</span>
                  <span className="craft-prop-val">Open Modal</span>
                </div>
                <div className="craft-prop-row">
                  <span className="craft-prop-label">Lock State</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }} className="craft-prop-val">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. LOGO TICKER / TRUSTED BY                                          */}
      {/* ==================================================================== */}
      <section className="craft-ticker-section">
        <div className="craft-container">
          <div className="craft-ticker-heading">
            POWERING WEBSITES & APPS FOR MODERN TECH TEAMS
          </div>
          <div className="craft-ticker-grid">
            <span className="craft-ticker-item">▲ Vercel</span>
            <span className="craft-ticker-item">⚡ Supabase</span>
            <span className="craft-ticker-item">❖ Stripe</span>
            <span className="craft-ticker-item">◆ Linear</span>
            <span className="craft-ticker-item">✜ Raycast</span>
            <span className="craft-ticker-item">◉ GitHub</span>
            <span className="craft-ticker-item">✦ Next.js</span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. BENTO GRID — 6 CORE ARCHITECTURAL PILLARS                        */}
      {/* ==================================================================== */}
      <section className="craft-section" id="features">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">ARCHITECTURAL EXCELLENCE</span>
            <h2 className="craft-section-title">Why Craft Outperforms Generic Builders</h2>
            <p className="craft-section-desc">
              Standard visual builders produce unmaintainable, messy code. Craft builds real semantic DOM structures with automatic responsive intelligence and true backend integration.
            </p>
          </div>

          <div className="craft-bento-grid">
            {/* 1. Responsive Engine */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-indigo">
                  <Monitor size={22} />
                </div>
                <h3 className="craft-card-title">Automatic Responsive Engine</h3>
                <p className="craft-card-desc">
                  Design once. The reflow engine gracefully scales typography, stacks multi-column layouts into single columns on mobile, and adapts margins without awkward line wraps.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">Desktop 1200</span>
                <span className="craft-micro-pill">Tablet 768</span>
                <span className="craft-micro-pill">Mobile 390</span>
              </div>
            </div>

            {/* 2. Semantic Roles */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-purple">
                  <Code2 size={22} />
                </div>
                <h3 className="craft-card-title">True Semantic Role Layer</h3>
                <p className="craft-card-desc">
                  Every box on canvas represents real HTML tags: &lt;button&gt;, &lt;nav&gt;, &lt;header&gt;, &lt;section&gt;, or &lt;form&gt;. Search engines and accessibility screen readers will love your site.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">&lt;button&gt;</span>
                <span className="craft-micro-pill">&lt;nav&gt;</span>
                <span className="craft-micro-pill">&lt;section&gt;</span>
              </div>
            </div>

            {/* 3. Element Locking */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-amber">
                  <Lock size={22} />
                </div>
                <h3 className="craft-card-title">Strict Element Locking</h3>
                <p className="craft-card-desc">
                  Press Cmd+L to lock any element. Once locked, it cannot be accidentally nudged, dragged, or deleted during collaborative editing sessions.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">Cmd+L Quick Lock</span>
                <span className="craft-micro-pill">Zero Nudges</span>
              </div>
            </div>

            {/* 4. Action Engine */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-emerald">
                  <MousePointerClick size={22} />
                </div>
                <h3 className="craft-card-title">Behavior & Action Engine</h3>
                <p className="craft-card-desc">
                  Wire buttons to trigger real interactivity: toast notifications, modal popups, smooth page navigation, and external URL routing with live feedback.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">Click Actions</span>
                <span className="craft-micro-pill">Toasts</span>
                <span className="craft-micro-pill">Modals</span>
              </div>
            </div>

            {/* 5. Supabase Sync */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-cyan">
                  <Database size={22} />
                </div>
                <h3 className="craft-card-title">Native Supabase Database</h3>
                <p className="craft-card-desc">
                  Integrated directly with Supabase Cloud Postgres. User sign-ups and contact submissions sync to public.profiles and public.submissions in real-time.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">Postgres</span>
                <span className="craft-micro-pill">Auth</span>
                <span className="craft-micro-pill">SQLite Fallback</span>
              </div>
            </div>

            {/* 6. Clean Export */}
            <div className="craft-bento-card">
              <div>
                <div className="craft-card-icon-wrap craft-icon-pink">
                  <Sparkles size={22} />
                </div>
                <h3 className="craft-card-title">Standalone HTML/CSS Export</h3>
                <p className="craft-card-desc">
                  Zero vendor lock-in. Click 'Export Code' to download clean, standalone HTML and CSS ready to host on Vercel, Netlify, or any static provider.
                </p>
              </div>
              <div className="craft-pill-cluster">
                <span className="craft-micro-pill">100% Vanilla</span>
                <span className="craft-micro-pill">Zero Runtime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. TRANSPARENT 3-TIER PRICING TABLE                                  */}
      {/* ==================================================================== */}
      <section className="craft-section" id="pricing" style={{ background: '#0a0d16' }}>
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">SIMPLE PRICING</span>
            <h2 className="craft-section-title">Transparent Plans for Every Creator</h2>
            <p className="craft-section-desc">
              Free forever for personal exploration. Upgrade anytime for unlimited projects and live Supabase Cloud persistence.
            </p>
          </div>

          <div className="craft-pricing-grid">
            {/* Starter Plan */}
            <div className="craft-pricing-card">
              <div>
                <span className="craft-plan-name">Starter</span>
                <div className="craft-plan-price">$0</div>
                <div className="craft-plan-cycle">Free forever</div>
                <p className="craft-plan-tagline">Ideal for personal exploration and small landing pages.</p>
                <ul className="craft-feature-list">
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> 3 Active Web Projects</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Drag & Drop Visual Canvas</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Automatic Responsive Engine</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Standalone HTML/CSS Export</li>
                </ul>
              </div>
              <button
                onClick={() => openModal('signup', 'Starter')}
                className="craft-btn-plan outline"
              >
                Sign Up Free
              </button>
            </div>

            {/* Pro Studio Plan (Featured) */}
            <div className="craft-pricing-card featured">
              <span className="craft-popular-badge">Most Popular</span>
              <div>
                <span className="craft-plan-name">Pro Studio</span>
                <div className="craft-plan-price">$29 <span className="craft-plan-cycle">/ month</span></div>
                <p className="craft-plan-tagline">For freelancers, agencies, and high-velocity startups.</p>
                <ul className="craft-feature-list">
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> <strong>Unlimited</strong> Web Projects</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> <strong>Native Supabase Cloud</strong> Sync</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Strict Element Locking (Cmd+L)</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Custom Domains & Edge SSL</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Priority 24/7 Creator Support</li>
                </ul>
              </div>
              <button
                onClick={() => openModal('signup', 'Pro Studio')}
                className="craft-btn-plan primary"
              >
                Start 14-Day Free Trial →
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="craft-pricing-card">
              <div>
                <span className="craft-plan-name">Enterprise</span>
                <div className="craft-plan-price">$99 <span className="craft-plan-cycle">/ month</span></div>
                <p className="craft-plan-tagline">For established product teams and production development.</p>
                <ul className="craft-feature-list">
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Dedicated Postgres Cluster</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> Custom SSO & Team RBAC</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> 99.99% Uptime Guarantee SLA</li>
                  <li className="craft-feature-item"><Check size={16} className="craft-check-icon" /> White-label Client Portals</li>
                </ul>
              </div>
              <button
                onClick={() => openModal('signup', 'Enterprise')}
                className="craft-btn-plan outline"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FAQ ACCORDION                                                     */}
      {/* ==================================================================== */}
      <section className="craft-section" id="faq">
        <div className="craft-container">
          <div className="craft-section-header">
            <span className="craft-section-tag">QUESTIONS & ANSWERS</span>
            <h2 className="craft-section-title">Frequently Asked Questions</h2>
            <p className="craft-section-desc">
              Everything you need to know about Craft Studio, code export, and responsive reflow.
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
                    {isOpen ? <ChevronUp size={18} color="#818cf8" /> : <ChevronDown size={18} color="#64748b" />}
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
      {/* 8. RADIANT FINAL CTA BANNER                                          */}
      {/* ==================================================================== */}
      <section className="craft-section" style={{ paddingBottom: '20px' }}>
        <div className="craft-container">
          <div className="craft-cta-box">
            <h2>Ready to Build Better Websites Visually?</h2>
            <p>
              Join thousands of creators, engineers, and product designers designing with pure semantic precision.
            </p>
            <div className="craft-cta-actions">
              <button
                onClick={() => (currentUser ? onLaunchEditor() : openModal('signup'))}
                className="craft-btn-cta-white"
              >
                {currentUser ? '🚀 Enter Studio Editor →' : '🚀 Sign Up Free & Get Started →'}
              </button>
              <button
                onClick={() => (currentUser ? logout() : openModal('signin'))}
                className="craft-btn-cta-glass"
              >
                {currentUser ? 'Sign Out' : 'Sign In to Studio'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. FOOTER                                                            */}
      {/* ==================================================================== */}
      <footer className="craft-footer">
        <div className="craft-container">
          <div className="craft-footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#818cf8', fontWeight: 800 }}>✦ CRAFT STUDIO</span>
              <span>•</span>
              <span>Design it. Define it. Ship it.</span>
            </div>
            <div>
              © 2026 Craft Visual Website Builder. Built with pure semantic precision.
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 10. INTERACTIVE SIGN UP & SIGN IN MODAL                              */}
      {/* ==================================================================== */}
      {isAuthModalOpen && (
        <div className="craft-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="craft-modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button onClick={() => setIsAuthModalOpen(false)} className="craft-modal-close">
              <X size={16} />
            </button>

            {/* Mode Switcher Tabs */}
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

            {/* Header */}
            <div className="craft-modal-header">
              <h3 className="craft-modal-title">
                {authMode === 'signup' ? 'Create Your Craft Account' : 'Welcome Back to Studio'}
              </h3>
              <p className="craft-modal-sub">
                {authMode === 'signup'
                  ? `Selected Plan: ${selectedPlan} • Instant Supabase Sync`
                  : 'Enter your credentials to access your workspaces.'}
              </p>
            </div>

            {authSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Check size={26} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  {authMode === 'signup' ? 'Account Created Successfully!' : 'Signed In Successfully!'}
                </h4>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Syncing session with Supabase and launching your Visual Studio workspace...
                </p>
              </div>
            ) : (
              <div>
                {/* 1-Click Instant Demo Login Button */}
                <button
                  type="button"
                  onClick={handleQuickDemoAccess}
                  className="craft-demo-access-btn"
                >
                  <Sparkles size={14} color="#fbbf24" />
                  <span>⚡ 1-Click Instant Demo Login (Enter Studio)</span>
                </button>

                {/* Google Sign In */}
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
                  <span>{isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                <div className="craft-divider">
                  <span>or continue with email</span>
                </div>

                {/* Plan Selection in Sign Up Mode */}
                {authMode === 'signup' && (
                  <div className="craft-modal-plans">
                    {[
                      { id: 'Starter', label: 'Starter', price: '$0' },
                      { id: 'Pro Studio', label: 'Pro Studio', price: '$29/mo' },
                      { id: 'Enterprise', label: 'Enterprise', price: '$99/mo' },
                    ].map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p.id)}
                        className={`craft-modal-plan-pill ${selectedPlan === p.id ? 'selected' : ''}`}
                      >
                        <div>{p.label}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{p.price}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Email/Password Form */}
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
                          placeholder="Alex Morgan"
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
                        placeholder="alex@craftstudio.dev"
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
                        placeholder={authMode === 'signup' ? '•••••••• (min 6 characters)' : '••••••••'}
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
                      ? '🚀 Create Account & Enter Studio →'
                      : '🔑 Sign In & Enter Studio →'}
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
