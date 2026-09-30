import React, { useState, useEffect } from 'react';
import { fetchBenchmarkDataset } from '../services/api';
import { Database, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

export const DatasetViewer: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCase, setActiveCase] = useState<string>('case_1');

  useEffect(() => {
    loadDataset();
  }, []);

  const loadDataset = async () => {
    try {
      setLoading(true);
      const res = await fetchBenchmarkDataset();
      setCases(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading Synthetic Benchmark Dataset...</div>;
  }

  const selected = cases.find((c) => c.id === activeCase) || cases[0];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-bold text-white">Bundled Benchmark Dataset</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            6 canonical synthetic student submission test cases representing real-world submission variations.
          </p>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {cases.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCase(c.id)}
            className={`p-3 rounded-xl border text-left text-xs transition-all ${
              activeCase === c.id
                ? 'bg-sky-950/80 border-sky-500/80 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-[11px] truncate">{c.title.split('—')[0]}</div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">{c.expected_risk}</div>
          </button>
        ))}
      </div>

      {/* Active Case Details */}
      {selected && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{selected.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{selected.description}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                selected.expected_flag
                  ? 'bg-purple-950 text-purple-300 border-purple-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}
            >
              Expected Classification: {selected.expected_risk}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900 px-4 py-2 text-xs font-semibold text-sky-300 border-b border-slate-800">
                Student A ({selected.student_a.name}) — ID: {selected.student_a.student_id}
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                {selected.student_a.code}
              </pre>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-900 px-4 py-2 text-xs font-semibold text-indigo-300 border-b border-slate-800">
                Student B ({selected.student_b.name}) — ID: {selected.student_b.student_id}
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                {selected.student_b.code}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
