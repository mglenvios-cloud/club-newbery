"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_THEME = {
  clubName: "CLUB JORGE NEWBERY",
  clubShortName: "JORGE NEWBERY",
  subTitle: "CLUB DIGITAL",
  tagline: "El futuro del deporte comienza aquí",
  badgeText: "⚽ Más de 100 años haciendo historia",
  managementTitle: "Centro de Gestión Deportiva",
  disciplineSubtitle: "Futsal AFA — Temporada 2026 · 11 Categorías",
  primaryColor: "#dc2626",   // Color Principal
  accentColor: "#ffffff",    // Color Secundario
  tertiaryColor: "#111827",  // Color Terciario / Detalles
  presetName: "Trilogy Red & White",
  fontFamily: "sans",
  fontSizeScale: "100%", // "90%" | "100%" | "110%" | "125%" | "140%"
  object3D: "shield",
  shieldShape: "classic", // 'classic' | 'circular' | 'diamond' | 'box' | 'spanish' | 'triangular' | 'pentagon' | 'crowned'
  customLogoUrl: "/icon-192.png",
  tvTitle: "CLUB TV",
  tvDesc: "Centro multimedia oficial con videos HD, pre-roll/post-roll de sponsors y resúmenes IA.",
  bgColor: "#070707",
  objectScale: 1.0,
};

export const FONT_OPTIONS = [
  { id: "sans", name: "Inter (Moderna Sans)", fontCss: "Inter, system-ui, sans-serif" },
  { id: "outfit", name: "Outfit (Deportiva Bold)", fontCss: "'Outfit', sans-serif" },
  { id: "montserrat", name: "Montserrat (Impacto)", fontCss: "'Montserrat', sans-serif" },
  { id: "bebas", name: "🚀 Bebas Neue (Titulares Ultra)", fontCss: "'Bebas Neue', cursive, sans-serif" },
  { id: "russo", name: "⚡ Russo One (Potencia)", fontCss: "'Russo One', sans-serif" },
  { id: "teko", name: "🏆 Teko (Condensada Torneo)", fontCss: "'Teko', sans-serif" },
  { id: "poppins", name: "🎯 Poppins (Geometría Limpia)", fontCss: "'Poppins', sans-serif" },
  { id: "cinzel", name: "💎 Cinzel (Elegante Imperial)", fontCss: "'Cinzel', serif" },
  { id: "orbitron", name: "🏎️ Orbitron (Futurista Tech)", fontCss: "'Orbitron', sans-serif" },
  { id: "roboto_cond", name: "📜 Roboto Condensed (AFA)", fontCss: "'Roboto Condensed', sans-serif" },
  { id: "serif", name: "Playfair (Clásica Serif)", fontCss: "Georgia, serif" },
  { id: "mono", name: "Space Mono (Tech Digital)", fontCss: "'Space Mono', monospace" },
];

export const FONT_SIZE_OPTIONS = [
  { id: "90%", name: "Compacto (90%)", pxSize: "14.4px", desc: "Diseño denso para más información" },
  { id: "100%", name: "Normal / Estándar (100%)", pxSize: "16px", desc: "Escala estándar equilibrada" },
  { id: "110%", name: "Grande (110%)", pxSize: "17.6px", desc: "Textos destacados y más legibles" },
  { id: "125%", name: "Extra Grande (125%)", pxSize: "20px", desc: "Máximo impacto tipográfico" },
  { id: "140%", name: "Gigante / Accesible (140%)", pxSize: "22.4px", desc: "Formato de lectura amplificado" },
];

export const SHIELD_SHAPE_OPTIONS = [
  { id: "classic", name: "🛡️ Escudo Clásico (Apuntado)", desc: "Forma tradicional de cresta institucional" },
  { id: "circular", name: "🟡 Escudo Circular / Anillo", desc: "Forma redonda tipo medalla emblemática" },
  { id: "diamond", name: "💎 Escudo Diamante / Rombo", desc: "Geometría deportiva vanguardista" },
  { id: "box", name: "⬛ Escudo Rectangular Biselado", desc: "Placa metálica con bordes definidos" },
  { id: "spanish", name: "🏆 Escudo Heráldico Español", desc: "Cresta redondeada estilo clásico europeo" },
  { id: "triangular", name: "⚔️ Escudo Gotico Triangular", desc: "Silueta en V pulida estilo torneo" },
  { id: "pentagon", name: "🌟 Escudo Pentagonal Deportivo", desc: "Base de 5 vértices de alto impacto" },
  { id: "crowned", name: "👑 Escudo Coronado / Angular", desc: "Diseño imperial con corte superior biselado" },
];

export const COLOR_PRESETS = [
  { name: "Pinocho (Verde, Blanco, Negro)", primary: "#16a34a", accent: "#ffffff", tertiary: "#09090b", clubName: "CLUB DEPORTIVO Y SOCIAL PINOCHO", clubShortName: "PINOCHO", tvTitle: "PINOCHO TV", preview: ["#16a34a", "#ffffff", "#09090b"] },
  { name: "Jorge Newbery (Rojo, Blanco, Negro)", primary: "#dc2626", accent: "#ffffff", tertiary: "#09090b", clubName: "CLUB ATLÉTICO JORGE NEWBERY", clubShortName: "JORGE NEWBERY", tvTitle: "CLUB TV", preview: ["#dc2626", "#ffffff", "#09090b"] },
  { name: "17 de Agosto (Verde, Blanco, Rojo)", primary: "#15803d", accent: "#ffffff", tertiary: "#b91c1c", clubName: "CLUB SOCIAL Y DEPORTIVO 17 DE AGOSTO", clubShortName: "17 DE AGOSTO", tvTitle: "17 DE AGOSTO TV", preview: ["#15803d", "#ffffff", "#b91c1c"] },
  { name: "Kimberley (Azul, Blanco, Marino)", primary: "#2563eb", accent: "#ffffff", tertiary: "#1e293b", clubName: "CLUB ATLÉTICO KIMBERLEY", clubShortName: "KIMBERLEY", tvTitle: "KIMBERLEY TV", preview: ["#2563eb", "#ffffff", "#1e293b"] },
  { name: "San Lorenzo Futsal (Azulgrana & Blanco)", primary: "#0284c7", accent: "#dc2626", tertiary: "#ffffff", clubName: "SAN LORENZO FUTSAL", clubShortName: "CASLA", tvTitle: "CASLA TV", preview: ["#0284c7", "#dc2626", "#ffffff"] },
  { name: "Boca / Central (Azul, Oro, Blanco)", primary: "#1d4ed8", accent: "#f59e0b", tertiary: "#ffffff", clubName: "BOCA FUTSAL", clubShortName: "BOCA", tvTitle: "BOCA TV", preview: ["#1d4ed8", "#f59e0b", "#ffffff"] },
  { name: "Vélez / Racing (Azul, Celeste, Blanco)", primary: "#1e3a8a", accent: "#38bdf8", tertiary: "#ffffff", clubName: "CLUB VÉLEZ SARSFIELD", clubShortName: "VÉLEZ", tvTitle: "VÉLEZ TV", preview: ["#1e3a8a", "#38bdf8", "#ffffff"] },
  { name: "Peñarol / BVB (Dorado, Negro, Blanco)", primary: "#eab308", accent: "#18181b", tertiary: "#ffffff", clubName: "CLUB PEÑAROL", clubShortName: "PEÑAROL", tvTitle: "PEÑAROL TV", preview: ["#eab308", "#18181b", "#ffffff"] },
];

export const OBJECT_3D_OPTIONS = [
  { id: "shield", name: "🛡️ Escudo 3D del Club", desc: "Emblema tridimensional con tu foto e insignias" },
  { id: "soccer", name: "⚽ Pelota Futsal / Fútbol", desc: "Pelota oficial cosida con tu escudo central" },
  { id: "skates", name: "🛼 Patines Artísticos 3D", desc: "Patín profesional con ruedas tricolor en movimiento" },
  { id: "martial_arts", name: "🥋 Artes Marciales & Guantes", desc: "Cinturón de honor e insignias de combate 3D" },
  { id: "multisport", name: "🌟 Cluster Multi-Deporte", desc: "Escena combinada de Pelota, Copa y Patines en órbita" },
  { id: "basketball", name: "🏀 Pelota de Básquet", desc: "Balón de básquetbol con canaletas" },
  { id: "volleyball", name: "🏐 Pelota de Vóley", desc: "Balón tricolor de vóleibol" },
  { id: "trophy", name: "🏆 Copa Campeón 3D", desc: "Trofeo dorado metálico" },
];

export const PRESET_LOGOS = [
  { name: "Escudo Newbery", url: "/shield.png" },
  { name: "Pelota Clásica", url: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&w=200&q=80" },
  { name: "Estrella Dorada", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=200&q=80" },
];

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  updateTheme: () => {},
  resetTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cajn_live_theme_v10');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.customLogoUrl === '/shield.png' || !parsed.customLogoUrl)) {
          parsed.customLogoUrl = '/icon-192.png';
        }
        setTheme({ ...DEFAULT_THEME, ...parsed });
      }
    } catch (e) {
      console.error('Error loading saved theme:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      const sanitizedTheme = {
        ...theme,
        customLogoUrl: theme.customLogoUrl === '/shield.png' ? '/icon-192.png' : theme.customLogoUrl
      };
      localStorage.setItem('cajn_live_theme_v10', JSON.stringify(sanitizedTheme));
    } catch (e) {
      console.error('Error saving theme:', e);
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--live-primary', theme.primaryColor);
      root.style.setProperty('--live-accent', theme.accentColor);
      root.style.setProperty('--live-tertiary', theme.tertiaryColor || '#ffffff');
      root.style.setProperty('--live-bg-color', theme.bgColor || '#070707');

      const selectedFont = FONT_OPTIONS.find(f => f.id === theme.fontFamily)?.fontCss || "Inter, sans-serif";
      root.style.setProperty('--live-font', selectedFont);
      document.body.style.fontFamily = selectedFont;

      const scaleVal = theme.fontSizeScale || "100%";
      root.style.setProperty('--live-font-scale', scaleVal);
      root.style.fontSize = scaleVal === "140%" ? "22.4px" : scaleVal === "125%" ? "20px" : scaleVal === "110%" ? "17.6px" : scaleVal === "90%" ? "14.4px" : "16px";
    }
  }, [theme, isLoaded]);

  const updateTheme = (updates) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
    try {
      localStorage.removeItem('cajn_live_theme_v8');
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, COLOR_PRESETS, OBJECT_3D_OPTIONS, PRESET_LOGOS, FONT_OPTIONS, FONT_SIZE_OPTIONS, SHIELD_SHAPE_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
