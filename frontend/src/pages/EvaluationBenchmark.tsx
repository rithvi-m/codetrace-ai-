import React, { useState, useEffect } from 'react';
import { fetchEvaluationMetrics } from '../services/api';
import { EvaluationData } from '../types';
import { BarChart2, CheckCircle2, XCircle, ShieldCheck, Zap, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const EvaluationBenchmark: React.FC = () => {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEval();
  }, []);

  const loadEval = async () => {
    try {
      setLoading(true);
      const res = await fetchEvaluationMetrics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Computing Programmatic Evaluation Benchmark Suite...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-slate-500 text-xs">Failed to load evaluation metrics.</div>;
  }

  const ct = data.codetrace_ai.metrics;
  const naive = data.naive_text_matching.metrics;

  const chartData = [
    { metric: 'Accuracy', CodeTrace_AI: ct.accuracy, Naive_Text: naive.accuracy },
    { metric: 'Precision', CodeTrace_AI: ct.precision, Naive_Text: naive.precision },
    { metric: 'Recall', CodeTrace_AI: ct.recall, Naive_Text: naive.recall },
    { metric: 'F1 Score', CodeTrace_AI: ct.f1_score, Naive_Text: naive.f1_score },
    { metric: 'Detection Rate', CodeTrace_AI: ct.detection_rate, Naive_Text: naive.detection_rate },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold text-white">CodeTrace AI vs Naive Text Benchmark Suite</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Evaluated programmatically over bundled synthetic benchmark dataset (N=6 canonical plagiarism & original cases).
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right font-mono text-xs">
          <div className="text-slate-400">Evaluated Timestamp:</div>
          <div className="text-sky-300 font-bold">{new Date(data.timestamp).toLocaleString()}</div>
        </div>
      </div>

      {/* Side-by-Side Metric Winner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CodeTrace AI Performance */}
        <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 border border-indigo-700/60 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-800/50 pb-3">
            <div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PROPOSED MULTI-SIGNAL ENGINE
              </span>
              <h3 className="text-lg font-bold text-white mt-1">CodeTrace AI Engine</h3>
            </div>
            <ShieldCheck className="w-6 h-6 text-sky-400" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">F1 Score</div>
              <div className="text-xl font-extrabold text-sky-400 font-mono">{ct.f1_score}%</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Accuracy</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{ct.accuracy}%</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Precision</div>
              <div className="text-xl font-extrabold text-indigo-400 font-mono">{ct.precision}%</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <strong>Key Strength:</strong> Resilient against variable renaming, comment manipulations, and statement reordering due to AST structural normalization and TF-IDF vector space modeling.
          </div>
        </div>

        {/* Naive Text Matching Performance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                TRADITIONAL BASELINE
              </span>
              <h3 className="text-lg font-bold text-slate-300 mt-1">Naive Text Matching</h3>
            </div>
            <XCircle className="w-6 h-6 text-slate-500" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
              <div className="text-[10px] text-slate-400">F1 Score</div>
              <div className="text-xl font-extrabold text-slate-400 font-mono">{naive.f1_score}%</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
              <div className="text-[10px] text-slate-400">Accuracy</div>
              <div className="text-xl font-extrabold text-slate-400 font-mono">{naive.accuracy}%</div>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850">
              <div className="text-[10px] text-slate-400">Precision</div>
              <div className="text-xl font-extrabold text-slate-400 font-mono">{naive.precision}%</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <strong>Key Vulnerability:</strong> Fails completely when students rename variables (`x = a + b` vs `total = cost + vat`) or change whitespace/comments.
          </div>
        </div>
      </div>

      {/* Benchmark Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Comparative Performance Chart</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="metric" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              <Bar dataKey="CodeTrace_AI" fill="#0EA5E9" radius={[6, 6, 0, 0]} name="CodeTrace AI (Multi-Signal)" />
              <Bar dataKey="Naive_Text" fill="#475569" radius={[6, 6, 0, 0]} name="Naive Text Matching" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
