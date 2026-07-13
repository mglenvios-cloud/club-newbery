import React from 'react';
import { PlayCircle, Eye } from 'lucide-react';

export default function MostViewed({ media = [], onPlayVideo }) {
  // Sort media by views descending and take the top 4
  const sorted = [...media]
    .filter(item => item.type === 'VIDEO')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between select-none">
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Lo Más Visto</span>
        <span className="text-[8px] bg-red-650/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black tracking-widest">TOP VIEWS</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sorted.map((item, idx) => {
          return (
            <div 
              key={item.id} 
              onClick={() => onPlayVideo(item)}
              className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg group hover:border-red-600/35 transition-all duration-300 relative cursor-pointer text-left"
            >
              {/* Ranking badge overlay */}
              <div className="absolute top-2 left-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center font-black text-[10px] text-white z-20 select-none shadow-md">
                {idx + 1}
              </div>

              <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                <button
                  className="absolute z-10 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg group-hover:scale-110 transition-all"
                >
                  <PlayCircle size={16} />
                </button>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black opacity-30" />
                )}
              </div>

              <div className="p-3.5 space-y-1">
                <span className="text-[7px] text-red-400 font-bold uppercase tracking-wider block">
                  {item.category}
                </span>
                <h5 className="font-black text-[11px] uppercase text-white truncate leading-none">
                  {item.title}
                </h5>
                <span className="text-[8px] text-zinc-550 font-bold flex items-center gap-0.5 select-none">
                  <Eye size={10} className="text-zinc-650 shrink-0" /> {item.views} reproducciones
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { MostViewed };
