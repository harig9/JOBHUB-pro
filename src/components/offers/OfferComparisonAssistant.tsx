import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Scale,
  TrendingUp,
  Building,
  CheckCircle2,
  Sparkles,
  Plus,
  ArrowRight,
  Calculator,
  ShieldAlert,
} from 'lucide-react';
import { OfferComparisonItem } from '../../types/index.js';
import { api } from '../../services/api.js';
import { useToast } from '../Toast.js';

export function OfferComparisonAssistant() {
  const { showToast } = useToast();
  const [offers, setOffers] = useState<OfferComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [workMode, setWorkMode] = useState<OfferComparisonItem['workMode']>('Hybrid');
  const [fixedLpa, setFixedLpa] = useState<number>(7.5);
  const [variableLpa, setVariableLpa] = useState<number>(1.0);
  const [joiningBonus, setJoiningBonus] = useState<number>(50000);
  const [benefitsStr, setBenefitsStr] = useState('Health Insurance ₹5L, Free Food, Learning Allowance');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await api.getJobOffers();
      setOffers(data);
    } catch {
      showToast('Failed to load offer comparisons', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Indian Salary In-Hand Estimation formula:
  // Fixed LPA / 12 months - standard PF (approx ₹1800/mo) - basic TDS estimate
  const calculateInHandEstimate = (fixed: number) => {
    const monthlyGross = (fixed * 100000) / 12;
    const estPfAndTax = monthlyGross > 50000 ? Math.round(monthlyGross * 0.12) : 2500;
    const netTakeHome = Math.round(monthlyGross - estPfAndTax);
    return { monthlyGross: Math.round(monthlyGross), estPfAndTax, netTakeHome };
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      showToast('Company and role are required', 'error');
      return;
    }

    try {
      const calc = calculateInHandEstimate(fixedLpa);
      const saved = await api.saveJobOffer({
        companyName: company,
        roleTitle: role,
        location,
        workMode,
        fixedCtcLpa: fixedLpa,
        variableCtcLpa: variableLpa,
        joiningBonusInr: joiningBonus,
        deductionsEstInrMonthly: calc.estPfAndTax,
        netMonthlyTakeHomeEstInr: calc.netTakeHome,
        benefits: benefitsStr.split(',').map((b) => b.trim()).filter(Boolean),
        growthScore: 8,
        cultureScore: 8,
        decisionStatus: 'considering',
        notes,
      });

      setOffers((prev) => [saved, ...prev]);
      showToast('Offer saved to decision matrix', 'success');
      setIsModalOpen(false);
      setCompany('');
      setRole('');
      setNotes('');
    } catch {
      showToast('Failed to save offer', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            Indian CTC & Offer Evaluation Suite
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Offer Decision Assistant & In-Hand Calculator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Break down fixed CTC vs. variable pay, provident fund deductions, joining bonuses, and realistic net monthly take-home salary.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Job Offer
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Evaluating offer matrix...
          </div>
        ) : offers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            No job offers cataloged yet. Add your campus placement or off-campus offer letters to calculate real in-hand pay.
          </div>
        ) : (
          offers.map((offer) => {
            const totalCtc = offer.fixedCtcLpa + offer.variableCtcLpa;
            const fixedRatio = Math.round((offer.fixedCtcLpa / totalCtc) * 100);

            return (
              <div
                key={offer.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  {/* Top status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {offer.location} • {offer.workMode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {offer.companyName}
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        {offer.roleTitle}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        offer.decisionStatus === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : offer.decisionStatus === 'considering'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {offer.decisionStatus}
                    </span>
                  </div>

                  {/* CTC Breakdown Box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Total CTC:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        ₹{totalCtc.toFixed(1)} LPA
                      </span>
                    </div>

                    {/* Progress Bar of Fixed vs Variable */}
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Fixed: ₹{offer.fixedCtcLpa} LPA ({fixedRatio}%)</span>
                        <span>Var: ₹{offer.variableCtcLpa} LPA</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${fixedRatio}%` }}
                        />
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${100 - fixedRatio}%` }}
                        />
                      </div>
                    </div>

                    {offer.joiningBonusInr > 0 && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700">
                        <span className="text-slate-500">1st Year Joining Bonus:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +₹{offer.joiningBonusInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estimated In-Hand Take Home Highlight */}
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                        <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Est. Net In-Hand:
                      </div>
                      <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                        ₹{offer.netMonthlyTakeHomeEstInr.toLocaleString('en-IN')}
                        <span className="text-xs font-normal">/mo</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                      Post ~₹{offer.deductionsEstInrMonthly.toLocaleString('en-IN')} est. monthly PF & standard tax deductions.
                    </p>
                  </div>

                  {/* Benefits */}
                  <div className="mt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Perks & Benefits:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {offer.benefits.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {offer.notes && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                    "{offer.notes}"
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Job Offer for CTC Comparison
            </h2>
            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Infosys / Flipkart"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Systems Engineer / SDE-1"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as OfferComparisonItem['workMode'])}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Fixed CTC (LPA) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fixedLpa}
                    onChange={(e) => setFixedLpa(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Variable Pay (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={variableLpa}
                    onChange={(e) => setVariableLpa(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Joining Bonus (₹)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={joiningBonus}
                    onChange={(e) => setJoiningBonus(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Perks & Benefits (comma separated)
                </label>
                <input
                  type="text"
                  value={benefitsStr}
                  onChange={(e) => setBenefitsStr(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes / Review Criteria
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Notice period terms, bond requirements, tech stack..."
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
                  Save Offer Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
