"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users2, ChevronRight, Activity, Award } from 'lucide-react';
import ClubShield from '@/components/ClubShield';
import { API_URL } from '@/config';
import { apiFetch } from '@/lib/apiClient';

export default function MundoInferiores() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/players');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      } else {
        console.error(`[MundoInferiores] Error al obtener jugadores: ${res.status}`);
        setPlayers([]);
      }
    } catch (e) {
      console.error('[MundoInferiores] Error de red al cargar jugadores:', e.message);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const defaultMockPlayers = [
    { id: 1, name: "Thiago Medina", age: 11, category: "2015", position: "Ala", team: "Futsal A", achievements: "Goleador, Compañero ⭐", matchesPlayed: 14, goals: 12, assists: 8, photoUrl: null },
    { id: 2, name: "Mateo Rossi", age: 10, category: "2016", position: "Cierre", team: "Futsal A", achievements: "Fair Play ⭐", matchesPlayed: 12, goals: 3, assists: 9, photoUrl: null },
    { id: 3, name: "Bautista Castro", age: 11, category: "2015", position: "Ala", team: "Futsal A", achievements: "Mejor Compañero 🤝", matchesPlayed: 10, goals: 8, assists: 4, photoUrl: null },
    { id: 4, name: "Benjamín Rossi", age: 8, category: "2018", position: "Ala", team: "Futsal B", achievements: "Goleador Semillero", matchesPlayed: 8, goals: 10, assists: 2, photoUrl: null },
    { id: 5, name: "Juana Rossi", age: 10, category: "2016", position: "Patinadora", team: "Patín Show", achievements: "Medalla de Oro 🥇", matchesPlayed: 6, goals: 0, assists: 0, photoUrl: null },
    { id: 6, name: "Delfina Solari", age: 11, category: "2015", position: "Patinadora", team: "Patín Show", achievements: "Esfuerzo Escolar 📚", matchesPlayed: 8, goals: 0, assists: 0, photoUrl: null }
  ];

  const categories = ["ALL", "2015", "2016", "2018"];

  const filtered = players.filter(p => {
    const matchesCategory = filterCategory === "ALL" || p.category === filterCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header */}
      <div className="bg-jn-black text-white py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <ClubShield className="w-14 h-16" animate={false} />
          </div>
          <span className="inline-flex items-center gap-1 bg-jn-red text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Semillero 🌟
          </span>
          <h1 className="text-4xl font-black uppercase tracking-tight">MUNDO INFERIORES</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Fichas digitales, estadísticas y logros de las futuras promesas del Club Jorge Newbery.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8">
        
        {/* BARRA DE FILTROS */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar jugador..." 
              className="pl-9 pr-4 py-2 text-xs border border-gray-250 rounded-lg focus:outline-none w-full" 
            />
          </div>

          <div className="flex gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                  filterCategory === cat ? 'bg-jn-red text-white border-jn-red' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : `Cat. ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* LISTADO DE FICHAS */}
        {loading ? (
          <div className="text-center py-10 font-bold text-gray-400">Cargando fichas del semillero...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-150 py-16 text-center text-gray-500 rounded-3xl font-semibold">
            No se encontraron jugadores.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(player => (
              <Link 
                key={player.id} 
                href={`/mundo-inferiores/${player.id}`}
                className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                {/* Cabecera Tarjeta */}
                <div className="bg-gradient-to-br from-jn-black to-gray-900 p-6 text-white text-center relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-jn-red/10 rounded-full blur-lg"></div>
                  
                  {/* Foto de jugador circular */}
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center font-black text-xl mb-3 border-2 border-white/20 shadow-md group-hover:scale-105 transition-transform">
                    {player.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  
                  <h4 className="font-black text-sm tracking-tight text-white leading-tight">{player.name}</h4>
                  <p className="text-[10px] text-jn-red uppercase tracking-wider font-bold mt-1">{player.position} • {player.team}</p>
                </div>

                {/* Cuerpo Tarjeta */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <p className="text-gray-400 font-bold text-[9px] uppercase">Edad</p>
                      <p className="font-black text-jn-black mt-0.5">{player.age} años</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <p className="text-gray-400 font-bold text-[9px] uppercase">Categoría</p>
                      <p className="font-black text-jn-black mt-0.5">{player.category}</p>
                    </div>
                  </div>

                  {player.achievements && (
                    <div className="text-center bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 text-[10px] font-black py-1.5 px-3 rounded-lg leading-none uppercase tracking-wider">
                      ✨ {player.achievements}
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-jn-red group-hover:underline uppercase tracking-wider">
                      Ver Ficha Completa <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
