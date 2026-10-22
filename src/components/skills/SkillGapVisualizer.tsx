import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Award,
  Filter,
  Check,
} from 'lucide-react';
import { SkillGapNode } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

interface SkillGapVisualizerProps {
  onNavigateToRoadmap?: () => void;
  onNavigateToCodingLab?: () => void;
}

export function SkillGapVisualizer({
  onNavigateToRoadmap,
  onNavigateToCodingLab,
}: SkillGapVisualizerProps) {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillGapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await api.getSkillGaps();
      setSkills(data);
    } catch {
      showToast('Failed to load skill matrix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProficiency = async (id: string, newProficiency: SkillGapNode['userProficiency']) => {
    try {
      setUpdatingId(id);
      const updated = await api.updateSkillProficiency(id, newProficiency);
      setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(`Updated ${updated.skillName} proficiency to ${newProficiency}`, 'success');
    } catch {
      showToast('Failed to update proficiency', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSkills = skills.filter((s) => {
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const verifiedCount = skills.filter((s) => s.status === 'verified').length;
  const inProgressCount = skills.filter((s) => s.status === 'in-progress').length;
  const gapCount = skills.filter((s) => s.status === 'gap').length;
  const readinessScore = skills.length > 0 ? Math.round(((verifiedCount * 1 + inProgressCount * 0.5) / skills.length) * 100) : 0;

  const proficiencyLevels: SkillGapNode['userProficiency'][] = [
    'None',
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Readiness Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/20 mb-3">
            <Target className="w-3.5 h-3.5" />
            Candidate Competency Matrix
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Skill Gap Graph & Career Readiness
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-xl">
            Compare your verified accomplishments and projects against industry expectations for top Indian software roles.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 self-start md:self-auto">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-indigo-400">{readinessScore}%</span>
            <p className="text-[11px] text-slate-400 font-medium">Readiness Index</p>
          </div>
          <div className="h-10 w-px bg-white/15" />
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{verifiedCount} Verified</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{inProgressCount} In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{gapCount} Gaps to Bridge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Switchers */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Category:
          </span>
          {['all', 'Core CS', 'Frontend', 'Backend', 'Database', 'DevOps & Cloud', 'Aptitude & Soft Skills'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Domains' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['all', 'verified', 'in-progress', 'gap'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Analyzing candidate competency graph...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No skills found matching selected filters.
          </div>
        ) : (
          filteredSkills.map((node) => (
            <div
              key={node.id}
              className={`rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                node.status === 'verified'
                  ? 'border-emerald-200 dark:border-emerald-800/40'
                  : node.status === 'in-progress'
                  ? 'border-amber-200 dark:border-amber-800/40'
                  : 'border-rose-200 dark:border-rose-800/40'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {node.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {node.skillName}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      node.status === 'verified'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : node.status === 'in-progress'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                {/* Importance Badge & Rationale */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      node.importance === 'Essential'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : node.importance === 'Preferred'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {node.importance} Requirement
                  </span>
                  {node.verifiedEvidenceCount > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {node.verifiedEvidenceCount} Evidence
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {node.relevanceRationale}
                </p>

                {/* Evidence tags if present */}
                {node.evidenceLabels && node.evidenceLabels.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Verified In:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {node.evidenceLabels.map((label, lIdx) => (
                        <span
                          key={lIdx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: Proficiency Selector & Action Plan */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Proficiency:</span>
                  <select
                    disabled={updatingId === node.id}
                    value={node.userProficiency}
                    onChange={(e) =>
                      handleUpdateProficiency(node.id, e.target.value as SkillGapNode['userProficiency'])
                    }
                    className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {proficiencyLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recommended Roadmap Action */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 mb-0.5">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Recommended Action:
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {node.recommendedRoadmapAction}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
