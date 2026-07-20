"use client";

import React, { useState } from 'react';
import { 
  Trophy, Tv, Users, Activity, Brain, Image as ImageIcon, 
  ArrowRight, Check, Star, Mail, Phone, Send, Shield, Sparkles, Building2, DollarSign
} from 'lucide-react';

export default function Home() {
  const [contactForm, setContactForm] = useState({ nombre: '', club: '', email: '', mensaje: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('¡Mensaje enviado! Nos contactaremos a la brevedad para coordinar la demostración comercial.');
    setContactForm({ nombre: '', club: '', email: '', mensaje: '' });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-500/20 flex items-center justify-center font-black text-xs text-red-500">
            CDP
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">Club Digital Pro</span>
        </div>

        <div className="hidden md:flex gap-6 text-[10px] font-black uppercase text-zinc-400">
          <a href="#que-es" className="hover:text-white transition-all">¿Qué es?</a>
          <a href="#beneficios" className="hover:text-white transition-all">Beneficios</a>
          <a href="#modulos" className="hover:text-white transition-all">Módulos</a>
          <a href="/planes" className="hover:text-white transition-all">Planes</a>
          <a href="#contacto" className="hover:text-white transition-all">Contacto</a>
        </div>

        <div className="flex gap-3">
          <a 
            href="/demo" 
            className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-[9px] px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Probar Demo
          </a>
          <a 
            href="/crear-club" 
            className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-[9px] px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            Crear Club
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative py-20 px-8 flex flex-col items-center justify-center text-center overflow-hidden border-b border-zinc-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600 opacity-5 blur-[120px]" />
        
        <div className="max-w-3xl space-y-6 relative z-10">
          <span className="bg-red-950/40 text-red-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded border border-red-500/20">
            SaaS Deportivo Multi-Club
          </span>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase text-white tracking-tight leading-none">
            Digitalizá tu club en una sola plataforma
          </h1>
          
          <p className="text-sm text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
            Unificá la gestión de socios, cobro de cuotas, planteles deportivos, transmisiones en vivo mediante IA y patrocinadores comerciales en una marca blanca personalizada.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <a 
              href="/crear-club"
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs px-6 py-3.5 rounded-xl flex items-center gap-1.5 transition-all shadow-[0_0_30px_rgba(220,38,38,0.2)] cursor-pointer"
            >
              Comenzar Onboarding <ArrowRight size={14} />
            </a>
            <a 
              href="/demo"
              className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-xs px-6 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Ver Demo Interactiva
            </a>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: ¿QUÉ ES CLUB DIGITAL PRO? */}
      <section id="que-es" className="py-20 px-8 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center text-left border-b border-zinc-800/60">
        <div className="space-y-4">
          <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">Ecosistema SaaS Integrado</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white leading-tight">
            ¿Qué es Club Digital Pro?
          </h2>
          <p className="text-zinc-400 font-light leading-relaxed">
            Es la solución definitiva de marca blanca para instituciones deportivas de cualquier tamaño. Cada club contratante obtiene su propio subdominio, base de datos privada aislada (Multi-tenant) y portal institucional adaptado a sus colores y tipografía oficial, todo administrable sin escribir una sola línea de código.
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={16} />
            </div>
            <span className="font-bold text-xs uppercase text-white">Base de datos aislada (SaaS Multi-tenant)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={16} />
            </div>
            <span className="font-bold text-xs uppercase text-white">Identidad institucional dinámica en caliente</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check size={16} />
            </div>
            <span className="font-bold text-xs uppercase text-white">Módulos activables según plan de pago</span>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: BENEFICIOS */}
      <section id="beneficios" className="py-20 px-8 border-b border-zinc-800/60 bg-zinc-950/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">Ventajas Competitivas</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white">Beneficios Institucionales</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <div className="text-red-500"><Users size={20} /></div>
              <h3 className="font-black text-xs uppercase text-white">Fidelización de Socios</h3>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                Emisión de carnets digitales con códigos QR interactivos y portal de autogestión de cuotas para el grupo familiar.
              </p>
            </div>
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <div className="text-emerald-500"><DollarSign size={20} /></div>
              <h3 className="font-black text-xs uppercase text-white">Aumento de Ingresos</h3>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                Cobro recurrente integrado vía Mercado Pago y visualizadores de sponsors comerciales de alto CTR.
              </p>
            </div>
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
              <div className="text-amber-500"><Sparkles size={20} /></div>
              <h3 className="font-black text-xs uppercase text-white">Innovación Tecnológica</h3>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                Retransmisión Newbery TV, conmutación multi-cámara y resúmenes de partidos redactados por la Inteligencia Artificial de Google Gemini.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: MÓDULOS DISPONIBLES */}
      <section id="modulos" className="py-20 px-8 max-w-5xl mx-auto space-y-12 text-left border-b border-zinc-800/60">
        <div className="space-y-2">
          <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">Estructura Modular</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase text-white">Módulos del Sistema</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: '👥 Centro de Socios', desc: 'Control de padrón social, carga de legajos y credenciales digitales QR.', plan: 'PRO' },
            { title: '💳 Cuotas y Finanzas', desc: 'Gestión contable, facturación automática e integración con pasarela de Mercado Pago.', plan: 'PRO' },
            { title: '⚽ Gestión Deportiva', desc: 'Administración de disciplinas, planteles federados, entrenadores y fixture del torneo.', plan: 'PRO' },
            { title: '📺 Newbery TV Streaming', desc: 'Retransmisión en vivo mediante YouTube/RTMP, overlays de auspiciantes y analítica IA.', plan: 'PREMIUM' },
            { title: '📈 Marketing & Sponsors', desc: 'Gestión de auspicios corporativos, control de CTR de anuncios y planificador de redes.', plan: 'PREMIUM' }
          ].map((m, idx) => (
            <div key={idx} className="p-5 bg-zinc-950 border border-zinc-850 rounded-2xl flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-xs uppercase text-white">{m.title}</h4>
                <p className="text-[10px] text-zinc-400 font-light leading-relaxed">{m.desc}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase shrink-0 ${
                m.plan === 'PREMIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                Plan {m.plan}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 4: TESTIMONIOS (PLACEHOLDERS) */}
      <section className="py-20 px-8 border-b border-zinc-800/60 bg-zinc-950/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">Opiniones</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-white">Qué dicen los clubes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex gap-1 text-amber-500"><Star size={12} /><Star size={12} /><Star size={12} /><Star size={12} /><Star size={12} /></div>
              <p className="text-xs text-zinc-400 font-light italic leading-relaxed">
                "La integración de las cuotas sociales con Mercado Pago redujo la morosidad del club en un 40% durante los primeros tres meses. El carnet digital QR facilitó enormemente el acceso a la sede."
              </p>
              <div className="text-[9px] font-bold text-white uppercase">
                Director de Finanzas · Club Atlético Jorge Newbery
              </div>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
              <div className="flex gap-1 text-amber-500"><Star size={12} /><Star size={12} /><Star size={12} /><Star size={12} /><Star size={12} /></div>
              <p className="text-xs text-zinc-400 font-light italic leading-relaxed">
                "Poder conmutar cámaras durante los partidos de futsal de las inferiores en Newbery TV y que Gemini redacte el resumen al instante le dio una impronta profesional a nuestro canal."
              </p>
              <div className="text-[9px] font-bold text-white uppercase">
                Coordinador de Prensa · Social Belgrano
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 5: CONTACTO */}
      <section id="contacto" className="py-20 px-8 max-w-lg mx-auto space-y-8 text-left">
        <div className="text-center space-y-2">
          <span className="text-red-500 text-[8px] font-black uppercase tracking-widest">Contacto</span>
          <h2 className="text-2xl font-black uppercase text-white">Solicitar Cotización</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase">Agendá una presentación técnica personalizada</p>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-bold text-gray-400 uppercase tracking-wide bg-zinc-950 border border-zinc-850 p-8 rounded-3xl shadow-2xl">
          {successMsg && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] text-center font-bold">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-[8px]">Nombre Completo</label>
            <input 
              type="text" required
              value={contactForm.nombre}
              onChange={e => setContactForm({ ...contactForm, nombre: e.target.value })}
              placeholder="Juan Pérez"
              className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-[8px]">Club / Institución</label>
              <input 
                type="text" required
                value={contactForm.club}
                onChange={e => setContactForm({ ...contactForm, club: e.target.value })}
                placeholder="Club Atlético..."
                className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[8px]">Correo Electrónico</label>
              <input 
                type="email" required
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="contacto@club.com"
                className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none lowercase font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-[8px]">Mensaje / Consulta</label>
            <textarea 
              rows={3} required
              value={contactForm.mensaje}
              onChange={e => setContactForm({ ...contactForm, mensaje: e.target.value })}
              placeholder="Estoy interesado en el plan PRO para mi club..."
              className="w-full bg-zinc-900 border border-white/10 p-3 rounded-xl text-white outline-none normal-case font-light"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)]"
          >
            <Send size={14} /> Enviar Solicitud
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="h-16 border-t border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase select-none">
        <span>© 2026 Club Digital Pro SaaS</span>
        <div className="flex gap-4">
          <a href="/super-admin" className="hover:text-zinc-300">SuperAdmin Panel</a>
          <span>·</span>
          <span>Desarrollado para Clubes</span>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON (Simulación Comercial) */}
      <a
        href="https://wa.me/5491155551010?text=Hola!%20Estoy%20interesado%20en%20contratar%20Club%20Digital%20Pro%20para%20mi%20institucion"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-2xl transition-all hover:scale-110 z-50 text-[10px] font-black"
        title="Contactar Ventas por WhatsApp"
      >
        WA 💬
      </a>

    </div>
  );
}
