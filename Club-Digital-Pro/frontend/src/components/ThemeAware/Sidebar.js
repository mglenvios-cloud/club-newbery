"use client";

import React from 'react';
import { useClubTheme } from '../../hooks/useClubTheme';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { club } = useClubTheme();

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'socios', label: '👥 Socios' },
    { id: 'finanzas', label: '💳 Finanzas' },
    { id: 'deportiva', label: '⚽ Gestión Deportiva' },
    { id: 'tv', label: '📺 Club TV' },
    { id: 'marketing', label: '📈 Marketing' }
  ];

  return (
    <aside 
      className="w-64 h-screen p-5 flex flex-col justify-between select-none border-r border-white/5"
      style={{ backgroundColor: 'var(--color-menu)' }}
    >
      <div className="space-y-8">
        {/* Brand/Club Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-black font-mono">
            {club.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="text-left leading-none">
            <h2 className="text-xs font-black text-white uppercase tracking-wider">{club.nombre}</h2>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Portal Oficial</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === item.id 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="text-[9px] text-gray-600 font-bold uppercase text-center border-t border-white/5 pt-4">
        Club Digital Pro v1.0
      </div>
    </aside>
  );
}
