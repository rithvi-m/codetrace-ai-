import React from 'react';
import { DashboardData } from '../types';
import {
  Users,
  FileCheck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  data: DashboardData | null;
  onOpenComparison: (pairId: number) => void;
  onNavigate: (tab: string) => void;
  onRunDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onOpenComparison,
  onNavigate,
  onRunDemo
}) => {
  if (!data) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-sky-400" />
        <p>Loading CodeTrace AI Intelligence Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Good Morning Greeting Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0E1628] to-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Good morning, Dr. Vance</h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Code Integrity Overview</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All similarity analysis systems running normally
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('upload')}
            className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-lg transition-all flex items-center space-x-2"
          >
            <span>Analyze New Submissions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Minimal KPI Cards (Section 7 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Submissions</div>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">{data.total_submissions}</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Need Review</div>
            <div className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">{data.pending_reviews}</div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Students</div>
            <div className="text-3xl font-extrabold text-white mt-1 font-mono">{data.students_analyzed}</div>
          </div>
          <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-medium">Avg. Confidence</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{data.average_similarity_score}%</div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Requires Attention Priority Table (Section 7 requirement) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Requires Attention</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submissions flagged with high structural or semantic similarity deserving manual tutor investigation.
            </p>
          </div>
          <button
            onClick={() => onNavigate('analysis')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
          >
            <span>View All ({data.submission_pairs_analyzed} pairs)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student Pair</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4 text-center">Similarity</th>
                <th className="py-3 px-4">Plain-Language Reason</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.top_suspicious_pairs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No submissions flagged. Click "Hackathon Demo Mode" to load synthetic test cases.
                  </td>
                </tr>
              ) : (
                data.top_suspicious_pairs.map((pair) => (
                  <tr key={pair.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {pair.student_a} ↔ {pair.student_b}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[180px] truncate">{pair.assignment}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                          pair.overall_score >= 80
                            ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                            : pair.overall_score >= 60
                            ? 'bg-red-950/80 text-red-300 border-red-700/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                        }`}
                      >
                        {pair.overall_score}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-[280px]">
                      {pair.overall_score >= 80
                        ? 'Strong structural + semantic overlap despite identifier renaming'
                        : pair.overall_score >= 60
                        ? 'Identical control flow and token sequence matching'
                        : 'Moderate algorithmic similarity'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenComparison(pair.id)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-all inline-flex items-center space-x-1 shadow-md"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsible AI Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-indigo-400 shrink-0" />
        <div>
          <strong className="text-white">Human Review Principle:</strong> High similarity scores indicate code patterns deserving manual review. They do not constitute an automatic determination of misconduct.
        </div>
      </div>
    </div>
  );
};
