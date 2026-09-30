import React, { useState, useEffect } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { Dashboard } from './pages/Dashboard';
import { AnalysisResults } from './pages/AnalysisResults';
import { SimilarityMatrix } from './pages/SimilarityMatrix';
import { NetworkGraph } from './pages/NetworkGraph';
import { CodeComparison } from './pages/CodeComparison';
import { ReviewWorkflow } from './pages/ReviewWorkflow';
import { UploadSubmission } from './pages/UploadSubmission';
import { EvaluationBenchmark } from './pages/EvaluationBenchmark';
import { DatasetViewer } from './pages/DatasetViewer';
import { AdminSettings } from './pages/AdminSettings';
import { fetchDashboardData, triggerDemoSeed } from './services/api';
import { DashboardData } from './types';
import { Sparkles, X, ShieldAlert } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    loadDashboard();
    // Check first time onboarding
    const seenOnboarding = localStorage.getItem('codetrace_onboarding_seen');
    if (!seenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      if (data.total_submissions === 0) {
        handleRunDemoSeed();
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  const handleRunDemoSeed = async () => {
    try {
      setIsSeeding(true);
      await triggerDemoSeed();
      await loadDashboard();
    } catch (err) {
      console.error('Demo seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOpenComparison = (pairId: number) => {
    setSelectedPairId(pairId);
    setActiveTab('comparison');
  };

  const closeOnboarding = () => {
    localStorage.setItem('codetrace_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex font-sans selection:bg-sky-500 selection:text-white">
      {/* Left Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'comparison') setSelectedPairId(null);
          setActiveTab(tab);
        }}
        onRunDemoSeed={handleRunDemoSeed}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Onboarding Welcome Modal (Section 18 requirement) */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl space-y-6 relative">
              <button
                onClick={closeOnboarding}
                className="absolute right-4 top-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-sky-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">Welcome to CodeTrace AI</h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CodeTrace AI helps tutors identify code submissions that deserve manual review.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-sm">1</div>
                  <div className="text-slate-300 text-[11px]">Upload Submissions</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-sm">2</div>
                  <div className="text-slate-300 text-[11px]">Run Analysis</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 text-sm">3</div>
                  <div className="text-slate-300 text-[11px]">Review Evidence</div>
                </div>
              </div>

              <button
                onClick={() => {
                  closeOnboarding();
                  handleRunDemoSeed();
                }}
                className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Start Demo Scenario</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              onOpenComparison={handleOpenComparison}
              onNavigate={(tab) => setActiveTab(tab)}
              onRunDemo={handleRunDemoSeed}
            />
          )}

          {activeTab === 'submissions' && (
            <AnalysisResults onOpenComparison={handleOpenComparison} />
          )}

          {activeTab === 'analysis' && (
            <AnalysisResults onOpenComparison={handleOpenComparison} />
          )}

          {activeTab === 'matrix' && (
            <SimilarityMatrix onOpenComparison={handleOpenComparison} />
          )}

          {activeTab === 'graph' && (
            <NetworkGraph onOpenComparison={handleOpenComparison} />
          )}

          {activeTab === 'comparison' && selectedPairId && (
            <CodeComparison
              pairId={selectedPairId}
              onBack={() => setActiveTab('analysis')}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewWorkflow onOpenComparison={handleOpenComparison} />
          )}

          {activeTab === 'upload' && (
            <UploadSubmission
              onSuccess={() => {
                loadDashboard();
                setActiveTab('analysis');
              }}
            />
          )}

          {activeTab === 'evaluation' && <EvaluationBenchmark />}

          {activeTab === 'dataset' && <DatasetViewer />}

          {activeTab === 'settings' && <AdminSettings />}
        </main>

        <footer className="border-t border-slate-900 bg-[#0A0F1D] py-4 text-center text-[11px] text-slate-500">
          CodeTrace AI — RAMPeX Hackathon Problem Statement 05 | Simple for Tutors. Powerful Underneath.
        </footer>
      </div>
    </div>
  );
}

export default App;
