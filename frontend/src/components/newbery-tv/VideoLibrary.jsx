import React, { useState } from 'react';
import { Search, Film, Eye, PlayCircle, RefreshCw, Copy, Check, ExternalLink, Edit3 } from 'lucide-react';
import { config } from './config';
import { getCanonicalYouTubeUrl } from '@/lib/youtubeUtils';

export default function VideoLibrary({
  media = [],
  loading = false,
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  activePlayer,
  setActivePlayer,
  activeSeason,
  setActiveSeason,
  activeCompetition,
  setActiveCompetition,
  activeDateOrder,
  setActiveDateOrder,
  players = [],
  onPlayVideo,
  onEditVideo
}) {
  const [copiedId, setCopiedId] = useState(null);

  const libraryCategories = [
    { id: 'ALL', label: 'Todo' },
    { id: 'Partidos Completos', label: 'Partidos' },
    { id: 'Resúmenes', label: 'Resúmenes' },
    { id: 'Goles', label: 'Goles' },
    { id: 'Clips', label: 'Clips' },
    { id: 'Mejores Jugadas', label: 'Mejores Jugadas' },
    { id: 'Inferiores', label: 'Inferiores' },
    { id: 'Entrevistas', label: 'Entrevistas' },
    { id: 'Archivo Histórico', label: 'Históricos' }
  ];

  const handleCopy = (url, id, e) => {
    e.stopPropagation();
    const canonical = getCanonicalYouTubeUrl(url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    navigator.clipboard.writeText(canonical);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const lpfPlayUrl = "https://www.lpfplay.com/page/684743a8b6b14151aae96cad";

  return (
    <div className="space-y-6">
      
      {/* SECTOR DE FILTROS & BÚSQUEDA */}
      <div className="bg-[#111] border border-white/5 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2 select-none">
            <Search size={14} /> Filtros de Biblioteca & Partidos
          </h3>
          
          {/* Buscador de Texto */}
          <div className="relative w-full md:max-w-xs">
            <input
              type="text"
              placeholder="Buscar rival, gol o fecha..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-3 pr-4 py-2 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-600 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Categories sliding pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {libraryCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                activeCategory === c.id 
                  ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-950/20' 
                  : 'bg-black border-white/15 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Avanzados Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          {/* Jugador */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Plantel</label>
            <select
              value={activePlayer}
              onChange={e => setActivePlayer(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
            >
              <option value="">TODOS</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name.toUpperCase()} {p.lastName.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Temporada */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Temporada</label>
            <select
              value={activeSeason}
              onChange={e => setActiveSeason(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
            >
              <option value="ALL">TODAS</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Competencia */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Competencia</label>
            <select
              value={activeCompetition}
              onChange={e => setActiveCompetition(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
            >
              <option value="ALL">TODAS</option>
              <option value="Primera AFA">Primera AFA</option>
              <option value="Copa Argentina">Copa Argentina</option>
            </select>
          </div>

          {/* Fecha Orden */}
          <div className="space-y-1">
            <label className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Fecha</label>
            <select
              value={activeDateOrder}
              onChange={e => setActiveDateOrder(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white focus:outline-none"
            >
              <option value="DESC">Más nuevos primero</option>
              <option value="ASC">Más viejos primero</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID DE VIDEOS */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-zinc-500 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin text-red-500" size={16} /> Cargando biblioteca...
          </div>
        ) : media.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs italic select-none">
            No se encontraron videos con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => {
              const canonicalUrl = getCanonicalYouTubeUrl(item.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
              const displayThumb = item.thumbnail || item.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=450&fit=crop';

              return (
                <div 
                  key={item.id} 
                  className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg group hover:border-red-600/35 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                      <button
                        onClick={() => onPlayVideo(item)}
                        className="absolute z-10 p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg group-hover:scale-110 transition-all cursor-pointer"
                      >
                        <PlayCircle size={22} />
                      </button>

                      <img src={displayThumb} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                      
                      <span className="absolute bottom-2 left-2 text-[8px] bg-black/80 px-2 py-0.5 rounded font-black text-zinc-300 uppercase tracking-widest border border-white/5">
                        {item.category || 'STREAMING'}
                      </span>
                    </div>
                    
                    <div className="p-4 space-y-2 text-left">
                      <h4 className="font-black text-xs uppercase text-white leading-snug group-hover:text-red-500 transition-colors truncate">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta con Botones de Acción */}
                  <div className="p-4 pt-2 border-t border-white/5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleCopy(item.url, item.id, e)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copiar enlace de YouTube"
                        >
                          {copiedId === item.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-red-400" />}
                          <span>{copiedId === item.id ? '¡Copiado!' : 'Copiar Link'}</span>
                        </button>

                        {onEditVideo && (
                          <button
                            onClick={() => onEditVideo(item)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Modificar enlace de este partido"
                          >
                            <Edit3 size={11} />
                            <span>Modificar</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-500/20"
                          title="Abrir directamente en YouTube"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <a
                          href={lpfPlayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900 text-blue-300 border border-blue-400/20"
                          title="Ver en LPF Play"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
