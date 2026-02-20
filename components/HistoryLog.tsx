
import React from 'react';
import { SavedPick } from '../types';

interface HistoryLogProps {
  picks: SavedPick[];
  onClear: () => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ picks, onClear }) => {
  const exportToExcel = () => {
    const headers = ['Fecha', 'Partido', 'Mercado', 'Cuota Betplay', 'Prob Estimada', 'Prob Implícita', 'EV%', 'Estado'];
    const rows = picks.map(p => [
      p.timestamp,
      `"${p.matchInfo.replace(/"/g, '""')}"`,
      p.market,
      p.currentOdd.toFixed(2),
      `${(p.probability * 100).toFixed(1)}%`,
      `${(p.impliedProbability * 100).toFixed(1)}%`,
      `${(p.expectedValue * 100).toFixed(1)}%`,
      p.isLive ? `Live (${p.scoreAtSave})` : 'Pre'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GoalWise_Value_Picks_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Registro de <span className="text-emerald-500">Value Bets</span></h2>
          <p className="text-slate-500 text-sm font-medium">Gestiona y exporta tus apuestas de valor guardadas.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onClear} className="px-6 py-3 rounded-2xl bg-slate-900 text-slate-400 font-bold text-xs uppercase hover:text-red-400 transition-all">Limpiar</button>
          <button onClick={exportToExcel} disabled={picks.length === 0} className="px-8 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase hover:bg-emerald-400 transition-all disabled:opacity-50">Exportar CSV</button>
        </div>
      </div>

      {picks.length === 0 ? (
        <div className="py-32 text-center bg-slate-950/50 border border-slate-900 rounded-[40px]">
          <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No hay apuestas de valor registradas aún</p>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-900 rounded-[40px] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-6">Evento / Fecha</th>
                <th className="px-8 py-6">Mercado</th>
                <th className="px-8 py-6">Betplay</th>
                <th className="px-8 py-6">IA Prob.</th>
                <th className="px-8 py-6">EV%</th>
                <th className="px-8 py-6">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {picks.map((pick) => (
                <tr key={pick.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-white">{pick.matchInfo}</div>
                    <div className="text-[10px] text-slate-600 mt-1">{pick.timestamp}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded bg-slate-900 text-slate-400 text-[10px] font-black uppercase">{pick.market}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-lg font-black text-emerald-400">@{pick.currentOdd.toFixed(2)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-white">{Math.round(pick.probability * 100)}%</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-amber-500">+{Math.round(pick.expectedValue * 100)}%</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${pick.isLive ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      {pick.isLive ? `Live ${pick.scoreAtSave}` : 'Pre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
