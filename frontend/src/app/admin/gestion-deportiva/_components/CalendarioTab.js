"use client";
import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Calendar, Trophy,
  Clock, MapPin, Users, X, Edit, Trash2
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

const OFFICIAL_CATEGORIES = [
  'Primera', 'Reserva', '3ra', '4ta', '5ta', '6ta', '7ma', '8va',
  'Escuelita', 'Pre Infantil', 'Infantil'
];

const EVENT_TYPES = {
  TRAINING: { label: 'Entrenamiento', color: 'bg-blue-500', dot: '#3B82F6' },
  MATCH: { label: 'Partido', color: 'bg-jn-red', dot: '#CC0000' },
  MEETING: { label: 'Reunión', color: 'bg-purple-500', dot: '#8B5CF6' },
  TRAVEL: { label: 'Viaje', color: 'bg-teal-500', dot: '#14B8A6' },
  MEDICAL: { label: 'Médico', color: 'bg-yellow-500', dot: '#F59E0B' },
  OTHER: { label: 'Otro', color: 'bg-gray-500', dot: '#6B7280' },
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Build all events from trainings + matches + clubEvents
function buildEvents(trainings, matches, clubEvents) {
  const events = [];

  trainings.forEach(t => {
    if (!t.date) return;
    events.push({
      id: `training-${t.id}`,
      type: 'TRAINING',
      title: `Entrenamiento ${t.category}`,
      date: new Date(t.date),
      timeSlot: t.timeSlot || '',
      location: t.court || '',
      category: t.category || '',
      coach: t.coach || '',
      notes: t.notes || '',
    });
  });

  matches.forEach(m => {
    if (!m.date) return;
    events.push({
      id: `match-${m.id}`,
      type: 'MATCH',
      title: `${m.category} vs ${m.opponent}`,
      date: new Date(m.date),
      timeSlot: m.timeSlot || '',
      location: m.venue || '',
      category: m.category || '',
      notes: m.competition || '',
    });
  });

  (clubEvents || []).forEach(e => {
    if (!e.date) return;
    events.push({
      id: `event-${e.id}`,
      type: e.type || 'OTHER',
      title: e.title,
      date: new Date(e.date),
      timeSlot: e.timeSlot || '',
      location: e.location || '',
      category: e.category || '',
      notes: e.description || '',
    });
  });

  return events.sort((a, b) => a.date - b.date);
}

export default function CalendarioTab({ trainings, matches, onRefresh }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'list'

  const allEvents = useMemo(
    () => buildEvents(trainings, matches, []),
    [trainings, matches]
  );

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      const matchCat = filterCategory === 'ALL' || (e.category || '').toLowerCase().includes(filterCategory.toLowerCase());
      const matchType = filterType === 'ALL' || e.type === filterType;
      return matchCat && matchType;
    });
  }, [allEvents, filterCategory, filterType]);

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getEventsForDay = (day) => {
    return filteredEvents.filter(e => {
      const d = e.date;
      return d.getFullYear() === currentYear &&
             d.getMonth() === currentMonth &&
             d.getDate() === day;
    });
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const isToday = (day) => {
    return today.getDate() === day &&
           today.getMonth() === currentMonth &&
           today.getFullYear() === currentYear;
  };

  // Upcoming events (list view)
  const upcomingEvents = filteredEvents
    .filter(e => e.date >= today)
    .slice(0, 20);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Calendario Deportivo</h2>
          <p className="text-sm text-gray-400 font-medium">{filteredEvents.length} eventos · {upcomingEvents.length} próximos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'month' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Mes
          </button>
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Lista
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:border-jn-red outline-none shadow-sm">
          <option value="ALL">Todas las categorías</option>
          {OFFICIAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {[{ key: 'ALL', label: 'Todos' }, ...Object.entries(EVENT_TYPES).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${filterType === f.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Calendar Grid */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <h3 className="text-base font-black text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-100">
              {DAYS.map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            {/* Day Grid */}
            <div className="grid grid-cols-7">
              {Array(firstDay).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] border-r border-b border-gray-50" />
              ))}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay === day;
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[80px] border-r border-b border-gray-50 p-1.5 cursor-pointer transition-colors ${isSelected ? 'bg-jn-red/5 ring-1 ring-jn-red/20' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black mb-1 ${isTodayDay ? 'bg-jn-red text-white' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(e => {
                        const et = EVENT_TYPES[e.type] || EVENT_TYPES.OTHER;
                        return (
                          <div key={e.id} className="flex items-center gap-1 px-1 py-0.5 rounded text-[8px] font-black truncate" style={{ backgroundColor: `${et.dot}20`, color: et.dot }}>
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: et.dot }} />
                            {e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] font-black text-gray-400 px-1">+{dayEvents.length - 3} más</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar: Selected Day / Legend */}
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Leyenda</h4>
              <div className="space-y-2">
                {Object.entries(EVENT_TYPES).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.dot }} />
                    <span className="text-xs font-bold text-gray-700">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected day events */}
            {selectedDay && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">
                  {selectedDay} de {MONTHS[currentMonth]}
                </h4>
                {selectedEvents.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium">Sin eventos este día</p>
                ) : (
                  <div className="space-y-2">
                    {selectedEvents.map(e => {
                      const et = EVENT_TYPES[e.type] || EVENT_TYPES.OTHER;
                      return (
                        <div key={e.id} className="p-3 rounded-xl border border-gray-100" style={{ borderLeftColor: et.dot, borderLeftWidth: 3 }}>
                          <p className="text-sm font-black text-gray-900">{e.title}</p>
                          {e.timeSlot && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock size={10} className="text-gray-400" />
                              <span className="text-[10px] font-bold text-gray-500">{e.timeSlot}</span>
                            </div>
                          )}
                          {e.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={10} className="text-gray-400" />
                              <span className="text-[10px] font-bold text-gray-500">{e.location}</span>
                            </div>
                          )}
                          {e.category && (
                            <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                              {e.category}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Próximos Eventos</h4>
              {upcomingEvents.slice(0, 5).length === 0 ? (
                <p className="text-xs text-gray-400 font-medium">Sin eventos próximos</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 5).map(e => {
                    const et = EVENT_TYPES[e.type] || EVENT_TYPES.OTHER;
                    return (
                      <div key={e.id} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: et.dot }} />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 truncate">{e.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {e.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            {e.timeSlot ? ` · ${e.timeSlot}` : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-black text-gray-500">Sin eventos próximos</h3>
              <p className="text-sm font-medium mt-1">Cargá entrenamientos y partidos para verlos aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingEvents.map(e => {
                const et = EVENT_TYPES[e.type] || EVENT_TYPES.OTHER;
                return (
                  <div key={e.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 text-center flex-shrink-0">
                      <p className="text-lg font-black text-gray-900">{e.date.getDate()}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{MONTHS[e.date.getMonth()].slice(0, 3)}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{e.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {e.timeSlot && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={9} />{e.timeSlot}</span>}
                        {e.location && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><MapPin size={9} />{e.location}</span>}
                        {e.category && <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Users size={9} />{e.category}</span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full text-white ${et.color}`}>
                      {et.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
