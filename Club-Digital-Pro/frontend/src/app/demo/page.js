"use client";

import React, { useState } from 'react';
import { useClub } from '../providers';
import { 
  Building2, Trophy, Tv, Users, Star, ArrowRight, ArrowLeft, Lock, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function DemoPage() {
  const { club, setClub, availableClubs } = useClub();

  const selectActiveClub = (c) => {
    setClub(c);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center font-black text-xs text-red-500">
            CDP
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">Club Digital Pro</span>
        </div>
        <a 
          href="/" 
          className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-[9px] px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={12} /> Volver a Home
        </a>
      </nav>

      {/* BODY CONTENT */}
      <main className="p-8 flex-1 max-w-6xl mx-auto w-full space-y-10 text-left animate-fadeIn">
        <div className="space-y-1">
          <span className="bg-red-950/40 text-red-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/20">
            Vista Previa de Franquicias
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight pt-2">Demostración de Marca</h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xl font-light">
            Elegí entre los tres perfiles preconfigurados de clubes deportivos para ver cómo la interfaz responde dinámicamente según sus licencias.
          </p>
        </div>

        {/* SELECTOR CLUBS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableClubs.map(c => {
            const isSelected = club.slug === c.slug;
            const planColors = c.plan === 'PREMIUM' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : c.plan === 'PRO' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';

            return (
              <div 
                key={c.slug}
                onClick={() => selectActiveClub(c)}
                className={`p-6 rounded-3xl border text-left flex flex-col justify-between aspect-[4/3] cursor-pointer transition-all hover:scale-[1.02] ${
                  isSelected ? 'bg-zinc-900 border-zinc-500/50 shadow-2xl ring-1 ring-zinc-800' : 'bg-zinc-950/40 border-zinc-800/80 hover:bg-zinc-900/40'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: c.colorPrimario }}>
                      {c.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase ${planColors}`}>
                      Plan {c.plan || 'FREE'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-base uppercase text-white leading-none">{c.nombre}</h3>
                    <span className="text-[10px] font-mono text-zinc-500">Domain: {c.dominio || `www.${c.slug}.com`}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c.colorPrimario }}></div>
                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c.colorSecundario }}></div>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase text-zinc-400 flex items-center gap-1">
                    {isSelected ? 'Club Seleccionado ✓' : 'Seleccionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SYSTEM STATUS WORKSPACE */}
        <section className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl grid md:grid-cols-2 gap-10 items-center text-xs">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[8px] text-zinc-500 font-bold uppercase block">Personalización de Marca Blanca</span>
              <h3 className="text-lg font-black uppercase text-white">Identidad Activa: {club.nombre}</h3>
              <p className="text-zinc-400 font-light leading-relaxed">
                Cada club inyecta sus variables CSS personalizadas al core de Club Digital Pro, logrando que el portal adquiera la estética institucional instantáneamente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Color Primario</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: club.colorPrimario }}></div>
                  <span className="font-mono text-white font-bold">{club.colorPrimario}</span>
                </div>
              </div>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Color Secundario</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: club.colorSecundario }}></div>
                  <span className="font-mono text-white font-bold">{club.colorSecundario}</span>
                </div>
              </div>
            </div>

            <a 
              href="/dashboard"
              className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs px-6 py-3.5 rounded-xl w-full flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-white/5"
            >
              Ingresar al Dashboard del Club <ArrowRight size={14} />
            </a>
          </div>

          {/* Module checklist preview */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <span className="text-[8px] font-black text-zinc-500 uppercase block">Disponibilidad de Módulos (Plan {club.plan})</span>
            
            <div className="space-y-2">
              {[
                { title: '👥 Centro de Socios y Carnet QR', plan: 'PRO' },
                { title: '⚽ Gestión Deportiva', plan: 'PRO' },
                { title: '📺 Newbery TV Streaming Premium', plan: 'PREMIUM' },
                { title: '📈 Marketing y Sponsors Analíticas', plan: 'PREMIUM' }
              ].map((mod, idx) => {
                const planLevels = { 'FREE': 1, 'PRO': 2, 'PREMIUM': 3 };
                const isUnlocked = planLevels[club.plan || 'FREE'] >= planLevels[mod.plan];

                return (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <span className="font-bold text-zinc-300">{mod.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase ${
                      isUnlocked 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-500 border-zinc-850'
                    }`}>
                      {isUnlocked ? 'Activo' : `Plan ${mod.plan}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="h-16 border-t border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase select-none">
        <span>© 2026 Club Digital Pro SaaS</span>
        <span>Demostración de Marca Blanca</span>
      </footer>

    </div>
  );
}
