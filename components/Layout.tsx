
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  savedCount: number;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, savedCount, children }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950 relative">
      <div className="animated-bg"></div>
      <header className="sticky top-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">G</div>
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              GoalWise Pro
            </h1>
          </div>
          <nav className="flex gap-2">
            {[
              { id: AppTab.ANALYSIS, label: 'Scanner' },
              { id: AppTab.HISTORY, label: `Registro (${savedCount})` },
              { id: AppTab.VEO, label: 'Veo AI' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex justify-center gap-8 grayscale opacity-50">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Betplay Sync</span>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Gemini Ultra 2.5</span>
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Real-Time xG</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">© 2025 GoalWise Intelligence Lab</p>
        </div>
      </footer>
    </div>
  );
};
