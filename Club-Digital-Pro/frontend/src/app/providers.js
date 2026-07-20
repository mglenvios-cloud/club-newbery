"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ClubContext = createContext(null);

// Pre-defined Themes configuration matching 19 color variables
export const MOCK_CLUBS = [
  {
    id: "club-1",
    nombre: "Club Jorge Newbery",
    slug: "jorge-newbery",
    logo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80",
    escudo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100&auto=format&fit=crop&q=80",
    bannerPrincipal: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=1200&auto=format&fit=crop&q=80",
    bannerLogin: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    bannerDashboard: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    favicon: "",
    tipografia: "Montserrat",
    sitioWeb: "www.jorge-newbery.com",
    email: "contacto@jorge-newbery.com",
    telefono: "11-5555-9000",
    direccion: "Av. Lincoln 4500",
    ciudad: "Villa Devoto",
    provincia: "Buenos Aires",
    pais: "Argentina",
    instagram: "@clubnewbery",
    facebook: "ClubJorgeNewbery",
    youtube: "NewberyTV",
    tiktok: "@clubnewbery",
    estado: "ACTIVO",
    
    // 19 Colors Palette - 🔴 Deportivo Theme
    colorPrimario: "#cc0000",
    colorSecundario: "#000000",
    colorAcento: "#e11d48",
    colorMenu: "#111111",
    colorHeader: "#18181b",
    colorFooter: "#09090b",
    colorTarjetas: "#18181b",
    colorBotones: "#cc0000",
    colorBotonesHover: "#b30000",
    colorFondo: "#0c0c0f",
    colorTextoPrincipal: "#ffffff",
    colorTextoSecundario: "#a1a1aa",
    colorBordes: "#27272a",
    colorIconos: "#a1a1aa",
    colorKPIs: "#cc0000",
    colorAlertas: "#f59e0b",
    colorExito: "#10b981",
    colorAdvertencias: "#f59e0b",
    colorError: "#ef4444"
  },
  {
    id: "club-2",
    nombre: "Club Social Belgrano",
    slug: "social-belgrano",
    logo: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&auto=format&fit=crop&q=80",
    escudo: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&auto=format&fit=crop&q=80",
    bannerPrincipal: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    bannerLogin: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    bannerDashboard: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
    favicon: "",
    tipografia: "Outfit",
    sitioWeb: "www.socialbelgrano.com",
    email: "info@socialbelgrano.com",
    telefono: "351-555-1234",
    direccion: "Av. Colón 1900",
    ciudad: "Córdoba",
    provincia: "Córdoba",
    pais: "Argentina",
    instagram: "@belgranosocial",
    facebook: "ClubSocialBelgrano",
    youtube: "BelgranoCanal",
    tiktok: "@belgranooficial",
    estado: "ACTIVO",
    
    // 19 Colors Palette - 🔵 Profesional Theme
    colorPrimario: "#2563eb",
    colorSecundario: "#1e293b",
    colorAcento: "#60a5fa",
    colorMenu: "#0f172a",
    colorHeader: "#1e293b",
    colorFooter: "#0f172a",
    colorTarjetas: "#1e293b",
    colorBotones: "#2563eb",
    colorBotonesHover: "#1d4ed8",
    colorFondo: "#0f172a",
    colorTextoPrincipal: "#f8fafc",
    colorTextoSecundario: "#94a3b8",
    colorBordes: "#334155",
    colorIconos: "#94a3b8",
    colorKPIs: "#60a5fa",
    colorAlertas: "#f59e0b",
    colorExito: "#10b981",
    colorAdvertencias: "#f59e0b",
    colorError: "#ef4444"
  },
  {
    id: "club-3",
    nombre: "Club Atlético San Martín",
    slug: "san-martin",
    logo: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?w=100&auto=format&fit=crop&q=80",
    escudo: "https://images.unsplash.com/photo-1431324155629-1a6edd1d141d?w=100&auto=format&fit=crop&q=80",
    bannerPrincipal: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80",
    bannerLogin: "https://images.unsplash.com/photo-1540747737956-37872404457a?w=1200&auto=format&fit=crop&q=80",
    bannerDashboard: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    favicon: "",
    tipografia: "Roboto",
    sitioWeb: "www.sanmartinsocial.com",
    email: "prensa@sanmartin.com",
    telefono: "264-555-7890",
    direccion: "Entre Ríos 450",
    ciudad: "San Juan",
    provincia: "San Juan",
    pais: "Argentina",
    instagram: "@sanmartinok",
    facebook: "ClubSanMartin",
    youtube: "SanMartinTV",
    tiktok: "@sanmartin",
    estado: "ACTIVO",
    
    // 19 Colors Palette - 🟢 Institucional Theme
    colorPrimario: "#16a34a",
    colorSecundario: "#0f172a",
    colorAcento: "#22c55e",
    colorMenu: "#0f172a",
    colorHeader: "#1e293b",
    colorFooter: "#020617",
    colorTarjetas: "#1e293b",
    colorBotones: "#16a34a",
    colorBotonesHover: "#15803d",
    colorFondo: "#0b0f19",
    colorTextoPrincipal: "#f8fafc",
    colorTextoSecundario: "#94a3b8",
    colorBordes: "#334155",
    colorIconos: "#22c55e",
    colorKPIs: "#16a34a",
    colorAlertas: "#eab308",
    colorExito: "#22c55e",
    colorAdvertencias: "#eab308",
    colorError: "#dc2626"
  }
];

export function ClubProvider({ children }) {
  const [club, setClub] = useState(MOCK_CLUBS[0]);

  useEffect(() => {
    if (club) {
      // Dynamic injection of 19 CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--color-primary', club.colorPrimario);
      root.style.setProperty('--color-secondary', club.colorSecundario);
      root.style.setProperty('--color-accent', club.colorAcento);
      root.style.setProperty('--color-menu', club.colorMenu);
      root.style.setProperty('--color-header', club.colorHeader);
      root.style.setProperty('--color-footer', club.colorFooter);
      root.style.setProperty('--color-card', club.colorTarjetas);
      root.style.setProperty('--color-button', club.colorBotones);
      root.style.setProperty('--color-button-hover', club.colorBotonesHover);
      root.style.setProperty('--color-bg', club.colorFondo);
      root.style.setProperty('--color-text-main', club.colorTextoPrincipal);
      root.style.setProperty('--color-text-sub', club.colorTextoSecundario);
      root.style.setProperty('--color-border', club.colorBordes);
      root.style.setProperty('--color-icon', club.colorIconos);
      root.style.setProperty('--color-kpi', club.colorKPIs);
      root.style.setProperty('--color-alert', club.colorAlertas);
      root.style.setProperty('--color-success', club.colorExito);
      root.style.setProperty('--color-warn', club.colorAdvertencias);
      root.style.setProperty('--color-error', club.colorError);

      // Load & apply Google Font Family
      const fontName = club.tipografia || 'Inter';
      root.style.setProperty('--font-family', `'${fontName}', ui-sans-serif, system-ui, sans-serif`);
      
      const fontId = `gfont-${fontName.toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;700;900&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, [club]);

  return (
    <ClubContext.Provider value={{ club, setClub, availableClubs: MOCK_CLUBS }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub debe utilizarse dentro de un ClubProvider');
  }
  return context;
}
