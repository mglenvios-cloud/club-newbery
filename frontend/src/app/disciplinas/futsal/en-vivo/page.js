"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Radio, Clock, Trophy, Users, Activity, ChevronLeft,
  PlayCircle, AlertCircle, Tv, Star, Shield,
  Target, RotateCcw, Timer, Zap, Award, Camera,
  MessageSquare, ChevronRight, Circle, Wifi, WifiOff
} from 'lucide-react';
import ClubShield from '@/components/ClubShield';

import { API_URL } from '@/config';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatCountdown = (targetDate) => {
  if (!targetDate) return null;
  const diff = new Date(targetDate) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
};

const eventIcon = (type) => {
  if (type === 'GOAL') return '⚽';
  if (type === 'YELLOW_CARD') return '🟨';
  if (type === 'RED_CARD') return '🟥';
  if (type === 'SUBSTITUTION') return '🔄';
  if (type === 'PERIOD_START') return '🎬';
  if (type === 'PERIOD_END') return '🏁';
  return '•';
};

const eventLabel = (ev, homeTeam, opponent) => {
  const team = ev.team === 'HOME' ? homeTeam : opponent;
  if (ev.type === 'GOAL') return `Gol de ${ev.playerName || 'Jugador'} (${team})${ev.detail ? ' — ' + ev.detail : ''}`;
  if (ev.type === 'YELLOW_CARD') return `Amarilla — ${ev.playerName || 'Jugador'} (${team})`;
  if (ev.type === 'RED_CARD') return `Roja — ${ev.playerName || 'Jugador'} (${team})`;
  if (ev.type === 'SUBSTITUTION') return `Cambio en ${team}: ${ev.playerName}${ev.detail ? ' → ' + ev.detail : ''}`;
  if (ev.type === 'PERIOD_START') return ev.detail || 'Inicio del período';
  if (ev.type === 'PERIOD_END') return ev.detail || 'Fin del período';
  return ev.detail || ev.type;
};

// ─── COMPONENTES PEQUEÑOS ───────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]">
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
      EN VIVO
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === 'LIVE') return <LiveBadge />;
  if (status === 'FINISHED') return (
    <span className="inline-flex items-center gap-1.5 bg-green-700/80 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
      <Trophy size={12} /> FINALIZADO
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 bg-yellow-600/80 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
      <Clock size={12} /> PRÓXIMO
    </span>
  );
}

function StatBar({ label, home, away, homeColor = '#ef4444', awayColor = '#6b7280' }) {
  const total = (home || 0) + (away || 0);
  const homePct = total > 0 ? Math.round(((home || 0) / total) * 100) : 50;
  const awayPct = 100 - homePct;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
        <span className="text-white">{home ?? '—'}</span>
        <span className="text-gray-400 uppercase tracking-wider text-[10px]">{label}</span>
        <span>{away ?? '—'}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-800">
        <div style={{ width: `${homePct}%`, backgroundColor: homeColor }} className="transition-all duration-700" />
        <div style={{ width: `${awayPct}%`, backgroundColor: awayColor }} className="transition-all duration-700" />
      </div>
    </div>
  );
}

function SponsorBanner({ sponsor }) {
  if (!sponsor?.active || !sponsor?.imageUrl) return null;
  return (
    <a href={sponsor.linkUrl || '#'} target="_blank" rel="noopener noreferrer"
      className="block w-full rounded-xl overflow-hidden border border-white/10 hover:border-jn-red/30 transition-colors mb-6">
      <img src={sponsor.imageUrl} alt="Publicidad" className="w-full max-h-24 object-cover" />
    </a>
  );
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-16 h-16 flex items-center justify-center text-2xl font-black text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────
export default function PartidoEnVivo() {
  const [liveData, setLiveData] = useState({ match: null, events: [] });
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [aiCommentary, setAiCommentary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingRef = useRef(null);
  const countdownRef = useRef(null);

  // ── Fetch datos del partido en vivo
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch(`/api/live`);
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        if (data.match?.aiCommentary) setAiCommentary(data.match.aiCommentary);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn('Error al cargar datos en vivo:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch sponsors
  const fetchSponsors = useCallback(async () => {
    try {
      const res = await fetch(`/api/integrations/lps/sponsors`);
      if (res.ok) setSponsors(await res.json());
    } catch {}
  }, []);

  // ── Generar relato IA
  const generateAI = async () => {
    if (!liveData.match) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`/api/live/${liveData.match.id}/ai-commentary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiCommentary(data.commentary);
      }
    } catch {}
    setLoadingAI(false);
  };

  // ── Generar resumen post-partido
  const generateSummary = async () => {
    if (!liveData.match) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`/api/live/${liveData.match.id}/auto-summary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLiveData(prev => ({ ...prev, match: { ...prev.match, autoSummary: data.summary } }));
      }
    } catch {}
    setLoadingAI(false);
  };

  useEffect(() => {
    fetchLiveData();
    fetchSponsors();
    // Polling cada 30s durante partido EN VIVO
    pollingRef.current = setInterval(() => {
      fetchLiveData();
    }, 30000);
    return () => clearInterval(pollingRef.current);
  }, [fetchLiveData, fetchSponsors]);

  // Cuenta regresiva para próximo partido
  useEffect(() => {
    if (liveData.match?.status === 'UPCOMING') {
      const tick = () => setCountdown(formatCountdown(liveData.match.date));
      tick();
      countdownRef.current = setInterval(tick, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [liveData.match]);

  const match = liveData.match;
  const events = liveData.events || [];

  const homeGoals = events.filter(e => e.type === 'GOAL' && e.team === 'HOME');
  const awayGoals = events.filter(e => e.type === 'GOAL' && e.team === 'AWAY');
  const yellowCards = events.filter(e => e.type === 'YELLOW_CARD');
  const redCards = events.filter(e => e.type === 'RED_CARD');
  const substitutions = events.filter(e => e.type === 'SUBSTITUTION');

  const homeYellow = yellowCards.filter(e => e.team === 'HOME').length;
  const awayYellow = yellowCards.filter(e => e.team === 'AWAY').length;
  const homeRed = redCards.filter(e => e.team === 'HOME').length;
  const awayRed = redCards.filter(e => e.team === 'AWAY').length;

  const sponsorHeader = sponsors.find(s => s.id === 'header');
  const sponsorBetweenStats = sponsors.find(s => s.id === 'between-stats');
  const sponsorBelowPlayer = sponsors.find(s => s.id === 'below-player');
  const sponsorFooter = sponsors.find(s => s.id === 'footer');

  // ── LOADING
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-jn-red border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cargando partido…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">

      {/* ── BACK NAV */}
      <div className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/disciplinas/futsal" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold">
            <ChevronLeft size={18} /> Futsal AFA
          </Link>
          <div className="flex items-center gap-3">
            {match?.status === 'LIVE' && <LiveBadge />}
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <Wifi size={12} className={match?.status === 'LIVE' ? 'text-green-500' : 'text-gray-600'} />
              {lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Sin datos'}
            </span>
          </div>
        </div>
      </div>

      {/* ── SIN PARTIDO */}
      {!match && (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          <WifiOff size={56} className="text-gray-700 mb-4" />
          <h2 className="text-2xl font-black text-gray-300 uppercase">Sin partido disponible</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-sm">No hay partidos en vivo ni próximos cargados en el sistema. El staff del club actualizará la información.</p>
          <Link href="/disciplinas/futsal" className="mt-8 inline-flex items-center gap-2 bg-jn-red text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider hover:scale-105 transition-transform">
            <ChevronLeft size={16} /> Volver a Futsal AFA
          </Link>
        </div>
      )}

      {match && (
        <>
          {/* ── SPONSOR HEADER */}
          {sponsorHeader?.active && sponsorHeader.imageUrl && (
            <div className="container mx-auto px-4 pt-4">
              <SponsorBanner sponsor={sponsorHeader} />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HEADER DEL PARTIDO                                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <section className={`relative overflow-hidden ${match.status === 'LIVE' ? 'border-b border-red-600/30' : 'border-b border-white/5'}`}>
            {/* Fondo dinámico */}
            <div className={`absolute inset-0 ${match.status === 'LIVE' ? 'bg-gradient-to-b from-red-950/40 via-[#0a0a0a] to-[#0a0a0a]' : match.status === 'FINISHED' ? 'bg-gradient-to-b from-green-950/20 via-[#0a0a0a] to-[#0a0a0a]' : 'bg-gradient-to-b from-yellow-950/20 via-[#0a0a0a] to-[#0a0a0a]'}`} />

            <div className="relative container mx-auto px-4 py-8 md:py-12">

              {/* Competencia + estado */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <StatusBadge status={match.status} />
                <span className="text-gray-400 text-sm font-bold">{match.competition}</span>
                {match.provider === 'LIGA_PRO_STUDIO' && (
                  <span className="bg-purple-900/60 border border-purple-600/40 text-purple-300 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                    Liga Pro Studio
                  </span>
                )}
              </div>

              {/* MARCADOR PRINCIPAL */}
              <div className="flex items-center justify-center gap-4 md:gap-10">

                {/* Equipo LOCAL */}
                <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
                  <ClubShield className="w-16 h-20 md:w-20 md:h-24 drop-shadow-[0_0_20px_rgba(211,47,47,0.5)]" animate={match.status === 'LIVE'} />
                  <span className="text-sm md:text-base font-black text-center uppercase tracking-tight leading-tight">
                    {match.homeTeam || 'Jorge Newbery'}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Local</span>
                </div>

                {/* MARCADOR */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 md:gap-5">
                    <span className={`text-6xl md:text-8xl font-black tabular-nums transition-all duration-500 ${match.status === 'LIVE' ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'text-white'}`}>
                      {match.ourScore ?? (match.status === 'UPCOMING' ? '-' : '0')}
                    </span>
                    <span className="text-3xl md:text-5xl font-black text-gray-600">—</span>
                    <span className="text-6xl md:text-8xl font-black tabular-nums text-gray-300">
                      {match.opponentScore ?? (match.status === 'UPCOMING' ? '-' : '0')}
                    </span>
                  </div>

                  {/* Cronómetro (solo EN VIVO) */}
                  {match.status === 'LIVE' && (
                    <div className="flex items-center gap-2 bg-red-900/30 border border-red-600/30 px-4 py-2 rounded-full">
                      <Timer size={14} className="text-red-400 animate-pulse" />
                      <span className="text-red-300 font-black text-lg tabular-nums">
                        {String(match.liveMinute || 0).padStart(2, '0')}'
                      </span>
                    </div>
                  )}

                  {/* Info del partido */}
                  <div className="text-center space-y-0.5 mt-1">
                    <p className="text-xs text-gray-500">{formatDate(match.date)}</p>
                    <p className="text-xs text-gray-500">{formatTime(match.date)} hs · {match.venue}</p>
                    {match.referee && <p className="text-xs text-gray-600">Árbitro: {match.referee}</p>}
                  </div>
                </div>

                {/* Equipo VISITANTE */}
                <div className="flex flex-col items-center gap-3 flex-1 max-w-[200px]">
                  <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
                    <Shield size={32} className="text-gray-500" />
                  </div>
                  <span className="text-sm md:text-base font-black text-center uppercase tracking-tight leading-tight text-gray-300">
                    {match.opponent}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Visitante</span>
                </div>
              </div>

              {/* ── CUENTA REGRESIVA para UPCOMING */}
              {match.status === 'UPCOMING' && countdown && (
                <div className="flex flex-col items-center mt-8 gap-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Comienza en</p>
                  <div className="flex gap-3">
                    {countdown.days > 0 && <CountdownUnit value={countdown.days} label="días" />}
                    <CountdownUnit value={countdown.hours} label="horas" />
                    <CountdownUnit value={countdown.mins} label="min" />
                    <CountdownUnit value={countdown.secs} label="seg" />
                  </div>
                </div>
              )}

              {/* ── BOTÓN VER TRANSMISIÓN (solo LIVE con liveStreamUrl) */}
              {match.status === 'LIVE' && match.liveStreamUrl && (
                <div className="flex justify-center mt-8">
                  <a
                    href={match.liveStreamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 bg-jn-red hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] hover:scale-105 transition-all"
                  >
                    <PlayCircle size={20} className="animate-pulse" />
                    Ver transmisión en vivo
                    <Tv size={16} className="opacity-60" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* ── SPONSOR DEBAJO DEL REPRODUCTOR */}
          {sponsorBelowPlayer?.active && sponsorBelowPlayer.imageUrl && (
            <div className="container mx-auto px-4 pt-6">
              <SponsorBanner sponsor={sponsorBelowPlayer} />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* GRID PRINCIPAL: TIMELINE + STATS                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── COLUMNA IZQUIERDA: TIMELINE + EVENTOS */}
            <div className="lg:col-span-2 space-y-6">

              {/* TIMELINE DEL PARTIDO */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                  <Activity size={14} className="text-jn-red" /> Línea de tiempo
                </h3>

                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Circle size={32} className="text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                      {match.status === 'UPCOMING' ? 'El partido aún no comenzó.' : 'Sin eventos registrados.'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Línea vertical */}
                    <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-800" />

                    <div className="space-y-3">
                      {events.map((ev, i) => (
                        <div key={ev.id || i} className="flex items-start gap-4 relative">
                          {/* Minuto */}
                          <div className="w-16 text-right flex-shrink-0">
                            <span className="text-xs font-black text-gray-500 tabular-nums">{ev.minute}'</span>
                          </div>
                          {/* Ícono */}
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10 bg-gray-900 rounded-full">
                            <span className="text-xs">{eventIcon(ev.type)}</span>
                          </div>
                          {/* Descripción */}
                          <div className={`flex-1 text-sm pb-3 ${ev.team === 'HOME' ? 'text-white font-bold' : 'text-gray-400'}`}>
                            {eventLabel(ev, match.homeTeam || 'Jorge Newbery', match.opponent)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* GOLES */}
              {(homeGoals.length > 0 || awayGoals.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Goles locales */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      ⚽ {match.homeTeam || 'Jorge Newbery'}
                    </h4>
                    {homeGoals.length === 0 ? (
                      <p className="text-gray-700 text-xs">Sin goles</p>
                    ) : homeGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                        <span className="text-jn-red text-xs font-black">{g.minute}'</span>
                        <span>{g.playerName || 'Jugador'}</span>
                        {g.detail && <span className="text-[10px] text-gray-500">({g.detail})</span>}
                      </div>
                    ))}
                  </div>
                  {/* Goles visitante */}
                  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      ⚽ {match.opponent}
                    </h4>
                    {awayGoals.length === 0 ? (
                      <p className="text-gray-700 text-xs">Sin goles</p>
                    ) : awayGoals.map((g, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-bold text-gray-300 mb-1">
                        <span className="text-gray-500 text-xs font-black">{g.minute}'</span>
                        <span>{g.playerName || 'Jugador'}</span>
                        {g.detail && <span className="text-[10px] text-gray-600">({g.detail})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TARJETAS + CAMBIOS */}
              {(yellowCards.length > 0 || redCards.length > 0 || substitutions.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tarjetas */}
                  {(yellowCards.length > 0 || redCards.length > 0) && (
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Tarjetas</h4>
                      {yellowCards.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-yellow-300 mb-1">
                          <span>🟨</span>
                          <span className="text-xs text-gray-500">{c.minute}'</span>
                          <span className="font-bold">{c.playerName}</span>
                          <span className="text-[10px] text-gray-600">({c.team === 'HOME' ? match.homeTeam : match.opponent})</span>
                        </div>
                      ))}
                      {redCards.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-400 mb-1">
                          <span>🟥</span>
                          <span className="text-xs text-gray-500">{c.minute}'</span>
                          <span className="font-bold">{c.playerName}</span>
                          <span className="text-[10px] text-gray-600">({c.team === 'HOME' ? match.homeTeam : match.opponent})</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Cambios */}
                  {substitutions.length > 0 && (
                    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Cambios</h4>
                      {substitutions.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                          <span>🔄</span>
                          <span className="text-xs text-gray-500">{s.minute}'</span>
                          <span className="font-bold text-white">{s.playerName}</span>
                          {s.detail && <><ChevronRight size={12} className="text-gray-600" /><span className="text-gray-400">{s.detail}</span></>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── RESUMEN POST-PARTIDO (solo FINISHED) */}
              {match.status === 'FINISHED' && (
                <div className="bg-gradient-to-br from-green-950/40 to-gray-900/60 border border-green-800/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-green-400 flex items-center gap-2">
                      <Trophy size={14} /> Resultado Final
                    </h3>
                    {!match.autoSummary && (
                      <button
                        onClick={generateSummary}
                        disabled={loadingAI}
                        className="text-xs bg-green-800/50 hover:bg-green-700/60 text-green-300 border border-green-700/40 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                      >
                        {loadingAI ? 'Generando…' : 'Generar crónica IA'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 py-4 mb-4">
                    <span className="text-3xl font-black text-white">{match.ourScore ?? 0}</span>
                    <span className="text-gray-600 font-bold">—</span>
                    <span className="text-3xl font-black text-gray-300">{match.opponentScore ?? 0}</span>
                  </div>

                  {match.autoSummary && (
                    <div className="bg-black/30 rounded-xl p-4">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{match.autoSummary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── COLUMNA DERECHA: ESTADÍSTICAS + RELATO IA */}
            <div className="space-y-6">

              {/* ESTADÍSTICAS */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                  <Activity size={14} className="text-jn-red" /> Estadísticas
                </h3>

                <StatBar label="Goles" home={match.ourScore ?? 0} away={match.opponentScore ?? 0} />
                <StatBar label="Amarillas" home={homeYellow} away={awayYellow} homeColor="#eab308" awayColor="#6b7280" />
                <StatBar label="Rojas" home={homeRed} away={awayRed} homeColor="#dc2626" awayColor="#6b7280" />
                <StatBar label="Cambios" home={substitutions.filter(s => s.team === 'HOME').length} away={substitutions.filter(s => s.team === 'AWAY').length} />

                {/* Faltas acumuladas (placeholder para LPS) */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Faltas acumuladas</p>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">—</span>
                    <span className="text-[10px] text-gray-600">Liga Pro Studio</span>
                    <span className="text-gray-400">—</span>
                  </div>
                </div>

                {/* Tiempo muerto */}
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Tiempo muerto</p>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-white">—</span>
                    <span className="text-[10px] text-gray-600">por equipo</span>
                    <span className="text-gray-400">—</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-700 mt-4 text-center">
                  Estadísticas avanzadas disponibles con Liga Pro Studio
                </p>
              </div>

              {/* SPONSOR ENTRE ESTADÍSTICAS */}
              {sponsorBetweenStats?.active && sponsorBetweenStats.imageUrl && (
                <SponsorBanner sponsor={sponsorBetweenStats} />
              )}

              {/* RELATO IA — NEWBERY IA */}
              <div className="bg-gradient-to-br from-[#1a0a0a] to-gray-900/60 border border-jn-red/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-jn-red flex items-center gap-2">
                    <Zap size={14} /> Newbery IA
                  </h3>
                  <button
                    onClick={generateAI}
                    disabled={loadingAI}
                    className="text-[10px] bg-jn-red/20 hover:bg-jn-red/30 text-jn-red border border-jn-red/30 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                  >
                    {loadingAI ? '…' : 'Actualizar'}
                  </button>
                </div>

                {aiCommentary ? (
                  <p className="text-gray-300 text-xs leading-relaxed">{aiCommentary}</p>
                ) : (
                  <div className="text-center py-6">
                    <MessageSquare size={28} className="text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-600 text-xs">Generá el relato del partido con IA</p>
                    <button
                      onClick={generateAI}
                      disabled={loadingAI}
                      className="mt-3 text-xs bg-jn-red text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loadingAI ? 'Generando…' : '✨ Generar relato'}
                    </button>
                  </div>
                )}
              </div>

              {/* Asistencia */}
              {match.attendance > 0 && (
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
                  <Users size={24} className="text-jn-red flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Asistencia</p>
                    <p className="text-xl font-black text-white">{match.attendance.toLocaleString('es-AR')}</p>
                    <p className="text-xs text-gray-600">espectadores</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── SPONSOR PIE DE PÁGINA */}
          {sponsorFooter?.active && sponsorFooter.imageUrl && (
            <div className="container mx-auto px-4 pb-6">
              <SponsorBanner sponsor={sponsorFooter} />
            </div>
          )}

          {/* ─── VOLVER */}
          <div className="container mx-auto px-4 pb-10 text-center">
            <Link href="/disciplinas/futsal" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-bold">
              <ChevronLeft size={16} /> Volver a Futsal AFA
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
