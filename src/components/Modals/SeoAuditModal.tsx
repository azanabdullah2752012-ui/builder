import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Wand2,
  Globe,
  Share2,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { useEditor } from '../../context/useEditor';
import { auditProjectSeo, autoFixSeoIssues } from '../../utils/seoAuditEngine';

interface SeoAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeoAuditModal: React.FC<SeoAuditModalProps> = ({ isOpen, onClose }) => {
  const {
    activePage,
    project,
    updatePageSettings,
    updateProjectSettings,
    showToast,
  } = useEditor();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [seoTitleInput, setSeoTitleInput] = useState<string>(
    project.publishConfig?.seoTitle || activePage.name || project.name || ''
  );
  const [seoDescInput, setSeoDescInput] = useState<string>(
    project.publishConfig?.seoDescription || ''
  );
  const [ogImageInput, setOgImageInput] = useState<string>(
    project.publishConfig?.ogImage || ''
  );

  // Synchronize input fields when modal opens or activePage changes
  React.useEffect(() => {
    if (isOpen) {
      setSeoTitleInput(project.publishConfig?.seoTitle || activePage.name || project.name || '');
      setSeoDescInput(project.publishConfig?.seoDescription || '');
      setOgImageInput(project.publishConfig?.ogImage || '');
    }
  }, [isOpen, activePage, project]);

  // Compute live SEO audit report
  const auditReport = useMemo(() => {
    return auditProjectSeo(activePage, project.publishConfig, project);
  }, [activePage, project]);

  if (!isOpen) return null;

  // Filter checks by category
  const filteredChecks = auditReport.checks.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Handle 1-Click Auto-Fix
  const handleAutoFix = () => {
    const { updatedPage, updatedPublishConfig, fixedCount } = autoFixSeoIssues(
      activePage,
      project.publishConfig,
      project
    );

    if (fixedCount === 0) {
      showToast('All SEO parameters are already fully optimized!', 'info');
      return;
    }

    updatePageSettings(activePage.id, { elements: updatedPage.elements });
    updateProjectSettings({
      publishConfig: updatedPublishConfig,
    });

    setSeoTitleInput(updatedPublishConfig.seoTitle || '');
    setSeoDescInput(updatedPublishConfig.seoDescription || '');
    setOgImageInput(updatedPublishConfig.ogImage || '');

    showToast(`Successfully auto-fixed ${fixedCount} SEO & accessibility issues!`, 'success');
  };

  // Save manual SEO metadata edits
  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectSettings({
      publishConfig: {
        ...(project.publishConfig || { slug: activePage.slug }),
        seoTitle: seoTitleInput.trim(),
        seoDescription: seoDescInput.trim(),
        ogImage: ogImageInput.trim(),
      },
    });
    showToast('SEO metadata saved successfully', 'success');
  };

  // Grade color scheme
  const gradeColor =
    auditReport.grade === 'A+' || auditReport.grade === 'A'
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : auditReport.grade === 'B'
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/40 bg-rose-500/10';

  const scoreBarColor =
    auditReport.score >= 85
      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
      : auditReport.score >= 70
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-500 to-orange-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#12141a] border border-[#232734] rounded-2xl shadow-2xl overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232734] flex items-center justify-between bg-[#151821]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  SEO & Accessibility Command Center
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor}`}>
                  Grade {auditReport.grade}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Real-time search engine optimization, semantic heading structure & social card preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Score Radial Card */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Overall Health</span>
                <Gauge className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-white">
                  {auditReport.score}
                </span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
              <div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${scoreBarColor}`}
                    style={{ width: `${auditReport.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Passed Checks Card */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400">Passed Checks</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white">
                {auditReport.passedCount}
              </div>
              <span className="text-[11px] text-zinc-500">Fully compliant with search engine rules</span>
            </div>

            {/* Warnings Card */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400">Optimization Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white">
                {auditReport.warningCount}
              </div>
              <span className="text-[11px] text-zinc-500">Suggested improvements for higher ranking</span>
            </div>

            {/* 1-Click Auto-Fix Action */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI SEO Auto-Fixer</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  Automatically set titles, meta descriptions, image alts & H1 heading hierarchy.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoFix}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Fix All Issues</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 border-b border-[#232734] pb-2 text-xs">
            {['all', 'SEO', 'Accessibility', 'Performance', 'Social Sharing'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'All Audits' : cat}
              </button>
            ))}
          </div>

          {/* Audit Checks Checklist */}
          <div className="space-y-2.5">
            {filteredChecks.map((check) => {
              const statusBadge =
                check.status === 'pass' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Passed
                  </span>
                ) : check.status === 'warning' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    Warning
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-3 h-3" />
                    Needs Fix
                  </span>
                );

              return (
                <div
                  key={check.id + check.title}
                  className="p-3.5 rounded-xl bg-[#161a24] border border-[#242a3a] flex items-start justify-between gap-4 hover:border-[#343d54] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{check.title}</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {check.category}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        Impact: <strong className="text-zinc-300">{check.impact}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{check.description}</p>
                  </div>
                  <div className="shrink-0">{statusBadge}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Direct SEO Metadata Editor */}
          <div className="p-5 rounded-xl bg-[#161a24] border border-[#242a3a] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Live Search Engine Snippet Editor</h3>
              </div>
              <span className="text-xs text-zinc-500">Updates &lt;head&gt; tags on Publish & Export</span>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Page SEO Title (Google SERP)</span>
                  <span className={seoTitleInput.length > 60 ? 'text-amber-400' : 'text-zinc-500'}>
                    {seoTitleInput.length} / 60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitleInput}
                  onChange={(e) => setSeoTitleInput(e.target.value)}
                  placeholder="e.g. Modern Architecture Portfolio | Studio Apex"
                  className="w-full px-3 py-2 rounded-lg bg-[#101217] border border-[#262c3e] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Meta Description</span>
                  <span className={seoDescInput.length > 160 ? 'text-amber-400' : 'text-zinc-500'}>
                    {seoDescInput.length} / 160 characters
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoDescInput}
                  onChange={(e) => setSeoDescInput(e.target.value)}
                  placeholder="Compelling description summarizing the value proposition of this page for Google search results..."
                  className="w-full px-3 py-2 rounded-lg bg-[#101217] border border-[#262c3e] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>OpenGraph Social Preview Image (Twitter / LinkedIn)</span>
                  <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <input
                  type="url"
                  value={ogImageInput}
                  onChange={(e) => setOgImageInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#101217] border border-[#262c3e] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save SEO Metadata
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
