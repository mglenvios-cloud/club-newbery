"use client";

import React, { useState } from 'react';
import { 
  Building2, Image as ImageIcon, Palette, Layout, User, 
  ArrowLeft, ArrowRight, Check, CheckCircle2
} from 'lucide-react';

export default function CrearClubPage() {
  const [step, setStep] = useState(1);
  
  // Onboarding wizard data
  const [clubForm, setClubForm] = useState({
    nombre: '', slug: '', email: '', dominio: '',
    logoUrl: '', bannerUrl: '',
    colorPrimario: '#cc0000', colorSecundario: '#000000',
    modulos: { socios: true, cuotas: true, deportes: true, newberyTv: false, marketing: false },
    adminEmail: '', adminPassword: ''
  });

  const [finished, setFinished] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && (!clubForm.nombre || !clubForm.slug || !clubForm.email)) {
      return alert("Por favor completa los campos obligatorios del Paso 1.");
    }
    if (step === 5 && (!clubForm.adminEmail || !clubForm.adminPassword)) {
      return alert("Por favor completa los datos de administrador del Paso 5.");
    }
    
    if (step < 5) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleModulo = (key) => {
    setClubForm({
      ...clubForm,
      modulos: { ...clubForm.modulos, [key]: !clubForm.modulos[key] }
    });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center font-black text-xs text-red-500">
            CDP
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">Club Digital Pro</span>
        </div>
        <a 
          href="/" 
          className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-[9px] px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={12} /> Volver a Home
        </a>
      </nav>

      {/* BODY CONTENT */}
      <main className="p-8 flex-1 max-w-lg mx-auto w-full flex items-center justify-center">
        
        {finished ? (
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl text-center space-y-6 animate-fadeIn shadow-2xl w-full text-xs">
            <div className="w-16 h-16 rounded-full mx-auto bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase text-white">¡Onboarding Completado!</h2>
              <p className="text-zinc-400 leading-relaxed font-light">
                La franquicia para **{clubForm.nombre}** se ha dado de alta con éxito en Club Digital Pro. Las variables de colores y temas se inyectaron a tu portal.
              </p>
            </div>
            <div className="border-t border-zinc-850 pt-4 text-left space-y-2 font-bold text-[10px] text-zinc-400">
              <p>Dominio: <span className="text-white font-mono">{clubForm.dominio || `www.${clubForm.slug}.com`}</span></p>
              <p>Admin Email: <span className="text-white lowercase">{clubForm.adminEmail}</span></p>
            </div>
            <a 
              href="/demo"
              className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs py-3.5 rounded-xl w-full block transition-all cursor-pointer"
            >
              Probar Demo del Club
            </a>
          </div>
        ) : (
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full text-left space-y-6 shadow-2xl animate-fadeIn">
            
            {/* Steps breadcrumbs */}
            <div className="flex justify-between items-center text-[8px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-4">
              <span>Paso {step} de 5</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={`w-2.5 h-2.5 rounded-full ${s === step ? 'bg-red-500' : s < step ? 'bg-zinc-700' : 'bg-zinc-900'}`} />
                ))}
              </div>
            </div>

            {/* STEP 1: DATOS CLUB */}
            {step === 1 && (
              <div className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5"><Building2 size={16} /> Paso 1: Datos del Club</h3>
                <div>
                  <label className="block mb-1 text-[8px]">Nombre Oficial *</label>
                  <input 
                    type="text" required
                    value={clubForm.nombre}
                    onChange={e => setClubForm({ ...clubForm, nombre: e.target.value })}
                    placeholder="Ej: Club Social y Deportivo"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[8px]">Slug Único *</label>
                  <input 
                    type="text" required
                    value={clubForm.slug}
                    onChange={e => setClubForm({ ...clubForm, slug: e.target.value })}
                    placeholder="club-social"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[8px]">Correo Electrónico *</label>
                  <input 
                    type="email" required
                    value={clubForm.email}
                    onChange={e => setClubForm({ ...clubForm, email: e.target.value })}
                    placeholder="contacto@club.com"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none lowercase font-semibold"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: LOGO E IDENTIDAD */}
            {step === 2 && (
              <div className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5"><ImageIcon size={16} /> Paso 2: Recursos de Marca</h3>
                <div>
                  <label className="block mb-1 text-[8px]">URL Logotipo Oficial</label>
                  <input 
                    type="text"
                    value={clubForm.logoUrl}
                    onChange={e => setClubForm({ ...clubForm, logoUrl: e.target.value })}
                    placeholder="https://ejemplo.com/logo.png"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[8px]">URL Banner Login / Portal</label>
                  <input 
                    type="text"
                    value={clubForm.bannerUrl}
                    onChange={e => setClubForm({ ...clubForm, bannerUrl: e.target.value })}
                    placeholder="https://ejemplo.com/banner.png"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: ELEGIR COLORES */}
            {step === 3 && (
              <div className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5"><Palette size={16} /> Paso 3: Colores Institucionales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[8px]">Color Primario</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={clubForm.colorPrimario}
                        onChange={e => setClubForm({ ...clubForm, colorPrimario: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white text-center font-mono outline-none"
                      />
                      <input 
                        type="color"
                        value={clubForm.colorPrimario}
                        onChange={e => setClubForm({ ...clubForm, colorPrimario: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[8px]">Color Secundario</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={clubForm.colorSecundario}
                        onChange={e => setClubForm({ ...clubForm, colorSecundario: e.target.value })}
                        className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white text-center font-mono outline-none"
                      />
                      <input 
                        type="color"
                        value={clubForm.colorSecundario}
                        onChange={e => setClubForm({ ...clubForm, colorSecundario: e.target.value })}
                        className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SELECCIONAR MÓDULOS */}
            {step === 4 && (
              <div className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5"><Layout size={16} /> Paso 4: Módulos del Plan</h3>
                
                <div className="space-y-2">
                  {[
                    { key: 'socios', title: '👥 Centro de Socios y Carnet QR' },
                    { key: 'cuotas', title: '💳 Cuotas y Finanzas MP' },
                    { key: 'deportes', title: '⚽ Gestión Deportiva e Inferiores' },
                    { key: 'newberyTv', title: '📺 Newbery TV Streaming Premium' },
                    { key: 'marketing', title: '📈 Marketing y Auspicios CTR' }
                  ].map(m => (
                    <div 
                      key={m.key}
                      onClick={() => toggleModulo(m.key)}
                      className={`p-3 bg-zinc-900/60 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
                        clubForm.modulos[m.key] ? 'border-red-500/40 text-white' : 'border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <span className="font-bold">{m.title}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                        clubForm.modulos[m.key] ? 'bg-red-600 border-red-600 text-white' : 'border-zinc-800 text-transparent'
                      }`}>
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: CREAR ADMINISTRADOR */}
            {step === 5 && (
              <div className="space-y-4 text-xs font-bold text-gray-400 uppercase">
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-1.5"><User size={16} /> Paso 5: Cuenta Administrador</h3>
                <div>
                  <label className="block mb-1 text-[8px]">Correo de Administrador *</label>
                  <input 
                    type="email" required
                    value={clubForm.adminEmail}
                    onChange={e => setClubForm({ ...clubForm, adminEmail: e.target.value })}
                    placeholder="admin@mi-club.com"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none lowercase font-semibold"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[8px]">Contraseña de Acceso *</label>
                  <input 
                    type="password" required
                    value={clubForm.adminPassword}
                    onChange={e => setClubForm({ ...clubForm, adminPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* ACTION NAV BUTTONS */}
            <div className="flex gap-3 pt-4 border-t border-zinc-850">
              {step > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-[10px] py-3.5 px-4 rounded-xl cursor-pointer"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={handleNextStep}
                className="flex-1 bg-white hover:bg-zinc-200 text-black font-black uppercase text-[10px] py-3.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                {step === 5 ? 'Confirmar Registro' : 'Siguiente Paso'} <ArrowRight size={12} />
              </button>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="h-16 border-t border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase select-none">
        <span>© 2026 Club Digital Pro SaaS</span>
        <span>Asistente Onboarding de Nuevos Clubes</span>
      </footer>

    </div>
  );
}
