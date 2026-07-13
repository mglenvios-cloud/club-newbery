import React from 'react';

export default function LiveBadge({ className = "", animate = true, text = "En Vivo" }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {animate && (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
      )}
      {!animate && <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>}
      <span className="text-[10px] font-black tracking-wider uppercase text-red-500">{text}</span>
    </div>
  );
}
