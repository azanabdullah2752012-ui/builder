import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/useEditor';
import { generateExportHtml } from '../../utils/exportHtml';
import { createZipArchive } from '../../utils/zipExport';
import { X, Copy, Check, Download, Code2, Globe, Archive } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project, activePage, showToast } = useEditor();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'json'>('html');
  const [selectedPageId, setSelectedPageId] = useState<string>(activePage.id);

  // Sync selected page with activePage when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPageId(activePage.id);
    }
  }, [isOpen, activePage.id]);

  const targetPage = useMemo(() => {
    return project.pages.find((p) => p.id === selectedPageId) || activePage;
  }, [project.pages, selectedPageId, activePage]);

  const generatedHtml = useMemo(() => {
    return generateExportHtml(project, targetPage);
  }, [project, targetPage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const textToDownload = activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2);
    const slugName = (targetPage.slug || targetPage.name || 'index')
      .replace(/^\//, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const filename =
      activeTab === 'html'
        ? `${project.name.toLowerCase().replace(/\s+/g, '-')}-${slugName || 'index'}.html`
        : `${project.name.toLowerCase().replace(/\s+/g, '-')}-project.json`;

    const blob = new Blob([textToDownload], {
      type: activeTab === 'html' ? 'text/html;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  };

  const handleDownloadAllZip = () => {
    try {
      const files: { filename: string; content: string }[] = [];

      // Generate HTML for each page
      project.pages.forEach((page, index) => {
        const pageHtml = generateExportHtml(project, page);
        let filename: string;
        if (index === 0 || page.slug === '/' || page.slug === '') {
          filename = 'index.html';
        } else {
          const cleanSlug = (page.slug || page.name)
            .replace(/^\//, '')
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-');
          filename = `${cleanSlug || `page-${index + 1}`}.html`;
        }
        files.push({ filename, content: pageHtml });
      });

      // Add project schema
      files.push({
        filename: 'project.json',
        content: JSON.stringify(project, null, 2),
      });

      // Add README
      files.push({
        filename: 'README.md',
        content: `# ${project.name}

Exported from Pickle Studio by Pickle Corp™ — No AI. No Code. No Slop.

## Included Pages (${project.pages.length}):
${project.pages.map((p, i) => `- **${p.name}**: \`${i === 0 ? 'index.html' : `${(p.slug || p.name).replace(/^\//, '')}.html`}\``).join('\n')}

## Deployment
Upload these files directly to any static web host:
- Vercel: \`vercel deploy\`
- Netlify: Drag and drop this folder
- Cloudflare Pages: Connect repository or upload folder
- GitHub Pages: Commit to \`gh-pages\` branch
`,
      });

      const zipBlob = createZipArchive(files);
      const zipFilename = `${project.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}-full-website.zip`;

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported full site bundle (${project.pages.length} pages)`, 'success');
    } catch (err) {
      console.error('Failed to generate zip:', err);
      showToast('Failed to generate ZIP archive', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1015] border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-wide">
                  Export Production Code
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Pure HTML/CSS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  {project.pages.length} {project.pages.length === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Export hierarchy-aware semantic HTML, responsive CSS, and full multi-page ZIP archives.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab & Format Bar */}
        <div className="px-4 py-2.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-black/20">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'html'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>HTML/CSS</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activeTab === 'json'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Project JSON</span>
              </button>
            </div>

            {/* Page preview selector if HTML tab and multiple pages */}
            {activeTab === 'html' && project.pages.length > 1 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">Page:</span>
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="bg-[#15161c] border border-white/10 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {project.pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug || '/'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadSingle}
              className="px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeTab === 'html' ? 'Page HTML' : 'JSON'}</span>
            </button>

            <button
              onClick={handleDownloadAllZip}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-600/20"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download Full Site (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Code Preview Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-[#0a0a0d] font-mono text-[11px] text-slate-300 leading-relaxed select-text">
          <pre className="whitespace-pre overflow-x-auto">
            {activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2)}
          </pre>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>Viewing: </span>
            <span className="text-slate-200 font-medium">{project.name} &bull; {targetPage.name}</span>
          </div>
          <div>
            <span>Components: </span>
            <span className="text-slate-200 font-medium">{targetPage.elements.length} elements</span>
          </div>
        </div>
      </div>
    </div>
  );
};
