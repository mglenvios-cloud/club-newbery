"use client";

// Force rebuild Vercel 2026-08-10
import React, { useState } from 'react';
import { Radio, Copy, Check, Youtube, Trophy, ExternalLink, MonitorPlay, ShieldCheck, Calendar, Newspaper } from 'lucide-react';

export default function NewberyTvPage() {
  const DEFAULT_YT_LINK = 'https://youtu.be/clxMCC1Ovjw?si=SmkYXQSBta8VPFEH';
  const DEFAULT_LFP_LINK = 'https://www.lpfplay.com/page/684743a8b6b14151aae96cad';

  // State Card 1: YouTube / TV Link
  const [ytInputUrl, setYtInputUrl] = useState(DEFAULT_YT_LINK);
  const [ytCopied, setYtCopied] = useState(false);

  // State Card 2: LFP Play Link
  const [lfpInputUrl, setLfpInputUrl] = useState(DEFAULT_LFP_LINK);
  const [lfpCopied, setLfpCopied] = useState(false);

  // Active Player State
  const [activeStreamUrl, setActiveStreamUrl] = useState(DEFAULT_YT_LINK);
  const [activeTitle, setActiveTitle] = useState('Jorge Newbery vs San Lorenzo — Clásico Futsal AFA Primera A');
  const [activeCategory, setActiveCategory] = useState('LFP Fútbol / Futsal AFA');
  const [toast, setToast] = useState(null);

  // Filter States
  const [filterType, setFilterType] = useState('TODO');
  const [filterPlayer, setFilterPlayer] = useState('TODOS');

  const playersList = [
    'TODOS',
    'BELÉN MÉNDEZ',
    'CAMILA GÓMEZ',
    'DIEGO MARTÍNEZ',
    'FLORENCIA RUSSO',
    'GABRIEL PERALTA',
    'LUCAS GONZÁLEZ',
    'MATÍAS RODRÍGUEZ',
    'SEBASTIÁN LÓPEZ'
  ];

  const clubNews = [
    {
      category: 'FUTSAL',
      title: 'Inauguración de la nueva cancha de Futsal',
      description: 'El piso de parquet flotante de última generación ya está listo para todas las divisiones formativas e inferiores.',
      date: '10 de Agosto, 2026'
    },
    {
      category: 'PATÍN',
      title: 'Gran Medallero en el Metropolitano de Patín',
      description: 'Nuestras representantes consiguieron el Oro en la categoría grupal show en un certamen repleto de público.',
      date: '08 de Agosto, 2026'
    },
    {
      category: 'FUTSAL',
      title: 'Prueba de Jugadores para las Inferiores',
      description: 'Se abren las inscripciones y convocatorias para los chicos nacidos entre 2010 y 2018 para sumarse al club.',
      date: '05 de Agosto, 2026'
    }
  ];

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/clxMCC1Ovjw?autoplay=1&rel=0';
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return `https://www.youtube.com/embed/${trimmed}?autoplay=1&rel=0`;
    }
    const match = trimmed.match(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/);
    if (match && match[1] && match[1].length === 11) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return `https://www.youtube.com/embed/clxMCC1Ovjw?autoplay=1&rel=0`;
  };

  const handleCopyYtLink = () => {
    navigator.clipboard.writeText(ytInputUrl || DEFAULT_YT_LINK);
    setYtCopied(true);
    showNotification('¡Link de YouTube copiado!');
    setTimeout(() => setYtCopied(false), 2500);
  };

  const handleCopyLfpLink = () => {
    navigator.clipboard.writeText(lfpInputUrl || DEFAULT_LFP_LINK);
    setLfpCopied(true);
    showNotification('¡Link de LFP Play copiado!');
    setTimeout(() => setLfpCopied(false), 2500);
  };

  const handlePlayYtOnTv = (e) => {
    if (e) e.preventDefault();
    if (!ytInputUrl.trim()) return;

    setActiveStreamUrl(ytInputUrl.trim());
    setActiveTitle('Transmisión YouTube — Club TV');
    setActiveCategory('YouTube Stream');
    showNotification('Transmitiendo link en pantalla TV');
  };

  const handlePlayLfpOnTv = (e) => {
    if (e) e.preventDefault();
    if (!lfpInputUrl.trim()) return;

    setActiveStreamUrl(lfpInputUrl.trim());
    setActiveTitle('Transmisión Oficial — LFP Play Fútbol Argentina');
    setActiveCategory('LFP Play');
    showNotification('Transmitiendo LFP Play en pantalla TV');
  };

  const handleOpenLfpExternal = () => {
    const urlToOpen = lfpInputUrl.trim() || DEFAULT_LFP_LINK;
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    showNotification('Abriendo plataforma oficial LFP Play...');
  };

  const embedUrl = getYouTubeEmbedUrl(activeStreamUrl);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-red-600 selection:text-white pt-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-red-500/40 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 flex-1">
        {/* ENCABEZADO TITULAR DE NEWBERY TV */}
        <div className="text-center space-y-2 pb-2">
          <span className="px-3.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider">
            Transmisiones Oficiales & LFP Play
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            NEWBERY TV & LIGA PROFESIONAL (LFP)
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Selecciona enlaces de YouTube o ingresa al canal exclusivo de la Liga Profesional de Fútbol (LFP Play).
          </p>
        </div>

        {/* TARJETAS DUALES: CARD YOUTUBE Y CARD LFP PLAY */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TARJETA 1: COPIAR Y VER LINK DE YOUTUBE */}
          <div className="glass-card p-6 rounded-3xl border border-red-500/30 bg-slate-900/90 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-sm">Tarjeta 1: Link de YouTube / Video</h2>
                    <p className="text-[11px] text-slate-400">Copia y transmite cualquier link de YouTube a TV</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-bold">YouTube</span>
              </div>

              <form onSubmit={handlePlayYtOnTv} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Enlace o Link de YouTube:</label>
                  <input
                    type="text"
                    value={ytInputUrl}
                    onChange={(e) => setYtInputUrl(e.target.value)}
                    placeholder="Ej: https://youtu.be/clxMCC1Ovjw?si=SmkYXQSBta8VPFEH"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-red-500 focus:outline-none"
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
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <MonitorPlay className="w-4 h-4" />
                    <span>Ver en TV</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-2 text-[10px] text-slate-500 font-mono">
              Link activo: {ytInputUrl || DEFAULT_YT_LINK}
            </div>
          </div>

          {/* TARJETA 2: EXCLUSIVA Y APARTE PARA LFP PLAY */}
          <div className="glass-card p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900 to-amber-950/20 space-y-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <span>Tarjeta 2: Canal Exclusivo LFP PLAY</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">OFICIAL</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Liga Profesional de Fútbol Argentina — Plataforma LFP</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">LFP Play</span>
              </div>

              <form onSubmit={handlePlayLfpOnTv} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enlace Oficial LFP Play (Liga Profesional):</span>
                  </label>
                  <input
                    type="text"
                    value={lfpInputUrl}
                    onChange={(e) => setLfpInputUrl(e.target.value)}
                    placeholder="https://www.lpfplay.com/page/684743a8b6b14151aae96cad"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-200 font-mono text-xs focus:border-amber-400 focus:outline-none"
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
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir LFP Play Directo</span>
                  </button>

                  <button
                    type="submit"
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <MonitorPlay className="w-4 h-4 text-amber-400" />
                    <span>En TV</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="pt-2 text-[10px] text-amber-400/80 font-mono">
              Acceso directo a la Liga Profesional de Fútbol (LFP Argentina)
            </div>
          </div>
        </section>

        {/* PANTALLA PRINCIPAL DE TV PLAYER */}
        <section className="space-y-4">
          <div className="aspect-video bg-black rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
            <iframe
              src={embedUrl}
              title={activeTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="glass-card p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30 uppercase font-mono">
                  {activeCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Producción Liga Pro Studio • Conectado
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white">{activeTitle}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyYtLink}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                <Copy className="w-4 h-4 text-red-400" />
                <span>Copiar Link Activo</span>
              </button>

              <button
                onClick={handleOpenLfpExternal}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir en LFP Play</span>
              </button>
            </div>
          </div>
        </section>

        {/* PRÓXIMOS PARTIDOS & FICHA DE FECHA */}
        <section className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Próximos Partidos AFA Primera</span>
            </h3>
            <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-bold">AFA Primera</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Jorge Newbery (Local) vs San Lorenzo (Visita)</span>
                <h4 className="font-bold text-white text-sm">Clásico AFA Primera A</h4>
                <p className="text-xs text-slate-400">Microestadio Devoto — 23 de Julio, 2026</p>
              </div>
              <button
                onClick={() => showNotification('¡Recordatorio guardado!')}
                className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-600 hover:text-white transition-all"
              >
                Recordarme
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-mono">Jorge Newbery vs Atlanta</span>
                <h4 className="font-bold text-white text-sm">Resumen: Jorge Newbery vs Atlanta 3-1</h4>
                <p className="text-xs text-slate-400">Triunfo en Devoto con mejores jugadas</p>
              </div>
              <button
                onClick={() => handleCopyYtLink()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all"
              >
                Ver Resumen
              </button>
            </div>
          </div>
        </section>

        {/* FILTROS DE PLANTEL Y CATEGORÍAS */}
        <section className="space-y-4">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtro de Contenido:</span>
              {['TODO', 'Partidos', 'Resúmenes', 'Goles', 'Clips', 'Mejores Jugadas', 'Inferiores', 'Entrevistas', 'Históricos'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterType === type ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plantel:</span>
              {playersList.map((player) => (
                <button
                  key={player}
                  onClick={() => setFilterPlayer(player)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterPlayer === player ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {player}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CARTELERA DE NOVEDADES DEL CLUB */}
        <section className="space-y-4 pt-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-500" />
              <span>Cartelera de Novedades del Club</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Últimas noticias institucionales y anuncios de la sede.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clubNews.map((news, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2 hover:border-red-500/40 transition-all">
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 text-[10px] font-extrabold uppercase font-mono">
                  {news.category}
                </span>
                <h4 className="font-extrabold text-white text-sm">{news.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{news.description}</p>
                <span className="text-[10px] text-slate-500 font-mono block pt-2">{news.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Club Atlético Jorge Newbery — Plataforma Oficial Club TV & LFP PLAY
      </footer>
    </div>
  );
}
