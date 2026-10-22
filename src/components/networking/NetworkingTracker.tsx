import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Send,
  Linkedin,
  Mail,
  Copy,
  Check,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { NetworkingContact } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function NetworkingTracker() {
  const { showToast } = useToast();
  const [contacts, setContacts] = useState<NetworkingContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [relationship, setRelationship] = useState<NetworkingContact['relationship']>('Alumni');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [referralStatus, setReferralStatus] = useState<NetworkingContact['referralStatus']>('not-contacted');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getNetworkingContacts();
      setContacts(data);
    } catch {
      showToast('Failed to load networking contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOutreach = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Outreach message copied!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) {
      showToast('Contact name and company are required', 'error');
      return;
    }

    try {
      const generatedMsg = `Hi ${name},\nI hope you're having a great week! I noticed you are working as a ${role} at ${company}. As a fellow ${relationship.toLowerCase()} aspiring to join ${company}'s engineering team, I've built projects in React and Node.js and would love to ask 2 quick questions about your journey if you have 5 minutes. Best regards!`;

      const saved = await api.saveNetworkingContact({
        name,
        company,
        role,
        relationship,
        linkedinUrl: linkedinUrl || undefined,
        referralStatus,
        notes,
        aiDraftedOutreach: generatedMsg,
        nextFollowUpDue: 'In 5 days',
      });

      setContacts((prev) => [saved, ...prev]);
      showToast('Contact added to networking pipeline', 'success');
      setIsModalOpen(false);
      setName('');
      setCompany('');
      setRole('');
      setNotes('');
      setLinkedinUrl('');
    } catch {
      showToast('Failed to save contact', 'error');
    }
  };

  const filteredContacts = contacts.filter(
    (c) => statusFilter === 'all' || c.referralStatus === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            Alumni & Recruiter Referral Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Networking Tracker & Referral Pipeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage conversations with campus alumni and tech recruiters with personalized, non-spammy outreach templates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Connection Record
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Referral Status:
        </span>
        {['all', 'not-contacted', 'reached-out', 'referral-submitted', 'referred', 'closed'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.replace('-', ' ')}
            </button>
          )
        )}
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading networking pipeline...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No contacts found in this status category.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {contact.relationship}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {contact.role} at <span className="font-semibold text-slate-700 dark:text-slate-200">{contact.company}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      contact.referralStatus === 'referred'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : contact.referralStatus === 'reached-out'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {contact.referralStatus.replace('-', ' ')}
                  </span>
                </div>

                {contact.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {contact.notes}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                  {contact.lastFollowUp && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Last: {contact.lastFollowUp}
                    </span>
                  )}
                  {contact.nextFollowUpDue && (
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      Next Follow-up: {contact.nextFollowUpDue}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Drafted Outreach */}
              {contact.aiDraftedOutreach && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                      Suggested Cold Outreach Message:
                    </span>
                    <button
                      onClick={() => handleCopyOutreach(contact.id, contact.aiDraftedOutreach!)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedId === contact.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {contact.aiDraftedOutreach}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Connection Record
            </h2>
            <form onSubmit={handleSaveContact} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Rohit Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Company *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Microsoft IDC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SDE-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as NetworkingContact['relationship'])}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Alumni">College Alumni</option>
                    <option value="Campus Senior">Campus Senior</option>
                    <option value="Senior Engineer">Senior Engineer</option>
                    <option value="Recruiter">Technical Recruiter</option>
                    <option value="Peer">Peer / Batchmate</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={referralStatus}
                    onChange={(e) => setReferralStatus(e.target.value as NetworkingContact['referralStatus'])}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="not-contacted">Not Contacted</option>
                    <option value="reached-out">Reached Out</option>
                    <option value="referral-submitted">Referral Submitted</option>
                    <option value="referred">Referred</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Graduated 2024 from my college CSE department"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
