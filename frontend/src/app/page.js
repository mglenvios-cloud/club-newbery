"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { ChevronRight, Calendar, Users, Activity, Newspaper, Trophy, PlayCircle, Heart, Star, Sparkles, ExternalLink, ArrowRight, Tv } from "lucide-react";
import dynamic from 'next/dynamic';
import ClubShield from "@/components/ClubShield";

const Newbery3DHero = dynamic(() => import('@/components/Newbery3DHero'), { ssr: false });

import { API_URL } from '@/config';

export default function Home() {
  const [activeTabCalendar, setActiveTabCalendar] = useState("Lunes");

  // Frases Motivacionales
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const frases = [
    "El único rival a vencer es tu propio límite. ¡Vamos Newbery!",
    "El talento gana partidos, pero el trabajo en equipo gana campeonatos.",
    "El esfuerzo de hoy es el orgullo de mañana. ¡Dale Semillero!",
    "Fair Play: Ser un buen compañero es la victoria más grande."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % frases.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Carga de Noticias Reales del Backend
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Sponsor Principal
  const [sponsorPrincipal, setSponsorPrincipal] = useState(null);

  // Multimedia Newbery TV en Home
  const [homeMedia, setHomeMedia] = useState({
    ultimoVideo: null,
    ultimoResumen: null,
    ultimaGaleria: null,
    partidoDestacado: null,
    videoDestacado: null
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(API_URL + '/api/news');
        if (res.ok) {
          const data = await res.json();
          // Filtrar noticias para excluir disciplinas no activas en el club
          const filtered = data.filter(item => item.category !== 'BASQUET' && item.category !== 'HOCKEY');
          setNews(filtered.slice(0, 3));
        } else {
          setNews(defaultFallbackNews);
        }
      } catch (e) {
        console.warn("Backend offline, usando novedades predefinidas.");
        setNews(defaultFallbackNews);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Cargar Sponsor Principal y Multimedia de Home
  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const res = await fetch(`${API_URL}/api/publicidad/sponsors?category=PRINCIPAL&active=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setSponsorPrincipal(data[0]);
        }
      } catch {}
    };

    const fetchHomeMedia = async () => {
      try {
        const res = await fetch(`${API_URL}/api/media`);
        if (res.ok) {
          const data = await res.json();
          const videos = data.filter(d => d.type === 'VIDEO');
          const fotos = data.filter(d => d.type === 'PHOTO');
          
          setHomeMedia({
            ultimoVideo: videos[0] || null,
            ultimoResumen: videos.find(v => v.category === 'Resúmenes') || videos[1] || null,
            ultimaGaleria: fotos[0] || null,
            partidoDestacado: videos.find(v => v.category === 'Partidos Completos') || videos[0] || null,
            videoDestacado: videos.find(v => v.category === 'Entrevistas' || v.category === 'Detrás de Escena') || videos[2] || null
          });
        }
      } catch {}
    };

    fetchSponsor();
    fetchHomeMedia();
  }, []);

  const handleSponsorClick = async () => {
    if (!sponsorPrincipal) return;
    try {
      await fetch(`${API_URL}/api/publicidad/sponsors/${sponsorPrincipal.id}/click`, { method: 'POST' });
    } catch {}
    if (sponsorPrincipal.website) window.open(sponsorPrincipal.website, '_blank', 'noopener noreferrer');
  };

  const defaultFallbackNews = [
    { id: 1, title: "Inauguración de la nueva cancha de Futsal", content: "Piso sintético de última generación ya está listo para todas las divisiones inferiores del club.", category: "FUTSAL", tag: "IMPORTANTE" },
    { id: 2, title: "Gran Medallero en el Festival Metropolitano de Patín", content: "Nuestras chicas de Patín Artístico se llevaron el Oro en la categoría grupal show.", category: "PATIN", tag: "LOGRO" },
    { id: 3, title: "Futsal AFA: Gran convocatoria al plantel profesional", content: "Abiertas las pruebas de jugadores para inferiores y primera división.", category: "FUTSAL", tag: "EVENTO" }
  ];

  // Datos del Calendario de Actividades
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const actividades = {
    "Lunes": [
      { hora: "17:30hs", deporte: "Futsal Infantil", cat: "Cat. 2016/17", lugar: "Cancha Parquet" },
      { hora: "19:30hs", deporte: "Patín Competición", cat: "Grupo Show", lugar: "Salón Central" }
    ],
    "Martes": [
      { hora: "17:30hs", deporte: "Vóley Femenino", cat: "Sub-13", lugar: "Cancha 2" },
      { hora: "18:30hs", deporte: "Artes Marciales", cat: "Taekwondo Inicial", lugar: "Salón Artes Marciales" },
      { hora: "20:00hs", deporte: "Futsal Primera AFA", cat: "Primera", lugar: "Cancha Parquet" }
    ],
    "Miércoles": [
      { hora: "17:30hs", deporte: "Futsal Infantil", cat: "Cat. 2016/17", lugar: "Cancha Parquet" },
      { hora: "19:30hs", deporte: "Patín Competición", cat: "Grupo Show", lugar: "Salón Central" }
    ],
    "Jueves": [
      { hora: "17:30hs", deporte: "Vóley Femenino", cat: "Sub-13", lugar: "Cancha 2" },
      { hora: "18:30hs", deporte: "Artes Marciales", cat: "Taekwondo Inicial", lugar: "Salón Artes Marciales" },
      { hora: "20:00hs", deporte: "Futsal Primera AFA", cat: "Primera", lugar: "Cancha Parquet" }
    ],
    "Viernes": [
      { hora: "19:00hs", deporte: "Taekwondo Adultos", cat: "Avanzados", lugar: "Salón Artes Marciales" },
      { hora: "20:30hs", deporte: "Futsal Femenino", cat: "Primera", lugar: "Cancha Parquet" }
    ],
    "Sábado": [
      { hora: "09:00hs", deporte: "Encuentro Semillero Futsal", cat: "Categorías 2018 a 2021", lugar: "Sede Central" },
      { hora: "14:00hs", deporte: "Competencia de Patín", cat: "Todas las edades", lugar: "Salón Central" },
      { hora: "18:00hs", deporte: "Tercer Tiempo Familiar", cat: "Todo el Club", lugar: "Buffet" }
    ]
  };

  return (
    <div className="min-h-screen bg-jn-white text-jn-black">
      
      {/* 1. Hero Section Premium con Babylon.js 3D y 2. Botón VER PARTIDO EN VIVO, 3. Botón NEWBERY TV */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-jn-black">
        {/* Babylon 3D Canvas Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Newbery3DHero />
        </div>
        
        {/* Capa de oscurecimiento suave para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>

        <div className="relative z-20 text-center px-4 container mx-auto animate-fade-in space-y-6 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-jn-red text-white text-[10px] font-black uppercase tracking-widest select-none">
            CLUB JORGE NEWBERY • VILLA DEVOTO
          </span>
          <h2 className="text-5xl md:text-8xl font-black text-jn-white tracking-tight drop-shadow-lg leading-none uppercase select-none">
            PASIÓN Y <span className="text-jn-red">FUTSAL</span>.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed select-none">
            Bienvenido al portal oficial. Pioneros en **Futsal AFA**, deporte, educación y valores comunitarios en un solo lugar.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4 pointer-events-auto">
            <Link href="/disciplinas/futsal/en-vivo" className="group flex items-center gap-2 bg-jn-red hover:bg-jn-darkred text-white px-8 py-3.5 rounded-full font-black text-sm transition-all shadow-[0_0_25px_rgba(211,47,47,0.5)] hover:scale-105 animate-pulse">
              <PlayCircle size={16} />
              VER PARTIDO EN VIVO
            </Link>
            <Link href="/newbery-tv" className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8 py-3.5 rounded-full font-black text-sm transition-all hover:scale-105">
              <Tv size={16} className="text-jn-red" />
              NEWBERY TV
            </Link>
            <Link href="/portal" className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3.5 rounded-full font-black text-sm transition-all hover:scale-105">
              <Users size={16} />
              PORTAL SOCIO
            </Link>
          </div>
        </div>
      </section>

      {/* Frase Motivacional del Día (Ticker) */}
      <div className="bg-jn-red py-3 text-white overflow-hidden shadow-inner border-y border-white/10">
        <div className="container mx-auto px-4 flex justify-center items-center gap-2">
          <Trophy size={16} className="animate-bounce" />
          <span className="text-sm font-black tracking-wider uppercase text-center transition-opacity duration-500">
            "{frases[currentQuoteIndex]}"
          </span>
        </div>
      </div>

      {/* 4. Próximo Partido Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-50 border border-red-100 px-3 py-1 rounded-full">
            Fixture Futsal AFA
          </span>
          <h3 className="text-3xl font-black tracking-tight uppercase mt-2">Próximos Partidos</h3>
          <p className="text-sm text-gray-500 mt-1">Alentá al club en el torneo oficial.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Partido Futsal AFA Masculino */}
          <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <span className="absolute top-4 right-4 bg-jn-red text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">AFA</span>
            <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Futsal Masculino • Primera</p>
            
            <div className="flex justify-between items-center my-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-jn-black text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2 shadow-inner">JN</div>
                <p className="text-xs font-bold text-jn-black">Jorge Newbery</p>
              </div>
              <div className="text-center font-black text-jn-red text-2xl animate-pulse">VS</div>
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-900 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2 shadow-inner">SL</div>
                <p className="text-xs font-bold text-gray-700">San Lorenzo</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs text-gray-500">
              <span className="font-semibold">Viernes 26 Jun • 21:30hs</span>
              <Link href="/disciplinas/futsal/en-vivo" className="font-bold text-jn-red hover:underline flex items-center gap-1">
                Ver en Vivo <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Partido Futsal Femenino */}
          <div className="bg-white rounded-3xl p-8 border border-gray-150 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <span className="absolute top-4 right-4 bg-purple-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Niñas</span>
            <p className="text-gray-400 text-xs font-bold mb-3 uppercase tracking-wider">Futsal Femenino • Sub-17</p>
            
            <div className="flex justify-between items-center my-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-jn-black text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2 shadow-inner">JN</div>
                <p className="text-xs font-bold text-jn-black">Jorge Newbery</p>
              </div>
              <div className="text-center font-black text-jn-red text-2xl">VS</div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-800 text-white rounded-full flex items-center justify-center font-black text-sm mx-auto mb-2 shadow-inner">FE</div>
                <p className="text-xs font-bold text-gray-700">Ferro</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs text-gray-500">
              <span className="font-semibold">Sábado 27 Jun • 16:00hs</span>
              <Link href="/disciplinas/futsal/en-vivo" className="font-bold text-jn-red hover:underline flex items-center gap-1">
                Ver en Vivo <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Newbery TV Section */}
      <section className="py-16 bg-[#0c0c0c] text-white relative overflow-hidden border-y border-white/5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-jn-red/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-955/40 border border-jn-red/20 px-3 py-1 rounded-full">
                Streaming & Resúmenes
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight uppercase mt-2">
                📺 NEWBERY TV
              </h3>
              <p className="text-sm text-gray-400">Reviví los partidos, resúmenes y entrevistas exclusivas.</p>
            </div>
            <Link href="/newbery-tv" className="bg-jn-red hover:bg-red-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(211,47,47,0.3)]">
              Ver Todo el Canal
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Último Video */}
            <div className="bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between group transition-colors">
              <div>
                <span className="text-[8px] bg-red-950 text-jn-red border border-jn-red/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Último Video</span>
                {homeMedia.ultimoVideo ? (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10" />
                      {homeMedia.ultimoVideo.imageUrl ? (
                        <img src={homeMedia.ultimoVideo.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black opacity-30" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">{homeMedia.ultimoVideo.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">{homeMedia.ultimoVideo.description}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden font-normal">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10 animate-pulse" />
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">Crónica de la Victoria en el Clásico</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">Los mejores momentos de la victoria de la primera de Futsal AFA.</p>
                  </div>
                )}
              </div>
              <Link href="/newbery-tv" className="text-[10px] font-black text-jn-red hover:underline uppercase tracking-wide mt-6 flex items-center gap-1">
                Reproducir ahora <ArrowRight size={12} />
              </Link>
            </div>

            {/* Video Destacado */}
            <div className="bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between group transition-colors">
              <div>
                <span className="text-[8px] bg-red-950 text-jn-red border border-jn-red/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Video Destacado</span>
                {homeMedia.videoDestacado ? (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10" />
                      {homeMedia.videoDestacado.imageUrl ? (
                        <img src={homeMedia.videoDestacado.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black opacity-30" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">{homeMedia.videoDestacado.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">{homeMedia.videoDestacado.description}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10" />
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">Entrevista al Capitán del Futsal</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">Declaraciones exclusivas luego del partido clave del fin de semana.</p>
                  </div>
                )}
              </div>
              <Link href="/newbery-tv" className="text-[10px] font-black text-jn-red hover:underline uppercase tracking-wide mt-6 flex items-center gap-1">
                Reproducir ahora <ArrowRight size={12} />
              </Link>
            </div>

            {/* Resumen de la Semana */}
            <div className="bg-white/5 border border-white/5 hover:border-white/10 rounded-3xl p-6 flex flex-col justify-between group transition-colors">
              <div>
                <span className="text-[8px] bg-red-950 text-jn-red border border-jn-red/20 px-2 py-0.5 rounded font-black uppercase tracking-wider">Resumen</span>
                {homeMedia.ultimoResumen ? (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10" />
                      {homeMedia.ultimoResumen.imageUrl ? (
                        <img src={homeMedia.ultimoResumen.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black opacity-30" />
                      )}
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">{homeMedia.ultimoResumen.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">{homeMedia.ultimoResumen.description}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-black rounded-2xl relative flex items-center justify-center border border-white/5 overflow-hidden">
                      <PlayCircle size={36} className="text-white/80 group-hover:text-jn-red group-hover:scale-105 transition-all z-10" />
                    </div>
                    <h4 className="font-bold text-sm uppercase leading-snug">Goles del Semillero en HD</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-normal">Los mejores goles y jugadas de las categorías formativas de Newbery.</p>
                  </div>
                )}
              </div>
              <Link href="/newbery-tv" className="text-[10px] font-black text-jn-red hover:underline uppercase tracking-wide mt-6 flex items-center gap-1">
                Reproducir ahora <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Galería Multimedia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                Muro Visual del Club
              </span>
              <h3 className="text-3xl font-black tracking-tight uppercase flex items-center gap-2 mt-2">
                📸 Galería Multimedia
              </h3>
              <p className="text-sm text-gray-500">Reviví los mejores momentos de los partidos y entrenamientos.</p>
            </div>
            <Link href="/galeria" className="text-xs font-black text-jn-red hover:underline uppercase tracking-wider">
              Ver Galería Completa
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Foto 1 - Futsal */}
            <div className="relative group rounded-3xl overflow-hidden shadow-sm aspect-video bg-gray-250 cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                style={{ backgroundImage: "url('/images/action.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[9px] font-black text-jn-red bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Futsal AFA</span>
                <h4 className="font-bold text-sm mt-2">Final Futsal Masculino Sub-12</h4>
              </div>
            </div>

            {/* Foto 2 - Patín */}
            <div className="relative group rounded-3xl overflow-hidden shadow-sm aspect-video bg-gray-900 cursor-pointer">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 opacity-70" 
                style={{ backgroundImage: "url('/images/futsal_hero.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[9px] font-black text-purple-650 bg-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Patín Show</span>
                <h4 className="font-bold text-sm mt-2">Exhibición Patín Grupal Show</h4>
              </div>
            </div>

            {/* Video 1 - Futsal Goles */}
            <div className="relative group rounded-3xl overflow-hidden shadow-sm aspect-video bg-gray-300 cursor-pointer flex items-center justify-center">
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                style={{ backgroundImage: "url('/images/fans.png')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              <div className="relative z-10 text-white/90 group-hover:text-jn-red transition-colors">
                <PlayCircle size={48} className="animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-[9px] font-black text-yellow-500 bg-yellow-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Futsal AFA</span>
                <h4 className="font-bold text-sm mt-2">Resumen: Goles del Mes del Semillero</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Noticias Section */}
      <section className="container mx-auto px-4 py-16 border-t border-gray-100">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-50 border border-red-100 px-3 py-1 rounded-full">
            Cartelera Informativa
          </span>
          <h3 className="text-3xl font-black tracking-tight uppercase mt-2">Últimas Noticias</h3>
          <p className="text-sm text-gray-500 mt-1">Enterate de las novedades del Club Jorge Newbery.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {newsLoading ? (
            <p className="text-xs text-gray-500 font-bold animate-pulse col-span-3 text-center py-8">Cargando cartelera de novedades...</p>
          ) : news.length === 0 ? (
            <p className="text-xs text-gray-400 font-semibold col-span-3 text-center py-8">No hay novedades recientes en el club.</p>
          ) : (
            news.map(item => {
              const colors = {
                GENERAL: 'bg-jn-red/10 text-jn-red',
                FUTSAL: 'bg-red-50 text-jn-red border border-red-100',
                PATIN: 'bg-purple-100 text-purple-600',
                VOLEY: 'bg-blue-50 text-blue-600 border border-blue-100',
                ARTES_MARCIALES: 'bg-jn-black text-white'
              };
              const colClass = colors[item.category] || 'bg-gray-100 text-gray-600';
              return (
                <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-150 hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer">
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xs uppercase ${colClass}`}>
                      {item.category.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-jn-black leading-snug">{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                  {item.tag && (
                    <span className="inline-block mt-4 text-[8px] font-black uppercase bg-red-50 text-jn-red px-2 py-0.5 rounded-full w-fit">
                      {item.tag}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 8. Calendario de Actividades Interactivo */}
      <section className="bg-gray-50 py-16 border-t border-gray-150">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-200 px-3 py-1 rounded-full">
              Días y Horarios
            </span>
            <h3 className="text-3xl font-black tracking-tight uppercase mt-2">Calendario de Actividades</h3>
            <p className="text-sm text-gray-500 mt-1">Revisá los días de entrenamientos y actividades oficiales.</p>
          </div>

          {/* Filtro de Días */}
          <div className="flex justify-center overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar">
            {dias.map(dia => (
              <button 
                key={dia}
                onClick={() => setActiveTabCalendar(dia)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                  activeTabCalendar === dia 
                    ? 'bg-jn-red text-white border-jn-red shadow-md shadow-jn-red/20' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {dia}
              </button>
            ))}
          </div>

          {/* Contenido del Calendario */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {actividades[activeTabCalendar]?.map((act, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm hover:-translate-y-1 transition-transform">
                <span className="text-xs font-black text-jn-red bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{act.hora}</span>
                <h4 className="font-black text-lg text-jn-black mt-4 leading-tight">{act.deporte}</h4>
                <p className="text-xs font-semibold text-gray-500 mt-1">{act.cat}</p>
                <div className="border-t border-gray-100 mt-4 pt-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  📍 {act.lugar}
                </div>
              </div>
            )) || (
              <p className="text-xs text-gray-400 font-semibold col-span-3 text-center py-6">No hay actividades planificadas para este día.</p>
            )}
          </div>
        </div>
      </section>

      {/* 9. SPONSORS PRINCIPALES */}
      {sponsorPrincipal ? (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white border-t border-gray-150">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                🤝 Sponsor Oficial
              </span>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="flex flex-col md:flex-row items-center gap-0">
                {/* Imagen del sponsor */}
                {sponsorPrincipal.imageUrl && (
                  <div className="md:w-2/5 w-full aspect-video md:aspect-auto md:h-64 relative overflow-hidden">
                    <img
                      src={sponsorPrincipal.imageUrl}
                      alt={sponsorPrincipal.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 md:bg-gradient-to-t" />
                  </div>
                )}

                {/* Info del sponsor */}
                <div className="flex-1 p-8 flex flex-col justify-center gap-4">
                  {sponsorPrincipal.logoUrl && (
                    <img
                      src={sponsorPrincipal.logoUrl}
                      alt={`Logo ${sponsorPrincipal.name}`}
                      className="h-12 object-contain self-start"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-gray-900">{sponsorPrincipal.name}</h3>
                    {sponsorPrincipal.description && (
                      <p className="text-gray-500 text-sm mt-2 leading-relaxed">{sponsorPrincipal.description}</p>
                    )}
                  </div>
                  {sponsorPrincipal.website && (
                    <button
                      onClick={handleSponsorClick}
                      className="inline-flex items-center gap-2 bg-jn-black hover:bg-jn-red text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all hover:scale-[1.02] self-start"
                    >
                      Conocer Sponsor <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12 bg-gray-50 border-t border-gray-150">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-150 px-3 py-1 rounded-full">
                Sponsors del Club
              </span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:opacity-60 transition-opacity">
              <div className="text-lg font-black text-gray-500 tracking-widest">DEPORTES DEVOTO</div>
              <div className="text-lg font-black text-gray-500 tracking-widest">PINTURAS SUR</div>
              <div className="text-lg font-black text-gray-500 tracking-widest">EMPANADAS ALPATACAL</div>
              <div className="text-lg font-black text-gray-500 tracking-widest">DEPORTIVO NET</div>
            </div>
          </div>
        </section>
      )}

      {/* 10. Footer */}
      <footer className="bg-jn-black text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <ClubShield className="w-12 h-14" animate={false} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">Club Social y Deportivo Jorge Newbery</h2>
          <p className="text-white/60 text-xs max-w-sm mx-auto">
            Calle Alpatacal 3026, Villa Devoto. <br />
            Tel: 4503-4567 • Email: info@jorgenewbery.com.ar
          </p>
          <div className="text-white/30 text-[10px] pt-6">
            © {new Date().getFullYear()} Club Jorge Newbery. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}
