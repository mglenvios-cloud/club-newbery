"use client";

import React from 'react';
import { Check, ShieldCheck, ArrowLeft, ArrowRight, Star, StarOff, Sparkles } from 'lucide-react';

export default function PlanesPage() {
  const PLANS_LIST = [
    {
      name: "STARTER",
      price: "$25.000",
      period: "mes",
      description: "La presencia básica ideal para clubes de barrio que comienzan su transformación digital.",
      features: [
        "🌐 Portal Web Institucional",
        "📰 Publicación de Noticias",
        "📸 Galería Multimedia Pública",
        "👥 1 Administrador",
        "📦 1 GB de Almacenamiento"
      ],
      popular: false
    },
    {
      name: "PRO",
      price: "$60.000",
      period: "mes",
      description: "El core administrativo completo para coordinar la tesorería y actividades de la sede.",
      features: [
        "👥 Centro de Socios Completo",
        "🪪 Credenciales QR Digitales",
        "💳 Cobro de Cuotas Mensuales",
        "⚽ Gestión Deportiva e Inferiores",
        "👥 5 Administradores",
        "📦 5 GB de Almacenamiento",
        "⚡ Integración con Mercado Pago"
      ],
      popular: true
    },
    {
      name: "PREMIUM",
      price: "$120.000",
      period: "mes",
      description: "La suite profesional integral con streaming en vivo, inteligencia artificial y patrocinio.",
      features: [
        "📺 Newbery TV Streaming Premium",
        "🤖 Crónicas tácticas con Gemini AI",
        "📊 Marketing y CTR Sponsors",
        "📱 App Móvil Colaboradores",
        "👥 Administradores ilimitados",
        "📦 25 GB de Almacenamiento",
        "🎫 Soporte prioritario 24/7"
      ],
      popular: false
    }
  ];

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
      <main className="p-8 flex-1 max-w-5xl mx-auto w-full space-y-12 text-left animate-fadeIn">
        <div className="text-center space-y-2">
          <span className="bg-red-950/40 text-red-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/20">
            Planes de Licenciamiento
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-none pt-2">
            Planes de Licenciamiento SaaS
          </h1>
          <p className="text-xs text-zinc-500 uppercase font-semibold">Precios transparentes diseñados para cada tipo de club</p>
        </div>

        {/* PLAN CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS_LIST.map((plan, i) => (
            <div 
              key={i}
              className={`p-6 rounded-3xl border flex flex-col justify-between text-left transition-all ${
                plan.popular 
                  ? 'bg-zinc-900 border-zinc-700 shadow-2xl relative' 
                  : 'bg-zinc-950/40 border-zinc-850'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-black font-black uppercase text-[8px] px-3 py-1 rounded-full border border-zinc-800 shadow-lg">
                  ★ RECOMENDADO
                </span>
              )}

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">{plan.name}</span>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl font-black text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-[10px]">/{plan.period}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-light leading-relaxed pt-2">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-2.5 border-t border-white/5 pt-4">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-semibold text-zinc-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check size={10} />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={`/crear-club?plan=${plan.name}`}
                  className={`w-full font-black uppercase text-[10px] py-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5'
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white'
                  }`}
                >
                  Contratar Plan <ArrowRight size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-16 border-t border-zinc-800 bg-zinc-950 px-8 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase select-none">
        <span>© 2026 Club Digital Pro SaaS</span>
        <span>Comparativa de Planes Oficial</span>
      </footer>

    </div>
  );
}
