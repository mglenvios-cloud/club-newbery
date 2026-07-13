"use client";
import React, { useState } from 'react';
import { Trophy, Star, Medal, Users2, ShieldAlert, Award, Calendar, ThumbsUp, Gamepad2 } from 'lucide-react';
import ClubShield from '@/components/ClubShield';

export default function RankingsPage() {
  const [rankingType, setRankingType] = useState("XP"); // XP, COMPANERO, ASISTENCIA, FAIRPLAY, JUEGOS

  const rankings = {
    "XP": [
      { id: 1, name: "Thiago Medina", value: "4,820 XP", category: "Futsal 2015", extra: "Lvl 5 - Capitán" },
      { id: 2, name: "Delfina Solari", value: "4,300 XP", category: "Patín Show", extra: "Lvl 4 - Destacado" },
      { id: 3, name: "Bautista Castro", value: "3,950 XP", category: "Futsal 2015", extra: "Lvl 3 - Titular" },
      { id: 4, name: "Clara Espósito", value: "3,700 XP", category: "Vóley Infantil", extra: "Lvl 3 - Titular" },
      { id: 5, name: "Mateo Rossi", value: "3,500 XP", category: "Futsal 2016", extra: "Lvl 3 - Inicial" }
    ],
    "COMPANERO": [
      { id: 1, name: "Bautista Castro", value: "14 votos", category: "Futsal 2015", extra: "Premio Compañerismo 🤝" },
      { id: 2, name: "Mateo Rossi", value: "11 votos", category: "Futsal 2016", extra: "Siempre ayuda a guardar pelotas" },
      { id: 3, name: "Clara Espósito", value: "9 votos", category: "Vóley Infantil", extra: "Alienta a todas en la cancha" },
      { id: 4, name: "Delfina Solari", value: "8 votos", category: "Patín Show", extra: "Muy solidaria con las iniciales" },
      { id: 5, name: "Thiago Medina", value: "6 votos", category: "Futsal 2015", extra: "Gran líder positivo" }
    ],
    "ASISTENCIA": [
      { id: 1, name: "Delfina Solari", value: "100%", category: "Patín Show", extra: "Asistencia Perfecta ⭐" },
      { id: 2, name: "Clara Espósito", value: "98%", category: "Vóley Infantil", extra: "Solo faltó 1 vez por examen" },
      { id: 3, name: "Thiago Medina", value: "95%", category: "Futsal 2015", extra: "Siempre media hora antes" },
      { id: 4, name: "Bautista Castro", value: "92%", category: "Futsal 2015", extra: "Compromiso total" },
      { id: 5, name: "Mateo Rossi", value: "90%", category: "Futsal 2016", extra: "Entrenamiento firme" }
    ],
    "FAIRPLAY": [
      { id: 1, name: "Thiago Medina", value: "5 insignias", category: "Futsal 2015", extra: "Respeta árbitros y rivales" },
      { id: 2, name: "Delfina Solari", value: "4 insignias", category: "Patín Show", extra: "Ayuda a levantar a compañeras" },
      { id: 3, name: "Mateo Rossi", value: "4 insignias", category: "Futsal 2016", extra: "Saluda siempre al final" },
      { id: 4, name: "Clara Espósito", value: "3 insignias", category: "Vóley Infantil", extra: "Juego limpio garantizado" },
      { id: 5, name: "Bautista Castro", value: "2 insignias", category: "Futsal 2015", extra: "Cero faltas técnicas" }
    ],
    "JUEGOS": [
      { id: 1, name: "Mateo Rossi", value: "1,250 pts", category: "Futsal 2016", extra: "Récord Laberinto" },
      { id: 2, name: "Thiago Medina", value: "1,100 pts", category: "Futsal 2015", extra: "Récord Futsal Manager" },
      { id: 3, name: "Delfina Solari", value: "950 pts", category: "Patín Show", extra: "Récord Memotest" },
      { id: 4, name: "Clara Espósito", value: "820 pts", category: "Vóley Infantil", extra: "Puntaje alto Memotest" },
      { id: 5, name: "Bautista Castro", value: "780 pts", category: "Futsal 2015", extra: "Estratega Manager" }
    ]
  };

  const getBadgeIcon = (index) => {
    if (index === 0) return <Medal className="text-yellow-500" size={24} />;
    if (index === 1) return <Medal className="text-gray-400" size={24} />;
    if (index === 2) return <Medal className="text-orange-600" size={24} />;
    return <span className="text-gray-400 font-bold font-mono text-sm">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black">
      {/* Header */}
      <div className="bg-jn-black text-white py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center">
            <ClubShield className="w-14 h-16" animate={false} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">RANKINGS DEL CLUB</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Reconocimiento al esfuerzo, compañerismo y Fair Play de nuestro semillero.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        
        {/* FILTROS DE LEADERBOARD */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => setRankingType("XP")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              rankingType === 'XP' ? 'bg-jn-red text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Trophy size={14} /> Participación (XP)
          </button>
          
          <button 
            onClick={() => setRankingType("COMPANERO")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              rankingType === 'COMPANERO' ? 'bg-jn-red text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ThumbsUp size={14} /> Mejor Compañero
          </button>

          <button 
            onClick={() => setRankingType("ASISTENCIA")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              rankingType === 'ASISTENCIA' ? 'bg-jn-red text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar size={14} /> Asistencia Stars
          </button>

          <button 
            onClick={() => setRankingType("FAIRPLAY")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              rankingType === 'FAIRPLAY' ? 'bg-jn-red text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Award size={14} /> Fair Play
          </button>

          <button 
            onClick={() => setRankingType("JUEGOS")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              rankingType === 'JUEGOS' ? 'bg-jn-red text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Gamepad2 size={14} /> High Scores Juegos
          </button>
        </div>

        {/* TABLA DE POSICIONES */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-black text-lg text-jn-black uppercase flex items-center gap-2">
              🏆 Top 5 de {rankingType === 'XP' ? 'Participación' : 
                          rankingType === 'COMPANERO' ? 'Mejor Compañero' :
                          rankingType === 'ASISTENCIA' ? 'Asistencia' :
                          rankingType === 'FAIRPLAY' ? 'Juego Limpio' : 'Puntajes de Juegos'}
            </h3>
            <span className="bg-jn-red/10 text-jn-red px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Junio 2026
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {rankings[rankingType].map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getBadgeIcon(idx)}
                  </div>
                  <div>
                    <p className="font-black text-base text-jn-black leading-tight">{item.name}</p>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.category}</span>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-center items-end">
                  <p className="text-lg font-black text-jn-red">{item.value}</p>
                  <p className="text-[11px] text-gray-400 font-semibold italic">{item.extra}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOTA DE VALORES */}
        <div className="bg-gradient-to-br from-jn-red/5 to-jn-darkred/5 border border-jn-red/10 p-6 rounded-2xl text-center max-w-lg mx-auto">
          <h4 className="font-bold text-sm text-jn-red uppercase tracking-wider mb-2">⭐ Valores del Club Jorge Newbery</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Recordá que los rankings se actualizan semanalmente. Los profes cargan la asistencia y las estrellas de Fair Play al finalizar cada práctica. ¡El respeto y el compañerismo cotizan doble!
          </p>
        </div>

      </div>
    </div>
  );
}
