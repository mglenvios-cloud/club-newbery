import React from 'react';
import { Activity } from 'lucide-react';

export default function StreamingStatus({ isLive = false, provider = "Liga Pro Studio" }) {
  if (!isLive) return null;
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/20 border border-red-500/20 text-[9px] font-black uppercase tracking-wider text-zinc-400">
      <Activity size={10} className="text-red-500 animate-pulse" />
      <span>Producción {provider}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block ml-1"></span>
      <span className="text-green-500 font-bold lowercase text-[8px]">conectado</span>
    </div>
  );
}
