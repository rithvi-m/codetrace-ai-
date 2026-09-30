import React, { useState } from 'react';
import { uploadSubmission } from '../services/api';
import { Upload, FileCode, CheckCircle, AlertCircle, Sparkles, ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface UploadSubmissionProps {
  onSuccess: () => void;
}

export const UploadSubmission: React.FC<UploadSubmissionProps> = ({ onSuccess }) => {
  const [studentName, setStudentName] = useState('');
  const [studentIdStr, setStudentIdStr] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('CS101 — Homework 3: Algorithm Optimization');
  const [language, setLanguage] = useState('python');
  const [fileName, setFileName] = useState('solution.py');
  const [rawCode, setRawCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0 to 5
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentIdStr || !rawCode) {
      setMessage({ type: 'error', text: 'Please fill out all required fields and enter student source code.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setAnalysisStep(1);

    // Animated progress simulation
    const stepsTimer = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < 4) return prev + 1;
        clearInterval(stepsTimer);
        return 4;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append('student_name', studentName);
      formData.append('student_id_str', studentIdStr);
      formData.append('assignment_title', assignmentTitle);
      formData.append('language', language);
      formData.append('file_name', fileName);
      formData.append('code', rawCode);

      await uploadSubmission(formData);
      setAnalysisStep(5);
      setMessage({ type: 'success', text: 'Analysis Complete! 1 new submission processed and analyzed.' });

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      clearInterval(stepsTimer);
      setIsSubmitting(false);
      setAnalysisStep(0);
      setMessage({ type: 'error', text: err.message || 'Failed to submit code' });
    }
  };

  const loadSampleCode = () => {
    setStudentName('Maya Lin');
    setStudentIdStr('STU-2099');
    setFileName('solution_maya.py');
    setRawCode(`def two_sum(nums, target):
    # Maya's solution with custom variable names
    lookup_table = {}
    for index, current_value in enumerate(nums):
        needed = target - current_value
        if needed in lookup_table:
            return [lookup_table[needed], index]
        lookup_table[current_value] = index
    return []
`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Analyze Submissions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step submission upload and automated multi-signal analysis pipeline.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleCode}
          className="bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Load Sample Submission</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
              : 'bg-red-950/60 border-red-700/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 4-Step Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        {/* Step 1: Select Assignment */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-semibold text-white">Select Assignment</h3>
          </div>
          <input
            type="text"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Step 2: Student Metadata */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-semibold text-white">Student Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Student Name *</label>
              <input
                type="text"
                placeholder="e.g. Maya Lin"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Student ID *</label>
              <input
                type="text"
                placeholder="e.g. STU-2099"
                value={studentIdStr}
                onChange={(e) => setStudentIdStr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 3: Select Language & Upload/Paste */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-semibold text-white">Language & Source Code</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="python">Python (.py)</option>
                <option value="javascript">JavaScript (.js)</option>
                <option value="java">Java (.java)</option>
                <option value="cpp">C++ (.cpp)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[11px] text-slate-400 mb-1">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <textarea
            rows={10}
            placeholder="Paste code or drop file contents here..."
            value={rawCode}
            onChange={(e) => setRawCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
            required
          />
        </div>

        {/* Level 2 Technical Toggle (Section 26 requirement) */}
        <div className="border-t border-slate-850 pt-4">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5"
          >
            <span>{showTechnicalDetails ? 'Hide Technical Details' : 'View Technical Details'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[11px] text-slate-400 space-y-1">
              <div>AST Transformer Mode: Python AST NodeTransformer (Active)</div>
              <div>Semantic Model: Local TF-IDF Vectorizer (Character 3-5 n-grams)</div>
              <div>Token Engine: Jaccard + difflib SequenceMatcher</div>
            </div>
          )}
        </div>

        {/* Step 4: Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isSubmitting ? 'Analyzing Submissions...' : 'Analyze Submissions'}</span>
          </button>
        </div>
      </form>

      {/* Human-Readable Progress Modal Overlay (Section 20 requirement) */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <Activity className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-white">Analyzing Submissions...</h3>
              <p className="text-xs text-slate-400">Processing code through multi-signal engine</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {[
                { step: 1, label: '1/5 Normalizing code (comments & variable noise)' },
                { step: 2, label: '2/5 Extracting AST structural patterns' },
                { step: 3, label: '3/5 Comparing pairwise submissions' },
                { step: 4, label: '4/5 Generating explainable evidence' },
                { step: 5, label: '5/5 Complete!' },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all ${
                    analysisStep > item.step
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : analysisStep === item.step
                      ? 'bg-sky-950/60 border-sky-600 text-sky-300 font-bold animate-pulse'
                      : 'bg-slate-950/40 border-slate-850 text-slate-600'
                  }`}
                >
                  {analysisStep > item.step ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : analysisStep === item.step ? (
                    <Activity className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
