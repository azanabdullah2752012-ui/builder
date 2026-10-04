import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  X, Sparkles, LayoutTemplate, Search, Zap,
  Globe, FileText, Star, Check,
} from 'lucide-react';
import {
  createHeroSection,
  createHeroSplitSection,
  createNavbarSection,
  createFeatureGridSection,
  createPricingSection,
  createSignUpSection,
  SECTION_TEMPLATES,
} from '../../constants/templates';
import type { CanvasElement } from '../../types/editor';
import { playSound, triggerConfetti } from '../../utils/interactiveEffects';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Full Page Template Definitions                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

export interface FullPageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  gradient: string;
  accentColor: string;
  badge?: string;
  sections: string[]; // human-readable list of sections
  create: () => CanvasElement[];
}

function buildSaasLanding(): CanvasElement[] {
  const nav = createNavbarSection(0);
  const hero = createHeroSection(80);
  const features = createFeatureGridSection(540);
  const pricing = createPricingSection(980);
  const signup = createSignUpSection(1440);
  return [...nav, ...hero, ...features, ...pricing, ...signup];
}

function buildPortfolio(): CanvasElement[] {
  const nav = createNavbarSection(0);
  const hero = createHeroSplitSection(80);
  const features = createFeatureGridSection(600);
  const signup = createSignUpSection(1060);
  return [...nav, ...hero, ...features, ...signup];
}

function buildMinimalBlog(): CanvasElement[] {
  const nav = createNavbarSection(0);
  const hero = createHeroSection(80);
  const features = createFeatureGridSection(540);
  return [...nav, ...hero, ...features];
}

function buildComingSoon(): CanvasElement[] {
  const tmpl = SECTION_TEMPLATES.find(t => t.id === 'cta-banner');
  const hero = createHeroSection(40);
  const signup = createSignUpSection(500);
  const extras = tmpl ? tmpl.create(900) : [];
  return [...hero, ...signup, ...extras];
}

function buildStartupLanding(): CanvasElement[] {
  const nav = createNavbarSection(0);
  const hero = createHeroSplitSection(80);
  const features = createFeatureGridSection(600);
  const pricing = createPricingSection(1040);
  const cta = SECTION_TEMPLATES.find(t => t.id === 'cta-banner');
  const ctaEls = cta ? cta.create(1500) : [];
  return [...nav, ...hero, ...features, ...pricing, ...ctaEls];
}

function buildFreelancer(): CanvasElement[] {
  const nav = createNavbarSection(0);
  const hero = createHeroSection(80);
  const features = createFeatureGridSection(540);
  const testi = SECTION_TEMPLATES.find(t => t.id === 'testimonials-grid');
  const testiEls = testi ? testi.create(980) : [];
  const signup = createSignUpSection(1380);
  return [...nav, ...hero, ...features, ...testiEls, ...signup];
}

export const FULL_PAGE_TEMPLATES: FullPageTemplate[] = [
  {
    id: 'saas-landing',
    name: 'SaaS Landing Page',
    description: 'Full conversion-optimised SaaS website with navbar, hero, features, pricing, and sign-up.',
    category: 'Business',
    tags: ['saas', 'startup', 'product', 'conversion'],
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
    accentColor: '#6366f1',
    badge: 'Popular',
    sections: ['Navbar', 'Hero (Centered)', 'Feature Cards', 'Pricing Table', 'Sign-Up Form'],
    create: buildSaasLanding,
  },
  {
    id: 'startup',
    name: 'Startup Launch',
    description: 'Sleek split-hero startup page with social proof and pricing — perfect for product launches.',
    category: 'Business',
    tags: ['startup', 'launch', 'product', 'pitch'],
    gradient: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
    accentColor: '#0ea5e9',
    badge: 'New',
    sections: ['Navbar', 'Split Hero', 'Feature Cards', 'Pricing Table', 'CTA Banner'],
    create: buildStartupLanding,
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    description: 'Minimalist portfolio for designers and developers with split hero and project showcase.',
    category: 'Creative',
    tags: ['portfolio', 'designer', 'developer', 'personal'],
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    accentColor: '#10b981',
    sections: ['Navbar', 'Split Hero', 'Work Gallery', 'Contact Form'],
    create: buildPortfolio,
  },
  {
    id: 'freelancer',
    name: 'Freelancer Site',
    description: 'Personal branding site with services, testimonials, and a client contact form.',
    category: 'Creative',
    tags: ['freelancer', 'agency', 'services', 'personal'],
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    accentColor: '#f97316',
    sections: ['Navbar', 'Hero', 'Services', 'Testimonials', 'Contact Form'],
    create: buildFreelancer,
  },
  {
    id: 'minimal-blog',
    name: 'Minimal Blog / Newsletter',
    description: 'Clean, readable layout for writers, bloggers, and newsletter creators.',
    category: 'Content',
    tags: ['blog', 'newsletter', 'writer', 'content'],
    gradient: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
    accentColor: '#94a3b8',
    sections: ['Navbar', 'Hero', 'Featured Posts'],
    create: buildMinimalBlog,
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon / Waitlist',
    description: 'Minimal launch countdown page with email capture to build your waitlist before launch.',
    category: 'Launch',
    tags: ['coming soon', 'waitlist', 'launch', 'countdown'],
    gradient: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
    accentColor: '#d946ef',
    badge: 'Quick',
    sections: ['Hero', 'Email Capture', 'CTA Banner'],
    create: buildComingSoon,
  },
];

const CATEGORIES = ['All', 'Business', 'Creative', 'Content', 'Launch'];
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'All': <LayoutTemplate size={13} />,
  'Business': <Globe size={13} />,
  'Creative': <Star size={13} />,
  'Content': <FileText size={13} />,
  'Launch': <Zap size={13} />,
};

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({ isOpen, onClose }) => {
  const { addElements, resetToBlank, showToast } = useEditor();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = FULL_PAGE_TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
    return matchCat && matchSearch;
  });

  const handleApply = async (template: FullPageTemplate) => {
    setApplying(template.id);
    await new Promise(r => setTimeout(r, 180));
    resetToBlank();
    const elements = template.create();
    addElements(elements, true, true);
    playSound('success');
    triggerConfetti();
    showToast(`🎨 Applied "${template.name}" template!`, 'success');
    setApplying(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'tmplFadeIn 0.15s ease-out',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes tmplFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes tmplSlideUp { from { opacity:0; transform:translateY(20px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        .tmpl-card { transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), box-shadow 0.18s; }
        .tmpl-card:hover { transform: translateY(-3px); }
        .tmpl-cat-btn { transition: all 0.12s; }
      `}</style>

      <div
        style={{
          width: '100%', maxWidth: 900, maxHeight: '90vh',
          backgroundColor: '#0f0f14',
          border: '1px solid #1e1e28',
          borderRadius: 18,
          boxShadow: '0 32px 100px rgba(0,0,0,0.8)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'tmplSlideUp 0.2s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #1a1a22',
          display: 'flex', alignItems: 'flex-start', gap: 16,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#fff" />
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f4f4f5' }}>
                Template Library
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#71717a' }}>
              Pick a full-page layout to start from. Applying replaces the current canvas.
            </p>
          </div>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#141418', border: '1px solid #2a2a35',
            borderRadius: 8, padding: '0 10px', height: 34,
          }}>
            <Search size={13} color="#52525b" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates…"
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: '#d4d4d8', fontSize: 12, fontFamily: 'inherit', width: 150,
              }}
            />
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 7, border: 'none',
              background: '#1c1c22', color: '#71717a', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Category pills */}
        <div style={{
          padding: '12px 24px',
          display: 'flex', gap: 6, flexShrink: 0,
          borderBottom: '1px solid #1a1a22',
        }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                className="tmpl-cat-btn"
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500,
                  background: active ? '#6366f1' : '#1a1a22',
                  color: active ? '#fff' : '#71717a',
                }}
              >
                {CATEGORY_ICONS[cat]}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Template Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#52525b' }}>
              <LayoutTemplate size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 14 }}>No templates found for "{searchQuery}"</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}>
              {filtered.map(template => {
                const isHovered = hoveredId === template.id;
                const isApplying = applying === template.id;
                return (
                  <div
                    key={template.id}
                    className="tmpl-card"
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      border: `1px solid ${isHovered ? template.accentColor + '60' : '#1e1e28'}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: '#111116',
                      boxShadow: isHovered ? `0 8px 32px ${template.accentColor}25` : '0 2px 8px rgba(0,0,0,0.3)',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleApply(template)}
                  >
                    {/* Visual preview */}
                    <div style={{
                      height: 140,
                      background: template.gradient,
                      position: 'relative',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {/* Decorative page mockup lines */}
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                        {[20, 44, 60, 74, 90, 106, 118].map((top, i) => (
                          <div key={i} style={{
                            position: 'absolute', left: 20, right: 20, top,
                            height: i === 0 ? 8 : i === 1 ? 4 : 3,
                            borderRadius: 2,
                            background: '#fff',
                            width: i === 0 ? '60%' : i % 2 === 0 ? '80%' : '45%',
                            margin: '0 auto',
                          }} />
                        ))}
                      </div>
                      {template.badge && (
                        <span style={{
                          position: 'absolute', top: 10, right: 10,
                          fontSize: 9, fontWeight: 700,
                          background: 'rgba(0,0,0,0.4)', color: '#fff',
                          padding: '3px 8px', borderRadius: 20,
                          backdropFilter: 'blur(4px)',
                          letterSpacing: '0.06em',
                        }}>
                          {template.badge}
                        </span>
                      )}
                      {isHovered && !isApplying && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.45)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: 8,
                          animation: 'tmplFadeIn 0.1s ease-out',
                        }}>
                          <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: 8, padding: '8px 16px',
                            color: '#fff', fontSize: 13, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 6,
                            backdropFilter: 'blur(8px)',
                          }}>
                            <Check size={14} /> Apply Template
                          </div>
                        </div>
                      )}
                      {isApplying && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: '3px solid rgba(255,255,255,0.2)',
                            borderTop: '3px solid #fff',
                            animation: 'spin 0.6s linear infinite',
                          }} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f4f4f5' }}>
                          {template.name}
                        </span>
                        <span style={{
                          fontSize: 9, color: template.accentColor, fontWeight: 600,
                          background: template.accentColor + '18',
                          padding: '2px 6px', borderRadius: 10,
                          letterSpacing: '0.04em',
                        }}>
                          {template.category}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>
                        {template.description}
                      </p>
                      {/* Section list */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {template.sections.map(s => (
                          <span key={s} style={{
                            fontSize: 9, color: '#52525b',
                            background: '#1a1a22', borderRadius: 4,
                            padding: '2px 6px',
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #1a1a22',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, fontSize: 11, color: '#3f3f46',
        }}>
          <span>{FULL_PAGE_TEMPLATES.length} full-page templates available</span>
          <span>Click any template to apply it to the canvas</span>
        </div>
      </div>
    </div>
  );
};
