import React, { useState } from 'react';
import {
  ArrowRight,
  User,
  X,
  ChevronDown,
  ChevronUp,
  Smile,
  Layers,
  Globe,
  Palette,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useEditor } from '../../context/useEditor';
import { databaseService } from '../../services/databaseService';
import { KID_STARTER_SITES, MAGIC_THEMES, type KidStarterSite, type MagicThemePalette } from '../../constants/kidTemplates';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';
import { GummyMascot } from '../Gummy/GummyMascot';
import { PickleCorpLogo, PickleTorchSvg } from '../Brand/PickleCorpLogo';
import './ProductLandingPage.css';

interface ProductLandingPageProps {
  onLaunchEditor: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({ onLaunchEditor }) => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    showToast,
    addElements,
    updatePageSettings,
    setEditorComplexity,
  } = useEditor();

  // Interactive Starter Kit Showcase State
  const [selectedKitIndex, setSelectedKitIndex] = useState<number>(0);
  const [activeTheme, setActiveTheme] = useState<MagicThemePalette>(MAGIC_THEMES[0]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const currentKit: KidStarterSite = KID_STARTER_SITES[selectedKitIndex] || KID_STARTER_SITES[0];

  // Handler to load selected kit directly into the studio editor
  const handleLaunchWithKit = (site: KidStarterSite) => {
    playSound('pop');
    triggerConfetti();
    const elements = site.createElements();
    updatePageSettings('page_home', {
      backgroundColor:
        site.id === 'site-lemonade'
          ? '#1c1917'
          : site.id === 'site-science'
          ? '#0c1222'
          : site.id === 'site-pet'
          ? '#111827'
          : '#0d1117',
    });
    addElements(elements, true, true);
    setEditorComplexity('simple');
    showToast(`Loaded ${site.title}! Opening Studio... 🚀`, 'success');
    onLaunchEditor();
  };

  // Google OAuth
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

  // Demo Login (Azan / Pickle Corp)
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

  // Email Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      if (authMode === 'signup') {
        const cleanName = authName.trim() || authEmail.split('@')[0];
        const res = await databaseService.signup({
          name: cleanName,
          email: authEmail.trim(),
          password: authPassword || 'password123',
          plan: 'Pickle Corp Unlocked ($0.00)',
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          showToast(`Account created! Welcome, ${res.user.name}!`, 'success');
          setIsAuthModalOpen(false);
          onLaunchEditor();
        } else {
          showToast(res.message || 'Sign up failed', 'warning');
        }
      } else {
        const res = await databaseService.signin({
          email: authEmail.trim(),
          password: authPassword || 'password123',
        });
        if (res.success && res.user) {
          setCurrentUser(res.user);
          showToast(`Welcome back, ${res.user.name}!`, 'success');
          setIsAuthModalOpen(false);
          onLaunchEditor();
        } else {
          showToast(res.message || 'Sign in failed', 'warning');
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
      q: 'Is Pickle Studio genuinely 100% free with all features?',
      a: 'Yes. In the official spirit of Pickle Corp ("Cash declined. Zero fiat. $0.00 invoices"), all starter kits, visual canvas tools, live publishing, and code exports are completely unlocked for everyone. No credit cards, no tier gates.',
    },
    {
      q: 'Can I export clean standalone code and host it anywhere?',
      a: 'Yes. With one click, download production-ready, standalone semantic HTML5 & CSS with zero runtime dependencies. For developers, Pickle Studio also generates a complete Next.js 15 & React Tailwind ZIP package.',
    },
    {
      q: 'Do I need an account to create and publish a website?',
      a: 'No. You can open the studio right now, pick a starter kit, customize words and colors, and publish a live link immediately without giving us your email.',
    },
    {
      q: 'Why did you choose not to use AI-generated designs?',
      a: 'Because AI website builders produce generic purple gradient sludge, unreadable typography, and fragile div soup that looks identical to every other generated site. Pickle Studio gives you human authorship, spatial precision, and clean code you actually own.',
    },
    {
      q: 'Who built Pickle Studio?',
      a: 'Pickle Studio is engineered by Azan & Thanvi — two 14-year-old builders running Pickle Corp™, an independent freelance studio paid strictly in favors. Studio mascot: Gummy (a flat mint gumdrop appointed to management).',
    },
  ];

  return (
    <div className="pickle-landing">
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="pickle-nav">
        <div className="pickle-container pickle-nav-inner">
          <div className="pickle-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="pickle-brand-glyph" title="Pickle Corp™ Official Torch">
              <PickleTorchSvg size={26} theme="dark" className="pickle-nav-torch" />
            </div>
            <div>
              <div className="pickle-brand-name">pickle studio</div>
              <div className="pickle-brand-byline">BY PICKLE CORP™ • ZERO CODE • ZERO SLOP</div>
            </div>
          </div>

          <nav className="pickle-nav-links">
            <a href="#showcase" className="pickle-nav-link">Explore templates</a>
            <a href="#how-it-works" className="pickle-nav-link">How it works</a>
            <a href="#anti-slop" className="pickle-nav-link">Why no AI</a>
            <a href="#story" className="pickle-nav-link">The Story</a>
            <a href="#faq" className="pickle-nav-link">FAQ</a>
          </nav>

          <div className="pickle-nav-actions">
            {currentUser ? (
              <div className="pickle-user-group">
                <span className="pickle-user-name">👋 {currentUser.name}</span>
                <button onClick={onLaunchEditor} className="pickle-btn-primary-sm">
                  <span>Enter Studio</span>
                  <ArrowRight size={13} />
                </button>
                <button onClick={logout} className="pickle-btn-ghost-sm">Sign Out</button>
              </div>
            ) : (
              <>
                <button onClick={() => { setAuthMode('signin'); setIsAuthModalOpen(true); }} className="pickle-btn-ghost-sm">
                  <User size={13} />
                  <span>Sign In</span>
                </button>
                <button onClick={onLaunchEditor} className="pickle-btn-primary-sm">
                  <span>Start creating</span>
                  <ArrowRight size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="pickle-hero-section">
        <div className="pickle-container pickle-hero-grid">
          {/* Left Column: Authentic Value Proposition */}
          <div className="pickle-hero-content">
            <div className="pickle-eyebrow">
              <span className="pickle-eyebrow-dot" />
              <span>A PICKLE CORP™ PRODUCT</span>
              <span className="pickle-eyebrow-sep">/</span>
              <span>PAID STRICTLY IN FAVORS</span>
            </div>

            <h1 className="pickle-hero-title">
              Make something <br />
              <span className="pickle-hero-title-accent">that feels like you.</span>
            </h1>

            <p className="pickle-hero-subtitle">
              Build your website. Your way. No code, no AI-generated designs.
            </p>

            <div className="pickle-subkicker">
              Creative freedom, without the complexity.
            </div>

            <div className="pickle-hero-cta-group">
              <button onClick={onLaunchEditor} className="pickle-btn-hero-primary">
                <span>Start creating</span>
                <ArrowRight size={15} />
              </button>

              <a href="#showcase" className="pickle-btn-hero-secondary">
                <span>Explore templates</span>
              </a>
            </div>

            {/* Proof Points */}
            <div className="pickle-proof-row">
              <div className="pickle-proof-chip">
                <CheckCircle2 size={13} className="text-lime" />
                <span>No sign-up required</span>
              </div>
              <div className="pickle-proof-chip">
                <CheckCircle2 size={13} className="text-lime" />
                <span>Real clean HTML & Next.js export</span>
              </div>
              <div className="pickle-proof-chip">
                <CheckCircle2 size={13} className="text-lime" />
                <span>1-Click live publishing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Signature Artifact (Interactive Starter Kit Showcase) */}
          <div className="pickle-showcase-card" id="showcase">
            <div className="pickle-showcase-header">
              <div className="pickle-showcase-title-row">
                <span className="pickle-showcase-badge">Interactive Preview</span>
                <span className="pickle-showcase-tip">Click a kit below to inspect</span>
              </div>

              {/* Kit Switcher Tabs */}
              <div className="pickle-kit-tabs">
                {KID_STARTER_SITES.map((kit, idx) => (
                  <button
                    key={kit.id}
                    onClick={() => {
                      playSound('pop');
                      setSelectedKitIndex(idx);
                    }}
                    className={`pickle-kit-tab ${selectedKitIndex === idx ? 'active' : ''}`}
                  >
                    <span>{kit.emoji}</span>
                    <span>{kit.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Interactive Preview Canvas */}
            <div
              className="pickle-showcase-viewport"
              style={{ backgroundColor: activeTheme.canvasBg }}
            >
              {/* Simulated Site Header Card */}
              <div
                className="pickle-preview-hero-card"
                style={{
                  backgroundColor: activeTheme.cardBg,
                  borderColor: activeTheme.cardBorder,
                }}
              >
                <div
                  className="pickle-preview-pill"
                  style={{
                    backgroundColor: `${activeTheme.accentColor}22`,
                    color: activeTheme.accentText,
                    borderColor: `${activeTheme.accentColor}44`,
                  }}
                >
                  {currentKit.badge} • 100% HUMAN MADE
                </div>

                <h3 className="pickle-preview-title" style={{ color: activeTheme.textColor }}>
                  {currentKit.title}
                </h3>

                <p className="pickle-preview-desc" style={{ color: activeTheme.subtextColor }}>
                  {currentKit.description}
                </p>

                <div className="pickle-preview-btn-row">
                  <button
                    onClick={() => {
                      playSound('pop');
                      triggerConfetti();
                      showToast(`🎉 Confetti burst triggered on ${currentKit.title}!`, 'success');
                    }}
                    className="pickle-preview-action-btn"
                    style={{
                      backgroundColor: activeTheme.buttonBg,
                      color: activeTheme.buttonText,
                    }}
                  >
                    <span>{currentKit.id === 'site-gaming' ? '🔥 Join Game Club' : currentKit.id === 'site-pet' ? '🦴 Give Virtual Treat' : currentKit.id === 'site-lemonade' ? '🍋 Order Fresh Lemonade' : '🚀 Vote for Science Project'}</span>
                  </button>
                  <span className="pickle-preview-btn-hint">(Click to trigger confetti!)</span>
                </div>
              </div>

              {/* Theme Palette Bar */}
              <div className="pickle-palette-bar">
                <span className="pickle-palette-label">
                  <Palette size={12} />
                  <span>Magic Theme:</span>
                </span>
                <div className="pickle-palette-swatches">
                  {MAGIC_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        playSound('pop');
                        setActiveTheme(theme);
                      }}
                      className={`pickle-palette-btn ${activeTheme.id === theme.id ? 'active' : ''}`}
                      title={theme.name}
                      style={{ backgroundColor: theme.buttonBg }}
                    >
                      <span className="pickle-palette-emoji">{theme.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Showcase Footer Action */}
            <div className="pickle-showcase-footer">
              <div className="pickle-showcase-summary">
                <span className="font-semibold text-white">{currentKit.title}</span>
                <span className="text-xs text-zinc-400">Ready to edit, customize, and publish</span>
              </div>
              <button
                onClick={() => handleLaunchWithKit(currentKit)}
                className="pickle-btn-open-kit"
              >
                <span>Open in Studio →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: The 3-Step Human Craft Workflow ─────────────────── */}
      <section className="pickle-section" id="how-it-works">
        <div className="pickle-container">
          <div className="pickle-section-header">
            <span className="pickle-section-kicker">HOW IT WORKS</span>
            <h2 className="pickle-section-title">From zero to live website in 3 tactile steps.</h2>
            <p className="pickle-section-desc">
              No terminal setup, no hosting fees, and no AI prompt roulette. You stay in the driver's seat.
            </p>
          </div>

          <div className="pickle-steps-grid">
            {/* Step 1 */}
            <div className="pickle-step-card">
              <div className="pickle-step-num">01</div>
              <div className="pickle-step-icon-wrap">
                <Layers size={20} className="text-emerald" />
              </div>
              <h3 className="pickle-step-title">Pick a Kit or Snap Lego Blocks</h3>
              <p className="pickle-step-body">
                Start with an instant complete starter kit (Gamer Hub, Pet Club, Lemonade Stand, Science Project) or snap together pre-designed Lego sections: friendly hero banners, 3-card grids, message guestbooks, live voting polls, and reaction buttons.
              </p>
            </div>

            {/* Step 2 */}
            <div className="pickle-step-card">
              <div className="pickle-step-num">02</div>
              <div className="pickle-step-icon-wrap">
                <Smile size={20} className="text-amber" />
              </div>
              <h3 className="pickle-step-title">Simple Mode or Pro Mode</h3>
              <p className="pickle-step-body">
                Beginners get <strong>Simple Mode</strong>: big friendly buttons, 1-click magic color themes, curated safe photos, and simple font sizing. Power users can switch to <strong>Pro Mode</strong> anytime for Figma-style magnetic snapping, layer trees, and custom CSS hover states.
              </p>
            </div>

            {/* Step 3 */}
            <div className="pickle-step-card">
              <div className="pickle-step-num">03</div>
              <div className="pickle-step-icon-wrap">
                <Globe size={20} className="text-cyan" />
              </div>
              <h3 className="pickle-step-title">Publish Live or Export Pure Code</h3>
              <p className="pickle-step-body">
                Hit "Publish" for an instant, verified shareable web address (<code className="pickle-code-chip">/?p=your-slug</code>). Want to self-host? Click "Export" to download 100% standalone HTML5 & CSS or a full Next.js 15 Tailwind package. Zero vendor lock-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Anti-Slop Manifesto (Why We Refuse AI) ─────────── */}
      <section className="pickle-section pickle-manifesto-section" id="anti-slop">
        <div className="pickle-container">
          <div className="pickle-section-header">
            <span className="pickle-section-kicker">THE ANTI-SLOP MANIFESTO</span>
            <h2 className="pickle-section-title">Why we refuse AI-generated design.</h2>
            <p className="pickle-section-desc">
              Every AI website builder follows the exact same playbook: purple gradients, hallucinated text, and $29/month subscriptions. We built the antidote.
            </p>
          </div>

          <div className="pickle-comparison-grid">
            {/* The AI Slop Column */}
            <div className="pickle-compare-card pickle-compare-slop">
              <div className="pickle-compare-badge slop-badge">Generic AI Builders</div>
              <ul className="pickle-compare-list">
                <li>✕ Monotonous indigo-to-purple gradient hero banners on every template</li>
                <li>✕ Hallucinated buzzwords: "Delve into our seamless tapestry of innovation"</li>
                <li>✕ Centered 2-button formula that looks like every other SaaS pitch</li>
                <li>✕ Fragile nested <code className="pickle-code-chip">&lt;div&gt;</code> soup with bloated runtime scripts</li>
                <li>✕ $29/month subscription paywalls just to connect a domain or export code</li>
              </ul>
            </div>

            {/* The Pickle Studio Column */}
            <div className="pickle-compare-card pickle-compare-craft">
              <div className="pickle-compare-badge craft-badge">Pickle Studio</div>
              <ul className="pickle-compare-list">
                <li>✓ Authorship & soul: You decide the colors, layout, and personality</li>
                <li>✓ Concrete human copy: Real words written by real people</li>
                <li>✓ Playful, tactile components: Real confetti pops, live voting polls, and sound effects</li>
                <li>✓ Clean semantic HTML5 (<code className="pickle-code-chip">&lt;button&gt;</code>, <code className="pickle-code-chip">&lt;section&gt;</code>, <code className="pickle-code-chip">&lt;nav&gt;</code>)</li>
                <li>✓ 100% Free Forever: Zero fiat, $0.00 invoices, no credit card required</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: The Story of Pickle Corp ───────────────────────── */}
      <section className="pickle-section pickle-story-section" id="story">
        <div className="pickle-container">
          <div className="pickle-story-box">
            <div className="pickle-story-makers-column">
              {/* Official Pickle Corp Logo Badge */}
              <div className="pickle-corp-story-badge-wrap">
                <PickleCorpLogo variant="badge" title="Official Pickle Corp™ Studio Seal" />
                <span className="pickle-corp-badge-caption">Official Studio Seal</span>
              </div>

              {/* Studio Mascot Gummy */}
              <div className="pickle-story-mascot">
                <div className="pickle-mascot-avatar">
                  <GummyMascot
                    size="lg"
                    showSpeech={true}
                    interactive={true}
                    colorTheme="classic"
                    enableSound={true}
                    enableConfetti={true}
                    title="Gummy: Poke, click, or double-click to backflip!"
                  />
                </div>
                <span className="pickle-mascot-badge">Studio Mascot</span>
                <span className="pickle-mascot-label">GUMMY</span>
                <span className="pickle-mascot-sub">Appointed to Management • Paid in Favors</span>
                <span className="pickle-mascot-hint">✨ Poke, click, or backflip!</span>
              </div>
            </div>

            <div className="pickle-story-text">
              <span className="pickle-section-kicker">ABOUT THE MAKERS</span>
              <h2 className="pickle-story-title">Built by two 14-year-old builders who refuse monthly retainers.</h2>
              <p className="pickle-story-p">
                Pickle Studio is engineered by <strong>Azan &amp; Thanvi</strong> — two 14-year-old builders who run <a href="https://azanabdullah2752012-ui.github.io/pickle-corp/" target="_blank" rel="noopener noreferrer" className="pickle-corp-link">Pickle Corp™ ↗</a>, an independent freelance studio paid strictly in favors.
              </p>
              <p className="pickle-story-p">
                We built Pickle Studio because we needed a visual website maker that outputs clean, production-grade code without corporate bloat, monthly invoices, or synthetic AI sludge. We use it ourselves to build projects for our friends, and we unlocked every single feature for you.
              </p>

              <div className="pickle-story-quote">
                <em className="pickle-editorial-serif">“Cash declined. Zero fiat. $0.00 invoices. We made this for human creators.”</em>
              </div>

              <div className="pickle-story-colophon-foot">
                <PickleCorpLogo variant="full" height={22} theme="dark" />
                <span className="pickle-story-colophon-badge">EST. 2026 • INDEPENDENT FREELANCE STUDIO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Frequently Asked Questions ─────────────────────── */}
      <section className="pickle-section" id="faq">
        <div className="pickle-container">
          <div className="pickle-section-header">
            <span className="pickle-section-kicker">QUESTIONS & ANSWERS</span>
            <h2 className="pickle-section-title">Everything you need to know.</h2>
          </div>

          <div className="pickle-faq-list">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="pickle-faq-item">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="pickle-faq-question"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="pickle-faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 6: Final CTA Banner ───────────────────────────────── */}
      <section className="pickle-cta-banner">
        <div className="pickle-container text-center">
          <h2 className="pickle-cta-title">Make something that feels like you.</h2>
          <p className="pickle-cta-desc">
            Build your website. Your way. No code, no AI-generated designs.
          </p>
          <button onClick={onLaunchEditor} className="pickle-btn-cta-hero">
            <span>Start creating</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="pickle-footer">
        <div className="pickle-container pickle-footer-inner">
          <div className="pickle-footer-col">
            <div className="pickle-brand-row">
              <PickleTorchSvg size={22} theme="dark" />
              <span className="font-bold text-white tracking-wide">PICKLE STUDIO</span>
              <span className="pickle-footer-corp-tag">BY PICKLE CORP™</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              © 2026 Pickle Corp. Azan &amp; Thanvi. Paid strictly in favors.
            </p>
          </div>

          <div className="pickle-footer-chips">
            <a href="https://azanabdullah2752012-ui.github.io/pickle-corp/" target="_blank" rel="noopener noreferrer" className="pickle-footer-chip pickle-footer-parent-link">
              <PickleTorchSvg size={14} theme="dark" style={{ marginRight: 6 }} />
              <span>Pickle Corp Studio ↗</span>
            </a>
            <span className="pickle-footer-chip">Keyboard shortcuts: ⌘↵ launch, ⌘K commands</span>
            <span className="pickle-footer-chip">0% AI Slop • 100% Semantic HTML</span>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal (Optional Sign In / Sign Up) ──────────────────── */}
      {isAuthModalOpen && (
        <div className="pickle-modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="pickle-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pickle-modal-header">
              <h3 className="pickle-modal-title">
                {authMode === 'signup' ? 'Create Free Account' : 'Welcome Back'}
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="pickle-modal-close">
                <X size={16} />
              </button>
            </div>

            <p className="pickle-modal-desc">
              Accounts are completely optional. They allow you to sync your websites across devices via Supabase.
            </p>

            {/* Quick Demo Access Button */}
            <button onClick={handleQuickDemoAccess} className="pickle-btn-demo-login">
              <Sparkles size={14} className="text-amber" />
              <span>1-Click Instant Demo Access (Azan Abdullah)</span>
            </button>

            <div className="pickle-divider">
              <span>OR USE GOOGLE / EMAIL</span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting}
              className="pickle-btn-google"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <form onSubmit={handleAuthSubmit} className="pickle-auth-form">
              {authMode === 'signup' && (
                <div className="pickle-input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}
              <div className="pickle-input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
              <div className="pickle-input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="pickle-btn-auth-submit">
                {isSubmitting ? 'Processing...' : authMode === 'signup' ? 'Create Free Account' : 'Sign In'}
              </button>
            </form>

            <div className="pickle-auth-switch">
              {authMode === 'signup' ? (
                <span>
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('signin')}>Sign in here</button>
                </span>
              ) : (
                <span>
                  New to Pickle Studio?{' '}
                  <button onClick={() => setAuthMode('signup')}>Create free account</button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
