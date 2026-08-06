"use client";
import React, { useState } from 'react';
import { Shield, Eye, Clock, Award, CheckCircle, Save, Settings, Users } from 'lucide-react';
import ClubShield from '@/components/ClubShield';
import { useTheme } from '@/components/ThemeContext';

export default function ParentalControl() {
  const { theme } = useTheme();
  const [socialVisibility, setSocialVisibility] = useState(true);
  const [iaHomeworkFilter, setIaHomeworkFilter] = useState(true);
  const [playTimeLimit, setPlayTimeLimit] = useState("unlimited");
  const [successMsg, setSuccessMsg] = useState("");

  const childProfiles = [
    { name: "Thiago Medina", age: 11, category: "Futsal 2015", xp: "4,820 XP", coins: "450 🪙", recentPosts: 3 }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg("¡Ajustes de control parental guardados!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black py-10 px-4">
      <div className="container mx-auto max-w-4xl space-y-8 animate-fade-in">
        
        {/* Encabezado */}
        <div>
          <h2 className="text-3xl font-black text-jn-black tracking-tight flex items-center gap-3">
            <Shield className="text-jn-red" size={32} /> CONTROL PARENTAL Y SEGURIDAD
          </h2>
          <p className="text-sm text-gray-500">Configurá el espacio digital seguro para tus hijos en {theme?.clubName || 'nuestra comunidad'}.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* PERFILES DE HIJOS ASOCIADOS */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="font-black text-sm text-gray-400 uppercase tracking-wider">Hijos Vinculados</h3>
            
            {childProfiles.map((child, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-jn-red/10 text-jn-red rounded-full flex items-center justify-center font-bold">
                    TM
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{child.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{child.category}</p>
                  </div>
                </div>
                
                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Puntaje XP</span>
                    <span className="font-bold text-jn-black">{child.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coins Ganadas</span>
                    <span className="font-bold text-yellow-600">{child.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Posteos en 'Mi Vida'</span>
                    <span className="font-bold text-jn-black">{child.recentPosts} aprobados</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AJUSTES DE SEGURIDAD */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-jn-black uppercase border-b border-gray-100 pb-3 flex items-center gap-2">
              <Settings className="text-jn-red" size={20} /> Ajustes de Seguridad
            </h3>

            <form onSubmit={handleSave} className="space-y-6 text-sm">
              
              {/* Filtro Visibilidad Social */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-jn-black flex items-center gap-1.5">
                    <Eye size={16} className="text-gray-500" /> Visibilidad en el Muro Social
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Permitir que el perfil y dibujos de mi hijo sean visibles en el espacio comunitario 'Mi Vida'.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={socialVisibility}
                  onChange={e => setSocialVisibility(e.target.checked)}
                  className="w-5 h-5 accent-jn-red cursor-pointer"
                />
              </div>

              {/* Filtro IA Escolar */}
              <div className="flex justify-between items-start gap-4 border-t border-gray-100 pt-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-jn-black flex items-center gap-1.5">
                    <Shield size={16} className="text-gray-500" /> Control del Filtro Educativo
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Activar filtro escolar automático en Newbery IA para impedir resoluciones directas de exámenes y promover explicaciones paso a paso.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={iaHomeworkFilter}
                  onChange={e => setIaHomeworkFilter(e.target.checked)}
                  className="w-5 h-5 accent-jn-red cursor-pointer"
                />
              </div>

              {/* Límite de Tiempo de Juegos */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h4 className="font-bold text-jn-black flex items-center gap-1.5">
                  <Clock size={16} className="text-gray-500" /> Límite de Tiempo de Juego Diario
                </h4>
                <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                  Establecer la cantidad máxima de tiempo que tu hijo puede jugar los minijuegos en el portal al día.
                </p>
                <select 
                  value={playTimeLimit}
                  onChange={e => setPlayTimeLimit(e.target.value)}
                  className="p-2 border border-gray-250 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-600 focus:outline-none w-full max-w-[200px]"
                >
                  <option value="unlimited">Sin límites de tiempo</option>
                  <option value="30">30 minutos diarios</option>
                  <option value="60">1 hora diaria</option>
                  <option value="120">2 horas diarias</option>
                </select>
              </div>

              {successMsg && (
                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle size={16} /> {successMsg}
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit"
                  className="bg-jn-black text-white hover:bg-jn-red font-bold text-xs uppercase py-2.5 px-6 rounded-full shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} /> Guardar Configuración
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
