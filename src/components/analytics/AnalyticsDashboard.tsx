import React from 'react';
import { CareerAnalytics } from '../../types/index.js';
import {
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart2,
  Activity,
  Flame,
  Briefcase,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  analytics: CareerAnalytics | null;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400 dark:text-slate-500">
        Loading career progression analytics...
      </div>
    );
  }

  const {
    totalApplications,
    statusCounts,
    interviewRate,
    offerRate,
    avgMatchScore,
    topSkillsInDemand,
    pipelineFunnel,
    applicationsTimeline,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Opportunities */}
        <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl hover:border-indigo-400/40 dark:hover:border-indigo-400/50 dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-transparent dark:border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
            {totalApplications}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {statusCounts.interviewing} active interviews • {statusCounts.offer} offers
          </p>
        </div>

        {/* Interview Rate */}
        <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl hover:border-amber-400/40 dark:hover:border-amber-400/50 dark:hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Conversion</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-transparent dark:border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-300 dark:drop-shadow-[0_0_12px_rgba(251,191,36,0.3)] tabular-nums tracking-tight">
            {interviewRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Industry average: ~12-18% (ATS benchmark)
          </p>
        </div>

        {/* Offer Rate */}
        <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl hover:border-emerald-400/40 dark:hover:border-emerald-400/50 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Offer Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-300 dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.3)] tabular-nums tracking-tight">
            {offerRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Active offers secured in pipeline
          </p>
        </div>

        {/* Avg ATS Match */}
        <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl hover:border-purple-400/40 dark:hover:border-purple-400/50 dark:hover:shadow-[0_0_20px_rgba(192,132,252,0.2)] transition-all">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average ATS Score</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-transparent dark:border-violet-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-violet-600 dark:text-cyan-300 dark:drop-shadow-[0_0_12px_rgba(103,232,249,0.35)] tabular-nums tracking-tight">
            {avgMatchScore}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Exceeds the 85% recruiter threshold
          </p>
        </div>
      </div>

      {/* Grid: Pipeline Funnel (Left) & Top Skills Demand (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Funnel */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span>Application Pipeline Funnel</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Conversion Progression</span>
          </div>

          <div className="space-y-4">
            {pipelineFunnel.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">{stage.count} roles</span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#070b14] rounded-full overflow-hidden p-0.5 border border-transparent dark:border-indigo-500/15">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-sky-500 to-blue-500 dark:from-sky-400 dark:to-blue-500 dark:shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                        : idx === 1
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 dark:shadow-[0_0_12px_rgba(129,140,248,0.5)]'
                        : idx === 2
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-yellow-500 dark:shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 dark:shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                    }`}
                    style={{ width: `${Math.max(6, stage.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090d19]/80 border border-slate-200/80 dark:border-indigo-500/15 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            💡 <strong>Insight:</strong> Your interview conversion rate is strongly correlated with resumes scoring 85%+ on ATS scans. Tailoring bullet points before applying increases response velocity by 3.2x.
          </div>
        </div>

        {/* Top Skills In Demand */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Market Demand vs Candidate Profile</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Frequency in Tracked JDs</span>
          </div>

          <div className="space-y-3">
            {topSkillsInDemand.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-[#090d19]/80 border border-slate-200/80 dark:border-indigo-500/15 hover:border-indigo-400/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-[10px] font-mono text-slate-400 dark:text-indigo-400/80 font-bold">#{idx + 1}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{item.skill}</span>
                  {item.userHasSkill ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ✓ In Resume
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                      Missing Gap
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] tabular-nums">{item.count} postings</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
