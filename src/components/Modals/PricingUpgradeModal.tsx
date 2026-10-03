import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Crown,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEditor } from '../../context/useEditor';
import {
  PLAN_CONFIGS,
  type SubscriptionTier,
} from '../../types/subscription';
import { triggerConfetti, playSound } from '../../utils/interactiveEffects';

export const PricingUpgradeModal: React.FC = () => {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    upgradeModalReason,
    userPlanTier,
    upgradeUserPlan,
    showToast,
  } = useEditor();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState<SubscriptionTier | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUpgradeModalOpen) {
        setIsUpgradeModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUpgradeModalOpen, setIsUpgradeModalOpen]);

  if (!isUpgradeModalOpen) return null;

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (tier === userPlanTier) return;

    if (tier === 'free') {
      await upgradeUserPlan('free');
      return;
    }

    setIsProcessing(tier);

    // Simulate real-world Stripe checkout flow
    setTimeout(async () => {
      setIsProcessing(null);
      await upgradeUserPlan(tier);
      try {
        playSound('success');
        triggerConfetti();
      } catch {}
    }, 1200);
  };

  const planKeys: SubscriptionTier[] = ['free', 'pro', 'enterprise'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl border border-[#222533] bg-[#0c0d14] text-zinc-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-[#1b1d28] flex items-center justify-between shrink-0 bg-gradient-to-b from-[#131522] to-[#0c0d14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Workspace Plans & Upgrades</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Current: {userPlanTier.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Scale your visual sites with Next.js code export, custom domains, and white-label branding.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(false)}
            aria-label="Close upgrade modal"
            className="w-8 h-8 rounded-lg border border-[#222533] hover:border-zinc-500 bg-[#141622] hover:bg-[#1a1e30] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Reason Banner if opened from a feature gate */}
          {upgradeModalReason && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/20 border border-indigo-500/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="text-xs text-indigo-200 leading-relaxed">
                <span className="font-semibold text-white">Unlock Feature: </span>
                {upgradeModalReason}
              </div>
            </div>
          )}

          {/* Billing Cycle Switcher */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-[#131522] border border-[#202334] text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`relative px-4 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {planKeys.map((key) => {
              const plan = PLAN_CONFIGS[key];
              const isCurrent = userPlanTier === key;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={key}
                  className={`relative rounded-xl flex flex-col p-5 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-b from-[#181a2e] to-[#10121e] border-2 border-indigo-500 shadow-xl shadow-indigo-950/50'
                      : 'bg-[#10111a] border border-[#1e202f] hover:border-[#2e334a]'
                  }`}
                >
                  {/* Top Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </div>
                  )}

                  {/* Header info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{plan.name}</h3>
                      {key === 'enterprise' && <Crown className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px] leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-5 pb-5 border-b border-[#1c1f2e]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">${price}</span>
                      <span className="text-xs text-zinc-400">
                        {price === 0 ? 'forever' : '/ month'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && price > 0 && (
                      <p className="text-[10px] text-emerald-400 mt-1">
                        Billed annually (${price * 12}/yr) — 2 months free
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 text-xs ${
                          f.included ? (f.highlight ? 'text-indigo-200 font-medium' : 'text-zinc-300') : 'text-zinc-500 line-through'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            f.included
                              ? f.highlight
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-600'
                          }`}
                        >
                          {f.included ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        </div>
                        <span className="leading-snug">{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    disabled={isCurrent || isProcessing !== null}
                    onClick={() => handleSelectPlan(key)}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? 'bg-[#181a26] text-zinc-400 border border-[#272b3c] cursor-default'
                        : plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-[#191c2b] hover:bg-[#23273c] text-white border border-[#2a2f47]'
                    }`}
                  >
                    {isProcessing === key ? (
                      <span className="inline-flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Securing via Stripe...</span>
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Current Plan</span>
                      </span>
                    ) : (
                      <>
                        <span>{plan.buttonText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison Table Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="w-full py-2.5 px-4 rounded-xl border border-[#1e202f] bg-[#10111a] hover:bg-[#141624] text-xs font-medium text-zinc-300 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Compare Detailed Quotas & Technical Specifications</span>
              </div>
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showComparison && (
              <div className="mt-3 p-4 rounded-xl border border-[#1e202f] bg-[#0e0f17] overflow-x-auto animate-fade-in">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1d2030] text-zinc-400">
                      <th className="py-2.5 font-medium">Capability / Quota</th>
                      <th className="py-2.5 font-medium text-center">Free Starter</th>
                      <th className="py-2.5 font-medium text-center text-indigo-400">Pro Studio</th>
                      <th className="py-2.5 font-medium text-center text-purple-400">Studio Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171926] text-zinc-300">
                    <tr>
                      <td className="py-2.5 font-medium">Max Active Projects</td>
                      <td className="py-2.5 text-center text-zinc-400">2 Projects</td>
                      <td className="py-2.5 text-center text-emerald-400 font-semibold">Unlimited</td>
                      <td className="py-2.5 text-center text-emerald-400 font-semibold">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Multi-Page Support</td>
                      <td className="py-2.5 text-center text-zinc-400">Single Page</td>
                      <td className="py-2.5 text-center text-emerald-400 font-semibold">Unlimited Pages</td>
                      <td className="py-2.5 text-center text-emerald-400 font-semibold">Unlimited Pages</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Next.js 15 & React ZIP Export</td>
                      <td className="py-2.5 text-center text-zinc-500">—</td>
                      <td className="py-2.5 text-center text-emerald-400">Full Codebase ZIP</td>
                      <td className="py-2.5 text-center text-emerald-400">Full Codebase ZIP</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Remove Craft Studio Watermark</td>
                      <td className="py-2.5 text-center text-zinc-500">Badge Required</td>
                      <td className="py-2.5 text-center text-emerald-400">1-Click Toggle Off</td>
                      <td className="py-2.5 text-center text-emerald-400">Custom White-Label</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Custom Domain Routing</td>
                      <td className="py-2.5 text-center text-zinc-500">—</td>
                      <td className="py-2.5 text-center text-emerald-400">Up to 3 Domains</td>
                      <td className="py-2.5 text-center text-emerald-400">Unlimited + SSL</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Automated SEO 1-Click Fixes</td>
                      <td className="py-2.5 text-center text-zinc-400">Audit Only</td>
                      <td className="py-2.5 text-center text-emerald-400">Auto-Fix Enabled</td>
                      <td className="py-2.5 text-center text-emerald-400">Auto-Fix Enabled</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Cloud Asset Storage CDN</td>
                      <td className="py-2.5 text-center text-zinc-400">25 MB</td>
                      <td className="py-2.5 text-center text-emerald-400">2,048 MB (2 GB)</td>
                      <td className="py-2.5 text-center text-emerald-400">51,200 MB (50 GB)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Team Multiplayer Collaboration</td>
                      <td className="py-2.5 text-center text-zinc-500">—</td>
                      <td className="py-2.5 text-center text-zinc-500">—</td>
                      <td className="py-2.5 text-center text-emerald-400">Unlimited Seats</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1b1d28] bg-[#0a0b12] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted with 256-bit Stripe security. Cancel or switch plans anytime.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                showToast('Invoicing specialist contacted for custom team SLA.', 'info');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <span>Need custom enterprise invoicing?</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
