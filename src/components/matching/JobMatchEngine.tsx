import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Building,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { JobMatchResult, Resume, Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

interface JobMatchEngineProps {
  resumes: Resume[];
  jobs: Job[];
  onSelectJobForATS?: (job: Job) => void;
  onRefreshJobs?: () => Promise<void>;
}

export function JobMatchEngine({ resumes, jobs, onSelectJobForATS, onRefreshJobs }: JobMatchEngineProps) {
  const { showToast } = useToast();
  const [matches, setMatches] = useState<JobMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes.find((r) => r.isPrimary)?.id || resumes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'Remote' | 'Hybrid' | 'On-site'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const fetchMatches = async (resumeId?: string) => {
    setLoading(true);
    try {
      const data = await api.getJobMatches(resumeId || selectedResumeId);
      setMatches(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to calculate job matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedResumeId);
  }, [selectedResumeId]);

  const handleTrackJob = async (match: JobMatchResult) => {
    const alreadyTracked = jobs.find((j) => j.id === match.jobId);
    if (alreadyTracked) {
      showToast(`"${match.company}" is already in your Job Tracker (${alreadyTracked.status.toUpperCase()})`, 'info');
      return;
    }
    try {
      await api.createJob({
        title: match.jobTitle,
        company: match.company,
        location: match.location,
        employmentType: match.workMode === 'Remote' ? 'Remote' : match.workMode === 'Hybrid' ? 'Hybrid' : 'Full-time',
        status: 'wishlist',
        jobDescription: `Position: ${match.jobTitle} at ${match.company}\nRequirements: ${match.requiredQualifications.join(', ')}`,
        keySkills: match.matchingSkills.concat(match.missingSkills),
        priority: match.matchScore >= 80 ? 'high' : 'medium',
      });
      if (onRefreshJobs) await onRefreshJobs();
      showToast(`Added "${match.jobTitle}" to your Wishlist in Job Tracker!`, 'success');
      await fetchMatches(selectedResumeId);
    } catch (err: any) {
      showToast(err.message || 'Failed to track job', 'error');
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (modeFilter !== 'all' && m.workMode !== modeFilter) return false;
    if (locationFilter !== 'all' && !m.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.jobTitle.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.matchingSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0c1e33] via-[#0c1427] to-[#1e153b] border border-cyan-500/25 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-semibold border border-cyan-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Job Match Engine</span>
            <span>•</span>
            <span>Deterministic 3-Way Weighting</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Intelligent Job & Fresher Opportunity Matcher
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Evaluates verified resume technical skills (50%), verified project & internship experience (30%), and education (20%). Identifies concrete eligibility gaps rather than assuming qualifications, tailored for campus placements and entry-level engineering roles.
          </p>
          <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl inline-block">
            Notice: Match scores are algorithmic preparedness indicators and never guarantee employer interview calls or selection.
          </div>
        </div>
      </div>

      {/* Control Bar: Resume Selector + Search + Filters */}
      <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 backdrop-blur-xl rounded-2xl p-4 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Match against:</label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-[#090d19]/90 border border-slate-200/80 dark:border-indigo-500/20 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer shadow-sm max-w-[240px] truncate"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.isPrimary ? '★' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchMatches(selectedResumeId)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#090d19] hover:bg-slate-200 dark:hover:bg-[#131b31] border border-transparent dark:border-indigo-500/15 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>

        {/* Search & Work Mode filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, company, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#090d19]/90 border border-slate-200/80 dark:border-indigo-500/20 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
            />
          </div>

          <select
            value={modeFilter}
            onChange={(e: any) => setModeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#090d19]/90 border border-slate-200/80 dark:border-indigo-500/20 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Match Cards List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white dark:bg-[#0e1424]/80 rounded-3xl border border-slate-200/80 dark:border-indigo-500/20 backdrop-blur-xl">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Calculating semantic match and qualification gaps...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-[#0e1424]/80 rounded-3xl border border-slate-200/80 dark:border-indigo-500/20 backdrop-blur-xl">
          <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No opportunities match the selected criteria</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or adding new target vacancies in Job Tracker.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMatches.map((m) => {
            const isHighScore = m.matchScore >= 80;
            const isModerate = m.matchScore >= 65 && m.matchScore < 80;

            return (
              <div
                key={m.jobId}
                className="bg-white dark:bg-[#0e1424]/85 border border-slate-200/80 dark:border-indigo-500/20 hover:border-indigo-400/40 dark:hover:border-indigo-400/50 rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all flex flex-col justify-between space-y-4 backdrop-blur-md"
              >
                <div className="space-y-3">
                  {/* Card Header: Title + Company + Score Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 dark:text-slate-100 truncate">
                          {m.jobTitle}
                        </span>
                        {m.isVerifiedJob && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {m.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {m.location}
                        </span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                          {m.workMode}
                        </span>
                      </div>
                    </div>

                    {/* Score Circle */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                        isHighScore
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 dark:shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                          : isModerate
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 dark:shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      <span className="text-lg font-black leading-none">{m.matchScore}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</span>
                    </div>
                  </div>

                  {/* Calculation Breakdown Mini Bar */}
                  <div className="bg-slate-50 dark:bg-[#090d19]/80 p-2.5 rounded-xl border border-slate-100 dark:border-indigo-500/15 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Skills ({m.calculationBreakdown.skillsMatchPct}%)</span>
                      <span>Experience ({m.calculationBreakdown.experienceMatchPct}%)</span>
                      <span>Education ({m.calculationBreakdown.educationMatchPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#070b14] h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" style={{ width: `${m.calculationBreakdown.skillsMatchPct * 0.5}%` }} />
                      <div className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: `${m.calculationBreakdown.experienceMatchPct * 0.3}%` }} />
                      <div className="bg-indigo-500 h-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${m.calculationBreakdown.educationMatchPct * 0.2}%` }} />
                    </div>
                  </div>

                  {/* Relevance Explanation */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{m.relevanceExplanation}"
                  </p>

                  {/* Skills Grid */}
                  <div className="space-y-2 pt-1">
                    {/* Matching Skills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                        <CheckCircle2 className="w-3 h-3" /> Matching ({m.matchingSkills.length}):
                      </span>
                      {m.matchingSkills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium font-mono">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Missing Skills */}
                    {m.missingSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                          <XCircle className="w-3 h-3" /> Gaps ({m.missingSkills.length}):
                        </span>
                        {m.missingSkills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-medium font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Eligibility Gaps Notice if any */}
                  {m.eligibilityGaps.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Eligibility Notes:
                      </span>
                      {m.eligibilityGaps.map((gap, i) => (
                        <p key={i} className="pl-4 leading-relaxed">• {gap}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-indigo-500/15 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    CTC: <strong className="text-slate-800 dark:text-emerald-300">{m.salaryText}</strong>
                  </span>

                  <button
                    onClick={() => handleTrackJob(m)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs dark:shadow-[0_0_12px_rgba(52,211,153,0.3)] transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Track in Job Board</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
