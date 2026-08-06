"use client";
import React from 'react';
import { useTheme } from './ThemeContext';

export default function OurClubSection() {
  const { theme } = useTheme();

  return (
    <section className="container mx-auto px-4 py-16">
      {/* Encabezado de la Sección */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
          {theme?.clubName ? `NUESTRO ${theme.clubShortName || 'CLUB'}` : 'NUESTRO CLUB'}
        </h2>
        <p className="text-sm sm:text-base text-gray-400 font-medium">
          Construyendo deporte, valores y comunidad.
        </p>
      </div>

      {/* Grid de 4 Tarjetas Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Deporte */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all hover:scale-[1.02]">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: `${theme?.primaryColor || '#dc2626'}20`,
              color: theme?.primaryColor || '#dc2626',
            }}
          >
            ⚽
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg mb-1">Deporte</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Espacio para todas las disciplinas del club.
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Comunidad */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg mb-1">Comunidad</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Un lugar para socios, familias e hinchas.
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Competencia */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
            🏆
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg mb-1">Competencia</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Formación, desarrollo y alto rendimiento.
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Historia */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all hover:scale-[1.02]">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold">
            💙
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg mb-1">Historia</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Una institución con sólida trayectoria.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
