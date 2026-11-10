import React, { useState } from 'react';
import { useEditor } from '../../context/useEditor';
import {
  Sparkles,
  Layers,
  FileCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  MousePointer,
  Smartphone,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { createHeroSection, createNavbarSection } from '../../constants/templates';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const {
    resetToBlank,
    resetToDefaultDemo,
    addElements,
    setEditorComplexity,
    showToast,
  } = useEditor();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<'saas' | 'portfolio' | 'blank'>('saas');

  if (!isOpen) return null;

  const handleFinish = () => {
    try {
      localStorage.setItem('pickle_onboarding_completed', 'true');
    } catch {}

    if (selectedTemplate === 'blank') {
      resetToBlank();
    } else if (selectedTemplate === 'portfolio') {
      resetToBlank();
      const nav = createNavbarSection(0);
      const hero = createHeroSection(80);
      addElements([...nav, ...hero]);
      showToast('Loaded Clean Minimal Template', 'success');
    } else {
      resetToDefaultDemo();
    }

    setEditorComplexity('simple');
    onClose();
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('pickle_onboarding_completed', 'true');
    } catch {}
    onClose();
  };

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c0e14] border border-[#23283a] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-[#f8fafc] flex flex-col"
      >
        {/* Top Progress & Close Bar */}
        <div className="px-6 py-4 border-b border-[#1a1f2e] flex items-center justify-between bg-[#11131a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1a1f2e] border border-[#23283a] flex items-center justify-center text-[#1076fc] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Welcome to Pickle Studio</h2>
              <p className="text-[11px] text-zinc-400">Step {step} of 3 • Quick 30-Second Setup</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 mr-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step
                      ? 'w-6 bg-[#1076fc] shadow-[0_0_8px_rgba(184,243,107,0.5)]'
                      : s < step
                      ? 'w-2 bg-[#23283a]'
                      : 'w-2 bg-[#1a1f2e]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleSkip}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6">
          {/* STEP 1: Choose Starting Canvas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Choose your starting point</h3>
                <p className="text-xs text-zinc-400">
                  Pick a layout to get started. You can customize every single element or start from a clean slate.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Option 1: Complete SaaS */}
                <div
                  onClick={() => setSelectedTemplate('saas')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTemplate === 'saas'
                      ? 'border-[#1076fc] bg-[#1076fc]/10 shadow-[0_0_15px_rgba(184,243,107,0.15)] ring-1 ring-[#1076fc]/40'
                      : 'border-[#23283a] bg-[#11131a] hover:border-zinc-600 hover:bg-[#131620]'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center mb-3">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">SaaS Landing Page</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Hero section, live product preview, features grid, and high-impact CTA.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#1a1f2e] flex items-center text-[10px] font-semibold text-[#1076fc]">
                    <span>Recommended</span>
                  </div>
                </div>

                {/* Option 2: Clean Minimal */}
                <div
                  onClick={() => setSelectedTemplate('portfolio')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTemplate === 'portfolio'
                      ? 'border-[#1076fc] bg-[#1076fc]/10 shadow-[0_0_15px_rgba(184,243,107,0.15)] ring-1 ring-[#1076fc]/40'
                      : 'border-[#23283a] bg-[#11131a] hover:border-zinc-600 hover:bg-[#131620]'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center mb-3">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Clean Minimal</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Lightweight header and focused hero headline. Easy and uncluttered.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#1a1f2e] flex items-center text-[10px] text-zinc-400 font-medium">
                    <span>Fast Starter</span>
                  </div>
                </div>

                {/* Option 3: Blank Canvas */}
                <div
                  onClick={() => setSelectedTemplate('blank')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedTemplate === 'blank'
                      ? 'border-[#1076fc] bg-[#1076fc]/10 shadow-[0_0_15px_rgba(184,243,107,0.15)] ring-1 ring-[#1076fc]/40'
                      : 'border-[#23283a] bg-[#11131a] hover:border-zinc-600 hover:bg-[#131620]'
                  }`}
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center mb-3">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-white mb-1">Blank Canvas</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Fresh workspace. Add sections and elements as you go.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#1a1f2e] flex items-center text-[10px] text-zinc-400 font-medium">
                    <span>From Scratch</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Visual Editing Made Simple */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Visual editing without cognitive overload</h3>
                <p className="text-xs text-zinc-400">
                  Pickle Studio is engineered by Kaiser & Thanvi (Pickle Corp) to keep your workspace clean, focused, and frustration-free.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#11131a] border border-[#1a1f2e]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center shrink-0 mt-0.5">
                    <MousePointer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Click any element to customize</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Select text, buttons, or cards on the canvas. The Inspector on the right shows only the essential edits first (text, colors, size).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#11131a] border border-[#1a1f2e]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Simple Mode vs Pro Mode</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      You are starting in <strong>Simple Mode</strong>: clutter-free canvas with no distracting technical jargon. Switch to <strong>Pro Mode</strong> anytime with 1 click in the top bar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#11131a] border border-[#1a1f2e]">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Instant Responsive Views</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Preview how your design reflows on Desktop, Tablet, and Mobile with the top viewport selector.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: 100% Free Forever & Export */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1">100% Free • All Features Unlocked</h3>
                <p className="text-xs text-zinc-400">
                  No subscriptions, no tier restrictions, and no paywalls. You own your code.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#11131a] border border-[#23283a] space-y-3">
                <div className="flex items-center gap-2 text-[#1076fc] font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free Forever with Complete Access</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1076fc] shrink-0" />
                    <span>Unlimited Web Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1076fc] shrink-0" />
                    <span>Production HTML/CSS Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1076fc] shrink-0" />
                    <span>All Section Templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1076fc] shrink-0" />
                    <span>No Credit Card Required</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#11131a] border border-[#1a1f2e] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] text-[#1076fc] flex items-center justify-center">
                    <FileCode className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    <span className="font-semibold text-white">Export Code:</span> Download production HTML/CSS bundle anytime.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1a1f2e] flex items-center justify-between bg-[#11131a]">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#23283a] bg-[#0c0e14] hover:bg-[#131620] text-zinc-300 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip Tour
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1076fc] hover:bg-[#2584ff] text-[#0c0e14] text-xs font-bold transition-all shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1076fc] hover:bg-[#2584ff] text-[#0c0e14] text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0c0e14]" />
              <span>Start Building Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
