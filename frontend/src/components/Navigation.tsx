import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Upload,
  Grid,
  Share2,
  FileCode,
  CheckSquare,
  BarChart2,
  Database,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemoSeed: () => void;
  isSeeding: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onRunDemoSeed,
  isSeeding
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis Cases', icon: FileCode },
    { id: 'matrix', label: 'Similarity Matrix', icon: Grid },
    { id: 'graph', label: 'Network Graph', icon: Share2 },
    { id: 'reviews', label: 'Review Workflow', icon: CheckSquare },
    { id: 'upload', label: 'Upload Code', icon: Upload },
    { id: 'evaluation', label: 'Benchmark & Evaluation', icon: BarChart2 },
    { id: 'dataset', label: 'Test Dataset', icon: Database },
    { id: 'settings', label: 'Admin Settings', icon: Sliders },
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 px-6 py-2 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>
            <strong className="text-white">Responsible AI Guardrail:</strong> CodeTrace AI identifies similarity patterns for human tutor review. It does not auto-penalize students.
          </span>
        </div>
        <div className="flex items-center space-x-4 font-mono text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Offline Deterministic Parser Ready
          </span>
          <span className="text-slate-400">RAMPeX Hackathon PS05</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
                CODETRACE AI
              </span>
              <span className="bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                v1.0 Demo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Beyond Matching. Understand the Code.</p>
          </div>
        </div>

        {/* Demo Mode Button */}
        <button
          onClick={onRunDemoSeed}
          disabled={isSeeding}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-sky-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Seeding Demo Scenario...' : 'Hackathon Demo Mode'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 flex items-center space-x-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-sky-400 text-sky-400 bg-sky-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
