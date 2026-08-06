"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldAlert, User, Gamepad2, Sparkles, Heart, Users2 } from 'lucide-react';
import { useState } from 'react';
import ClubShield from './ClubShield';
import { useTheme } from './ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { 
      name: 'Disciplinas', 
      path: '#',
      submenu: [
        { name: 'Futsal AFA', path: '/disciplinas/futsal' },
        { name: 'Patín Artístico', path: '/disciplinas/patin' },
        { name: 'Vóleibol Femenino', path: '/disciplinas/voley' },
        { name: 'Artes Marciales', path: '/disciplinas/artes-marciales' },
      ]
    },
    { name: 'Juegos', path: '/juegos' },
    { name: 'Mi Vida', path: '/comunidad/mi-vida' },
    { name: 'Inferiores', path: '/mundo-inferiores' },
    { name: theme?.tvTitle ? (theme.tvTitle.includes('📺') ? theme.tvTitle : `📺 ${theme.tvTitle}`) : (theme?.clubShortName ? `📺 ${theme.clubShortName} TV` : '📺 CLUB TV'), path: '/newbery-tv' },
    { name: 'Niñas 💜', path: '/seccion-ninas' },
    { name: 'Ranking', path: '/ranking' },
    { name: 'Galería', path: '/galeria' },
    { name: 'Reservas', path: '/reservas' },
  ];

  const mobileBottomLinks = [
    { name: 'Inicio', path: '/', icon: <ClubShield className="w-6 h-6" animate={false} /> },
    { name: 'Juegos', path: '/juegos', icon: <Gamepad2 size={20} /> },
    { name: 'Mi Vida', path: '/comunidad/mi-vida', icon: <Heart size={20} /> },
    { name: 'Semillero', path: '/mundo-inferiores', icon: <Users2 size={20} /> },
    { name: 'Chat IA', path: '/newbery-ia', icon: <Sparkles size={20} /> }
  ];

  return (
    <>
      {/* NAVBAR SUPERIOR GENERAL */}
      <nav className="fixed top-0 w-full z-50 bg-jn-black/95 backdrop-blur-md border-b border-white/10 h-16">
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo y Escudo Oficial Modificable */}
            <Link href="/" className="flex items-center gap-2 group">
              <ClubShield className="w-10 h-10" />
              <div className="flex flex-col">
                <span
                  className="font-black text-sm tracking-tight leading-none transition-colors"
                  style={{ color: '#ffffff' }}
                >
                  {theme?.clubShortName || 'JORGE NEWBERY'}
                </span>
                <span className="text-gray-400 font-bold text-[10px] tracking-wider uppercase">
                  {theme?.subTitle || 'CLUB DIGITAL'}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center gap-5">
              {navLinks.map((link) => {
                if (link.submenu) {
                  const isSubActive = link.submenu.some(s => pathname === s.path);
                  return (
                    <div 
                      key={link.name} 
                      className="relative group py-2"
                    >
                      <button
                        className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer outline-none ${
                          isSubActive ? 'border-b-2 pb-1' : 'text-gray-300 hover:text-white pb-1'
                        }`}
                        style={{ color: isSubActive ? theme?.primaryColor : undefined, borderColor: isSubActive ? theme?.primaryColor : undefined }}
                      >
                        {link.name} <span className="text-[10px]">▾</span>
                      </button>
                      <div className="absolute top-full left-0 mt-1 bg-jn-black/95 backdrop-blur-md border border-white/10 rounded-xl p-2.5 w-48 space-y-1 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150">
                        {link.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className="block text-[10px] font-bold uppercase tracking-wider p-2 rounded-lg hover:text-white transition-colors"
                            style={{
                              backgroundColor: pathname === sub.path ? `${theme?.primaryColor}22` : undefined,
                              color: pathname === sub.path ? theme?.primaryColor : undefined,
                            }}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link 
                    key={link.name} 
                    href={link.path}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                      pathname === link.path 
                        ? 'border-b-2 pb-1' 
                        : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-500 pb-1'
                    }`}
                    style={{
                      color: pathname === link.path ? theme?.primaryColor : undefined,
                      borderColor: pathname === link.path ? theme?.primaryColor : undefined,
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Acciones de Cuenta y Admin */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/portal" className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors border border-white/10">
                <User size={14} /> Portal Socio
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-colors border"
                style={{
                  color: theme?.primaryColor,
                  backgroundColor: `${theme?.primaryColor}15`,
                  borderColor: `${theme?.primaryColor}30`,
                }}
              >
                <ShieldAlert size={14} /> Admin
              </Link>
            </div>

            {/* Mobile menu toggle button */}
            <button onClick={() => setIsOpen(!isOpen)} className="xl:hidden text-white transition-colors p-2 rounded-lg">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MENÚ HAMBURGUESA DESPLEGABLE MÓVIL */}
        {isOpen && (
          <div className="xl:hidden bg-jn-black/98 border-b border-white/15 py-6 px-4 space-y-3 absolute top-16 left-0 w-full animate-fade-in shadow-2xl overflow-y-auto max-h-[80vh]">
            <div className="grid grid-cols-2 gap-3">
              {navLinks.map((link) => {
                if (link.submenu) {
                  return link.submenu.map((sub) => (
                    <Link 
                      key={sub.name} 
                      href={sub.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center py-3 rounded-xl font-bold text-[10px] text-center border transition-all"
                      style={{
                        backgroundColor: pathname === sub.path ? theme?.primaryColor : 'rgba(255,255,255,0.05)',
                        borderColor: pathname === sub.path ? theme?.primaryColor : 'rgba(255,255,255,0.1)',
                        color: '#ffffff',
                      }}
                    >
                      {sub.name}
                    </Link>
                  ));
                }
                return (
                  <Link 
                    key={link.name} 
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3 rounded-xl font-bold text-sm text-center border transition-all"
                    style={{
                      backgroundColor: pathname === link.path ? theme?.primaryColor : 'rgba(255,255,255,0.05)',
                      borderColor: pathname === link.path ? theme?.primaryColor : 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link onClick={() => setIsOpen(false)} href="/portal" className="flex items-center justify-center gap-2 font-bold text-sm text-jn-black bg-white py-3 rounded-xl hover:bg-gray-100 transition-colors">
                <User size={16} /> Portal Socio
              </Link>
              <Link onClick={() => setIsOpen(false)} href="/admin" className="flex items-center justify-center gap-2 font-bold text-sm text-white py-3 rounded-xl transition-colors" style={{ backgroundColor: theme?.primaryColor }}>
                <ShieldAlert size={16} /> Panel Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* BARRA DE NAVEGACIÓN INFERIOR ESTILO APP MÓVIL (SÓLO CELULARES) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-jn-black border-t border-white/10 z-50 h-16 flex justify-around items-center px-2">
        {mobileBottomLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.name} 
              href={link.path}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors"
              style={{ color: isActive ? theme?.primaryColor : '#9ca3af' }}
            >
              <div className="mb-0.5">{link.icon}</div>
              <span className="text-[9px] font-bold tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
