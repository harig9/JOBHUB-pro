import React, { useState, useEffect } from 'react';
import {
  Job,
  JobStatus,
  JobStatusHistory,
} from '../../types/index.js';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  ExternalLink,
  Target,
  Sparkles,
  Mail,
  Mic,
  MoreVertical,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Send,
  Eye,
  X,
  History,
  TrendingUp,
  LayoutGrid,
  List,
  Bell,
  CalendarCheck,
  CalendarPlus,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FollowUpModal } from './FollowUpModal.js';
import { ScheduleModal } from './ScheduleModal.js';

interface JobBoardProps {
  jobs: Job[];
  targetJob?: Job | null;
  onAddJob: (job: Partial<Job>) => Promise<void>;
  onUpdateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  onUpdateStatus: (id: string, status: JobStatus, note?: string) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  onSelectJobForATS: (job: Job) => void;
  onSelectJobForCoverLetter: (job: Job) => void;
  onSelectJobForInterview: (job: Job) => void;
  onOpenScheduleModal?: (job: Job) => void;
}

const statusColumns: { id: JobStatus; title: string; color: string; bg: string; border: string }[] = [
  { id: 'wishlist', title: 'Wishlist & Target', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' },
  { id: 'applied', title: 'Applied', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { id: 'interviewing', title: 'Interviewing', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'offer', title: 'Offer Extended', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'rejected', title: 'Archived / Passed', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
];

export function JobBoard({
  jobs,
  targetJob,
  onAddJob,
  onUpdateJob,
  onUpdateStatus,
  onDeleteJob,
  onSelectJobForATS,
  onSelectJobForCoverLetter,
  onSelectJobForInterview,
}: JobBoardProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(targetJob || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [followUpJob, setFollowUpJob] = useState<Job | null>(null);
  const [schedulingJob, setSchedulingJob] = useState<Job | null>(null);

  // Sync selected job when targetJob changes from global search
  useEffect(() => {
    if (targetJob) {
      setSelectedJob(targetJob);
    }
  }, [targetJob]);

  // New Job Form State
  const [newJobData, setNewJobData] = useState({
    title: '',
    company: '',
    location: 'Remote',
    employmentType: 'Full-time' as Job['employmentType'],
    salaryRange: '',
    status: 'wishlist' as JobStatus,
    priority: 'high' as Job['priority'],
    directUrl: '',
    deadline: '',
    interviewDate: '',
    interviewRound: '',
    contactPerson: '',
    contactEmail: '',
    keySkillsStr: 'React, TypeScript, Java, Spring Boot, MySQL',
    jobDescription: '',
    notes: '',
  });

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.keySkills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || j.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleStatusChange = async (job: Job, newStatus: JobStatus) => {
    if (newStatus === 'offer') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    await onUpdateStatus(job.id, newStatus);
    if (selectedJob && selectedJob.id === job.id) {
      setSelectedJob({ ...selectedJob, status: newStatus });
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = newJobData.keySkillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onAddJob({
      title: newJobData.title,
      company: newJobData.company,
      location: newJobData.location,
      employmentType: newJobData.employmentType,
      salaryRange: newJobData.salaryRange,
      status: newJobData.status,
      priority: newJobData.priority,
      directUrl: newJobData.directUrl,
      deadline: newJobData.deadline ? new Date(newJobData.deadline).toISOString() : undefined,
      interviewDate: newJobData.interviewDate ? new Date(newJobData.interviewDate).toISOString() : undefined,
      interviewRound: newJobData.interviewRound || undefined,
      contactPerson: newJobData.contactPerson,
      contactEmail: newJobData.contactEmail,
      keySkills: skills,
      jobDescription: newJobData.jobDescription,
      notes: newJobData.notes,
    });

    setIsAddModalOpen(false);
    setNewJobData({
      title: '',
      company: '',
      location: 'Remote',
      employmentType: 'Full-time',
      salaryRange: '',
      status: 'wishlist',
      priority: 'high',
      directUrl: '',
      deadline: '',
      interviewDate: '',
      interviewRound: '',
      contactPerson: '',
      contactEmail: '',
      keySkillsStr: 'React, TypeScript, Java, Spring Boot, MySQL',
      jobDescription: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Center & Follow-Up Reminders Strip */}
      {jobs.some((j) => j.status === 'interviewing' || j.status === 'offer') && (
        <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-950/40 via-white dark:via-slate-900 to-indigo-50 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 p-4 rounded-2xl shadow-sm dark:shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Career Action Center: Follow-Up & Negotiation Radar
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                  Active Next Steps
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                You have active interviews and offers. High-converting follow-ups within 24 hours increase offer closing rates by 64%.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {jobs
              .filter((j) => j.status === 'interviewing' || j.status === 'offer')
              .slice(0, 2)
              .map((j) => (
                <button
                  key={j.id}
                  onClick={() => setFollowUpJob(j)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-700 dark:text-slate-200 transition-colors shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    <strong>{j.company}</strong>: {j.status === 'offer' ? 'Draft Counter-Proposal' : 'Draft Thank You'}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Top Controls & Metrics */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search roles, companies, tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle View Mode */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Track Opportunity</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {statusColumns.map((col) => {
            const columnJobs = filteredJobs.filter((j) => {
              if (col.id === 'rejected') {
                return j.status === 'rejected' || j.status === 'archived';
              }
              return j.status === col.id;
            });

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 space-y-3 min-h-[500px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.bg} border ${col.border}`} />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">{col.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {columnJobs.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1">
                  {columnJobs.map((job) => (
                    <div
                      key={job.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 rounded-xl p-3.5 shadow-sm hover:shadow-md dark:shadow-none transition-all space-y-2.5 cursor-pointer relative"
                      onClick={() => setSelectedJob(job)}
                    >
                      {/* Company & Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job.company}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors line-clamp-1">
                            {job.title}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {job.matchScore && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono tabular-nums ${
                                job.matchScore >= 85
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {job.matchScore}% ATS
                            </span>
                          )}
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              job.priority === 'high'
                                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                : job.priority === 'medium'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-200 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {job.priority}
                          </span>
                        </div>
                      </div>

                      {/* Location & Salary */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.location}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400/90 font-mono text-[10px] tabular-nums">
                            <DollarSign className="w-3 h-3" />
                            {job.salaryRange.split('+')[0]}
                          </span>
                        )}
                      </div>

                      {/* Key Skills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {job.keySkills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.keySkills.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                            +{job.keySkills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Scheduled Interview Alert Badge on Card */}
                      {job.interviewDate && (
                        <div
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSchedulingJob(job);
                          }}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
                            <span className="font-bold truncate">
                              {job.interviewRound || 'Interview'}: {new Date(job.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 hover:underline shrink-0 ml-1">
                            Edit
                          </span>
                        </div>
                      )}

                      {/* Application Deadline Badge on Card */}
                      {job.deadline && !job.interviewDate && (
                        <div
                          className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSchedulingJob(job);
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-amber-500" />
                            <span>Deadline: {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <span className="text-[10px] hover:underline">Edit</span>
                        </div>
                      )}

                      {/* Quick AI Action Buttons on Card */}
                      <div
                        className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job, e.target.value as JobStatus)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded px-2 py-1 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offer">Offer Extended</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            title="Schedule Interview / Set Deadline Alert"
                            onClick={() => setSchedulingJob(job)}
                            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Run ATS 85%+ Optimizer"
                            onClick={() => onSelectJobForATS(job)}
                            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Generate Tailored Cover Letter"
                            onClick={() => onSelectJobForCoverLetter(job)}
                            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Mock Interview Simulator"
                            onClick={() => onSelectJobForInterview(job)}
                            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Mic className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnJobs.length === 0 && (
                    <div className="h-32 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                      No opportunities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Schedule / Alert</th>
                  <th className="py-3 px-4">ATS Match</th>
                  <th className="py-3 px-4">Location & Comp</th>
                  <th className="py-3 px-4">Core Skills</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    onClick={() => setSelectedJob(job)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{job.title}</div>
                      <div className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">{job.company}</div>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job, e.target.value as JobStatus)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="wishlist">Wishlist</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offer">Offer Extended</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      {job.interviewDate ? (
                        <div
                          onClick={() => setSchedulingJob(job)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold cursor-pointer w-fit"
                        >
                          <Clock className="w-3 h-3 text-indigo-500 shrink-0 animate-pulse" />
                          <span className="truncate max-w-[140px]">
                            {new Date(job.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      ) : job.deadline ? (
                        <div
                          onClick={() => setSchedulingJob(job)}
                          className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                        >
                          <Calendar className="w-3 h-3 text-amber-500" />
                          <span>Deadline: {new Date(job.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSchedulingJob(job)}
                          className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex items-center gap-1 font-medium"
                        >
                          <CalendarPlus className="w-3 h-3" />
                          <span>+ Schedule</span>
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {job.matchScore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                job.matchScore >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${job.matchScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-xs tabular-nums text-slate-800 dark:text-slate-200">{job.matchScore}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Unanalyzed</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300">{job.location}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] tabular-nums">{job.salaryRange || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {job.keySkills.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Schedule Interview or Set Deadline"
                          onClick={() => setSchedulingJob(job)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <CalendarCheck className="w-3 h-3 text-indigo-500" />
                          <span>Schedule</span>
                        </button>
                        <button
                          onClick={() => onSelectJobForATS(job)}
                          className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Target className="w-3 h-3" />
                          <span>ATS</span>
                        </button>
                        <button
                          onClick={() => onSelectJobForCoverLetter(job)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Letter</span>
                        </button>
                        <button
                          onClick={() => onSelectJobForInterview(job)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Prep</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opportunity Detail Drawer / Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {selectedJob.title}
                    {selectedJob.matchScore && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 tabular-nums">
                        {selectedJob.matchScore}% ATS
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{selectedJob.company} • {selectedJob.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
              {/* Quick AI Actions Row */}
              <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">Accelerate with AI:</span>
                <button
                  onClick={() => {
                    onSelectJobForATS(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Run ATS 85%+ Match Optimizer</span>
                </button>
                <button
                  onClick={() => {
                    onSelectJobForCoverLetter(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Generate Cover Letter</span>
                </button>
                <button
                  onClick={() => {
                    onSelectJobForInterview(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Interview Coach</span>
                </button>
                <button
                  onClick={() => setFollowUpJob(selectedJob)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium text-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Draft Follow-Up Email</span>
                </button>
                {selectedJob.directUrl && (
                  <a
                    href={selectedJob.directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs ml-auto"
                  >
                    <span>Job Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Status and Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">Status</div>
                  <select
                    value={selectedJob.status}
                    onChange={(e) => handleStatusChange(selectedJob, e.target.value as JobStatus)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer Extended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">Compensation</div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{selectedJob.salaryRange || 'Competitive'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">Contact / Recruiter</div>
                  <div className="text-slate-800 dark:text-slate-200 truncate">{selectedJob.contactPerson || 'Not specified'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500 dark:text-slate-400 mb-1">Deadline</div>
                  <div className="text-slate-800 dark:text-slate-200">{selectedJob.deadline ? selectedJob.deadline.substring(0, 10) : 'Open'}</div>
                </div>
              </div>

              {/* Milestone Schedule & Alerts Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Milestone Schedule & Smart Alerts
                    </h4>
                  </div>
                  <button
                    onClick={() => setSchedulingJob(selectedJob)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>{selectedJob.interviewDate ? 'Reschedule Interview' : 'Schedule Interview'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Interview Slot */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Scheduled Interview</span>
                    </div>
                    {selectedJob.interviewDate ? (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {new Date(selectedJob.interviewDate).toLocaleString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {selectedJob.interviewRound || 'Interview Round'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 dark:text-slate-500 italic text-[11px]">No interview date set yet</div>
                    )}
                  </div>

                  {/* Application Deadline */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>Application Deadline</span>
                    </div>
                    {selectedJob.deadline ? (
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {new Date(selectedJob.deadline).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-400 dark:text-slate-500 italic text-[11px]">No hard deadline specified</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Core Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Required Skills & Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.keySkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Job Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Job Description</h4>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                  {selectedJob.jobDescription}
                </div>
              </div>

              {/* Status History Timeline */}
              {selectedJob.history && selectedJob.history.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Audit & Transition History</span>
                  </h4>
                  <div className="space-y-2">
                    {selectedJob.history.map((h) => (
                      <div key={h.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-300 capitalize">{h.toStatus}</span>
                          {h.note && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{h.note}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(h.changedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete ${selectedJob.title} at ${selectedJob.company}?`)) {
                    await onDeleteJob(selectedJob.id);
                    setSelectedJob(null);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Opportunity</span>
              </button>
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Track New Job Opportunity</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI, Datadog"
                    value={newJobData.company}
                    onChange={(e) => setNewJobData({ ...newJobData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Remote / San Francisco"
                    value={newJobData.location}
                    onChange={(e) => setNewJobData({ ...newJobData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$180,000 - $220,000"
                    value={newJobData.salaryRange}
                    onChange={(e) => setNewJobData({ ...newJobData, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Initial Status</label>
                  <select
                    value={newJobData.status}
                    onChange={(e) => setNewJobData({ ...newJobData, status: e.target.value as JobStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Key Skills & Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Java, Spring Boot, MySQL, AWS"
                  value={newJobData.keySkillsStr}
                  onChange={(e) => setNewJobData({ ...newJobData, keySkillsStr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Job Description * (Paste full JD for ATS analysis)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste the complete job description here to enable automated 85%+ ATS match score calculation, gap analysis, and tailored bullet point suggestions..."
                  value={newJobData.jobDescription}
                  onChange={(e) => setNewJobData({ ...newJobData, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Job Posting URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newJobData.directUrl}
                    onChange={(e) => setNewJobData({ ...newJobData, directUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Recruiter / Contact Person</label>
                  <input
                    type="text"
                    placeholder="Name or Email"
                    value={newJobData.contactPerson}
                    onChange={(e) => setNewJobData({ ...newJobData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Deadline & Scheduled Interview Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Application Deadline</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newJobData.deadline}
                    onChange={(e) => setNewJobData({ ...newJobData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Scheduled Interview (Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newJobData.interviewDate}
                    onChange={(e) => setNewJobData({ ...newJobData, interviewDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-sans cursor-pointer text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview & Deadlines Modal */}
      {schedulingJob && (
        <ScheduleModal
          isOpen={!!schedulingJob}
          onClose={() => setSchedulingJob(null)}
          job={schedulingJob}
          onJobUpdated={(updated) => {
            onUpdateJob(updated.id, updated);
            if (selectedJob && selectedJob.id === updated.id) {
              setSelectedJob(updated);
            }
            setSchedulingJob(null);
          }}
        />
      )}
    </div>
  );
}
