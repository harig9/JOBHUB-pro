import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  FileText,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Folder,
  Cloud,
  FileDown,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { googleDriveService, DriveFile } from '../../services/googleDriveService.js';
import { useToast } from '../Toast.js';
import { Resume } from '../../types/index.js';
import { generateResumePdfBlob } from '../../utils/pdfExport.js';
import { api } from '../../services/api.js';

interface GoogleDriveHubProps {
  resumes: Resume[];
  onImportResumeToStudio?: (resumeId: string) => void;
  onRefreshResumes?: () => Promise<void>;
}

export function GoogleDriveHub({ resumes, onImportResumeToStudio, onRefreshResumes }: GoogleDriveHubProps) {
  const { isDriveConnected, connectGoogleDrive, disconnectGoogleDrive } = useAuth();
  const { showToast } = useToast();

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pdf' | 'doc' | 'folder'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingResume, setIsExportingResume] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');

  // Delete Confirmation Modal State (MANDATORY: Explicit User Confirmation before destructive operations)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Import to Studio state
  const [importingFileId, setImportingFileId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!googleDriveService.isConnected()) {
      setFiles([]);
      return;
    }

    setLoading(true);
    try {
      const driveFiles = await googleDriveService.listFiles({
        query: searchQuery,
        filterDocTypes: selectedFilter !== 'all',
      });
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to list files:', err);
      showToast(err.message || 'Failed to list Google Drive files', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilter, showToast]);

  useEffect(() => {
    if (isDriveConnected) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [isDriveConnected, fetchFiles]);

  // Handle Connect
  const handleConnect = async () => {
    try {
      await connectGoogleDrive();
      await fetchFiles();
    } catch {
      // Toast handled by connectGoogleDrive
    }
  };

  // Upload local file to Drive
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showToast('File exceeds 15MB limit', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await googleDriveService.uploadFile(file.name, file.type || 'application/octet-stream', file);
      showToast(`Uploaded "${uploaded.name}" to Google Drive folder!`, 'success');
      await fetchFiles();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload file to Google Drive', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Export current Resume to Google Drive
  const handleExportResumeToDrive = async () => {
    const resumeToExport = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
    if (!resumeToExport) {
      showToast('No resume available to export', 'error');
      return;
    }

    setIsExportingResume(true);
    try {
      const { blob, fileName } = generateResumePdfBlob(resumeToExport);
      const uploaded = await googleDriveService.uploadFile(fileName, 'application/pdf', blob);
      showToast(`Saved "${uploaded.name}" to 'JobHub Pro Career Suite' in Google Drive!`, 'success');
      await fetchFiles();
    } catch (err: any) {
      showToast(err.message || 'Failed to save resume to Google Drive', 'error');
    } finally {
      setIsExportingResume(false);
    }
  };

  // Import file from Google Drive into Resume Studio
  const handleImportFromDrive = async (file: DriveFile) => {
    setImportingFileId(file.id);
    try {
      showToast(`Downloading "${file.name}" from Google Drive...`, 'info');
      const text = await googleDriveService.downloadFileAsText(file.id, file.mimeType);

      if (!text || text.trim().length < 50) {
        throw new Error('Downloaded document did not contain readable text content.');
      }

      showToast('Extracting career structure with Gemini AI...', 'info');
      const parsed = await api.parseResumeText(text);

      const created = await api.createResume({
        title: `${file.name.replace(/\.[^/.]+$/, '')} (From Drive)`,
        isPrimary: false,
        templateId: 'modern-clean',
        personalInfo: parsed.personalInfo || {
          fullName: 'Candidate Name',
          email: '',
          phone: '',
          location: '',
        },
        summary: parsed.summary || '',
        experiences: parsed.experiences || [],
        skills: parsed.skills || [],
        educations: parsed.educations || [],
        targetRoles: ['Software Engineer'],
        projects: [],
        certifications: [],
      });

      if (onRefreshResumes) {
        await onRefreshResumes();
      }

      showToast(`Imported "${created.title}" successfully into Resume Studio!`, 'success');
      if (onImportResumeToStudio) {
        onImportResumeToStudio(created.id);
      }
    } catch (err: any) {
      console.error('Import from Drive failed:', err);
      showToast(err.message || 'Failed to import document from Google Drive', 'error');
    } finally {
      setImportingFileId(null);
    }
  };

  // Perform confirmed deletion (MANDATORY per SKILL.md)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await googleDriveService.deleteFile(fileToDelete.id);
      showToast(`Removed "${fileToDelete.name}" from Google Drive`, 'info');
      setFileToDelete(null);
      await fetchFiles();
    } catch (err: any) {
      showToast(err.message || 'Delete operation failed', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    if (selectedFilter === 'pdf') return f.mimeType.includes('pdf');
    if (selectedFilter === 'doc')
      return (
        f.mimeType.includes('word') ||
        f.mimeType.includes('document') ||
        f.mimeType.includes('msword') ||
        f.mimeType.includes('text/plain')
      );
    if (selectedFilter === 'folder') return f.mimeType.includes('folder');
    return true;
  });

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '—';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '—';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
          <HardDrive className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold">
              <Cloud className="w-3.5 h-3.5" />
              <span>Google Workspace Integration</span>
              <span>•</span>
              <span>Drive API Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Google Drive Cloud Career Hub
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Seamlessly sync your ATS-optimized resumes, cover letters, and application materials directly to your Google Drive. Import existing career documents for instant AI parsing and ATS scoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isDriveConnected ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="pr-3 text-left">
                  <span className="text-xs font-bold text-white block">Drive Connected</span>
                  <span className="text-[11px] text-emerald-300">Sync & Export Ready</span>
                </div>
                <button
                  onClick={disconnectGoogleDrive}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="gsi-material-button inline-flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Connect Google Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Operations Card */}
      {isDriveConnected ? (
        <div className="space-y-6">
          {/* Action Row: Export to Drive + Direct Upload + Search & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Quick Resume Export to Drive */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Save to Drive:</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[220px] truncate cursor-pointer shadow-sm"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExportResumeToDrive}
                  disabled={isExportingResume}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Upload ATS-optimized vector PDF to JobHub Pro Career Suite folder on Drive"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExportingResume ? 'Saving to Drive...' : 'Save PDF to Drive'}</span>
                </button>

                {/* Direct File Upload */}
                <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-sm cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File to Drive'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleUploadFile}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer self-start lg:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Drive</span>
              </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files in Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(['all', 'pdf', 'doc', 'folder'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedFilter === filter
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {filter === 'all'
                      ? 'All'
                      : filter === 'pdf'
                      ? 'PDFs'
                      : filter === 'doc'
                      ? 'Docs / Text'
                      : 'Folders'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drive Files List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Google Drive Documents ({filteredFiles.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Target Folder: <strong className="text-slate-700 dark:text-slate-300">JobHub Pro Career Suite</strong>
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-medium text-slate-500">Loading files from your Google Drive...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {searchQuery ? `No files match "${searchQuery}"` : 'No files found in Google Drive'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click <strong>Save PDF to Drive</strong> or <strong>Upload File to Drive</strong> above to start organizing your career documents.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFiles.map((file) => {
                  const isPdf = file.mimeType.includes('pdf');
                  const isDoc = file.mimeType.includes('word') || file.mimeType.includes('document');
                  const isFolder = file.mimeType.includes('folder');
                  const isImporting = importingFileId === file.id;

                  return (
                    <div
                      key={file.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isFolder
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : isPdf
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : isDoc
                              ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isFolder ? (
                            <Folder className="w-5 h-5" />
                          ) : isPdf ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                            <span>{file.name}</span>
                            {file.name.includes('JobHub') && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                App Sync
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>
                              Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Import into Resume Studio button (for documents) */}
                        {!isFolder && (
                          <button
                            onClick={() => handleImportFromDrive(file)}
                            disabled={isImporting}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            title="Extract and parse this document into Resume Studio with Gemini AI"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isImporting ? 'animate-spin' : ''}`} />
                            <span>{isImporting ? 'Importing...' : 'AI Import'}</span>
                          </button>
                        )}

                        {/* Open in Google Drive Viewer */}
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Drive View</span>
                          </a>
                        )}

                        {/* Delete File button (Opens mandatory confirmation modal) */}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Not Connected State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
            <Cloud className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Connect Google Drive to Get Started
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              With permission from your Google account, JobHub Pro will access your Google Drive to sync your career resumes, export ATS-ready PDF files, and import existing career documents directly into Resume Studio.
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <span>Connect Google Drive</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operation (SKILL.md Requirement) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Confirm File Deletion
                </h3>
                <p className="text-xs text-slate-500">Google Drive Destructive Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                "{fileToDelete.name}"
              </strong>{' '}
              from your Google Drive? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete from Drive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
