import React, { useState } from 'react';
import { Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import {
  Mail,
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
  X,
  Building2,
  Clock,
  Briefcase,
} from 'lucide-react';

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export function FollowUpModal({ isOpen, onClose, job }: FollowUpModalProps) {
  const { showToast } = useToast();

  const [type, setType] = useState<'post_interview_thank_you' | 'application_follow_up' | 'offer_negotiation'>('post_interview_thank_you');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const email = await api.generateFollowUpEmail({
        jobId: job.id,
        type,
        notes: customNotes,
      });
      setGeneratedEmail(email);
      showToast('Career follow-up email synthesized!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate email', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
    setCopied(true);
    showToast('Email text copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailTo = () => {
    if (!generatedEmail) return;
    const recipient = job.contactEmail || '';
    const subject = encodeURIComponent(generatedEmail.subject);
    const body = encodeURIComponent(generatedEmail.body);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Career Follow-Up & Negotiation Assistant</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Targeting {job.title} at <strong className="text-indigo-600 dark:text-indigo-300">{job.company}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Email Type Selector */}
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5 uppercase text-[10px] tracking-wider">
              Communication Objective
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'post_interview_thank_you', label: 'Thank You Note', desc: 'Post-interview follow-up' },
                { id: 'application_follow_up', label: 'Status Inquiry', desc: '5-7 days post-application' },
                { id: 'offer_negotiation', label: 'Offer Negotiation', desc: 'Salary & equity proposal' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    type === opt.id
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-950 dark:text-white font-semibold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Context */}
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1 uppercase text-[10px] tracking-wider">
              Key Discussion Points / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Spoke with Sarah about database query latency; they mentioned expanding to Europe in Q3..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGenerating ? 'Synthesizing with AI...' : 'Draft Message with Gemini'}</span>
            </button>
          </div>

          {/* Generated Result */}
          {generatedEmail && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={generatedEmail.subject}
                  onChange={(e) => setGeneratedEmail({ ...generatedEmail, subject: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Message Body:
                </label>
                <textarea
                  rows={8}
                  value={generatedEmail.body}
                  onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Recipient: {job.contactPerson || job.contactEmail || job.company + ' Team'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleMailTo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Mail Client</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
