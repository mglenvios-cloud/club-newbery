import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function Timeline({ events = [], onEventClick }) {
  const getEventIcon = (type) => {
    const uppercaseType = (type || '').toUpperCase();
    if (uppercaseType.includes('GOL') || uppercaseType.includes('GOAL')) return '⚽';
    if (uppercaseType.includes('AMARILLA') || uppercaseType.includes('YELLOW')) return '🟨';
    if (uppercaseType.includes('ROJA') || uppercaseType.includes('RED')) return '🟥';
    if (uppercaseType.includes('CAMBIO') || uppercaseType.includes('SUB')) return '🔄';
    if (uppercaseType.includes('INICIO') || uppercaseType.includes('START') || uppercaseType.includes('TEMPO')) return '⏱';
    if (uppercaseType.includes('FIN') || uppercaseType.includes('END') || uppercaseType.includes('FINAL')) return '🏁';
    return '⚡';
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Cronología del Partido</span>
        <span className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-black tracking-widest">TIMELINE</span>
      </div>

      {events.length === 0 ? (
        <p className="text-[11px] text-zinc-500 italic py-4 text-center">No hay incidentes registrados en esta transmisión.</p>
      ) : (
        <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-4 pt-1 pb-1">
          {events.map((evt) => {
            const icon = getEventIcon(evt.type);
            return (
              <div 
                key={evt.id} 
                onClick={() => onEventClick(evt.minute * 60)}
                className="relative group cursor-pointer hover:bg-zinc-900/60 p-2.5 rounded-xl border border-transparent hover:border-zinc-800 transition-all duration-200"
              >
                {/* Connector Dot */}
                <span className="absolute -left-[21px] top-3.5 w-2 h-2 bg-red-600 rounded-full group-hover:scale-125 transition-transform shadow-sm shadow-red-950/50" />
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-red-500 font-black">{evt.minute}'</span>
                    <span className="text-[9px] font-bold text-zinc-300">{icon}</span>
                    <span className="text-[9px] font-black text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                      {evt.type}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-300 font-medium mt-1 leading-snug">
                  {evt.detail || evt.playerName || 'Acción de juego'}
                </p>
                
                <div className="text-[8px] text-zinc-500 font-black mt-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle size={10} className="text-red-500" />
                  <span>SALTAR A ESTE INSTANTE</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
