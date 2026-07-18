"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, ChevronRight, Activity, PlayCircle, Eye, Newspaper, Video, Image as ImageIcon, Heart, Star, Award, Shield, AlertCircle, ExternalLink } from 'lucide-react';
import FutsalScene3D from '@/components/FutsalScene3D';
import ClubShield from '@/components/ClubShield';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiClient';

export default function FutsalAFA() {
  const [selectedDivision, setSelectedDivision] = useState("Primera Masculina"); // "Primera Masculina" or "Primera Femenina"
  const [activeTab, setActiveTab] = useState("plantel"); // plantel, fixture, stats, media, news

  // Data states
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [news, setNews] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected player for detail modal
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Players
      const resPlayers = await apiFetch('/api/players');
      const dataPlayers = resPlayers.ok ? await resPlayers.json() : [];
      setPlayers(dataPlayers.filter(p => p.team === 'Futsal AFA' || p.category.toLowerCase().includes('futsal')));

      // 2. Fetch Matches
      const resMatches = await apiFetch('/api/matches');
      const dataMatches = resMatches.ok ? await resMatches.json() : [];
      setMatches(dataMatches);

      // 3. Fetch News
      const resNews = await apiFetch('/api/futsal-news');
      const dataNews = resNews.ok ? await resNews.json() : [];
      setNews(dataNews.filter(n => n.published));

      // 4. Fetch Media
      const resMedia = await apiFetch('/api/media');
      const dataMedia = resMedia.ok ? await resMedia.json() : [];
      setMedia(dataMedia);

    } catch (e) {
      console.error('[Futsal] Error al cargar datos:', e.message);
      setPlayers([]);
      setMatches([]);
      setNews([]);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered data for the active division
  const divisionPlayers = players.filter(p => p.category === selectedDivision);
  const divisionMatches = matches.filter(m => m.category === selectedDivision);
  const divisionNews = news.filter(n => 
    (selectedDivision === "Primera Masculina" && n.category === "Primera Masculina") ||
    (selectedDivision === "Primera Femenina" && n.category === "Primera Femenina")
  );
  
  // Futsal general news for news section
  const primeraNews = news.filter(n => n.category.includes("Primera"));
  const inferioresNews = news.filter(n => n.category === "Inferiores");
  const promocionalesNews = news.filter(n => n.category === "Promocionales");

  const divisionMedia = media.filter(med => 
    (selectedDivision === "Primera Masculina" && med.category === "Primera") ||
    (selectedDivision === "Primera Femenina" && med.category === "Femenino")
  );

  // Proximo Partido Section
  const proximoPartido = divisionMatches.find(m => m.status === 'LIVE') ||
                         divisionMatches.find(m => m.status === 'UPCOMING') ||
                         divisionMatches.find(m => m.isFeatured) ||
                         divisionMatches[0];

  // Dynamic statistics calculations
  const topScorers = [...divisionPlayers]
    .filter(p => p.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  const topAssists = [...divisionPlayers]
    .filter(p => p.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  const topGoalkeepers = [...divisionPlayers]
    .filter(p => p.position === 'Arquero')
    .sort((a, b) => b.cleanSheets - a.cleanSheets)
    .slice(0, 5);

  const cardStats = [...divisionPlayers]
    .filter(p => p.yellowCards > 0 || p.redCards > 0)
    .sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2))
    .slice(0, 5);

  const standings = [
    { pos: 1, equipo: "Jorge Newbery", pts: 45, pj: 18, pg: 14, pe: 3, pp: 1, gf: 65, gc: 32 },
    { pos: 2, equipo: "17 de Agosto", pts: 42, pj: 18, pg: 13, pe: 3, pp: 2, gf: 58, gc: 38 },
    { pos: 3, equipo: "Boca Juniors", pts: 40, pj: 18, pg: 12, pe: 4, pp: 2, gf: 54, gc: 40 },
    { pos: 4, equipo: "San Lorenzo", pts: 38, pj: 18, pg: 11, pe: 5, pp: 2, gf: 50, gc: 42 },
    { pos: 5, equipo: "Pinocho", pts: 32, pj: 18, pg: 9, pe: 5, pp: 4, gf: 46, gc: 45 }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-jn-red selection:text-white pb-20 font-sans">
      
      {/* 1) HERO PRINCIPAL FUTSAL WITH BABYLON 3D */}
      <section className="relative h-[85vh] flex items-center bg-black overflow-hidden border-b border-jn-red/20">
        <FutsalScene3D />
        
        {/* Overlays for depth and contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jn-red via-transparent to-transparent z-20"></div>

        <div className="relative z-20 container mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-10">
          
          <div className="max-w-2xl space-y-6">
            {/* Escudo Jorge Newbery y Título */}
            <div className="flex items-center gap-4">
              <ClubShield className="w-16 h-20 drop-shadow-[0_0_15px_rgba(211,47,47,0.4)]" animate={true} />
              <div>
                <span className="bg-jn-red/10 text-jn-red border border-jn-red/25 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                  AFA OFICIAL
                </span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mt-2">
                  Primera División AFA
                </h1>
              </div>
            </div>
            
            {/* Frase */}
            <p className="text-xl md:text-2xl text-gray-300 font-black italic border-l-4 border-jn-red pl-4 py-1 tracking-wide uppercase">
              "La pasión no se negocia"
            </p>
            
            <p className="text-sm md:text-base text-gray-400 font-light max-w-lg leading-relaxed">
              Jorge Newbery compite en la máxima categoría del Futsal Argentino. Acompañá al primer equipo masculino y femenino en cada encuentro.
            </p>
            
            {/* ─── CENTRO DEL PARTIDO ─── */}
            <div className="pt-2 w-full">
              {proximoPartido ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-sm hover:border-jn-red/30 transition-all">

                  {/* Badge de estado */}
                  <div className="flex items-center justify-between">
                    {proximoPartido.status === 'LIVE' && (
                      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        EN VIVO
                      </span>
                    )}
                    {proximoPartido.status === 'UPCOMING' && (
                      <span className="inline-flex items-center gap-1 bg-yellow-600/70 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        <Calendar size={10} /> PRÓXIMO
                      </span>
                    )}
                    {proximoPartido.status === 'FINISHED' && (
                      <span className="inline-flex items-center gap-1 bg-green-700/70 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        <Trophy size={10} /> FINALIZADO
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{proximoPartido.competition}</span>
                  </div>

                  {/* Equipos y marcador */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <ClubShield className="w-10 h-12 drop-shadow-[0_0_10px_rgba(211,47,47,0.4)]" />
                      <span className="text-[10px] font-black text-white text-center leading-tight">
                        {proximoPartido.homeTeam || 'Jorge Newbery'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      {proximoPartido.status !== 'UPCOMING' ? (
                        <span className="text-2xl font-black text-white tabular-nums">
                          {proximoPartido.ourScore ?? 0} — {proximoPartido.opponentScore ?? 0}
                        </span>
                      ) : (
                        <span className="text-lg font-black text-gray-500">VS</span>
                      )}
                      {proximoPartido.status === 'LIVE' && (
                        <span className="text-[10px] text-red-400 font-black">{proximoPartido.liveMinute || 0}'</span>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-10 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                        <Shield size={18} className="text-gray-500" />
                      </div>
                      <span className="text-[10px] font-black text-gray-300 text-center leading-tight">
                        {proximoPartido.opponent}
                      </span>
                    </div>
                  </div>

                  {/* Info del partido */}
                  <div className="border-t border-white/5 pt-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Calendar size={10} />
                      {new Date(proximoPartido.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      &nbsp;·&nbsp;
                      {new Date(proximoPartido.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                    </div>
                    {proximoPartido.venue && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <Shield size={10} /> {proximoPartido.venue}
                      </div>
                    )}
                  </div>

                  {/* Botón Centro del Partido */}
                  <Link
                    href="/disciplinas/futsal/en-vivo"
                    className={`group relative flex items-center justify-center gap-2 w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all overflow-hidden ${
                      proximoPartido.status === 'LIVE'
                        ? 'bg-jn-red text-white shadow-[0_0_25px_rgba(211,47,47,0.4)] hover:shadow-[0_0_40px_rgba(211,47,47,0.6)] hover:scale-[1.02]'
                        : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                    }`}
                  >
                    {proximoPartido.status === 'LIVE' ? (
                      <><PlayCircle size={16} className="animate-pulse" /> Ver partido en vivo</>
                    ) : proximoPartido.status === 'FINISHED' ? (
                      <><Eye size={16} /> Ver estadísticas</>
                    ) : (
                      <><ChevronRight size={16} /> Ver Centro del Partido</>
                    )}
                  </Link>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <AlertCircle size={24} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">Sin partidos programados</p>
                </div>
              )}
            </div>
          </div>

          {/* Imagen del equipo representativa / Futsal Frame — solo si NO hay partido */}
          {!proximoPartido && (
          <div className="hidden lg:block w-[450px] aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group bg-gradient-to-br from-jn-black to-gray-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 space-y-1">
              <span className="text-[10px] font-black text-jn-red uppercase tracking-widest">TEMPORADA 2026</span>
              <h4 className="text-lg font-black uppercase text-white">Plantel de Primera División AFA</h4>
              <p className="text-xs text-gray-400">Club Social y Deportivo Jorge Newbery</p>
            </div>
          </div>
          )}

        </div>
      </section>

      {/* Main content grid */}
      <section className="relative z-30 container mx-auto px-6 md:px-12 -mt-10">
        
        {/* Tab Sub-Selector */}
        <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar bg-white/5 backdrop-blur-md p-2 rounded-2xl gap-1 mb-8">
          {[
            { id: 'plantel', label: 'Plantel Profesional', icon: <Users size={14} /> },
            { id: 'fixture', label: 'Calendario y Partidos', icon: <Calendar size={14} /> },
            { id: 'stats', label: 'Estadísticas del Equipo', icon: <Trophy size={14} /> },
            { id: 'media', label: 'Fotos y Videos', icon: <Video size={14} /> },
            { id: 'news', label: 'Novedades Futsal', icon: <Newspaper size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === t.id 
                  ? 'bg-jn-red text-white shadow-lg shadow-jn-red/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Division Selector (Masculina / Femenina) */}
        <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl max-w-sm mb-8">
          {["Primera Masculina", "Primera Femenina"].map(div => (
            <button
              key={div}
              onClick={() => { setSelectedDivision(div); }}
              className={`flex-1 py-2 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                selectedDivision === div 
                  ? 'bg-jn-red text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {div}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: 2) PLANTEL PROFESIONAL (TARJETAS DEPORTIVAS) */}
        {activeTab === 'plantel' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">Guerreros de Primera</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">Hacé clic en cualquier jugador para abrir su ficha digital completa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {divisionPlayers.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPlayer(p)}
                  className="bg-gradient-to-b from-gray-900 to-black rounded-3xl border border-white/10 overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(211,47,47,0.15)] hover:border-jn-red/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo container */}
                  <div className="aspect-[4/5] bg-gradient-to-t from-gray-950 to-gray-800 relative overflow-hidden flex items-end justify-center">
                    {/* Carbon mesh style texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    
                    {p.photoUrl ? (
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${p.photoUrl})` }}></div>
                    ) : (
                      <div className="font-black text-6xl text-white/5 select-none">{p.name[0]}{p.lastName[0]}</div>
                    )}

                    {/* Gradient Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                    {/* Dorsal */}
                    <div className="absolute top-4 left-4 bg-jn-red text-white font-black text-lg w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                      {p.dorsal}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        p.playerStatus === 'ACTIVE' ? 'bg-green-600/20 text-green-400 border-green-500/20' :
                        p.playerStatus === 'INJURED' ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/20' :
                        'bg-gray-800/30 text-gray-500 border-gray-700/20'
                      }`}>
                        {p.playerStatus === 'ACTIVE' ? 'Activo' : p.playerStatus === 'INJURED' ? 'Lesionado' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Stats overlay inside card */}
                    <div className="absolute bottom-0 w-full p-4 grid grid-cols-4 gap-1 text-center bg-black/75 backdrop-blur-sm border-t border-white/5">
                      <div>
                        <span className="text-[8px] text-gray-400 font-bold block">PJ</span>
                        <span className="font-bold text-xs text-white">{p.matchesPlayed}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 font-bold block">GOLES</span>
                        <span className="font-bold text-xs text-jn-red">{p.goals}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-400 font-bold block">ASIST</span>
                        <span className="font-bold text-xs text-blue-400">{p.assists}</span>
                      </div>
                      <div>
                        {p.position === 'Arquero' ? (
                          <>
                            <span className="text-[8px] text-gray-400 font-bold block">VI</span>
                            <span className="font-bold text-xs text-green-400">{p.cleanSheets}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[8px] text-gray-400 font-bold block">TARG</span>
                            <span className="font-bold text-xs text-yellow-500">{p.yellowCards + p.redCards}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name and position */}
                  <div className="p-5 bg-black/60">
                    <h4 className="font-black text-lg text-white leading-tight truncate">{p.name} {p.lastName}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-jn-red mt-1">{p.position}</p>
                  </div>
                </div>
              ))}
              {divisionPlayers.length === 0 && (
                <div className="col-span-4 bg-white/5 border border-white/10 rounded-3xl py-16 text-center text-gray-500 font-semibold">
                  No hay jugadores cargados en este plantel.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 3) PARTIDOS (SECCIÓN PRÓXIMO PARTIDO) */}
        {activeTab === 'fixture' && (
          <div className="space-y-8 animate-fade-in text-xs">
            
            {/* PRÓXIMO PARTIDO SECCIÓN */}
            {proximoPartido && (
              <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h4 className="text-sm font-black text-jn-red uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={18} /> Próximo Partido Oficial
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    proximoPartido.status === 'UPCOMING' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/25' :
                    proximoPartido.status === 'LIVE' ? 'bg-green-600 text-white animate-pulse' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {proximoPartido.status === 'UPCOMING' ? 'Próximo' : proximoPartido.status === 'LIVE' ? 'En Vivo 🔴' : 'Finalizado'}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 items-center gap-6 py-4 text-center">
                  <div>
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-black text-xl mx-auto shadow-md">JN</div>
                    <p className="font-black text-sm text-white mt-2">{proximoPartido.homeTeam}</p>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-jn-red">VS</span>
                    <p className="text-gray-400 font-semibold mt-1">{new Date(proximoPartido.date).toLocaleDateString()} • {proximoPartido.timeSlot}hs</p>
                    <p className="text-[9px] text-gray-500 uppercase font-bold">{proximoPartido.venue}</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-gray-800 text-gray-400 font-black rounded-full flex items-center justify-center text-xl mx-auto shadow-md">
                      {proximoPartido.opponent.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="font-black text-sm text-white mt-2">{proximoPartido.opponent}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between items-center flex-wrap gap-4 text-xs text-gray-400">
                  <span>Competencia: {proximoPartido.competition}</span>
                  {proximoPartido.liveStreamUrl || proximoPartido.provider === 'LIGA_PRO_STUDIO' ? (
                    <Link href={proximoPartido.liveStreamUrl || '#'} target="_blank" className="bg-jn-red hover:bg-jn-darkred text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl flex items-center gap-1.5 tracking-wider shadow shadow-jn-red/35">
                      <PlayCircle size={14} className="animate-pulse" /> VER TRANSMISIÓN
                    </Link>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Sin Transmisión Definida</span>
                  )}
                </div>
              </div>
            )}

            {/* Fixture Completo */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-jn-red border-b border-white/5 pb-2">Partidos Programados</h4>
                <div className="space-y-3">
                  {divisionMatches.filter(m => m.status === 'UPCOMING').map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <span className="bg-jn-red/10 text-jn-red font-black px-2 py-0.5 rounded text-[8px] uppercase">{m.competition}</span>
                        <p className="font-black text-sm text-white mt-2">{m.homeTeam} vs {m.opponent}</p>
                        <p className="text-gray-400 font-medium mt-1">Sede: {m.venue}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-jn-red">{m.timeSlot} hs</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(m.date).toLocaleDateString('es-AR')}</p>
                      </div>
                    </div>
                  ))}
                  {divisionMatches.filter(m => m.status === 'UPCOMING').length === 0 && (
                    <p className="text-gray-500 font-semibold py-8 text-center bg-white/5 rounded-2xl">No hay partidos programados próximamente.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase text-gray-400 border-b border-white/5 pb-2">Resultados Históricos</h4>
                <div className="space-y-3">
                  {divisionMatches.filter(m => m.status === 'FINISHED').map(m => (
                    <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                      <div>
                        <span className="bg-gray-800 text-gray-400 font-black px-2 py-0.5 rounded text-[8px] uppercase">{m.competition}</span>
                        <p className="font-black text-sm text-white mt-2">{m.homeTeam} vs {m.opponent}</p>
                        <p className="text-gray-400 font-medium mt-1">Árbitro: {m.referee || '-'}</p>
                      </div>
                      <div className="font-mono font-black text-base bg-jn-red text-white px-3.5 py-1.5 rounded-lg shadow">
                        {m.ourScore} - {m.opponentScore}
                      </div>
                    </div>
                  ))}
                  {divisionMatches.filter(m => m.status === 'FINISHED').length === 0 && (
                    <p className="text-gray-500 font-semibold py-8 text-center bg-white/5 rounded-2xl">No se registraron partidos finalizados aún.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: 4) ESTADÍSTICAS (BLOQUES VISUALES) */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in text-xs">
            
            {/* Standings list */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-black uppercase text-white mb-6 flex items-center gap-2">
                <Trophy className="text-jn-red" size={20} /> Tabla de Posiciones LFP Futsal AFA
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold">
                      <th className="py-3 text-left">#</th>
                      <th className="py-3">EQUIPO</th>
                      <th className="py-3 text-center">PJ</th>
                      <th className="py-3 text-center">PG</th>
                      <th className="py-3 text-center">PE</th>
                      <th className="py-3 text-center">PP</th>
                      <th className="py-3 text-center font-black text-jn-red">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map(s => (
                      <tr key={s.pos} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${s.equipo === 'Jorge Newbery' ? 'bg-jn-red/10 border-l-2 border-l-jn-red' : ''}`}>
                        <td className="py-3 pl-1 font-bold font-mono text-gray-400">{s.pos}</td>
                        <td className="py-3 font-bold text-white">{s.equipo}</td>
                        <td className="py-3 text-center text-gray-400 font-mono">{s.pj}</td>
                        <td className="py-3 text-center text-gray-400 font-mono">{s.pg}</td>
                        <td className="py-3 text-center text-gray-400 font-mono">{s.pe}</td>
                        <td className="py-3 text-center text-gray-400 font-mono">{s.pp}</td>
                        <td className="py-3 text-center font-black text-white text-sm font-mono">{s.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bloques visuales líderes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Máximos goleadores */}
              <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 rounded-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-jn-red border-b border-white/5 pb-2 mb-4">Máximos Goleadores</h4>
                <div className="space-y-4">
                  {topScorers.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-500">#{i+1}</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{p.name} {p.lastName[0]}.</span>
                      </div>
                      <span className="bg-jn-red/10 border border-jn-red/20 text-jn-red font-black font-mono px-2 py-0.5 rounded text-[10px]">
                        {p.goals} G
                      </span>
                    </div>
                  ))}
                  {topScorers.length === 0 && <p className="text-gray-500 py-2">Sin estadísticas.</p>}
                </div>
              </div>

              {/* Máximos asistentes */}
              <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 rounded-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-400 border-b border-white/5 pb-2 mb-4">Máximos Asistentes</h4>
                <div className="space-y-4">
                  {topAssists.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-500">#{i+1}</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{p.name} {p.lastName[0]}.</span>
                      </div>
                      <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black font-mono px-2 py-0.5 rounded text-[10px]">
                        {p.assists} A
                      </span>
                    </div>
                  ))}
                  {topAssists.length === 0 && <p className="text-gray-500 py-2">Sin estadísticas.</p>}
                </div>
              </div>

              {/* Tarjetas */}
              <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 rounded-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-yellow-500 border-b border-white/5 pb-2 mb-4">Tarjetas Acumuladas</h4>
                <div className="space-y-4">
                  {cardStats.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-500">#{i+1}</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{p.name} {p.lastName[0]}.</span>
                      </div>
                      <div className="flex gap-1.5 font-mono text-[9px] font-bold">
                        <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded">{p.yellowCards}</span>
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded">{p.redCards}</span>
                      </div>
                    </div>
                  ))}
                  {cardStats.length === 0 && <p className="text-gray-500 py-2">Sin estadísticas.</p>}
                </div>
              </div>

              {/* Arqueros destacados */}
              <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 rounded-3xl">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-green-400 border-b border-white/5 pb-2 mb-4">Arqueros (Valla Invicta)</h4>
                <div className="space-y-4">
                  {topGoalkeepers.map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-500">#{i+1}</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{p.name} {p.lastName[0]}.</span>
                      </div>
                      <span className="bg-green-600/10 border border-green-500/20 text-green-400 font-black font-mono px-2 py-0.5 rounded text-[10px]">
                        {p.cleanSheets} VI
                      </span>
                    </div>
                  ))}
                  {topGoalkeepers.length === 0 && <p className="text-gray-500 py-2">Sin estadísticas.</p>}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB CONTENT: 5) MULTIMEDIA (GALERÍA, VIDEOS, RESUMEN) */}
        {activeTab === 'media' && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Galería y Resúmenes</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {divisionMedia.map(m => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-jn-red/35 transition-all">
                  <div className="relative aspect-video bg-gray-950 overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${m.url})` }}></div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white/80 group-hover:text-jn-red transition-colors">
                      {m.type === 'VIDEO' ? <PlayCircle size={44} className="animate-pulse" /> : <ImageIcon size={32} />}
                    </div>
                  </div>
                  <div className="p-4 space-y-1">
                    <span className="text-[8px] text-jn-red font-black uppercase tracking-widest">{m.type}</span>
                    <h4 className="font-black text-base text-white">{m.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{m.description || 'Sin resumen de encuentro disponible.'}</p>
                  </div>
                </div>
              ))}
              {divisionMedia.length === 0 && (
                <div className="col-span-3 bg-white/5 border border-white/10 rounded-3xl py-16 text-center text-gray-500 font-semibold">
                  No hay archivos multimedia ni resúmenes cargados para esta división.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 6) NOTICIAS FUTSAL (PRIMERA, INFERIORES, PROMOCIONALES) */}
        {activeTab === 'news' && (
          <div className="space-y-10 animate-fade-in text-xs">
            
            {/* Primera News */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-jn-red border-b border-white/5 pb-2">Noticias Primera División</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {primeraNews.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-black text-base text-white leading-snug">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-xs line-clamp-3">{item.description}</p>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {primeraNews.length === 0 && <p className="text-gray-500 font-semibold col-span-2">No hay novedades para esta categoría.</p>}
              </div>
            </div>

            {/* Inferiores News */}
            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-black uppercase text-gray-400 border-b border-white/5 pb-2">Novedades del Semillero (Inferiores)</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {inferioresNews.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-black text-base text-white leading-snug">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-xs line-clamp-3">{item.description}</p>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {inferioresNews.length === 0 && <p className="text-gray-500 font-semibold col-span-2">No hay novedades registradas de inferiores.</p>}
              </div>
            </div>

            {/* Promocionales News */}
            <div className="space-y-4 pt-4">
              <h4 className="text-sm font-black uppercase text-gray-400 border-b border-white/5 pb-2">Novedades Promocionales y Escuelita</h4>
              <div className="grid md:grid-cols-2 gap-6">
                {promocionalesNews.map(item => (
                  <div key={item.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-black text-base text-white leading-snug">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-xs line-clamp-3">{item.description}</p>
                      <span className="block text-[9px] text-gray-500 font-bold uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {promocionalesNews.length === 0 && <p className="text-gray-500 font-semibold col-span-2">No hay novedades registradas de promocionales.</p>}
              </div>
            </div>

          </div>
        )}

        {/* 7) INFERIORES: EL SEMILLERO ACCESO VISUAL */}
        <div className="bg-gradient-to-r from-jn-black to-gray-950 border border-white/10 rounded-3xl p-8 shadow-2xl mt-16 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-jn-red/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-2 relative z-10 max-w-lg">
            <span className="bg-jn-red/10 text-jn-red border border-jn-red/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              EL SEMILLERO
            </span>
            <h3 className="text-3xl font-black uppercase text-white tracking-tight mt-2">MUNDO INFERIORES</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explorá y seguí de cerca las categorías menores y promocionales del Club Atlético Jorge Newbery. Entrenamientos, fixtures y planteles.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-[10px] font-black uppercase min-w-[280px]">
            {/* Division buttons */}
            <Link href="/disciplinas/futsal/inferiores/tercera" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">3ra</Link>
            <Link href="/disciplinas/futsal/inferiores/cuarta" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">4ta</Link>
            <Link href="/disciplinas/futsal/inferiores/quinta" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">5ta</Link>
            <Link href="/disciplinas/futsal/inferiores/sexta" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">6ta</Link>
            <Link href="/disciplinas/futsal/inferiores/septima" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">7ma</Link>
            <Link href="/disciplinas/futsal/inferiores/octava" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all">8va</Link>
            <Link href="/disciplinas/futsal/inferiores/escuelita" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all col-span-1">Escuelita</Link>
            <Link href="/disciplinas/futsal/inferiores/pre-infantil" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all col-span-1">Pre Inf</Link>
            <Link href="/disciplinas/futsal/inferiores/infantil" className="bg-white/5 border border-white/10 py-3.5 rounded-xl hover:bg-jn-red hover:text-white transition-all col-span-1">Infantil</Link>
          </div>
        </div>

      </section>

      {/* PLAYER DETAIL MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in text-jn-black">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10 relative">
              <div>
                <h3 className="font-black text-lg uppercase leading-none">{selectedPlayer.name} {selectedPlayer.lastName}</h3>
                <span className="text-jn-red font-black uppercase text-[10px] tracking-wider mt-1 block">{selectedPlayer.position} • Camiseta #{selectedPlayer.dorsal}</span>
              </div>
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="bg-white/15 hover:bg-jn-red text-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border border-white/10"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Perfil Técnico</span>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedPlayer.description || 'Ficha del semillero del Club Social y Deportivo Jorge Newbery. Entrena arduamente defendiendo los colores de la institución.'}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase block border-b border-gray-100 pb-1">Estadísticas Oficiales ({selectedPlayer.season})</span>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Partidos</span>
                    <span className="font-black text-sm text-jn-black">{selectedPlayer.matchesPlayed}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Goles</span>
                    <span className="font-black text-sm text-jn-red">{selectedPlayer.goals}</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Asistencias</span>
                    <span className="font-black text-sm text-blue-600">{selectedPlayer.assists}</span>
                  </div>
                  {selectedPlayer.position === 'Arquero' && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 col-span-3">
                      <span className="text-[9px] text-gray-400 font-bold uppercase block">Partidos con Valla Invicta</span>
                      <span className="font-black text-sm text-green-600">{selectedPlayer.cleanSheets}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 border-t border-gray-100 pt-4">
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Nacimiento</span>
                  <span>{selectedPlayer.birthDate ? new Date(selectedPlayer.birthDate).toLocaleDateString('es-AR') : 'No registrada'}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Tarjetas</span>
                  <span className="text-yellow-600">{selectedPlayer.yellowCards} Amarillas</span> • <span className="text-red-600">{selectedPlayer.redCards} Rojas</span>
                </div>
              </div>

              {selectedPlayer.achievements && (
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Insignias / Logros</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlayer.achievements.split(',').map((ach, idx) => (
                      <span key={idx} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 text-[9px] font-black px-2.5 py-1 rounded-full uppercase">
                        ✨ {ach.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


