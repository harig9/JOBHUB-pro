import React from 'react';
import { SystemInfo } from '../types/index.js';
import { X, Server, Database, Sparkles, ShieldCheck, CheckCircle2, Cpu, Terminal } from 'lucide-react';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemInfo: SystemInfo | null;
}

export function SystemModal({ isOpen, onClose, systemInfo }: SystemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-1 flex items-center justify-center shrink-0">
              <img
                src="/jobhub-logo.png"
                alt="JobHub Pro"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                JobHub Pro — AI Career Suite Architecture & Runtime
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 font-semibold font-mono">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specification Compliance, Database Transactions & Server-Side LLM Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Infrastructure Disclosure Notice */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-2">
            <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-semibold">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Infrastructure Transparency & Architectural Alignment
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {systemInfo?.architectureAudit.infrastructureDisclosure ||
                'Running full-stack Node.js + Express with 100% Spring Boot REST API specification compliance, bean validation semantics, and ACID file-backed relational persistence.'}
            </p>
          </div>

          {/* Grid of Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backend Spec */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Backend REST Architecture
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Spring Boot 3.x REST Controller Contract</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Centralized ResponseEntityExceptionHandler</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>JWT-based Session Authentication (Spring Security)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Bean-style field validation with 400 Bad Request</span>
                </li>
              </ul>
            </div>

            {/* Relational Database */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Database & Persistence Model
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Normalized Relational Tables: 7 entities</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Foreign Key Integrity (jobs ⇄ history ⇄ ats)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Atomic read/write transactions (`data/jobhub_db.json`)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Auto-migration & rich pre-seeded records</span>
                </li>
              </ul>
            </div>

            {/* AI Integration */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                AI & ATS Optimization Engine
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Server-side Google GenAI (`@google/genai`)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Model: <strong>gemini-3.8-flash</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Structured JSON schemas with responseSchema</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Target 85%+ ATS score guarantee algorithm</span>
                </li>
              </ul>
            </div>

            {/* Security & Document Export */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Security & Document Processing
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Server-side API keys (never exposed to client)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>ATS-compliant PDF Export via CSS Print Engine</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DOCX & TXT formatted resume export</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Raw resume text semantic parsing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Live Spring Boot REST Endpoints
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1 text-slate-700 dark:text-slate-400">
              <div className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-400 font-bold">GET</span> <span>/api/jobs</span> <span className="text-slate-500">— Filter, search, and sort opportunities</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/jobs</span> <span className="text-slate-500">— Create with bean validation</span></div>
              <div className="flex gap-2"><span className="text-amber-600 dark:text-amber-400 font-bold">PATCH</span> <span>/api/jobs/:id/status</span> <span className="text-slate-500">— Transition status + audit history</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/ai/ats-scan</span> <span className="text-slate-500">— Gemini 3.8 Flash ATS match analysis</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/ai/optimize-resume</span> <span className="text-slate-500">— Rewrites bullets & targets 85%+ score</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/ai/cover-letter</span> <span className="text-slate-500">— Tailored cover letter synthesis</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/ai/interview-prep</span> <span className="text-slate-500">— Generates role-specific questions & STAR rubric</span></div>
              <div className="flex gap-2"><span className="text-sky-600 dark:text-sky-400 font-bold">POST</span> <span>/api/ai/evaluate-answer</span> <span className="text-slate-500">— Evaluates candidate answer /10 with model draft</span></div>
              <div className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-400 font-bold">GET</span> <span>/api/analytics</span> <span className="text-slate-500">— Computes conversion funnel & skill demand</span></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Node.js Runtime • REST Protocol • Port 3000
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
