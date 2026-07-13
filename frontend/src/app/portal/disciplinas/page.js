"use client";
import React from 'react';
import { Activity, Calendar, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MisDisciplinas() {
  const misDeportes = [
    { name: "Futsal Juvenil", cat: "Categoría Sub-15", horario: "Lunes y Miércoles 18:30 a 20:00hs", estado: "Al día", arancel: "$15.000 / mes" },
    { name: "Taekwondo Inicial", cat: "Formativo Infantil", horario: "Martes y Jueves 18:30 a 19:45hs", estado: "Al día", arancel: "$10.000 / mes" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Disciplinas</h2>
          <p className="text-sm text-gray-500">Actividades deportivas en las que estás inscripto.</p>
        </div>
        <Link 
          href="/" 
          className="flex items-center gap-1.5 bg-jn-black hover:bg-jn-red text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors shadow-md"
        >
          Ver Disciplinas del Club <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {misDeportes.map((deporte, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-gray-100/50">
              <Activity size={80} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-lg text-jn-black leading-tight">{deporte.name}</h3>
                  <span className="text-[10px] font-black uppercase text-jn-red tracking-wider bg-red-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                    {deporte.cat}
                  </span>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  {deporte.estado}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                  <Calendar size={14} className="text-jn-red" />
                  <span>{deporte.horario}</span>
                </p>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
                  <Award size={14} className="text-jn-red" />
                  <span>Arancel: <span className="font-bold text-jn-black">{deporte.arancel}</span></span>
                </p>
              </div>
            </div>

            <div className="pt-6 relative z-10 flex gap-2 text-xs">
              <Link 
                href="/portal/cuotas" 
                className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-center transition-colors"
              >
                Ver Factura
              </Link>
              <button 
                onClick={() => alert("Comunicate con secretaría al 4503-4567 para solicitar la baja o cambio de horario.")}
                className="flex-1 bg-white hover:bg-red-50 border border-gray-200 text-red-600 font-bold py-2.5 rounded-xl text-center transition-colors"
              >
                Solicitar Baja
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
