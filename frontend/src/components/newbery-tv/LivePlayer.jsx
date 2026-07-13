import React from 'react';
import { X, PlayCircle, ChevronRight, Maximize2, Tv, AlertCircle } from 'lucide-react';
import { config } from './config';
import LiveBadge from './LiveBadge';

export default function LivePlayer({
  activeVideo,
  onClose,
  cinemaMode,
  setCinemaMode,
  videoSpeed,
  onSpeedChange,
  videoQuality,
  setVideoQuality,
  preRollActive,
  preRollCountdown,
  skipPreRoll,
  overlayAdActive,
  setOverlayAdActive,
  videoRef,
  onVideoEnded
}) {
  if (!activeVideo) return null;

  const triggerFullscreen = () => {
    const videoEl = videoRef.current;
    if (videoEl) {
      if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen();
      } else if (videoEl.webkitRequestFullscreen) { /* Safari */
        videoEl.webkitRequestFullscreen();
      } else if (videoEl.msRequestFullscreen) { /* IE11 */
        videoEl.msRequestFullscreen();
      }
    }
  };

  return (
    <div className={`relative bg-black flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 rounded-3xl border border-zinc-800 ${
      cinemaMode ? 'w-full lg:h-[65vh] h-[45vh]' : 'aspect-video w-full'
    }`}>
      {/* HEADER CONTROL */}
      <div className="absolute top-0 w-full z-30 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          {activeVideo.isLiveStream ? (
            <LiveBadge animate={true} text="VIVO" className="bg-red-600/10 border border-red-500/20 px-2 py-0.5 rounded" />
          ) : (
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-black text-[8px] tracking-widest">
              PLAYING
            </span>
          )}
          <span className="text-white truncate max-w-sm drop-shadow-md">{activeVideo.title}</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors bg-black/40 hover:bg-black/60 p-2 rounded-full cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* CORE DISPLAY (VIDEO & AD OVERLAYS) */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        {preRollActive ? (
          /* PRE-ROLL SPONSOR AD OVERLAY */
          <div className="absolute inset-0 bg-zinc-950 z-20 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
            <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-widest font-black mb-3">
              Anuncio Patrocinado
            </span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">Jorge Newbery Digital 2.5</h4>
            <p className="text-xs text-zinc-500 max-w-xs mb-6 mt-1 font-light">El software de gestión deportiva auspicia este encuentro.</p>
            
            <div className="flex gap-3">
              <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-4 py-2.5 rounded-xl font-bold uppercase">
                El video comenzará en {preRollCountdown}...
              </span>
              <button
                onClick={skipPreRoll}
                className="bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                Omitir Anuncio <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE HTML5 VIDEO */
          <video
            ref={videoRef}
            src={activeVideo.url}
            controls
            autoPlay
            onEnded={onVideoEnded}
            className="w-full h-full object-contain"
          />
        )}

        {/* MID-ROLL OVERLAY BANNER */}
        {!preRollActive && overlayAdActive && (
          <div className="absolute bottom-16 left-4 right-4 bg-zinc-950/95 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between z-10 backdrop-blur-md shadow-2xl max-w-xl mx-auto animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="text-[8px] bg-yellow-500/15 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-black uppercase tracking-widest">Aviso</span>
              <p className="text-[10px] text-zinc-300 font-light leading-snug">
                ¿Querés indumentaria oficial del club? Ingresá hoy a la Tienda Digital del Newbery.
              </p>
            </div>
            <button 
              onClick={() => setOverlayAdActive(false)}
              className="text-zinc-500 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {/* FOOTER BAR WITH PLAYER STATUS & ACTIONS */}
      <div className="bg-[#0b0b0f] border-t border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none z-10">
        
        {/* Speed Controls */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800">
          <span className="text-zinc-500 ml-1.5 mr-1 font-black">VELOCIDAD:</span>
          {[0.5, 1, 1.25, 1.5, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-colors cursor-pointer ${
                videoSpeed === s ? 'bg-red-600 text-white shadow-md' : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Quality Controls */}
        <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800">
          <span className="text-zinc-500 ml-1.5 mr-1 font-black">CALIDAD:</span>
          {['Auto', '1080p', '720p', '480p'].map((q) => (
            <button
              key={q}
              onClick={() => setVideoQuality(q)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition-colors cursor-pointer ${
                videoQuality === q ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Screen layout buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCinemaMode(!cinemaMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
              cinemaMode 
                ? 'bg-red-600/10 border-red-500/20 text-red-500 font-black' 
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Modo Cine"
          >
            <Tv size={14} />
            <span className="text-[9px]">Cine</span>
          </button>

          <button
            onClick={triggerFullscreen}
            className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            title="Pantalla Completa"
          >
            <Maximize2 size={14} />
            <span className="text-[9px]">Full</span>
          </button>
        </div>

      </div>
    </div>
  );
}
