import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Inbox,
  Search,
  Download,
  RefreshCw,
  Mail,
  User,
} from 'lucide-react';
import { databaseService, type DatabaseSubmission } from '../../services/databaseService';
import { useEditor } from '../../context/useEditor';

interface LeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadsModal: React.FC<LeadsModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useEditor();
  const [submissions, setSubmissions] = useState<DatabaseSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormType, setSelectedFormType] = useState<string>('all');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await databaseService.getSubmissions();
      setSubmissions(data);
    } catch {
      showToast('Failed to load submissions', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  // Listen for real-time lead submissions in studio
  useEffect(() => {
    const handleNewLead = () => {
      fetchSubmissions();
    };
    window.addEventListener('studio:lead-submitted', handleNewLead);
    return () => window.removeEventListener('studio:lead-submitted', handleNewLead);
  }, []);

  // Form type options for filter
  const formTypes = useMemo(() => {
    const types = new Set<string>();
    submissions.forEach((s) => {
      if (s.form_type) types.add(s.form_type);
    });
    return Array.from(types);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        !searchTerm ||
        sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.data_json?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedFormType === 'all' || sub.form_type === selectedFormType;

      return matchesSearch && matchesType;
    });
  }, [submissions, searchTerm, selectedFormType]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredSubmissions.length === 0) {
      showToast('No submissions to export', 'warning');
      return;
    }

    const headers = ['ID', 'Form Type', 'Name', 'Email', 'Page Slug', 'Captured Data', 'Submitted At'];
    const rows = filteredSubmissions.map((s) => [
      s.id,
      `"${s.form_type || ''}"`,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.page_slug || ''}"`,
      `"${(s.data_json || '').replace(/"/g, '""')}"`,
      `"${s.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredSubmissions.length} leads to CSV! 📊`, 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark frosted scrim */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Solid obsidian modal card */}
      <div className="relative w-full max-w-4xl bg-[#0f1118] border border-[#232938] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-zinc-100 z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f2536] bg-[#121520]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Form Submissions & Leads
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[11px] font-semibold">
                  {submissions.length} Total
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time visitor leads captured from your forms, waitlists, and contact sections.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={isLoading}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              title="Refresh Submissions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Filter + Export */}
        <div className="px-6 py-3 border-b border-[#1f2536] bg-[#0c0e14] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search leads by name, email, or data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#151824] border border-[#232938] rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Form Type Filter */}
            {formTypes.length > 0 && (
              <div className="relative">
                <select
                  value={selectedFormType}
                  onChange={(e) => setSelectedFormType(e.target.value)}
                  className="text-xs bg-[#151824] border border-[#232938] rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Forms ({submissions.length})</option>
                  {formTypes.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Content Body: Table or Empty State */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">No submissions yet</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                When visitors submit contact forms, waitlists, or feedback on your live site, their data will appear right here in real time.
              </p>
            </div>
          ) : (
            <div className="border border-[#22283a] rounded-xl overflow-hidden shadow-sm bg-[#121522]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#22283a] bg-[#161a2b] text-zinc-400 font-medium">
                    <th className="py-2.5 px-4">Visitor / Contact</th>
                    <th className="py-2.5 px-4">Form</th>
                    <th className="py-2.5 px-4">Captured Details</th>
                    <th className="py-2.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2334]">
                  {filteredSubmissions.map((sub) => {
                    let parsedData: Record<string, any> = {};
                    try {
                      parsedData = typeof sub.data_json === 'string' ? JSON.parse(sub.data_json) : sub.data_json || {};
                    } catch {}

                    return (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Visitor Contact */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{sub.name || 'Anonymous'}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            <a href={`mailto:${sub.email}`} className="hover:underline hover:text-indigo-300">
                              {sub.email || 'No email provided'}
                            </a>
                          </div>
                        </td>

                        {/* Form Type */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono font-medium">
                            {sub.form_type || 'General Form'}
                          </span>
                          {sub.page_slug && (
                            <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                              /{sub.page_slug}
                            </div>
                          )}
                        </td>

                        {/* Details */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="space-y-1">
                            {Object.entries(parsedData)
                              .filter(([k]) => k !== 'projectId' && k !== 'submittedAt')
                              .map(([k, v]) => (
                                <div key={k} className="text-[11px] text-zinc-300 flex items-baseline gap-1.5">
                                  <span className="text-zinc-500 font-mono text-[10px] uppercase">{k}:</span>
                                  <span className="font-medium truncate">{String(v)}</span>
                                </div>
                              ))}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                          {sub.created_at || 'Just now'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1f2536] bg-[#0c0e14] flex items-center justify-between text-xs text-zinc-500">
          <span>
            Connected to <strong>Supabase & Local Cloud Storage</strong>. All submissions are automatically synced.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#191e2b] hover:bg-[#23293a] text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
