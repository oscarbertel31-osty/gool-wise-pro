
import React, { useState, useMemo, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { MatchAnalysisResult, GoalPrediction, SavedPick } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface MatchAnalysisProps {
  onSavePick: (pick: SavedPick) => void;
  onSyncMatch: (result: MatchAnalysisResult, url?: string) => void;
  currentResult?: MatchAnalysisResult | null;
}

export const MatchAnalysis: React.FC<MatchAnalysisProps> = ({ onSavePick, onSyncMatch, currentResult }) => {
  const [matchUrl, setMatchUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ignoreMinOdd, setIgnoreMinOdd] = useState(false);
  const [chartHistory, setChartHistory] = useState<any[]>([]);

  useEffect(() => {
    if (currentResult) {
      setResult(currentResult);
    }
  }, [currentResult]);

  useEffect(() => {
    if (result && result.predictions.length > 0) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const best = [...result.predictions].sort((a, b) => b.expectedValue - a.expectedValue)[0];
      
      const newEntry = {
        time,
        probabilidad: Math.round(best.probability * 100),
        cuota: best.currentOdd,
        market: best.market
      };

      setChartHistory(prev => {
        if (prev.length > 0 && prev[prev.length - 1].time === time) return prev;
        return [...prev, newEntry].slice(-15);
      });
    }
  }, [result]);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!matchUrl.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await GeminiService.analyzeMatch(matchUrl);
      setResult(data);
      onSyncMatch(data, matchUrl);
    } catch (err: any) {
      setError(err.message || 'Error en el motor de valor.');
    } finally {
      setLoading(false);
    }
  };

  const clearUrl = () => {
    setMatchUrl('');
    setChartHistory([]);
    setResult(null);
  };

  const saveToHistory = (pred: GoalPrediction) => {
    if (!result) return;
    const newPick: SavedPick = {
      ...pred,
      id: Math.random().toString(36).substr(2, 9),
      matchInfo: result.matchInfo,
      timestamp: new Date().toLocaleString(),
      isLive: result.liveStatus?.isLive || false,
      scoreAtSave: result.liveStatus?.score
    };
    onSavePick(newPick);
    alert('✅ Apuesta de Valor guardada.');
  };

  const filteredPredictions = useMemo(() => {
    if (!result?.predictions) return [];
    return result.predictions.filter(pred => 
      ignoreMinOdd ? true : (pred.currentOdd >= 1.50 && pred.currentOdd <= 2.50 && pred.expectedValue > 0)
    );
  }, [result, ignoreMinOdd]);

  const bestPrediction = useMemo(() => {
    if (filteredPredictions.length === 0) return null;
    return [...filteredPredictions].sort((a, b) => b.expectedValue - a.expectedValue)[0];
  }, [filteredPredictions]);

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'Bajo': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medio': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Alto': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-40">
      <section className="text-center space-y-6">
        <div className="flex flex-col items-center gap-6">
          <div className="inline-flex flex-wrap justify-center items-center gap-4 px-8 py-3 rounded-full bg-slate-900 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Value Scan active</span>
            <span className="opacity-20 text-slate-700">|</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> Corners & Handicap</span>
            <span className="opacity-20 text-slate-700">|</span>
            <span className="flex items-center gap-2 text-white">Betplay Live Sync</span>
          </div>
          
          <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group">
            <div className="relative">
              <input type="checkbox" checked={ignoreMinOdd} onChange={() => setIgnoreMinOdd(!ignoreMinOdd)} className="sr-only" />
              <div className={`w-12 h-6 rounded-full transition-colors ${ignoreMinOdd ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${ignoreMinOdd ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">Modo Full Markets</span>
          </label>
        </div>

        <div className="space-y-4">
          <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none italic">
            Goal<span className="text-emerald-500">Wise</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto font-bold text-lg uppercase tracking-tight">
            Scanner de Apuestas con Valor (EV+). Cuotas @1.50 - @2.50.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto mt-16 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-[40px] blur opacity-15 group-hover:opacity-30 transition duration-700"></div>
            <div className="relative flex items-center">
              <input 
                type="text" value={matchUrl} onChange={(e) => setMatchUrl(e.target.value)}
                placeholder="URL del partido (Betplay, Flashscore, SofaScore)..."
                className="relative w-full bg-slate-950 border-2 border-slate-800 rounded-[36px] py-8 pl-12 pr-12 text-xl text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition-all shadow-3xl"
              />
              {matchUrl && (
                <button 
                  onClick={clearUrl}
                  type="button"
                  className="absolute right-6 p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={(e) => handleAnalyze(e)} 
              disabled={loading || !matchUrl.trim()} 
              className="px-16 py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-[24px] transition-all disabled:opacity-50 uppercase text-sm tracking-[0.2em] shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              )}
              {loading ? 'Calculando EV+...' : 'Escanear Mercados de Valor'}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="flex flex-col items-center justify-center py-40 space-y-10 animate-pulse">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-[12px] border-emerald-500/5 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-t-emerald-500 rounded-full animate-spin duration-[3s]"></div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-emerald-400 font-black text-3xl tracking-tighter uppercase italic">
              Analizando Corners y Probabilidades...
            </p>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">
              Comparando Probabilidad IA vs Cuotas de Mercado
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto p-10 bg-red-950/20 border-2 border-red-500/20 rounded-[48px] text-red-500 text-center font-black text-lg shadow-2xl">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in slide-in-from-bottom-20 duration-1000 space-y-16">
          <div className="bg-slate-950/50 border border-slate-800 rounded-[64px] p-10 md:p-20 shadow-3xl relative overflow-hidden backdrop-blur-3xl">
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24">
              <div className="flex-1 space-y-8">
                <h3 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">{result.matchInfo}</h3>
                {result.liveStatus && (
                  <div className="inline-flex items-center gap-10 px-10 py-6 bg-slate-900/90 rounded-[32px] border border-slate-800 shadow-2xl">
                    <span className="text-7xl font-black text-emerald-500 tracking-tighter tabular-nums">{result.liveStatus.score}</span>
                    <div className="h-16 w-[1px] bg-slate-800"></div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1">Status Live</span>
                      <span className="text-white font-black uppercase text-[9px] tracking-widest opacity-50">{result.liveStatus.minute}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-900/80 p-12 rounded-[48px] border border-slate-800 text-center min-w-[240px] shadow-inner">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-4">Confianza General</span>
                <div className="text-6xl font-black text-white leading-none tracking-tighter tabular-nums">
                  {Math.round(result.marketConfidence * 100)}%
                </div>
                <div className="mt-6 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${result.marketConfidence * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Value Bets Grid */}
            <div className="space-y-16">
              <div className="flex items-center gap-10">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.6em] whitespace-nowrap">Mercados con Valor Esperado (+)</h4>
                <div className="h-[1px] flex-1 bg-amber-500/20"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {filteredPredictions.map((pred, i) => {
                  const isBest = pred === bestPrediction;
                  const evPercent = Math.round(pred.expectedValue * 100);
                  return (
                    <div 
                      key={i} 
                      className={`group relative bg-slate-950 border-2 p-12 rounded-[56px] transition-all duration-700 ${
                        isBest ? 'border-amber-400 shadow-[0_40px_80px_-20px_rgba(251,191,36,0.2)] scale-[1.02]' : 'border-slate-800'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">Recomendación Principal</div>
                      )}

                      <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isBest ? 'text-amber-400' : 'text-slate-500'}`}>{pred.market}</span>
                          <span className="text-white font-black text-2xl mt-1 tracking-tight">Betplay @{pred.currentOdd.toFixed(2)}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${getRiskBadge(pred.riskLevel)}`}>
                          Riesgo {pred.riskLevel}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-10">
                        <div className="bg-slate-900/40 p-6 rounded-[28px] border border-slate-800">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Prob. Implícita</span>
                           <span className="text-xl font-black text-slate-400">{(pred.impliedProbability * 100).toFixed(1)}%</span>
                        </div>
                        <div className="bg-slate-900/40 p-6 rounded-[28px] border border-slate-800 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-3 opacity-20">
                              <svg width="12" height="12" fill="emerald-400" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                           </div>
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Prob. Real (IA)</span>
                           <span className="text-xl font-black text-emerald-400">{(pred.probability * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-10 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Valor Esperado</span>
                          <span className="text-3xl font-black text-emerald-400">+{evPercent}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Cuota Justa</span>
                          <span className="text-lg font-black text-slate-400">@{pred.estimatedOdd.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-900/60 rounded-[32px] border border-slate-800/50 mb-8">
                        <p className="text-xs text-slate-300 leading-relaxed font-medium italic">"{pred.justification}"</p>
                      </div>

                      <button 
                        onClick={() => saveToHistory(pred)}
                        className={`w-full py-5 font-black rounded-[24px] transition-all uppercase text-[10px] tracking-[0.2em] border ${isBest ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-emerald-500/50'}`}
                      >
                        {isBest ? 'Fijar Pronóstico' : 'Añadir al Registro'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conservative Option Highlight */}
            {result.conservativeOption && (
              <div className="mt-16 p-10 bg-slate-900/40 border border-dashed border-emerald-500/30 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                    <svg width="32" height="32" className="text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] block mb-1">Opción Conservadora (Segura)</span>
                    <h5 className="text-2xl font-black text-white">{result.conservativeOption.market}</h5>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Cuota</span>
                    <span className="text-2xl font-black text-white">@{result.conservativeOption.odd.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Confianza</span>
                    <span className="text-2xl font-black text-emerald-400">{Math.round(result.conservativeOption.probability * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-20 p-12 bg-slate-900/60 rounded-[48px] border border-slate-800">
               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6">Análisis del Algoritmo Pro</h5>
               <p className="text-slate-200 leading-relaxed font-bold text-xl">"{result.rationale}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
               <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-[40px] hover:border-slate-700 transition-colors">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-6">Análisis xG Live</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.technicalAudit.statistics}</p>
               </div>
               <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-[40px] hover:border-slate-700 transition-colors">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-6">Corners y Tarjetas</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.technicalAudit.advancedData}</p>
               </div>
               <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-[40px] hover:border-slate-700 transition-colors">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-6">Justificación de Valor</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{result.technicalAudit.marketAnalysis}</p>
               </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="mt-12 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px]">
                <h5 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Fuentes Verificadas (Google Search Sync)</h5>
                <div className="flex flex-wrap gap-4">
                  {result.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
