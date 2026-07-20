"use client";

import React from 'react';
import { useClubTheme } from '../../hooks/useClubTheme';

export default function Navbar() {
  const { club, setClub, availableClubs } = useClubTheme();

  return (
    <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-gray-500">Club Activo:</span>
        <select
          value={club.slug}
          onChange={e => {
            const selected = availableClubs.find(c => c.slug === e.target.value);
            if (selected) setClub(selected);
          }}
          className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-black uppercase text-white outline-none cursor-pointer"
        >
          {availableClubs.map(c => (
            <option key={c.slug} value={c.slug}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-[10px] font-black uppercase tracking-widest text-club-primary" style={{ color: 'var(--color-primary)' }}>
          Licencia ACTIVA
        </span>
        <div className="w-8 h-8 rounded-full bg-club-primary flex items-center justify-center font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
          U
        </div>
      </div>
    </header>
  );
}
