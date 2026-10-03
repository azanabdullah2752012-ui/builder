import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Users,
  Eye,
  ShoppingBag,
  Inbox,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  Globe,
  MousePointerClick,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  getAnalyticsSummary,
  trackAnalyticsEvent,
  clearAnalyticsData,
  type AnalyticsSummary,
} from '../../utils/analyticsEngine';
import { databaseService } from '../../services/databaseService';
import { useEditor } from '../../context/useEditor';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const { activePage, showToast } = useEditor();
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Fetch real form submissions from databaseService
  useEffect(() => {
    if (isOpen) {
      databaseService
        .getSubmissions()
        .then((subs) => setLeadsCount(subs.length))
        .catch(() => {});
    }
  }, [isOpen]);

  // Listen to live analytics events
  useEffect(() => {
    const handleEvent = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('studio:analytics:event', handleEvent);
    window.addEventListener('studio:analytics:cleared', handleEvent);
    return () => {
      window.removeEventListener('studio:analytics:event', handleEvent);
      window.removeEventListener('studio:analytics:cleared', handleEvent);
    };
  }, []);

  // Compute analytics summary
  const summary: AnalyticsSummary = useMemo(() => {
    return getAnalyticsSummary(timeframe, 'all', leadsCount);
  }, [timeframe, leadsCount, refreshTrigger]);

  if (!isOpen) return null;

  const handleSimulateVisitor = () => {
    const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'mobile', 'tablet'];
    const device = devices[Math.floor(Math.random() * devices.length)];
    trackAnalyticsEvent({
      type: 'pageview',
      pageSlug: activePage.slug,
      device,
    });
    trackAnalyticsEvent({
      type: 'click',
      targetName: 'Hero Primary Action',
      pageSlug: activePage.slug,
      device,
    });
    showToast('Simulated real-time visitor session recorded!', 'info');
  };

  const handleResetData = () => {
    clearAnalyticsData();
    showToast('Analytics data reset to baseline', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#12141a] border border-[#232734] rounded-2xl shadow-2xl overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#232734] flex items-center justify-between bg-[#151821]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Studio Analytics & Performance
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Tracking
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Visitor engagement, conversion funnels, storefront sales & device insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeframe Switcher */}
            <div className="flex items-center bg-[#101217] border border-[#232734] rounded-lg p-0.5 text-xs">
              {(
                [
                  { id: '24h', label: '24h' },
                  { id: '7d', label: '7d' },
                  { id: '30d', label: '30d' },
                  { id: 'all', label: 'All' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeframe(t.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    timeframe === t.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Page Views */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium">Total Views</span>
                <Eye className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white tracking-tight">
                {summary.totalViews.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{summary.viewsTrend}% vs previous period</span>
              </div>
            </div>

            {/* 2. Unique Visitors */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium">Unique Visitors</span>
                <Users className="w-4 h-4 text-teal-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white tracking-tight">
                {summary.uniqueVisitors.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{summary.visitorsTrend}% new audience</span>
              </div>
            </div>

            {/* 3. Form Inquiries / Leads */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium">Form Submissions</span>
                <Inbox className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white tracking-tight">
                {summary.leadsCount}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-indigo-300 font-medium">
                <span>{summary.conversionRate}% Conversion Rate</span>
              </div>
            </div>

            {/* 4. Storefront GMV */}
            <div className="p-4 rounded-xl bg-[#171b26] border border-[#262c3e] flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium">Storefront GMV</span>
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2 text-2xl font-bold text-white tracking-tight">
                ${summary.totalGmv.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span>{summary.ordersCount} checkout order(s)</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Device Breakdown & Traffic Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Device Breakdown */}
            <div className="p-5 rounded-xl bg-[#161a24] border border-[#242a3a] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Device Breakdown</h3>
                <span className="text-xs text-zinc-500">Adaptive screens</span>
              </div>

              {/* Progress Multi-Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${summary.deviceBreakdown.desktop}%` }}
                  title={`Desktop: ${summary.deviceBreakdown.desktop}%`}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${summary.deviceBreakdown.mobile}%` }}
                  title={`Mobile: ${summary.deviceBreakdown.mobile}%`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${summary.deviceBreakdown.tablet}%` }}
                  title={`Tablet: ${summary.deviceBreakdown.tablet}%`}
                />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-zinc-400">Desktop</span>
                  <span className="font-semibold text-white ml-auto">
                    {summary.deviceBreakdown.desktop}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-400">Mobile</span>
                  <span className="font-semibold text-white ml-auto">
                    {summary.deviceBreakdown.mobile}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tablet className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-zinc-400">Tablet</span>
                  <span className="font-semibold text-white ml-auto">
                    {summary.deviceBreakdown.tablet}%
                  </span>
                </div>
              </div>
            </div>

            {/* Traffic Acquisition Channels */}
            <div className="p-5 rounded-xl bg-[#161a24] border border-[#242a3a] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Traffic Acquisition Channels</h3>
                <Globe className="w-4 h-4 text-zinc-500" />
              </div>

              <div className="space-y-2">
                {summary.sources.map((s) => (
                  <div key={s.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300">{s.source}</span>
                      <span className="font-semibold text-white">{s.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Top Interactive Elements & Live Event Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Clicked Elements Table */}
            <div className="p-5 rounded-xl bg-[#161a24] border border-[#242a3a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">High-Impact Click Targets</h3>
                </div>
                <span className="text-xs text-zinc-500">CTA Heatmap</span>
              </div>

              <div className="divide-y divide-zinc-800/60">
                {summary.topElements.map((el) => (
                  <div key={el.name} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-medium text-white">{el.name}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {el.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{el.clicks} clicks</div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {el.ctr}% CTR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Visitor Activity Stream */}
            <div className="p-5 rounded-xl bg-[#161a24] border border-[#242a3a] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-semibold text-white">Recent Live Visitor Feed</h3>
                </div>
                <span className="text-xs text-zinc-500">Real-time stream</span>
              </div>

              <div className="space-y-2">
                {summary.recentEvents.slice(0, 5).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg bg-[#11131a] border border-[#222636] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ev.type === 'checkout'
                            ? 'bg-emerald-400'
                            : ev.type === 'cart_add'
                            ? 'bg-indigo-400'
                            : ev.type === 'click'
                            ? 'bg-amber-400'
                            : 'bg-zinc-500'
                        }`}
                      />
                      <span className="font-medium text-zinc-200 capitalize">
                        {ev.type.replace('_', ' ')}
                      </span>
                      {ev.targetName && (
                        <span className="text-zinc-400 truncate max-w-[140px]">
                          • {ev.targetName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="capitalize">{ev.device}</span>
                      {ev.revenue && (
                        <span className="font-semibold text-emerald-400">+${ev.revenue}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#232734]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateVisitor}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Simulate Visitor Activity</span>
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Baseline</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
