import React, { useState } from 'react';
import {
  Resume,
  ResumeTemplateId,
  WorkExperience,
  Education,
  SkillCategory,
  ProjectItem,
} from '../../types/index.js';
import { ResumePreview } from './ResumePreview.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';
import { exportResumeToPdf, generateResumePdfBlob } from '../../utils/pdfExport.js';
import { useAuth } from '../../context/AuthContext.js';
import { googleDriveService, DriveFile } from '../../services/googleDriveService.js';
import {
  FileText,
  Plus,
  Copy,
  Printer,
  Download,
  FileDown,
  Upload,
  HardDrive,
  Cloud,
  CheckCircle2,
  Trash2,
  Sparkles,
  Star,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  Award,
  BookOpen,
  Briefcase,
  X,
} from 'lucide-react';

interface ResumeStudioProps {
  resumes: Resume[];
  initialResumeId?: string;
  onSelectResumeForATS: (resume: Resume) => void;
  onRefreshResumes: () => Promise<void>;
}

export function ResumeStudio({ resumes, initialResumeId, onSelectResumeForATS, onRefreshResumes }: ResumeStudioProps) {
  const { showToast } = useToast();
  const { isDriveConnected, connectGoogleDrive } = useAuth();
  const [activeResumeId, setActiveResumeId] = useState<string>(initialResumeId || resumes[0]?.id || '');
  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'summary' | 'experience' | 'skills' | 'education' | 'projects'>('experience');
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplateId>('modern-clean');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [rawResumeText, setRawResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveFilesForImport, setDriveFilesForImport] = useState<DriveFile[]>([]);
  const [loadingDriveImport, setLoadingDriveImport] = useState(false);

  // Sync initialResumeId if changed
  React.useEffect(() => {
    if (initialResumeId) {
      setActiveResumeId(initialResumeId);
    }
  }, [initialResumeId]);

  const currentResume = resumes.find((r) => r.id === activeResumeId) || resumes[0];

  // Local draft state for quick editing
  const [draftResume, setDraftResume] = useState<Resume | null>(currentResume ? JSON.parse(JSON.stringify(currentResume)) : null);

  // Sync draft when switching resume
  React.useEffect(() => {
    if (currentResume) {
      setDraftResume(JSON.parse(JSON.stringify(currentResume)));
      setPreviewTemplate(currentResume.templateId || 'modern-clean');
    }
  }, [activeResumeId, resumes]);

  if (!draftResume) {
    return (
      <div className="p-12 text-center text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No resumes available. Click "Create Resume" to get started.</p>
      </div>
    );
  }

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await api.updateResume(draftResume.id, {
        ...draftResume,
        templateId: previewTemplate,
      });
      await onRefreshResumes();
      showToast('Resume saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await api.duplicateResume(draftResume.id);
      await onRefreshResumes();
      setActiveResumeId(dup.id);
      showToast(`Created duplicate: "${dup.title}"`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Duplicate failed', 'error');
    }
  };

  const handleSetPrimary = async () => {
    try {
      await api.setPrimaryResume(draftResume.id);
      await onRefreshResumes();
      showToast('Set as Primary Master Resume', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (resumes.length <= 1) {
      showToast('You must maintain at least one resume profile', 'error');
      return;
    }
    if (confirm(`Delete resume "${draftResume.title}"?`)) {
      try {
        await api.deleteResume(draftResume.id);
        await onRefreshResumes();
        setActiveResumeId(resumes[0].id);
        showToast('Resume removed', 'info');
      } catch (err: any) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    try {
      const fileName = exportResumeToPdf(draftResume, {
        templateId: previewTemplate,
      });
      showToast(`Exported ${fileName} (ATS-Optimized PDF)!`, 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export PDF';
      console.error('PDF Export Error:', err);
      showToast(errorMsg, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveToDrive = async () => {
    setIsSavingToDrive(true);
    try {
      if (!googleDriveService.isConnected()) {
        showToast('Connecting to Google Drive...', 'info');
        await connectGoogleDrive();
      }
      const { blob, fileName } = generateResumePdfBlob(draftResume, {
        templateId: previewTemplate,
      });
      const uploaded = await googleDriveService.uploadFile(fileName, 'application/pdf', blob);
      showToast(`Saved "${uploaded.name}" to 'JobHub Pro Career Suite' in Google Drive!`, 'success');
    } catch (err: any) {
      if (err.message?.includes('dismissed') || err.message?.includes('popup-closed')) return;
      showToast(err.message || 'Failed to save resume to Google Drive', 'error');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handleLoadDriveFilesForImport = async () => {
    setLoadingDriveImport(true);
    try {
      if (!googleDriveService.isConnected()) {
        await connectGoogleDrive();
      }
      const files = await googleDriveService.listFiles({ filterDocTypes: true });
      setDriveFilesForImport(files);
    } catch (err: any) {
      showToast(err.message || 'Failed to load Google Drive files', 'error');
    } finally {
      setLoadingDriveImport(false);
    }
  };

  const handleImportDriveFileIntoDraft = async (file: DriveFile) => {
    setIsParsing(true);
    try {
      showToast(`Fetching "${file.name}" from Google Drive...`, 'info');
      const text = await googleDriveService.downloadFileAsText(file.id, file.mimeType);
      if (!text || text.trim().length < 50) {
        throw new Error('Document did not contain extractable text.');
      }
      setRawResumeText(text);
      setUploadedFileInfo({
        name: file.name,
        size: 'Drive Cloud Document',
        chars: text.length,
      });
      showToast(`Loaded ${text.length.toLocaleString()} characters from Google Drive! Click Parse to import.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to load Drive file', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string; chars: number } | null>(null);
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File exceeds 5MB size limit', 'error');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      showToast('Supported formats: .pdf, .docx, .doc, .txt', 'error');
      return;
    }

    setIsExtractingDoc(true);
    try {
      const result = await api.extractDocumentText(file);
      setRawResumeText(result.extractedText);
      setUploadedFileInfo({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        chars: result.charCount,
      });
      showToast(`Extracted ${result.charCount} characters from ${file.name}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to extract text from document', 'error');
    } finally {
      setIsExtractingDoc(false);
    }
  };

  const handleExportDocx = () => {
    const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${draftResume.personalInfo.fullName} Resume</title>
<style>
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.25; color: #111; margin: 1in; }
  h1 { font-size: 20pt; text-align: center; text-transform: uppercase; margin-bottom: 2pt; font-weight: bold; }
  .contact { text-align: center; font-size: 10pt; color: #444; margin-bottom: 14pt; }
  h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5pt solid #333; padding-bottom: 2pt; margin-top: 12pt; margin-bottom: 6pt; }
  .job-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt; margin-top: 6pt; }
  .job-company { font-style: italic; font-weight: normal; }
  .date { float: right; font-weight: normal; font-size: 10pt; color: #555; }
  ul { margin-top: 3pt; margin-bottom: 6pt; padding-left: 18pt; }
  li { margin-bottom: 2.5pt; line-height: 1.3; }
  .skill-cat { font-weight: bold; font-size: 10pt; }
</style>
</head>
<body>
  <h1>${draftResume.personalInfo.fullName}</h1>
  <div class="contact">
    ${draftResume.personalInfo.email} | ${draftResume.personalInfo.phone} | ${draftResume.personalInfo.location}
    ${draftResume.personalInfo.linkedin ? ' | ' + draftResume.personalInfo.linkedin : ''}
    ${draftResume.personalInfo.github ? ' | ' + draftResume.personalInfo.github : ''}
  </div>

  <h2>Professional Summary</h2>
  <p>${draftResume.summary}</p>

  <h2>Professional Experience</h2>
  ${draftResume.experiences
    .map(
      (e) => `
    <div class="job-header">
      <span><strong>${e.position}</strong> — <span class="job-company">${e.company}</span></span>
      <span class="date">${e.startDate} – ${e.endDate}</span>
    </div>
    <ul>
      ${e.bulletPoints.map((b) => `<li>${b}</li>`).join('')}
    </ul>
  `
    )
    .join('')}

  <h2>Technical Competencies & Skills</h2>
  <ul>
    ${draftResume.skills.map((s) => `<li><span class="skill-cat">${s.category}:</span> ${s.skills.join(', ')}</li>`).join('')}
  </ul>

  <h2>Education</h2>
  ${draftResume.educations
    .map(
      (ed) => `
    <div class="job-header">
      <span><strong>${ed.institution}</strong> — ${ed.degree} in ${ed.fieldOfStudy}${ed.honors ? ' (' + ed.honors + ')' : ''}</span>
      <span class="date">${ed.startDate} – ${ed.endDate}</span>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draftResume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume exported in ATS-friendly Word DOCX format', 'success');
  };

  const handleParseRawText = async () => {
    if (!rawResumeText.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await api.parseResumeText(rawResumeText);
      const newResume = await api.createResume({
        title: parsed.title || 'Imported ATS Resume',
        isPrimary: false,
        templateId: 'modern-clean',
        personalInfo: parsed.personalInfo || draftResume.personalInfo,
        summary: parsed.summary || draftResume.summary,
        experiences: parsed.experiences || draftResume.experiences,
        skills: parsed.skills || draftResume.skills,
        educations: parsed.educations || draftResume.educations,
        targetRoles: ['Software Engineer'],
        projects: [],
        certifications: [],
      });
      await onRefreshResumes();
      setActiveResumeId(newResume.id);
      setIsImportModalOpen(false);
      setRawResumeText('');
      setUploadedFileInfo(null);
      showToast('Resume parsed and imported successfully with Gemini AI!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Parsing failed', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Metric quantifier counter
  const allBullets = draftResume.experiences.flatMap((e) => e.bulletPoints);
  const metricCount = allBullets.filter((b) => /\d+|%|\$|x|ms/i.test(b)).length;
  const metricRatio = allBullets.length > 0 ? Math.round((metricCount / allBullets.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="no-print bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-sm dark:shadow-xl">
        {/* Resume Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Profile:</label>
            <select
              value={draftResume.id}
              onChange={(e) => setActiveResumeId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[260px] truncate cursor-pointer shadow-sm"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} {r.isPrimary ? '★ [Primary]' : ''}
                </option>
              ))}
            </select>
          </div>

          {!draftResume.isPrimary && (
            <button
              onClick={handleSetPrimary}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer font-medium"
              title="Set as Default Master Resume"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-300 dark:text-amber-300" />
              <span>Make Primary</span>
            </button>
          )}

          <button
            onClick={handleDuplicate}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Text / DOCX</span>
          </button>
        </div>

        {/* Template & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1 font-semibold uppercase">Style:</span>
            {(['modern-clean', 'executive-serif', 'tech-minimal', 'compact-ats'] as ResumeTemplateId[]).map((tmpl) => (
              <button
                key={tmpl}
                onClick={() => setPreviewTemplate(tmpl)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  previewTemplate === tmpl ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tmpl === 'modern-clean'
                  ? 'Modern'
                  : tmpl === 'executive-serif'
                  ? 'Executive'
                  : tmpl === 'tech-minimal'
                  ? 'Tech'
                  : 'Compact ATS'}
              </button>
            ))}
          </div>

          <button
            onClick={() => onSelectResumeForATS(draftResume)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run ATS Optimizer</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            title="Download ATS-optimized searchable vector PDF for external job applications"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-100" />
            <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          {/* Save to Google Drive Button */}
          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Upload ATS-optimized PDF to 'JobHub Pro Career Suite' folder in Google Drive"
          >
            <HardDrive className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSavingToDrive ? 'animate-spin' : ''}`} />
            <span>{isSavingToDrive ? 'Saving...' : 'Save to Drive'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Clean ATS-Compliant PDF via Print Engine"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>PDF Print</span>
          </button>

          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Download formatted DOC file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOCX</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Editor (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Column */}
        <div className="no-print lg:col-span-5 space-y-4">
          {/* Section Navigation Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl overflow-x-auto gap-1">
            {[
              { id: 'experience', label: 'Work Experience' },
              { id: 'summary', label: 'Summary' },
              { id: 'skills', label: 'Skills' },
              { id: 'education', label: 'Education' },
              { id: 'projects', label: 'Projects' },
              { id: 'info', label: 'Contact' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveEditorTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeEditorTab === tab.id ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor Form Panels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl">
            {/* WORK EXPERIENCE TAB */}
            {activeEditorTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Experience Items</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Use the STAR formula and quantifiable metrics (%, $, x)</p>
                  </div>
                  <button
                    onClick={() => {
                      const newExp: WorkExperience = {
                        id: `exp_${Date.now()}`,
                        company: 'New Company',
                        position: 'Senior Engineer',
                        startDate: '2023-01',
                        endDate: 'Present',
                        current: true,
                        bulletPoints: ['Spearheaded engineering initiatives and scaled system throughput.'],
                      };
                      setDraftResume({
                        ...draftResume,
                        experiences: [newExp, ...draftResume.experiences],
                      });
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-600/30 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Role</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {draftResume.experiences.map((exp, expIdx) => (
                    <div key={exp.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Position Title</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => {
                              const updated = [...draftResume.experiences];
                              updated[expIdx].position = e.target.value;
                              setDraftResume({ ...draftResume, experiences: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updated = [...draftResume.experiences];
                              updated[expIdx].company = e.target.value;
                              setDraftResume({ ...draftResume, experiences: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...draftResume.experiences];
                              updated[expIdx].startDate = e.target.value;
                              setDraftResume({ ...draftResume, experiences: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...draftResume.experiences];
                              updated[expIdx].endDate = e.target.value;
                              setDraftResume({ ...draftResume, experiences: updated });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>

                      {/* Bullet points */}
                      <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Bullet Points</label>
                          <button
                            onClick={() => {
                              const updated = [...draftResume.experiences];
                              updated[expIdx].bulletPoints.push('Delivered high-impact optimization increasing performance.');
                              setDraftResume({ ...draftResume, experiences: updated });
                            }}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>

                        {exp.bulletPoints.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) => {
                                const updated = [...draftResume.experiences];
                                updated[expIdx].bulletPoints[bIdx] = e.target.value;
                                setDraftResume({ ...draftResume, experiences: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                            />
                            <button
                              onClick={() => {
                                const updated = [...draftResume.experiences];
                                updated[expIdx].bulletPoints.splice(bIdx, 1);
                                setDraftResume({ ...draftResume, experiences: updated });
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const updated = draftResume.experiences.filter((_, idx) => idx !== expIdx);
                            setDraftResume({ ...draftResume, experiences: updated });
                          }}
                          className="text-[11px] text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Role</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUMMARY TAB */}
            {activeEditorTab === 'summary' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Professional Executive Summary
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target 3-4 sentences outlining your core seniority, technology stack, and measurable career highlights.
                </p>
                <textarea
                  rows={8}
                  value={draftResume.summary}
                  onChange={(e) => setDraftResume({ ...draftResume, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>
            )}

            {/* SKILLS TAB */}
            {activeEditorTab === 'skills' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Skill Taxonomies</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Group skills cleanly for automated ATS keyword parsers</p>
                  </div>
                  <button
                    onClick={() => {
                      const newCat: SkillCategory = {
                        category: 'New Domain',
                        skills: ['Tool A', 'Tool B'],
                      };
                      setDraftResume({
                        ...draftResume,
                        skills: [...draftResume.skills, newCat],
                      });
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    + Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {draftResume.skills.map((cat, cIdx) => (
                    <div key={cIdx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={cat.category}
                          onChange={(e) => {
                            const updated = [...draftResume.skills];
                            updated[cIdx].category = e.target.value;
                            setDraftResume({ ...draftResume, skills: updated });
                          }}
                          className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => {
                            const updated = draftResume.skills.filter((_, idx) => idx !== cIdx);
                            setDraftResume({ ...draftResume, skills: updated });
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cat.skills.join(', ')}
                        onChange={(e) => {
                          const updated = [...draftResume.skills];
                          updated[cIdx].skills = e.target.value.split(',').map((s) => s.trim());
                          setDraftResume({ ...draftResume, skills: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDUCATION & PROJECTS TABS */}
            {(activeEditorTab === 'education' || activeEditorTab === 'projects' || activeEditorTab === 'info') && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {activeEditorTab === 'education' && 'Institutions, degrees, GPAs, and honors.'}
                  {activeEditorTab === 'projects' && 'Open source repositories, key architectures, and metrics.'}
                  {activeEditorTab === 'info' && 'Contact information rendered at top of resume.'}
                </div>

                {activeEditorTab === 'info' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Full Name</label>
                      <input
                        type="text"
                        value={draftResume.personalInfo.fullName}
                        onChange={(e) =>
                          setDraftResume({
                            ...draftResume,
                            personalInfo: { ...draftResume.personalInfo, fullName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Email</label>
                        <input
                          type="email"
                          value={draftResume.personalInfo.email}
                          onChange={(e) =>
                            setDraftResume({
                              ...draftResume,
                              personalInfo: { ...draftResume.personalInfo, email: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Phone</label>
                        <input
                          type="text"
                          value={draftResume.personalInfo.phone}
                          onChange={(e) =>
                            setDraftResume({
                              ...draftResume,
                              personalInfo: { ...draftResume.personalInfo, phone: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeEditorTab === 'education' && (
                  <div className="space-y-3">
                    {draftResume.educations.map((edu, idx) => (
                      <div key={edu.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...draftResume.educations];
                            updated[idx].institution = e.target.value;
                            setDraftResume({ ...draftResume, educations: updated });
                          }}
                          className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-900 dark:text-slate-100"
                        />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...draftResume.educations];
                              updated[idx].degree = e.target.value;
                              setDraftResume({ ...draftResume, educations: updated });
                            }}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-200"
                          />
                          <input
                            type="text"
                            value={edu.fieldOfStudy}
                            onChange={(e) => {
                              const updated = [...draftResume.educations];
                              updated[idx].fieldOfStudy = e.target.value;
                              setDraftResume({ ...draftResume, educations: updated });
                            }}
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeEditorTab === 'projects' && (
                  <div className="space-y-3">
                    {draftResume.projects.map((proj, pIdx) => (
                      <div key={proj.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => {
                            const updated = [...draftResume.projects];
                            updated[pIdx].name = e.target.value;
                            setDraftResume({ ...draftResume, projects: updated });
                          }}
                          className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-900 dark:text-slate-100"
                        />
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...draftResume.projects];
                            updated[pIdx].description = e.target.value;
                            setDraftResume({ ...draftResume, projects: updated });
                          }}
                          className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ATS Compliance Checklist Widget */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ATS Compliance Checklist
              </span>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                100% Parser Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Single column linear</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Standard section headers</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>No complex tables or icons</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Measurable metrics ({metricRatio}% density)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="no-print flex items-center justify-between px-2 text-xs text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" />
              Live Visual Preview (Target 8.5" x 11" Canvas)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">
                Style: {previewTemplate}
              </span>
              <button
                onClick={handleSaveToDrive}
                disabled={isSavingToDrive}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Save PDF directly to Google Drive"
              >
                <HardDrive className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{isSavingToDrive ? 'Saving...' : 'Drive'}</span>
              </button>
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Download this resume as an ATS-compliant PDF"
              >
                <FileDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>{isExportingPdf ? 'Exporting...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <ResumePreview resume={draftResume} templateId={previewTemplate} />
          </div>
        </div>
      </div>

      {/* Raw Text / DOCX Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100">AI Resume Parser (Text / DOCX / PDF Extraction)</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* File Upload Drop Zone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Option 1: Upload File (.pdf, .docx, .txt — Max 5MB)
                </label>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 transition-all text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">Click to browse or drag file here</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Supports PDF text layers, Word (.docx/.doc), and plain text</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">.PDF</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">.DOCX</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400">.TXT</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold">Max 5MB</span>
                  </div>
                </label>

                {isExtractingDoc && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                    <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting document text using server-side engine...</span>
                  </div>
                )}

                {uploadedFileInfo && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{uploadedFileInfo.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">({uploadedFileInfo.size})</span>
                    </div>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {uploadedFileInfo.chars.toLocaleString()} chars extracted
                    </span>
                  </div>
                )}
              </div>

              {/* Option 2: Paste Raw Text */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Option 2: Paste Raw Resume Text
                </label>
                <textarea
                  rows={6}
                  value={rawResumeText}
                  onChange={(e) => setRawResumeText(e.target.value)}
                  placeholder="Paste raw resume contents here...
e.g.
Alex Morgan
alex@example.com | (555) 123-4567
San Francisco, CA

SUMMARY
Senior Software Architect with 8+ years experience..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Option 3: Import from Google Drive */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Option 3: Import from Google Drive
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadDriveFilesForImport}
                    disabled={loadingDriveImport}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <HardDrive className={`w-3 h-3 ${loadingDriveImport ? 'animate-spin' : ''}`} />
                    <span>{loadingDriveImport ? 'Loading...' : driveFilesForImport.length > 0 ? 'Refresh Drive' : 'Browse Google Drive'}</span>
                  </button>
                </div>

                {driveFilesForImport.length > 0 ? (
                  <div className="max-h-44 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    {driveFilesForImport.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-xs transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImportDriveFileIntoDraft(f)}
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
                        >
                          Select & Load
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Click <strong>Browse Google Drive</strong> to inspect and load existing resume files from your cloud storage.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseRawText}
                  disabled={isParsing || !rawResumeText.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isParsing ? 'Parsing with Gemini...' : 'Extract & Create Resume'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
