import React from 'react';
import { PlayCircle, Users, Clock, Video, Calendar, Shield, User } from 'lucide-react';
import LiveBadge from './LiveBadge';
import { config } from './config';

export default function HeroLive({ liveMatch, videoDestacado, onPlayVideo }) {
  // Determinamos qué mostrar prioritariamente (LIVE primero, luego destacado)
  const isLive = liveMatch && liveMatch.status === 'LIVE';
  
  const displayTitle = isLive 
    ? `${liveMatch.homeTeam} vs ${liveMatch.opponent}` 
    : (videoDestacado ? videoDestacado.title : "Newbery TV");
  
  const displayDesc = isLive 
    ? `Transmisión oficial en vivo del partido frente a ${liveMatch.opponent} por ${liveMatch.competition}.` 
    : (videoDestacado ? videoDestacado.description : config.subTitle);

  const displayCategory = isLive ? liveMatch.competition : (videoDestacado ? videoDestacado.category : "STREAMING");
  
  const handlePlayClick = () => {
    if (isLive) {
      onPlayVideo({
        id: `live-${liveMatch.id}`,
        title: `Transmisión en Vivo: Jorge Newbery vs ${liveMatch.opponent}`,
        url: liveMatch.liveStreamUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        category: 'Partidos Completos',
        description: displayDesc,
        matchId: liveMatch.id,
        isLiveStream: true
      });
    } else if (videoDestacado) {
      onPlayVideo(videoDestacado);
    }
  };

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center bg-black overflow-hidden border-b border-zinc-800">
      
      {/* 1. Background Cover Image with high-impact zoom scale effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 opacity-50 transform hover:scale-100 transition-transform duration-10000 ease-out" 
        style={{ backgroundImage: `url('${config.defaultFallbackImage}')` }}
      ></div>

      {/* 2. Premium Gradients Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/60 to-transparent z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(220,38,38,0.15),transparent_45%)] z-0"></div>

      <div className="relative z-10 container mx-auto px-6 max-w-6xl py-12 md:py-20 space-y-6 md:space-y-8 text-left animate-slide-up">
        
        {/* Category Pill or Live Pulse Badge */}
        {isLive ? (
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/35 px-4 py-2 rounded-2xl animate-pulse shadow-lg shadow-red-950/30">
            <LiveBadge animate={true} text="PARTIDO EN VIVO" />
          </div>
        ) : (
          <span className="inline-block bg-red-950/50 border border-red-500/25 text-red-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest select-none">
            {displayCategory}
          </span>
        )}

        {/* Big Impact Title */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-tight leading-none text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {isLive ? (
              <>
                {liveMatch.homeTeam} <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">VS</span> {liveMatch.opponent}
              </>
            ) : (
              displayTitle
            )}
          </h1>
          
          <p className="text-zinc-300 text-sm md:text-base max-w-2xl font-light leading-relaxed drop-shadow-sm">
            {displayDesc}
          </p>
        </div>

        {/* Match Metadata (Venue, Referee, Date, Attendance) */}
        {isLive ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-400 font-mono border-y border-white/5 py-4 w-fit select-none">
            <span className="flex items-center gap-2">
              <Clock size={14} className="text-red-500 animate-pulse" />
              <span>MINUTO <strong className="text-white">{liveMatch.liveMinute || 0}&apos;</strong></span>
            </span>
            <span className="flex items-center gap-2">
              <Users size={14} className="text-red-500" />
              <span><strong className="text-white">{liveMatch.attendance || 0}</strong> espectadores</span>
            </span>
            <span className="flex items-center gap-2">
              <Shield size={14} className="text-red-500" />
              <span>ESTADIO: <strong className="text-white">{liveMatch.venue || 'Jorge Newbery'}</strong></span>
            </span>
          </div>
        ) : (
          videoDestacado && videoDestacado.matchId && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] text-zinc-400 font-black uppercase tracking-wider py-2 select-none">
              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-red-500" /> {new Date(videoDestacado.createdAt).toLocaleDateString('es-AR')}</span>
              <span className="flex items-center gap-1.5"><Shield size={13} className="text-red-500" /> {videoDestacado.competition || 'Torneo Oficial'}</span>
            </div>
          )
        )}

        {/* High-Fidelity Call-To-Action Buttons */}
        <div className="flex flex-wrap gap-4 pt-2">
          {(isLive || videoDestacado) && (
            <button
              onClick={handlePlayClick}
              className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_25px_rgba(220,38,38,0.5)] cursor-pointer"
            >
              {isLive ? (
                <Video size={16} className="group-hover:rotate-12 transition-transform" />
              ) : (
                <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
              )}
              <span>{isLive ? "VER TRANSMISIÓN" : "VER AHORA"}</span>
            </button>
          )}

          {videoDestacado && !isLive && (
            <button 
              onClick={handlePlayClick}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 backdrop-blur-md px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
            >
              <span>Ver Resumen</span>
            </button>
          )}
        </div>
      </div>

      {/* Styled JSX for local animation frames */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
}
