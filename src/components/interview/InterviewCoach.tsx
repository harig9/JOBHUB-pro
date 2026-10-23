import React, { useState } from 'react';
import { InterviewSession, InterviewQuestion, Job } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import {
  Mic,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Award,
  ChevronRight,
  Send,
  Building2,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Square,
  FileText,
  Clock,
  Calendar,
} from 'lucide-react';
import { CheatSheetModal } from './CheatSheetModal.js';

interface InterviewCoachProps {
  sessions: InterviewSession[];
  jobs: Job[];
  initialJobId?: string;
  initialSessionId?: string;
  onRefreshInterviews: () => Promise<void>;
}

export function InterviewCoach({
  sessions,
  jobs,
  initialJobId,
  initialSessionId,
  onRefreshInterviews,
}: InterviewCoachProps) {
  const { showToast } = useToast();

  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId || sessions[0]?.id || '');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [userAnswerText, setUserAnswerText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Sync initialSessionId if provided/changed
  React.useEffect(() => {
    if (initialSessionId) {
      setActiveSessionId(initialSessionId);
    }
  }, [initialSessionId]);

  // New session modal / controls
  const [genJobTitle, setGenJobTitle] = useState('Senior Full Stack Engineer');
  const [genCompany, setGenCompany] = useState('Stripe');
  const [genJobId, setGenJobId] = useState<string>(initialJobId || jobs[0]?.id || '');
  const selectedJob = jobs.find((j) => j.id === genJobId) || jobs[0];

  // Text-To-Speech (Interviewer Voice)
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported by your browser', 'info');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!activeQuestion) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion.question);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-To-Text (Voice Answer Input)
  const handleToggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser. Please type your response.', 'info');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your STAR answer clearly into your microphone', 'info');
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswerText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        showToast(`Dictation paused: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
      showToast('Could not initialize speech recognition', 'error');
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeQuestion = activeSession?.questions.find((q) => q.id === selectedQuestionId) || activeSession?.questions[0];

  // Sync selected question state when session switches
  React.useEffect(() => {
    if (activeSession && activeSession.questions.length > 0) {
      const defaultQ = activeSession.questions[0];
      setSelectedQuestionId(defaultQ.id);
      setUserAnswerText(defaultQ.userAnswer || '');
      setShowSampleAnswer(false);
    }
  }, [activeSessionId, sessions]);

  // Sync answer text when switching question inside session
  React.useEffect(() => {
    if (activeQuestion) {
      setUserAnswerText(activeQuestion.userAnswer || '');
      setShowSampleAnswer(false);
      if (isSpeaking) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
    }
  }, [selectedQuestionId]);

  const handleGenerateSession = async () => {
    const job = jobs.find((j) => j.id === genJobId);
    setIsGenerating(true);
    try {
      const created = await api.generateInterviewPrep({
        jobTitle: job ? job.title : genJobTitle,
        company: job ? job.company : genCompany,
        jobDescription: job?.jobDescription,
        count: 4,
        jobId: job?.id,
      });
      await onRefreshInterviews();
      setActiveSessionId(created.id);
      setSelectedQuestionId(created.questions[0]?.id || '');
      showToast(`Interview coach session created for ${created.company}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!activeSession || !activeQuestion || !userAnswerText.trim()) {
      showToast('Please type an answer before evaluating', 'error');
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await api.evaluateAnswer({
        sessionId: activeSession.id,
        questionId: activeQuestion.id,
        userAnswer: userAnswerText,
      });
      await onRefreshInterviews();
      showToast(`Answer scored ${res.evaluation?.score}/10!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Evaluation failed', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Session Generator Bar */}
      <div className="bg-white dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-indigo-500/20 rounded-3xl p-5 space-y-4 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span>AI Interview Studio & STAR Evaluator</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice answering role-specific technical and behavioral questions with instant AI bar-raiser feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={genJobId}
              onChange={(e) => setGenJobId(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#090d19]/90 border border-slate-200/80 dark:border-indigo-500/20 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 max-w-[220px] truncate cursor-pointer"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.company} — {j.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#090d19] hover:bg-slate-200 dark:hover:bg-[#131b31] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200/80 dark:border-indigo-500/20 transition-colors cursor-pointer shadow-sm"
              title="View killer questions to ask and talking points"
            >
              <FileText className="w-4 h-4 text-violet-600 dark:text-cyan-400" />
              <span>Interview Cheat Sheet</span>
            </button>

            <button
              onClick={handleGenerateSession}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'Generating...' : 'New Mock Interview'}</span>
            </button>
          </div>
        </div>

        {/* If the target job has a scheduled interview date, highlight it */}
        {(() => {
          const matchedJob = jobs.find((j) => j.id === genJobId);
          if (!matchedJob?.interviewDate) return null;
          return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-50/80 dark:bg-[#090d19]/90 border border-indigo-200 dark:border-indigo-500/30 text-xs text-indigo-950 dark:text-indigo-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <span className="font-bold text-indigo-900 dark:text-white">
                    Live Interview Scheduled: {matchedJob.company} ({matchedJob.interviewRound || 'Interview'})
                  </span>
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-mono">
                    {new Date(matchedJob.interviewDate).toLocaleString([], {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white self-start sm:self-center shadow-xs">
                Alert Active
              </span>
            </div>
          );
        })()}
      </div>

      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Questions List in Active Session */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {activeSession.company} — {activeSession.jobTitle}
              </span>
              {activeSession.overallScore && (
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 tabular-nums">
                  Avg: {activeSession.overallScore}/10
                </span>
              )}
            </div>

            <div className="space-y-2">
              {activeSession.questions.map((q, idx) => {
                const isSelected = q.id === activeQuestion?.id;
                const score = q.evaluation?.score;

                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 backdrop-blur-md ${
                      isSelected
                        ? 'bg-white dark:bg-[#131b31] border-indigo-500 dark:border-indigo-400 dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                        : 'bg-white dark:bg-[#0e1424]/85 border-slate-200/80 dark:border-indigo-500/15 hover:border-indigo-400/50 dark:hover:border-indigo-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        Q{idx + 1} • {q.category}
                      </span>
                      {score !== undefined && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded tabular-nums ${
                            score >= 8
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {score}/10
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {q.question}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Question Detail, Answer Area & Evaluation Feedback */}
          <div className="lg:col-span-8 space-y-4">
            {activeQuestion ? (
              <div className="bg-white dark:bg-[#0e1424]/85 border border-slate-200/80 dark:border-indigo-500/20 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
                {/* Question Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-500/30 font-mono">
                        {activeQuestion.category} Question
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Targeting: {activeSession.company}
                      </span>
                    </div>

                    {/* TTS Button */}
                    <button
                      onClick={handleToggleSpeak}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSpeaking
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-slate-100 dark:bg-[#090d19] hover:bg-slate-200 dark:hover:bg-[#131b31] border border-transparent dark:border-indigo-500/15 text-slate-700 dark:text-slate-300'
                      }`}
                      title={isSpeaking ? 'Stop Audio' : 'Listen to interviewer voice'}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />}
                      <span>{isSpeaking ? 'Stop Voice' : 'Listen to Question'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {activeQuestion.question}
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#090d19]/80 border border-slate-200/80 dark:border-indigo-500/15 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                      <span>Why Interviewers Ask This:</span>
                    </div>
                    <p className="leading-relaxed">{activeQuestion.contextWhyAsked}</p>
                  </div>
                </div>

                {/* Key Answering Tips */}
                {activeQuestion.tips && activeQuestion.tips.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                      Strategic Tips to Mention:
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {activeQuestion.tips.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Answer Input Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Your Response (Practice Mode)
                      </label>
                      <button
                        onClick={handleToggleListen}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/25'
                        }`}
                        title="Dictate response via microphone"
                      >
                        <Mic className="w-3 h-3" />
                        <span>{isListening ? 'Listening (Click to Stop)...' : 'Voice Dictate'}</span>
                      </button>
                    </div>

                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-mono tabular-nums">
                      {userAnswerText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>

                  <textarea
                    rows={6}
                    value={userAnswerText}
                    onChange={(e) => setUserAnswerText(e.target.value)}
                    placeholder="Type your response here using the STAR method (Situation, Task, Action, Result)... Mention concrete metrics, technologies, and outcomes."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#090d19]/90 border border-slate-200/80 dark:border-indigo-500/20 rounded-2xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 font-sans leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1">
                    {/* Toggle Sample Model Answer */}
                    {activeQuestion.sampleStarAnswer && (
                      <button
                        onClick={() => setShowSampleAnswer(!showSampleAnswer)}
                        className="text-xs text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        {showSampleAnswer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showSampleAnswer ? 'Hide Sample STAR Answer' : 'View Sample 10/10 Answer'}</span>
                      </button>
                    )}

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !userAnswerText.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{isEvaluating ? 'Evaluating STAR...' : 'Evaluate My Answer'}</span>
                    </button>
                  </div>
                </div>

                {/* Sample 10/10 Answer Box */}
                {showSampleAnswer && activeQuestion.sampleStarAnswer && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-[#090d19]/90 border border-indigo-200 dark:border-indigo-500/30 text-xs space-y-2 animate-in fade-in">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 uppercase text-[10px] tracking-wider block">
                      Sample 10/10 STAR Answer Breakdown:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                      <div><strong className="text-indigo-700 dark:text-indigo-300">Situation:</strong> {activeQuestion.sampleStarAnswer.situation}</div>
                      <div><strong className="text-indigo-700 dark:text-indigo-300">Task:</strong> {activeQuestion.sampleStarAnswer.task}</div>
                      <div><strong className="text-indigo-700 dark:text-indigo-300">Action:</strong> {activeQuestion.sampleStarAnswer.action}</div>
                      <div><strong className="text-indigo-700 dark:text-indigo-300">Result:</strong> {activeQuestion.sampleStarAnswer.result}</div>
                    </div>
                  </div>
                )}

                {/* AI Evaluation Result Card */}
                {activeQuestion.evaluation && (
                  <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Interview Evaluation</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Score:</span>
                        <span
                          className={`text-sm font-mono font-black px-2.5 py-0.5 rounded-lg tabular-nums ${
                            activeQuestion.evaluation.score >= 8
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {activeQuestion.evaluation.score} / 10
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Strengths */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {activeQuestion.evaluation.strengths.map((s, idx) => (
                            <li key={idx}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="space-y-1.5">
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] uppercase flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> High-Impact Improvements
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {activeQuestion.evaluation.improvements.map((imp, idx) => (
                            <li key={idx}>• {imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Better Model Draft */}
                    {activeQuestion.evaluation.betterAnswerDraft && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">
                          Polished Bar-Raiser Model Answer:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                          "{activeQuestion.evaluation.betterAnswerDraft}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                Select a question from the left to start practice.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          Click "New Mock Interview" above to generate tailored interview questions.
        </div>
      )}

      {/* Executive Cheat Sheet Modal */}
      {selectedJob && (
        <CheatSheetModal
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
          job={selectedJob}
        />
      )}
    </div>
  );
}
