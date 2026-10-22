import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  Copy,
  Check,
  Plus,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import { CareerAchievement } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function AchievementProfile() {
  const { showToast } = useToast();
  const [achievements, setAchievements] = useState<CareerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Achievement Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CareerAchievement['category']>('Project');
  const [issuer, setIssuer] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [metrics, setMetrics] = useState('');
  const [bullet, setBullet] = useState('');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await api.getAchievements();
      setAchievements(data);
    } catch {
      showToast('Failed to load achievements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBullet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Resume bullet copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      showToast('Title and organization are required', 'error');
      return;
    }

    try {
      const saved = await api.saveAchievement({
        title,
        category,
        issuerOrOrg: issuer,
        issueDate: '2026',
        skillsDemonstrated: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
        metricsResult: metrics || 'Achieved verified milestone',
        suggestedResumeBullet: bullet || `${title} at ${issuer}: Demonstrated ${skillsStr} with verified positive performance metrics.`,
        verified: true,
      });

      setAchievements((prev) => [saved, ...prev]);
      showToast('Achievement recorded with resume bullet suggestion', 'success');
      setIsModalOpen(false);
      setTitle('');
      setIssuer('');
      setSkillsStr('');
      setMetrics('');
      setBullet('');
    } catch {
      showToast('Failed to save achievement', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            Verified Accomplishments & Evidence
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Achievement & Evidence Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Turn your hackathon wins, internships, certifications, and high-impact projects into quantitative resume bullet points.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Verified Achievement
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading verified evidence records...
          </div>
        ) : achievements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No achievements logged yet. Click "Add Verified Achievement" to start building your evidence profile.
          </div>
        ) : (
          achievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {ach.category} • {ach.issueDate}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{ach.issuerOrOrg}</p>
                  </div>

                  {ach.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Measurable Impact:
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {ach.metricsResult}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {ach.skillsDemonstrated.map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ready-to-use Resume Bullet */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    ATS-Optimized Resume Bullet:
                  </span>
                  <button
                    onClick={() => handleCopyBullet(ach.id, ach.suggestedResumeBullet)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {copiedId === ach.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Bullet</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                  • {ach.suggestedResumeBullet}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Verified Achievement
            </h2>
            <form onSubmit={handleSaveAchievement} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Smart India Hackathon Finalist"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CareerAchievement['category'])}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Project">Project</option>
                    <option value="Certification">Certification</option>
                    <option value="Internship">Internship</option>
                    <option value="Academic">Academic</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Organization / Issuer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ministry of Education / AWS"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Skills Demonstrated (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, PostgreSQL, Docker"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quantifiable Metric / Outcome
                </label>
                <input
                  type="text"
                  placeholder="e.g., Top 5 out of 1,200 teams nationwide; 45% latency reduction"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Resume Bullet (Optional - auto-generated if blank)
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave empty to generate an action-verb oriented bullet..."
                  value={bullet}
                  onChange={(e) => setBullet(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
