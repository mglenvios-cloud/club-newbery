"use client";
import React, { useState } from 'react';
import {
  Sprout, Users, Trophy, Calendar, ChevronRight, Eye,
  Star, Shield, Camera, Clock, MapPin, UserCheck
} from 'lucide-react';

const SEMILLERO_CATEGORIES = [
  { name: '3ra', badge: '3°', color: '#1D4ED8', description: 'Tercera División AFA', emoji: '🔵' },
  { name: '4ta', badge: '4°', color: '#1E40AF', description: 'Cuarta División AFA', emoji: '🔵' },
  { name: '5ta', badge: '5°', color: '#2563EB', description: 'Quinta División AFA', emoji: '🔵' },
  { name: '6ta', badge: '6°', color: '#7C3AED', description: 'Sexta División AFA', emoji: '🟣' },
  { name: '7ma', badge: '7°', color: '#6D28D9', description: 'Séptima División AFA', emoji: '🟣' },
  { name: '8va', badge: '8°', color: '#5B21B6', description: 'Octava División AFA', emoji: '🟣' },
  { name: 'Escuelita', badge: 'E', color: '#D97706', description: 'Escuela de Fútbol', emoji: '🟡' },
  { name: 'Pre Infantil', badge: 'PI', color: '#B45309', description: 'Pre Infantil AFA', emoji: '🟠' },
  { name: 'Infantil', badge: 'IN', color: '#92400E', description: 'Infantil AFA', emoji: '🟠' },
];

function SemilleroCard({ cat, team, players, trainings, matches, onViewPlantel }) {
  const playerCount = players.filter(p => {
    const c = (p.category || '').toLowerCase();
    return c.includes(cat.name.toLowerCase()) || c === cat.name.toLowerCase();
  }).length;

  const nextTraining = trainings
    .filter(t => {
      const tc = (t.category || '').toLowerCase();
      return tc.includes(cat.name.toLowerCase());
    })
    .filter(t => new Date(t.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const nextMatch = matches
    .filter(m => {
      const mc = (m.category || '').toLowerCase();
      return mc.includes(cat.name.toLowerCase()) && m.status === 'UPCOMING';
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer">
      {/* Large Photo Header */}
      <div className="relative h-52 overflow-hidden" style={{ background: `linear-gradient(135deg, ${cat.color}22, ${cat.color}44)` }}>
        {team?.squadPhotoUrl || team?.imageUrl ? (
          <img
            src={team.squadPhotoUrl || team.imageUrl}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl mb-2"
              style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}99)` }}
            >
              <span className="text-5xl font-black text-white">{cat.badge}</span>
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Photo placeholder icon */}
        {!team?.squadPhotoUrl && !team?.imageUrl && (
          <div className="absolute top-3 right-3 p-2 bg-white/20 rounded-lg">
            <Camera size={14} className="text-white/70" />
          </div>
        )}

        {/* Category name */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-white">{cat.name}</h3>
              <p className="text-xs text-white/70 font-bold">{cat.description}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white">{playerCount}</span>
              <p className="text-[10px] text-white/70 font-bold">jugadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Coach */}
        {team?.coach && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-jn-red/10 flex items-center justify-center flex-shrink-0">
              <UserCheck size={14} className="text-jn-red" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Entrenador</p>
              <p className="text-sm font-black text-gray-900">{team.coach}</p>
            </div>
          </div>
        )}

        {/* Next Events */}
        <div className="space-y-2 mb-4">
          {nextTraining ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Clock size={11} className="text-blue-600" />
              </div>
              <div>
                <span className="font-black text-gray-500 uppercase text-[9px]">Próximo entrenamiento</span>
                <p className="font-bold text-gray-800">
                  {new Date(nextTraining.date).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })}
                  {nextTraining.timeSlot ? ` · ${nextTraining.timeSlot}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Clock size={11} />
              </div>
              <span className="font-medium">Sin entrenamientos próximos</span>
            </div>
          )}

          {nextMatch ? (
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 bg-red-50 rounded-lg">
                <Trophy size={11} className="text-jn-red" />
              </div>
              <div>
                <span className="font-black text-gray-500 uppercase text-[9px]">Próximo partido</span>
                <p className="font-bold text-gray-800">
                  vs {nextMatch.opponent} ·&nbsp;
                  {new Date(nextMatch.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="p-1.5 bg-gray-100 rounded-lg">
                <Trophy size={11} />
              </div>
              <span className="font-medium">Sin partidos programados</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onViewPlantel(cat.name)}
          className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}BB)`, boxShadow: `0 4px 20px ${cat.color}40` }}
        >
          <Users size={15} />
          Ver Plantel
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function SemilleroTab({ players, teams, trainings, matches, onViewPlantel }) {
  const totalSemillero = players.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return SEMILLERO_CATEGORIES.some(c => cat.includes(c.name.toLowerCase()));
  }).length;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/20 rounded-2xl">
              <Sprout size={28} className="text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-green-400">Club Atlético Jorge Newbery</span>
              </div>
              <h1 className="text-4xl font-black leading-none">EL SEMILLERO</h1>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-300 mb-1">MUNDO INFERIORES</p>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Explorá y seguí de cerca las categorías menores y promocionales del Club Atlético Jorge Newbery.
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-black text-white">{SEMILLERO_CATEGORIES.length}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Categorías</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">{totalSemillero}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Jugadores</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">AFA</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Competencia</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black text-white">2026</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Temporada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Group: Senior Inferiores */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-blue-600 rounded-full" />
          <div>
            <h2 className="text-lg font-black text-gray-900">Divisiones Senior</h2>
            <p className="text-xs text-gray-400 font-medium">3ra · 4ta · 5ta · 6ta · 7ma · 8va</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEMILLERO_CATEGORIES.filter(c => ['3ra', '4ta', '5ta', '6ta', '7ma', '8va'].includes(c.name)).map(cat => {
            const team = teams.find(t => (t.category || '').toLowerCase().includes(cat.name.toLowerCase()) || (t.name || '').toLowerCase().includes(cat.name.toLowerCase()));
            return (
              <SemilleroCard
                key={cat.name}
                cat={cat}
                team={team}
                players={players}
                trainings={trainings}
                matches={matches}
                onViewPlantel={onViewPlantel}
              />
            );
          })}
        </div>
      </div>

      {/* Group: Formativas */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-amber-500 rounded-full" />
          <div>
            <h2 className="text-lg font-black text-gray-900">Categorías Formativas</h2>
            <p className="text-xs text-gray-400 font-medium">Escuelita · Pre Infantil · Infantil</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SEMILLERO_CATEGORIES.filter(c => ['Escuelita', 'Pre Infantil', 'Infantil'].includes(c.name)).map(cat => {
            const team = teams.find(t => (t.category || '').toLowerCase().includes(cat.name.toLowerCase()) || (t.name || '').toLowerCase().includes(cat.name.toLowerCase()));
            return (
              <SemilleroCard
                key={cat.name}
                cat={cat}
                team={team}
                players={players}
                trainings={trainings}
                matches={matches}
                onViewPlantel={onViewPlantel}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
