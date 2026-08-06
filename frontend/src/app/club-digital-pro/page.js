"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeContext';
import {
  Trophy, Tv, Users, Activity, Brain, Image as ImageIcon,
  Calendar, Check, ShieldAlert, Sparkles, Building2, User,
  Mail, Phone, Send, ArrowRight, BarChart2, Star, CheckCircle, DollarSign,
  ChevronRight, Sliders
} from 'lucide-react';

import { API_URL } from '@/config';

export default function ClubDigitalPro() {
  const { theme } = useTheme();
  const clubNameDisplay = theme?.clubName || 'CLUB JORGE NEWBERY';
  const clubShortDisplay = theme?.clubShortName || 'JORGE NEWBERY';
  const tvTitleDisplay = theme?.tvTitle || (theme?.clubShortName ? `${theme.clubShortName} TV` : 'CLUB TV');

  // Simulador State
  const [clubType, setClubType] = useState('Polideportivo');
  const [membersCount, setMembersCount] = useState('1000');
  
  // Form State
  const [form, setForm] = useState({
    clubName: '',
    contactName: '',
    email: '',
    phone: '',
    membersCount: '1000',
    sports: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.clubName || !form.contactName || !form.email) {
      return showToast('Por favor completa los campos obligatorios.', 'error');
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/demo-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message, 'success');
        setForm({
          clubName: '', contactName: '', email: '', phone: '',
          membersCount: '1000', sports: '', message: ''
        });
      } else {
        showToast('Ocurrió un error al enviar el formulario.', 'error');
      }
    } catch {
      showToast('Error de conexión con el servidor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Módulos recomendados basados en la simulación
  const getRecommendedModules = () => {
    const modules = [];
    if (clubType === 'Polideportivo' || membersCount === '5000+') {
      modules.push({ title: '⚽ Gestión Deportiva Pro', desc: 'Control total de múltiples disciplinas, entrenamientos y planteles federados.' });
      modules.push({ title: '📺 Club TV Premium', desc: 'Canal de streaming con pre-rolls de patrocinadores y resúmenes con IA.' });
      modules.push({ title: '👥 Portal de Autogestión de Socios', desc: 'Pago de aranceles y reservas de canchas y turnos online.' });
      modules.push({ title: '🤖 Club IA', desc: 'Asistente inteligente para la redacción de crónicas de partidos y consultas generales.' });
      modules.push({ title: '📊 Analítica Avanzada', desc: 'Control de morosidad, ingresos publicitarios y asistencia de deportistas.' });
    } else if (clubType === 'Futsal' || clubType === 'Fútbol') {
      modules.push({ title: '🏆 Futsal & Fútbol AFA Pro', desc: 'Planillas técnicas de partidos, fixture, tarjetas y control de convocatorias.' });
      modules.push({ title: '📺 Club TV', desc: 'Retransmisión de partidos completos y mejores jugadas de tus divisiones.' });
      modules.push({ title: '📸 Biblioteca Multimedia', desc: 'Galería de fotos y videos ordenadas por jugador, temporada y competencia.' });
      modules.push({ title: '💰 Sponsors e Ingresos', desc: 'Gestión y rotación de banners de patrocinadores en todas las secciones.' });
    } else {
      modules.push({ title: '🥋 Taekwondo & Vóley Suite', desc: 'Agenda de entrenamientos por espacio y estadísticas del equipo.' });
      modules.push({ title: '📅 Calendario Deportivo', desc: 'Sincronización de eventos, partidos y reuniones familiares del club.' });
      modules.push({ title: '👥 Portal del Socio', desc: 'Ficha médica digital, autorizaciones de menores y cuota social online.' });
      modules.push({ title: '💰 Sponsors e Ingresos', desc: 'Gestión y rotación de banners de patrocinadores en todas las secciones.' });
    }
    return modules;
  };

  const modulosDisponibles = [
    { title: '⚽ Gestión Deportiva', desc: 'Control unificado de disciplinas, categorías, planteles, entrenadores y cuerpo técnico.', color: 'from-blue-600 to-cyan-500', href: '/disciplinas' },
    { title: `📺 ${theme?.tvTitle || 'Club TV'}`, desc: 'Centro multimedia oficial con videos HD, pre-roll/post-roll de sponsors y resúmenes IA.', color: 'from-red-600 to-rose-500', href: '/newbery-tv' },
    { title: '🏆 Futsal Profesional', desc: 'Sistema especializado en torneos de Futsal AFA, crónicas de partidos y eventos en vivo.', color: 'from-amber-500 to-yellow-500', href: '/disciplinas' },
    { title: '👥 Portal Socio', desc: 'Autogestión de socios, cobro online de cuotas sociales, reservas y control parental.', color: 'from-emerald-600 to-teal-500', href: '/portal' },
    { title: '📊 Estadísticas', desc: 'Panel administrativo comercial, control de morosidad, ingresos por sponsoreo y reportes.', color: 'from-indigo-600 to-purple-500', href: '/admin' },
    { title: '🤖 Inteligencia Artificial', desc: 'Crónicas redactadas al instante, chat de soporte y automatización de cronogramas.', color: 'from-purple-600 to-pink-500', href: '/newbery-ia' },
    { title: '📸 Multimedia', desc: 'Galerías interactivas con filtros avanzados por jugador, temporada, rival y competencia.', color: 'from-pink-600 to-rose-500', href: '/galeria' },
    { title: '💰 Sponsors', desc: 'Módulo comercial publicitario con rotación inteligente de banners y reportes de efectividad.', color: 'from-emerald-500 to-green-400', href: '/admin' },
    { title: '📅 Calendario Deportivo', desc: 'Agenda integrada de partidos, entrenamientos de todas las categorías y eventos sociales.', color: 'from-blue-500 to-indigo-500', href: '/reservas' }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-white pb-24 relative overflow-hidden font-sans">
      
      {/* BACKGROUND SHADOWS */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-jn-red/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[200px] right-[-200px] w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[150px] pointer-events-none" />

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2.5 shadow-2xl border transition-all animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500/20 text-emerald-400' : 'bg-red-950 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* ── HERO PRINCIPAL ── */}
      <header className="relative pt-24 pb-20 md:py-32 bg-gradient-to-b from-red-950/20 via-[#070707] to-[#070707]">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-6">
          <span className="bg-red-950/40 text-jn-red text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-jn-red/20 shadow-[0_0_20px_rgba(211,47,47,0.2)]">
            Club Digital Pro · Lanzamiento Comercial
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none max-w-4xl mx-auto">
            Transformamos clubes deportivos en <span className="text-jn-red">plataformas digitales</span> inteligentes
          </h1>
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Una solución integral para socios, dirigentes, entrenadores y deportistas. Potenciá tus ingresos, simplificá tu gestión y fidelizá a tu comunidad con tecnología de vanguardia.
          </p>
          <div className="pt-4 flex justify-center">
            <a
              href="#contacto"
              className="bg-jn-red hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-[1.03] shadow-[0_0_30px_rgba(211,47,47,0.3)] flex items-center gap-2"
            >
              Solicitar Demo <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl space-y-24">
        
        {/* ── MÓDULOS DISPONIBLES ── */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-jn-red text-[10px] font-black uppercase tracking-widest">Ecosistema Completo</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase">Módulos de la Plataforma</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">Toda la tecnología necesaria para el éxito institucional de tu club.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modulosDisponibles.map((mod, i) => (
              <Link
                key={i}
                href={mod.href}
                className="bg-[#111] border border-white/5 hover:border-white/10 hover:border-jn-red/40 rounded-3xl p-6 transition-all hover:translate-y-[-2px] flex flex-col justify-between gap-4 group relative overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${mod.color} opacity-[0.02] rounded-bl-full pointer-events-none group-hover:opacity-[0.06] transition-opacity`} />
                <div className="space-y-2">
                  <h4 className="font-black text-base uppercase text-white group-hover:text-jn-red transition-colors">{mod.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-light">{mod.desc}</p>
                </div>
                <span className="text-[10px] text-jn-red font-black uppercase tracking-wider flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  Saber más <ChevronRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CASO DE ÉXITO ── */}
        <section className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-jn-red/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="bg-red-950/40 text-jn-red text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded border border-jn-red/25">
                Caso de Éxito de Referencia
              </span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                Implementado en {theme?.clubShortName || 'Pinocho'}
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                La plataforma digital de {theme?.clubName || 'Pinocho'} sirve como modelo operativo real, demostrando la integración comercial para el Futsal AFA, la automatización del portal socio y la gestión deportiva integral.
              </p>
              
              <div className="space-y-3 font-bold text-xs">
                {[
                  'Plataforma Digital de Marca Propia',
                  'Futsal AFA Oficial Integrado',
                  'Gestión Deportiva Multi-disciplina',
                  `Multimedia Premium con ${theme?.tvTitle || 'CLUB TV'}`,
                  'Portal de Socios y Cobros Sociales Automáticos'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300">
                    <Check size={14} className="text-jn-red flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/50 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-black text-xs text-gray-400 uppercase tracking-wider">Métricas Reales {theme?.clubShortName || 'Pinocho'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-2xl font-black text-jn-red">5000+</span>
                  <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Socios Activos</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-2xl font-black text-jn-red">12+</span>
                  <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Categorías</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-2xl font-black text-jn-red">100%</span>
                  <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Cobro Automatizado</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="text-2xl font-black text-jn-red">IA</span>
                  <p className="text-[9px] text-gray-500 uppercase font-black mt-1">Crónica Automática</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SIMULADOR DE CLUB ── */}
        <section className="space-y-8 bg-gradient-to-b from-[#0c0c0c] to-[#070707] border border-white/5 p-8 rounded-3xl">
          <div className="text-center space-y-2">
            <span className="text-jn-red text-[10px] font-black uppercase tracking-widest">Simulador Interactivo</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase">Simulá tu Club Digital</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Seleccioná las características de tu institución y descubrí tu configuración ideal.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            
            {/* Opciones del Simulador */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Tipo de Club</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Fútbol', 'Futsal', 'Polideportivo'].map(type => (
                    <button
                      key={type}
                      onClick={() => setClubType(type)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                        clubType === type
                          ? 'bg-jn-red border-jn-red text-white shadow-lg shadow-jn-red/20'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Cantidad de Socios</label>
                <div className="flex gap-3">
                  {['500', '1000', '5000+'].map(count => (
                    <button
                      key={count}
                      onClick={() => setMembersCount(count)}
                      className={`px-6 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all ${
                        membersCount === count
                          ? 'bg-jn-red border-jn-red text-white shadow-lg shadow-jn-red/20'
                          : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {count} Socios
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Módulos recomendados recomendados */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-jn-red">Configuración Recomendada</h4>
                <span className="text-[9px] bg-red-950 text-jn-red px-2 py-0.5 rounded font-black uppercase">Club Digital Pro</span>
              </div>

              <div className="space-y-3">
                {getRecommendedModules().map((mod, i) => (
                  <div key={i} className="bg-black/30 border border-white/5 p-4.5 rounded-xl space-y-1">
                    <p className="font-bold text-xs text-white uppercase">{mod.title}</p>
                    <p className="text-[11px] text-gray-400 font-light leading-relaxed">{mod.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── NEWBERY TV EXPERIENCE ── */}
        <section className="space-y-8 bg-[#0b0b0d] border border-white/5 p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-900/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="text-center space-y-2">
            <span className="text-jn-red text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Tv size={12} /> Demostración Interactiva
            </span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">{tvTitleDisplay} Experience</h2>
            <p className="text-xs text-gray-500 max-w-xl mx-auto">
              Probá las capacidades profesionales de streaming, analítica e inteligencia artificial que potencian la difusión de tu club.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: LIVE PLAYER & SCOREBOARD (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Scoreboard Widget */}
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-jn-red flex items-center justify-center text-[10px] font-black">{clubShortDisplay.substring(0, 2).toUpperCase()}</div>
                  <span className="font-black text-xs uppercase tracking-wider text-white">{clubShortDisplay}</span>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900/80 px-4 py-2 rounded-xl border border-white/5">
                  <span className="text-xl font-black text-white">3</span>
                  <span className="text-[10px] text-jn-red font-black tracking-widest animate-pulse">LIVE 38'</span>
                  <span className="text-xl font-black text-white">2</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-xs uppercase tracking-wider text-white">Rival AFA</span>
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-black text-black">RA</div>
                </div>
              </div>

              {/* Player Simulator */}
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 flex flex-col justify-between p-4">
                {/* Simulated Stream Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 pointer-events-none" />

                {/* Stream Header */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                    ● EN VIVO
                  </span>
                  <span className="text-white text-[10px] font-black tracking-widest uppercase bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/5">
                    1080p @60FPS
                  </span>
                </div>

                {/* Overlay Sponsor Ads (Pre-Roll Simulator) */}
                <div className="relative z-10 mx-auto my-auto bg-black/85 border border-white/15 p-4 rounded-2xl max-w-xs text-center backdrop-blur-md shadow-2xl space-y-2 animate-fadeIn">
                  <span className="text-[8px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded tracking-wide">PUBLICIDAD SPONSOR</span>
                  <p className="text-[10px] text-white font-black uppercase">¡10% de Descuento en Tienda Oficial!</p>
                  <div className="text-[9px] text-jn-red font-bold uppercase tracking-wider cursor-pointer hover:underline">Visitar Sitio Web ↗</div>
                </div>

                {/* Stream Controls */}
                <div className="relative z-10 flex justify-between items-center text-xs font-bold text-gray-300">
                  <div className="flex items-center gap-4">
                    <button className="text-white hover:text-jn-red cursor-pointer">▶</button>
                    <span className="text-[10px]">🔈 100%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-400">00:38:15</span>
                    <button className="text-white hover:opacity-80 cursor-pointer">⛶</button>
                  </div>
                </div>
              </div>

              {/* Sponsors Banner Rotation */}
              <div className="bg-[#141416] border border-white/5 p-3 rounded-2xl flex items-center justify-around gap-4 overflow-hidden">
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider">Patrocinadores de la transmisión:</span>
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">⚡ LIGA PRO STUDIO</span>
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">🔥 SPONSOR {clubShortDisplay}</span>
              </div>

            </div>

            {/* COLUMN 2: ANALYTICS, IA & EDITOR (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* IA Cronica Generator Widget */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-jn-red" />
                  <span className="font-black text-xs uppercase tracking-wider text-white">Crónica Técnica IA</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-white/5 rounded-xl space-y-2">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                    "El Jorge Newbery se impone en el Clásico de Futsal con gran efectividad táctica. Lucas González se corona figura con 4 paradas claves y un 86% de acierto..."
                  </p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                    <span className="text-[8px] text-zinc-500 font-mono">Modelo: Gemini 1.5 Pro</span>
                    <button 
                      onClick={() => alert("Generando análisis táctico de partido...")}
                      className="bg-jn-red hover:bg-red-700 text-white font-black uppercase text-[8px] px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      Regenerar
                    </button>
                  </div>
                </div>
              </div>

              {/* Fast Video Trimmer (Editor Multimedia) */}
              <div className="bg-zinc-950 border border-white/5 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-jn-red" />
                  <span className="font-black text-xs uppercase tracking-wider text-white">Trimmer de Video</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Punto de inicio (segundos)</label>
                    <input type="range" min="0" max="100" defaultValue="15" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-gray-400 block mb-1 uppercase">Punto de finalización</label>
                    <input type="range" min="0" max="100" defaultValue="85" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase">Duración Clip: 70s</span>
                    <button 
                      onClick={() => alert("Guardando recorte de clip multimedia...")}
                      className="bg-white hover:bg-zinc-200 text-black font-black uppercase text-[8px] px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Guardar Recorte
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ── CONTACTO COMERCIAL ── */}
        <section id="contacto" className="max-w-xl mx-auto space-y-8 bg-[#111] border border-white/5 p-8 md:p-10 rounded-3xl">
          <div className="text-center space-y-2">
            <span className="text-jn-red text-[10px] font-black uppercase tracking-widest">Contacto Directo</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase">Quiero mi Club Digital</h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Dejanos tus datos para coordinar una presentación de demostración personalizada.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block">Nombre del Club *</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text" required
                    value={form.clubName}
                    onChange={e => setForm(prev => ({ ...prev, clubName: e.target.value }))}
                    placeholder="Ej. Club Atlético Juventud"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block">Persona de Contacto *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text" required
                    value={form.contactName}
                    onChange={e => setForm(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block">Email Comercial *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ej. juancito@correo.com"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600 lowercase"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej. +54 9 11 1234-5678"
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block">Cantidad de Socios</label>
                <select
                  value={form.membersCount}
                  onChange={e => setForm(prev => ({ ...prev, membersCount: e.target.value }))}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red"
                >
                  <option value="500">Hasta 500 socios</option>
                  <option value="1000">500 a 2000 socios</option>
                  <option value="5000+">Más de 2000 socios</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block">Disciplinas Deportivas</label>
                <input
                  type="text"
                  value={form.sports}
                  onChange={e => setForm(prev => ({ ...prev, sports: e.target.value }))}
                  placeholder="Fútbol, Futsal, Patín, Vóley..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block">Mensaje / Consulta adicional</label>
              <textarea
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contanos más sobre las necesidades tecnológicas de tu club..."
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white h-24 focus:outline-none focus:ring-1 focus:ring-jn-red placeholder-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-jn-red hover:bg-red-700 disabled:bg-red-950/60 disabled:text-gray-400 text-white font-black uppercase tracking-wider py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(211,47,47,0.2)]"
            >
              {submitting ? 'Enviando solicitud...' : (
                <>
                  Quiero mi Club Digital <Send size={12} />
                </>
              )}
            </button>
          </form>
        </section>

      </div>

    </div>
  );
}
