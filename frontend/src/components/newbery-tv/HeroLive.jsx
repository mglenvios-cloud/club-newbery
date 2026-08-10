import React, { useState } from 'react';
import { PlayCircle, Users, Clock, Video, Calendar, Shield, Copy, Check, ExternalLink, Youtube, Trophy, MonitorPlay, ShieldCheck } from 'lucide-react';
import LiveBadge from './LiveBadge';
import { config } from './config';
import { getCanonicalYouTubeUrl } from '@/lib/youtubeUtils';

export default function HeroLive({ liveMatch, videoDestacado, onPlayVideo }) {
  const DEFAULT_YT_LINK = 'https://youtu.be/clxMCC1Ovjw?si=SmkYXQSBta8VPFEH';
  const DEFAULT_LFP_LINK = 'https://www.lpfplay.com/page/684743a8b6b14151aae96cad';

  const [ytInputUrl, setYtInputUrl] = useState(DEFAULT_YT_LINK);
  const [ytCopied, setYtCopied] = useState(false);

  const [lfpInputUrl, setLfpInputUrl] = useState(DEFAULT_LFP_LINK);
  const [lfpCopied, setLfpCopied] = useState(false);

  const isLive = liveMatch && liveMatch.status === 'LIVE';
  const opponentName = (liveMatch && liveMatch.opponent && liveMatch.opponent !== 'undefined') ? liveMatch.opponent : 'San Lorenzo';
  const compName = (liveMatch && liveMatch.competition && liveMatch.competition !== 'undefined') ? liveMatch.competition : 'AFA Primera';

  const displayTitle = isLive 
    ? `${liveMatch.homeTeam || 'Jorge Newbery'} vs ${opponentName}` 
    : (videoDestacado ? videoDestacado.title : "Jorge Newbery vs Atlanta 2026");
  
  const displayDesc = isLive 
    ? `Transmisión oficial en vivo del partido frente a ${opponentName} por ${compName}.` 
    : (videoDestacado ? videoDestacado.description : "Los goles y mejores jugadas del triunfo 3-1 en Devoto.");

  const displayCategory = isLive ? compName : (videoDestacado ? videoDestacado.category : "AFA Primera");

  const handleCopyYtLink = () => {
    navigator.clipboard.writeText(ytInputUrl || DEFAULT_YT_LINK);
    setYtCopied(true);
    setTimeout(() => setYtCopied(false), 2500);
  };

  const handleCopyLfpLink = () => {
    navigator.clipboard.writeText(lfpInputUrl || DEFAULT_LFP_LINK);
    setLfpCopied(true);
    setTimeout(() => setLfpCopied(false), 2500);
  };

  const handleOpenLfpExternal = () => {
    window.open(lfpInputUrl || DEFAULT_LFP_LINK, '_blank', 'noopener,noreferrer');
  };

  const handlePlayClick = () => {
    if (onPlayVideo) {
      onPlayVideo({
        id: `yt-stream`,
        title: displayTitle,
        url: ytInputUrl || DEFAULT_YT_LINK,
        category: displayCategory,
        description: displayDesc,
        isLiveStream: true
      });
    }
  };

  return (
    <section className="relative w-full bg-black border-b border-zinc-800 p-4 md:p-8 space-y-8">
      {/* TARJETAS DUALES: CARD YOUTUBE Y CARD LFP PLAY */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 z-20 relative pt-4">
        {/* TARJETA 1: YOUTUBE */}
        <div className="p-6 rounded-3xl border border-red-500/30 bg-zinc-900/90 space-y-4 shadow-xl text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Tarjeta 1: Link de YouTube</h3>
                <p className="text-[11px] text-zinc-400">Copiar y transmitir enlace de YouTube</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-bold">YouTube</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Enlace o Link de YouTube:</label>
              <input
                type="text"
                value={ytInputUrl}
                onChange={(e) => setYtInputUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyYtLink}
                className="flex-1 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {ytCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{ytCopied ? '¡Link Copiado!' : 'Copiar Link YouTube'}</span>
              </button>

              <button
                type="button"
                onClick={handlePlayClick}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>Ver en TV</span>
              </button>
            </div>
          </div>
        </div>

        {/* TARJETA 2: EXCLUSIVA LFP PLAY */}
        <div className="p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-900/90 via-zinc-900 to-amber-950/20 space-y-4 shadow-xl text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>Tarjeta 2: Canal Exclusivo LFP PLAY</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">OFICIAL</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Liga Profesional de Fútbol Argentina</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">LFP Play</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Enlace Oficial LFP Play (Liga Profesional):</span>
              </label>
              <input
                type="text"
                value={lfpInputUrl}
                onChange={(e) => setLfpInputUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-amber-500/40 text-amber-200 font-mono text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLfpLink}
                className="px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {lfpCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{lfpCopied ? '¡Copiado!' : 'Copiar Link LFP'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenLfpExternal}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-decoration-none"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir LFP Play Directo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER SECTION */}
      <div className="relative z-10 container mx-auto px-6 max-w-6xl py-6 space-y-6 text-left">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/35 px-4 py-2 rounded-2xl animate-pulse shadow-lg">
          <LiveBadge animate={true} text="PARTIDO EN VIVO" />
        </div>

        <div className="space-y-3 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none text-white">
            {liveMatch?.homeTeam || 'Jorge Newbery'} <span className="text-red-600">VS</span> {opponentName}
          </h1>
          <p className="text-zinc-300 text-sm md:text-base max-w-2xl font-light leading-relaxed">
            {displayDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handlePlayClick}
            className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-7 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_25px_rgba(220,38,38,0.5)] cursor-pointer"
          >
            <Video size={16} />
            <span>VER TRANSMISIÓN</span>
          </button>

          <button
            onClick={handleOpenLfpExternal}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <ExternalLink size={15} />
            <span>ABRIR EN LFP PLAY</span>
          </button>
        </div>
      </div>
    </section>
  );
}
