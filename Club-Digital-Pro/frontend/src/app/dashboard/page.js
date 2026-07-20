"use client";

import React, { useState } from 'react';
import { useClub } from '../providers';
import { 
  Trophy, Tv, Users, Activity, Brain, Image as ImageIcon,
  Calendar, Check, ShieldAlert, Sparkles, Building2, User,
  Mail, Phone, ArrowLeft, BarChart2, Star, CheckCircle, DollarSign,
  ChevronRight, Lock, Eye, Play, List, Settings, Shield, Megaphone
} from 'lucide-react';

import SociosModule from '../../modules/socios/SociosModule';
import FinanzasModule from '../../modules/finanzas/FinanzasModule';
import DeportesModule from '../../modules/deportes/DeportesModule';
import NewberyTvModule from '../../modules/newbery-tv/NewberyTvModule';
import MarketingModule from '../../modules/marketing/MarketingModule';

export default function ClubDashboard() {
  const { club, availableClubs, setClub } = useClub();
  
  // Interactive Role Selector state (SaaS RBAC Demo)
  const [selectedRole, setSelectedRole] = useState('ADMIN_CLUB');

  // Modular dynamic state - current view inside dashboard
  const [activeModule, setActiveModule] = useState('resumen');

  // Módulos del Sistema y sus respectivos planes requeridos
  const ALL_MODULES = [
    { id: 'resumen', label: '📊 Resumen General', icon: <BarChart2 size={14} />, plan: 'FREE' },
    { id: 'portal', label: '🌐 Portal Público', icon: <Building2 size={14} />, plan: 'FREE' },
    { id: 'noticias', label: '📰 Noticias', icon: <Megaphone size={14} />, plan: 'FREE' },
    { id: 'galeria', label: '📸 Galería Multimedia', icon: <ImageIcon size={14} />, plan: 'FREE' },
    { id: 'socios', label: '👥 Socios de la Sede', icon: <Users size={14} />, plan: 'PRO' },
    { id: 'cuotas', label: '💳 Cobro de Cuotas', icon: <DollarSign size={14} />, plan: 'PRO' },
    { id: 'deportes', label: '⚽ Gestión Deportiva', icon: <Trophy size={14} />, plan: 'PRO' },
    { id: 'sponsors', label: '💰 Sponsors y Auspicios', icon: <Star size={14} />, plan: 'PRO' },
    { id: 'newbery-tv', label: '📺 Newbery TV Streaming', icon: <Tv size={14} />, plan: 'PREMIUM' },
    { id: 'marketing', label: '📈 Campañas de Marketing', icon: <Activity size={14} />, plan: 'PREMIUM' },
    { id: 'ia-gemini', label: '🤖 Inteligencia Artificial', icon: <Brain size={14} />, plan: 'PREMIUM' }
  ];

  // Helper to determine if a module is unlocked based on club's plan
  const isModuleUnlocked = (modulePlan) => {
    const planLevels = { 'FREE': 1, 'PRO': 2, 'PREMIUM': 3 };
    const clubPlan = club.plan || 'FREE';
    return planLevels[clubPlan] >= planLevels[modulePlan];
  };

  // Helper to determine if a role has permission for a module
  const hasRolePermission = (modId) => {
    // SUPER_ADMIN has access to everything
    if (selectedRole === 'SUPER_ADMIN') return true;

    // RBAC mapping
    const permissions = {
      'ADMIN_CLUB': ['resumen', 'portal', 'noticias', 'galeria', 'socios', 'cuotas', 'deportes', 'sponsors', 'newbery-tv', 'marketing', 'ia-gemini'],
      'SECRETARIA': ['resumen', 'portal', 'socios', 'cuotas', 'deportes'],
      'PROFESOR': ['resumen', 'portal', 'deportes'],
      'PERIODISTA': ['resumen', 'portal', 'noticias', 'galeria', 'newbery-tv'],
      'SOCIO': ['resumen', 'portal', 'galeria']
    };

    const allowed = permissions[selectedRole] || [];
    return allowed.includes(modId);
  };

  // Switcher callback for available clubs (theme testing)
  const handleClubChange = (slug) => {
    const selected = availableClubs.find(c => c.slug === slug);
    if (selected) setClub(selected);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col lg:flex-row font-sans">
      
      {/* 1. SIDE NAVIGATION BAR (Styled dynamically with var(--color-menu)) */}
      <aside 
        className="w-full lg:w-64 p-5 flex flex-col justify-between select-none border-r border-zinc-800 transition-all"
        style={{ backgroundColor: 'var(--color-menu)' }}
      >
        <div className="space-y-6">
          
          {/* Logo & Club Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-main)' }}>
              {club.nombre.slice(0,2).toUpperCase()}
            </div>
            <div className="text-left leading-none">
              <h2 className="text-xs font-black text-white uppercase tracking-wider">{club.nombre}</h2>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mt-0.5">Plan: {club.plan}</span>
            </div>
          </div>

          {/* Quick switcher for demo clients */}
          <div className="space-y-1.5 text-[9px] font-bold text-left pt-2 border-t border-white/5">
            <span className="text-[8px] text-zinc-500 uppercase">Elegir Club (Demo Vista)</span>
            <select
              value={club.slug}
              onChange={e => handleClubChange(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-white outline-none cursor-pointer"
            >
              {availableClubs.map(c => (
                <option key={c.slug} value={c.slug}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Role selector for demo clients */}
          <div className="space-y-1.5 text-[9px] font-bold text-left pt-1">
            <span className="text-[8px] text-zinc-500 uppercase">Simular Rol de Usuario</span>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-2 rounded-xl text-white outline-none cursor-pointer"
            >
              <option value="SUPER_ADMIN">SUPER ADMIN (Global)</option>
              <option value="ADMIN_CLUB">ADMIN CLUB</option>
              <option value="SECRETARIA">SECRETARIA</option>
              <option value="PROFESOR">PROFESOR</option>
              <option value="PERIODISTA">PERIODISTA</option>
              <option value="SOCIO">SOCIO / DEPORTISTA</option>
            </select>
          </div>

          {/* Menu Navigation Items */}
          <nav className="space-y-1 pt-2 border-t border-white/5">
            {ALL_MODULES.map(mod => {
              const unlocked = isModuleUnlocked(mod.plan);
              const allowed = hasRolePermission(mod.id);
              
              if (!allowed) return null; // Hide if role has no permission

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeModule === mod.id 
                      ? 'text-white bg-white/10' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mod.icon}
                    <span>{mod.label}</span>
                  </div>
                  {!unlocked && (
                    <Lock size={10} className="text-zinc-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="text-[8px] text-zinc-600 font-bold uppercase text-center border-t border-white/5 pt-4">
          Club Digital Pro Core
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Dynamic Header */}
        <header 
          className="h-16 px-6 flex items-center justify-between select-none"
          style={{ backgroundColor: 'var(--color-header)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="text-left">
            <span className="text-[8px] text-zinc-400 font-black uppercase tracking-wider block">Estación de Trabajo</span>
            <span className="text-xs font-black uppercase text-white tracking-widest">{club.nombre}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-white uppercase">{selectedRole}</span>
              <span className="text-[8px] text-zinc-500 font-bold">Licencia: {club.plan}</span>
            </div>
            <a 
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={12} /> Menú Principal
            </a>
          </div>
        </header>

        {/* Viewport content */}
        <div className="p-8 flex-1 space-y-8">
          
          {/* Renders Upgrade Lock banner if module plan is locked */}
          {(() => {
            const currentMod = ALL_MODULES.find(m => m.id === activeModule);
            if (currentMod && !isModuleUnlocked(currentMod.plan)) {
              return (
                <div 
                  className="bg-zinc-950 border p-12 rounded-3xl text-center max-w-xl mx-auto space-y-6 animate-fadeIn shadow-2xl"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div className="w-16 h-16 rounded-full mx-auto bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Lock className="text-amber-500" size={24} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-black uppercase text-white">Módulo Requerido: {currentMod.label}</h2>
                    <p className="text-xs text-zinc-400 leading-relaxed font-light">
                      El módulo al que estás intentando acceder está restringido por el plan de licenciamiento actual de tu club (**Plan {club.plan}**). Se requiere actualizar la suscripción para habilitar esta funcionalidad.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl flex justify-between items-center text-xs">
                    <div className="text-left">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase">Plan Requerido</span>
                      <strong className="text-white block uppercase">Plan {currentMod.plan}</strong>
                    </div>
                    <button 
                      onClick={() => alert(`Solicitando actualización de plan a ${currentMod.plan} para ${club.nombre}`)}
                      className="text-[10px] font-black uppercase px-4 py-2.5 rounded-xl text-black bg-white hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      Mejorar Plan
                    </button>
                  </div>
                </div>
              );
            }

            // Normal Module rendering
            return (
              <div className="space-y-6 animate-fadeIn">
                
                {/* ── MODULE: RESUMEN GENERAL ── */}
                {activeModule === 'resumen' && (
                  <div className="space-y-6 text-left">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-black uppercase text-white">Resumen General</h1>
                      <p className="text-[10px] text-zinc-500 font-black uppercase">Consola unificada de control y estadísticas del club</p>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-[9px] font-black text-zinc-500 uppercase">Socios Activos</span>
                        <p className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>1,450</p>
                        <span className="text-[8px] text-emerald-400 font-bold">AL DÍA: 92%</span>
                      </div>
                      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-[9px] font-black text-zinc-500 uppercase">Facturación Mensual</span>
                        <p className="text-2xl font-black text-emerald-400">$840.000</p>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Cuotas e ingresos extras</span>
                      </div>
                      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-[9px] font-black text-zinc-500 uppercase">Disciplinas Activas</span>
                        <p className="text-2xl font-black text-white">6</p>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Categorías federadas</span>
                      </div>
                      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1" style={{ borderColor: 'var(--color-border)' }}>
                        <span className="text-[9px] font-black text-zinc-500 uppercase">Contratos Sponsors</span>
                        <p className="text-2xl font-black text-white">4</p>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase">Banners publicitarios activos</span>
                      </div>
                    </div>

                    {/* Visual indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-zinc-950 border rounded-2xl space-y-4" style={{ borderColor: 'var(--color-border)' }}>
                        <h3 className="text-xs font-black uppercase text-white border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                          Próximos Partidos Fixture
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                            <span>vs Sportivo Belgrano (Local)</span>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded">Sábado 15:30</span>
                          </div>
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                            <span>vs Club Deportivo (Visitante)</span>
                            <span className="bg-zinc-800 text-zinc-400 text-[9px] font-bold px-2 py-0.5 rounded">Lunes 21:00</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-zinc-950 border rounded-2xl space-y-4" style={{ borderColor: 'var(--color-border)' }}>
                        <h3 className="text-xs font-black uppercase text-white border-b pb-2" style={{ borderColor: 'var(--color-border)' }}>
                          Prensa y Comunicados Recientes
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                            <span>Nueva indumentaria oficial de la disciplina futsal</span>
                            <span className="text-[9px] text-zinc-500 font-bold">12 JUL</span>
                          </div>
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                            <span>Mantenimiento anual de las canchas de fútbol 5</span>
                            <span className="text-[9px] text-zinc-500 font-bold">08 JUL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PREMIUM MODULES RENDERING ── */}
                {activeModule === 'socios' && <SociosModule />}
                {activeModule === 'cuotas' && <FinanzasModule />}
                {activeModule === 'deportes' && <DeportesModule />}
                {activeModule === 'newbery-tv' && <NewberyTvModule />}
                {activeModule === 'marketing' && <MarketingModule />}
                {activeModule === 'sponsors' && <MarketingModule />}

                {/* Placeholders for other basic modules */}
                {(activeModule === 'portal' || activeModule === 'noticias' || activeModule === 'galeria' || activeModule === 'ia-gemini') && (
                  <div className="space-y-6 text-left">
                    <h1 className="text-2xl font-black uppercase text-white">{currentMod.label}</h1>
                    <div 
                      className="p-12 border rounded-3xl text-center space-y-4"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                    >
                      <div className="text-4xl">⚙️</div>
                      <p className="text-sm font-semibold max-w-sm mx-auto text-zinc-400">
                        El módulo **{currentMod.label}** se encuentra habilitado y operativo con la licencia del club.
                      </p>
                      <div className="text-[10px] font-black uppercase tracking-wider text-club-primary" style={{ color: 'var(--color-primary)' }}>
                        Acceso concedido para rol {selectedRole} en el plan {club.plan}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

        </div>

      </main>

    </div>
  );
}
