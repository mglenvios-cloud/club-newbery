import React, { useState, useEffect } from 'react';

export default function SponsorsCarousel() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_URL}/api/publicidad/sponsors`)
      .then(res => res.ok && res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeSponsors = data.filter(s => s.isActive !== false);
          setSponsors(activeSponsors);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#111]/40 border-y border-white/5 py-8 select-none text-center">
        <span className="text-[9px] text-zinc-550 font-black uppercase tracking-widest bg-zinc-900 border border-white/5 px-3 py-1 rounded-full animate-pulse">
          Cargando Sponsors...
        </span>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return (
      <div className="bg-[#111]/25 border-y border-white/5 py-8 select-none text-center">
        <div className="container mx-auto px-4 max-w-md space-y-2">
          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest bg-zinc-900 border border-white/5 px-3.5 py-1.5 rounded-full inline-block">
            Espacio Publicitario
          </span>
          <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
            Asociate como Sponsor de Newbery TV y posicioná tu marca con transmisiones profesionales en vivo. Contactate a <span className="text-red-500 font-bold">publicidad@clubjorgenewbery.com.ar</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111]/40 border-y border-white/5 py-8 overflow-hidden select-none">
      <div className="container mx-auto px-4">
        <div className="text-center mb-5">
          <span className="text-[9px] text-zinc-550 font-black uppercase tracking-widest bg-zinc-900 border border-white/5 px-3 py-1 rounded-full">
            Sponsors Oficiales
          </span>
        </div>
        
        {/* Continuous slide container using inline CSS flex animation */}
        <div className="flex overflow-hidden relative w-full mask-gradient">
          <div className="flex gap-16 py-2 animate-infinite-scroll shrink-0 min-w-full justify-around items-center">
            {sponsors.map((sp, idx) => (
              <div 
                key={`${sp.name}-${idx}`} 
                className="text-sm font-black text-zinc-500 tracking-widest hover:text-red-500 transition-colors uppercase whitespace-nowrap cursor-pointer"
              >
                {sp.name}
              </div>
            ))}
            {/* Duplicated list to make it seamless scroll */}
            {sponsors.map((sp, idx) => (
              <div 
                key={`${sp.name}-dup-${idx}`} 
                className="text-sm font-black text-zinc-500 tracking-widest hover:text-red-500 transition-colors uppercase whitespace-nowrap cursor-pointer"
              >
                {sp.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes infiniteScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infiniteScroll 25s linear infinite;
        }
        .mask-gradient {
          mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
        }
      `}</style>
    </div>
  );
}
export { SponsorsCarousel };
