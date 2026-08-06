"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function HeroOverlay() {
  const { theme } = useTheme();

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none select-none">
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-1000">
        
        {/* Badge Superior */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-black tracking-wider uppercase backdrop-blur-md pointer-events-auto shadow-lg border transition-all"
          style={{
            backgroundColor: `${theme.primaryColor}25`,
            borderColor: `${theme.primaryColor}55`,
            shadowColor: `${theme.primaryColor}33`,
          }}
        >
          <span>{theme.badgeText}</span>
        </div>

        {/* Título & Subtítulo */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
            {theme.clubName}
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl font-extrabold text-transparent bg-clip-text transition-all"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor}, #ffffff)`,
            }}
          >
            {theme.tagline}
          </p>
        </div>

        {/* Botones Interactivos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pointer-events-auto">
          {/* Botón Principal */}
          <Link
            href="/portal"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor})`,
              boxShadow: `0 10px 25px ${theme.primaryColor}55`,
            }}
          >
            <span>Portal de Socios</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Botón Secundario */}
          <Link
            href="/club-digital-pro"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-jn-black/80 hover:bg-zinc-900 border border-white/20 text-gray-200 hover:text-white font-extrabold text-sm backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" style={{ color: theme.primaryColor }} />
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
