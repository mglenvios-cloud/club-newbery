import React from 'react';
import Link from 'next/link';
import { Trophy, Activity, Calendar, Star, Users, ArrowLeft, PlayCircle, Award } from 'lucide-react';
import ClubShield from '@/components/ClubShield';
import { API_URL, DEMO_MODE } from '@/config';

const mockPlayers = {
  "1": { name: "Thiago Medina", age: 11, category: "2015", position: "Ala", team: "Futsal AFA Sub-11", achievements: ["Goleador", "Compañero ⭐", "Fair Play"], matchesPlayed: 14, goals: 12, assists: 8, videoUrl: "https://www.youtube.com/watch?v=mock1", bio: "Thiago comenzó en la escuelita a los 5 años. Se destaca por su gran velocidad de regate y su visión de juego asistiendo a sus compañeros." },
  "2": { name: "Mateo Rossi", age: 10, category: "2016", position: "Cierre", team: "Futsal AFA Sub-10", achievements: ["Fair Play ⭐", "Asistencia Perfecta"], matchesPlayed: 12, goals: 3, assists: 9, videoUrl: "https://www.youtube.com/watch?v=mock2", bio: "Mateo es un defensa sólido, siempre ordenando al equipo desde el fondo y entregando pases precisos." },
  "3": { name: "Bautista Castro", age: 11, category: "2015", position: "Ala", team: "Futsal AFA Sub-11", achievements: ["Mejor Compañero 🤝", "Esfuerzo Escolar"], matchesPlayed: 10, goals: 8, assists: 4, videoUrl: "https://www.youtube.com/watch?v=mock3", bio: "Bautista comenzó en la escuelita. Es un ala de gran velocidad, muy cooperativo en la marca y destacado en el colegio." },
  "4": { name: "Benjamín Rossi", age: 8, category: "2018", position: "Ala", team: "Futsal Promocional B", achievements: ["Goleador Semillero", "Velocidad"], matchesPlayed: 8, goals: 10, assists: 2, videoUrl: null, bio: "Benja es una de las grandes promesas de la categoría promocional, muy movedizo y definidor." },
  "5": { name: "Juana Rossi", age: 10, category: "2016", position: "Solo Libre", team: "Patín Competición", achievements: ["Medalla de Oro 🥇", "Expresión Artística"], matchesPlayed: 6, goals: 0, assists: 0, videoUrl: "https://www.youtube.com/watch?v=mock5", bio: "Juana brilla sobre las ruedas. Su perseverancia la llevó a ganar el metropolitano de patín artístico libre." },
  "6": { name: "Delfina Solari", age: 11, category: "2015", position: "Show Grupal", team: "Patín Competición", achievements: ["Esfuerzo Escolar 📚", "Asistencia Perfecta"], matchesPlayed: 8, goals: 0, assists: 0, videoUrl: null, bio: "Delfi es la referente del grupo show de patín, coordinando a sus compañeras con liderazgo y constancia." }
};

export default async function PlayerProfilePage({ params }) {
  const p = await params;
  const id = p.id;
  
  let player = null;
  if (DEMO_MODE) {
    player = mockPlayers[id];
  }

  if (!player) {
    try {
      const res = await fetch(`${API_URL}/api/players/${id}`, { cache: 'no-store' });
      if (res.ok) {
        player = await res.json();
      }
    } catch (e) {
      console.error("Error fetching player profile from DB:", e);
    }
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6 text-jn-black">
        <ClubShield className="w-16 h-20 mb-4" animate={false} />
        <h2 className="text-2xl font-black">Jugador no encontrado</h2>
        <p className="text-sm text-gray-500 mt-2">La ficha digital solicitada no existe o fue dada de baja.</p>
        <Link href="/mundo-inferiores" className="mt-6 bg-jn-black text-white hover:bg-jn-red px-6 py-2.5 rounded-full font-bold text-xs uppercase transition-colors">
          Volver al Semillero
        </Link>
      </div>
    );
  }

  // Safe mapping of achievements
  const achievementsList = typeof player.achievements === 'string'
    ? (player.achievements ? player.achievements.split(',').map(s => s.trim()) : [])
    : (Array.isArray(player.achievements) ? player.achievements : []);

  const bioText = player.bio || player.description || "Sin descripción técnica cargada.";

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black pb-20 animate-fade-in">
      
      {/* Banner Superior Decorativo */}
      <div className="bg-jn-black text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-6">
          <Link href="/mundo-inferiores" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider mb-4">
            <ArrowLeft size={16} /> Volver al Semillero
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-10 relative z-20 max-w-4xl grid md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: TARJETA PRINCIPAL */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden text-center flex flex-col items-center p-6">
            
            {/* Foto Circular / Iniciales */}
            <div className="w-24 h-24 bg-gradient-to-br from-jn-red to-jn-darkred text-white font-black text-4xl rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-4">
              {player.name.split(" ").map(n => n[0]).join("")}
            </div>

            <h2 className="font-black text-xl text-jn-black tracking-tight leading-none">{player.name}</h2>
            <p className="text-xs font-bold text-jn-red uppercase mt-1 tracking-wide">{player.position}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{player.team}</p>

            <div className="border-t border-gray-100 mt-6 pt-4 w-full grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Edad</p>
                <p className="font-black text-jn-black mt-0.5">{player.age} años</p>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Categoría</p>
                <p className="font-black text-jn-black mt-0.5">Cat. {player.category}</p>
              </div>
            </div>
          </div>

          {/* Vitrina de Insignias/Logros */}
          {achievementsList.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="font-black text-sm text-jn-black uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="text-yellow-500" size={16} /> Insignias Digitales
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievementsList.map((ach, idx) => (
                  <span 
                    key={idx}
                    className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-block"
                  >
                    ✨ {ach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ESTADÍSTICAS Y BIO */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Ficha de Estadísticas de Rendimiento */}
          <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-jn-black uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-jn-red" size={20} /> Rendimiento de la Temporada
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Partidos Jugados</p>
                <p className="text-3xl font-black text-jn-black mt-1">{player.matchesPlayed || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Goles / Logros</p>
                <p className="text-3xl font-black text-jn-red mt-1">{player.goals || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Asistencias</p>
                <p className="text-3xl font-black text-jn-black mt-1">{player.assists || 0}</p>
              </div>
            </div>
          </div>

          {/* Biografía de Juego */}
          <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-jn-black uppercase tracking-wider">Perfil Técnico</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-light">{bioText}</p>
          </div>

          {/* Video de Jugadas Destacadas */}
          {player.videoUrl && (
            <div className="bg-jn-black text-white p-6 rounded-3xl border border-white/5 shadow-lg flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm">Video de Mejores Jugadas</h4>
                <p className="text-[11px] text-gray-400">Mirá los goles y jugadas destacadas de la temporada.</p>
              </div>
              <Link 
                href={player.videoUrl} 
                target="_blank" 
                className="bg-jn-red hover:bg-jn-darkred text-white p-3 rounded-full shadow-md shadow-jn-red/20 flex items-center justify-center transition-colors"
              >
                <PlayCircle size={24} />
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
