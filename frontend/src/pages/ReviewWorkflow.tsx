import React, { useState, useEffect } from 'react';
import { fetchReviewCases, updateReviewCase } from '../services/api';
import { ReviewCase } from '../types';
import { CheckSquare, ArrowUpRight, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface ReviewWorkflowProps {
  onOpenComparison: (pairId: number) => void;
}

export const ReviewWorkflow: React.FC<ReviewWorkflowProps> = ({ onOpenComparison }) => {
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');

  useEffect(() => {
    loadCases();
  }, [activeStatus]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewCases(activeStatus === 'All' ? undefined : activeStatus);
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (caseId: number, newStatus: string) => {
    try {
      await updateReviewCase(caseId, newStatus, 'Status updated via workflow manager');
      loadCases();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Tutor Review & Governance Cases</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop review workflow. Manage flagged cases and record tutor notes.
          </p>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {['All', 'New', 'Under Review', 'Reviewed', 'Confirmed'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeStatus === st ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading review cases...</div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No review cases in state "{activeStatus}". Seed demo data or select another filter tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student Pair</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4 text-center">Similarity</th>
                  <th className="py-3 px-4">Reviewer Decision</th>
                  <th className="py-3 px-4">Tutor Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {c.student_a} ↔ {c.student_b}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate">{c.assignment}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-sky-400">
                      {c.overall_score}%
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Reviewed">Reviewed (Dismissed)</option>
                        <option value="Confirmed">Confirmed Action</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-[240px] truncate italic">
                      {c.tutor_notes || 'No tutor notes recorded yet.'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenComparison(c.id)}
                        className="bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Compare</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
