import React from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, Activity, PlayCircle, BarChart2, Star, ArrowLeft } from 'lucide-react';
import ClubShield from '@/components/ClubShield';

const disciplinesData = {
  "patin": {
    title: "Patín Artístico",
    subtitle: "Clases formativas y grupo de competición show",
    color: "from-purple-900 to-jn-darkred",
    heroImage: "/images/futsal_hero.png",
    intro: "El patinaje artístico del Club Jorge Newbery es una disciplina llena de arte, coordinación y esfuerzo, destacándose a nivel metropolitano.",
    stats: [
      { label: "Patinadoras Activas", value: "120" },
      { label: "Medallas en 2026", value: "18" },
      { label: "Profesores Federados", value: "4" }
    ],
    schedule: [
      { day: "Lunes y Miércoles", hour: "19:30 a 21:00hs", group: "Grupo Show Competición" },
      { day: "Martes y Jueves", hour: "18:00 a 19:30hs", group: "Iniciales (5 a 10 años)" }
    ],
    roster: [
      { name: "Juana Rossi", pos: "Solo Libre", desc: "Campeona Metropolitana" },
      { name: "Delfina Solari", pos: "Show Grupal", desc: "Líder de Coreografía" }
    ]
  },
  "voley": {
    title: "Vóleibol Femenino",
    subtitle: "Escuela formativa de vóley y liga local",
    color: "from-blue-900 to-purple-900",
    heroImage: "/images/futsal_hero.png",
    intro: "Formamos jugadoras desde los 6 años en técnicas de pase, saque y remate, incentivando el espíritu de equipo y Fair Play.",
    stats: [
      { label: "Jugadoras Inscriptas", value: "80" },
      { label: "Categorías", value: "4" },
      { label: "Profesores", value: "3" }
    ],
    schedule: [
      { day: "Martes y Jueves", hour: "17:30 a 19:00hs", group: "Sub-13 Infantil" },
      { day: "Viernes", hour: "18:30 a 20:00hs", group: "Sub-17 Cadetes" }
    ],
    roster: [
      { name: "Clara Espósito", pos: "Armadora", desc: "Insignia Fair Play" },
      { name: "Catalina López", pos: "Atacante", desc: "Goleadora del mes" }
    ]
  },
  "artes-marciales": {
    title: "Artes Marciales (Taekwondo)",
    subtitle: "Defensa personal y disciplina tradicional",
    color: "from-jn-black to-jn-darkred",
    heroImage: "/images/futsal_hero.png",
    intro: "Enseñamos respeto, concentración y técnicas oficiales de taekwondo olímpico para niños y niñas de todas las edades.",
    stats: [
      { label: "Alumnos Graduados", value: "50" },
      { label: "Cinturones Negros", value: "5" },
      { label: "Clases por Semana", value: "4" }
    ],
    schedule: [
      { day: "Martes y Jueves", hour: "18:30 a 19:45hs", group: "Taekwondo Infantil" },
      { day: "Lunes y Miércoles", hour: "19:00 a 20:30hs", group: "Taekwondo Adultos" }
    ],
    roster: [
      { name: "Thiago Medina", pos: "Cinturón Rojo", desc: "Oro Regional" },
      { name: "Lucas López", pos: "Cinturón Azul", desc: "Técnica Perfecta" }
    ]
  }
};

export default async function DisciplinaPage({ params }) {
  const p = await params;
  const slug = p.slug;
  const data = disciplinesData[slug];

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6 text-jn-black">
        <ClubShield className="w-16 h-20 mb-4 animate-bounce" animate={false} />
        <h2 className="text-2xl font-black">Disciplina no disponible</h2>
        <p className="text-sm text-gray-500 mt-2">La disciplina seleccionada no está disponible o no se practica en el club actualmente.</p>
        <Link href="/" className="mt-6 bg-jn-black text-white hover:bg-jn-red px-6 py-2.5 rounded-full font-bold text-xs uppercase transition-colors">
          Volver a Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-jn-black pb-20 animate-fade-in">
      {/* Hero Header */}
      <section className={`relative h-[55vh] flex items-center bg-gradient-to-r ${data.color} overflow-hidden text-white`}>
        <div className="absolute inset-0 bg-black/45 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider mb-6">
            <ArrowLeft size={16} /> Volver a Inicio
          </Link>
          
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider mb-4">
            <Activity size={12} className="text-jn-red" /> Módulo Oficial
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none">
            {data.title}
          </h1>
          <p className="text-base md:text-lg text-gray-300 mt-2 font-medium">
            {data.subtitle}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-16 relative z-20 grid lg:grid-cols-3 gap-8">
        
        {/* LADO IZQUIERDO: INTRODUCCIÓN Y CALENDARIO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tarjeta de Introducción */}
          <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="font-black text-lg text-jn-black uppercase tracking-wider">Sobre la Actividad</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-light">{data.intro}</p>
            
            {/* Estadísticas en cuadrícula */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {data.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-black text-jn-red">{stat.value}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Calendario de Prácticas */}
          <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm space-y-6">
            <h3 className="font-black text-lg text-jn-black uppercase tracking-wider flex items-center gap-2">
              <Calendar className="text-jn-red" size={20} /> Cronograma de Entrenamientos
            </h3>
            
            <div className="divide-y divide-gray-100">
              {data.schedule.map((sch, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-jn-black">{sch.group}</h4>
                    <p className="text-xs text-gray-500">{sch.day}</p>
                  </div>
                  <span className="bg-jn-black text-white text-xs font-bold px-3 py-1 rounded-full">{sch.hour}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* LADO DERECHO: PLANTEL DESTACADO */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Plantel destacado / Instructores */}
          <div className="bg-gradient-to-b from-jn-black to-gray-900 text-white p-6 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-jn-red blur-[60px] opacity-35"></div>
            
            <h3 className="font-black text-lg text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Users className="text-jn-red" size={20} /> Deportistas Destacados
            </h3>
            
            <div className="space-y-4">
              {data.roster.map((player, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-jn-red/20 text-jn-red rounded-full flex items-center justify-center font-bold text-sm">
                    {player.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{player.name}</h4>
                    <p className="text-[10px] text-jn-red uppercase tracking-wider font-bold">{player.pos}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{player.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 text-center">
              <Link href="/asociate" className="inline-block bg-jn-red hover:bg-jn-darkred text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full transition-colors">
                Inscribirme en esta Disciplina
              </Link>
            </div>
          </div>

        </div>

      </section>
    </div>
  );
}
