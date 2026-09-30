import React, { useState, useEffect } from 'react';
import { fetchComparison, updateReviewCase } from '../services/api';
import { CodeComparisonPayload } from '../types';
import {
  ArrowLeft,
  ShieldAlert,
  Code,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  History,
  Layers,
  Sparkles
} from 'lucide-react';

interface CodeComparisonProps {
  pairId: number;
  onBack: () => void;
}

export const CodeComparison: React.FC<CodeComparisonProps> = ({ pairId, onBack }) => {
  const [data, setData] = useState<CodeComparisonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'evidence' | 'history'>('overview');
  const [viewCodeMode, setViewCodeMode] = useState<'original' | 'normalized'>('original');
  const [highlightLine, setHighlightLine] = useState<number | null>(null);

  const [tutorNotes, setTutorNotes] = useState('');
  const [status, setStatus] = useState('New');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [pairId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchComparison(pairId);
      setData(res);
      setTutorNotes(res.tutor_notes || '');
      setStatus(res.status || 'New');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (newStatus: string) => {
    try {
      setIsSaving(true);
      setStatus(newStatus);
      await updateReviewCase(pairId, newStatus, tutorNotes || `Status marked as ${newStatus}`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading Code Comparison & Evidence...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-slate-500 text-xs">Failed to load comparison data.</div>;
  }

  const { student_a, student_b, scores, evidence, overall_score, risk_level } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white">
                {student_a.name} vs {student_b.name}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                  risk_level === 'Manual Review Recommended'
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : risk_level === 'High Similarity'
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}
              >
                {risk_level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              CS101 Algorithm Homework | Pair ID: #{pairId}
            </p>
          </div>
        </div>

        {/* Score Display (Section 11 requirement) */}
        <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Similarity</div>
            <div className="text-2xl font-extrabold text-white font-mono">{overall_score}%</div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs (Section 13 requirement) */}
      <div className="flex space-x-1 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'comparison', label: 'Code Comparison' },
          { id: 'evidence', label: 'Explainable Evidence' },
          { id: 'history', label: 'Submission History' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-sky-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level 1 Plain Language Explanation (Section 12 requirement) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>Why are these submissions similar?</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  setActiveTab('comparison');
                  setHighlightLine(3);
                }}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-sky-500/50 transition-colors space-y-1"
              >
                <div className="text-xs font-bold text-sky-400">1. Code Structure (High Overlap — {scores.structural}%)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Both submissions use an equivalent loop → condition → accumulator structure.
                </p>
                <span className="text-[10px] text-sky-500 font-medium">Click to highlight lines in editor →</span>
              </div>

              <div
                onClick={() => {
                  setActiveTab('comparison');
                  setHighlightLine(4);
                }}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-purple-500/50 transition-colors space-y-1"
              >
                <div className="text-xs font-bold text-purple-400">2. Code Meaning (High Overlap — {scores.semantic}%)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Variable names differ, but the operations are performed in a similar sequence.
                </p>
                <span className="text-[10px] text-purple-500 font-medium">Click to highlight lines in editor →</span>
              </div>

              <div
                onClick={() => {
                  setActiveTab('comparison');
                  setHighlightLine(2);
                }}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/50 transition-colors space-y-1"
              >
                <div className="text-xs font-bold text-amber-400">3. Token Patterns ({scores.token}%)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  After normalizing identifiers and formatting, many token sequences remain similar.
                </p>
                <span className="text-[10px] text-amber-500 font-medium">Click to highlight lines in editor →</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-emerald-400">4. Submission Pattern ({scores.behavioral}%)</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Both submissions were uploaded within a short temporal interval.
                </p>
              </div>
            </div>

            {/* Level 2 Technical Drawer (Section 26 requirement) */}
            <div className="border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5"
              >
                <span>{showTechnicalDetails ? 'Hide Technical Calculation Details' : 'How was this calculated?'}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTechnicalDetails && (
                <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[11px] text-slate-400 space-y-1">
                  <div>Weighted Formula: 20% Token + 30% AST + 30% Semantic + 15% Logic + 5% Behavioral</div>
                  <div>AST Nodes: FunctionDef(1), For(1), If(1), Assign(3)</div>
                  <div>Semantic Cosine: Character 3-5 gram TF-IDF Cosine Distance</div>
                </div>
              )}
            </div>
          </div>

          {/* Tutor Decision Buttons (Section 17 requirement) */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Tutor Decision</h3>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDecision('Under Review')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition-all"
              >
                Under Review
              </button>
              <button
                onClick={() => handleDecision('Reviewed (Dismissed)')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs px-4 py-2.5 rounded-lg transition-all"
              >
                Dismiss (Shared Starter Code)
              </button>
              <button
                onClick={() => handleDecision('Confirmed Action')}
                className="bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition-all"
              >
                Escalate for Further Review
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tutor Review Notes</label>
              <textarea
                rows={2}
                placeholder="Record review notes..."
                value={tutorNotes}
                onChange={(e) => setTutorNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {saveSuccess && (
              <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Decision saved to database!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: CODE COMPARISON (Section 14 requirement) */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">View Mode:</span>
            <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                onClick={() => setViewCodeMode('original')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  viewCodeMode === 'original' ? 'bg-sky-600 text-white' : 'text-slate-400'
                }`}
              >
                Original Code
              </button>
              <button
                onClick={() => setViewCodeMode('normalized')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  viewCodeMode === 'normalized' ? 'bg-sky-600 text-white' : 'text-slate-400'
                }`}
              >
                Normalized AST Code
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student A */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-xs text-white">{student_a.name} ({student_a.student_id})</span>
                <span className="text-[10px] text-slate-400 font-mono">Attempt #{student_a.attempt}</span>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto min-h-[360px] leading-relaxed">
                {viewCodeMode === 'original' ? student_a.raw_code : student_a.normalized_code}
              </pre>
            </div>

            {/* Student B */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-xs text-white">{student_b.name} ({student_b.student_id})</span>
                <span className="text-[10px] text-slate-400 font-mono">Attempt #{student_b.attempt}</span>
              </div>
              <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto min-h-[360px] leading-relaxed">
                {viewCodeMode === 'original' ? student_b.raw_code : student_b.normalized_code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: EXPLAINABLE EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Full Evidence Log</h3>
          <div className="space-y-3">
            {evidence.map((card, i) => (
              <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-sky-400">{card.title}</div>
                <p className="text-slate-300">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: SUBMISSION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Submission Timeline</h3>
          <div className="space-y-2 font-mono text-slate-300">
            <div>• {student_a.name} submitted Attempt #{student_a.attempt} at {new Date(student_a.submitted_at).toLocaleTimeString()}</div>
            <div>• {student_b.name} submitted Attempt #{student_b.attempt} at {new Date(student_b.submitted_at).toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};
