"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '@/config';

export default function PortalHome() {
  const [socio, setSocio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      if (!token) {
        window.location.href = "/portal/login";
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
          // Si el token es inválido o expiró, redirigir a login
          localStorage.removeItem('token');
          localStorage.removeItem('jn-auth-token');
          window.location.href = "/portal/login";
        }
      } catch (err) {
        console.error("Error al cargar perfil del socio:", err);
        setSocio(null);
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

  if (!socio) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center max-w-xl mx-auto my-12 shadow-sm text-jn-black">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">!</div>
        <h3 className="text-xl font-black uppercase text-red-700">Error de Conexión</h3>
        <p className="text-sm text-red-600 mt-2 font-medium">No se pudo establecer conexión con el servidor. Por favor, intente nuevamente más tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
