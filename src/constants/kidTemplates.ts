import type { CanvasElement } from '../types/editor';
import { createElement } from './defaults';

export interface KidStarterSite {
  id: string;
  title: string;
  emoji: string;
  badge: string;
  description: string;
  themeColor: string;
  gradient: string;
  createElements: () => CanvasElement[];
}

export interface KidLegoBlock {
  id: string;
  name: string;
  emoji: string;
  description: string;
  create: (offsetY?: number) => CanvasElement[];
}

export interface MagicThemePalette {
  id: string;
  name: string;
  emoji: string;
  canvasBg: string;
  cardBg: string;
  cardBorder: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  accentText: string;
  buttonBg: string;
  buttonText: string;
}

/* ========================================================================== */
/* 1. MAGIC THEME PALETTES                                                    */
/* ========================================================================== */
export const MAGIC_THEMES: MagicThemePalette[] = [
  {
    id: 'pickle-mint',
    name: 'Pickle Mint',
    emoji: '🥒',
    canvasBg: '#090a0f',
    cardBg: '#12141c',
    cardBorder: '#1e2433',
    textColor: '#ffffff',
    subtextColor: '#94a3b8',
    accentColor: '#10b981',
    accentText: '#34d399',
    buttonBg: '#10b981',
    buttonText: '#ffffff',
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    emoji: '🍭',
    canvasBg: '#180e22',
    cardBg: '#271638',
    cardBorder: '#4c2670',
    textColor: '#ffffff',
    subtextColor: '#e9d5ff',
    accentColor: '#f43f5e',
    accentText: '#fda4af',
    buttonBg: '#ec4899',
    buttonText: '#ffffff',
  },
  {
    id: 'cyber-arcade',
    name: 'Cyber Arcade',
    emoji: '👾',
    canvasBg: '#0d1117',
    cardBg: '#161b22',
    cardBorder: '#30363d',
    textColor: '#f0f6fc',
    subtextColor: '#8b949e',
    accentColor: '#8b5cf6',
    accentText: '#a78bfa',
    buttonBg: '#8b5cf6',
    buttonText: '#ffffff',
  },
  {
    id: 'ocean-splash',
    name: 'Ocean Splash',
    emoji: '🌊',
    canvasBg: '#081c24',
    cardBg: '#0e2f3d',
    cardBorder: '#174f66',
    textColor: '#ffffff',
    subtextColor: '#7dd3fc',
    accentColor: '#0ea5e9',
    accentText: '#38bdf8',
    buttonBg: '#0284c7',
    buttonText: '#ffffff',
  },
  {
    id: 'space-galaxy',
    name: 'Cosmic Galaxy',
    emoji: '🚀',
    canvasBg: '#0b0914',
    cardBg: '#181329',
    cardBorder: '#2d244d',
    textColor: '#f8fafc',
    subtextColor: '#cbd5e1',
    accentColor: '#f59e0b',
    accentText: '#fbbf24',
    buttonBg: '#6366f1',
    buttonText: '#ffffff',
  },
  {
    id: 'sunshine-party',
    name: 'Sunshine Party',
    emoji: '☀️',
    canvasBg: '#1c150c',
    cardBg: '#2d2112',
    cardBorder: '#4a361c',
    textColor: '#ffffff',
    subtextColor: '#fed7aa',
    accentColor: '#f97316',
    accentText: '#fdba74',
    buttonBg: '#f59e0b',
    buttonText: '#000000',
  },
];

/* ========================================================================== */
/* 2. COMPLETE 1-CLICK STARTER SITES FOR KIDS & CREATORS                     */
/* ============================================================/**
 * Kit 1: Tyler's Gaming & Stream Hub
 */
export function createGamingStarterSite(): CanvasElement[] {
  const elements: CanvasElement[] = [];

  // 1. Header Hero
  const hero = createElement('section', 40, 40);
  hero.name = 'Gaming Header';
  hero.width = 1120;
  hero.height = 360;
  hero.styles = {
    ...hero.styles,
    backgroundColor: '#121424',
    borderColor: '#26284a',
    borderWidth: 2,
    borderRadius: 24,
    boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.3)',
  };
  elements.push(hero);

  const badge = createElement('text', 430, 75, 1, hero.id);
  badge.name = 'Gamer Level Badge';
  badge.content = '🎮 LEVEL 99 GAMER • OFFICIAL STREAM ZONE';
  badge.width = 340;
  badge.height = 32;
  badge.styles = {
    ...badge.styles,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: '#8b5cf6',
    borderWidth: 1,
    borderRadius: 9999,
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
  };
  elements.push(badge);

  const title = createElement('text', 180, 125, 1, hero.id);
  title.name = 'Gamer Title';
  title.content = "Welcome to Tyler's Gaming Hub!";
  title.width = 840;
  title.height = 60;
  title.styles = {
    ...title.styles,
    fontSize: 42,
    fontWeight: 900,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };
  elements.push(title);

  const sub = createElement('text', 220, 200, 1, hero.id);
  sub.name = 'Gamer Bio';
  sub.content = "I stream Minecraft builds, Roblox obstacle courses, and Mario Kart speedruns. Check out my best clips and vote for my next game!";
  sub.width = 760;
  sub.height = 48;
  sub.styles = {
    ...sub.styles,
    fontSize: 16,
    color: '#a5b4fc',
    textAlign: 'center',
    lineHeight: 1.5,
  };
  elements.push(sub);

  const playBtn = createElement('button', 490, 265, 1, hero.id);
  playBtn.name = 'Join Club Button';
  playBtn.content = '🔥 Join My Game Club!';
  playBtn.width = 220;
  playBtn.height = 46;
  playBtn.styles = {
    ...playBtn.styles,
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: 14,
    borderWidth: 0,
    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
  };
  playBtn.behavior = {
    actionType: 'confetti',
    actionSound: 'success',
  };
  elements.push(playBtn);

  // 2. Three Cards: Favorite Games
  const cardSection = createElement('section', 40, 430);
  cardSection.name = 'Games Grid';
  cardSection.width = 1120;
  cardSection.height = 320;
  cardSection.styles = {
    ...cardSection.styles,
    backgroundColor: 'transparent',
    borderWidth: 0,
  };
  elements.push(cardSection);

  const games = [
    { title: '⛏️ Minecraft', desc: 'Survival mode mega castles & redstone elevators.', stat: '500+ Hours' },
    { title: '🏎️ Mario Kart', desc: 'Rainbow Road champion. Always playing as Yoshi!', stat: '3-Star Cups' },
    { title: '🧱 Roblox Obby', desc: 'Created 3 custom obbies with 10,000+ plays.', stat: 'Top Creator' },
  ];

  games.forEach((game, idx) => {
    const cardX = 40 + idx * 385;
    const card = createElement('container', cardX, 430, 1, cardSection.id);
    card.name = `${game.title} Card`;
    card.width = 350;
    card.height = 310;
    card.styles = {
      ...card.styles,
      backgroundColor: '#16192b',
      borderColor: '#2d3356',
      borderWidth: 1,
      borderRadius: 18,
    };
    elements.push(card);

    const cardTitle = createElement('text', cardX + 24, 454, 2, card.id);
    cardTitle.content = game.title;
    cardTitle.width = 302;
    cardTitle.height = 34;
    cardTitle.styles = { ...cardTitle.styles, fontSize: 22, fontWeight: 800, color: '#ffffff' };
    elements.push(cardTitle);

    const cardDesc = createElement('text', cardX + 24, 498, 2, card.id);
    cardDesc.content = game.desc;
    cardDesc.width = 302;
    cardDesc.height = 70;
    cardDesc.styles = { ...cardDesc.styles, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 };
    elements.push(cardDesc);

    const cardStat = createElement('text', cardX + 24, 680, 2, card.id);
    cardStat.content = `⭐ ${game.stat}`;
    cardStat.width = 150;
    cardStat.height = 32;
    cardStat.styles = {
      ...cardStat.styles,
      fontSize: 12,
      fontWeight: 700,
      color: '#34d399',
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderRadius: 8,
      textAlign: 'center',
      lineHeight: 2.5,
    };
    elements.push(cardStat);
  });

  // 3. Guestbook / Contact Me Form
  const guestbook = createElement('section', 40, 780);
  guestbook.name = 'Gamer Guestbook';
  guestbook.width = 1120;
  guestbook.height = 250;
  guestbook.styles = {
    ...guestbook.styles,
    backgroundColor: '#121424',
    borderColor: '#26284a',
    borderWidth: 1,
    borderRadius: 20,
  };
  elements.push(guestbook);

  const gbTitle = createElement('text', 360, 810, 1, guestbook.id);
  gbTitle.content = '📬 Send Tyler a Game Challenge';
  gbTitle.width = 480;
  gbTitle.height = 36;
  gbTitle.styles = { ...gbTitle.styles, fontSize: 24, fontWeight: 800, color: '#ffffff', textAlign: 'center' };
  elements.push(gbTitle);

  const gbInput = createElement('input', 380, 860, 1, guestbook.id);
  gbInput.name = 'Your Gamer Tag';
  gbInput.content = 'Your Gamer Tag / Nickname';
  gbInput.width = 440;
  gbInput.height = 42;
  gbInput.styles = { ...gbInput.styles, backgroundColor: '#0b0c16', borderColor: '#2b3052', color: '#ffffff', borderRadius: 10 };
  elements.push(gbInput);

  const gbBtn = createElement('button', 500, 920, 1, guestbook.id);
  gbBtn.name = 'Send Challenge Button';
  gbBtn.content = 'Send Challenge! 🚀';
  gbBtn.width = 200;
  gbBtn.height = 44;
  gbBtn.styles = { ...gbBtn.styles, backgroundColor: '#10b981', color: '#ffffff', borderRadius: 10, fontWeight: 700 };
  gbBtn.behavior = { actionType: 'confetti', actionSound: 'pop' };
  elements.push(gbBtn);

  // 4. Footer with Anti-Slop Pickle Badge
  const footer = createKidFooter(1070);
  elements.push(...footer);

  return elements;
}

/**
 * Kit 2: Barnaby's Pet Fan Club
 */
export function createPetStarterSite(): CanvasElement[] {
  const elements: CanvasElement[] = [];

  const hero = createElement('section', 40, 40);
  hero.name = 'Pet Hero';
  hero.width = 1120;
  hero.height = 360;
  hero.styles = {
    ...hero.styles,
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 2,
    borderRadius: 24,
  };
  elements.push(hero);

  const badge = createElement('text', 420, 70, 1, hero.id);
  badge.content = '🐶 THE OFFICIAL FAN CLUB OF BARNABY';
  badge.width = 360;
  badge.height = 32;
  badge.styles = {
    ...badge.styles,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 9999,
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
  };
  elements.push(badge);

  const title = createElement('text', 180, 120, 1, hero.id);
  title.content = 'Meet Barnaby the Golden Pup!';
  title.width = 840;
  title.height = 60;
  title.styles = {
    ...title.styles,
    fontSize: 44,
    fontWeight: 900,
    color: '#ffffff',
    textAlign: 'center',
  };
  elements.push(title);

  const sub = createElement('text', 220, 195, 1, hero.id);
  sub.content = 'He loves chasing tennis balls, taking naps on the sofa, and stealing socks. Welcome to his official website!';
  sub.width = 760;
  sub.height = 48;
  sub.styles = { ...sub.styles, fontSize: 16, color: '#d1d5db', textAlign: 'center', lineHeight: 1.5 };
  elements.push(sub);

  const treatBtn = createElement('button', 465, 260, 1, hero.id);
  treatBtn.content = '🦴 Give Barnaby a Virtual Treat!';
  treatBtn.width = 270;
  treatBtn.height = 46;
  treatBtn.styles = {
    ...treatBtn.styles,
    backgroundColor: '#f59e0b',
    color: '#000000',
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
    borderWidth: 0,
    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
  };
  treatBtn.behavior = { actionType: 'confetti', actionSound: 'success' };
  elements.push(treatBtn);

  // 3 Fun Facts
  const factsSection = createElement('section', 40, 430);
  factsSection.name = 'Fun Facts Section';
  factsSection.width = 1120;
  factsSection.height = 240;
  factsSection.styles = { ...factsSection.styles, backgroundColor: 'transparent', borderWidth: 0 };
  elements.push(factsSection);

  const facts = [
    { title: '🎾 Favorite Toy', desc: 'The squeaky yellow tennis ball he buried in the backyard.' },
    { title: '💤 Sleeping Spot', desc: 'Directly in the sunbeam by the kitchen window.' },
    { title: '🐾 Superpower', desc: 'Can hear a cheese wrapper crinkle from 3 rooms away.' },
  ];

  facts.forEach((f, idx) => {
    const cardX = 40 + idx * 385;
    const card = createElement('container', cardX, 430, 1, factsSection.id);
    card.name = `${f.title} Card`;
    card.width = 350;
    card.height = 220;
    card.styles = {
      ...card.styles,
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      borderWidth: 1,
      borderRadius: 18,
    };
    elements.push(card);

    const t = createElement('text', cardX + 24, 454, 2, card.id);
    t.content = f.title;
    t.width = 302;
    t.height = 32;
    t.styles = { ...t.styles, fontSize: 20, fontWeight: 800, color: '#fcd34d' };
    elements.push(t);

    const d = createElement('text', cardX + 24, 498, 2, card.id);
    d.content = f.desc;
    d.width = 302;
    d.height = 110;
    d.styles = { ...d.styles, fontSize: 14, color: '#9ca3af', lineHeight: 1.5 };
    elements.push(d);
  });

  const footer = createKidFooter(690);
  elements.push(...footer);

  return elements;
}

/**
 * Kit 3: Sarah's Sweet Lemonade & Bakery
 */
export function createLemonadeStarterSite(): CanvasElement[] {
  const elements: CanvasElement[] = [];

  const hero = createElement('section', 40, 40);
  hero.name = 'Lemonade Stand Hero';
  hero.width = 1120;
  hero.height = 360;
  hero.styles = {
    ...hero.styles,
    backgroundColor: '#1c1917',
    borderColor: '#292524',
    borderWidth: 2,
    borderRadius: 24,
  };
  elements.push(hero);

  const badge = createElement('text', 400, 70, 1, hero.id);
  badge.content = '🍋 100% FRESH SQUEEZED • OPEN EVERY SATURDAY';
  badge.width = 400;
  badge.height = 32;
  badge.styles = {
    ...badge.styles,
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: '#eab308',
    borderWidth: 1,
    borderRadius: 9999,
    color: '#fde047',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
  };
  elements.push(badge);

  const title = createElement('text', 180, 120, 1, hero.id);
  title.content = "Sarah's Sweet Lemonade & Bakery";
  title.width = 840;
  title.height = 60;
  title.styles = {
    ...title.styles,
    fontSize: 44,
    fontWeight: 900,
    color: '#ffffff',
    textAlign: 'center',
  };
  elements.push(title);

  const sub = createElement('text', 220, 195, 1, hero.id);
  sub.content = "Made with real organic lemons, pure cane sugar, and fresh mint from our garden. Best cold drinks in the neighborhood!";
  sub.width = 760;
  sub.height = 48;
  sub.styles = { ...sub.styles, fontSize: 16, color: '#a8a29e', textAlign: 'center', lineHeight: 1.5 };
  elements.push(sub);

  const orderPill = createElement('button', 480, 260, 1, hero.id);
  orderPill.name = 'Stand Status Pill';
  orderPill.content = '📍 Corner of Oak & 5th St • 10am - 2pm';
  orderPill.width = 240;
  orderPill.height = 40;
  orderPill.styles = {
    ...orderPill.styles,
    backgroundColor: '#292524',
    borderColor: '#eab308',
    borderWidth: 1,
    color: '#fde047',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 700,
  };
  elements.push(orderPill);

  // Store Items Grid
  const menuSection = createElement('section', 40, 430);
  menuSection.name = 'Lemonade Menu';
  menuSection.width = 1120;
  menuSection.height = 360;
  menuSection.styles = { ...menuSection.styles, backgroundColor: 'transparent', borderWidth: 0 };
  elements.push(menuSection);

  const items = [
    { name: '🍋 Classic Ice Lemonade', price: '$1.50', desc: 'Crisp, sweet, and freezing cold with a slice of lemon.' },
    { name: '🍓 Strawberry Lemonade', price: '$2.00', desc: 'Blended with fresh strawberries and crushed ice.' },
    { name: '🍪 Warm Chocolate Cookie', price: '$1.00', desc: 'Baked this morning with gooey chocolate chips.' },
  ];

  items.forEach((item, idx) => {
    const cardX = 40 + idx * 385;
    const card = createElement('container', cardX, 430, 1, menuSection.id);
    card.name = `${item.name} Card`;
    card.width = 350;
    card.height = 340;
    card.styles = {
      ...card.styles,
      backgroundColor: '#292524',
      borderColor: '#44403c',
      borderWidth: 1,
      borderRadius: 18,
    };
    elements.push(card);

    const t = createElement('text', cardX + 24, 454, 2, card.id);
    t.content = item.name;
    t.width = 302;
    t.height = 32;
    t.styles = { ...t.styles, fontSize: 18, fontWeight: 800, color: '#ffffff' };
    elements.push(t);

    const p = createElement('text', cardX + 24, 494, 2, card.id);
    p.content = item.price;
    p.width = 302;
    p.height = 38;
    p.styles = { ...p.styles, fontSize: 28, fontWeight: 900, color: '#eab308' };
    elements.push(p);

    const d = createElement('text', cardX + 24, 538, 2, card.id);
    d.content = item.desc;
    d.width = 302;
    d.height = 70;
    d.styles = { ...d.styles, fontSize: 14, color: '#a8a29e', lineHeight: 1.5 };
    elements.push(d);

    const buyBtn = createElement('button', cardX + 24, 690, 2, card.id);
    buyBtn.content = '🛒 Order for Saturday';
    buyBtn.width = 302;
    buyBtn.height = 42;
    buyBtn.styles = {
      ...buyBtn.styles,
      backgroundColor: '#10b981',
      color: '#ffffff',
      borderRadius: 10,
      fontWeight: 700,
    };
    buyBtn.behavior = { actionType: 'confetti', actionSound: 'chime' };
    elements.push(buyBtn);
  });

  const footer = createKidFooter(820);
  elements.push(...footer);

  return elements;
}

/**
 * Kit 4: Science Fair & Space Project
 */
export function createScienceStarterSite(): CanvasElement[] {
  const elements: CanvasElement[] = [];

  const hero = createElement('section', 40, 40);
  hero.name = 'Science Hero';
  hero.width = 1120;
  hero.height = 360;
  hero.styles = {
    ...hero.styles,
    backgroundColor: '#0c1222',
    borderColor: '#1e293b',
    borderWidth: 2,
    borderRadius: 24,
  };
  elements.push(hero);

  const badge = createElement('text', 400, 70, 1, hero.id);
  badge.content = '🚀 2026 DISTRICT SCIENCE FAIR PROJECT #42';
  badge.width = 400;
  badge.height = 32;
  badge.styles = {
    ...badge.styles,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38bdf8',
    borderWidth: 1,
    borderRadius: 9999,
    color: '#7dd3fc',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.4,
  };
  elements.push(badge);

  const title = createElement('text', 180, 120, 1, hero.id);
  title.content = 'Mission to Mars: Solar Rover 2026';
  title.width = 840;
  title.height = 60;
  title.styles = {
    ...title.styles,
    fontSize: 44,
    fontWeight: 900,
    color: '#ffffff',
    textAlign: 'center',
  };
  elements.push(title);

  const sub = createElement('text', 220, 195, 1, hero.id);
  sub.content = "By Maya Lin (Grade 4). Can a robot explore Mars using only sunlight and AI-free mechanical sensors? Explore our scientific findings!";
  sub.width = 760;
  sub.height = 48;
  sub.styles = { ...sub.styles, fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 };
  elements.push(sub);

  const voteBtn = createElement('button', 475, 260, 1, hero.id);
  voteBtn.content = '⭐ Vote for Maya’s Project!';
  voteBtn.width = 250;
  voteBtn.height = 46;
  voteBtn.styles = {
    ...voteBtn.styles,
    backgroundColor: '#38bdf8',
    color: '#0c1222',
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
  };
  voteBtn.behavior = { actionType: 'confetti', actionSound: 'success' };
  elements.push(voteBtn);

  // 3 Scientific Findings Cards
  const findingsSection = createElement('section', 40, 430);
  findingsSection.name = 'Science Findings';
  findingsSection.width = 1120;
  findingsSection.height = 240;
  findingsSection.styles = { ...findingsSection.styles, backgroundColor: 'transparent', borderWidth: 0 };
  elements.push(findingsSection);

  const findings = [
    { title: '☀️ Solar Power Yield', desc: 'Tested 3 mini solar panels with 12V rechargeable capacitor. Output was 4.8W in full direct sun.' },
    { title: '🤖 Whisker Sensors', desc: 'Used physical bumper micro-switches instead of heavy AI cameras. 100% collision avoidance in trials.' },
    { title: '🛞 Rocker-Bogie Chassis', desc: 'Designed 6-wheel rocker-bogie chassis with chevron treads for navigating steep sand dunes.' },
  ];

  findings.forEach((f, idx) => {
    const cardX = 40 + idx * 385;
    const card = createElement('container', cardX, 430, 1, findingsSection.id);
    card.name = `${f.title} Card`;
    card.width = 350;
    card.height = 220;
    card.styles = {
      ...card.styles,
      backgroundColor: '#111c33',
      borderColor: '#1e293b',
      borderWidth: 1,
      borderRadius: 18,
    };
    elements.push(card);

    const t = createElement('text', cardX + 24, 454, 2, card.id);
    t.content = f.title;
    t.width = 302;
    t.height = 32;
    t.styles = { ...t.styles, fontSize: 18, fontWeight: 800, color: '#38bdf8' };
    elements.push(t);

    const d = createElement('text', cardX + 24, 498, 2, card.id);
    d.content = f.desc;
    d.width = 302;
    d.height = 110;
    d.styles = { ...d.styles, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 };
    elements.push(d);
  });

  const footer = createKidFooter(690);
  elements.push(...footer);

  return elements;
}

/**
 * Universal Anti-Slop Kid Footer with Pickle Studio Seal
 */
export function createKidFooter(offsetY = 600): CanvasElement[] {
  const footer = createElement('section', 40, offsetY);
  footer.name = 'Kid Creator Footer';
  footer.width = 1120;
  footer.height = 80;
  footer.styles = {
    ...footer.styles,
    backgroundColor: '#0c0d12',
    borderColor: '#1a1b24',
    borderWidth: 1,
    borderRadius: 16,
  };

  const seal = createElement('text', 70, offsetY + 26, 1, footer.id);
  seal.name = 'Pickle Guarantee Seal';
  seal.content = '🥒 Built with Pickle Studio — 100% Handcrafted • 0% AI Slop';
  seal.width = 560;
  seal.height = 28;
  seal.styles = { ...seal.styles, fontSize: 13, fontWeight: 700, color: '#10b981' };

  const credit = createElement('text', 730, offsetY + 26, 1, footer.id);
  credit.name = 'Zero Code Credit';
  credit.content = 'Published to the live web with zero code!';
  credit.width = 390;
  credit.height = 28;
  credit.styles = { ...credit.styles, fontSize: 12, color: '#71717a', textAlign: 'right' };

  return [footer, seal, credit];
}

/* ========================================================================== */
/* 3. KID LEGO BLOCKS (Snap-together sections)                                */
/* ========================================================================== */
export const KID_LEGO_BLOCKS: KidLegoBlock[] = [
  {
    id: 'block-big-banner',
    name: 'Big Friendly Banner',
    emoji: '🏷️',
    description: 'A vibrant header banner with your name, cool badge, and big button.',
    create: (offsetY = 40) => {
      const sec = createElement('section', 40, offsetY);
      sec.name = 'Big Friendly Banner';
      sec.width = 1120;
      sec.height = 240;
      sec.styles = { ...sec.styles, backgroundColor: '#131626', borderColor: '#262d4a', borderRadius: 20 };

      const b = createElement('text', 420, offsetY + 30, 1, sec.id);
      b.content = '✨ WELCOME TO MY OFFICIAL SITE';
      b.width = 360;
      b.height = 26;
      b.styles = { ...b.styles, fontSize: 12, fontWeight: 800, color: '#a5b4fc', textAlign: 'center' };

      const t = createElement('text', 180, offsetY + 70, 1, sec.id);
      t.content = 'Hello World! This is My Website 🚀';
      t.width = 840;
      t.height = 50;
      t.styles = { ...t.styles, fontSize: 36, fontWeight: 900, color: '#ffffff', textAlign: 'center' };

      const btn = createElement('button', 510, offsetY + 138, 1, sec.id);
      btn.content = 'Say Hello! 👋';
      btn.height = 44;
      btn.width = 180;
      btn.styles = { ...btn.styles, backgroundColor: '#10b981', color: '#ffffff', borderRadius: 10, fontWeight: 700 };
      btn.behavior = { actionType: 'confetti', actionSound: 'pop' };

      return [sec, b, t, btn];
    },
  },
  {
    id: 'block-3facts',
    name: '3 Fun Facts Cards',
    emoji: '⭐️',
    description: '3 side-by-side cards with cool icons to share facts about you or your project.',
    create: (offsetY = 40) => {
      const sec = createElement('section', 40, offsetY);
      sec.name = '3 Fun Facts';
      sec.width = 1120;
      sec.height = 250;
      sec.styles = { ...sec.styles, backgroundColor: 'transparent', borderWidth: 0 };

      const facts = [
        { emoji: '🍕', title: 'Favorite Food', desc: 'Extra cheese pizza with pineapple on Friday nights.' },
        { emoji: '🚀', title: 'Big Dream', desc: 'Building my own game studio and flying to outer space.' },
        { emoji: '🎮', title: 'Top Skill', desc: 'Can beat any Mario Kart track blindfolded.' },
      ];

      const els: CanvasElement[] = [sec];
      facts.forEach((f, idx) => {
        const cardX = 40 + idx * 385;
        const card = createElement('container', cardX, offsetY, 1, sec.id);
        card.width = 350;
        card.height = 230;
        card.styles = { ...card.styles, backgroundColor: '#181a24', borderColor: '#292d3f', borderWidth: 1, borderRadius: 16 };
        els.push(card);

        const em = createElement('text', cardX + 24, offsetY + 24, 2, card.id);
        em.content = f.emoji;
        em.width = 60;
        em.height = 40;
        em.styles = { ...em.styles, fontSize: 32 };
        els.push(em);

        const ti = createElement('text', cardX + 24, offsetY + 74, 2, card.id);
        ti.content = f.title;
        ti.width = 302;
        ti.height = 30;
        ti.styles = { ...ti.styles, fontSize: 18, fontWeight: 800, color: '#ffffff' };
        els.push(ti);

        const de = createElement('text', cardX + 24, offsetY + 112, 2, card.id);
        de.content = f.desc;
        de.width = 302;
        de.height = 80;
        de.styles = { ...de.styles, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 };
        els.push(de);
      });

      return els;
    },
  },
  {
    id: 'block-guestbook',
    name: 'Say Hi / Message Box',
    emoji: '📬',
    description: 'A working guestbook where friends and visitors can leave you friendly notes.',
    create: (offsetY = 40) => {
      const sec = createElement('section', 40, offsetY);
      sec.name = 'Guestbook Box';
      sec.width = 1120;
      sec.height = 230;
      sec.styles = { ...sec.styles, backgroundColor: '#151722', borderColor: '#272c42', borderRadius: 20 };

      const t = createElement('text', 360, offsetY + 30, 1, sec.id);
      t.content = '📬 Leave Me a Friendly Note!';
      t.width = 480;
      t.height = 36;
      t.styles = { ...t.styles, fontSize: 22, fontWeight: 800, color: '#ffffff', textAlign: 'center' };

      const inp = createElement('input', 380, offsetY + 80, 1, sec.id);
      inp.name = 'Visitor Name';
      inp.content = 'Your Name or Secret Agent Code';
      inp.width = 440;
      inp.height = 44;
      inp.styles = { ...inp.styles, backgroundColor: '#0d0e14', borderColor: '#2b3046', borderRadius: 10, color: '#ffffff' };

      const btn = createElement('button', 510, offsetY + 140, 1, sec.id);
      btn.content = 'Send Note 💌';
      btn.height = 42;
      btn.width = 180;
      btn.behavior = { actionType: 'confetti', actionSound: 'pop' };

      return [sec, t, inp, btn];
    },
  },
  {
    id: 'block-live-poll',
    name: 'Live Voting Poll',
    emoji: '🗳️',
    description: 'Ask your friends a question and let them vote live with instant animated results!',
    create: (offsetY = 40) => {
      const sec = createElement('section', 40, offsetY);
      sec.name = 'Poll Section';
      sec.width = 1120;
      sec.height = 380;
      sec.styles = { ...sec.styles, backgroundColor: '#131626', borderColor: '#262d4a', borderRadius: 20 };

      const poll = createElement('poll', 340, offsetY + 30, 1, sec.id);
      poll.pollConfig = {
        question: 'What game should we play next? 🎮',
        themeColor: '#8b5cf6',
        allowMultiple: false,
        totalVotes: 89,
        options: [
          { id: 'p1', label: '🏎️ Mario Kart 8 Tournament', votes: 34 },
          { id: 'p2', label: '⛏️ Minecraft Hardcore World', votes: 41 },
          { id: 'p3', label: '🚀 Among Us Space Match', votes: 14 },
        ],
      };
      return [sec, poll];
    },
  },
  {
    id: 'block-reaction-hype',
    name: 'Reaction Love Button',
    emoji: '💖',
    description: 'A fun tap button where visitors shower your site with confetti and love!',
    create: (offsetY = 40) => {
      const sec = createElement('section', 40, offsetY);
      sec.name = 'Hype Station';
      sec.width = 1120;
      sec.height = 180;
      sec.styles = { ...sec.styles, backgroundColor: '#181b2a', borderColor: '#2b324c', borderRadius: 20 };

      const title = createElement('text', 360, offsetY + 30, 1, sec.id);
      title.content = '💖 Enjoyed this site? Leave a reaction!';
      title.width = 480;
      title.height = 30;
      title.styles = { ...title.styles, fontSize: 18, fontWeight: 800, color: '#ffffff', textAlign: 'center' };

      const react = createElement('reaction', 470, offsetY + 75, 1, sec.id);
      react.reactionConfig = {
        emoji: '🔥',
        label: 'Super Hype',
        count: 247,
        soundEffect: 'pop',
        burstType: 'confetti',
      };
      return [sec, title, react];
    },
  },
  {
    id: 'block-pickle-seal',
    name: 'Pickle Anti-Slop Badge',
    emoji: '🥒',
    description: 'Official Pickle Studio guarantee that your site is 100% human-made and 0% AI slop.',
    create: (offsetY = 40) => {
      return createKidFooter(offsetY);
    },
  },
];

/* ========================================================================== */
/* 4. ALL KID STARTER SITES REGISTRY                                          */
/* ========================================================================== */
export const KID_STARTER_SITES: KidStarterSite[] = [
  {
    id: 'site-gaming',
    title: "Tyler's Gaming & Stream Hub",
    emoji: '🎮',
    badge: 'Popular',
    description: 'Stream schedule, favorite games, high scores & join game club button.',
    themeColor: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    createElements: createGamingStarterSite,
  },
  {
    id: 'site-pet',
    title: "Barnaby's Pet Fan Club",
    emoji: '🐾',
    badge: 'Cute & Friendly',
    description: 'Pup photo gallery, fun habits, daily routine, and treat button.',
    themeColor: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308)',
    createElements: createPetStarterSite,
  },
  {
    id: 'site-lemonade',
    title: "Sarah's Lemonade & Bakery",
    emoji: '🍋',
    badge: 'Mini-Store',
    description: 'Menu list, pricing cards, and real working order & buy buttons.',
    themeColor: '#eab308',
    gradient: 'linear-gradient(135deg, #10b981, #eab308)',
    createElements: createLemonadeStarterSite,
  },
  {
    id: 'site-science',
    title: 'Space Mars Rover Science Project',
    emoji: '🚀',
    badge: 'School & STEM',
    description: 'Research findings, mission photos, and vote for my project button.',
    themeColor: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
    createElements: createScienceStarterSite,
  },
];
