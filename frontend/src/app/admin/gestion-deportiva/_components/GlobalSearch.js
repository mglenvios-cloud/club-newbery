"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Shield, Award, Trophy, ChevronRight, Clock } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

const RESULT_ICONS = {
  players: Users,
  teams: Shield,
  coaches: Award,
  matches: Trophy,
};

const RESULT_LABELS = {
  players: 'Jugadores',
  teams: 'Equipos',
  coaches: 'Entrenadores',
  matches: 'Partidos',
};

export default function GlobalSearch({ onNavigate, players = [], teams = [], coaches = [], matches = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/gestion-deportiva/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResults(await res.json());
        } else {
          // Fallback: buscar localmente
          localSearch(query);
        }
      } catch {
        localSearch(query);
      }
      setLoading(false);
    }, 300);
  }, [query]);

  const localSearch = (q) => {
    const lower = q.toLowerCase();
    setResults({
      players: players.filter(p => `${p.name} ${p.lastName}`.toLowerCase().includes(lower) || p.category?.toLowerCase().includes(lower)).slice(0, 6),
      teams: teams.filter(t => t.name?.toLowerCase().includes(lower) || t.category?.toLowerCase().includes(lower)).slice(0, 4),
      coaches: coaches.filter(c => c.name?.toLowerCase().includes(lower)).slice(0, 4),
      matches: matches.filter(m => m.opponent?.toLowerCase().includes(lower) || m.category?.toLowerCase().includes(lower)).slice(0, 4),
    });
  };

  const handleSelect = (type, item) => {
    const entry = { type, item, time: new Date().toISOString() };
    setRecent(prev => [entry, ...prev.filter((r, i) => i < 4)]);
    setOpen(false);
    setQuery('');
    setResults(null);
    if (onNavigate) onNavigate(type, item);
  };

  const totalResults = results
    ? Object.values(results).reduce((s, arr) => s + (arr?.length || 0), 0)
    : 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all shadow-sm min-w-[180px]"
      >
        <Search size={13} />
        <span>Buscar...</span>
        <span className="ml-auto bg-gray-100 text-gray-400 text-[9px] font-black px-1.5 py-0.5 rounded">Ctrl+K</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar jugadores, equipos, entrenadores, partidos..."
                className="flex-1 outline-none text-sm font-medium placeholder:text-gray-400"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-jn-red rounded-full animate-spin" />
              )}
              {query && (
                <button onClick={() => { setQuery(''); setResults(null); }} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-black">ESC</button>
            </div>

            {/* Results */}
            <div className="max-h-[420px] overflow-y-auto">
              {!query && recent.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                    <Clock size={10} /> Búsquedas recientes
                  </p>
                  {recent.map((r, i) => {
                    const Icon = RESULT_ICONS[r.type] || Users;
                    const label = r.type === 'players' ? `${r.item.name} ${r.item.lastName}` : r.item.name;
                    return (
                      <button key={i} onClick={() => handleSelect(r.type, r.item)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors">
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon size={13} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 flex-1">{label}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase">{RESULT_LABELS[r.type]}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!query && recent.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Search size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">Busca jugadores, equipos, entrenadores o partidos</p>
                  <p className="text-xs mt-1">Escribe al menos 2 caracteres</p>
                </div>
              )}

              {query && query.length < 2 && (
                <div className="p-6 text-center text-gray-400">
                  <p className="text-xs font-bold">Escribe al menos 2 caracteres</p>
                </div>
              )}

              {results && totalResults === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Search size={28} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">Sin resultados para "{query}"</p>
                </div>
              )}

              {results && Object.entries(results).map(([type, items]) => {
                if (!items || items.length === 0) return null;
                const Icon = RESULT_ICONS[type] || Users;
                return (
                  <div key={type} className="p-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider px-2 mb-2">
                      {RESULT_LABELS[type]} ({items.length})
                    </p>
                    {items.map((item, i) => {
                      let label = '', sublabel = '';
                      if (type === 'players') { label = `${item.name} ${item.lastName}`; sublabel = `${item.category} · #${item.dorsal} · ${item.team}`; }
                      else if (type === 'teams') { label = item.name; sublabel = `${item.category} · ${item.season}`; }
                      else if (type === 'coaches') { label = item.name; sublabel = `${item.role} · ${item.categories}`; }
                      else if (type === 'matches') { label = `VS ${item.opponent}`; sublabel = `${item.category} · ${new Date(item.date).toLocaleDateString('es-AR')}`; }
                      return (
                        <button
                          key={i}
                          onClick={() => handleSelect(type, item)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors group"
                        >
                          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon size={14} className="text-jn-red" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-800 truncate">{label}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{sublabel}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold">
                {totalResults > 0 ? `${totalResults} resultados` : 'Sin resultados'}
              </span>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                <span>↑↓ navegar</span>
                <span>↵ seleccionar</span>
                <span>ESC cerrar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
