"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import {
  Users, Shield, Award, Clock, Calendar, Activity, Heart,
  AlertCircle, TrendingUp, Zap, Trophy, Star, RefreshCw,
  FileText, Stethoscope, Bell, ChevronRight, Target
} from 'lucide-react';

const CHART_COLORS = ['#CC0000', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon: Icon, color, bg, trend, subtitle, pulse }) => (
  <div className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${pulse ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider leading-tight">{title}</span>
      {Icon && <div className={`p-2 rounded-xl ${bg}`}><Icon size={14} className={color} /></div>}
    </div>
    <span className={`text-3xl font-black ${color}`}>{value ?? 0}</span>
    {subtitle && <span className="text-[10px] text-gray-400 font-bold">{subtitle}</span>}
    {trend !== undefined && (
      <div className="flex items-center gap-1">
        <TrendingUp size={10} className={trend >= 0 ? 'text-green-500' : 'text-red-500'} />
        <span className={`text-[10px] font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      </div>
    )}
  </div>
);

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3">
      <p className="text-xs font-black text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}: <span className="text-gray-800">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DashboardTab({ stats, players, teams, coaches, matches, trainings, onRefresh, loading, skeletonLoading, usingDemoData }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const Skeleton = ({ className = '' }) => (
    <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
  );

  // ── Datos para gráficos ─────────────────────────────────────────────────
  const playersByCategoryData = stats?.playersByCategory?.length > 0
    ? stats.playersByCategory.slice(0, 8)
    : players.reduce((acc, p) => {
        const found = acc.find(a => a.name === (p.category || 'Sin categoría'));
        if (found) found.value++;
        else acc.push({ name: p.category || 'Sin categoría', value: 1 });
        return acc;
      }, []);

  const trainingsWeeklyData = stats?.trainingsWeekly?.length > 0
    ? stats.trainingsWeekly
    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => ({ day: d, count: 0 }));

  const teamsByDisciplineData = stats?.teamsByDiscipline?.length > 0
    ? stats.teamsByDiscipline
    : [{ name: 'FUTSAL', value: teams.length }];

  const statusData = [
    { name: 'Activos', value: stats?.activePlayers ?? players.filter(p => p.playerStatus === 'ACTIVE').length },
    { name: 'Lesionados', value: stats?.injuredPlayers ?? players.filter(p => p.playerStatus === 'INJURED').length },
    { name: 'Suspendidos', value: stats?.suspendedPlayers ?? players.filter(p => p.playerStatus === 'SUSPENDED').length },
  ].filter(d => d.value > 0);

  const statusColors = ['#10B981', '#F59E0B', '#EF4444'];

  const kpis = [
    { title: 'Equipos Activos', value: stats?.activeTeams ?? teams.filter(t => t.status === 'ACTIVE').length, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Jugadores Fichados', value: stats?.totalPlayers ?? players.length, icon: Users, color: 'text-jn-red', bg: 'bg-red-50' },
    { title: 'Entrenadores', value: (stats?.totalCoaches ?? 0) + (stats?.totalAssistants ?? 0), icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Personal Técnico', value: stats?.totalTechnicalStaff ?? 0, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Entrenam. Hoy', value: stats?.trainingsToday ?? 0, icon: Clock, color: 'text-pink-600', bg: 'bg-pink-50' },
    { title: 'Partidos Prog.', value: stats?.upcomingMatches?.length ?? matches.filter(m => m.status === 'UPCOMING').length, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Lesionados', value: stats?.injuredPlayers ?? players.filter(p => p.playerStatus === 'INJURED').length, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', pulse: (stats?.injuredPlayers ?? 0) > 0 },
    { title: 'Suspendidos', value: stats?.suspendedPlayers ?? players.filter(p => p.playerStatus === 'SUSPENDED').length, icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100', pulse: (stats?.suspendedPlayers ?? 0) > 0 },
    { title: 'Cumpleaños/Mes', value: stats?.birthdays?.length ?? 0, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { title: 'Casos Médicos', value: stats?.activeMedicalCases ?? 0, icon: Stethoscope, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Docs x Vencer', value: stats?.expiringDocuments ?? 0, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', pulse: (stats?.expiringDocuments ?? 0) > 0 },
    { title: 'Entrén. Semana', value: stats?.trainingsThisWeek ?? 0, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight">Dashboard Ejecutivo</h2>
          <p className="text-xs text-gray-500 mt-0.5">Indicadores en tiempo real · Temporada 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemoData && (
            <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 uppercase tracking-wider">
              📊 Modo Demo
            </span>
          )}
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {skeletonLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col gap-2">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-8 w-10" />
              </div>
            ))
          : kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)
        }
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Jugadores por Categoría */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Jugadores por Categoría</h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-black">{playersByCategoryData.length} categorías</span>
          </div>
          {skeletonLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : playersByCategoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <Users size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">Sin datos de jugadores</p>
              </div>
            </div>
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={playersByCategoryData} margin={{ top: 5, right: 5, bottom: 35, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8, fontWeight: 700 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Jugadores" fill="#CC0000" radius={[4, 4, 0, 0]}>
                    {playersByCategoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>

        {/* Estado de Jugadores */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Estado del Plantel</h3>
          {skeletonLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center text-gray-300">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">Sin jugadores</p>
              </div>
            </div>
          ) : (
            <>
              {mounted && (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={statusColors[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex flex-col gap-1.5 mt-3">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[i] }} />
                      <span className="font-bold text-gray-700">{d.name}</span>
                    </div>
                    <span className="font-black text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Entrenamientos por día */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Entrenamientos esta Semana</h3>
          {skeletonLoading ? <Skeleton className="h-44 w-full" /> : (
            mounted && (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={trainingsWeeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Entrenamientos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          )}
        </div>

        {/* Equipos por Disciplina */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">Equipos por Disciplina</h3>
          {skeletonLoading ? <Skeleton className="h-44 w-full" /> : teamsByDisciplineData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-gray-300">
              <div className="text-center">
                <Target size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">Sin equipos</p>
              </div>
            </div>
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={teamsByDisciplineData} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {teamsByDisciplineData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>

      {/* Bottom Row — Próximos eventos + Cumpleaños */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Próximos partidos */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Próximos Partidos</h3>
            <Trophy size={14} className="text-amber-500" />
          </div>
          {skeletonLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (stats?.upcomingMatches || matches.filter(m => m.status === 'UPCOMING')).length === 0 ? (
            <div className="py-8 text-center text-gray-300">
              <Trophy size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">Sin partidos programados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(stats?.upcomingMatches || matches.filter(m => m.status === 'UPCOMING')).slice(0, 5).map(m => {
                const daysLeft = Math.ceil((new Date(m.date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                        <Trophy size={14} className="text-jn-red" />
                      </div>
                      <div>
                        <p className="font-black text-sm">VS {m.opponent}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase">{m.category} · {m.competition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-700">{new Date(m.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                      <p className={`text-[10px] font-black ${daysLeft <= 3 ? 'text-red-600' : 'text-gray-400'}`}>
                        {daysLeft <= 0 ? 'Hoy' : `en ${daysLeft}d`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cumpleaños */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
              <Heart size={13} className="text-rose-500" /> Cumpleaños del Mes
            </h3>
          </div>
          {skeletonLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (stats?.birthdays || []).length === 0 ? (
            <div className="py-8 text-center text-gray-300">
              <Heart size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">Sin cumpleaños este mes</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {(stats?.birthdays || []).map((b, i) => {
                const date = new Date(b.birthDate);
                return (
                  <div key={i} className={`flex items-center justify-between text-xs p-2.5 rounded-xl ${b.isToday ? 'bg-rose-50 border border-rose-200' : 'bg-gray-50/50 border border-gray-100'}`}>
                    <div>
                      <p className={`font-black text-sm ${b.isToday ? 'text-rose-700' : 'text-gray-800'}`}>{b.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{b.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-700">{date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                      {b.isToday && <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-black">¡Hoy!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Promedio de edad y stat cards */}
      {!skeletonLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-2xl text-white">
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-wider">Promedio de Edad</p>
            <p className="text-3xl font-black mt-1">{stats?.avgAge ?? '—'}</p>
            <p className="text-blue-200 text-xs font-bold">años</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 rounded-2xl text-white">
            <p className="text-emerald-200 text-[10px] font-black uppercase tracking-wider">Disciplinas</p>
            <p className="text-3xl font-black mt-1">{stats?.teamsByDiscipline?.length || 1}</p>
            <p className="text-emerald-200 text-xs font-bold">activas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-5 rounded-2xl text-white">
            <p className="text-purple-200 text-[10px] font-black uppercase tracking-wider">Total Staff</p>
            <p className="text-3xl font-black mt-1">{stats?.totalStaff ?? coaches.length}</p>
            <p className="text-purple-200 text-xs font-bold">personas</p>
          </div>
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-5 rounded-2xl text-white">
            <p className="text-rose-200 text-[10px] font-black uppercase tracking-wider">Categorías</p>
            <p className="text-3xl font-black mt-1">{stats?.totalCategories ?? '—'}</p>
            <p className="text-rose-200 text-xs font-bold">configuradas</p>
          </div>
        </div>
      )}
    </div>
  );
}
