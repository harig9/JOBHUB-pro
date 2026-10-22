import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Code2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Target,
} from 'lucide-react';
import { CareerRoadmap, RoadmapMilestone, RoadmapTask } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

interface CareerRoadmapStudioProps {
  onNavigateToCodingLab?: () => void;
  onNavigateToSkillGap?: () => void;
  onNavigateToInterviewCoach?: () => void;
}

export function CareerRoadmapStudio({
  onNavigateToCodingLab,
  onNavigateToSkillGap,
  onNavigateToInterviewCoach,
}: CareerRoadmapStudioProps) {
  const { showToast } = useToast();
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const activeRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0];

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const data = await api.getRoadmaps();
      setRoadmaps(data);
      if (data.length > 0 && !selectedRoadmapId) {
        setSelectedRoadmapId(data[0].id);
      }
    } catch {
      showToast('Failed to load career roadmaps', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!activeRoadmap) return;
    try {
      setTogglingTaskId(taskId);
      const updated = await api.toggleRoadmapTask(activeRoadmap.id, taskId);
      setRoadmaps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(
        !currentCompleted ? 'Milestone task completed! Keep going!' : 'Task marked as pending',
        'success'
      );
    } catch {
      showToast('Failed to update task status', 'error');
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm">Loading your personalized career roadmaps...</p>
      </div>
    );
  }

  if (!activeRoadmap) {
    return (
      <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No Career Roadmap Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set up a target job profile in your settings to generate an intelligent learning timeline.
        </p>
      </div>
    );
  }

  // Calculate stats from milestones & tasks
  const totalTasks = activeRoadmap.milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = activeRoadmap.milestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.completed).length,
    0
  );
  const actualPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : activeRoadmap.overallProgress;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-indigo-400/20 mb-3">
              <Compass className="w-3.5 h-3.5" />
              Dynamic Preparation Roadmap
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {activeRoadmap.targetRole}
            </h1>
            <p className="text-indigo-200 text-sm mt-2 max-w-2xl">
              Target Completion: <span className="font-semibold text-white">{activeRoadmap.targetDate}</span> • Commitment:{' '}
              <span className="font-semibold text-white">{activeRoadmap.weeklyHoursAvailability} hrs/week</span> ({activeRoadmap.estimatedWeeks} weeks planned)
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/15 flex items-center gap-6 self-start md:self-auto">
            <div className="text-center">
              <span className="text-3xl font-extrabold text-emerald-400">{actualPercent}%</span>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">Completed</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-xs text-indigo-200">Tasks Progress</p>
              <p className="text-sm font-semibold text-white mt-0.5">
                {completedTasks} / {totalTasks} finished
              </p>
              <div className="w-32 bg-white/20 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${actualPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Switcher if multiple */}
        {roadmaps.length > 1 && (
          <div className="mt-6 pt-4 border-t border-indigo-700/50 flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-medium">Switch Target Role:</span>
            {roadmaps.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoadmapId(r.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  r.id === activeRoadmap.id
                    ? 'bg-white text-indigo-900 font-semibold'
                    : 'bg-indigo-800/60 text-indigo-200 hover:bg-indigo-700/60'
                }`}
              >
                {r.targetRole}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assumptions & Realistic Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-semibold">Planning Assumptions & Realistic Timeline:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
            {activeRoadmap.assumptions.map((assump, idx) => (
              <li key={idx}>{assump}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick Navigation Links to Interconnected Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onNavigateToCodingLab}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Coding & Aptitude Lab
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Solve daily practice challenges</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onNavigateToSkillGap}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                Skill Gap Navigator
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspect verified vs required skills</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={onNavigateToInterviewCoach}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Mock Interview Studio
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Simulate rounds for this role</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Milestones and Tasks List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Structured Milestones & Action Tasks
        </h2>

        {activeRoadmap.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            {/* Milestone Header */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  W{milestone.weekNumber}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Week {milestone.weekNumber}: {milestone.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Goal: {milestone.goal}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    milestone.completed
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {milestone.completed ? 'Milestone Complete' : 'In Progress'}
                </span>
              </div>
            </div>

            {/* Tasks inside Milestone */}
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {milestone.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.completed)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      task.completed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-slate-600 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <button
                      disabled={togglingTaskId === task.id}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {task.durationHours}h
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 ${
                          task.completed ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {task.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                          {task.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {task.difficulty}
                        </span>
                        {task.resourceLink && (
                          <a
                            href={task.resourceLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
                          >
                            <BookOpen className="w-3 h-3" />
                            Guide
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
