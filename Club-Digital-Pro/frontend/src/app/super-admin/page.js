"use client";

import React, { useState } from 'react';
import { useClub } from '../providers';
import { 
  Shield, Building2, User, Key, Plus, Edit, Check, XCircle, 
  ToggleLeft, ToggleRight, Database, Award, ArrowLeft, BarChart2, Star, CheckCircle
} from 'lucide-react';

export default function SuperAdminPanel() {
  const { availableClubs, setClub } = useClub();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // SaaS simulated database state
  const [clubsList, setClubsList] = useState(
    availableClubs.map(c => ({
      ...c,
      plan: c.plan || 'FREE',
      estadoActivo: c.estadoActivo !== undefined ? c.estadoActivo : true,
      dominio: c.dominio || `www.${c.slug}.com`,
      usuariosContados: c.slug === 'jorge-newbery' ? 340 : c.slug === 'social-belgrano' ? 120 : 45
    }))
  );

  // Form states for club creation/editing
  const [editingClubId, setEditingClubId] = useState(null);
  const [clubForm, setClubForm] = useState({
    nombre: '', slug: '', plan: 'FREE', estadoActivo: true, dominio: '',
    colorPrimario: '#cc0000', colorSecundario: '#000000', email: ''
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginForm.email === 'admin@clubdigital.pro' && loginForm.password === 'master2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas de Super Administrador.');
    }
  };

  const handleCreateOrUpdateClub = (e) => {
    e.preventDefault();
    if (!clubForm.nombre || !clubForm.slug) return alert("Nombre y Slug requeridos.");

    if (editingClubId) {
      // Update
      setClubsList(prev => prev.map(c => 
        c.id === editingClubId 
          ? { ...c, ...clubForm, updatedAt: new Date().toISOString() } 
          : c
      ));
      setEditingClubId(null);
      alert("Configuración de club actualizada.");
    } else {
      // Create new club
      const exists = clubsList.some(c => c.slug === clubForm.slug);
      if (exists) return alert("El slug ya está registrado.");

      const newClub = {
        id: `club-${Date.now()}`,
        ...clubForm,
        logo: '', escudo: '', banner: '',
        colorAcento: '#fbbf24', colorMenu: '#1f2937', colorHeader: '#1e293b',
        colorFooter: '#0f172a', colorTarjetas: '#1e293b', colorBotones: clubForm.colorPrimario,
        colorBotonesHover: clubForm.colorPrimario, colorFondo: '#0c0c0f',
        colorTextoPrincipal: '#ffffff', colorTextoSecundario: '#a1a1aa',
        colorBordes: '#27272a', colorIconos: '#a1a1aa', colorKPIs: clubForm.colorPrimario,
        colorAlertas: '#f59e0b', colorExito: '#10b981', colorAdvertencias: '#f59e0b',
        colorError: '#ef4444', tipografia: 'Inter',
        usuariosContados: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setClubsList([...clubsList, newClub]);
      alert(`¡Club "${clubForm.nombre}" dado de alta con plan ${clubForm.plan}!`);
    }

    // Reset Form
    setClubForm({
      nombre: '', slug: '', plan: 'FREE', estadoActivo: true, dominio: '',
      colorPrimario: '#cc0000', colorSecundario: '#000000', email: ''
    });
  };

  const toggleClubStatus = (id) => {
    setClubsList(prev => prev.map(c => 
      c.id === id 
        ? { ...c, estadoActivo: !c.estadoActivo } 
        : c
    ));
  };

  const startEditClub = (c) => {
    setEditingClubId(c.id);
    setClubForm({
      nombre: c.nombre, slug: c.slug, plan: c.plan, estadoActivo: c.estadoActivo,
      dominio: c.dominio, colorPrimario: c.colorPrimario, colorSecundario: c.colorSecundario,
      email: c.email || ''
    });
  };

  // SaaS general metrics calculation
  const totalClubs = clubsList.length;
  const activeClubs = clubsList.filter(c => c.estadoActivo).length;
  const totalUsers = clubsList.reduce((acc, c) => acc + c.usuariosContados, 0);
  const estimatedRevenue = clubsList.reduce((acc, c) => {
    if (!c.estadoActivo) return acc;
    const price = c.plan === 'PREMIUM' ? 120000 : c.plan === 'PRO' ? 60000 : 0;
    return acc + price;
  }, 0);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070709] text-gray-100 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <span className="bg-red-950/40 text-red-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-red-500/20">
              SaaS Control Panel
            </span>
            <h1 className="text-xl font-black uppercase text-white tracking-tight flex items-center justify-center gap-2">
              <Shield className="text-red-500" size={18} /> SuperAdmin Login
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Club Digital Pro Master Gateway</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
            {authError && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-[9px] text-center uppercase">
                {authError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block mb-1">Correo de Administrador</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-zinc-500" />
                <input 
                  type="email" required
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@clubdigital.pro"
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block mb-1">Contraseña Maestra</label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-3 text-zinc-500" />
                <input 
                  type="password" required
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl tracking-wider cursor-pointer"
            >
              Ingresar al Master Panel
            </button>
            
            <div className="text-[8px] text-zinc-600 text-center font-bold uppercase leading-relaxed pt-2">
              Credenciales Demo:<br />admin@clubdigital.pro / master2026
            </div>
          </form>
        </div>
      </div>
    );
  }

  // MASTER DASHBOARD SCREEN
  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-500/20 flex items-center justify-center">
              <Shield className="text-red-500" size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase text-white leading-none">SuperAdmin Panel</h1>
              <span className="text-[10px] text-gray-500 font-semibold uppercase mt-1">Club Digital Pro SaaS Operator</span>
            </div>
          </div>
          <div className="flex gap-3">
            <a 
              href="/"
              className="bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black uppercase text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Volver a Demo
            </a>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-950/40 hover:bg-red-900/40 border border-red-500/20 text-red-400 font-black uppercase text-xs px-4 py-2 rounded-xl cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* METRICS ROW */}
        <section className="grid grid-cols-4 gap-4 text-left">
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase block">Licencias Activas</span>
            <p className="text-2xl font-black text-white">{activeClubs} / {totalClubs}</p>
            <span className="text-[8px] text-emerald-400 font-bold uppercase">Estado del servicio: ONLINE</span>
          </div>
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase block">Facturación Estimada</span>
            <p className="text-2xl font-black text-emerald-400">${estimatedRevenue.toLocaleString('es-AR')}/mes</p>
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Facturación de contratos activos</span>
          </div>
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase block">Usuarios Totales</span>
            <p className="text-2xl font-black text-white">{totalUsers}</p>
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Socios y personal del club</span>
          </div>
          <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1">
            <span className="text-[9px] font-black text-zinc-500 uppercase block">Capacidad Servidor</span>
            <p className="text-2xl font-black text-white">12.5 GB</p>
            <span className="text-[8px] text-zinc-500 font-bold uppercase">Uso de disco en base de datos</span>
          </div>
        </section>

        {/* MAIN PANEL CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ABM FORM (4 Cols) */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
              <Building2 size={16} /> {editingClubId ? 'Modificar Franquicia' : 'Alta de Nuevo Club'}
            </h3>
            
            <form onSubmit={handleCreateOrUpdateClub} className="space-y-3 text-xs font-bold text-gray-400 uppercase">
              <div>
                <label className="mb-1 block text-[8px]">Nombre del Club *</label>
                <input 
                  type="text" required
                  value={clubForm.nombre}
                  onChange={e => setClubForm({ ...clubForm, nombre: e.target.value })}
                  placeholder="Ej: Club Atlético Juventud"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[8px]">Slug Único *</label>
                <input 
                  type="text" required
                  disabled={editingClubId !== null}
                  value={clubForm.slug}
                  onChange={e => setClubForm({ ...clubForm, slug: e.target.value })}
                  placeholder="juventud-club"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white font-mono outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-1 block text-[8px]">Dominio Personalizado</label>
                <input 
                  type="text"
                  value={clubForm.dominio}
                  onChange={e => setClubForm({ ...clubForm, dominio: e.target.value })}
                  placeholder="www.juventudclub.com"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[8px]">Correo Oficial</label>
                <input 
                  type="email"
                  value={clubForm.email}
                  onChange={e => setClubForm({ ...clubForm, email: e.target.value })}
                  placeholder="contacto@club.com"
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none lowercase font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[8px]">Plan Licencia</label>
                  <select
                    value={clubForm.plan}
                    onChange={e => setClubForm({ ...clubForm, plan: e.target.value })}
                    className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="FREE">Plan FREE</option>
                    <option value="PRO">Plan PRO</option>
                    <option value="PREMIUM">Plan PREMIUM</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[8px]">Color Primario</label>
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
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-white hover:bg-zinc-200 text-black font-black uppercase text-[10px] py-3 rounded-xl cursor-pointer"
                >
                  {editingClubId ? 'Guardar Cambios' : 'Confirmar Registro'}
                </button>
                {editingClubId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingClubId(null);
                      setClubForm({
                        nombre: '', slug: '', plan: 'FREE', estadoActivo: true, dominio: '',
                        colorPrimario: '#cc0000', colorSecundario: '#000000', email: ''
                      });
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-[10px] px-4 py-3 rounded-xl border border-white/5 cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* LIST CLUBS (8 Cols) */}
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Instituciones Deportivas Registradas ({clubsList.length})</h3>
            
            <div className="space-y-3">
              {clubsList.map(c => (
                <div 
                  key={c.id} 
                  className={`p-4 bg-zinc-900/60 border rounded-2xl flex justify-between items-center transition-all ${
                    c.estadoActivo ? 'border-zinc-800' : 'border-red-900/30 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.colorPrimario }}></div>
                      <span className="font-black text-sm uppercase text-white">{c.nombre}</span>
                      <span className="text-[9px] font-mono text-zinc-500">({c.slug})</span>
                    </div>
                    
                    <div className="flex gap-4 text-[9px] font-semibold text-zinc-400">
                      <span>Plan: <strong className="text-zinc-300 uppercase">{c.plan}</strong></span>
                      <span>Dominio: <span className="font-mono text-zinc-300">{c.dominio || 'SaaS Default'}</span></span>
                      <span>Usuarios: <span className="font-mono text-zinc-300">{c.usuariosContados}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                      c.estadoActivo 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {c.estadoActivo ? 'ACTIVO' : 'SUSPENDIDO'}
                    </span>

                    <button 
                      onClick={() => startEditClub(c)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer"
                    >
                      <Edit size={12} />
                    </button>

                    <button 
                      onClick={() => toggleClubStatus(c.id)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        c.estadoActivo 
                          ? 'bg-red-950/40 text-red-400 hover:bg-red-900/40 border border-red-500/10' 
                          : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-500/10'
                      }`}
                    >
                      {c.estadoActivo ? <XCircle size={12} /> : <CheckCircle size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
