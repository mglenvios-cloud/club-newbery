"use client";

import React, { useState } from 'react';
import { Tv, Play, Sliders, Brain, Star, Clock } from 'lucide-react';

export default function NewberyTvModule() {
  const [streamActive, setStreamActive] = useState(false);
  const [ourScore, setOurScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const generateAiChronicle = () => {
    setLoadingAi(true);
    setAiSummary('');
    setTimeout(() => {
      setAiSummary(`"Resumen Táctico de Inteligencia Artificial (Gemini Pro):\nEl club anfitrión se impuso con un marcador final de ${ourScore} a ${opponentScore}. La posesión en zona ofensiva y la rotación táctica del banco resultaron fundamentales para quebrar el bloque defensivo rival durante el segundo tiempo del clásico disputado en casa."`);
      setLoadingAi(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <Tv size={20} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Newbery TV Premium
        </h2>
        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded font-black uppercase">
          Plan Premium
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Streaming Operator & Scoreboard (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Transmisiones en Vivo</h3>
            <button
              onClick={() => setStreamActive(!streamActive)}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border transition-all cursor-pointer ${
                streamActive 
                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {streamActive ? '● EN VIVO' : '🔴 COMENZAR DIRECTO'}
            </button>
          </div>

          {/* Marcador en Vivo */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex justify-between items-center text-center">
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase text-zinc-400">Club Local</span>
              <div className="flex items-center gap-2.5 justify-center">
                <button onClick={() => setOurScore(Math.max(0, ourScore - 1))} className="bg-zinc-800 p-1.5 rounded-lg text-white font-bold cursor-pointer">-</button>
                <span className="text-2xl font-black text-white">{ourScore}</span>
                <button onClick={() => setOurScore(ourScore + 1)} className="bg-zinc-800 p-1.5 rounded-lg text-white font-bold cursor-pointer">+</button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-2.5 bg-black/40 rounded-xl border border-white/5">
              <span className="text-[8px] text-zinc-500 font-bold uppercase">Estado</span>
              <span className="text-[10px] text-white font-mono font-bold">{streamActive ? '38:15' : 'OFFLINE'}</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-xs uppercase text-zinc-400">Rival</span>
              <div className="flex items-center gap-2.5 justify-center">
                <button onClick={() => setOpponentScore(Math.max(0, opponentScore - 1))} className="bg-zinc-800 p-1.5 rounded-lg text-white font-bold cursor-pointer">-</button>
                <span className="text-2xl font-black text-white">{opponentScore}</span>
                <button onClick={() => setOpponentScore(opponentScore + 1)} className="bg-zinc-800 p-1.5 rounded-lg text-white font-bold cursor-pointer">+</button>
              </div>
            </div>
          </div>

          {/* Fast Editor Trimmer */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5"><Sliders size={14} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Editor Trimmer Multimedia</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-zinc-400 uppercase">
              <div>
                <label className="text-[8px] block mb-1">Inicio Recorte (s)</label>
                <input type="number" defaultValue="15" className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="text-[8px] block mb-1">Fin Recorte (s)</label>
                <input type="number" defaultValue="85" className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none" />
              </div>
            </div>
            <button
              onClick={() => alert("Guardando clip multimedia recortado en el servidor")}
              className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-[10px] py-2.5 rounded-xl w-full cursor-pointer transition-all"
            >
              Exportar Clip Recortado
            </button>
          </div>
        </div>

        {/* Gemini AI Tactic Analyst (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5"><Brain size={14} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Táctico Gemini AI</h3>
          
          <div className="space-y-4">
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
              Generá análisis e informes de partidos de forma automatizada mediante inteligencia artificial utilizando las métricas registradas en vivo.
            </p>

            <button
              onClick={generateAiChronicle}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[9px] py-2.5 rounded-xl border border-white/5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Brain size={12} /> {loadingAi ? 'Analizando estadísticas...' : 'Generar Informe del Partido'}
            </button>

            {aiSummary && (
              <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] text-zinc-300 leading-relaxed font-light animate-fadeIn">
                {aiSummary}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
