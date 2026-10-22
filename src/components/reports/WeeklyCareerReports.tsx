import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FileText,
  Target,
  Brain,
} from 'lucide-react';
import { WeeklyCareerReport } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function WeeklyCareerReports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<WeeklyCareerReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getWeeklyReports();
      setReports(data);
      if (data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id);
      }
    } catch {
      showToast('Failed to load weekly reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const newReport = await api.generateWeeklyReport();
      setReports((prev) => [newReport, ...prev]);
      setSelectedReportId(newReport.id);
      showToast('Fresh weekly performance report generated!', 'success');
    } catch {
      showToast('Failed to generate weekly report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Performance Intelligence
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Weekly Career Intelligence Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated digests evaluating application velocity, interview pass-through rates, and targeted study blockers.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Analyzing Progress...' : 'Generate Fresh Weekly Digest'}
        </button>
      </div>

      {/* Report Periods Tabs */}
      {reports.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {reports.map((rep) => {
            const isSelected = rep.id === activeReport?.id;
            return (
              <button
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {rep.reportingPeriod}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Report View */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Compiling career performance statistics...
        </div>
      ) : !activeReport ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          No reports available. Click "Generate Fresh Weekly Digest" above.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {activeReport.applicationsSubmittedCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Applications Sent</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
              <span className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {activeReport.interviewsAttendedCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interviews Attended</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {activeReport.roadmapTasksCompletedCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Roadmap Tasks Done</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-center">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                {activeReport.skillsPracticedCount}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Skills Practiced</p>
            </div>
          </div>

          {/* Motivational & Strategic Insights */}
          <div className="bg-gradient-to-r from-indigo-900/90 to-slate-900 text-white rounded-2xl p-6 border border-indigo-700/50 shadow-md">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">AI Executive Summary & Morale Check</h3>
                <p className="text-xs text-indigo-200 leading-relaxed mt-1">
                  "{activeReport.motivationalSummary}"
                </p>
              </div>
            </div>
          </div>

          {/* Strengths, Blockers, Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Top Momentum Drivers
              </h3>
              <ul className="space-y-2">
                {activeReport.topStrengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/30"
                  >
                    <span>•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blockers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" /> Identified Blockers
              </h3>
              <ul className="space-y-2">
                {activeReport.currentBlockers.map((blk, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-800/30"
                  >
                    <span>•</span>
                    <span>{blk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Action Items */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Recommended Weekly Goals
              </h3>
              <ul className="space-y-2">
                {activeReport.strategicActionItems.map((act, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30"
                  >
                    <span>→</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
