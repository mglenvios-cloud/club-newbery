"use client";
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * SponsorBanner — Componente público reutilizable de publicidad.
 * 
 * Props:
 *   location: string — nombre de la ubicación (ej: "Inicio", "Partidos", "Footer", etc.)
 *   className: string — clases adicionales para el contenedor
 *   variant: "banner" | "sidebar" | "footer" (default: "banner")
 *   type: "banner" | "campaign" (default: "banner") — qué tipo de contenido mostrar
 * 
 * Si no hay contenido activo para esa ubicación, no renderiza nada (invisible).
 */
export default function SponsorBanner({ location, className = '', variant = 'banner', type = 'banner' }) {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      const endpoint = type === 'campaign'
        ? `${API_URL}/api/publicidad/campaigns?location=${encodeURIComponent(location)}&status=ACTIVE`
        : `${API_URL}/api/publicidad/banners?location=${encodeURIComponent(location)}&active=true`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
        // Registrar view del primer banner al cargarlo
        if (data.length > 0) {
          const viewEndpoint = type === 'campaign'
            ? `${API_URL}/api/publicidad/campaigns/${data[0].id}/view`
            : `${API_URL}/api/publicidad/banners/${data[0].id}/view`;
          fetch(viewEndpoint, { method: 'POST' }).catch(() => {});
        }
      }
    } catch {
      // Silencioso
    } finally {
      setLoaded(true);
    }
  }, [location, type]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Rotación automática entre banners (cada 8 segundos)
  useEffect(() => {
    if (banners.length <= 1) return;
    const autoBanners = banners.filter(b => b.rotation === 'AUTO' || b.rotation === 'ALWAYS');
    if (autoBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleClick = async (banner) => {
    // Registrar click
    try {
      const clickEndpoint = type === 'campaign'
        ? `${API_URL}/api/publicidad/campaigns/${banner.id}/click`
        : `${API_URL}/api/publicidad/banners/${banner.id}/click`;
      await fetch(clickEndpoint, { method: 'POST' });
    } catch {}
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank', 'noopener noreferrer');
    }
  };

  // No renderizar nada si no hay banners o no está cargado aún
  if (!loaded || banners.length === 0) return null;

  const current = banners[currentIndex] || banners[0];

  // ── VARIANTE SIDEBAR
  if (variant === 'sidebar') {
    return (
      <div className={`rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
        <button onClick={() => handleClick(current)} className="block w-full group relative">
          <img
            src={current.imageUrl}
            alt={current.title}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ maxHeight: '200px' }}
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <span className="text-[9px] text-white/70 uppercase tracking-wider">Publicidad</span>
          </div>
        </button>
      </div>
    );
  }

  // ── VARIANTE FOOTER
  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <button
          onClick={() => handleClick(current)}
          className="inline-flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
        >
          <img src={current.imageUrl} alt={current.title} className="h-8 object-contain" />
          <span className="text-xs text-gray-500">{current.title}</span>
        </button>
      </div>
    );
  }

  // ── VARIANTE BANNER (default)
  return (
    <div className={`w-full relative ${className}`}>
      <button
        onClick={() => handleClick(current)}
        className="group block w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm hover:shadow-md relative"
        title={current.title}
      >
        <img
          src={current.imageUrl}
          alt={current.title}
          className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          style={{ maxHeight: '120px' }}
        />
        {/* Label publicidad discreto */}
        <span className="absolute top-2 right-2 text-[9px] bg-black/40 text-white/60 px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
          Publicidad
        </span>
      </button>

      {/* Dots de navegación (solo si hay más de 1) */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-gray-600 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-700'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
