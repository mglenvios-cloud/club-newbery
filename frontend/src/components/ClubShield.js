"use client";
import React from 'react';
import { useTheme } from './ThemeContext';

export default function ClubShield({ className = "w-10 h-10", animate = true }) {
  const { theme } = useTheme();
  const customLogo = theme?.customLogoUrl;
  const primColor = theme?.primaryColor || "#D32F2F";

  // Si hay una imagen cargada personalizada
  if (customLogo && customLogo !== "/shield.png") {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-white/10 border border-white/20 p-1 ${className} ${animate ? 'hover:scale-110 transition-transform duration-300 cursor-pointer' : ''}`}>
        <img
          src={customLogo}
          alt={theme?.clubShortName || "Escudo Club"}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Escudo vectorial predeterminado con color dinámico
  return (
    <div className={`relative flex items-center justify-center ${className} ${animate ? 'hover:scale-110 hover:rotate-3 transition-transform duration-300 cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
      >
        <path
          d="M10 10 C10 10 50 2 50 2 C50 2 90 10 90 10 C90 35 90 75 50 115 C10 75 10 35 10 10 Z"
          fill="#111111"
          stroke={primColor}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M14 13 C14 13 50 5 50 5 C50 5 86 13 86 13 C86 36 86 73 50 110 C14 73 14 36 14 13 Z"
          fill="#F8F9FA"
        />

        <path d="M26 15 L26 95 C33 100 41 105 50 108 L50 6 Z" fill={primColor} />
        <path d="M62 15 L62 95 C55 100 49 105 50 108 L50 6 Z" fill={primColor} />

        <path
          d="M80 20 L20 80 L23 85 L83 25 Z"
          fill="#111111"
          opacity="0.9"
        />

        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#F8F9FA"
          fontSize="22"
          fontWeight="900"
          fontFamily="'Outfit', sans-serif"
          className="select-none tracking-tighter"
          style={{ textShadow: '2px 2px 0px #111111, -1px -1px 0px #111111, 2px -1px 0px #111111, -1px 2px 0px #111111' }}
        >
          {theme?.clubShortName?.substring(0, 2) || "JN"}
        </text>

        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill={primColor}
          fontSize="8"
          fontWeight="bold"
          className="select-none"
        >
          EST. 1943
        </text>
      </svg>
    </div>
  );
}
