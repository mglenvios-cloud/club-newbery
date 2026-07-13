"use client";
import React from 'react';
import { Sparkles, Trophy, Heart, PlayCircle, Star, Quote, ArrowRight } from 'lucide-react';
import ClubShield from '@/components/ClubShield';

export default function SeccionNinas() {
  const destacadas = [
    { id: 1, name: "Juana Rossi", sport: "Patín Competición", achievement: "Medalla de Oro Sub-10", desc: "Consiguió el puntaje más alto del torneo en la modalidad libre individual." },
    { id: 2, name: "Valentina Gómez", sport: "Futsal Femenino", achievement: "Goleadora del Torneo LFP", desc: "Anotó 18 goles en 10 partidos oficiales con la camiseta de Newbery." },
    { id: 3, name: "Lucía Maidana", sport: "Vóley Infantil", achievement: "Capitana e impulsora de valores", desc: "Ganó la insignia Fair Play tras proponer un tercer tiempo compartido con el rival." }
  ];

  const notasNinas = [
    { id: 1, title: "Historias que inspiran: El sueño de patinar sobre ruedas", author: "Cuerpo de Profes", excerpt: "Conversamos con las chicas de la categoría inicial sobre cómo el patinaje les ayuda a hacer amigas y divertirse." },
    { id: 2, title: "Tarde de Futsal Femenino en Sede Central", author: "Prensa JN", excerpt: "Repasá el fixture del fin de semana y vení a alentar a las divisiones inferiores del fútbol femenino." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header Premium con Tonos Violetas y los Colores Oficiales */}
      <div className="bg-gradient-to-r from-jn-black via-purple-950 to-jn-darkred text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-4 text-center space-y-4 relative z-10">
          <div className="flex justify-center">
            <ClubShield className="w-14 h-16" animate={false} />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            Sección Niñas 💜
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">EL PODER EN LA CANCHA</h1>
          <p className="text-sm text-gray-300 max-w-md mx-auto">Espacio exclusivo dedicado al desarrollo, logros e historias del deporte femenino en Newbery.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
        
        {/* LOGROS DESTACADOS */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-2 text-jn-black uppercase tracking-tight">
            <Trophy className="text-purple-600" size={24} /> Logros Deportivos
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {destacadas.map(girl => (
              <div key={girl.id} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <span className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></span>
                <Heart className="text-purple-600/30 group-hover:text-purple-600 transition-colors absolute top-4 right-4" size={20} />
                
                <h4 className="font-black text-lg text-jn-black">{girl.name}</h4>
                <p className="text-xs font-bold text-purple-600 uppercase mt-1">{girl.sport}</p>
                <p className="text-xs font-black text-gray-700 bg-purple-50 border border-purple-100 rounded-lg p-2 mt-3 leading-snug">
                  🏆 {girl.achievement}
                </p>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{girl.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CITA INSPIRADORA */}
        <div className="bg-jn-black text-white p-8 rounded-3xl relative overflow-hidden flex flex-col items-center text-center shadow-lg border border-white/5">
          <div className="absolute top-4 left-4 text-white/5">
            <Quote size={128} />
          </div>
          <p className="text-lg md:text-xl font-bold italic leading-relaxed max-w-xl relative z-10">
            "El deporte me enseñó que no hay límites para lo que una niña puede lograr cuando entrena con constancia y se apoya en sus compañeras."
          </p>
          <span className="text-xs font-bold uppercase tracking-widest text-jn-red mt-4 relative z-10">
            - Juana Rossi, Campeona de Patín
          </span>
        </div>

        {/* NOTAS Y ENTREVISTAS */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-jn-black uppercase tracking-tight flex items-center gap-2">
              📰 Novedades Femeninas
            </h3>
            
            <div className="space-y-4">
              {notasNinas.map(nota => (
                <div key={nota.id} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">{nota.author}</span>
                  <h4 className="font-black text-base text-jn-black mt-2 leading-snug">{nota.title}</h4>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{nota.excerpt}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-jn-red font-bold hover:underline">
                    Leer Nota <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GALERÍA DE FOTOS Y VIDEOS DESTACADOS */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-jn-black uppercase tracking-tight flex items-center gap-2">
              📸 Galería del Deporte Femenino
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-200 cursor-pointer">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('/images/futsal_hero.png')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <span className="absolute bottom-3 left-3 text-[10px] text-white font-bold">Patín Artístico</span>
              </div>
              
              <div className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-200 cursor-pointer flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: "url('/images/action.png')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
                <PlayCircle className="relative z-10 text-white/90 group-hover:text-purple-500 transition-colors" size={32} />
                <span className="absolute bottom-3 left-3 text-[10px] text-white font-bold">Futsal Femenino</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
