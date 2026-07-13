"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, Calendar, Users, Activity, PlayCircle, Eye, Newspaper, Video, Image as ImageIcon, Heart } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/config';

export default function CategoriaPage() {
  const params = useParams();
  const categoria = params.categoria; // e.g. "tercera", "escuelita", etc.

  // Mapear slug de categoría a nombre completo de DB
  const mappedCategories = {
    'tercera': { name: '3ra División', display: '3° División (Reserva)', type: 'Inferiores' },
    'cuarta': { name: '4ta División', display: '4° División', type: 'Inferiores' },
    'quinta': { name: '5ta División', display: '5° División', type: 'Inferiores' },
    'sexta': { name: '6ta División', display: '6° División', type: 'Inferiores' },
    'septima': { name: '7ma División', display: '7° División', type: 'Inferiores' },
    'octava': { name: '8va División', display: '8° División', type: 'Inferiores' },
    'escuelita': { name: 'Escuelita', display: 'Escuelita Futsal', type: 'Promocionales' },
    'pre-infantil': { name: 'Pre Infantil', display: 'Categorías Pre Infantiles', type: 'Promocionales' },
    'infantil': { name: 'Infantil', display: 'Categorías Infantiles', type: 'Promocionales' },
  };

  const catInfo = mappedCategories[categoria] || { name: 'Inferiores', display: 'Categoría Deportiva', type: 'Inferiores' };

  // Data states
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [media, setMedia] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected player for detail modal
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Team config for this category
      const resTeams = await fetch(`${API_URL}/api/teams`);
      if (resTeams.ok) {
        const teamsData = await resTeams.json();
        const activeTeam = teamsData.find(t => t.category === catInfo.name);
        setTeam(activeTeam || null);
      }

      // 2. Fetch Players
      const resPlayers = await fetch(`${API_URL}/api/players`);
      if (resPlayers.ok) {
        const playersData = await resPlayers.json();
        setPlayers(playersData.filter(p => p.category === catInfo.name));
      }

      // 3. Fetch Matches
      const resMatches = await fetch(`${API_URL}/api/matches`);
      if (resMatches.ok) {
        const matchesData = await resMatches.json();
        setMatches(matchesData.filter(m => m.category === catInfo.name));
      }

      // 4. Fetch Media
      const resMedia = await fetch(`${API_URL}/api/media`);
      if (resMedia.ok) {
        const mediaData = await resMedia.json();
        setMedia(mediaData.filter(m => m.category === catInfo.type));
      }

      // 5. Fetch News
      const resNews = await fetch(`${API_URL}/api/futsal-news`);
      if (resNews.ok) {
        const newsData = await resNews.json();
        setNews(newsData.filter(n => n.published && n.category === catInfo.type));
      }
    } catch (e) {
      console.warn("Failed fetching from backend, loading fallback content", e);
      // Fallback
      setPlayers(getFallbackPlayers(catInfo.name));
      setMatches(getFallbackMatches(catInfo.name));
      setMedia(fallbackMedia);
      setNews(fallbackNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoria]);

  // Featured junior match (with highlight video / details)
  const featuredMatch = matches.find(m => m.isFeatured) || matches.find(m => m.status === 'FINISHED') || matches[0];

  return (
    <div className="space-y-12 animate-fade-in text-jn-black">
      
      {/* Category banner card */}
      <div className="bg-gradient-to-r from-jn-black to-gray-900 border border-gray-150 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-wrap justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-jn-red/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <span className="bg-jn-red/20 text-jn-red border border-jn-red/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
            Módulo Futsal • {catInfo.type}
          </span>
          <h2 className="text-4xl font-black tracking-tight uppercase leading-none mt-2">{team?.name || catInfo.display}</h2>
          <p className="text-xs text-gray-400 font-medium">
            {team?.description || 'Formando campeones con valores, disciplina y trabajo en equipo.'}
          </p>
        </div>

        {/* Coach and Schedule details */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2.5 text-xs min-w-[260px] relative z-10">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Cuerpo Técnico</span>
            <span className="font-bold text-white">DT: {team?.coach || 'Por asignar'}</span>
            {team?.assistantCoach && <span className="block text-[10px] text-gray-300 font-semibold mt-0.5">AC: {team?.assistantCoach}</span>}
          </div>
          <div className="border-t border-white/5 pt-2.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Entrenamientos</span>
            <span className="font-semibold text-gray-200 block">{team?.trainingDays || 'Lunes, Miércoles, Viernes'}</span>
            <span className="text-[10px] text-gray-300 block">Horario: {team?.trainingSchedule || '18:30 a 20:00 hs'} | Sede: {team?.location || 'Sede Central'}</span>
          </div>
        </div>
      </div>

      {/* PARTIDO DESTACADO CATEGORÍA */}
      {featuredMatch && (
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm relative overflow-hidden space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
            <h3 className="text-base font-black uppercase text-jn-black flex items-center gap-1.5">
              <PlayCircle className="text-jn-red" size={18} /> Partido Destacado de {catInfo.name}
            </h3>
            <span className="text-[9px] font-black uppercase bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-250">
              {featuredMatch.competition}
            </span>
          </div>

          <div className="grid md:grid-cols-3 items-center gap-6 py-2 text-center text-xs">
            {/* Local */}
            <div className="space-y-1">
              <div className="w-14 h-14 bg-jn-black text-white font-black rounded-full flex items-center justify-center text-sm mx-auto shadow border border-gray-150">JN</div>
              <p className="font-bold text-sm text-jn-black">{featuredMatch.homeTeam}</p>
            </div>

            {/* Score */}
            <div className="space-y-1">
              {featuredMatch.status === 'FINISHED' ? (
                <div className="text-3xl font-black font-mono bg-jn-red/10 text-jn-red px-4 py-1.5 rounded-xl inline-block shadow-sm">
                  {featuredMatch.ourScore} - {featuredMatch.opponentScore}
                </div>
              ) : (
                <span className="text-sm font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">PRÓXIMO</span>
              )}
              <p className="text-[10px] text-gray-400 font-bold mt-1.5">{new Date(featuredMatch.date).toLocaleDateString()}</p>
            </div>

            {/* Visitante */}
            <div className="space-y-1">
              <div className="w-14 h-14 bg-gray-200 text-gray-500 font-black rounded-full flex items-center justify-center text-sm mx-auto shadow border border-gray-150">
                {featuredMatch.opponent.slice(0, 2).toUpperCase()}
              </div>
              <p className="font-bold text-sm text-gray-700">{featuredMatch.opponent}</p>
            </div>
          </div>

          {/* Highlight Summary or Video */}
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex-1 min-w-[200px]">
              <span className="text-[9px] text-gray-400 font-bold uppercase block">Resumen del Partido</span>
              <p className="text-gray-500 mt-1 font-medium italic">
                {featuredMatch.summary || 'Partido sumamente parejo donde los chicos mostraron un excelente nivel táctico y gran juego limpio.'}
              </p>
            </div>
            {featuredMatch.videoUrl && (
              <Link href={featuredMatch.videoUrl} target="_blank" className="flex items-center gap-1.5 bg-jn-black text-white hover:bg-jn-red px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-colors shadow">
                <PlayCircle size={14} /> Ver Video Resumen
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Dynamic contents: Plantel & Fixture */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Plantel (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black uppercase text-jn-black flex items-center gap-2">
            <Users className="text-jn-red" size={22} /> Plantel de Jugadores
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {players.map(p => (
              <div 
                key={p.id} 
                onClick={() => setSelectedPlayer(p)}
                className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center relative group"
              >
                <span className="absolute top-3 left-3 bg-jn-red/10 text-jn-red font-mono font-black text-[9px] w-5 h-5 rounded flex items-center justify-center border border-jn-red/20">
                  {p.dorsal}
                </span>
                
                <div className="w-12 h-12 rounded-full bg-jn-black text-white font-black text-sm flex items-center justify-center shadow-md mb-3 group-hover:scale-105 transition-transform border border-white/20">
                  {p.name[0]}{p.lastName[0]}
                </div>
                
                <h4 className="font-bold text-sm text-jn-black leading-tight">{p.name} {p.lastName}</h4>
                <p className="text-[10px] text-jn-red font-bold uppercase mt-1">{p.position}</p>
              </div>
            ))}
            {players.length === 0 && (
              <div className="col-span-3 bg-white border border-gray-150 rounded-2xl py-10 text-center text-gray-400 font-semibold">
                No hay jugadores registrados en esta categoría.
              </div>
            )}
          </div>
        </div>

        {/* Fixture & Resultados (1 Col) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xl font-black uppercase text-jn-black flex items-center gap-2">
            <Calendar className="text-jn-red" size={22} /> Partidos de la División
          </h3>
          
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {matches.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm space-y-3 text-xs">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                  <span>{new Date(m.date).toLocaleDateString()} • {m.timeSlot}hs</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    m.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.status === 'UPCOMING' ? 'Próximo' : 'Finalizado'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-jn-black">{m.homeTeam} vs {m.opponent}</span>
                  {m.status === 'FINISHED' && (
                    <span className="bg-jn-red text-white px-2 py-0.5 rounded font-mono font-black text-xs">
                      {m.ourScore} - {m.opponentScore}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div className="bg-white border border-gray-150 rounded-2xl py-10 text-center text-gray-400 font-semibold">
                No se agendaron partidos.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multimedia & Noticias de la División */}
      <div className="grid md:grid-cols-2 gap-8 border-t border-gray-150 pt-8">
        
        {/* Novedades Femeninas / Inferiores */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-jn-black flex items-center gap-2">
            <Newspaper className="text-jn-red" size={22} /> Novedades de la Categoría
          </h3>
          
          <div className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-2 text-xs">
                <h4 className="font-black text-base text-jn-black leading-snug">{item.title}</h4>
                <p className="text-gray-500 leading-relaxed font-medium">{item.description}</p>
                <span className="block text-[10px] text-gray-400 font-semibold pt-1">Publicado: {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {news.length === 0 && (
              <div className="bg-white border border-gray-150 rounded-2xl py-10 text-center text-gray-400 font-semibold">
                No hay novedades de esta categoría.
              </div>
            )}
          </div>
        </div>

        {/* Galería Multimedia */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-jn-black flex items-center gap-2">
            <Video className="text-jn-red" size={22} /> Fotos y Videos Recientes
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {media.map(m => (
              <div key={m.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url(${m.url})` }}></div>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                    {m.type === 'VIDEO' ? <PlayCircle size={32} /> : <ImageIcon size={24} />}
                  </div>
                </div>
                <div className="p-3 text-xs">
                  <h4 className="font-bold text-jn-black line-clamp-1">{m.title}</h4>
                </div>
              </div>
            ))}
            {media.length === 0 && (
              <div className="col-span-2 bg-white border border-gray-150 rounded-2xl py-10 text-center text-gray-400 font-semibold">
                No hay archivos cargados para esta sección.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLAYER MODAL DETAIL */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in text-jn-black">
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
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Biografía / Perfil</span>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {selectedPlayer.description || 'Ficha del semillero del Club Social y Deportivo Jorge Newbery. Entrena arduamente defendiendo los colores de la institución.'}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase block border-b border-gray-100 pb-1">Estadísticas de la Temporada</span>
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

// Fallback datasets for categories if offline
const getFallbackPlayers = (catName) => [
  { id: 501, name: "Thiago", lastName: "Medina", dorsal: 10, category: catName, position: "Ala", achievements: "Goleador, Compañero ⭐", matchesPlayed: 14, goals: 12, assists: 8, cleanSheets: 0, playerStatus: "ACTIVE", description: "Thiago es veloz de regate y tiene gran visión para habilitar a sus compañeros." },
  { id: 502, name: "Mateo", lastName: "Rossi", dorsal: 2, category: catName, position: "Cierre", achievements: "Fair Play ⭐", matchesPlayed: 12, goals: 3, assists: 9, cleanSheets: 0, playerStatus: "ACTIVE", description: "Defensor ordenado y firme desde el fondo, muy respetuoso con árbitros y rivales." },
  { id: 503, name: "Benjamín", lastName: "Fernández", dorsal: 1, category: catName, position: "Arquero", achievements: "Valla Invicta", matchesPlayed: 10, goals: 0, assists: 1, cleanSheets: 4, playerStatus: "ACTIVE", description: "Arquero ágil que domina muy bien el achique en jugadas de uno contra uno." }
];

const getFallbackMatches = (catName) => [
  { id: 601, category: catName, opponent: "River Plate", homeTeam: "Jorge Newbery", awayTeam: "River Plate", referee: "G. Vigliano", attendance: 120, date: "2026-06-20", timeSlot: "17:30", ourScore: 5, opponentScore: 3, status: "FINISHED", videoUrl: "https://youtube.com/watch?v=mock", summary: "Gran triunfo sobre el final con una ráfaga de goles de contraataque.", photoGallery: null, isFeatured: true, competition: "Torneo Oficial", venue: "Cancha Jorge Newbery", season: "2026" },
  { id: 602, category: catName, opponent: "Platense", homeTeam: "Jorge Newbery", awayTeam: "Platense", referee: "A. Beligoy", attendance: 80, date: "2026-07-12", timeSlot: "18:00", ourScore: null, opponentScore: null, status: "UPCOMING", videoUrl: null, summary: null, photoGallery: null, isFeatured: false, competition: "Torneo Oficial", venue: "Cancha Auxiliar Platense", season: "2026" }
];

const fallbackMedia = [
  { id: 701, type: "PHOTO", title: "Festejo del Equipo", url: "/images/fans.png", category: "Inferiores", description: "El equipo celebrando el triunfo en el vestuario." }
];

const fallbackNews = [
  { id: 801, title: "Próximo entrenamiento suspendido por lluvia", description: "El entrenamiento del miércoles se pasa a la cancha techada de parquet por malas condiciones climáticas.", category: "Inferiores", season: "2026", published: true }
];
