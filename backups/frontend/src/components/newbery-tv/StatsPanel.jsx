import React from 'react';

export default function StatsPanel({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse py-4">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-2 w-6 bg-zinc-800 rounded"></div>
              <div className="h-2 w-16 bg-zinc-800 rounded"></div>
              <div className="h-2 w-6 bg-zinc-800 rounded"></div>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // Comprobar si existen estadísticas detalladas reales cargadas en base de datos.
  // Como FutsalMatch solo almacena ourScore, opponentScore y attendance, y no campos detallados de posesión/tiros,
  // informamos de manera elegante que los datos de juego detallados están en proceso de carga o no disponibles.
  const hasDetailedStats = stats && (
    stats.possessionHome !== undefined || 
    stats.shotsHome !== undefined || 
    stats.cornersHome !== undefined
  );

  return (
    <div className="space-y-2.5 select-none text-left">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Estadísticas de Juego</span>
        <span className="text-[8px] bg-red-650/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black tracking-widest">LIGA PRO</span>
      </div>

      {hasDetailedStats ? (
        <div className="space-y-2 divide-y divide-zinc-900">
          {/* Si en algún futuro se cargaran estadísticas reales por API */}
          <div className="flex justify-between text-[10px] uppercase text-zinc-400 font-bold py-1.5">
            <span>Posesión</span>
            <span>{stats.possessionHome}% - {stats.possessionAway}%</span>
          </div>
          <div className="flex justify-between text-[10px] uppercase text-zinc-400 font-bold py-1.5">
            <span>Remates</span>
            <span>{stats.shotsHome} - {stats.shotsAway}</span>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/20 border border-zinc-800/80 p-4 rounded-2xl text-center">
          <p className="text-[10px] text-zinc-500 italic">Estadísticas detalladas de juego no cargadas para este encuentro.</p>
          {stats && stats.attendance > 0 && (
            <p className="text-[10px] text-zinc-400 font-bold mt-2 uppercase tracking-wide">
              Público asistente: {stats.attendance}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export { StatsPanel };
