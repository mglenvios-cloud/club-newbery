import React from 'react';
import { Trophy, Clock } from 'lucide-react';
import LiveBadge from './LiveBadge';

export default function LiveScoreboard({ liveMatch }) {
  if (!liveMatch) return null;

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden select-none">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Local, vs, Visitante */}
      <div className="flex items-center gap-6 md:gap-12 flex-1 justify-center md:justify-start">
        {/* Local */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center font-black text-lg border-2 border-white/10 shadow-lg">
            {liveMatch.homeTeam.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Local</span>
            <h4 className="text-lg font-black uppercase text-white leading-none">{liveMatch.homeTeam}</h4>
          </div>
        </div>

        <div className="text-xl font-black text-red-500 animate-pulse font-sans">VS</div>

        {/* Visitante */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-zinc-900 text-zinc-300 rounded-full flex items-center justify-center font-black text-lg border-2 border-white/10 shadow-lg">
            {liveMatch.opponent.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="text-left">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Visita</span>
            <h4 className="text-lg font-black uppercase text-white leading-none">{liveMatch.opponent}</h4>
          </div>
        </div>
      </div>

      {/* Marcador Central */}
      <div className="flex items-center gap-4 bg-zinc-950/90 border border-zinc-800 px-8 py-4 rounded-2xl shadow-inner shrink-0">
        <div className="text-center">
          <span className="text-[9px] text-zinc-500 font-black uppercase block tracking-widest">Score</span>
          <span className="text-4xl font-black text-white tracking-tighter font-mono">
            {liveMatch.ourScore ?? 0} - {liveMatch.opponentScore ?? 0}
          </span>
        </div>
      </div>

      {/* Estado y Minuto */}
      <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
        <LiveBadge animate={liveMatch.status === 'LIVE'} text={liveMatch.status === 'LIVE' ? "EN VIVO" : "FINALIZADO"} className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full" />
        <span className="flex items-center gap-1 text-xs font-mono text-zinc-400 mt-1 font-bold">
          <Clock size={14} className="text-red-500" />
          MINUTO {liveMatch.liveMinute || 0}&apos;
        </span>
      </div>
    </div>
  );
}
