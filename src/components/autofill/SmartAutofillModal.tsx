import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Download,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

interface SmartAutofillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartAutofillModal({ isOpen, onClose }: SmartAutofillModalProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAutofillData();
    }
  }, [isOpen]);

  const loadAutofillData = async () => {
    try {
      setLoading(true);
      const res = await api.getAutofillMapping();
      setData(res);
    } catch {
      showToast('Failed to load autofill mapping', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    showToast(`Copied ${key} to clipboard`, 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showToast('Copied full profile payload as JSON', 'success');
  };

  const personalFields = [
    { label: 'Full Name', val: data?.fullName || '' },
    { label: 'Email', val: data?.email || '' },
    { label: 'Phone', val: data?.phone || '' },
    { label: 'Location', val: data?.location || '' },
    { label: 'LinkedIn', val: data?.linkedin || '' },
    { label: 'GitHub', val: data?.github || '' },
  ];

  const academicFields = [
    { label: 'College / University', val: data?.college || '' },
    { label: 'Degree & Branch', val: data?.degree || '' },
    { label: 'CGPA / Percentage', val: data?.cgpa || '' },
    { label: 'Graduation Year', val: data?.gradYear || '' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Smart Application Autofill Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-click copy verified candidate values into Workday, Greenhouse, Naukri, or TCS iON.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Mapping candidate fields...
          </div>
        ) : (
          <div className="space-y-5">
            {/* Personal Details */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {personalFields.map((f) => (
                  <div
                    key={f.label}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{f.label}</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {f.val || 'Not provided'}
                      </p>
                    </div>
                    {f.val && (
                      <button
                        onClick={() => handleCopy(f.label, f.val)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                        title="Copy field"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Academic & College Details */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                College & Academic Scores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {academicFields.map((f) => (
                  <div
                    key={f.label}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{f.label}</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {f.val || 'Not provided'}
                      </p>
                    </div>
                    {f.val && (
                      <button
                        onClick={() => handleCopy(f.label, f.val)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                        title="Copy field"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Skills CSV */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verified Skills (Comma-Separated for Textarea)
                </h3>
                <button
                  onClick={() => handleCopy('Skills CSV', data?.skillsCsv || '')}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy Skills
                </button>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs font-mono text-slate-700 dark:text-slate-300">
                {data?.skillsCsv || 'React, TypeScript, Node.js, Express, PostgreSQL, Git, Tailwind CSS'}
              </div>
            </div>

            {/* Quick Summary Statement */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Professional Bio / Elevator Pitch
                </h3>
                <button
                  onClick={() => handleCopy('Summary', data?.summary || '')}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy Summary
                </button>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {data?.summary || 'Full-stack software developer with production experience in React, TypeScript, and Node.js.'}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={handleCopyAllJson}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy All Fields as JSON
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
