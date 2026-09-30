import React, { useState, useEffect } from 'react';
import { fetchSimilarityMatrix } from '../services/api';
import { SimilarityMatrixData } from '../types';
import { Grid, ExternalLink } from 'lucide-react';

interface SimilarityMatrixProps {
  onOpenComparison: (pairId: number) => void;
}

export const SimilarityMatrix: React.FC<SimilarityMatrixProps> = ({ onOpenComparison }) => {
  const [data, setData] = useState<SimilarityMatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const res = await fetchSimilarityMatrix();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCellColor = (score: number) => {
    if (score >= 80) return 'bg-purple-600 hover:bg-purple-500 text-white font-bold border-purple-400';
    if (score >= 60) return 'bg-red-600 hover:bg-red-500 text-white font-bold border-red-400';
    if (score >= 30) return 'bg-amber-600/80 hover:bg-amber-500 text-white font-semibold border-amber-400';
    return 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border-emerald-900/50';
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Generating Cross-Student Similarity Matrix...</div>;
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        No matrix data available. Click "Hackathon Demo Mode" in the navigation bar to populate students.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Grid className="w-5 h-5 text-sky-400" />
            <h1 className="text-xl font-bold text-white">Cross-Student Similarity Matrix</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pairwise heatmap grid of all student submissions. Click any cell to inspect explainable code comparison.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-emerald-950 border border-emerald-700"></span>
            <span className="text-slate-400">0-29%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-amber-600"></span>
            <span className="text-slate-400">30-59%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-red-600"></span>
            <span className="text-slate-400">60-79%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-purple-600"></span>
            <span className="text-slate-400">80-100%</span>
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs font-mono text-slate-400 border-b border-r border-slate-800 min-w-[120px]">
                Student
              </th>
              {data.students.map((s) => (
                <th key={s.id} className="p-2 text-xs font-semibold text-slate-300 border-b border-slate-800 min-w-[80px]">
                  <div className="truncate max-w-[90px]" title={s.name}>{s.name.split(' ')[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students.map((rowStudent) => (
              <tr key={rowStudent.id} className="hover:bg-slate-850/30">
                <td className="p-2 text-left text-xs font-semibold text-white border-r border-slate-800 truncate max-w-[120px]" title={rowStudent.name}>
                  {rowStudent.name}
                </td>
                {data.students.map((colStudent) => {
                  if (rowStudent.id === colStudent.id) {
                    return (
                      <td key={colStudent.id} className="p-2 bg-slate-950/60 border border-slate-850 text-slate-600 text-xs font-mono">
                        —
                      </td>
                    );
                  }

                  const key = `${rowStudent.id}_${colStudent.id}`;
                  const cell = data.matrix[key];

                  if (!cell) {
                    return (
                      <td key={colStudent.id} className="p-2 bg-slate-950 border border-slate-850 text-slate-600 text-xs">
                        N/A
                      </td>
                    );
                  }

                  return (
                    <td key={colStudent.id} className="p-1">
                      <button
                        onClick={() => onOpenComparison(cell.pair_id)}
                        className={`w-full h-10 rounded-lg text-xs font-mono border flex items-center justify-center transition-transform hover:scale-105 ${getCellColor(
                          cell.score
                        )}`}
                        title={`${rowStudent.name} vs ${colStudent.name}: ${cell.score}% (${cell.risk_level})`}
                      >
                        {cell.score}%
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
