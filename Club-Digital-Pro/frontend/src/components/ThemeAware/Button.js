"use client";

import React from 'react';

export default function Button({ children, onClick, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-club-button hover:opacity-90 text-club-text font-black uppercase text-xs px-6 py-3 rounded-xl transition-all tracking-wider shadow-lg cursor-pointer ${className}`}
      style={{
        backgroundColor: 'var(--color-button)',
        color: 'var(--color-text)'
      }}
    >
      {children}
    </button>
  );
}
