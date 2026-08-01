"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';

export default function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none select-none">
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-1000">
        
        {/* Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-jn-red/15 border border-jn-red/30 text-white text-xs font-black tracking-wider uppercase backdrop-blur-md pointer-events-auto shadow-lg shadow-jn-red/10">
          <span>⚽ Más de 100 años haciendo historia</span>
        </div>

        {/* Título & Subtítulo */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
            CLUB JORGE NEWBERY
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-jn-red via-red-400 to-rose-300">
            El futuro del deporte comienza aquí
          </p>
        </div>

        {/* Botones Interactivos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pointer-events-auto">
          {/* Botón Principal */}
          <Link
            href="/portal"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-700 via-jn-red to-rose-500 hover:from-red-600 hover:to-rose-400 text-white font-extrabold text-sm shadow-xl shadow-jn-red/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Portal de Socios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Botón Secundario */}
          <Link
            href="/club-digital-pro"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-jn-black/80 hover:bg-zinc-900 border border-white/20 text-gray-200 hover:text-white font-extrabold text-sm backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-jn-red" />
            <span>Conocer el Club</span>
          </Link>
        </div>

      </div>

      {/* Indicador de Desplazamiento Inferior */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 text-xs font-bold pointer-events-auto animate-bounce">
        <span className="tracking-wider uppercase text-[11px]">▼ Deslizar</span>
      </div>
    </div>
  );
}
