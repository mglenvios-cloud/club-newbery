"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useTheme } from '@/components/ThemeContext';
import { Sliders, Palette, Box, Type, ArrowLeft, Check, RefreshCw } from 'lucide-react';

const Newbery3DHero = dynamic(() => import('@/components/Newbery3DHero'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-white font-mono text-sm">
      Cargando Render 3D Babylon.js...
    </div>
  ),
});

const BG_PRESETS = [
  { name: "Noche (Original)", hex: "#040406", border: "#18181b" },
  { name: "Azul Noche", hex: "#070a12", border: "#1e293b" },
  { name: "Verde Noche", hex: "#05120a", border: "#14532d" },
  { name: "Granate", hex: "#140505", border: "#450a0a" },
  { name: "Carbón", hex: "#111111", border: "#27272a" },
  { name: "Negro OLED", hex: "#000000", border: "#3f3f46" },
];

export default function CustomizerPage() {
  const { theme, updateTheme, resetTheme, COLOR_PRESETS, OBJECT_3D_OPTIONS, SHIELD_SHAPE_OPTIONS } = useTheme();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16 flex flex-col lg:flex-row">
        {/* LADO IZQUIERDO: Render 3D Interactivo en Tiempo Real */}
        <div className="lg:w-7/12 h-[500px] lg:h-[calc(100vh-4rem)] relative bg-black border-r border-white/10">
          <Newbery3DHero />

          <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Volver al Inicio
            </Link>
          </div>

          <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs space-y-1">
            <p className="font-extrabold text-emerald-400">⚡ Vista Previa 3D Activa</p>
            <p className="text-gray-300">Fondo actual: <span className="font-mono text-white">{theme?.bgColor || '#040406'}</span></p>
            <p className="text-gray-300">Escala 3D: <span className="font-mono text-white">{Math.round((theme?.objectScale || 1.0) * 100)}%</span></p>
          </div>
        </div>

        {/* LADO DERECHO: Panel de Control Visible */}
        <div className="lg:w-5/12 p-6 overflow-y-auto space-y-8 bg-zinc-900/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-wider">Personalizador 3D & Tema</h1>
              <p className="text-xs text-emerald-400 font-bold">Cambios en tiempo real sobre la plataforma</p>
            </div>
            <button
              onClick={resetTheme}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <RefreshCw size={12} /> Restablecer
            </button>
          </div>

          {/* SECCIÓN 1: Color de Fondo de Páginas y 3D */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Palette size={18} />
              <h3>1. Color de Fondo de Páginas y Escena 3D</h3>
            </div>
            <p className="text-xs text-gray-400">Seleccioná un tono oscuro o elegí un color personalizado:</p>
            
            <div className="grid grid-cols-3 gap-2">
              {BG_PRESETS.map((bg) => (
                <button
                  key={bg.hex}
                  onClick={() => updateTheme({ bgColor: bg.hex })}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    (theme?.bgColor || '#040406') === bg.hex
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30'
                      : 'border-white/10 hover:border-white/30 bg-black/40'
                  }`}
                >
                  <div className="w-full h-6 rounded-lg mb-2 border" style={{ backgroundColor: bg.hex, borderColor: bg.border }} />
                  <span className="text-[11px] font-bold text-gray-200">{bg.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs text-gray-300 font-bold">Color Personalizado Libre:</label>
              <input
                type="color"
                value={theme?.bgColor || "#040406"}
                onChange={(e) => updateTheme({ bgColor: e.target.value })}
                className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border border-white/20"
              />
              <span className="font-mono text-xs text-gray-400">{theme?.bgColor || "#040406"}</span>
            </div>
          </div>

          {/* SECCIÓN 2: Escala del Objeto 3D */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                <Box size={18} />
                <h3>2. Tamaño del Objeto 3D (Escala)</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                {Math.round((theme?.objectScale || 1.0) * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={theme?.objectScale || 1.0}
              onChange={(e) => updateTheme({ objectScale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
              <span>50% (Pequeño)</span>
              <span>100% (Estándar)</span>
              <span>250% (Gigante)</span>
            </div>
          </div>

          {/* SECCIÓN 3: Paletas Tricolor */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase">3. Paletas Tricolor Predefinidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => updateTheme({
                    primaryColor: p.primary,
                    accentColor: p.accent,
                    tertiaryColor: p.tertiary,
                    clubName: p.clubName,
                    clubShortName: p.clubShortName,
                    tvTitle: p.tvTitle
                  })}
                  className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/30 text-left space-y-2 transition-all"
                >
                  <div className="flex h-4 rounded-md overflow-hidden border border-white/20">
                    <div className="w-1/3" style={{ backgroundColor: p.primary }} />
                    <div className="w-1/3" style={{ backgroundColor: p.accent }} />
                    <div className="w-1/3" style={{ backgroundColor: p.tertiary }} />
                  </div>
                  <p className="text-[11px] font-bold text-gray-200 truncate">{p.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
