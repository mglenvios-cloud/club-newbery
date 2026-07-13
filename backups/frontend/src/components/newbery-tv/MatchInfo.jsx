import React from 'react';
import { Calendar, Award, Shield, User } from 'lucide-react';

export default function MatchInfo({ match }) {
  if (!match) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'A Confirmar';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const competition = match.competition || 'Torneo Oficial';
  const venue = match.venue || 'Cancha Jorge Newbery';
  const referee = match.referee || 'A designar por federación';
  const dateFormatted = formatDate(match.date);
  const timeSlot = match.timeSlot || 'Horario a confirmar';

  return (
    <div className="bg-[#111] border border-white/5 p-6 rounded-3xl space-y-4 shadow-lg select-none">
      <h4 className="text-xs font-black uppercase tracking-widest text-jn-red border-b border-white/5 pb-2">
        Ficha Técnica del Encuentro
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        {/* Competencia */}
        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Competencia</span>
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <Award size={14} className="text-red-500 shrink-0" />
            <span className="truncate">{competition}</span>
          </div>
        </div>

        {/* Cancha */}
        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Estadio / Sede</span>
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <Shield size={14} className="text-red-500 shrink-0" />
            <span className="truncate">{venue}</span>
          </div>
        </div>

        {/* Árbitro */}
        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Árbitro</span>
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <User size={14} className="text-red-500 shrink-0" />
            <span className="truncate">{referee}</span>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="space-y-1">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Fecha y Hora</span>
          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
            <Calendar size={14} className="text-red-500 shrink-0" />
            <span className="truncate">{dateFormatted} · {timeSlot}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
