"use client";

import React, { useState } from 'react';
import { Trophy, Users, Calendar, Shield } from 'lucide-react';

export default function DeportesModule() {
  const [sports, setSports] = useState([
    { id: 'sp-1', name: 'Futsal AFA', description: 'Liga de Honor Masculina y Femenina' },
    { id: 'sp-2', name: 'Fútbol Infantil', description: 'Escuelita y Divisiones Inferiores' }
  ]);

  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Primera Futsal', sport: 'Futsal AFA' },
    { id: 'cat-2', name: 'Reserva Futsal', sport: 'Futsal AFA' },
    { id: 'cat-3', name: 'Categoría 2012', sport: 'Fútbol Infantil' }
  ]);

  const [players, setPlayers] = useState([
    { id: 'pl-1', name: 'Lucas González', dorsal: 1, position: 'Arquero', team: 'Primera Futsal', status: 'ACTIVE' },
    { id: 'pl-2', name: 'Mateo Rodríguez', dorsal: 10, position: 'Ala/Pivot', team: 'Primera Futsal', status: 'ACTIVE' }
  ]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <Trophy size={20} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Gestión Deportiva
        </h2>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-black uppercase">
          Módulo Activo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Disciplines & Categories (4 Cols) */}
        <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Disciplinas & Categorías</h3>
          
          <div className="space-y-3">
            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Disciplinas Activas</span>
            <div className="space-y-2">
              {sports.map(s => (
                <div key={s.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-0.5">
                  <span className="font-bold text-xs uppercase text-white block">{s.name}</span>
                  <span className="text-[9px] text-zinc-500 font-semibold">{s.description}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[8px] text-zinc-500 font-bold uppercase block">Categorías</span>
            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center text-xs text-white">
                  <span className="font-bold uppercase">{c.name}</span>
                  <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-mono">
                    {c.sport}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Players & Rosters Grid (8 Cols) */}
        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Plantilla de Deportistas Federados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map(p => (
              <div 
                key={p.id}
                className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex justify-between items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-club-primary flex items-center justify-center font-mono font-black text-[9px]" style={{ backgroundColor: 'var(--color-primary)' }}>
                      #{p.dorsal}
                    </span>
                    <h4 className="font-black text-xs uppercase text-white">{p.name}</h4>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-semibold uppercase">{p.position} · {p.team}</p>
                </div>

                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
