import React, { useState } from 'react';
import { ScrollText, RefreshCw, Sparkles } from 'lucide-react';

export default function AIPanel({ matchId, aiSummary, generatingAi, onGenerateAiSummary }) {
  if (generatingAi) {
    return (
      <div className="space-y-4 select-none">
        <div className="flex border-b border-zinc-800 text-[9px] font-black uppercase tracking-wider pb-2">
          <span className="text-white flex items-center gap-1.5"><ScrollText size={10} /> Resumen IA</span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl min-h-[120px] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="animate-spin text-red-500" size={16} />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Redactando reporte con IA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none animate-fade-in">
      <div className="flex border-b border-zinc-800 text-[9px] font-black uppercase tracking-wider pb-2">
        <span className="text-white flex items-center gap-1.5"><ScrollText size={10} /> Resumen IA</span>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/80 p-4 rounded-2xl min-h-[120px] text-left">
        {aiSummary ? (
          <p className="text-[10px] text-zinc-350 font-light leading-relaxed whitespace-pre-line">
            {aiSummary}
          </p>
        ) : (
          <div className="text-center py-6 space-y-3">
            <p className="text-[10px] text-zinc-500 italic">No se ha redactado la crónica de este encuentro.</p>
            {matchId && (
              <button
                onClick={() => onGenerateAiSummary(matchId)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 w-full py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={11} className="text-red-500" />
                Generar Crónica IA
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
