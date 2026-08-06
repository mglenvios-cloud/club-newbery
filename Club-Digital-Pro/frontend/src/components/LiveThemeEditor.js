"use client";
import React, { useState } from 'react';
import { Palette, Type, RefreshCw, X, Check, Sparkles, Sliders, Box, Image as ImageIcon, Tv, Shield, Paintbrush, ZoomIn } from 'lucide-react';
import { useTheme, COLOR_PRESETS, OBJECT_3D_OPTIONS, FONT_OPTIONS, FONT_SIZE_OPTIONS, SHIELD_SHAPE_OPTIONS } from './ThemeContext';

export default function LiveThemeEditor() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('bgScale'); // 'bgScale' | 'colors' | '3d' | 'texts' | 'tv' | 'logo'
  const { theme, updateTheme, resetTheme } = useTheme();

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateTheme({ customLogoUrl: event.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE ACTIVADOR */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-6 z-[999] px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center gap-2 group backdrop-blur-md"
        title="Personalizador de Tipografías, Escudos 3D y Paletas Tricolor"
      >
        <Palette className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        <span className="hidden sm:inline">Editor en Vivo</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {/* DRAWER / PANEL FLOTANTE DE CONFIGURACIÓN */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-4 sm:right-6 z-[1000] w-[94vw] sm:w-[440px] bg-zinc-950/95 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 text-white space-y-4 font-sans max-h-[85vh] overflow-y-auto">
          
          {/* Header del Panel */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-400">Editor Tricolor, Fondos & Escudos 3D (V9)</h3>
                <p className="text-[10px] text-emerald-300 font-bold">Configurá la paleta de fondo, escala 3D y colores</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs Nav (6 Pestañas) */}
          <div className="grid grid-cols-6 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold">
            <button
              onClick={() => setActiveTab('bgScale')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === 'bgScale' ? 'bg-emerald-600 text-white shadow-md font-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette size={12} />
              <span>Fondo & Escala</span>
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === 'colors' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette size={12} />
              <span>Paleta 3C</span>
            </button>
            <button
              onClick={() => setActiveTab('3d')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === '3d' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Box size={12} />
              <span>Escudos 3D</span>
            </button>
            <button
              onClick={() => setActiveTab('texts')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === 'texts' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Type size={12} />
              <span>Textos</span>
            </button>
            <button
              onClick={() => setActiveTab('tv')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === 'tv' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Tv size={12} />
              <span>Canal TV</span>
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`py-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                activeTab === 'logo' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ImageIcon size={12} />
              <span>Foto / Logo</span>
            </button>
          </div>

          {/* CONTENIDO TAB DEDICADA: FONDO DE PÁGINAS Y ESCALA 3D */}
          {activeTab === 'bgScale' && (
            <div className="space-y-4 text-xs">
              
              {/* Personalizador de Fondo de la Plataforma */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 font-extrabold text-[11px]">
                  <span className="flex items-center gap-1.5"><Palette size={14} /> Color de Fondo de Páginas y 3D</span>
                  <span className="font-mono text-[10px] text-white bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">{theme.bgColor || '#070707'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { name: 'Noche', hex: '#040406' },
                    { name: 'Azul Noche', hex: '#070a12' },
                    { name: 'Verde Noche', hex: '#05120a' },
                    { name: 'Granate', hex: '#140505' },
                    { name: 'Carbón', hex: '#111111' },
                    { name: 'Negro OLED', hex: '#000000' },
                  ].map((bgPreset) => (
                    <button
                      key={bgPreset.hex}
                      onClick={() => updateTheme({ bgColor: bgPreset.hex })}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        (theme.bgColor || '#070707') === bgPreset.hex
                          ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-md'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: bgPreset.hex }} />
                      <span className="text-[9px] truncate">{bgPreset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-gray-300 font-bold">Selector de Color de Fondo Libre:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.bgColor || '#070707'}
                      onChange={(e) => updateTheme({ bgColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{theme.bgColor || '#070707'}</span>
                  </div>
                </div>
              </div>

              {/* Slider de Escala / Tamaño Manual del Objeto 3D */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-black">
                    📏 Tamaño del Objeto 3D (Escala Pelota/Escudo)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    {Math.round((theme.objectScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={theme.objectScale || 1.0}
                  onChange={(e) => updateTheme({ objectScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold">
                  <span>50% (Pequeño)</span>
                  <span>100% (Estándar)</span>
                  <span>250% (Gigante)</span>
                </div>
              </div>

            </div>
          )}

          {/* CONTENIDO TAB 1: COMBINADOR TRICOLOR & FONDOS */}
          {activeTab === 'colors' && (
            <div className="space-y-4 text-xs">
              
              {/* Personalizador de Fondo de la Plataforma (AL PRINCIPIO DE LA PESTAÑA) */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-emerald-400 font-extrabold text-[11px]">
                  <span className="flex items-center gap-1.5"><Palette size={14} /> Color de Fondo de Páginas y 3D</span>
                  <span className="font-mono text-[10px] text-white bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">{theme.bgColor || '#070707'}</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { name: 'Noche', hex: '#040406' },
                    { name: 'Azul Noche', hex: '#070a12' },
                    { name: 'Verde Noche', hex: '#05120a' },
                    { name: 'Granate', hex: '#140505' },
                    { name: 'Carbón', hex: '#111111' },
                    { name: 'Negro OLED', hex: '#000000' },
                  ].map((bgPreset) => (
                    <button
                      key={bgPreset.hex}
                      onClick={() => updateTheme({ bgColor: bgPreset.hex })}
                      className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        (theme.bgColor || '#070707') === bgPreset.hex
                          ? 'border-emerald-500 bg-emerald-500/20 text-white font-bold shadow-md'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: bgPreset.hex }} />
                      <span className="text-[9px] truncate">{bgPreset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] text-gray-300 font-bold">Selector de Color de Fondo Libre:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.bgColor || '#070707'}
                      onChange={(e) => updateTheme({ bgColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{theme.bgColor || '#070707'}</span>
                  </div>
                </div>
              </div>

              {/* Combinador Personalizado de 3 Colores */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-extrabold text-[11px]">
                  <Paintbrush size={14} />
                  <span>Personalizador Tricolor del Club (3 Colores)</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 mb-1">1. Principal</label>
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 mb-1">2. Secundario</label>
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => updateTheme({ accentColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 mb-1">3. Detalle / Borde</label>
                    <input
                      type="color"
                      value={theme.tertiaryColor || "#ffffff"}
                      onChange={(e) => updateTheme({ tertiaryColor: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>
              </div>

              {/* Presets Tricolor Institucionales */}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Paletas Tricolor Predefinidas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = theme.primaryColor === p.primary && theme.accentColor === p.accent;
                    return (
                      <button
                        key={p.name}
                        onClick={() =>
                          updateTheme({
                            primaryColor: p.primary,
                            accentColor: p.accent,
                            tertiaryColor: p.tertiary,
                            presetName: p.name,
                            ...(p.clubName ? { clubName: p.clubName, clubShortName: p.clubShortName, tvTitle: p.tvTitle } : {})
                          })
                        }
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {p.preview.map((c, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-[10px] truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipografía Oficial (12 Opciones de Google Fonts) */}
              <div>
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 font-black flex items-center justify-between">
                  <span>🔤 12 Tipografías Oficiales</span>
                  <span className="text-[9px] text-gray-400 font-mono font-normal">Google Fonts</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = theme.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateTheme({ fontFamily: f.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-600/15 text-white font-black shadow-md'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span style={{ fontFamily: f.fontCss }} className="text-xs truncate">{f.name}</span>
                        {isSelected && <Check size={14} className="text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tamaños de Letra Editables */}
              <div>
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 font-black flex items-center gap-1.5">
                  <ZoomIn size={14} /> Tamaño de Letra Editable
                </label>
                <div className="space-y-1.5">
                  {FONT_SIZE_OPTIONS.map((fs) => {
                    const isSelected = (theme.fontSizeScale || "100%") === fs.id;
                    return (
                      <button
                        key={fs.id}
                        onClick={() => updateTheme({ fontSizeScale: fs.id })}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-600/15 text-white font-bold'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{fs.name}</span>
                          <span className="text-[10px] text-gray-400 block font-light">{fs.desc}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/40 px-2 py-1 rounded-md border border-emerald-500/30">
                          {fs.pxSize}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO TAB 2: GEOMETRÍAS Y SELECCIÓN DE ESCUDOS 3D */}
          {activeTab === '3d' && (
            <div className="space-y-4 text-xs">
              
              {/* Slider de Escala / Tamaño Manual del Objeto 3D (AL PRINCIPIO DE LA PESTAÑA) */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-black">
                    📏 Tamaño del Objeto 3D (Escala Pelota/Escudo)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    {Math.round((theme.objectScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={theme.objectScale || 1.0}
                  onChange={(e) => updateTheme({ objectScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold">
                  <span>50% (Pequeño)</span>
                  <span>100% (Estándar)</span>
                  <span>250% (Gigante)</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Objeto 3D Principal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OBJECT_3D_OPTIONS.map((opt) => {
                    const isSelected = theme.object3D === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => updateTheme({ object3D: opt.id })}
                        className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-600/15 text-white shadow-lg'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="font-bold text-xs text-white">{opt.name}</span>
                        {isSelected && <Check size={14} className="text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider de Escala / Tamaño Manual del Objeto 3D */}
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-black">
                    📏 Tamaño del Objeto 3D (Escala Pelota/Escudo)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {Math.round((theme.objectScale || 1.0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={theme.objectScale || 1.0}
                  onChange={(e) => updateTheme({ objectScale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                  <span>50% (Pequeño)</span>
                  <span>100% (Estándar)</span>
                  <span>250% (Gigante)</span>
                </div>
              </div>

              {/* Catálogo Extendido de 8 Formas de Escudos 3D */}
              <div>
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 font-extrabold flex items-center gap-1.5">
                  <Shield size={14} /> 8 Formas Geométricas de Escudos 3D
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SHIELD_SHAPE_OPTIONS.map((shape) => {
                    const isSelected = (theme.shieldShape || 'classic') === shape.id;
                    return (
                      <button
                        key={shape.id}
                        onClick={() => updateTheme({ object3D: 'shield', shieldShape: shape.id })}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span className="font-bold text-[11px] text-white">{shape.name}</span>
                        <span className="text-[9px] text-gray-400 leading-tight">{shape.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO TAB 3: FUENTES & TEXTOS */}
          {activeTab === 'texts' && (
            <div className="space-y-4 text-xs">
              {/* Tamaños de Letra Editables */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl space-y-2">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-black flex items-center gap-1.5">
                  <ZoomIn size={14} /> Tamaño de Letra Editable
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {FONT_SIZE_OPTIONS.map((fs) => {
                    const isSelected = (theme.fontSizeScale || "100%") === fs.id;
                    return (
                      <button
                        key={fs.id}
                        onClick={() => updateTheme({ fontSizeScale: fs.id })}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-600/25 text-white font-bold shadow-lg'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-black block text-white">{fs.name}</span>
                          <span className="text-[10px] text-gray-400 block font-light">{fs.desc}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/50 px-2.5 py-1 rounded-lg border border-emerald-500/40 shrink-0">
                          {fs.pxSize}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipografía Oficial (12 Opciones de Google Fonts) */}
              <div>
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 font-black flex items-center justify-between">
                  <span>🔤 12 Tipografías Oficiales</span>
                  <span className="text-[9px] text-gray-400 font-mono font-normal">Google Fonts</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = theme.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => updateTheme({ fontFamily: f.id })}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-red-500 bg-red-600/20 text-white font-black shadow-md'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        <span style={{ fontFamily: f.fontCss }} className="text-xs truncate">{f.name}</span>
                        {isSelected && <Check size={14} className="text-red-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Edición de Textos del Club */}
              <div className="space-y-3 border-t border-white/10 pt-3">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider font-black">
                  📝 Textos del Club
                </label>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Nombre Completo del Club</label>
                  <input
                    type="text"
                    value={theme.clubName}
                    onChange={(e) => updateTheme({ clubName: e.target.value })}
                    placeholder="Ej: CLUB JORGE NEWBERY"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Nombre Corto / Marca</label>
                  <input
                    type="text"
                    value={theme.clubShortName}
                    onChange={(e) => updateTheme({ clubShortName: e.target.value })}
                    placeholder="Ej: JORGE NEWBERY"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Título del Centro de Gestión</label>
                  <input
                    type="text"
                    value={theme.managementTitle}
                    onChange={(e) => updateTheme({ managementTitle: e.target.value })}
                    placeholder="Ej: Centro de Gestión Deportiva"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Subtítulo de Disciplina y Categorías</label>
                  <input
                    type="text"
                    value={theme.disciplineSubtitle}
                    onChange={(e) => updateTheme({ disciplineSubtitle: e.target.value })}
                    placeholder="Ej: Futsal AFA — Temporada 2026 · 11 Categorías"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Subtítulo Menú Superior</label>
                  <input
                    type="text"
                    value={theme.subTitle}
                    onChange={(e) => updateTheme({ subTitle: e.target.value })}
                    placeholder="Ej: CLUB DIGITAL"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CONTENIDO TAB 4: MÓDULO CANAL TV */}
          {activeTab === 'tv' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Título del Canal de TV</label>
                <input
                  type="text"
                  value={theme.tvTitle}
                  onChange={(e) => updateTheme({ tvTitle: e.target.value })}
                  placeholder="Ej: 📺 NEWBERY TV o CLUB TV"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Descripción del Canal TV</label>
                <textarea
                  rows={3}
                  value={theme.tvDesc}
                  onChange={(e) => updateTheme({ tvDesc: e.target.value })}
                  placeholder="Descripción del canal de transmisión..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-red-500 transition-colors text-xs"
                />
              </div>
            </div>
          )}

          {/* CONTENIDO TAB 5: SUBIR / PEGAR FOTO O ESCUDO */}
          {activeTab === 'logo' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Pegar Link o URL de tu Escudo / Foto
                </label>
                <input
                  type="text"
                  value={theme.customLogoUrl}
                  onChange={(e) => updateTheme({ customLogoUrl: e.target.value })}
                  placeholder="https://ejemplo.com/escudo.png"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[11px] focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  O Subir Foto desde tu Computadora
                </label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer text-gray-300 hover:text-white transition-all font-bold">
                  <ImageIcon size={16} className="text-red-400" />
                  <span>Cargar Imagen del Escudo</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {theme.customLogoUrl && (
                <div className="pt-2 border-t border-white/10 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center overflow-hidden shadow-lg">
                    <img src={theme.customLogoUrl} alt="Escudo Custom" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 block">✓ Imagen Proyectada 3D & Navbar</span>
                    <span className="text-[10px] text-gray-400 block">Se imprime sobre la pelota / escudo 3D</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={resetTheme}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Restablecer</span>
            </button>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles size={12} /> Guardado en vivo
            </span>
          </div>

        </div>
      )}
    </>
  );
}
