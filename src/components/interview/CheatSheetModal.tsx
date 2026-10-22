import React, { useState } from 'react';
import { Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import {
  FileText,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  Printer,
  X,
  Building2,
  TrendingUp,
} from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export function CheatSheetModal({ isOpen, onClose, job }: CheatSheetModalProps) {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [cheatSheet, setCheatSheet] = useState<{
    killerQuestionsToAsk: string[];
    companyTalkingPoints: string[];
    coreMetricsToHighlight: string[];
    redFlagsToWatchFor: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen && !cheatSheet) {
      loadCheatSheet();
    }
  }, [isOpen, job]);

  const loadCheatSheet = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateInterviewCheatSheet({ jobId: job.id });
      setCheatSheet(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate cheat sheet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!cheatSheet) return;
    const text = `INTERVIEW PREP CHEAT SHEET — ${job.title} at ${job.company}

1. KILLER QUESTIONS TO ASK THE INTERVIEWER:
${cheatSheet.killerQuestionsToAsk.map((q, i) => `${i + 1}. ${q}`).join('\n')}

2. STRATEGIC COMPANY TALKING POINTS:
${cheatSheet.companyTalkingPoints.map((p, i) => `• ${p}`).join('\n')}

3. CORE METRICS & ACHIEVEMENTS TO HIGHLIGHT:
${cheatSheet.coreMetricsToHighlight.map((m, i) => `• ${m}`).join('\n')}

4. RED FLAGS & SIGNALS TO WATCH FOR:
${cheatSheet.redFlagsToWatchFor.map((r, i) => `! ${r}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Cheat sheet copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Executive Interview Cheat Sheet</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono">
                  Bar Raiser Edition
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {job.title} • <strong className="text-indigo-600 dark:text-indigo-300">{job.company}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 dark:text-slate-300">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 dark:border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Synthesizing interview talking points with Gemini...</p>
            </div>
          ) : cheatSheet ? (
            <div className="space-y-6">
              {/* 1. Killer Questions */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Killer Questions to Ask the Interviewer (Signals Leadership & Depth)</span>
                </div>
                <div className="space-y-2">
                  {cheatSheet.killerQuestionsToAsk.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">#{idx + 1}</span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{q}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Company Talking Points */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Strategic Company Talking Points & Architecture Alignments</span>
                </div>
                <ul className="space-y-2">
                  {cheatSheet.companyTalkingPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Core Metrics to Highlight */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Your Key Quantifiable Metrics to Weave into Answers (X-Y-Z Formula)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {cheatSheet.coreMetricsToHighlight.map((metric, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 text-slate-800 dark:text-slate-200 leading-relaxed">
                      {metric}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Red Flags */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Red Flags & Cultural Signals to Observe</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                  {cheatSheet.redFlagsToWatchFor.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">!</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
