export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  badge: string;
  monthlyPrice: number;
  annualPrice: number; // per month billed annually
  popular?: boolean;
  color: string;
  borderColor: string;
  gradient: string;
  buttonText: string;
  quotas: {
    maxProjects: number; // Infinity for unlimited
    maxPagesPerProject: number;
    canExportZip: boolean;
    canExportNextjs: boolean;
    canRemoveWatermark: boolean;
    canUseCustomDomain: boolean;
    canUseTeamCollab: boolean;
    cloudStorageMb: number;
    realtimeSeoFixes: boolean;
  };
  features: PlanFeature[];
}

export const PLAN_CONFIGS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    tagline: 'Ideal for experimenting and building your first visual site.',
    badge: 'FREE',
    monthlyPrice: 0,
    annualPrice: 0,
    color: '#94a3b8',
    borderColor: '#334155',
    gradient: 'from-slate-800 to-slate-900',
    buttonText: 'Current Plan',
    quotas: {
      maxProjects: 2,
      maxPagesPerProject: 1,
      canExportZip: false,
      canExportNextjs: false,
      canRemoveWatermark: false,
      canUseCustomDomain: false,
      canUseTeamCollab: false,
      cloudStorageMb: 25,
      realtimeSeoFixes: false,
    },
    features: [
      { text: 'Up to 2 active studio projects', included: true },
      { text: 'Single-page visual layout engine', included: true },
      { text: 'Standard single-file HTML & CSS export', included: true },
      { text: '16x motion presets & Figma-style snapping', included: true },
      { text: 'Craft Studio watermark on published sites', included: true },
      { text: 'Full React + Tailwind & Next.js ZIP export', included: false },
      { text: 'Remove studio watermark / White-label', included: false },
      { text: 'Custom domains with auto-SSL', included: false },
      { text: 'Multi-page projects & team collaboration', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Studio',
    tagline: 'For creators, freelancers, and design engineers shipping real apps.',
    badge: 'MOST POPULAR',
    popular: true,
    monthlyPrice: 19,
    annualPrice: 15,
    color: '#818cf8',
    borderColor: '#6366f1',
    gradient: 'from-indigo-900/60 via-purple-900/40 to-slate-900',
    buttonText: 'Upgrade to Pro',
    quotas: {
      maxProjects: Infinity,
      maxPagesPerProject: Infinity,
      canExportZip: true,
      canExportNextjs: true,
      canRemoveWatermark: true,
      canUseCustomDomain: true,
      canUseTeamCollab: false,
      cloudStorageMb: 2048,
      realtimeSeoFixes: true,
    },
    features: [
      { text: 'Unlimited active studio projects', included: true, highlight: true },
      { text: 'Unlimited multi-page sites & routing', included: true, highlight: true },
      { text: 'Production Next.js 15 & React Tailwind ZIP export', included: true, highlight: true },
      { text: 'Remove Craft Studio branding badge', included: true },
      { text: 'Custom domains with 1-click cloud routing', included: true },
      { text: 'Automated 1-click SEO auto-fixes & audit', included: true },
      { text: 'E-commerce mini-storefront & Stripe checkout', included: true },
      { text: 'Interactive forms & lead capture exports', included: true },
      { text: 'Real-time multiplayer collaboration', included: false },
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Studio Enterprise',
    tagline: 'For fast-moving design agencies and teams demanding maximum power.',
    badge: 'AGENCY SCALE',
    monthlyPrice: 49,
    annualPrice: 39,
    color: '#c084fc',
    borderColor: '#a855f7',
    gradient: 'from-purple-950/60 via-fuchsia-950/30 to-slate-900',
    buttonText: 'Upgrade to Enterprise',
    quotas: {
      maxProjects: Infinity,
      maxPagesPerProject: Infinity,
      canExportZip: true,
      canExportNextjs: true,
      canRemoveWatermark: true,
      canUseCustomDomain: true,
      canUseTeamCollab: true,
      cloudStorageMb: 51200,
      realtimeSeoFixes: true,
    },
    features: [
      { text: 'Everything in Pro Studio, completely unlocked', included: true, highlight: true },
      { text: 'Unlimited team members & role-based permissions', included: true, highlight: true },
      { text: 'Full white-label client presentation mode', included: true },
      { text: 'Custom design tokens & font uploads', included: true },
      { text: '50 GB high-performance cloud asset CDN', included: true },
      { text: 'Custom webhook deploy pipeline & SLA support', included: true },
      { text: 'Dedicated priority support engineer', included: true },
    ],
  },
};

/**
 * Normalizes any user plan string or token into a recognized SubscriptionTier
 */
export function normalizeSubscriptionTier(plan?: string | null): SubscriptionTier {
  if (!plan) return 'free';
  const clean = plan.toLowerCase().trim();
  if (clean.includes('enterprise')) return 'enterprise';
  if (clean.includes('pro')) return 'pro';
  return 'free';
}

/**
 * Helper to check whether a given user plan satisfies a feature quota
 */
export function checkPlanQuota<K extends keyof PlanConfig['quotas']>(
  userPlan: string | null | undefined,
  quotaKey: K
): PlanConfig['quotas'][K] {
  const tier = normalizeSubscriptionTier(userPlan);
  return PLAN_CONFIGS[tier].quotas[quotaKey];
}
