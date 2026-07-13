"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PortalHome() {
  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      if (!token) {
        // Fallback a datos simulados para demo si no hay token
        setSocio({
          nombre: "Juan Pérez",
          numero: "45892",
          categoria: "Activo",
          estado: "Al día",
          vencimiento: "10 de Julio",
          qrData: "jn-socio-45892-hash2026",
          isDemo: true
        });
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/members/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSocio({
            nombre: `${data.firstName} ${data.lastName}`,
            numero: data.socioNumber.toString(),
            categoria: data.category || "Activo",
            estado: data.estado === "ACTIVO" ? "Al día" : (data.estado || "Inactivo"),
            vencimiento: "10 de Julio",
            qrData: `jn-socio-${data.id}-${data.socioNumber}`,
            isDemo: false
          });
        } else {
          // Fallback en caso de error
          setSocio({
            nombre: "Juan Pérez",
            numero: "45892",
            categoria: "Activo",
            estado: "Al día",
            vencimiento: "10 de Julio",
            qrData: "jn-socio-45892-hash2026",
            isDemo: true
          });
        }
      } catch (err) {
        console.error("Error al cargar perfil del socio:", err);
        // Fallback
        setSocio({
          nombre: "Juan Pérez",
          numero: "45892",
          categoria: "Activo",
          estado: "Al día",
          vencimiento: "10 de Julio",
          qrData: "jn-socio-45892-hash2026",
          isDemo: true
        });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jn-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {socio.isDemo && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-2xl flex justify-between items-center flex-wrap gap-4 select-none">
          <div>
            <h4 className="text-amber-600 font-black text-xs uppercase tracking-widest">Modo Demostración</h4>
            <p className="text-gray-500 text-xs mt-1">Estás explorando el portal con un perfil simulado. Iniciá sesión con tus credenciales reales para probar el sistema en vivo.</p>
          </div>
          <a href="/portal/login" className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase px-5 py-2.5 rounded-xl transition-colors tracking-wider shadow shadow-amber-500/35">
            Iniciar Sesión Real
          </a>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Carnet Digital con QR */}
        <div className="bg-gradient-to-br from-jn-red to-jn-darkred text-white p-6 rounded-2xl shadow-lg relative overflow-hidden flex justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="font-black text-8xl">JN</span>
          </div>
          <div className="relative z-10 flex flex-col justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Carnet Digital</p>
              <h3 className="text-2xl font-bold mb-6">{socio.nombre}</h3>
            </div>
            <div className="flex gap-8 items-end">
              <div>
                <p className="text-xs text-white/70 uppercase">Socio Nº</p>
                <p className="font-mono text-xl">{socio.numero}</p>
              </div>
              <div>
                <p className="text-xs text-white/70 uppercase">Categoría</p>
                <p className="font-semibold">{socio.categoria}</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 bg-white p-2 rounded-xl self-center shadow-lg">
            <QRCodeSVG value={socio.qrData} size={100} />
          </div>
        </div>

        {/* Estado de Cuenta */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-2">Estado de Cuenta</h3>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-3 h-3 rounded-full ${socio.estado === "Al día" ? "bg-green-500" : "bg-red-500"}`}></span>
            <p className={`font-semibold ${socio.estado === "Al día" ? "text-green-600" : "text-red-600"}`}>{socio.estado}</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">Próximo vencimiento: {socio.vencimiento}</p>
          <a href="/portal/cuotas" className="bg-jn-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors w-full text-center block">
            Ver Medios de Pago
          </a>
        </div>
      </div>
    </div>
  );
}
