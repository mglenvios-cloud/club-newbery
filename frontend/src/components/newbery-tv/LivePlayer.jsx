import React, { useState } from 'react';
import { X, PlayCircle, ChevronRight, Maximize2, Tv, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { config } from './config';
import LiveBadge from './LiveBadge';
import { isYouTubeUrl, getYouTubeEmbedUrl, getCanonicalYouTubeUrl } from '@/lib/youtubeUtils';

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
  const [copied, setCopied] = useState(false);

  if (!activeVideo) return null;

  const rawUrl = activeVideo.url || '';
  const isLpfPlay = rawUrl.includes('lpfplay.com');
  const isYt = isYouTubeUrl(rawUrl);

  const ytEmbedUrl = isYt ? getYouTubeEmbedUrl(rawUrl, true) : null;
  const canonicalYtUrl = isYt ? getCanonicalYouTubeUrl(rawUrl) : (isLpfPlay ? 'https://www.lpfplay.com/page/684743a8b6b14151aae96cad' : rawUrl);
  const lpfPlayUrl = "https://www.lpfplay.com/page/684743a8b6b14151aae96cad";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(isLpfPlay ? lpfPlayUrl : canonicalYtUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
      <div className="absolute top-0 w-full z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          {activeVideo.isLiveStream ? (
            <LiveBadge animate={true} text="VIVO" className="bg-red-600/20 border border-red-500/30 px-2 py-0.5 rounded text-red-400" />
          ) : (
            <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-black text-[8px] tracking-widest">
              PLAYING
            </span>
          )}

          {isLpfPlay ? (
            <span className="bg-blue-600/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded font-mono text-[9px]">
              LPF PLAY
            </span>
          ) : isYt ? (
            <span className="bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono text-[9px]">
              YOUTUBE
            </span>
          ) : null}

          <span className="text-white truncate max-w-sm drop-shadow-md">{activeVideo.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Link to YouTube */}
          <a
            href={isYt ? canonicalYtUrl : "https://www.youtube.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Abrir directamente en YouTube"
          >
            <ExternalLink size={12} />
            <span>YouTube Directo</span>
          </a>

          {/* Direct Link to LPF Play */}
          <a
            href={lpfPlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-400/40 text-blue-300 text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Abrir directamente en LPF Play"
          >
            <ExternalLink size={12} />
            <span>LPF Play Directo</span>
          </a>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
            title="Copiar enlace"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? '¡Copiado!' : 'Copiar Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors bg-black/60 hover:bg-black/80 p-2 rounded-full cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* CORE DISPLAY */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group">
        {preRollActive ? (
          /* PRE-ROLL SPONSOR AD OVERLAY */
          <div className="absolute inset-0 bg-zinc-950 z-20 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
            <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full uppercase tracking-widest font-black mb-3">
              Anuncio Patrocinado
            </span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">Jorge Newbery Digital</h4>
            <p className="text-xs text-zinc-500 max-w-xs mb-6 mt-1 font-light">Plataforma oficial de transmisión deportiva en directo.</p>

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
        ) : isLpfPlay ? (
          /* LPF PLAY SPECIAL BROADCAST CARD (prevents iframe block) */
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950 z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-400/40 text-blue-400 flex items-center justify-center font-black text-xl shadow-2xl">
              LPF
            </div>
            <div className="space-y-1 max-w-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-full">
                Transmisión Oficial Liga Profesional
              </span>
              <h3 className="text-xl font-black uppercase text-white tracking-tight pt-2">{activeVideo.title}</h3>
              <p className="text-xs text-blue-200/70 font-light">
                Por derechos oficiales de transmisión de la Liga Profesional, este contenido se emite en directo desde la plataforma oficial LPF Play.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={lpfPlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl shadow-blue-900/50 cursor-pointer transition-all hover:scale-105"
              >
                <ExternalLink size={16} />
                <span>ABRIR TRANSMISIÓN EN LPF PLAY</span>
              </a>

              <a
                href={canonicalYtUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-400 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <ExternalLink size={16} />
                <span>ABRIR EN YOUTUBE</span>
              </a>
            </div>
          </div>
        ) : isYt ? (
          /* YOUTUBE EMBED IFRAME PLAYER */
          <iframe
            src={ytEmbedUrl}
            title={activeVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
        {!preRollActive && overlayAdActive && !isLpfPlay && (
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
        
        <div className="flex items-center gap-3">
          <a
            href={isYt ? canonicalYtUrl : "https://www.youtube.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-mono text-[10px] transition-colors"
          >
            <ExternalLink size={13} />
            <span>Abrir en YouTube</span>
          </a>

          <a
            href={lpfPlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-mono text-[10px] transition-colors"
          >
            <ExternalLink size={13} />
            <span>Abrir en LPF Play</span>
          </a>
        </div>

        {/* Speed Controls (for non-youtube) */}
        {!isYt && !isLpfPlay && (
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
        )}

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

          {!isYt && !isLpfPlay && (
            <button
              onClick={triggerFullscreen}
              className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="Pantalla Completa"
            >
              <Maximize2 size={14} />
              <span className="text-[9px]">Full</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
