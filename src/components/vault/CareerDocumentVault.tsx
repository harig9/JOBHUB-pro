import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  FileText,
  Upload,
  Trash2,
  Download,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  FileCheck,
  Search,
} from 'lucide-react';
import { CareerVaultDocument } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function CareerDocumentVault() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<CareerVaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Document Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<CareerVaultDocument['category']>('Certificate');
  const [docNotes, setDocNotes] = useState('');

  // Delete Confirmation Modal (Consequential Action - Prompt Rule)
  const [documentToDelete, setDocumentToDelete] = useState<CareerVaultDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.getVaultDocuments();
      setDocuments(data);
    } catch {
      showToast('Failed to load vault documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      showToast('Document name is required', 'error');
      return;
    }

    try {
      const newDoc = await api.addVaultDocument({
        name: docName,
        category: docCategory,
        notes: docNotes,
        fileSize: '1.2 MB',
        fileType: 'PDF Document',
        verified: true,
      });

      setDocuments((prev) => [newDoc, ...prev]);
      showToast('Document securely cataloged in your vault', 'success');
      setIsAddModalOpen(false);
      setDocName('');
      setDocNotes('');
    } catch {
      showToast('Failed to save document record', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await api.deleteVaultDocument(documentToDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== documentToDelete.id));
      showToast(`Deleted ${documentToDelete.name} from vault`, 'success');
    } catch {
      showToast('Failed to delete document', 'error');
    } finally {
      setDocumentToDelete(null);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Credential & Document Vault
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Career Document Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store and organize degree transcripts, internship certificates, offer letters, and verified skill badges.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Catalog New Document
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {['all', 'Resume', 'Certificate', 'Offer Letter', 'Project Evidence', 'Transcript'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Docs' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading your verified documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No documents found. Click "Catalog New Document" to add verified records.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  {doc.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {doc.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {doc.name}
                </h3>
                {doc.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {doc.notes}
                  </p>
                )}
                <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-2">
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span>Added {doc.uploadDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Document: ${doc.name}\nCategory: ${doc.category}\nNotes: ${doc.notes || 'N/A'}`)}`}
                  download={`${doc.name.replace(/\s+/g, '_')}.txt`}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Metadata
                </a>

                <button
                  onClick={() => setDocumentToDelete(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Catalog Document to Vault
            </h2>
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., TCS Digital Offer Letter 2026"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as CareerVaultDocument['category'])}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Resume">Resume</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Project Evidence">Project Evidence</option>
                  <option value="Transcript">Transcript</option>
                  <option value="Cover Letter">Cover Letter</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes / Verification Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Verified by Campus Placement Cell, Batch 2026"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Document Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Consequential Action) */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                "{documentToDelete.name}"
              </span>{' '}
              from your Career Document Vault? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDocumentToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Keep File
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Yes, Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
