import React from 'react';
import {
  LayoutDashboard,
  FileCode,
  Grid,
  Share2,
  CheckSquare,
  Upload,
  BarChart2,
  Database,
  Sliders,
  Sparkles,
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemoSeed: () => void;
  isSeeding: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onRunDemoSeed,
  isSeeding
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'submissions', label: 'Submissions', icon: FileCode },
    { id: 'analysis', label: 'Analysis Priority', icon: CheckSquare },
    { id: 'matrix', label: 'Similarity Matrix', icon: Grid },
    { id: 'graph', label: 'Similarity Network', icon: Share2 },
    { id: 'reviews', label: 'Review Cases', icon: CheckSquare },
    { id: 'upload', label: 'Upload Code', icon: Upload },
    { id: 'evaluation', label: 'Benchmark Suite', icon: BarChart2 },
    { id: 'dataset', label: 'Test Dataset', icon: Database },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-[#0A0F1D] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-md shadow-sky-500/20">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-base font-bold tracking-tight text-white">CODETRACE</span>
                <span className="text-xs font-semibold text-sky-400 font-mono">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Beyond Matching. Understand Code.</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-800/60 space-y-3 bg-[#0A0F1D]">
        {/* Hackathon Demo Button */}
        <button
          onClick={onRunDemoSeed}
          disabled={isSeeding}
          className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs py-2.5 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isSeeding ? 'animate-spin text-yellow-300' : 'text-yellow-300'}`} />
          <span>{isSeeding ? 'Seeding Demo...' : 'Hackathon Demo Mode'}</span>
        </button>

        {/* User Profile */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs border border-slate-700">
              EV
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">Dr. Evelyn Vance</div>
              <div className="text-[10px] text-slate-400 truncate">Faculty Tutor</div>
            </div>
          </div>
          <button className="text-slate-500 hover:text-slate-300 p-1" title="Tutor Profile">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
