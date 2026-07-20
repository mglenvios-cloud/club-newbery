"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, LayoutDashboard, Calendar, FileText, Settings, Shield, Trophy, Plug, Megaphone, Star, BarChart2, Globe, Tv, Film, Activity } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function AdminLayout({ children }) {
  const [role, setRole] = useState("ADMIN");
  const pathname = usePathname();

  useEffect(() => {
    // Read role cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const userRole = getCookie("adminRole") || "ADMIN";
    setRole(userRole);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 text-jn-black">
      {/* Sidebar */}
      <aside className="w-64 bg-jn-black text-white hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-black text-jn-red">Panel Admin</h2>
          <p className="text-sm text-gray-400">Club Jorge Newbery</p>
          <span className="inline-block mt-2 bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-gray-300">
            {role === 'ADMIN' ? 'General' : 'Coord. Futsal'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname === '/admin' ? 'bg-jn-red/10 text-jn-red' : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          
          {role === "ADMIN" && (
            <>
              <Link href="/admin/socios" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/socios') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Users size={20} />
                Socios
              </Link>
              <Link href="/admin/categorias" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/categorias') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Settings size={20} />
                Categorías
              </Link>
              <Link href="/admin/contabilidad" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/contabilidad') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <CreditCard size={20} />
                Contabilidad
              </Link>
              <Link href="/admin/finanzas" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/finanzas') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <CreditCard size={20} />
                Finanzas y Cuotas
              </Link>
            </>
          )}

          <Link href="/admin/reservas" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/reservas') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
            <Calendar size={20} />
            Reservas
          </Link>
          <Link href="/admin/comunidad" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/comunidad') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
            <Shield size={20} />
            Moderación Muro
          </Link>
          
          {role === "ADMIN" && (
            <Link href="/admin/noticias" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname === '/admin/noticias' ? 'bg-jn-red/10 text-jn-red' : ''}`}>
              <FileText size={20} />
              Noticias General
            </Link>
          )}

          <Link href="/admin/futsal" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/futsal') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
            <Trophy size={20} />
            Gestión Futsal
          </Link>

          {role === "ADMIN" && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Marketing</span>
              </div>
              <Link href="/admin/marketing" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname === '/admin/marketing' ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <BarChart2 size={18} />
                Dashboard
              </Link>
              <Link href="/admin/marketing?tab=sponsors" className={`flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors text-sm ${pathname === '/admin/marketing' && false ? 'bg-jn-red/10 text-jn-red' : 'text-gray-400 hover:text-white'}`}>
                <Star size={16} />
                Sponsors
              </Link>
              <Link href="/admin/marketing?tab=publicidad" className="flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors text-sm text-gray-400 hover:text-white">
                <Megaphone size={16} />
                Publicidad
              </Link>
              <Link href="/admin/marketing?tab=campanas" className="flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors text-sm text-gray-400 hover:text-white">
                <Tv size={16} />
                Campañas
              </Link>
              <Link href="/admin/marketing?tab=estadisticas" className="flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors text-sm text-gray-400 hover:text-white">
                <BarChart2 size={16} />
                Estadísticas
              </Link>
              <Link href="/admin/marketing?tab=redes" className="flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors text-sm text-gray-400 hover:text-white">
                <Globe size={16} />
                Redes Sociales
              </Link>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Gestión del Club</span>
              </div>
              <Link href="/admin/gestion-deportiva" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/gestion-deportiva') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Trophy size={20} className="text-jn-red" />
                🏆 Gestión Deportiva
              </Link>
              <Link href="/admin/administracion-general" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/administracion-general') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Settings size={20} />
                ⚙️ Admin. General
              </Link>
              <Link href="/admin/multimedia" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/multimedia') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Film size={20} />
                🎥 Multimedia TV
              </Link>
            </>
          )}

          {role === "ADMIN" && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Integraciones</span>
              </div>
              <Link href="/admin/integraciones/liga-pro-studio" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname.startsWith('/admin/integraciones') ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Plug size={20} />
                Liga Pro Studio
              </Link>
              <Link href="/system-status" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-jn-red/20 hover:text-jn-red transition-colors ${pathname === '/system-status' ? 'bg-jn-red/10 text-jn-red' : ''}`}>
                <Activity size={20} className="text-emerald-400" />
                🖥️ System Status
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800 text-center space-y-2">
          <div className="text-[10px] text-gray-500 font-mono">
            Club Digital Pro v1.0.0
          </div>
          <button 
            onClick={() => {
              document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "adminRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "jn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              localStorage.removeItem("jn-auth-token");
              localStorage.removeItem("token");
              window.location.href = "/admin/login";
            }}
            className="text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-bold">Administración</h1>
          <div className="md:hidden flex gap-2">
            <Link href="/admin/futsal" className="text-xs bg-jn-red text-white font-bold px-3 py-1.5 rounded-lg uppercase">Futsal</Link>
            <button 
              onClick={() => {
                document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "adminRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "jn-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                localStorage.removeItem("jn-auth-token");
                localStorage.removeItem("token");
                window.location.href = "/admin/login";
              }}
              className="text-xs border border-gray-200 text-gray-500 font-bold px-3 py-1.5 rounded-lg uppercase"
            >
              Salir
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
