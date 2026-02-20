
import React, { useState } from 'react';
import { MatchAnalysisResult } from '../types';

interface LiveOddsBarProps {
  data: MatchAnalysisResult | null;
  onRefresh: () => void;
  loading: boolean;
}

export const LiveOddsBar: React.FC<LiveOddsBarProps> = ({ data, onRefresh, loading }) => {
  const [isRotating, setIsRotating] = useState(false);

  if (!data) return null;

  const topPick = [...data.predictions].sort((a, b) => b.probability - a.probability)[0];

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh();
    // La rotación visual se detendrá cuando `loading` pase a falso gracias a la clase CSS
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/98 backdrop-blur-2xl border-t border-emerald-500/40 shadow-[0_-15px_50px_-10px_rgba(16,185,129,0.3)]">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between gap-6">
        
        {/* Match Info & Clock */}
        <div className="flex items-center gap-6 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] animate-pulse">Sincronizado Betplay</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-bold text-slate-500">Live Engine v3.1</span>
            </div>
            <h4 className="text-sm font-black text-white truncate max-w-[220px]">{data.matchInfo}</h4>
          </div>
          
          <div className="flex items-center gap-5 bg-slate-900 px-5 py-3 rounded-2xl border border-slate-800 shadow-xl">
            {data.liveStatus?.isLive ? (
              <>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Minuto</span>
                  <span className="text-xs font-black text-white">{data.liveStatus.minute}</span>
                </div>
                <div className="w-[1px] h-6 bg-slate-800"></div>
                <span className="text-2xl font-black text-emerald-500 tabular-nums">{data.liveStatus.score}</span>
              </>
            ) : (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Pre-Match Sync</span>
            )}
          </div>
        </div>

        {/* Tienda Betplay Marketplace */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Mercado Actualizado</span>
            <span className="text-xs font-black text-white px-3 py-1.5 bg-slate-900/50 rounded-xl border border-slate-800 ring-1 ring-emerald-500/20">{topPick.market}</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-help">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Tienda Betplay</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-emerald-400 tabular-nums">
                {loading ? (
                   <span className="animate-pulse opacity-50">...</span>
                ) : topPick.currentOdd.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Odd</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Fiabilidad IA</span>
              <span className="text-xs font-black text-white">{Math.round(topPick.probability * 100)}%</span>
            </div>
            <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${topPick.isValue ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-emerald-500'}`} 
                style={{ width: `${topPick.probability * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sincronización</span>
            <span className="text-[10px] font-bold text-slate-400 italic">en tiempo real</span>
          </div>
          
          <button 
            onClick={handleRefreshClick}
            disabled={loading}
            className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl shadow-emerald-500/30 overflow-hidden`}
            title="Sincronizar Datos Live"
          >
            <div className={`absolute inset-0 bg-white/20 transition-transform duration-[2000ms] ${loading ? 'translate-y-0' : 'translate-y-full'}`}></div>
            <svg 
              className={`relative z-10 w-6 h-6 ${loading ? 'animate-spin' : 'transition-transform duration-700'}`} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              viewBox="0 0 24 24"
              style={{ transform: !loading ? 'rotate(0deg)' : undefined }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};
