import React, { useState } from 'react';
import { CoverLetter, Job, Resume } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import {
  Mail,
  Sparkles,
  Copy,
  Printer,
  Trash2,
  Check,
  Send,
  Building2,
  Sliders,
  FileText,
  Clock,
} from 'lucide-react';

interface CoverLetterStudioProps {
  coverLetters: CoverLetter[];
  jobs: Job[];
  resumes: Resume[];
  initialJobId?: string;
  onRefreshCoverLetters: () => Promise<void>;
}

export function CoverLetterStudio({
  coverLetters,
  jobs,
  resumes,
  initialJobId,
  onRefreshCoverLetters,
}: CoverLetterStudioProps) {
  const { showToast } = useToast();

  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || jobs[0]?.id || '');
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [tone, setTone] = useState<'professional' | 'conversational' | 'executive' | 'direct'>('professional');
  const [length, setLength] = useState<'compact' | 'standard' | 'detailed'>('standard');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active letter being viewed / edited
  const [activeLetter, setActiveLetter] = useState<CoverLetter | null>(coverLetters[0] || null);
  const [editedContent, setEditedContent] = useState<string>(activeLetter?.content || '');
  const [copied, setCopied] = useState(false);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const handleSelectLetter = (cl: CoverLetter) => {
    setActiveLetter(cl);
    setEditedContent(cl.content);
  };

  const handleGenerate = async () => {
    if (!selectedJob) {
      showToast('Please select or add a target job first', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await api.generateCoverLetter({
        resumeId: selectedResumeId,
        jobId: selectedJob.id,
        tone,
        length,
        instructions: customInstructions,
      });
      await onRefreshCoverLetters();
      setActiveLetter(generated);
      setEditedContent(generated.content);
      showToast(`Cover letter generated for ${selectedJob.company}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!activeLetter) return;
    try {
      await api.updateCoverLetter(activeLetter.id, { content: editedContent });
      await onRefreshCoverLetters();
      showToast('Cover letter updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    showToast('Cover letter copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this cover letter?')) {
      try {
        await api.deleteCoverLetter(id);
        await onRefreshCoverLetters();
        if (activeLetter?.id === id) {
          setActiveLetter(coverLetters.find((c) => c.id !== id) || null);
        }
        showToast('Cover letter deleted', 'info');
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Generator Setup Panel */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AI Tailored Cover Letter Generator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synthesizes your accomplishments with the specific requirements of the job description.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedJob}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGenerating ? 'Synthesizing Letter...' : 'Generate Tailored Letter'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Target Job Opportunity</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Source Resume</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Narrative Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="professional">Professional & Confident</option>
              <option value="executive">Executive & Strategic</option>
              <option value="direct">Technical & Direct</option>
              <option value="conversational">Warm & Conversational</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Length</label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="standard">Standard (4 Paragraphs)</option>
              <option value="compact">Compact (3 Paragraphs)</option>
              <option value="detailed">Detailed (5 Paragraphs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Studio View: Letters List (Left) & Rich Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Saved Letters List */}
        <div className="no-print lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-1">
            <span>Saved Letters ({coverLetters.length})</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {coverLetters.map((cl) => {
              const isActive = activeLetter?.id === cl.id;
              return (
                <div
                  key={cl.id}
                  onClick={() => handleSelectLetter(cl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">{cl.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cl.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{cl.companyName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(cl.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {coverLetters.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                No cover letters generated yet.
              </div>
            )}
          </div>
        </div>

        {/* Letter Editor & Clean Preview */}
        <div className="lg:col-span-8 space-y-3">
          {activeLetter ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
              {/* Header Bar */}
              <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeLetter.title}</span>
                  <span className="text-slate-500 ml-2">({activeLetter.tone} tone)</span>
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

                  <button
                    onClick={handleSaveContent}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Document Canvas (Printable Layout) */}
              <div className="p-8 bg-white text-slate-900 rounded-b-2xl font-sans min-h-[500px] border-t border-slate-200 dark:border-slate-800">
                <textarea
                  rows={18}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-full bg-transparent border-none text-slate-800 text-xs sm:text-sm leading-relaxed focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
          ) : (
            <div className="h-64 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
              Select or generate a cover letter to view and edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
