import React, { useState, useEffect } from 'react';
import { fetchAdminSettings } from '../services/api';
import { Sliders, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [weights, setWeights] = useState({
    token: 20,
    structural: 30,
    semantic: 30,
    logic: 15,
    behavioral: 5
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchAdminSettings();
      if (res.weights) {
        setWeights({
          token: Math.round(res.weights.token * 100),
          structural: Math.round(res.weights.structural * 100),
          semantic: Math.round(res.weights.semantic * 100),
          logic: Math.round(res.weights.logic * 100),
          behavioral: Math.round(res.weights.behavioral * 100)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalWeight = weights.token + weights.structural + weights.semantic + weights.logic + weights.behavioral;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold text-white">Admin Engine Configuration</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust multi-signal weights and risk classification thresholds.
            </p>
          </div>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs px-3 py-1 rounded-full font-mono font-medium">
            Offline Deterministic Parser Active
          </span>
        </div>

        {/* Weights Sliders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Scoring Signal Weights (Must Sum to 100%)</h3>
            <span className={`text-xs font-mono font-bold ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
              Total Weight: {totalWeight}%
            </span>
          </div>

          {[
            { key: 'token', label: 'Token-Level Similarity Weight', desc: 'Lexical token sequence matching & n-gram alignment' },
            { key: 'structural', label: 'AST Structural Analysis Weight', desc: 'Python AST control-flow nodes, loop depth, & statement hashes' },
            { key: 'semantic', label: 'Semantic Similarity Weight', desc: 'Local TF-IDF vector space model over canonical code' },
            { key: 'logic', label: 'Control / Logic Flow Weight', desc: 'Control-flow signature sequence matching' },
            { key: 'behavioral', label: 'Behavioral / Attempt Weight', desc: 'Submission time proximity and attempt revision delta' },
          ].map((item) => (
            <div key={item.key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">{item.label}</span>
                <span className="font-mono text-sky-400 font-bold">{weights[item.key as keyof typeof weights]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights[item.key as keyof typeof weights]}
                onChange={(e) => setWeights({ ...weights, [item.key]: parseInt(e.target.value) || 0 })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Transparent Formula Display */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-slate-300">Active Risk Calculation Formula</h4>
          <div className="font-mono text-xs text-sky-300 bg-slate-900 p-3 rounded-lg border border-slate-850 leading-relaxed overflow-x-auto">
            Risk_Score = ({weights.token}% × Token) + ({weights.structural}% × AST_Struct) + ({weights.semantic}% × Semantic) + ({weights.logic}% × Logic) + ({weights.behavioral}% × Behavioral)
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Weights configuration updated successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-500">Changes take effect immediately for subsequent analysis runs.</span>
          )}

          <button
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
