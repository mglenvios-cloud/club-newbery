"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, CreditCard, Activity, Calendar, Tv } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useTheme } from "@/components/ThemeContext";

const fetch = apiFetch;

export default function PortalLayout({ children }) {
  const [socioName, setSocioName] = useState("Socio");
  const { theme } = useTheme();

  useEffect(() => {
    async function loadSocioName() {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      if (!token) return;
      try {
        const res = await fetch(`/api/members/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSocioName(data.firstName || "Socio");
        }
      } catch (err) {
        console.error("Error al obtener nombre de socio:", err);
      }
    }
    loadSocioName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jn-auth-token');
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen bg-gray-50 text-jn-black">
      {/* Sidebar Portal */}
      <aside
        className="w-64 text-white hidden md:flex flex-col"
        style={{ backgroundColor: theme?.primaryColor || '#dc2626' }}
      >
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-black">{theme?.clubShortName || "Portal Socio"}</h2>
          <p className="text-sm text-white/80">Portal del Socio</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/portal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/10 transition-colors font-bold">
            <User size={20} />
            Mi Perfil
          </Link>
          <Link href="/portal/cuotas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/10 transition-colors font-bold">
            <CreditCard size={20} />
            Mis Cuotas
          </Link>
          <Link href="/portal/disciplinas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/10 transition-colors font-bold">
            <Activity size={20} />
            Mis Disciplinas
          </Link>
          <Link href="/portal/reservas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/10 transition-colors font-bold">
            <Calendar size={20} />
            Mis Reservas
          </Link>
          <Link href="/newbery-tv" className="flex items-center gap-3 p-3 rounded-lg hover:bg-black/10 transition-colors font-bold">
            <Tv size={20} />
            {theme?.tvTitle || "Canal TV"}
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex justify-between items-center px-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Bienvenido, {socioName}</h1>
          <button 
            onClick={handleLogout}
            className="text-sm text-white px-4 py-2 rounded-full font-semibold transition-colors cursor-pointer shadow-md"
            style={{ backgroundColor: theme?.primaryColor || '#dc2626' }}
          >
            Cerrar Sesión
          </button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
