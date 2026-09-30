import React, { useState, useEffect } from 'react';
import { fetchReviewCases } from '../services/api';
import { ReviewCase } from '../types';
import { Search, Filter, ArrowUpRight, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface AnalysisResultsProps {
  onOpenComparison: (pairId: number) => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ onOpenComparison }) => {
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await fetchReviewCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.student_a.toLowerCase().includes(search.toLowerCase()) ||
      c.student_b.toLowerCase().includes(search.toLowerCase()) ||
      c.assignment.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'All' || c.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-white">Analyzed Submission Pairs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-signal explainable risk results across all pairwise student comparisons.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or assignment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 w-56"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['All', 'Manual Review Recommended', 'High Similarity', 'Moderate Similarity', 'Low Similarity'].map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                  riskFilter === f
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'Manual Review Recommended' ? 'Review Needed' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading similarity cases...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No matching submission pairs found. Try changing filters or clicking "Hackathon Demo Mode".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student A vs Student B</th>
                  <th className="py-3 px-4">Assignment</th>
                  <th className="py-3 px-4">Risk Category</th>
                  <th className="py-3 px-4">Workflow Status</th>
                  <th className="py-3 px-4 text-right">Similarity Score</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.student_a} ↔ {item.student_b}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Pair ID: #{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[200px] truncate">
                      {item.assignment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.risk_level === 'Manual Review Recommended'
                            ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                            : item.risk_level === 'High Similarity'
                            ? 'bg-red-950/80 text-red-300 border-red-700/60'
                            : item.risk_level === 'Moderate Similarity'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        }`}
                      >
                        {item.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-300 flex items-center space-x-1">
                        {item.status === 'Reviewed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-white">
                      {item.overall_score}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenComparison(item.id)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all flex items-center space-x-1 mx-auto shadow-md"
                      >
                        <span>Compare Code</span>
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
