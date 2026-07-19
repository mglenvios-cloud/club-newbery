"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayCircle, Users, Clock, Video, Calendar, Shield, X, Maximize2, Tv, ChevronRight, Award, User } from 'lucide-react';
import StatsPanel from '@/components/newbery-tv/StatsPanel';
import AIPanel from '@/components/newbery-tv/AIPanel';
import UpcomingMatches from '@/components/newbery-tv/UpcomingMatches';
import VideoLibrary from '@/components/newbery-tv/VideoLibrary';
import ContinueWatching from '@/components/newbery-tv/ContinueWatching';
import MostViewed from '@/components/newbery-tv/MostViewed';
import SponsorsCarousel from '@/components/newbery-tv/SponsorsCarousel';
import StreamingStatus from '@/components/newbery-tv/StreamingStatus';
import { config } from '@/components/newbery-tv/config';

import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiClient';

export default function NewberyTv() {
  const [media, setMedia] = useState([]);
  const [news, setNews] = useState([]);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(`/api/news`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error al cargar noticias en TV:", err);
      }
    }
    async function loadChannel() {
      try {
        const res = await fetch(`/api/newberytv/channel`);
        if (res.ok) {
          const data = await res.json();
          setChannel(data);
        }
      } catch (err) {
        console.error("Error al cargar canal en TV:", err);
      }
    }
    loadNews();
    loadChannel();
  }, []);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activePlayer, setActivePlayer] = useState('');
  const [activeSeason, setActiveSeason] = useState('ALL');
  const [activeCompetition, setActiveCompetition] = useState('ALL');
  const [activeDateOrder, setActiveDateOrder] = useState('DESC');
  const [players, setPlayers] = useState([]);
  const [liveMatch, setLiveMatch] = useState(null);
  const [loadingLive, setLoadingLive] = useState(true);

  // Active Video & Overlays
  const [activeVideo, setActiveVideo] = useState(null);
  const [preRollActive, setPreRollActive] = useState(false);
  const [preRollCountdown, setPreRollCountdown] = useState(5);
  const [overlayAdActive, setOverlayAdActive] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('Auto');
  const [cinemaMode, setCinemaMode] = useState(false);

  // Match stats loaded dynamically
  const [selectedMatchStats, setSelectedMatchStats] = useState(null);
  const [selectedMatchEvents, setSelectedMatchEvents] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // AI Summary
  const [aiSummary, setAiSummary] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const countdownRef = useRef(null);
  const videoRef = useRef(null);

  // Fetch Live Match
  const fetchLiveMatch = useCallback(async () => {
    try {
      const tvRes = await fetch(`/api/newberytv/livestreams`);
      if (tvRes.ok) {
        const streams = await tvRes.json();
        const activeStream = streams.find(s => s.status === 'EN_VIVO');
        if (activeStream) {
          // Map to liveMatch payload
          setLiveMatch({
            id: activeStream.id,
            homeTeam: activeStream.homeTeam,
            opponent: activeStream.awayTeam,
            competition: activeStream.competition,
            venue: activeStream.court || 'Microestadio Devoto',
            ourScore: activeStream.foulsHome % 5,
            opponentScore: activeStream.foulsAway % 3,
            attendance: activeStream.liveStream?.viewerCount || 150,
            liveMinute: activeStream.events?.length ? activeStream.events[activeStream.events.length - 1].minute : 0,
            status: 'LIVE',
            liveStreamUrl: activeStream.streamUrl,
            referee: activeStream.referee,
            addedTime: activeStream.addedTime,
            cardsYellowHome: activeStream.cardsYellowHome,
            cardsYellowAway: activeStream.cardsYellowAway,
            cardsRedHome: activeStream.cardsRedHome,
            cardsRedAway: activeStream.cardsRedAway,
            scorers: JSON.parse(activeStream.scorers || '[]'),
            cameraStatuses: activeStream.cameraStatuses,
            events: activeStream.events,
            sponsors: activeStream.sponsors
          });
          setLoadingLive(false);
          return;
        }
      }

      const res = await apiFetch('/api/live');
      if (res.ok) {
        const data = await res.json();
        if (data && data.match) {
          setLiveMatch(data.match);
        } else {
          setLiveMatch(null);
        }
      }
    } catch {
      console.error('[NewberyTV] Error al cargar partido en vivo.');
    } finally {
      setLoadingLive(false);
    }
  }, []);

  // Fetch Media Library
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/media?';
      if (activeCategory !== 'ALL') url += `category=${encodeURIComponent(activeCategory)}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (activePlayer) url += `playerId=${activePlayer}&`;
      if (activeSeason !== 'ALL') url += `season=${encodeURIComponent(activeSeason)}&`;
      if (activeCompetition !== 'ALL') url += `competition=${encodeURIComponent(activeCompetition)}&`;

      const res = await apiFetch(url);
      let data = [];
      if (res.ok) {
        data = await res.json();
      }

      // Fetch from Newbery TV module too!
      let tvUrl = '/api/newberytv/videos?';
      if (activeSeason !== 'ALL') tvUrl += `season=${encodeURIComponent(activeSeason)}&`;
      if (activeCategory !== 'ALL') tvUrl += `category=${encodeURIComponent(activeCategory)}&`;
      if (search) tvUrl += `search=${encodeURIComponent(search)}&`;
      
      const resTv = await apiFetch(tvUrl);
      if (resTv.ok) {
        const tvVideos = await resTv.json();
        const mappedTv = tvVideos.map(v => ({
          ...v,
          createdAt: v.createdAt || v.publishedAt
        }));
        data = [...mappedTv, ...data];
      }

      data.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return activeDateOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      });
      setMedia(data);
      if (data.length > 0) {
        setActiveVideo(prev => {
          if (!prev) {
            const selected = data.find(item => item.featured) || data[0];
            setPreRollActive(false);
            setOverlayAdActive(false);
            return selected;
          }
          return prev;
        });
      }
    } catch {
      console.error('[NewberyTV] Error al cargar multimedia.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search, activePlayer, activeSeason, activeCompetition, activeDateOrder]);

  // Fetch Players on Mount
  useEffect(() => {
    apiFetch('/api/players')
      .then(res => res.ok && res.json())
      .then(data => data && setPlayers(data))
      .catch(() => {});
  }, []);

  // Poll live match status every 15s
  useEffect(() => {
    fetchLiveMatch();
    const interval = setInterval(fetchLiveMatch, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveMatch]);

  // Fetch Media when filter states change
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  // Load Match stats for currently playing video if it has matchId
  useEffect(() => {
    if (!activeVideo || !activeVideo.matchId) {
      setSelectedMatchStats(null);
      setSelectedMatchEvents([]);
      return;
    }
    setLoadingStats(true);
    apiFetch(`/api/live/${activeVideo.matchId}`)
      .then(res => res.ok && res.json())
      .then(data => {
        if (data) {
          setSelectedMatchStats(data.match || null);
          setSelectedMatchEvents(data.events || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [activeVideo]);

  // Play Video Handlers (saving to localStorage for Resume Watch functionality)
  const handlePlayVideo = (item) => {
    apiFetch(`/api/media/${item.id}`).catch(() => {});
    setAiSummary('');
    setVideoSpeed(1);
    setVideoQuality('Auto');
    setPreRollCountdown(5);
    setPreRollActive(true);
    setOverlayAdActive(true);
    setActiveVideo(item);

    // Save to history list in localStorage
    try {
      const stored = localStorage.getItem('newbery_tv_history') || '[]';
      let historyList = JSON.parse(stored);
      historyList = historyList.filter(h => h.id !== item.id);
      historyList.unshift({ ...item, progress: 30, lastWatched: new Date().getTime() });
      localStorage.setItem('newbery_tv_history', JSON.stringify(historyList.slice(0, 10)));
    } catch {}

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setPreRollCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setPreRollActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipPreRoll = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setPreRollActive(false);
  };

  const handleSpeedChange = (speed) => {
    setVideoSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  };

  const handleJumpToSeconds = (seconds) => {
    if (videoRef.current) videoRef.current.currentTime = seconds;
  };

  const handleGenerateAiSummary = async (matchId) => {
    if (!matchId) return;
    setGeneratingAi(true);
    setAiSummary('');
    try {
      const res = await apiFetch(`/api/live/${matchId}/auto-summary`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      } else {
        setAiSummary('No se pudo generar la crónica en este momento. Inténtelo más tarde.');
      }
    } catch {
      setAiSummary('Error al conectar con Newbery IA.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const videoDestacado = media.find(item => item.featured) || media.find(item => item.type === 'VIDEO') || null;

  const isLive = liveMatch && liveMatch.status === 'LIVE';
  const hasMatchId = !!(activeVideo && activeVideo.matchId);
  
  const displayTitle = isLive 
    ? `${liveMatch.homeTeam} vs ${liveMatch.opponent}` 
    : (videoDestacado ? videoDestacado.title : "Newbery TV");
  
  const displayDesc = isLive 
    ? `Transmisión oficial en vivo del partido frente a ${liveMatch.opponent} por ${liveMatch.competition}.` 
    : (videoDestacado ? videoDestacado.description : config.subTitle);

  const displayCategory = isLive ? liveMatch.competition : (videoDestacado ? videoDestacado.category : "STREAMING");
  
  const handleHeroPlayClick = () => {
    if (isLive) {
      handlePlayVideo({
        id: `live-${liveMatch.id}`,
        title: `Transmisión en Vivo: Jorge Newbery vs ${liveMatch.opponent}`,
        url: liveMatch.liveStreamUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
        category: 'Partidos Completos',
        description: displayDesc,
        matchId: liveMatch.id,
        isLiveStream: true
      });
    } else if (videoDestacado) {
      handlePlayVideo(videoDestacado);
    }
  };

  return (
    <div className={`min-h-screen ${config.colors.bgDark} text-white pb-20`}>
      {/* 1. Hero Principal Profesional Estilo FIFA+ / TyC Sports Play */}
      <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center bg-black overflow-hidden border-b border-zinc-800">
        
        {/* Background Cover Image with Zoom Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 opacity-55 transform hover:scale-100 transition-transform duration-[10s] ease-out" 
          style={{ backgroundImage: `url('${config.defaultFallbackImage}')` }}
        ></div>

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/60 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/45 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(220,38,38,0.18),transparent_50%)] z-0"></div>

        <div className="relative z-10 container mx-auto px-6 max-w-6xl py-12 md:py-20 space-y-6 md:space-y-8 text-left animate-slide-up">
          
          {/* Badge EN VIVO */}
          {isLive ? (
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/35 px-4 py-2 rounded-2xl animate-pulse shadow-lg shadow-red-950/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black tracking-wider uppercase text-red-500">PARTIDO EN VIVO</span>
            </div>
          ) : (
            <span className="inline-block bg-red-955/50 border border-red-500/25 text-red-450 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest select-none">
              {displayCategory}
            </span>
          )}

          {/* Title */}
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
            
            <p className="text-zinc-350 text-sm md:text-base max-w-2xl font-light leading-relaxed drop-shadow-sm">
              {displayDesc}
            </p>
          </div>

          {/* Match Info Metadata Row */}
          {isLive ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-400 font-mono border-y border-white/5 py-4 w-fit select-none">
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-red-500 animate-pulse" />
                <span>MINUTO <strong className="text-white">{liveMatch.liveMinute || 0}'</strong></span>
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

          {/* Interactive CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            {(isLive || videoDestacado) && (
              <button
                onClick={handleHeroPlayClick}
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
                onClick={handleHeroPlayClick}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-white/30 backdrop-blur-md px-8 py-4 rounded-full font-black text-xs uppercase tracking-wider transition-all hover:scale-105 cursor-pointer"
              >
                <span>Ver Resumen</span>
              </button>
            )}
          </div>
        </div>

        {/* Local styled animation transition */}
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

      <div className="container mx-auto px-4 mt-8 space-y-12">
        {/* Discreto Indicador de Conexión */}
        <div className="flex justify-end items-center">
          <StreamingStatus isLive={liveMatch?.status === 'LIVE'} />
        </div>

        {/* 2. REPRODUCTOR PROFESIONAL SECCIÓN */}
        {activeVideo && (
          <div className="space-y-6">
            <div className={`grid grid-cols-1 ${cinemaMode || !hasMatchId ? 'lg:grid-cols-1' : 'lg:grid-cols-4'} gap-6 items-start`}>
              {/* Player Side */}
              <div className={`${cinemaMode || !hasMatchId ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6`}>
                <div className={`relative bg-black flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 rounded-3xl border border-zinc-800 ${
                  cinemaMode ? 'w-full lg:h-[65vh] h-[45vh]' : 'aspect-video w-full'
                }`}>
                  {/* HEADER CONTROL */}
                  <div className="absolute top-0 w-full z-30 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      {activeVideo.isLiveStream ? (
                        <div className="flex items-center gap-1.5 bg-red-600/10 border border-red-500/20 px-2 py-0.5 rounded">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                          </span>
                          <span className="text-[10px] font-black tracking-wider uppercase text-red-500">VIVO</span>
                        </div>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-black text-[8px] tracking-widest">
                          PLAYING
                        </span>
                      )}
                      <span className="text-white truncate max-w-sm drop-shadow-md">{activeVideo.title}</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveVideo(null);
                        setPreRollActive(false);
                        if (countdownRef.current) clearInterval(countdownRef.current);
                      }}
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
                          onClick={() => handleSpeedChange(s)}
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
                        onClick={() => {
                          const videoEl = videoRef.current;
                          if (videoEl) {
                            if (videoEl.requestFullscreen) {
                              videoEl.requestFullscreen();
                            } else if (videoEl.webkitRequestFullscreen) {
                              videoEl.webkitRequestFullscreen();
                            }
                          }
                        }}
                        className="p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                        title="Pantalla Completa"
                      >
                        <Maximize2 size={14} />
                        <span className="text-[9px]">Full</span>
                      </button>
                    </div>

                  </div>
                </div>
                
                {/* 3. Panel de Partido */}
                {activeVideo.isLiveStream && liveMatch && (
                  <div className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden select-none mb-6">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <div className="flex items-center gap-6 md:gap-12 flex-1 justify-center md:justify-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-sm border border-white/10 shadow-lg">
                          {liveMatch.homeTeam.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Local</span>
                          <h4 className="text-sm font-black uppercase text-white leading-none">{liveMatch.homeTeam}</h4>
                        </div>
                      </div>
                      <div className="text-sm font-black text-red-500 animate-pulse font-sans">VS</div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-900 text-zinc-350 rounded-full flex items-center justify-center font-black text-sm border border-white/10 shadow-lg">
                          {liveMatch.opponent.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="text-left">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Visita</span>
                          <h4 className="text-sm font-black uppercase text-white leading-none">{liveMatch.opponent}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-950/90 border border-zinc-800 px-6 py-3 rounded-2xl shadow-inner shrink-0">
                      <div className="text-center">
                        <span className="text-[8px] text-zinc-550 font-black uppercase block tracking-widest">Score</span>
                        <span className="text-2xl font-black text-white tracking-tighter font-mono">
                          {liveMatch.ourScore ?? 0} - {liveMatch.opponentScore ?? 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-1 shrink-0">
                      <div className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                        </span>
                        <span className="text-[9px] font-black tracking-wider uppercase text-red-500">EN VIVO</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 mt-1 font-bold">
                        <Clock size={12} className="text-red-500" />
                        MINUTO {liveMatch.liveMinute || 0}'
                      </span>
                    </div>
                  </div>
                )}

                {/* MatchInfo Panel */}
                {(() => {
                  const activeMatchInfo = selectedMatchStats || (activeVideo.isLiveStream ? liveMatch : null) || activeVideo;
                  const matchComp = activeMatchInfo?.competition || 'Torneo Oficial';
                  const matchVenue = activeMatchInfo?.venue || 'Cancha Jorge Newbery';
                  const matchReferee = activeMatchInfo?.referee || 'A designar por federación';
                  const matchDate = activeMatchInfo?.date ? new Date(activeMatchInfo.date).toLocaleDateString('es-AR') : 'A Confirmar';
                  const matchTimeSlot = activeMatchInfo?.timeSlot || 'Horario a confirmar';

                  return (
                    <div className="bg-[#111] border border-white/5 p-6 rounded-3xl space-y-4 shadow-lg select-none">
                      <h4 className="text-xs font-black uppercase tracking-widest text-jn-red border-b border-white/5 pb-2">
                        Ficha Técnica del Encuentro
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Competencia</span>
                          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                            <Award size={14} className="text-red-500 shrink-0" />
                            <span className="truncate">{matchComp}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Estadio / Sede</span>
                          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                            <Shield size={14} className="text-red-500 shrink-0" />
                            <span className="truncate">{matchVenue}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Árbitro</span>
                          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                            <User size={14} className="text-red-500 shrink-0" />
                            <span className="truncate">{matchReferee}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider block">Fecha y Hora</span>
                          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                            <Calendar size={14} className="text-red-500 shrink-0" />
                            <span className="truncate">{matchDate} · {matchTimeSlot}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Statistics and Timeline Side */}
              {hasMatchId && (
                <div className={`lg:col-span-1 bg-[#111] border border-white/5 rounded-3xl p-5 space-y-6 ${cinemaMode ? 'w-full' : ''}`}>
                  {/* Timeline */}
                  <div className="space-y-4 select-none">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Cronología del Partido</span>
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-black tracking-widest">TIMELINE</span>
                    </div>

                    {selectedMatchEvents.length === 0 ? (
                      <p className="text-[11px] text-zinc-500 italic py-4 text-center">No hay incidentes registrados en esta transmisión.</p>
                    ) : (
                      <div className="relative border-l border-zinc-800 pl-4 ml-2 space-y-4 pt-1 pb-1">
                        {selectedMatchEvents.map((evt) => {
                          let icon = '⚡';
                          const uppercaseType = (evt.type || '').toUpperCase();
                          if (uppercaseType.includes('GOL') || uppercaseType.includes('GOAL')) icon = '⚽';
                          else if (uppercaseType.includes('AMARILLA') || uppercaseType.includes('YELLOW')) icon = '🟨';
                          else if (uppercaseType.includes('ROJA') || uppercaseType.includes('RED')) icon = '🟥';
                          else if (uppercaseType.includes('CAMBIO') || uppercaseType.includes('SUB')) icon = '🔄';
                          else if (uppercaseType.includes('INICIO') || uppercaseType.includes('START')) icon = '⏱';
                          else if (uppercaseType.includes('FIN') || uppercaseType.includes('END')) icon = '🏁';

                          return (
                            <div 
                              key={evt.id} 
                              onClick={() => handleJumpToSeconds(evt.minute * 60)}
                              className="relative group cursor-pointer hover:bg-zinc-900/60 p-2.5 rounded-xl border border-transparent hover:border-zinc-800 transition-all duration-200"
                            >
                              <span className="absolute -left-[21px] top-3.5 w-2 h-2 bg-red-600 rounded-full group-hover:scale-125 transition-transform shadow-sm shadow-red-950/50" />
                              <div className="flex items-center justify-between gap-2 text-[10px]">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span className="font-mono text-red-500 font-black">{evt.minute}'</span>
                                  <span className="text-zinc-300">{icon}</span>
                                  <span className="text-[9px] font-black text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded uppercase tracking-wider">
                                    {evt.type}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-350 font-medium mt-1 leading-snug">
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
                  
                  {/* Stats Panel */}
                  <StatsPanel stats={selectedMatchStats} loading={loadingStats} />

                  {/* AI Panel */}
                  <AIPanel
                    matchId={selectedMatchStats?.id || activeVideo.matchId}
                    aiSummary={aiSummary}
                    generatingAi={generatingAi}
                    onGenerateAiSummary={handleGenerateAiSummary}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. Continuar viendo */}
        {config.modules.continueWatching && (
          <ContinueWatching onPlayVideo={handlePlayVideo} />
        )}

        {/* 10. Lo más visto */}
        {config.modules.mostViewed && (
          <MostViewed media={media} onPlayVideo={handlePlayVideo} />
        )}

        {/* 7. Próximas Transmisiones */}
        {config.modules.upcomingSchedule && (
          <UpcomingMatches />
        )}

        {/* 8. Biblioteca */}
        <VideoLibrary
          media={media}
          loading={loading}
          search={search}
          setSearch={setSearch}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activePlayer={activePlayer}
          setActivePlayer={setActivePlayer}
          activeSeason={activeSeason}
          setActiveSeason={setActiveSeason}
          activeCompetition={activeCompetition}
          setActiveCompetition={setActiveCompetition}
          activeDateOrder={activeDateOrder}
          setActiveDateOrder={setActiveDateOrder}
          players={players}
          onPlayVideo={handlePlayVideo}
        />
      </div>

      {/* 9. Novedades de la Cartelera en Newbery TV */}
      {news.length > 0 && (
        <div className="mt-16 border-t border-zinc-800 pt-16 max-w-6xl mx-auto px-6 text-left">
          <h3 className="text-xl font-bold uppercase tracking-wider mb-6 text-red-500 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-jn-red rounded"></span>
            Cartelera de Novedades del Club
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {news.map(item => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all duration-300">
                <div className="space-y-3">
                  {item.imageUrl && (
                    <div className="h-36 rounded-lg overflow-hidden border border-zinc-800 bg-black">
                      <img 
                        src={item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/') ? (item.imageUrl.startsWith('/') && !item.imageUrl.startsWith('/uploads') ? item.imageUrl : `${API_URL}${item.imageUrl}`) : item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  )}
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-955 px-2 py-0.5 rounded-full inline-block tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-100 leading-snug">{item.title}</h4>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed line-clamp-3">{item.content}</p>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  {new Date(item.createdAt).toLocaleDateString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. Sponsors carrusel */}
      {config.modules.sponsors && (
        <div className="mt-16">
          <SponsorsCarousel />
        </div>
      )}
    </div>
  );
}
