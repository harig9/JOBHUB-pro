import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Circle,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Award,
} from 'lucide-react';
import { CompanyResearchPack } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

interface CompanyResearchWorkspaceProps {
  onStartCompanyInterview?: (companyName: string) => void;
}

export function CompanyResearchWorkspace({ onStartCompanyInterview }: CompanyResearchWorkspaceProps) {
  const { showToast } = useToast();
  const [packs, setPacks] = useState<CompanyResearchPack[]>([]);
  const [selectedPackId, setSelectedPackId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [togglingIdx, setTogglingIdx] = useState<number | null>(null);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanyPacks();
      setPacks(data);
      if (data.length > 0 && !selectedPackId) {
        setSelectedPackId(data[0].id);
      }
    } catch {
      showToast('Failed to load company packs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activePack = packs.find((p) => p.id === selectedPackId) || packs[0];

  const handleToggleChecklist = async (taskText: string, taskIndex: number) => {
    if (!activePack) return;
    try {
      setTogglingIdx(taskIndex);
      const updated = await api.toggleCompanyChecklist(activePack.id, taskText);
      setPacks((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast('Checklist updated', 'success');
    } catch {
      showToast('Failed to update checklist item', 'error');
    } finally {
      setTogglingIdx(null);
    }
  };

  const completedChecklistCount = activePack?.prepChecklist.filter((c) => c.done).length || 0;
  const totalChecklistCount = activePack?.prepChecklist.length || 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            Company Intel & Interview Prep Packs
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Company Research Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            In-depth hiring playbooks for Indian service majors, high-growth startups, and global MNC engineering hubs.
          </p>
        </div>

        {activePack && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartCompanyInterview?.(activePack.companyName)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Practice {activePack.companyName} Mock Round
            </button>
          </div>
        )}
      </div>

      {/* Company Selector Ribbon */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {packs.map((p) => {
          const isSelected = p.id === activePack?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPackId(p.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2.5 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{p.companyName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {p.industry}
              </span>
            </button>
          );
        })}
      </div>

      {activePack && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Dossier (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {activePack.companyName} Overview
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      HQ: {activePack.headquarters}
                    </span>
                    <span>•</span>
                    <span>Industry: {activePack.industry}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Verified: {activePack.sourceReference}
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {activePack.overview}
              </p>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Key Development Centers in India:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activePack.indianOffices.map((office) => (
                    <span
                      key={office}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                    >
                      {office}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Hiring Process Rounds */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                Hiring Process Rounds & Evaluation Focus
              </h3>

              <div className="space-y-4">
                {activePack.hiringProcessRounds.map((round) => (
                  <div
                    key={round.roundNumber}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Round {round.roundNumber}: {round.roundName}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 my-2">
                      {round.focusAreas.map((area, aIdx) => (
                        <span
                          key={aIdx}
                          className="text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      💡 Tip: {round.tips}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions to Expect & Prepare */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Technical Questions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Likely Technical Questions
                </h4>
                <ul className="space-y-2">
                  {activePack.likelyTechnicalQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Behavioral Questions */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Likely Behavioral & HR Questions
                </h4>
                <ul className="space-y-2">
                  {activePack.likelyBehavioralQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Prep Checklist & Questions to Ask (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Interactive Prep Checklist */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Prep Action Checklist
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {completedChecklistCount}/{totalChecklistCount} Done
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${totalChecklistCount > 0 ? (completedChecklistCount / totalChecklistCount) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                {activePack.prepChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist(item.task, idx)}
                    className={`cursor-pointer p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                      item.done
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-500'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button disabled={togglingIdx === idx}>
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    <span className={item.done ? 'line-through' : 'font-medium'}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Questions to Ask the Interviewer */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Questions to Ask Your Interviewer
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Stand out at the end of your interview with tailored questions:
              </p>
              <div className="space-y-2">
                {activePack.questionsToAskInterviewer.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300 italic border border-slate-200 dark:border-slate-800"
                  >
                    "{q}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
