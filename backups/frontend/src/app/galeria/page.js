"use client";
import React, { useState } from 'react';
import { Search, PlayCircle, Eye, Calendar, Tag, Filter } from 'lucide-react';
import ClubShield from '@/components/ClubShield';

export default function GalleryPage() {
  const [filterDiscipline, setFilterDiscipline] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null); // null or media object

  const mediaItems = [
    { id: 1, type: "PHOTO", discipline: "FUTSAL", category: "INFANTIL", title: "Entrenamiento Categoría 2017", date: "2026-06-18", url: "/images/action.png", desc: "Los chicos entrenando regates y pases cortos en la cancha parquet." },
    { id: 2, type: "VIDEO", discipline: "PATIN", category: "CADETE", title: "Resumen Exhibición Solos", date: "2026-06-15", url: "/images/futsal_hero.png", desc: "Las coreografías de competición de nuestras patinadoras." },
    { id: 4, type: "VIDEO", discipline: "FUTSAL", category: "PRIMERA", title: "Goles del triunfo vs San Lorenzo", date: "2026-06-10", url: "/images/action.png", desc: "Resumen con los 4 goles oficiales del partido de primera división AFA." },
    { id: 5, type: "PHOTO", discipline: "VOLEY", category: "INFANTIL", title: "Encuentro Mini-Vóley", date: "2026-06-08", url: "/images/futsal_hero.png", desc: "El semillero de vóley jugando en la sede central con clubes vecinos." }
  ];

  const filtered = mediaItems.filter(item => {
    const matchesDiscipline = filterDiscipline === "ALL" || item.discipline === filterDiscipline;
    const matchesCategory = filterCategory === "ALL" || item.category === filterCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiscipline && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header */}
      <div className="bg-jn-black text-white py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <ClubShield className="w-14 h-16" animate={false} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">GALERÍA MULTIMEDIA</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Fotos, videos, entrevistas e historias destacadas de todas nuestras disciplinas.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-8">
        
        {/* BARRA DE FILTROS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            
            {/* Buscador */}
            <div className="relative w-full max-w-[240px]">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar multimedia..." 
                className="pl-9 pr-4 py-2 text-xs border border-gray-250 rounded-lg focus:outline-none w-full" 
              />
            </div>

            {/* Disciplina */}
            <div>
              <select 
                value={filterDiscipline} 
                onChange={e => setFilterDiscipline(e.target.value)}
                className="p-2 border border-gray-250 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 focus:outline-none"
              >
                <option value="ALL">Todas las disciplinas</option>
                <option value="FUTSAL">Futsal AFA</option>
                <option value="PATIN">Patín Artístico</option>
                <option value="VOLEY">Vóley</option>
              </select>
            </div>

            {/* Categoría */}
            <div>
              <select 
                value={filterCategory} 
                onChange={e => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-250 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 focus:outline-none"
              >
                <option value="ALL">Todas las edades</option>
                <option value="INFANTIL">Infantiles (5 a 12 años)</option>
                <option value="CADETE">Cadetes (13 a 17 años)</option>
                <option value="PRIMERA">Primera División</option>
              </select>
            </div>

          </div>
          
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Mostrando {filtered.length} archivos
          </span>
        </div>

        {/* REJILLA MULTIMEDIA */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-150 py-16 text-center text-gray-500 rounded-3xl font-semibold">
            No se encontraron archivos multimedia con los filtros seleccionados.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                    style={{ backgroundImage: `url('${item.url}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Icono de tipo */}
                  <div className="absolute inset-0 flex items-center justify-center text-white/90 group-hover:text-jn-red transition-colors">
                    {item.type === 'VIDEO' ? <PlayCircle size={48} className="animate-pulse" /> : <Eye size={36} />}
                  </div>

                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="bg-jn-black text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.discipline}
                    </span>
                    <span className="bg-jn-red text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(item.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <h3 className="font-black text-base text-jn-black leading-snug group-hover:text-jn-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL VISOR DE DETALLES */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in text-jn-black">
            <div className="relative aspect-video bg-jn-black flex items-center justify-center">
              {/* Cierre */}
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full z-25 text-sm font-black border border-white/10"
              >
                &times; Cerra
              </button>

              {/* Contenido Visual */}
              <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('${selectedMedia.url}')` }}
              ></div>
              
              {selectedMedia.type === 'VIDEO' && (
                <div className="relative z-10 text-white flex flex-col items-center gap-2 cursor-pointer bg-black/40 p-4 rounded-xl">
                  <PlayCircle size={64} className="text-jn-red animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Reproducir Resumen</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <span className="bg-jn-red text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{selectedMedia.discipline}</span>
                <span className="bg-jn-black text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{selectedMedia.category}</span>
              </div>
              <h3 className="font-black text-2xl leading-none text-jn-black">{selectedMedia.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedMedia.desc}</p>
              
              <div className="border-t border-gray-150 pt-4 flex justify-between items-center text-xs text-gray-400">
                <span>Subido por: Administración Deportiva</span>
                <span>Fecha: {new Date(selectedMedia.date).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
