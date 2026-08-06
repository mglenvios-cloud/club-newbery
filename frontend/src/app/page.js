"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import SponsorBanner from '@/components/SponsorBanner';
import FloatingIA from '@/components/FloatingIA';
import { ArrowRight, Trophy, Users, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

import HeroOverlay from '@/components/HeroOverlay';
import OurClubSection from '@/components/OurClubSection';

const Newbery3DHero = dynamic(() => import('@/components/Newbery3DHero'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-jn-black text-white">
      <p className="font-mono text-sm text-gray-400 animate-pulse">Cargando experiencia 3D Babylon.js...</p>
    </div>
  ),
});

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-jn-black text-white font-sans selection:bg-jn-red selection:text-white">
      <Navbar />

      {/* Hero Section 3D con Babylon.js & Overlay */}
      <main className="pt-16">
        <div className="relative">
          <Newbery3DHero />
          <HeroOverlay />
        </div>

        {/* Sección NUESTRO CLUB */}
        <OurClubSection />

        {/* Sponsor Banner Superior */}
        <section className="container mx-auto px-4 my-6">
          <SponsorBanner location="Inicio" />
        </section>

        {/* Sección Destacados & Accesos Rápidos */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 uppercase">
              {theme?.clubName || 'CLUB ATLÉTICO JORGE NEWBERY'}
            </h2>
            <p className="text-gray-400 text-base">
              Plataforma Oficial Institucional • Villa Devoto, Buenos Aires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: `${theme?.primaryColor || '#dc2626'}20`,
                  color: theme?.primaryColor || '#dc2626',
                }}
              >
                <Trophy size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">Gestión Deportiva</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Futsal AFA, Inferiores, Planteles, Fixture de partidos y estadísticas en tiempo real.
              </p>
              <Link
                href="/admin/gestion-deportiva"
                className="inline-flex items-center gap-2 text-xs font-bold hover:underline"
                style={{ color: theme?.primaryColor || '#dc2626' }}
              >
                <span>Acceder a Consola</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">El Semillero / Inferiores</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Álbum Panini 2026, minijuegos interactivos, nivel de deportista y desarrollo infantil.
              </p>
              <Link
                href="/mundo-inferiores"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:underline"
              >
                <span>Entrar al Semillero</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 hover:border-jn-red/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-white text-lg">Portal del Socio</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Carnet digital QR, pagos de cuotas sociales, reserva de canchas y beneficios.
              </p>
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:underline"
              >
                <span>Ir al Portal</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FloatingIA />
    </div>
  );
}
