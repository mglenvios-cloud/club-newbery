"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, CreditCard, Calendar, TrendingUp, ArrowUpRight, Shield, 
  FileText, Plus, CheckCircle, RefreshCw, AlertCircle, Film
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [socios, setSocios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [news, setNews] = useState([]);
  const [media, setMedia] = useState([]);

  // Sectional Error States
  const [sociosError, setSociosError] = useState(false);
  const [reservasError, setReservasError] = useState(false);
  const [transactionsError, setTransactionsError] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);
  const [newsError, setNewsError] = useState(false);
  const [mediaError, setMediaError] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);


    const pSocios = fetch(`/api/socios`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setSocios(data); setSociosError(false); })
      .catch(() => setSociosError(true));

    const pReservas = fetch(`/api/reservas/bookings`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setReservas(data); setReservasError(false); })
      .catch(() => setReservasError(true));

    const pTransactions = fetch(`/api/transactions`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setTransactions(data); setTransactionsError(false); })
      .catch(() => setTransactionsError(true));

    const pPayments = fetch(`/api/finanzas/payments`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setPayments(data); setPaymentsError(false); })
      .catch(() => setPaymentsError(true));


    const pNews = fetch(`/api/news`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setNews(data); setNewsError(false); })
      .catch(() => setNewsError(true));

    const pMedia = fetch(`/api/media`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setMedia(data); setMediaError(false); })
      .catch(() => setMediaError(true));

    await Promise.all([pSocios, pReservas, pTransactions, pPayments, pNews, pMedia]);
    setLoading(false);
  }, []);

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchAllData();

    // Leer rol del usuario
    const getRole = () => {
      if (typeof window === 'undefined') return null;
      const match = document.cookie.match(/(?:^|; )adminRole=([^;]*)/);
      if (match) return decodeURIComponent(match[1]);
      return localStorage.getItem('userRole') || localStorage.getItem('adminRole');
    };
    setUserRole(getRole());
  }, [fetchAllData]);

  // Calculations for KPIs
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // 1. Socios
  const totalSocios = socios.length;
  const newSociosThisMonth = socios.filter(s => {
    if (!s.fechaAlta) return false;
    const d = new Date(s.fechaAlta);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // 2. Cuotas
  const totalPayments = payments.length;
  const paidPayments = payments.filter(p => p.estado === 'PAGADO').length;
  const duesPercentage = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  // 3. Reservas
  const currentBookings = reservas.filter(r => {
    if (!r.fecha) return false;
    const d = new Date(r.fecha + 'T00:00:00');
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // 4. Caja General
  const totalIncome = transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.amount, 0);

  // 5. Noticias
  const totalNews = news.length;
  const newsThisWeek = news.filter(n => {
    if (!n.createdAt) return false;
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  // 6. Multimedia
  const totalMedia = media.length;
  const videosCount = media.filter(m => m.type === 'VIDEO').length;
  const photosCount = media.filter(m => m.type === 'PHOTO').length;

  // Recent activity log generated from dynamic transactions and bookings
  const recentActivities = [];
  transactions.slice(0, 3).forEach((t, idx) => {
    recentActivities.push({
      id: `tx-${t.id || idx}`,
      usuario: t.memberName || "Operación Administrativa",
      desc: `Cobro de ${t.concept === 'CUOTA_SOCIAL' ? 'Cuota Social' : t.concept}: $${t.amount.toLocaleString('es-AR')}`,
      hora: t.date ? new Date(t.date).toLocaleDateString('es-AR') : "Reciente",
      tipo: "FINANZA"
    });
  });
  reservas.slice(0, 2).forEach((b, idx) => {
    recentActivities.push({
      id: `bk-${b.id || idx}`,
      usuario: b.nombreCliente || "Reserva Externa",
      desc: `Reservó instalación ID: ${b.facilityId}`,
      hora: b.fecha ? new Date(b.fecha + 'T00:00:00').toLocaleDateString('es-AR') : "Reciente",
      tipo: "RESERVA"
    });
  });

  // Chart Data calculations
  // 1. Caja (Last 6 months incomes)
  const getPastMonths = () => {
    const list = [];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: months[d.getMonth()],
        ingresos: 0,
        egresos: 0
      });
    }
    return list;
  };
  const dataIngresos = getPastMonths();
  transactions.forEach(t => {
    if (!t.date || t.status !== 'COMPLETED') return;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthObj = dataIngresos.find(m => m.key === key);
    if (monthObj) {
      monthObj.ingresos += t.amount;
    }
  });

  // 2. Socios by Estado/Category
  const activeCount = socios.filter(s => s.estado === 'ACTIVO').length;
  const inactiveCount = socios.filter(s => s.estado === 'INACTIVO').length;
  const suspendidoCount = socios.filter(s => s.estado === 'SUSPENDIDO').length;
  const dataSocios = [
    { name: 'Activos', value: activeCount },
    { name: 'Inactivos', value: inactiveCount },
    { name: 'Suspendidos', value: suspendidoCount }
  ].filter(item => item.value > 0);

  // 3. News by category
  const newsCategoriesMap = {};
  news.forEach(n => {
    const cat = n.category || 'GENERAL';
    newsCategoriesMap[cat] = (newsCategoriesMap[cat] || 0) + 1;
  });
  const dataNews = Object.keys(newsCategoriesMap).map(name => ({
    name,
    noticias: newsCategoriesMap[name]
  }));

  const COLORS = ['#D32F2F', '#111111', '#B71C1C', '#4f4f4f'];

  // Render Card content depending on states
  const renderCard = (title, icon, value, variationText, error, isEmpty, emptyText, emptyBtnLabel, emptyLink, iconBg = 'bg-red-50 text-jn-red') => {
    if (error) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-150 h-40 flex flex-col justify-between select-none">
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={12} /> Error de Carga</p>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">No fue posible cargar la información.</p>
          </div>
          <button 
            onClick={fetchAllData}
            className="w-full bg-zinc-100 hover:bg-zinc-200 text-gray-700 text-[10px] font-black uppercase py-2 rounded-xl transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 h-40 flex flex-col justify-between animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded mt-3"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-150 h-40 flex flex-col justify-between select-none text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
            <p className="text-xs text-gray-500 font-bold italic mt-2">{emptyText}</p>
          </div>
          {(userRole === 'ADMIN' || emptyBtnLabel === "Ver Canchas") && (
            <Link href={emptyLink} className="bg-jn-black hover:bg-jn-red text-white text-[9px] font-black uppercase py-2.5 rounded-xl transition-colors block text-center mt-2 tracking-wide">
              {emptyBtnLabel}
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 relative overflow-hidden group hover:border-jn-red/35 transition-colors h-40 flex flex-col justify-between">
        <div className="absolute top-4 right-4 p-2 rounded-xl group-hover:scale-110 transition-transform bg-gray-50 text-gray-600">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pr-10">{title}</p>
          <h3 className="text-3xl font-black mt-2.5 text-jn-black leading-none">{value}</h3>
        </div>
        <p className="text-[10px] text-gray-500 font-bold mt-2 flex items-center gap-1">
          {variationText}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-jn-black">
      {/* Header con Bienvenida */}
      <div className="bg-gradient-to-r from-jn-black via-jn-darkred to-jn-red text-white p-8 rounded-3xl shadow-xl flex flex-wrap justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-jn-red border border-white/10">Panel de Control CD</span>
          <h2 className="text-3xl font-black tracking-tight leading-none uppercase mt-1">¡Hola, Comisión Directiva!</h2>
          <p className="text-sm text-white/80 font-light">Este es el estado digital en tiempo real del Club Jorge Newbery.</p>
        </div>
        <div className="flex gap-3 relative z-10">
          {userRole === 'ADMIN' && (
            <Link href="/admin/noticias" className="bg-white text-jn-black hover:bg-jn-red hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-lg">
              Crear Novedad
            </Link>
          )}
          <Link href="/admin/contabilidad" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
            Caja General
          </Link>
        </div>
      </div>

      {/* Tarjetas Indicadoras Premium (Responsive a 6 columnas en desktop XL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Card 1: Socios */}
        {renderCard(
          "Socios Registrados", 
          <Users size={20} className="text-jn-red" />, 
          totalSocios, 
          `+${newSociosThisMonth} este mes`, 
          sociosError,
          totalSocios === 0,
          "Sin socios registrados",
          "Registrar Socio",
          "/admin/socios"
        )}

        {/* Card 2: Cuotas al día */}
        {renderCard(
          "Cuotas al Día", 
          <CreditCard size={20} className="text-blue-600" />, 
          `${duesPercentage}%`, 
          `${paidPayments} de ${totalPayments} cobrados`, 
          paymentsError,
          totalPayments === 0,
          "Sin cobros programados",
          "Crear Plan",
          "/admin/finanzas"
        )}

        {/* Card 3: Reservas del Mes */}
        {renderCard(
          "Reservas del Mes", 
          <Calendar size={20} className="text-purple-600" />, 
          currentBookings, 
          "Canchas y espacios activos", 
          reservasError,
          reservas.length === 0,
          "Sin reservas activas",
          "Ver Canchas",
          "/admin/reservas"
        )}

        {/* Card 4: Caja General */}
        {renderCard(
          "Caja General", 
          <TrendingUp size={20} className="text-green-600" />, 
          `$${totalIncome.toLocaleString('es-AR')}`, 
          "Recaudación total general", 
          transactionsError,
          totalIncome === 0,
          "Caja en cero",
          "Registrar Pago",
          "/admin/contabilidad"
        )}

        {/* Card 5: Noticias Publicadas (Nueva Tarjeta) */}
        {renderCard(
          "Noticias Publicadas", 
          <FileText size={20} className="text-amber-500" />, 
          totalNews, 
          `+${newsThisWeek} esta semana`, 
          newsError,
          totalNews === 0,
          "Sin datos disponibles",
          "Crear primera noticia",
          "/admin/noticias"
        )}

        {/* Card 6: Multimedia TV (Nueva Tarjeta) */}
        {renderCard(
          "Multimedia TV", 
          <Film size={20} className="text-cyan-500" />, 
          totalMedia, 
          `${videosCount} videos / ${photosCount} fotos`, 
          mediaError,
          totalMedia === 0,
          "Sin contenido publicado",
          "Subir video",
          "/admin/multimedia"
        )}
      </div>

      {/* Gráficos y Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico Principal de Recaudación (Flujo) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between min-h-[420px]">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-jn-black">Evolución de Caja y Flujo</h3>
              <p className="text-xs text-gray-500">Ingresos históricos reales consolidados.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-jn-red rounded-full"></span> Ingresos reales</span>
            </div>
          </div>
          <div className="h-80 w-full relative min-w-0">
            {!mounted || loading ? (
              <div className="absolute inset-0 bg-gray-50/50 animate-pulse rounded-2xl flex items-center justify-center text-xs text-gray-400 font-bold">
                Cargando histórico de caja...
              </div>
            ) : transactionsError || transactions.length === 0 ? (
              <div className="absolute inset-0 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-xs text-gray-400 font-bold p-4 text-center">
                <AlertCircle size={24} className="text-gray-300 mb-2" />
                <span>No hay datos de ingresos disponibles para graficar.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={dataIngresos}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#D32F2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-bold" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" formatter={(v) => `$${v.toLocaleString('es-AR')}`} />
                  <RechartsTooltip formatter={(v) => [`$${v.toLocaleString('es-AR')}`]} />
                  <Area type="monotone" dataKey="ingresos" stroke="#D32F2F" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sidebar: Actividad y Atajos Rápidos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tarjeta de Acciones Rápidas */}
          {userRole === 'ADMIN' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Atajos Rápidos</h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Link href="/admin/categorias" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-jn-red/5 hover:border-jn-red/20 rounded-2xl border border-gray-150 transition-all font-bold text-center">
                  <Plus className="text-jn-red" size={20} />
                  <span>Editar Aranceles</span>
                </Link>
                
                <Link href="/admin/contabilidad" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-jn-red/5 hover:border-jn-red/20 rounded-2xl border border-gray-150 transition-all font-bold text-center">
                  <CreditCard className="text-jn-red" size={20} />
                  <span>Registrar Pago</span>
                </Link>

                <Link href="/admin/comunidad" className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-jn-red/5 hover:border-jn-red/20 rounded-2xl border border-gray-150 transition-all font-bold text-center col-span-2">
                  <Shield className="text-jn-red" size={20} />
                  <span>Moderar Muro Infantil</span>
                </Link>
              </div>
            </div>
          )}

          {/* Tarjeta de Actividades Recientes */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Actividad Reciente</h3>
            
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map(idx => (
                  <div key={idx} className="flex gap-3 text-xs animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-1.5 flex-shrink-0"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : recentActivities.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No hay actividad reciente para mostrar.</p>
              ) : (
                recentActivities.map(act => (
                  <div key={act.id} className="flex gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-jn-red mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-jn-black">{act.usuario}</p>
                      <p className="text-gray-500 font-light mt-0.5">{act.desc}</p>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-1">{act.hora}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Gráficos de Composición de Socios y Deportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Composición de Socios */}
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 min-h-[250px]">
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-lg text-jn-black">Estado del Padrón</h3>
            <p className="text-xs text-gray-500">Distribución de socios activos, inactivos y suspendidos.</p>
            <div className="space-y-1.5 pt-4 text-xs font-semibold">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : dataSocios.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No hay datos de socios registrados.</p>
              ) : (
                dataSocios.map((s, idx) => (
                  <p key={s.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    {s.name}: <span className="font-bold text-gray-500">{s.value} socios</span>
                  </p>
                ))
              )}
            </div>
          </div>
          <div className="h-44 w-44 relative flex-shrink-0 min-w-0">
            {!mounted || loading ? (
              <div className="absolute inset-0 bg-gray-50/50 animate-pulse rounded-full flex items-center justify-center text-[10px] text-gray-400 font-bold">
                Cargando...
              </div>
            ) : dataSocios.length === 0 ? (
              <div className="absolute inset-0 bg-gray-50 rounded-full flex items-center justify-center text-[10px] text-gray-400 font-bold text-center p-2">
                Sin datos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={dataSocios}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataSocios.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(v) => [`${v} socios`]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Noticias por Categoría / Disciplina */}
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between min-h-[250px]">
          <div>
            <h3 className="font-bold text-lg text-jn-black">Novedades por Categoría</h3>
            <p className="text-xs text-gray-500">Distribución de noticias publicadas según disciplina o sección.</p>
          </div>
          <div className="h-48 mt-4 w-full relative min-w-0">
            {!mounted || loading ? (
              <div className="absolute inset-0 bg-gray-50/50 animate-pulse rounded-2xl flex items-center justify-center text-xs text-gray-400 font-bold">
                Cargando gráfico de noticias...
              </div>
            ) : newsError || dataNews.length === 0 ? (
              <div className="absolute inset-0 bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-xs text-gray-400 font-bold p-4 text-center">
                <AlertCircle size={24} className="text-gray-300 mb-2" />
                <span>No hay noticias publicadas para graficar.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={dataNews}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                  <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(v) => [`${v} publicaciones`]} />
                  <Bar dataKey="noticias" fill="#D32F2F" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
