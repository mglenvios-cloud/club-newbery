"use client";

import React, { useState } from 'react';
import { Star, BarChart2, Calendar, Edit3 } from 'lucide-react';

export default function MarketingModule() {
  const [sponsors, setSponsors] = useState([
    { id: 'sp-1', name: 'Transportes Rápidos', plan: 'Premium', status: 'ACTIVO', clicks: 350, views: 5000 },
    { id: 'sp-2', name: 'Gimnasio Sport', plan: 'Standard', status: 'ACTIVO', clicks: 120, views: 2400 }
  ]);

  const [posts, setPosts] = useState([
    { id: 'p-1', platform: 'Instagram', content: '¡Inscripciones abiertas para Futsal Infantil!', date: '2026-07-20 18:00' }
  ]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <Star size={20} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Marketing & Sponsors
        </h2>
        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded font-black uppercase">
          Plan Premium
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sponsors and Clicks CTR (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Rendimiento publicitario sponsors</h3>
          
          <div className="space-y-2">
            {sponsors.map(s => {
              const ctr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(2) : '0.00';
              return (
                <div 
                  key={s.id}
                  className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase text-white">{s.name}</h4>
                    <p className="text-[9px] text-zinc-500 font-semibold uppercase">Contrato {s.plan} · CTR: {ctr}%</p>
                  </div>

                  <div className="flex gap-4 text-xs font-bold text-right">
                    <div>
                      <span className="text-[8px] text-zinc-500 uppercase block">Vistas</span>
                      <strong className="text-white font-mono">{s.views}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-500 uppercase block">Clics</span>
                      <strong className="text-white font-mono">{s.clicks}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Planner (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5"><Calendar size={14} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Planificador Redes Sociales</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              {posts.map(p => (
                <div key={p.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-club-primary" style={{ color: 'var(--color-primary)' }}>{p.platform}</strong>
                    <span className="text-[8px] text-zinc-500 font-mono">{p.date}</span>
                  </div>
                  <p className="text-zinc-400 font-light leading-relaxed">{p.content}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert("Abriendo calendario de programación de publicaciones comerciales")}
              className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-[9px] py-2.5 rounded-xl w-full cursor-pointer transition-all"
            >
              Planificar Publicación
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
