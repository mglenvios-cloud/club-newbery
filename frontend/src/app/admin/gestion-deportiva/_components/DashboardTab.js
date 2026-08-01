"use client";
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import {
  Users, Shield, Award, Clock, Calendar, Activity, Heart,
  AlertCircle, TrendingUp, Zap, Trophy, Star, RefreshCw,
  FileText, UserCheck, Target, Newspaper, Dumbbell, ChevronRight,
  AlertTriangle, CheckCircle, UserX, XCircle
} from 'lucide-react';

const CHART_COLORS = ['#CC0000', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
const NEWBERY_RED = '#CC0000';

const OFFICIAL_CATEGORIES = [
  'Primera', 'Reserva', '3ra', '4ta', '5ta', '6ta', '7ma', '8va',
  'Escuelita', 'Pre Infantil', 'Infantil'
];

// ── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon: Icon, gradient, trend, subtitle, pulse, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-5 rounded-2xl shadow-lg flex flex-col gap-1.5 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group ${pulse ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
  >
    <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all" />
    <div className="relative flex items-center justify-between">
      <span className="text-white/80 text-[10px] font-black uppercase tracking-widest leading-tight">{title}</span>
      {Icon && <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Icon size={14} className="text-white" /></div>}
    </div>
    <span className="relative text-4xl font-black text-white mt-1">{value ?? 0}</span>
    {subtitle && <span className="relative text-[10px] text-white/70 font-bold">{subtitle}</span>}
    {trend !== undefined && (
      <div className="relative flex items-center gap-1 mt-1">
        <TrendingUp size={10} className={trend >= 0 ? 'text-green-300' : 'text-red-300'} />
        <span className={`text-[10px] font-black ${trend >= 0 ? 'text-green-300' : 'text-red-300'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      </div>
    )}
  </div>
);

// ── Custom Tooltip ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3">
      <p className="text-xs font-black text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color || NEWBERY_RED }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Section Title ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2.5 bg-jn-red/10 rounded-xl">
      <Icon size={20} className="text-jn-red" />
    </div>
    <div>
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 font-medium">{subtitle}</p>}
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-jn-red/30 to-transparent ml-4" />
  </div>
);

// ── Category Badge ─────────────────────────────────────────────────────────
const CategoryBadge = ({ category, count, color }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
    <div className="flex items-center gap-2.5">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color || NEWBERY_RED }} />
      <span className="text-sm font-bold text-gray-800">{category}</span>
    </div>
    <span className="text-sm font-black text-jn-red bg-jn-red/10 px-2.5 py-0.5 rounded-full">{count}</span>
  </div>
);

export default function DashboardTab({ stats, players, teams, coaches, matches, trainings, onRefresh, loading, skeletonLoading, usingDemoData, onNavigate }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const Skeleton = ({ className = '' }) => (
    <div className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl ${className}`} />
  );

  // ── Datos KPIs ────────────────────────────────────────────────────────────
  const totalPlayers = stats?.totalPlayers ?? players.length;
  const totalTeams = stats?.totalTeams ?? teams.length;
  const totalCoaches = stats?.totalCoaches ?? coaches.length;
  const totalAssistants = stats?.totalAssistants ?? 0;
  const totalPFs = stats?.totalPFs ?? 0;
  const totalStaff = totalCoaches + totalAssistants + totalPFs;
  const trainingsToday = stats?.trainingsToday ?? trainings.filter(t => {
    const d = new Date(t.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const injured = stats?.injuredPlayers ?? players.filter(p => p.playerStatus === 'INJURED').length;
  const suspended = stats?.suspendedPlayers ?? players.filter(p => p.playerStatus === 'SUSPENDED').length;
  const convocados = stats?.convocadosPlayers ?? players.filter(p => p.playerStatus === 'CONVOCADO').length;
  const upcomingMatchesCount = matches.filter(m => m.status === 'UPCOMING').length;
  const publishedNews = stats?.publishedNews ?? 0;
  const activeCategories = OFFICIAL_CATEGORIES.length;

  // ── Datos para gráficos ──────────────────────────────────────────────────
  const playersByCategoryData = (() => {
    const byCat = {};
    OFFICIAL_CATEGORIES.forEach(c => { byCat[c] = 0; });
    players.forEach(p => {
      const cat = p.category || 'Sin categoría';
      const matched = OFFICIAL_CATEGORIES.find(c => cat.toLowerCase().includes(c.toLowerCase()));
      if (matched) byCat[matched]++;
      else byCat[cat] = (byCat[cat] || 0) + 1;
    });
    return Object.entries(byCat)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  })();

  const ageDistributionData = (() => {
    const ranges = { 'U-10': 0, 'U-12': 0, 'U-14': 0, 'U-16': 0, 'U-18': 0, '18-25': 0, '25+': 0 };
    players.forEach(p => {
      const age = p.age || (p.birthDate ? Math.floor((Date.now() - new Date(p.birthDate)) / (365.25 * 24 * 3600 * 1000)) : null);
      if (!age) return;
      if (age <= 10) ranges['U-10']++;
      else if (age <= 12) ranges['U-12']++;
      else if (age <= 14) ranges['U-14']++;
      else if (age <= 16) ranges['U-16']++;
      else if (age <= 18) ranges['U-18']++;
      else if (age <= 25) ranges['18-25']++;
      else ranges['25+']++;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  })();

  const statusData = [
    { name: 'Activos', value: players.filter(p => p.playerStatus === 'ACTIVE').length, color: '#10B981' },
    { name: 'Lesionados', value: injured, color: '#F59E0B' },
    { name: 'Suspendidos', value: suspended, color: '#EF4444' },
    { name: 'Inactivos', value: players.filter(p => p.playerStatus === 'INACTIVE').length, color: '#6B7280' },
  ].filter(d => d.value > 0);

  const goalsData = (() => {
    const byCat = {};
    players.forEach(p => {
      if (!p.goals) return;
      const cat = p.category || 'Sin categoría';
      byCat[cat] = (byCat[cat] || 0) + p.goals;
    });
    return Object.entries(byCat)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  })();

  const trainingsWeeklyData = stats?.trainingsWeekly?.length > 0
    ? stats.trainingsWeekly
    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => ({ day: d, count: 0 }));

  const aptosData = [
    { name: 'Aptos', value: players.filter(p => p.playerStatus === 'ACTIVE').length },
    { name: 'No aptos', value: injured + suspended },
  ];

  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING').slice(0, 5);
  const recentResults = matches.filter(m => m.status === 'COMPLETED').slice(0, 4);

  const kpis = [
    { title: 'Total Jugadores', value: totalPlayers, icon: Users, gradient: 'from-red-600 to-red-800', subtitle: `${activeCategories} categorías activas`, pulse: false, tab: 'planteles' },
    { title: 'Categorías AFA', value: activeCategories, icon: Trophy, gradient: 'from-gray-800 to-gray-900', subtitle: 'Primera → Infantil', tab: 'categorias' },
    { title: 'Entrenadores', value: totalCoaches, icon: UserCheck, gradient: 'from-blue-600 to-blue-800', subtitle: 'Cuerpo técnico activo', tab: 'coaches' },
    { title: 'Cuerpo Técnico', value: totalStaff, icon: Shield, gradient: 'from-purple-600 to-purple-800', subtitle: `${totalPFs} prep. físico`, tab: 'coaches' },
    { title: 'Partidos del Mes', value: upcomingMatchesCount, icon: Calendar, gradient: 'from-green-600 to-green-800', subtitle: 'Próximos encuentros', tab: 'matches' },
    { title: 'Entrenamientos Hoy', value: trainingsToday, icon: Dumbbell, gradient: 'from-orange-500 to-orange-700', subtitle: new Date().toLocaleDateString('es-AR', { weekday: 'long' }), tab: 'trainings' },
    { title: 'Lesionados', value: injured, icon: Heart, gradient: injured > 0 ? 'from-yellow-500 to-yellow-700' : 'from-gray-500 to-gray-700', subtitle: 'Fuera de actividad', pulse: injured > 0, tab: 'planteles' },
    { title: 'Suspendidos', value: suspended, icon: XCircle, gradient: suspended > 0 ? 'from-red-700 to-red-900' : 'from-gray-500 to-gray-700', subtitle: 'Con sanción activa', pulse: suspended > 0, tab: 'planteles' },
    { title: 'Convocados', value: convocados, icon: Star, gradient: 'from-teal-600 to-teal-800', subtitle: 'Para próximo partido', tab: 'planteles' },
    { title: 'Noticias', value: publishedNews, icon: Newspaper, gradient: 'from-pink-600 to-pink-800', subtitle: 'Publicadas hoy', tab: 'news' },
  ];

  if (skeletonLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-jn-black via-gray-900 to-jn-red rounded-2xl p-6 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('/shield.png')] bg-right bg-no-repeat bg-contain opacity-5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Trophy size={24} className="text-jn-red" />
            <span className="text-sm font-black uppercase tracking-widest text-red-400">Centro de Gestión Deportiva</span>
          </div>
          <h1 className="text-3xl font-black mb-1">Club Atlético Jorge Newbery</h1>
          <p className="text-gray-400 text-sm font-medium">Futsal AFA — Temporada 2026 · {OFFICIAL_CATEGORIES.length} Categorías</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-bold">Sistema Activo</span>
            </div>
            {usingDemoData && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-black px-2 py-0.5 rounded-full uppercase">Modo Demo</span>
            )}
            <button onClick={onRefresh} disabled={loading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors ml-auto">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Grid */}
      <div>
        <SectionTitle icon={Zap} title="Indicadores Clave" subtitle="Resumen general del sistema deportivo" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, i) => (
            <KpiCard
              key={i}
              {...kpi}
              onClick={() => kpi.tab && onNavigate?.(kpi.tab)}
            />
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jugadores por Categoría */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Jugadores por Categoría</h3>
              <p className="text-xs text-gray-400 font-medium">{totalPlayers} jugadores registrados</p>
            </div>
            <Users size={18} className="text-jn-red" />
          </div>
          {mounted && playersByCategoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={playersByCategoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Jugadores" radius={[6, 6, 0, 0]}>
                  {playersByCategoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
              <Users size={40} className="text-gray-200 mb-3" />
              <p className="text-sm font-bold">Sin jugadores registrados</p>
              <button onClick={() => onNavigate?.('planteles')} className="mt-3 text-xs text-jn-red font-black hover:underline">+ Agregar jugadores</button>
            </div>
          )}
        </div>

        {/* Estado de Jugadores */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Estado del Plantel</h3>
              <p className="text-xs text-gray-400 font-medium">Disponibilidad actual</p>
            </div>
            <Activity size={18} className="text-jn-red" />
          </div>
          {mounted && statusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-gray-700">{d.name}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Activity size={40} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-bold">Sin datos de estado</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución por Edad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Edad Promedio</h3>
              <p className="text-xs text-gray-400 font-medium">Distribución etaria</p>
            </div>
            <Target size={18} className="text-jn-red" />
          </div>
          {mounted ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageDistributionData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Jugadores" fill={NEWBERY_RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Skeleton className="h-[200px]" />}
        </div>

        {/* Goles por Categoría */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Goles por Categoría</h3>
              <p className="text-xs text-gray-400 font-medium">Temporada 2026</p>
            </div>
            <Award size={18} className="text-jn-red" />
          </div>
          {mounted && goalsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalsData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 700 }} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Goles" fill={NEWBERY_RED} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Award size={36} className="text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-bold">Sin estadísticas de goles</p>
              </div>
            </div>
          )}
        </div>

        {/* Aptos Médicos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Aptos Físicos</h3>
              <p className="text-xs text-gray-400 font-medium">Habilitados vs no habilitados</p>
            </div>
            <Heart size={18} className="text-jn-red" />
          </div>
          {mounted ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={aptosData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <span className="text-lg font-black text-green-600">{aptosData[0]?.value || 0}</span>
                  <p className="text-[10px] font-bold text-green-700 uppercase">Aptos</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <span className="text-lg font-black text-red-600">{aptosData[1]?.value || 0}</span>
                  <p className="text-[10px] font-bold text-red-700 uppercase">No aptos</p>
                </div>
              </div>
            </>
          ) : <Skeleton className="h-[200px]" />}
        </div>
      </div>

      {/* Próximos Partidos + Resultados Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionTitle icon={Calendar} title="Próximos Partidos" subtitle={`${upcomingMatchesCount} encuentros programados`} />
          {upcomingMatches.length > 0 ? (
            <div className="space-y-3">
              {upcomingMatches.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors">
                  <div className="w-10 h-10 bg-jn-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy size={16} className="text-jn-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">
                      Jorge Newbery vs {m.opponent}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold">{m.category} · {m.competition}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-jn-red">
                      {new Date(m.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[10px] text-gray-400">{m.timeSlot}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Calendar size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-bold">Sin partidos programados</p>
              <button onClick={() => onNavigate?.('matches')} className="mt-2 text-xs text-jn-red font-black hover:underline">+ Cargar partido</button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionTitle icon={Activity} title="Últimos Resultados" subtitle="Partidos jugados esta temporada" />
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.map(m => {
                const won = m.ourScore > m.opponentScore;
                const draw = m.ourScore === m.opponentScore;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${won ? 'bg-green-500' : draw ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">vs {m.opponent}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{m.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${won ? 'text-green-600' : draw ? 'text-yellow-600' : 'text-red-600'}`}>
                        {m.ourScore} - {m.opponentScore}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${won ? 'bg-green-100 text-green-700' : draw ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {won ? 'G' : draw ? 'E' : 'P'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <Activity size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-bold">Sin resultados registrados</p>
            </div>
          )}
        </div>
      </div>

      {/* Categorías Resumen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionTitle icon={Trophy} title="Categorías Oficiales AFA" subtitle="Todas las divisiones del club" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {OFFICIAL_CATEGORIES.map((cat, i) => {
            const count = players.filter(p => {
              const c = (p.category || '').toLowerCase();
              return c.includes(cat.toLowerCase()) || c === cat.toLowerCase();
            }).length;
            return (
              <CategoryBadge
                key={cat}
                category={cat}
                count={count}
                color={CHART_COLORS[i % CHART_COLORS.length]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
