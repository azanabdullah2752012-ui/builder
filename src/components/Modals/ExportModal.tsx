import React, { useState, useMemo } from 'react';
import { useEditor } from '../../context/useEditor';
import { generateExportHtml } from '../../utils/exportHtml';
import { X, Copy, Check, Download, Code2, Globe } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project, activePage, showToast } = useEditor();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'json'>('html');

  const generatedHtml = useMemo(() => {
    return generateExportHtml(project, activePage);
  }, [project, activePage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const textToCopy = activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2);
    const filename =
      activeTab === 'html'
        ? `${project.name.toLowerCase().replace(/\s+/g, '-')}-${activePage.slug.replace('/', '') || 'index'}.html`
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Export Production Code</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Pure HTML/CSS
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Export hierarchy-aware semantic HTML and responsive CSS with user-configured breakpoints.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab & Format Bar */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'html'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Full Website (HTML+CSS)</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'json'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Project JSON (Schema)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-blue-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Preview Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed select-text">
          <pre className="whitespace-pre overflow-x-auto">
            {activeTab === 'html' ? generatedHtml : JSON.stringify(project, null, 2)}
          </pre>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>Target: </span>
            <span className="text-slate-300 font-medium">{project.name} &bull; {activePage.name}</span>
          </div>
          <div>
            <span>Elements: </span>
            <span className="text-slate-300 font-medium">{activePage.elements.length} components</span>
          </div>
        </div>
      </div>
    </div>
  );
};
