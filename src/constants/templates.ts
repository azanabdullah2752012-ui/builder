import type { CanvasElement } from '../types/editor';
import { createElement } from './defaults';

export interface SectionTemplate {
  id: string;
  name: string;
  category: 'hero' | 'features' | 'pricing' | 'social' | 'faq' | 'cta' | 'footer' | 'nav' | 'auth';
  categoryLabel: string;
  description: string;
  badge?: string;
  iconName: string;
  previewGradient: string;
  create: (offsetY?: number) => CanvasElement[];
}

/**
 * Helper to calculate the lowest element on the canvas to place new sections cleanly below
 */
export function getSmartSectionOffsetY(elements: CanvasElement[], defaultOffset = 40): number {
  if (!elements || elements.length === 0) return defaultOffset;
  const maxBottom = elements.reduce((max, el) => Math.max(max, el.y + el.height), 0);
  return maxBottom + 40;
}

/* ========================================================================== */
/* 1. HERO CENTRED TEMPLATE                                                   */
/* ========================================================================== */
export function createHeroSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'SaaS Hero (Centered)';
  section.width = 1120;
  section.height = 380;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: { top: 48, right: 40, bottom: 48, left: 40 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#121624',
    borderColor: '#242c3e',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
  };

  const badge = createElement('text', 440, offsetY + 35, 1, section.id);
  badge.name = 'Hero Badge';
  badge.content = '✨ NEXT-GENERATION VISUAL ENGINE';
  badge.width = 240;
  badge.height = 28;
  badge.styles = {
    ...badge.styles,
    fontSize: 10,
    fontWeight: 700,
    color: '#a5b4fc',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 9999,
    textAlign: 'center',
    lineHeight: 2.2,
  };

  const title = createElement('text', 80, offsetY + 75, 1, section.id);
  title.name = 'Hero Headline';
  title.content = 'Build High-Impact Websites Visually';
  title.width = 820;
  title.height = 58;
  title.styles = {
    ...title.styles,
    fontSize: 38,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 1.15,
  };
  title.responsive = {
    desktop: { mode: 'auto' },
    tablet: { mode: 'auto' },
    mobile: { mode: 'full-width' },
    locked: false,
  };

  const subtitle = createElement('text', 80, offsetY + 145, 1, section.id);
  subtitle.name = 'Hero Subtitle';
  subtitle.content = 'Precise visual canvas, explicit responsive control, and clean production HTML/CSS export.';
  subtitle.width = 680;
  subtitle.height = 44;
  subtitle.styles = {
    ...subtitle.styles,
    fontSize: 15,
    fontWeight: 400,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.45,
  };
  subtitle.responsive = {
    desktop: { mode: 'auto' },
    tablet: { mode: 'auto' },
    mobile: { mode: 'full-width' },
    locked: false,
  };

  const ctaGroup = createElement('container', 370, offsetY + 205, 1, section.id);
  ctaGroup.name = 'Hero Actions Group';
  ctaGroup.width = 380;
  ctaGroup.height = 48;
  ctaGroup.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    responsiveDirection: { tablet: 'row', mobile: 'column' },
  };
  ctaGroup.styles = {
    ...ctaGroup.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  };

  const primaryBtn = createElement('button', 370, offsetY + 205, 2, ctaGroup.id);
  primaryBtn.name = 'Primary CTA Button';
  primaryBtn.content = 'Start Free Trial →';
  primaryBtn.width = 180;
  primaryBtn.height = 46;
  primaryBtn.styles = {
    ...primaryBtn.styles,
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: 8,
    fontWeight: 600,
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
  };
  primaryBtn.behavior = {
    actionType: 'navigate-page',
    actionPayload: 'page_signup',
    hoverStyles: {
      scale: 1.03,
      backgroundColor: '#6366f1',
    },
  };

  const secondaryBtn = createElement('button', 562, offsetY + 205, 2, ctaGroup.id);
  secondaryBtn.name = 'Secondary CTA Button';
  secondaryBtn.content = 'Learn More';
  secondaryBtn.width = 140;
  secondaryBtn.height = 46;
  secondaryBtn.styles = {
    ...secondaryBtn.styles,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderStyle: 'solid',
    color: '#e2e8f0',
    borderRadius: 8,
    fontWeight: 500,
  };
  secondaryBtn.behavior = {
    actionType: 'navigate-url',
    actionPayload: '#features',
    hoverStyles: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
  };

  ctaGroup.children = [primaryBtn.id, secondaryBtn.id];
  section.children = [badge.id, title.id, subtitle.id, ctaGroup.id];
  return [section, badge, title, subtitle, ctaGroup, primaryBtn, secondaryBtn];
}

/* ========================================================================== */
/* 2. HERO SPLIT WITH UI CARD MOCKUP                                         */
/* ========================================================================== */
export function createHeroSplitSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Split Hero with UI Mockup';
  section.width = 1120;
  section.height = 440;
  section.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 32,
    padding: { top: 40, right: 40, bottom: 40, left: 40 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#111522',
    borderColor: '#242c3e',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
  };

  const leftCol = createElement('container', 60, offsetY + 50, 1, section.id);
  leftCol.name = 'Hero Left Column';
  leftCol.width = 540;
  leftCol.height = 340;
  leftCol.styles = {
    ...leftCol.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  };
  leftCol.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'start',
    alignItems: 'start',
    justify: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
  };

  const badge = createElement('text', 60, offsetY + 60, 2, leftCol.id);
  badge.name = 'Launch Tag';
  badge.content = '✦ DEPLOY STUNNING SITES';
  badge.width = 180;
  badge.height = 26;
  badge.styles = {
    ...badge.styles,
    fontSize: 10,
    fontWeight: 700,
    color: '#38bdf8',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.35)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 9999,
    textAlign: 'center',
    lineHeight: 2.1,
  };

  const title = createElement('text', 60, offsetY + 100, 2, leftCol.id);
  title.name = 'Split Headline';
  title.content = 'Visual Freedom Meets Semantic Code';
  title.width = 520;
  title.height = 84;
  title.styles = {
    ...title.styles,
    fontSize: 34,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
    lineHeight: 1.2,
  };

  const subtitle = createElement('text', 60, offsetY + 195, 2, leftCol.id);
  subtitle.name = 'Split Description';
  subtitle.content = 'Assemble responsive layouts without wrestling code. Export clean HTML & CSS whenever you are ready.';
  subtitle.width = 480;
  subtitle.height = 44;
  subtitle.styles = {
    ...subtitle.styles,
    fontSize: 14,
    fontWeight: 400,
    color: '#94a3b8',
    lineHeight: 1.5,
  };

  const cta = createElement('button', 60, offsetY + 255, 2, leftCol.id);
  cta.name = 'Explore Action';
  cta.content = 'Explore Showcase →';
  cta.width = 170;
  cta.height = 44;
  cta.styles = {
    ...cta.styles,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderRadius: 8,
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
  };

  leftCol.children = [badge.id, title.id, subtitle.id, cta.id];

  const rightMockup = createElement('container', 620, offsetY + 40, 1, section.id);
  rightMockup.name = 'UI Preview Mockup';
  rightMockup.width = 460;
  rightMockup.height = 340;
  rightMockup.role = 'card';
  rightMockup.styles = {
    ...rightMockup.styles,
    backgroundColor: '#0c0f17',
    borderColor: '#263148',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  };
  rightMockup.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'start',
    alignItems: 'start',
    justify: 'start',
    justifyContent: 'start',
    gap: 14,
    padding: { top: 20, right: 20, bottom: 20, left: 20 },
  };

  const mockupBar = createElement('text', 640, offsetY + 60, 2, rightMockup.id);
  mockupBar.name = 'Card Status Header';
  mockupBar.content = '🟢 System Status: Active • 99.9% Uptime';
  mockupBar.width = 380;
  mockupBar.height = 24;
  mockupBar.styles = {
    ...mockupBar.styles,
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#34d399',
  };

  const mockupTitle = createElement('text', 640, offsetY + 95, 2, rightMockup.id);
  mockupTitle.name = 'Mockup Title';
  mockupTitle.content = 'Realtime Architecture Metrics';
  mockupTitle.width = 380;
  mockupTitle.height = 28;
  mockupTitle.styles = {
    ...mockupTitle.styles,
    fontSize: 16,
    fontWeight: 700,
    color: '#ffffff',
  };

  const mockupBody = createElement('text', 640, offsetY + 130, 2, rightMockup.id);
  mockupBody.name = 'Mockup Stats';
  mockupBody.content = '✦ Global Edge CDN: 240+ Locations\n✦ Latency: 18ms\n✦ Zero Cold Starts\n✦ Automated Semantic Verification';
  mockupBody.width = 400;
  mockupBody.height = 100;
  mockupBody.styles = {
    ...mockupBody.styles,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: '#94a3b8',
    lineHeight: 1.8,
  };

  rightMockup.children = [mockupBar.id, mockupTitle.id, mockupBody.id];
  section.children = [leftCol.id, rightMockup.id];

  return [section, leftCol, badge, title, subtitle, cta, rightMockup, mockupBar, mockupTitle, mockupBody];
}

/* ========================================================================== */
/* 3. NAVIGATION BAR                                                          */
/* ========================================================================== */
export function createNavbarSection(offsetY = 24): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Floating Glass Navbar';
  section.width = 1120;
  section.height = 64;
  section.role = 'navigation';
  section.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 16,
    padding: { top: 14, right: 28, bottom: 14, left: 28 },
    responsiveDirection: { tablet: 'row', mobile: 'row' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#11141d',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#232c3f',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  };

  const logo = createElement('text', 68, offsetY + 16, 1, section.id);
  logo.name = 'Brand Logo';
  logo.content = '✦ CRAFT STUDIO';
  logo.width = 180;
  logo.height = 32;
  logo.styles = {
    ...logo.styles,
    fontSize: 15,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    color: '#ffffff',
  };

  const navButton = createElement('button', 950, offsetY + 12, 1, section.id);
  navButton.name = 'Nav CTA Button';
  navButton.content = 'Get Started';
  navButton.width = 120;
  navButton.height = 38;
  navButton.styles = {
    ...navButton.styles,
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
  };

  section.children = [logo.id, navButton.id];
  return [section, logo, navButton];
}

/* ========================================================================== */
/* 4. 3-COLUMN FEATURE GRID                                                   */
/* ========================================================================== */
export function createFeatureGridSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = '3-Column Benefit Cards';
  section.width = 1120;
  section.height = 360;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'start',
    justifyContent: 'start',
    gap: 24,
    padding: { top: 32, right: 32, bottom: 32, left: 32 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
  };

  const header = createElement('text', 80, offsetY, 1, section.id);
  header.name = 'Section Header';
  header.content = 'Everything You Need to Ship High-Impact Web Apps';
  header.width = 800;
  header.height = 40;
  header.styles = {
    ...header.styles,
    fontSize: 26,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const cardsRow = createElement('container', 40, offsetY + 60, 1, section.id);
  cardsRow.name = 'Feature Cards Row';
  cardsRow.width = 1120;
  cardsRow.height = 250;
  cardsRow.styles = {
    ...cardsRow.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  };
  cardsRow.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 20,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };

  const cardsData = [
    { title: '⚡ Visual Precision', desc: 'Drag, resize, and align elements with smart magnetic snap guides.' },
    { title: '💎 Semantic Roles', desc: 'Real HTML5 buttons, cards, links, and forms with zero code clutter.' },
    { title: '📱 Fluid Responsive', desc: 'Automatic mobile reflow plus explicit per-breakpoint overrides.' },
  ];

  const cards: CanvasElement[] = [];
  const cardIds: string[] = [];

  cardsData.forEach((c, idx) => {
    const card = createElement('container', 60 + idx * 360, offsetY + 75, 2, cardsRow.id);
    card.name = `Feature Card ${idx + 1}`;
    card.width = 330;
    card.height = 190;
    card.role = 'card';
    card.layout = {
      layoutType: 'flex',
      direction: 'column',
      align: 'start',
      alignItems: 'start',
      justify: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    };
    card.styles = {
      ...card.styles,
      backgroundColor: '#141824',
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#242c3e',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    };
    card.behavior = {
      actionType: 'none',
      hoverStyles: {
        borderColor: '#6366f1',
        scale: 1.02,
      },
    };
    card.content = `${c.title}\n\n${c.desc}`;
    card.responsive = {
      desktop: { mode: 'auto' },
      tablet: { mode: 'stack' },
      mobile: { mode: 'stack' },
      locked: false,
    };
    cards.push(card);
    cardIds.push(card.id);
  });

  cardsRow.children = cardIds;
  section.children = [header.id, cardsRow.id];

  return [section, header, cardsRow, ...cards];
}

/* ========================================================================== */
/* 5. 3-TIER PRICING TABLE                                                    */
/* ========================================================================== */
export function createPricingSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = '3-Tier Pricing Table';
  section.width = 1120;
  section.height = 540;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'start',
    justifyContent: 'start',
    gap: 24,
    padding: { top: 32, right: 32, bottom: 32, left: 32 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
  };

  const header = createElement('text', 80, offsetY, 1, section.id);
  header.name = 'Pricing Title';
  header.content = 'Transparent Pricing Built to Scale With You';
  header.width = 800;
  header.height = 40;
  header.styles = {
    ...header.styles,
    fontSize: 26,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const cardsRow = createElement('container', 40, offsetY + 60, 1, section.id);
  cardsRow.name = 'Pricing Cards Row';
  cardsRow.width = 1120;
  cardsRow.height = 420;
  cardsRow.styles = {
    ...cardsRow.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  };
  cardsRow.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 20,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };

  const plans = [
    {
      name: 'Starter Plan',
      badge: 'FREE',
      price: '$0',
      desc: 'Free forever for solo creators & side projects.\n\n✓ Up to 3 Projects\n✓ Pure HTML/CSS Export\n✓ Community Support',
      isPopular: false,
      btnText: 'Start Free',
    },
    {
      name: 'Pro Plan',
      badge: 'POPULAR',
      price: '$29',
      desc: 'Everything you need to design & ship production sites.\n\n✓ Unlimited Projects\n✓ Custom Domains & React Export\n✓ 24/7 Priority Support',
      isPopular: true,
      btnText: 'Upgrade to Pro →',
    },
    {
      name: 'Enterprise Plan',
      badge: 'CUSTOM',
      price: '$99',
      desc: 'Tailored infrastructure & SLAs for high-growth teams.\n\n✓ Dedicated Cloud Node\n✓ Custom Team Roles & SSO\n✓ Custom Contract & SLA',
      isPopular: false,
      btnText: 'Contact Sales',
    },
  ];

  const cards: CanvasElement[] = [];
  const cardIds: string[] = [];

  plans.forEach((p, idx) => {
    const card = createElement('container', 60 + idx * 360, offsetY + 75, 2, cardsRow.id);
    card.name = p.name;
    card.width = 330;
    card.height = 380;
    card.role = 'card';
    card.layout = {
      layoutType: 'flex',
      direction: 'column',
      align: 'start',
      alignItems: 'start',
      justify: 'space-between',
      justifyContent: 'space-between',
      gap: 16,
      padding: { top: 28, right: 28, bottom: 28, left: 28 },
    };
    card.styles = {
      ...card.styles,
      backgroundColor: p.isPopular ? '#151b2c' : '#121622',
      borderRadius: 16,
      borderWidth: p.isPopular ? 2 : 1,
      borderStyle: 'solid',
      borderColor: p.isPopular ? '#6366f1' : '#232c3f',
      boxShadow: p.isPopular
        ? '0 12px 32px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 8px 24px rgba(0, 0, 0, 0.2)',
    };
    card.content = `${p.badge} • ${p.name}\n\n${p.price} / month\n\n${p.desc}`;

    cards.push(card);
    cardIds.push(card.id);
  });

  cardsRow.children = cardIds;
  section.children = [header.id, cardsRow.id];

  return [section, header, cardsRow, ...cards];
}

/* ========================================================================== */
/* 6. SOCIAL PROOF & TESTIMONIALS                                             */
/* ========================================================================== */
export function createTestimonialsSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Client Testimonials Grid';
  section.width = 1120;
  section.height = 360;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'start',
    justifyContent: 'start',
    gap: 20,
    padding: { top: 32, right: 32, bottom: 32, left: 32 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'none',
  };

  const header = createElement('text', 80, offsetY, 1, section.id);
  header.name = 'Testimonials Title';
  header.content = 'Loved by Over 10,000+ Fast-Moving Designers';
  header.width = 800;
  header.height = 36;
  header.styles = {
    ...header.styles,
    fontSize: 24,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const cardsRow = createElement('container', 40, offsetY + 55, 1, section.id);
  cardsRow.name = 'Testimonials Cards Row';
  cardsRow.width = 1120;
  cardsRow.height = 250;
  cardsRow.styles = {
    ...cardsRow.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
    boxShadow: 'none',
  };
  cardsRow.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 20,
    padding: { top: 12, right: 12, bottom: 12, left: 12 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };

  const quotes = [
    {
      stars: '★★★★★',
      text: '"The visual agility of Framer combined with the structural cleanliness of hand-written code."',
      author: 'Sarah Jenkins • VP of Product',
    },
    {
      stars: '★★★★★',
      text: '"We redesigned and shipped our entire marketing funnel in less than 48 hours without bugs."',
      author: 'Alex Morales • Founder at Techflow',
    },
    {
      stars: '★★★★★',
      text: '"The automatic responsive stacking works like magic across phones and tablets."',
      author: 'Elena Rostova • Senior Front-End Dev',
    },
  ];

  const cards: CanvasElement[] = [];
  const cardIds: string[] = [];

  quotes.forEach((q, idx) => {
    const card = createElement('container', 60 + idx * 360, offsetY + 70, 2, cardsRow.id);
    card.name = `Testimonial ${idx + 1}`;
    card.width = 330;
    card.height = 200;
    card.role = 'card';
    card.layout = {
      layoutType: 'flex',
      direction: 'column',
      align: 'start',
      alignItems: 'start',
      justify: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    };
    card.styles = {
      ...card.styles,
      backgroundColor: '#121624',
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#232c3f',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    };
    card.content = `${q.stars}\n\n${q.text}\n\n— ${q.author}`;

    cards.push(card);
    cardIds.push(card.id);
  });

  cardsRow.children = cardIds;
  section.children = [header.id, cardsRow.id];

  return [section, header, cardsRow, ...cards];
}

/* ========================================================================== */
/* 7. FAQ ACCORDION SECTION                                                   */
/* ========================================================================== */
export function createFaqSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'FAQ Accordion Cards';
  section.width = 1120;
  section.height = 420;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'start',
    justifyContent: 'start',
    gap: 18,
    padding: { top: 32, right: 40, bottom: 32, left: 40 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#101420',
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#232c3f',
  };

  const header = createElement('text', 80, offsetY + 20, 1, section.id);
  header.name = 'FAQ Title';
  header.content = 'Frequently Asked Questions';
  header.width = 800;
  header.height = 36;
  header.styles = {
    ...header.styles,
    fontSize: 24,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const faqs = [
    {
      q: 'Q: Does the exported code have any external dependencies?',
      a: 'A: No. It exports 100% pure semantic HTML5 and clean CSS with native media queries.',
    },
    {
      q: 'Q: How does the responsive layout engine work?',
      a: 'A: It uses an intelligent flexbox cascade that automatically reflows multi-column layouts into mobile stacks.',
    },
    {
      q: 'Q: Can I deploy the generated code to any web host?',
      a: 'A: Yes. You can host the resulting static files on Vercel, Netlify, Cloudflare Pages, or AWS S3.',
    },
  ];

  const cards: CanvasElement[] = [];
  const cardIds: string[] = [];

  faqs.forEach((f, idx) => {
    const card = createElement('container', 160, offsetY + 75 + idx * 95, 2, section.id);
    card.name = `FAQ Item ${idx + 1}`;
    card.width = 800;
    card.height = 80;
    card.role = 'card';
    card.layout = {
      layoutType: 'flex',
      direction: 'column',
      align: 'start',
      alignItems: 'start',
      justify: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: { top: 16, right: 20, bottom: 16, left: 20 },
    };
    card.styles = {
      ...card.styles,
      backgroundColor: '#151a28',
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#263148',
    };
    card.content = `${f.q}\n${f.a}`;
    cards.push(card);
    cardIds.push(card.id);
  });

  section.children = [header.id, ...cardIds];
  return [section, header, ...cards];
}

/* ========================================================================== */
/* 8. RADIANT CTA BANNER                                                      */
/* ========================================================================== */
export function createCtaBannerSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Radiant Gradient CTA Banner';
  section.width = 1120;
  section.height = 240;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: { top: 32, right: 40, bottom: 32, left: 40 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#312e81',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.45)',
  };

  const title = createElement('text', 80, offsetY + 30, 1, section.id);
  title.name = 'CTA Title';
  title.content = 'Ready to Supercharge Your Web Design?';
  title.width = 800;
  title.height = 42;
  title.styles = {
    ...title.styles,
    fontSize: 28,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const subtitle = createElement('text', 80, offsetY + 80, 1, section.id);
  subtitle.name = 'CTA Subtitle';
  subtitle.content = 'Join thousands of creators shipping gorgeous, responsive web experiences with zero friction.';
  subtitle.width = 680;
  subtitle.height = 36;
  subtitle.styles = {
    ...subtitle.styles,
    fontSize: 14,
    fontWeight: 400,
    color: '#e0e7ff',
    textAlign: 'center',
  };

  const cta = createElement('button', 465, offsetY + 130, 1, section.id);
  cta.name = 'CTA Banner Button';
  cta.content = 'Get Instant Access →';
  cta.width = 200;
  cta.height = 46;
  cta.styles = {
    ...cta.styles,
    backgroundColor: '#ffffff',
    color: '#312e81',
    borderRadius: 10,
    fontWeight: 700,
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
    hoverEffect: 'lift',
    hoverTranslateY: -2,
  };
  cta.behavior = {
    actionType: 'navigate-url',
    actionPayload: '#pricing',
    buttonVariant: 'filled',
    buttonIcon: 'arrow-right',
    hoverStyles: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    },
  };

  section.children = [title.id, subtitle.id, cta.id];
  return [section, title, subtitle, cta];
}

/* ========================================================================== */
/* 9. MODERN 4-COLUMN FOOTER                                                  */
/* ========================================================================== */
export function createFooterSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Modern 4-Column Footer';
  section.width = 1120;
  section.height = 200;
  section.layout = {
    layoutType: 'flex',
    direction: 'row',
    align: 'center',
    alignItems: 'center',
    justify: 'space-between',
    justifyContent: 'space-between',
    gap: 32,
    padding: { top: 32, right: 40, bottom: 32, left: 40 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#0c0e14',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#1e2434',
  };

  const brand = createElement('text', 60, offsetY + 30, 1, section.id);
  brand.name = 'Footer Brand';
  brand.content = '✦ CRAFT STUDIO\n\nDesign it. Define it. Ship it.\nThe modern visual builder for semantic web experiences.';
  brand.width = 380;
  brand.height = 100;
  brand.styles = {
    ...brand.styles,
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 1.6,
  };

  const col1 = createElement('text', 500, offsetY + 30, 1, section.id);
  col1.name = 'Footer Product Links';
  col1.content = 'Product\n\n• Visual Studio\n• Semantic Roles\n• Responsive Engine\n• Code Export';
  col1.width = 180;
  col1.height = 100;
  col1.styles = {
    ...col1.styles,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.7,
  };

  const col2 = createElement('text', 720, offsetY + 30, 1, section.id);
  col2.name = 'Footer Resource Links';
  col2.content = 'Resources\n\n• Documentation\n• Template Library\n• Keyboard Shortcuts\n• System Changelog';
  col2.width = 180;
  col2.height = 100;
  col2.styles = {
    ...col2.styles,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.7,
  };

  const col3 = createElement('text', 940, offsetY + 30, 1, section.id);
  col3.name = 'Footer Legal Links';
  col3.content = 'Company\n\n• About Us\n• Privacy Policy\n• Terms of Service\n• Security';
  col3.width = 140;
  col3.height = 100;
  col3.styles = {
    ...col3.styles,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 1.7,
  };

  section.children = [brand.id, col1.id, col2.id, col3.id];
  return [section, brand, col1, col2, col3];
}

/* ========================================================================== */
/* 10. SIGN-UP & LEAD CAPTURE FORM SECTION                                    */
/* ========================================================================== */
export function createSignUpSection(offsetY = 80): CanvasElement[] {
  const section = createElement('section', 40, offsetY);
  section.name = 'Sign-Up & Registration Card';
  section.width = 1120;
  section.height = 620;
  section.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: { top: 40, right: 32, bottom: 40, left: 32 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  section.styles = {
    ...section.styles,
    backgroundColor: '#0c0e14',
    borderWidth: 0,
    borderStyle: 'none',
  };

  const card = createElement('container', 330, offsetY + 20, 1, section.id);
  card.name = 'Auth Registration Card';
  card.width = 460;
  card.height = 540;
  card.role = 'card';
  card.layout = {
    layoutType: 'flex',
    direction: 'column',
    align: 'center',
    alignItems: 'center',
    justify: 'start',
    justifyContent: 'start',
    gap: 12,
    padding: { top: 32, right: 32, bottom: 32, left: 32 },
    responsiveDirection: { tablet: 'column', mobile: 'column' },
  };
  card.styles = {
    ...card.styles,
    backgroundColor: '#131620',
    borderColor: '#242a3e',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 16,
    boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7)',
  };

  const title = createElement('text', 360, offsetY + 50, 2, card.id);
  title.name = 'Sign-Up Title';
  title.content = 'Create Your Free Account';
  title.width = 396;
  title.height = 36;
  title.styles = {
    ...title.styles,
    fontSize: 22,
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textAlign: 'center',
    color: '#ffffff',
  };

  const subtitle = createElement('text', 360, offsetY + 90, 2, card.id);
  subtitle.name = 'Sign-Up Subtitle';
  subtitle.content = 'Start building and shipping visual experiences instantly.';
  subtitle.width = 396;
  subtitle.height = 24;
  subtitle.styles = {
    ...subtitle.styles,
    fontSize: 12,
    fontWeight: 400,
    color: '#94a3b8',
    textAlign: 'center',
  };

  const nameInput = createElement('container', 360, offsetY + 125, 2, card.id);
  nameInput.name = 'Full Name Input Field';
  nameInput.content = 'Full Name (e.g. Alex Morgan)';
  nameInput.role = 'input';
  nameInput.width = 396;
  nameInput.height = 42;
  nameInput.styles = {
    ...nameInput.styles,
    backgroundColor: '#0a0c12',
    borderColor: '#272d42',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    color: '#64748b',
    fontSize: 13,
    padding: 12,
  };

  const emailInput = createElement('container', 360, offsetY + 180, 2, card.id);
  emailInput.name = 'Work Email Input Field';
  emailInput.content = 'name@company.com';
  emailInput.role = 'input';
  emailInput.width = 396;
  emailInput.height = 42;
  emailInput.styles = {
    ...emailInput.styles,
    backgroundColor: '#0a0c12',
    borderColor: '#272d42',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    color: '#64748b',
    fontSize: 13,
    padding: 12,
  };

  const pwdInput = createElement('container', 360, offsetY + 235, 2, card.id);
  pwdInput.name = 'Password Input Field';
  pwdInput.content = '•••••••• (at least 8 characters)';
  pwdInput.role = 'input';
  pwdInput.width = 396;
  pwdInput.height = 42;
  pwdInput.styles = {
    ...pwdInput.styles,
    backgroundColor: '#0a0c12',
    borderColor: '#272d42',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    color: '#64748b',
    fontSize: 13,
    padding: 12,
  };

  const submitBtn = createElement('button', 360, offsetY + 295, 2, card.id);
  submitBtn.name = 'Create Free Account Button';
  submitBtn.content = 'Create Free Account →';
  submitBtn.width = 396;
  submitBtn.height = 46;
  submitBtn.role = 'button';
  submitBtn.styles = {
    ...submitBtn.styles,
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    boxShadow: '0 4px 16px rgba(79, 70, 229, 0.45)',
  };
  submitBtn.behavior = {
    actionType: 'alert',
    actionPayload: '✨ Registration submitted! Account registered to Supabase Cloud & SQLite database.',
    hoverStyles: {
      backgroundColor: '#6366f1',
      scale: 1.02,
    },
  };

  const termsNote = createElement('text', 360, offsetY + 355, 2, card.id);
  termsNote.name = 'Terms & Privacy Note';
  termsNote.content = 'By clicking Create Account, you agree to our Terms of Service & Privacy Policy.';
  termsNote.width = 396;
  termsNote.height = 32;
  termsNote.styles = {
    ...termsNote.styles,
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.4,
  };

  const switchLink = createElement('text', 360, offsetY + 395, 2, card.id);
  switchLink.name = 'Sign-In Switch Link';
  switchLink.content = 'Already have an account? Sign in here →';
  switchLink.width = 396;
  switchLink.height = 24;
  switchLink.styles = {
    ...switchLink.styles,
    fontSize: 12,
    color: '#818cf8',
    textAlign: 'center',
    fontWeight: 600,
  };

  card.children = [
    title.id,
    subtitle.id,
    nameInput.id,
    emailInput.id,
    pwdInput.id,
    submitBtn.id,
    termsNote.id,
    switchLink.id,
  ];
  section.children = [card.id];
  return [section, card, title, subtitle, nameInput, emailInput, pwdInput, submitBtn, termsNote, switchLink];
}

/* ========================================================================== */
/* SECTION TEMPLATES CATALOG REGISTRY                                         */
/* ========================================================================== */
export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero-centered',
    name: 'SaaS Hero (Centered)',
    category: 'hero',
    categoryLabel: 'Hero',
    description: 'High-converting headline with badge, subtitle, and primary gradient CTA.',
    badge: 'Popular',
    iconName: 'Sparkles',
    previewGradient: 'linear-gradient(135deg, #4f46e5, #9333ea)',
    create: createHeroSection,
  },
  {
    id: 'hero-split',
    name: 'Split Hero with UI Mockup',
    category: 'hero',
    categoryLabel: 'Hero',
    description: '2-column layout with copy on left and an interactive product card mockup on right.',
    badge: 'New',
    iconName: 'LayoutGrid',
    previewGradient: 'linear-gradient(135deg, #0284c7, #6366f1)',
    create: createHeroSplitSection,
  },
  {
    id: 'navbar-glass',
    name: 'Floating Glass Navbar',
    category: 'nav',
    categoryLabel: 'Navigation',
    description: 'Header with logo branding, navigation links, and primary action button.',
    iconName: 'Compass',
    previewGradient: 'linear-gradient(135deg, #1e293b, #334155)',
    create: createNavbarSection,
  },
  {
    id: 'features-3col',
    name: '3-Column Benefit Cards',
    category: 'features',
    categoryLabel: 'Features',
    description: 'Three glass cards with glowing icons and dynamic hover lift effects.',
    badge: 'Essential',
    iconName: 'Layers',
    previewGradient: 'linear-gradient(135deg, #059669, #10b981)',
    create: createFeatureGridSection,
  },
  {
    id: 'pricing-3tier',
    name: '3-Tier Pricing Table',
    category: 'pricing',
    categoryLabel: 'Pricing',
    description: 'Starter, Pro (highlighted with glowing gradient), and Enterprise plans.',
    badge: 'High Conversion',
    iconName: 'CreditCard',
    previewGradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
    create: createPricingSection,
  },
  {
    id: 'testimonials-grid',
    name: 'Client Testimonials Grid',
    category: 'social',
    categoryLabel: 'Social Proof',
    description: 'Authentic 5-star review cards with client quotes and author attribution.',
    iconName: 'Quote',
    previewGradient: 'linear-gradient(135deg, #ea580c, #f97316)',
    create: createTestimonialsSection,
  },
  {
    id: 'faq-accordion',
    name: 'FAQ Accordion Cards',
    category: 'faq',
    categoryLabel: 'FAQ',
    description: 'Clean Question & Answer cards answering common customer inquiries.',
    iconName: 'HelpCircle',
    previewGradient: 'linear-gradient(135deg, #475569, #64748b)',
    create: createFaqSection,
  },
  {
    id: 'cta-banner',
    name: 'Radiant Gradient CTA Banner',
    category: 'cta',
    categoryLabel: 'Call to Action',
    description: 'High-contrast callout banner with strong headline and instant access action.',
    badge: 'Action',
    iconName: 'Megaphone',
    previewGradient: 'linear-gradient(135deg, #6366f1, #d946ef)',
    create: createCtaBannerSection,
  },
  {
    id: 'footer-multi',
    name: 'Modern 4-Column Footer',
    category: 'footer',
    categoryLabel: 'Footer',
    description: 'Brand summary, Product, Resources, Company directories, and copyright.',
    iconName: 'PanelBottom',
    previewGradient: 'linear-gradient(135deg, #0f172a, #1e293b)',
    create: createFooterSection,
  },
  {
    id: 'signup-card',
    name: 'Sign-Up & Registration Card',
    category: 'auth',
    categoryLabel: 'Auth & Lead',
    description: 'High-converting user registration form with name, email, password, and database submission.',
    badge: 'Database Ready',
    iconName: 'UserPlus',
    previewGradient: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
    create: createSignUpSection,
  },
];

