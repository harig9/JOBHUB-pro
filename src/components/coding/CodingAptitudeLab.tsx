import React, { useState, useEffect, useMemo } from 'react';
import {
  Code2,
  Brain,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  Send,
  Sparkles,
  HelpCircle,
  Building,
} from 'lucide-react';
import { AptitudeQuestionItem, PracticeSubmission } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function CodingAptitudeLab() {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState<AptitudeQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeQuestionId, setActiveQuestionId] = useState<string>('');

  // Interactive state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [codeAnswer, setCodeAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<PracticeSubmission | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory, selectedDifficulty]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const cat = selectedCategory !== 'all' ? selectedCategory : undefined;
      const diff = selectedDifficulty !== 'all' ? selectedDifficulty : undefined;
      const data = await api.getCodingQuestions(cat, diff);
      const qList = data.questions || [];
      setQuestions(qList);

      if (data.submissions && data.submissions.length > 0) {
        const sMap: Record<string, boolean> = {};
        data.submissions.forEach((s) => {
          if (s.isCorrect) sMap[s.questionId] = true;
        });
        setSolvedMap(sMap);
      }

      if (qList.length > 0 && !qList.some((q) => q.id === activeQuestionId)) {
        setActiveQuestionId(qList[0].id);
        resetQuestionState(qList[0]);
      }
    } catch {
      showToast('Failed to load practice questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  const resetQuestionState = (q?: AptitudeQuestionItem) => {
    setSelectedOption(null);
    setCodeAnswer(q?.starterCode || '');
    setLastSubmissionResult(null);
    setShowExplanation(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);
  };

  // Timer tick for active question
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, activeQuestionId]);

  const handleSelectQuestion = (q: AptitudeQuestionItem) => {
    setActiveQuestionId(q.id);
    resetQuestionState(q);
  };

  const handleSubmit = async () => {
    if (!activeQuestion) return;
    try {
      setSubmitting(true);
      const timeSpent = Math.max(1, elapsedSeconds);
      const result = await api.submitPracticeAnswer({
        questionId: activeQuestion.id,
        selectedOption: activeQuestion.category !== 'coding' && activeQuestion.category !== 'sql' ? selectedOption ?? undefined : undefined,
        submittedCode: activeQuestion.category === 'coding' || activeQuestion.category === 'sql' ? codeAnswer : undefined,
        timeSpentSeconds: timeSpent,
      });

      setLastSubmissionResult(result.submission);
      setShowExplanation(true);
      setSolvedMap((prev) => ({ ...prev, [activeQuestion.id]: result.submission.isCorrect }));

      if (result.submission.isCorrect) {
        showToast('Correct answer! Great job!', 'success');
      } else {
        showToast('Incorrect. Check the detailed solution and retry.', 'error');
      }
    } catch {
      showToast('Failed to submit answer for evaluation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    quantitative: <Brain className="w-4 h-4 text-amber-500" />,
    logical: <Brain className="w-4 h-4 text-purple-500" />,
    verbal: <BookOpen className="w-4 h-4 text-blue-500" />,
    sql: <Database className="w-4 h-4 text-cyan-500" />,
    coding: <Code2 className="w-4 h-4 text-emerald-500" />,
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-3xl p-6 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            Interactive Placement & Campus Prep Lab
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Coding, SQL & Aptitude Practice Lab
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Server-evaluated practice environment covering Indian company patterns (TCS NQT, Infosys HackWithInfy, Flipkart, Amazon).
          </p>
        </div>

        {/* Live Timer & Stats */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#090d19]/90 p-3.5 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-cyan-300">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-indigo-500/20" />
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Solved:{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {Object.values(solvedMap).filter(Boolean).length}
            </span>
            /{questions.length}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0e1424]/80 p-4 rounded-2xl border border-slate-200/80 dark:border-indigo-500/20 backdrop-blur-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Category:
          </span>
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'quantitative', label: 'Quantitative' },
            { id: 'logical', label: 'Logical' },
            { id: 'verbal', label: 'Verbal' },
            { id: 'sql', label: 'SQL DB' },
            { id: 'coding', label: 'Programming & DSA' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 mr-1">Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left Questions List, Right Active Problem */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Question Bank Sidebar */}
        <div className="lg:col-span-4 space-y-2 max-h-[640px] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading question bank...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              No questions found for selected filters.
            </div>
          ) : (
            questions.map((q, idx) => {
              const isSelected = q.id === (activeQuestion?.id ?? '');
              const isSolved = solvedMap[q.id];

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 dark:border-indigo-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">{categoryIcons[q.category] || <HelpCircle className="w-4 h-4 text-slate-400" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {idx + 1}. {q.topic}
                      </span>
                      {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          q.difficulty === 'easy'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : q.difficulty === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      {q.companyTags?.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Active Question & Solver */}
        <div className="lg:col-span-8">
          {activeQuestion ? (
            <div className="bg-white dark:bg-[#0e1424]/85 border border-slate-200/80 dark:border-indigo-500/20 rounded-3xl p-6 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl space-y-6">
              {/* Question Header */}
              <div className="border-b border-slate-100 dark:border-indigo-500/15 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400 uppercase tracking-wide font-mono">
                      {activeQuestion.category} • {activeQuestion.topic}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        activeQuestion.difficulty === 'easy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-500/30'
                          : activeQuestion.difficulty === 'medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {activeQuestion.difficulty}
                    </span>
                  </div>

                  {activeQuestion.companyTags && (
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {activeQuestion.companyTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#090d19] border border-transparent dark:border-indigo-500/20 px-2 py-0.5 rounded-md font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {activeQuestion.question}
                </h2>
              </div>

              {/* Multiple Choice Options if MCQ */}
              {activeQuestion.options && activeQuestion.options.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Select Your Answer:
                  </label>
                  <div className="space-y-2">
                    {activeQuestion.options.map((opt, oIdx) => {
                      const isSelected = selectedOption === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedOption(oIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/80 dark:bg-[#131b31] border-indigo-600 dark:border-indigo-400 text-indigo-900 dark:text-white dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                              : 'bg-slate-50 dark:bg-[#090d19]/80 border-slate-200/80 dark:border-indigo-500/15 hover:bg-slate-100 dark:hover:bg-[#11172a] text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Code Editor for Coding / SQL */}
              {(activeQuestion.category === 'coding' || activeQuestion.category === 'sql') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      Solution Editor ({activeQuestion.category === 'sql' ? 'PostgreSQL Dialect' : 'JavaScript / Python'})
                    </label>
                    <button
                      onClick={() => setCodeAnswer(activeQuestion.starterCode || '')}
                      className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Starter Code
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    placeholder="Write your solution query or algorithm here..."
                    className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-300 dark:border-indigo-500/30 bg-[#060a12] text-emerald-400 dark:text-emerald-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)] leading-relaxed"
                  />
                  {activeQuestion.testCases && activeQuestion.testCases.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#090d19]/90 border border-transparent dark:border-indigo-500/15 text-xs space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Test Case Expectation:</span>
                      <div className="font-mono text-[11px] text-slate-600 dark:text-cyan-300/90">
                        Input: {activeQuestion.testCases[0].input} → Output: {activeQuestion.testCases[0].expectedOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-indigo-500/15">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  {showExplanation ? 'Hide Explanation' : 'View Explanation'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    'Evaluating...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit for Evaluation
                    </>
                  )}
                </button>
              </div>

              {/* Submission Result Feedback */}
              {lastSubmissionResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    lastSubmissionResult.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {lastSubmissionResult.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">
                      {lastSubmissionResult.isCorrect ? 'Status: Accepted / Correct' : 'Status: Incorrect'}
                    </p>
                    <p className="mt-1">
                      Time taken: {lastSubmissionResult.timeSpentSeconds} seconds. Your submission has been securely recorded to your preparation history.
                    </p>
                  </div>
                </div>
              )}

              {/* Detailed Explanation / Solution */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Detailed Solution & Working Steps:
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
              Select a question to start practicing
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
