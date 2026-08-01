"use client";
import React, { useState } from 'react';
import {
  Trophy, Users, Calendar, ChevronRight, Shield, Star, Edit, Plus,
  Camera, User, Activity, Clock, MoreVertical
} from 'lucide-react';

const OFFICIAL_CATEGORIES = [
  { name: 'Primera', color: '#CC0000', badge: '1°', tier: 'elite', division: 'Primera División' },
  { name: 'Reserva', color: '#991B1B', badge: 'R', tier: 'elite', division: 'Reserva' },
  { name: '3ra', color: '#1D4ED8', badge: '3°', tier: 'senior', division: 'Tercera División' },
  { name: '4ta', color: '#1E40AF', badge: '4°', tier: 'senior', division: 'Cuarta División' },
  { name: '5ta', color: '#2563EB', badge: '5°', tier: 'senior', division: 'Quinta División' },
  { name: '6ta', color: '#7C3AED', badge: '6°', tier: 'juvenil', division: 'Sexta División' },
  { name: '7ma', color: '#6D28D9', badge: '7°', tier: 'juvenil', division: 'Séptima División' },
  { name: '8va', color: '#5B21B6', badge: '8°', tier: 'juvenil', division: 'Octava División' },
  { name: 'Escuelita', color: '#D97706', badge: 'E', tier: 'formativa', division: 'Escuela de Fútbol' },
  { name: 'Pre Infantil', color: '#B45309', badge: 'PI', tier: 'formativa', division: 'Pre Infantil' },
  { name: 'Infantil', color: '#92400E', badge: 'IN', tier: 'formativa', division: 'Infantil' },
];

const TIER_LABELS = {
  elite: { label: 'Élite', color: 'bg-red-100 text-red-700' },
  senior: { label: 'Senior', color: 'bg-blue-100 text-blue-700' },
  juvenil: { label: 'Juvenil', color: 'bg-purple-100 text-purple-700' },
  formativa: { label: 'Formativa', color: 'bg-amber-100 text-amber-700' },
};

function CategoryCard({ cat, team, players, onViewPlantel, onEdit }) {
  const playerCount = players.filter(p => {
    const c = (p.category || '').toLowerCase();
    return c.includes(cat.name.toLowerCase()) || c === cat.name.toLowerCase();
  }).length;

  const upcomingMatch = null; // Could be derived from matches
  const tier = TIER_LABELS[cat.tier];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
      {/* Header con color institucional */}
      <div className="relative h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}99)` }}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]" />
        {team?.imageUrl || team?.squadPhotoUrl ? (
          <img
            src={team.squadPhotoUrl || team.imageUrl}
            alt={cat.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : null}

        <div className="relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 mx-auto shadow-lg">
            <span className="text-2xl font-black text-white">{cat.badge}</span>
          </div>
        </div>

        {/* Tier badge */}
        <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full ${tier.color}`}>
          {tier.label}
        </div>

        {/* Edit button */}
        <button
          onClick={() => onEdit?.(cat)}
          className="absolute top-3 left-3 p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Edit size={12} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-black text-gray-900">{cat.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{cat.division}</p>
          </div>
          <span className="text-2xl font-black text-gray-900">{playerCount}</span>
        </div>

        {/* Staff */}
        {team && (
          <div className="space-y-1.5 mb-4">
            {team.coach && (
              <div className="flex items-center gap-2">
                <User size={11} className="text-gray-400" />
                <span className="text-[11px] text-gray-600 font-bold">{team.coach}</span>
              </div>
            )}
            {team.assistantCoach && (
              <div className="flex items-center gap-2">
                <Shield size={11} className="text-gray-400" />
                <span className="text-[11px] text-gray-500">{team.assistantCoach}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-gray-50 rounded-xl p-2">
            <span className="text-base font-black text-gray-900">{playerCount}</span>
            <p className="text-[8px] text-gray-400 font-bold uppercase">Jugadores</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-2">
            <span className="text-base font-black text-gray-900">
              {team?.trainingDays ? team.trainingDays.split(',').length : 0}
            </span>
            <p className="text-[8px] text-gray-400 font-bold uppercase">Días Entreno</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl p-2">
            <span className="text-base font-black" style={{ color: cat.color }}>AFA</span>
            <p className="text-[8px] text-gray-400 font-bold uppercase">Competencia</p>
          </div>
        </div>

        {/* State */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${team?.status === 'ACTIVE' || !team ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-[10px] font-bold text-gray-500">{team?.status === 'ACTIVE' || !team ? 'Activo' : 'Inactivo'}</span>
          </div>
          {team?.trainingSchedule && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={10} />
              <span className="text-[10px] font-bold">{team.trainingSchedule}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={() => onViewPlantel(cat.name)}
          className="w-full py-2.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}99)` }}
        >
          <Users size={14} />
          Ver Plantel
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CategoriasTab({ teams, players, onViewPlantel, loading }) {
  const [filterTier, setFilterTier] = useState('ALL');

  const filtered = filterTier === 'ALL'
    ? OFFICIAL_CATEGORIES
    : OFFICIAL_CATEGORIES.filter(c => c.tier === filterTier);

  const totalsByTier = {
    ALL: OFFICIAL_CATEGORIES.length,
    elite: OFFICIAL_CATEGORIES.filter(c => c.tier === 'elite').length,
    senior: OFFICIAL_CATEGORIES.filter(c => c.tier === 'senior').length,
    juvenil: OFFICIAL_CATEGORIES.filter(c => c.tier === 'juvenil').length,
    formativa: OFFICIAL_CATEGORIES.filter(c => c.tier === 'formativa').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Categorías Oficiales AFA</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            Club Atlético Jorge Newbery — {OFFICIAL_CATEGORIES.length} divisiones activas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-jn-red" />
          <span className="text-sm font-black text-gray-500">Futsal AFA 2026</span>
        </div>
      </div>

      {/* Filtros por Tier */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'ALL', label: 'Todas', color: 'bg-gray-900 text-white' },
          { key: 'elite', label: 'Élite', color: 'bg-red-600 text-white' },
          { key: 'senior', label: 'Senior', color: 'bg-blue-600 text-white' },
          { key: 'juvenil', label: 'Juvenil', color: 'bg-purple-600 text-white' },
          { key: 'formativa', label: 'Formativa', color: 'bg-amber-600 text-white' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterTier(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${filterTier === f.key ? f.color + ' shadow-lg scale-[1.02]' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-400'}`}
          >
            {f.label}
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${filterTier === f.key ? 'bg-white/20' : 'bg-gray-100'}`}>
              {totalsByTier[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(cat => {
          const team = teams.find(t => {
            const tc = (t.category || '').toLowerCase();
            return tc.includes(cat.name.toLowerCase()) || t.name?.toLowerCase().includes(cat.name.toLowerCase());
          });
          return (
            <CategoryCard
              key={cat.name}
              cat={cat}
              team={team}
              players={players}
              onViewPlantel={onViewPlantel}
              onEdit={() => {}}
            />
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-gray-900 to-jn-black rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={20} className="text-jn-red" />
          <h3 className="font-black uppercase tracking-wider text-sm">Resumen del Sistema de Categorías</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Categorías', value: OFFICIAL_CATEGORIES.length, icon: Trophy },
            { label: 'Total Jugadores', value: players.length, icon: Users },
            { label: 'Con Plantel', value: teams.length, icon: Shield },
            { label: 'Temporada', value: '2026', icon: Star },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
              <s.icon size={16} className="text-jn-red mx-auto mb-1" />
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
