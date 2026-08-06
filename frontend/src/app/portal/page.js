"use client";
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_URL } from '@/config';

export default function PortalHome() {
  const [socio, setSocio] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('jn-auth-token')) : null;
      const demoSocioObj = {
        nombre: "Martín Pérez",
        numero: "47542096",
        categoria: "Socio Activo",
        estado: "Al día",
        vencimiento: "31 de Diciembre",
        qrData: "jn-socio-demo-47542096",
        isDemo: true
      };

      if (!token) {
        // En lugar de bloquear, se carga el perfil demo por defecto
        setSocio(demoSocioObj);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/members/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSocio({
            nombre: `${data.firstName || 'Socio'} ${data.lastName || 'Registrado'}`,
            numero: (data.socioNumber || '47542').toString(),
            categoria: data.category || "Activo",
            estado: data.estado === "ACTIVO" ? "Al día" : (data.estado || "Al día"),
            vencimiento: "31 de Diciembre",
            qrData: `jn-socio-${data.id || 'demo'}-${data.socioNumber || '47542'}`,
            isDemo: false
          });
        } else {
          setSocio(demoSocioObj);
        }
      } catch (err) {
        console.error("Error al cargar perfil del socio, usando fallback demo:", err);
        setSocio(demoSocioObj);
      } finally {
        setLoading(false);
      }
    }

    async function loadNews() {
      try {
        const res = await fetch(`/api/news`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Error al cargar noticias en portal:", err);
      }
    }

    loadProfile();
    loadNews();
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
      <h2 className="text-2xl font-bold mb-6 text-jn-black">Mi Perfil</h2>
      
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-jn-black">
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

      {/* Novedades y Cartelera Oficial */}
      <div className="mt-8 space-y-4 text-jn-black">
        <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
          📢 Novedades y Cartelera Oficial
        </h3>
        
        {news.length === 0 ? (
          <p className="text-sm text-gray-400 italic font-medium">No hay novedades publicadas en este momento.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {news.map(item => (
              <div key={item.id} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-sm transition-all duration-300">
                <div className="space-y-2.5">
                  {item.imageUrl && (
                    <div className="h-32 rounded-xl overflow-hidden border bg-gray-50">
                      <img 
                        src={item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/') ? (item.imageUrl.startsWith('/') && !item.imageUrl.startsWith('/uploads') ? item.imageUrl : `${API_URL}${item.imageUrl}`) : item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <span className="text-[9px] font-black uppercase text-jn-red bg-red-50 px-2 py-0.5 rounded-full inline-block tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-black text-sm text-slate-800">{item.title}</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">{item.content}</p>
                </div>
                <div className="text-[10px] text-gray-400 font-black">
                  {new Date(item.createdAt).toLocaleDateString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
