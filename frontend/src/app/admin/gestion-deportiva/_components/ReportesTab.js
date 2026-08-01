"use client";
import React, { useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart2, Download, Filter, Users, Trophy, Heart, AlertTriangle,
  FileText, TrendingUp, Activity, Calendar, Star, Shield
} from 'lucide-react';

const CHART_COLORS = ['#CC0000', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const OFFICIAL_CATEGORIES = [
  'Primera', 'Reserva', '3ra', '4ta', '5ta', '6ta', '7ma', '8va',
  'Escuelita', 'Pre Infantil', 'Infantil'
];

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className="p-2.5 bg-white/20 rounded-xl">
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-[10px] font-black text-white/80 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3">
      <p className="text-xs font-black text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.fill || '#CC0000' }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function ReportesTab({ players, matches, trainings, coaches }) {
  const [reportType, setReportType] = useState('general');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // ── Data computations ──────────────────────────────────────────────────────
  const filteredPlayers = filterCategory === 'ALL'
    ? players
    : players.filter(p => (p.category || '').toLowerCase().includes(filterCategory.toLowerCase()));

  const playersByCat = OFFICIAL_CATEGORIES.map(cat => ({
    name: cat,
    Jugadores: players.filter(p => (p.category || '').toLowerCase().includes(cat.toLowerCase())).length,
  })).filter(d => d.Jugadores > 0);

  const goalsReport = OFFICIAL_CATEGORIES.map(cat => {
    const catPlayers = players.filter(p => (p.category || '').toLowerCase().includes(cat.toLowerCase()));
    return {
      name: cat,
      Goles: catPlayers.reduce((sum, p) => sum + (p.goals || 0), 0),
      Asistencias: catPlayers.reduce((sum, p) => sum + (p.assists || 0), 0),
    };
  }).filter(d => d.Goles > 0 || d.Asistencias > 0);

  const cardsReport = OFFICIAL_CATEGORIES.map(cat => {
    const catPlayers = players.filter(p => (p.category || '').toLowerCase().includes(cat.toLowerCase()));
    return {
      name: cat,
      Amarillas: catPlayers.reduce((sum, p) => sum + (p.yellowCards || 0), 0),
      Rojas: catPlayers.reduce((sum, p) => sum + (p.redCards || 0), 0),
    };
  }).filter(d => d.Amarillas > 0 || d.Rojas > 0);

  const statusDist = [
    { name: 'Activos', value: filteredPlayers.filter(p => p.playerStatus === 'ACTIVE').length, color: '#10B981' },
    { name: 'Lesionados', value: filteredPlayers.filter(p => p.playerStatus === 'INJURED').length, color: '#F59E0B' },
    { name: 'Suspendidos', value: filteredPlayers.filter(p => p.playerStatus === 'SUSPENDED').length, color: '#EF4444' },
    { name: 'Inactivos', value: filteredPlayers.filter(p => p.playerStatus === 'INACTIVE').length, color: '#6B7280' },
  ].filter(d => d.value > 0);

  const avgAge = filteredPlayers.length
    ? Math.round(filteredPlayers.reduce((sum, p) => {
        const age = p.age || (p.birthDate ? Math.floor((Date.now() - new Date(p.birthDate)) / (365.25 * 24 * 3600 * 1000)) : 0);
        return sum + age;
      }, 0) / filteredPlayers.length)
    : 0;

  const docStats = {
    aptos: filteredPlayers.filter(p => p.aptoFisico).length,
    seguros: filteredPlayers.filter(p => p.seguro).length,
    licencias: filteredPlayers.filter(p => p.licenciaAFA).length,
    socios: filteredPlayers.filter(p => p.esSocio).length,
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = [
      'Apellido', 'Nombre', 'Categoría', 'Posición', 'Dorsal', 'Estado',
      'Edad', 'DNI', 'Pierna', 'PJ', 'Goles', 'Asistencias', 'TA', 'TR',
      'AFA', 'Seguro', 'Apto', 'Socio'
    ].join(',');

    const rows = filteredPlayers.map(p => [
      p.lastName || '', p.name || '', p.category || '', p.position || '',
      p.dorsal || '', p.playerStatus || '', p.age || '',
      p.dni || '', p.dominantFoot || '',
      p.matchesPlayed || 0, p.goals || 0, p.assists || 0,
      p.yellowCards || 0, p.redCards || 0,
      p.licenciaAFA ? 'Sí' : 'No',
      p.seguro ? 'Sí' : 'No',
      p.aptoFisico ? 'Sí' : 'No',
      p.esSocio ? 'Sí' : 'No',
    ].join(',')).join('\n');

    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-planteles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredPlayers]);

  const exportPDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Reportes Deportivos</h2>
          <p className="text-sm text-gray-400 font-medium">Club Atlético Jorge Newbery · Futsal AFA 2026</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition-all shadow-lg">
            <Download size={14} />
            CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-jn-red text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg">
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter size={15} className="text-gray-400" />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-jn-red outline-none shadow-sm"
        >
          <option value="ALL">Todas las categorías</option>
          {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Jugadores" value={filteredPlayers.length} icon={Users} color="text-white" bg="bg-gradient-to-br from-jn-red to-red-900" />
        <StatCard title="Edad Promedio" value={`${avgAge} años`} icon={TrendingUp} color="text-white" bg="bg-gradient-to-br from-blue-600 to-blue-900" />
        <StatCard title="Lesionados" value={filteredPlayers.filter(p => p.playerStatus === 'INJURED').length} icon={Heart} color="text-white" bg="bg-gradient-to-br from-yellow-600 to-yellow-900" />
        <StatCard title="Suspendidos" value={filteredPlayers.filter(p => p.playerStatus === 'SUSPENDED').length} icon={AlertTriangle} color="text-white" bg="bg-gradient-to-br from-gray-700 to-gray-900" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jugadores por Categoría */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={15} className="text-jn-red" /> Jugadores por Categoría
          </h3>
          {playersByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={playersByCat} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Jugadores" fill="#CC0000" radius={[4, 4, 0, 0]}>
                  {playersByCat.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Users size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-bold">Sin datos</p>
              </div>
            </div>
          )}
        </div>

        {/* Estado del Plantel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity size={15} className="text-jn-red" /> Estado del Plantel
          </h3>
          {statusDist.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={statusDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusDist.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-gray-700">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-gray-900">{d.value}</span>
                      <span className="text-[10px] text-gray-400">
                        ({filteredPlayers.length ? Math.round(d.value / filteredPlayers.length * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              <p className="text-sm font-bold">Sin jugadores</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goles y Asistencias */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-jn-red" /> Goles y Asistencias por Categoría
          </h3>
          {goalsReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={goalsReport} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Bar dataKey="Goles" fill="#CC0000" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Asistencias" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <p className="text-sm font-bold">Sin estadísticas registradas</p>
            </div>
          )}
        </div>

        {/* Tarjetas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={15} className="text-jn-red" /> Tarjetas por Categoría
          </h3>
          {cardsReport.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cardsReport} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                <Bar dataKey="Amarillas" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Rojas" fill="#EF4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400">
              <p className="text-sm font-bold">Sin tarjetas registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* Documentation Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield size={15} className="text-jn-red" /> Estado de Documentación
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Aptos Físicos', value: docStats.aptos, total: filteredPlayers.length, color: 'bg-green-500' },
            { label: 'Seguros', value: docStats.seguros, total: filteredPlayers.length, color: 'bg-blue-500' },
            { label: 'Licencias AFA', value: docStats.licencias, total: filteredPlayers.length, color: 'bg-purple-500' },
            { label: 'Son Socios', value: docStats.socios, total: filteredPlayers.length, color: 'bg-jn-red' },
          ].map((d, i) => {
            const pct = d.total ? Math.round(d.value / d.total * 100) : 0;
            return (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-gray-600">{d.label}</span>
                  <span className="text-sm font-black text-gray-900">{d.value}/{d.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div className={`h-2 rounded-full ${d.color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{pct}% completado</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Player Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            Detalle de Jugadores
            <span className="ml-2 text-jn-red">{filteredPlayers.length}</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Apellido y Nombre', 'Categoría', 'Pos.', 'Estado', 'PJ', 'G', 'A', 'TA', 'TR', 'AFA', 'Apto'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[9px] font-black text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPlayers.slice(0, 50).map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-xs font-black text-gray-400">{p.dorsal || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {p.photoUrl && <img src={p.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />}
                      <span className="text-xs font-bold text-gray-900">
                        {p.lastName ? `${p.lastName}, ${p.name}` : p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500 font-medium">{p.category}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{p.position}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      p.playerStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      p.playerStatus === 'INJURED' ? 'bg-yellow-100 text-yellow-700' :
                      p.playerStatus === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.playerStatus === 'ACTIVE' ? 'Activo' :
                       p.playerStatus === 'INJURED' ? 'Lesionado' :
                       p.playerStatus === 'SUSPENDED' ? 'Suspendido' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-900 text-center">{p.matchesPlayed || 0}</td>
                  <td className="px-3 py-2 text-xs font-bold text-jn-red text-center">{p.goals || 0}</td>
                  <td className="px-3 py-2 text-xs font-bold text-blue-600 text-center">{p.assists || 0}</td>
                  <td className="px-3 py-2 text-xs font-bold text-yellow-600 text-center">{p.yellowCards || 0}</td>
                  <td className="px-3 py-2 text-xs font-bold text-red-700 text-center">{p.redCards || 0}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[9px] font-black ${p.licenciaAFA ? 'text-green-600' : 'text-gray-300'}`}>
                      {p.licenciaAFA ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-[9px] font-black ${p.aptoFisico ? 'text-green-600' : 'text-gray-300'}`}>
                      {p.aptoFisico ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPlayers.length > 50 && (
          <div className="px-5 py-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-bold">Mostrando 50 de {filteredPlayers.length} · Exportá CSV para ver todos</p>
          </div>
        )}
      </div>
    </div>
  );
}
