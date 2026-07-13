import React from 'react';

export default function ClubShield({ className = "w-16 h-16", animate = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className} ${animate ? 'hover:scale-110 hover:rotate-3 transition-transform duration-300 cursor-pointer' : ''}`}>
      <svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_10px_rgba(211,47,47,0.3)]"
      >
        {/* Borde exterior plateado/negro */}
        <path
          d="M10 10 C10 10 50 2 50 2 C50 2 90 10 90 10 C90 35 90 75 50 115 C10 75 10 35 10 10 Z"
          fill="#111111"
          stroke="#D32F2F"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Fondo blanco del escudo */}
        <path
          d="M14 13 C14 13 50 5 50 5 C50 5 86 13 86 13 C86 36 86 73 50 110 C14 73 14 36 14 13 Z"
          fill="#F8F9FA"
        />

        {/* Franjas Rojas Verticales (Identidad de Newbery) */}
        <path d="M26 15 L26 95 C33 100 41 105 50 108 L50 6 Z" fill="#D32F2F" />
        <path d="M62 15 L62 95 C55 100 49 105 50 108 L50 6 Z" fill="#D32F2F" />
        
        {/* Banda Diagonal Negra o Detalles Centrales */}
        <path
          d="M80 20 L20 80 L23 85 L83 25 Z"
          fill="#111111"
          opacity="0.9"
        />

        {/* Texto "JN" con tipografía deportiva y dorado */}
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
          JN
        </text>

        {/* Detalle de año de fundación */}
        <text
          x="50"
          y="78"
          textAnchor="middle"
          fill="#D32F2F"
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
