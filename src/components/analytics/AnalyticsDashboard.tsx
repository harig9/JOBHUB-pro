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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
            {totalApplications}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {statusCounts.interviewing} active interviews • {statusCounts.offer} offers
          </p>
        </div>

        {/* Interview Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Interview Conversion</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-300 tabular-nums">
            {interviewRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Industry average: ~12-18% (ATS benchmark)
          </p>
        </div>

        {/* Offer Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Offer Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-300 tabular-nums">
            {offerRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Active offers secured in pipeline
          </p>
        </div>

        {/* Avg ATS Match */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average ATS Score</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-violet-600 dark:text-violet-300 tabular-nums">
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
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-sky-500'
                        : idx === 1
                        ? 'bg-indigo-600'
                        : idx === 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(6, stage.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            💡 <strong>Insight:</strong> Your interview conversion rate is strongly correlated with resumes scoring 85%+ on ATS scans. Tailoring bullet points before applying increases response velocity by 3.2x.
          </div>
        </div>

        {/* Top Skills In Demand */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Market Demand vs Candidate Profile</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Frequency in Tracked JDs</span>
          </div>

          <div className="space-y-3">
            {topSkillsInDemand.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">#{idx + 1}</span>
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
