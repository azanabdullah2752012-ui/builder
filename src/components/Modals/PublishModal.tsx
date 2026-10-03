import React, { useState, useEffect, useMemo } from 'react';
import { useEditor } from '../../context/useEditor';
import { databaseService } from '../../services/databaseService';
import { slugify, generateEmbedCode, generateQrCodeSvg, getAppBaseUrl, getLiveUrl } from '../../utils/publishUtils';
import { generateExportHtml } from '../../utils/exportHtml';
import { triggerConfetti, playSound } from '../../utils/interactiveEffects';
import {
  X,
  Globe,
  QrCode,
  Share2,
  Code,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Sparkles,
  Download,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Lock,
  AlertCircle,
} from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const { project, updateProjectSettings, activePage, showToast } = useEditor();

  const [activeTab, setActiveTab] = useState<'url' | 'qr' | 'social' | 'embed'>('url');
  const [customSlug, setCustomSlug] = useState<string>(project.slug || slugify(project.name) || 'my-site');
  const [seoTitle, setSeoTitle] = useState<string>(project.publishConfig?.seoTitle || project.name);
  const [seoDesc, setSeoDesc] = useState<string>(
    project.publishConfig?.seoDescription || `Welcome to ${project.name}, designed and built visually with Pickle Studio by Pickle Corp.`
  );
  const [webhookUrl, setWebhookUrl] = useState<string>(project.publishConfig?.webhookUrl || '');
  const [removeBranding, setRemoveBranding] = useState<boolean>(project.publishConfig?.removeBranding ?? false);

  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isUnpublishing, setIsUnpublishing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken'>('available');

  const baseUrl = getAppBaseUrl();
  const liveUrl = getLiveUrl(customSlug);

  // Sync state when project updates
  useEffect(() => {
    if (project.slug) setCustomSlug(project.slug);
    if (project.publishConfig?.seoTitle) setSeoTitle(project.publishConfig.seoTitle);
    if (project.publishConfig?.seoDescription) setSeoDesc(project.publishConfig.seoDescription);
    if (project.publishConfig?.webhookUrl) setWebhookUrl(project.publishConfig.webhookUrl);
    if (project.publishConfig?.removeBranding !== undefined) setRemoveBranding(project.publishConfig.removeBranding);
  }, [project]);

  // Debounced slug check
  useEffect(() => {
    const clean = slugify(customSlug);
    if (!clean || clean.length < 3) {
      setSlugStatus('taken');
      return;
    }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      const res = await databaseService.isSlugAvailable(clean, project.id);
      setSlugStatus(res.available ? 'available' : 'taken');
    }, 400);
    return () => clearTimeout(timer);
  }, [customSlug, project.id]);

  const qrCodeSvg = useMemo(() => {
    return generateQrCodeSvg(liveUrl, 200);
  }, [liveUrl]);

  const embedCodeSnippet = useMemo(() => {
    return generateEmbedCode(liveUrl, project.name);
  }, [liveUrl, project.name]);

  if (!isOpen) return null;

  // Handler for Publishing or Updating live project
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const cleanSlug = slugify(customSlug) || project.id;
      const res = await databaseService.publishProject(project, {
        customDomain: cleanSlug,
        seoTitle,
        seoDescription: seoDesc,
        removeBranding,
        webhookUrl,
      });

      if (res.success) {
        updateProjectSettings({
          slug: cleanSlug,
          isPublic: true,
          publishedAt: res.publishedAt,
          publishConfig: {
            ...project.publishConfig,
            customDomain: cleanSlug,
            seoTitle,
            seoDescription: seoDesc,
            removeBranding,
            webhookUrl,
            publishedAt: res.publishedAt,
          },
        });
        triggerConfetti();
        playSound('success');
        showToast('🚀 Hooray! Your site is live on the internet!', 'success');
      } else {
        showToast(res.error || 'Failed to publish site to cloud', 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'Error publishing site', 'warning');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handler for taking site offline
  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    try {
      const res = await databaseService.unpublishProject(project);
      if (res.success) {
        updateProjectSettings({ isPublic: false });
        showToast('⚪ Site is now offline (Private Draft).', 'info');
      } else {
        showToast(res.error || 'Failed to unpublish site', 'warning');
      }
    } catch (err: any) {
      showToast(err.message || 'Error unpublishing site', 'warning');
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    showToast('Copied live link to clipboard! 📋', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCodeSnippet);
    setCopiedEmbed(true);
    showToast('Copied responsive iframe embed code! 📋', 'success');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadQr = () => {
    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customSlug}-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded QR Code vector SVG! 📱', 'success');
  };

  const handleDownloadStandaloneBundle = () => {
    const html = generateExportHtml(project, activePage);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customSlug}-production.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded standalone production HTML bundle! 📦', 'success');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: 'rgba(4, 6, 11, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl rounded-2xl flex flex-col overflow-hidden text-zinc-200 select-none animate-scale-in"
        style={{
          backgroundColor: '#0d1017',
          border: '1px solid #202738',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.06)',
          maxHeight: '88vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 px-5 flex items-center justify-between shrink-0"
          style={{
            backgroundColor: '#121622',
            borderBottom: '1px solid #1e2434',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.28)',
              }}
            >
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Publish to Web</h2>
                {project.isPublic ? (
                  <span
                    className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ONLINE
                  </span>
                ) : (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: '#1c2234',
                      color: '#94a3b8',
                      border: '1px solid #28334a',
                    }}
                  >
                    OFFLINE DRAFT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Instant public web address, mobile QR testing, and social previews.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="px-5 flex items-center gap-1 text-xs shrink-0"
          style={{
            backgroundColor: '#0a0d14',
            borderBottom: '1px solid #1a2030',
          }}
        >
          {[
            { id: 'url', label: 'Live URL', icon: Globe },
            { id: 'qr', label: 'Mobile QR', icon: QrCode },
            { id: 'social', label: 'Social & SEO', icon: Share2 },
            { id: 'embed', label: 'Embed & Deploy', icon: Code },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="py-2.5 px-3 font-medium flex items-center gap-1.5 transition-all text-xs"
                style={{
                  color: active ? '#ffffff' : '#8896ab',
                  borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
                  backgroundColor: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: active ? '#818cf8' : '#64748b' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4" style={{ maxHeight: 'calc(88vh - 125px)' }}>
          {/* TAB 1: LIVE URL & PUBLISHING */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* Live Web Address Box */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  backgroundColor: '#131722',
                  border: '1px solid #202738',
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Public Web Address</span>
                  </label>

                  <div className="text-[11px] font-mono">
                    {slugStatus === 'checking' && (
                      <span className="text-zinc-400">Checking...</span>
                    )}
                    {slugStatus === 'available' && (
                      <span
                        className="px-2 py-0.5 rounded-md font-medium text-[10px]"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.12)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        ✓ Slug Available
                      </span>
                    )}
                    {slugStatus === 'taken' && (
                      <span
                        className="px-2 py-0.5 rounded-md font-medium text-[10px]"
                        style={{
                          backgroundColor: 'rgba(244, 63, 94, 0.12)',
                          color: '#fda4af',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                        }}
                      >
                        ✕ Taken or too short
                      </span>
                    )}
                  </div>
                </div>

                {/* Input Chassis */}
                <div
                  className="flex items-center rounded-lg overflow-hidden transition-colors"
                  style={{
                    backgroundColor: '#0a0d14',
                    border: '1px solid #263044',
                  }}
                >
                  <div
                    className="px-3 py-2 text-zinc-400 font-mono text-xs select-none shrink-0"
                    style={{
                      backgroundColor: '#10131c',
                      borderRight: '1px solid #1e2434',
                    }}
                  >
                    {baseUrl}/?p=
                  </div>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(slugify(e.target.value))}
                    placeholder="my-cool-site"
                    className="flex-1 bg-transparent border-none text-white font-mono text-xs font-semibold outline-none px-3 py-2"
                  />
                  {project.isPublic && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mr-2 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all"
                      style={{
                        backgroundColor: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        border: '1px solid rgba(99, 102, 241, 0.35)',
                      }}
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Status Notice */}
                {project.isPublic ? (
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Live release synced to Supabase Cloud
                      {project.publishedAt && ` • ${new Date(project.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Currently in private draft mode. Click Publish below to make it live.</span>
                  </p>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing || slugStatus === 'taken'}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  style={{
                    backgroundColor: project.isPublic ? '#4f46e5' : '#10b981',
                    boxShadow: project.isPublic
                      ? '0 4px 14px rgba(79, 70, 229, 0.35)'
                      : '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Deploying Changes to Cloud...</span>
                    </>
                  ) : project.isPublic ? (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Update Live Website Changes</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 text-white" />
                      <span>🚀 Publish Live to Web Now</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-lg text-zinc-200 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    style={{
                      backgroundColor: '#181d2a',
                      border: '1px solid #2a344a',
                    }}
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Live Link'}</span>
                  </button>

                  {project.isPublic && (
                    <button
                      type="button"
                      onClick={handleUnpublish}
                      disabled={isUnpublishing}
                      className="py-2 px-3 rounded-lg text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                      }}
                      title="Take site offline"
                    >
                      <span>Take Offline</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Faux Browser Window Simulation Card */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: '#0a0d14',
                  border: '1px solid #1e2536',
                }}
              >
                {/* Browser Title Bar */}
                <div
                  className="px-3.5 py-2 flex items-center justify-between text-xs"
                  style={{
                    backgroundColor: '#121622',
                    borderBottom: '1px solid #1a2030',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }} />
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 ml-2"
                      style={{ backgroundColor: '#090b10', border: '1px solid #1a2030' }}
                    >
                      <Lock className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{baseUrl}/?p={customSlug}</span>
                    </div>
                  </div>

                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Content description */}
                <div className="p-3.5 text-xs text-zinc-400 leading-relaxed flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-zinc-200 font-medium">Full-Bleed Public Visitor Mode</p>
                    <p className="text-[11px] text-zinc-400">
                      Visitors access your site directly with full responsive artboards and interactive triggers. Zero login required.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOBILE QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div
                className="p-5 rounded-xl flex flex-col sm:flex-row items-center gap-5"
                style={{
                  backgroundColor: '#131722',
                  border: '1px solid #202738',
                }}
              >
                <div
                  className="shrink-0 p-3 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: '#06080d',
                    border: '1px solid #28334a',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  }}
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                />

                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Instant Mobile Device Testing</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Point your phone's camera at this QR code to immediately preview your responsive layout, touch interactions, and tactile audio on iOS or Android.
                    </p>
                  </div>

                  <div
                    className="p-2 px-3 rounded-lg font-mono text-[11px] text-zinc-300 break-all select-all"
                    style={{
                      backgroundColor: '#0a0d14',
                      border: '1px solid #202738',
                    }}
                  >
                    {liveUrl}
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="py-1.5 px-3.5 rounded-lg text-white font-medium text-xs inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    style={{
                      backgroundColor: '#202738',
                      border: '1px solid #2d3850',
                    }}
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download Vector QR (SVG)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL PREVIEW & SEO */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              {/* Social Media Preview Card Mockup */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: '#0c0f17',
                  border: '1px solid #202738',
                }}
              >
                <div
                  className="px-3.5 py-1.5 text-[10px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
                  style={{
                    backgroundColor: '#131722',
                    borderBottom: '1px solid #1e2434',
                  }}
                >
                  <Share2 className="w-3 h-3 text-indigo-400" />
                  <span>Social Share Card Preview (Twitter / LinkedIn)</span>
                </div>

                <div className="p-3.5 space-y-2">
                  <div
                    className="h-28 rounded-lg flex items-center justify-center p-4 text-center"
                    style={{
                      background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                    }}
                  >
                    <div>
                      <p className="text-white font-bold text-sm tracking-tight">{seoTitle || project.name}</p>
                      <p className="text-[11px] text-indigo-300/80 mt-1 line-clamp-1">{seoDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase">picklestudio.dev</p>
                    <p className="text-xs font-semibold text-zinc-100">{seoTitle || project.name}</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2">{seoDesc}</p>
                  </div>
                </div>
              </div>

              {/* Form Inputs */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  backgroundColor: '#131722',
                  border: '1px solid #202738',
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">SEO Page Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Enter social sharing title"
                    className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                    style={{
                      backgroundColor: '#0a0d14',
                      border: '1px solid #263044',
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    placeholder="Brief description for search engines and social cards"
                    className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none resize-none"
                    style={{
                      backgroundColor: '#0a0d14',
                      border: '1px solid #263044',
                    }}
                  />
                </div>

                {/* Watermark toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-zinc-200">White-label: Remove Studio Branding</p>
                    <p className="text-[11px] text-zinc-400">
                      Hide the "Made with Pickle Studio" footer pill on your public site.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={removeBranding}
                    onChange={(e) => setRemoveBranding(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMBED & DEPLOY */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              {/* Responsive Iframe Embed Code */}
              <div
                className="p-4 rounded-xl space-y-2.5"
                style={{
                  backgroundColor: '#131722',
                  border: '1px solid #202738',
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Responsive Iframe Embed Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmbed}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-indigo-300 hover:text-white transition-all flex items-center gap-1"
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    {copiedEmbed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmbed ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                </div>

                <div
                  className="p-3 rounded-lg font-mono text-[11px] text-indigo-200 overflow-x-auto select-all leading-relaxed"
                  style={{
                    backgroundColor: '#07090e',
                    border: '1px solid #1c2334',
                  }}
                >
                  {embedCodeSnippet}
                </div>
                <p className="text-[11px] text-zinc-500">
                  Embed this responsive 16:9 frame inside Notion, Webflow, WordPress, or any web application.
                </p>
              </div>

              {/* Webhook & Bundle Download */}
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  backgroundColor: '#131722',
                  border: '1px solid #202738',
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deploy Webhook URL (CI/CD)</span>
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/publish-webhook"
                    className="w-full px-3 py-2 rounded-lg text-xs text-white outline-none"
                    style={{
                      backgroundColor: '#0a0d14',
                      border: '1px solid #263044',
                    }}
                  />
                  <p className="text-[11px] text-zinc-500">
                    Triggers external redeployments to Netlify, Vercel, or custom API webhooks on publication.
                  </p>
                </div>

                <div
                  className="pt-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid #1c2334' }}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-zinc-200">Standalone Production HTML Bundle</p>
                    <p className="text-[11px] text-zinc-400">
                      Download self-contained single-file HTML bundle with all inline styles and interactive action handlers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadStandaloneBundle}
                    className="py-1.5 px-3 rounded-lg text-white font-medium text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: '#202738',
                      border: '1px solid #2d3850',
                    }}
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download .html</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
