"use client";

import React from 'react';

export default function Card({ children, title, className = "" }) {
  return (
    <div 
      className={`p-6 rounded-2xl border border-white/10 shadow-xl text-left bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md ${className}`}
    >
      {title && (
        <h3 
          className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b border-white/5"
          style={{ color: 'var(--color-primary)' }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
