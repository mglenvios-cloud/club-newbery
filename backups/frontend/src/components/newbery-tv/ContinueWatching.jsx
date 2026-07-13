import React, { useState, useEffect } from 'react';
import { PlayCircle, Trash2 } from 'lucide-react';

export default function ContinueWatching({ onPlayVideo }) {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('newbery_tv_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 4)); // Only keep the top 4 recent
        }
      }
    } catch (e) {
      console.warn("localStorage history read failed", e);
    }
  }, []);

  const handleClearItem = (id, e) => {
    e.stopPropagation();
    try {
      const nextHistory = history.filter(item => item.id !== id);
      setHistory(nextHistory);
      localStorage.setItem('newbery_tv_history', JSON.stringify(nextHistory));
    } catch {}
  };

  if (history.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between select-none">
        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block">Continuar Viendo</span>
        <span className="text-[8px] bg-red-650/15 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black tracking-widest">RESUME</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((item) => {
          const progressPercent = item.progress || 50;
          return (
            <div 
              key={item.id} 
              onClick={() => onPlayVideo(item)}
              className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden shadow-lg group hover:border-red-600/35 transition-all duration-300 relative cursor-pointer text-left"
            >
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
                
                {/* Trash button to remove item */}
                <button
                  onClick={(e) => handleClearItem(item.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 hover:text-red-500 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  title="Quitar de la lista"
                >
                  <Trash2 size={10} />
                </button>

                {/* Progress bar overlay at the bottom of the video cover */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-800">
                  <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <span className="text-[7px] text-red-400 font-bold uppercase tracking-wider block">
                  {item.category}
                </span>
                <h5 className="font-black text-[11px] uppercase text-white truncate leading-none">
                  {item.title}
                </h5>
                <span className="text-[8px] text-zinc-500 font-bold block select-none">
                  {progressPercent}% Visto
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export { ContinueWatching };
