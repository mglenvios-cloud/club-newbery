"use client";

import React, { useState } from 'react';
import { Users, Plus, X, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function SociosModule() {
  const [socios, setSocios] = useState([
    { id: 's-1', nombre: 'Carlos', apellido: 'Tevez', dni: '32000000', email: 'carlitos@club.com', telefono: '11-5555-9000', estado: 'ACTIVO', digitalCard: { id: 'card-1', qrCode: 'jorge-newbery-Carlos-Tevez-QR' } },
    { id: 's-2', nombre: 'Juan Roman', apellido: 'Riquelme', dni: '28000000', email: 'roman@club.com', telefono: '11-4444-9000', estado: 'ACTIVO', digitalCard: { id: 'card-2', qrCode: 'jorge-newbery-Roman-Riquelme-QR' } }
  ]);

  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', email: '', telefono: '', tutor: '', parentesco: '' });
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.dni) return alert("Completa los datos obligatorios.");

    const newSocio = {
      id: `s-${Date.now()}`,
      nombre: form.nombre,
      apellido: form.apellido,
      dni: form.dni,
      email: form.email,
      telefono: form.telefono,
      estado: 'ACTIVO',
      tutor: form.tutor ? { nombre: form.tutor, parentesco: form.parentesco } : null,
      digitalCard: { id: `card-${Date.now()}`, qrCode: `club-socio-${form.nombre}-${form.apellido}-QR` }
    };

    setSocios([...socios, newSocio]);
    setForm({ nombre: '', apellido: '', dni: '', email: '', telefono: '', tutor: '', parentesco: '' });
    alert("¡Socio fichado y guardado con éxito!");
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <Users size={20} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Centro de Socios
        </h2>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-black uppercase">
          Módulo Activo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Alta (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Registrar Nuevo Socio</h3>
          
          <form onSubmit={handleCreate} className="space-y-3 text-xs font-bold text-gray-400 uppercase">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] block mb-1">Nombre *</label>
                <input 
                  type="text" required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] block mb-1">Apellido *</label>
                <input 
                  type="text" required
                  value={form.apellido}
                  onChange={e => setForm({ ...form, apellido: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[8px] block mb-1">DNI *</label>
                <input 
                  type="text" required
                  value={form.dni}
                  onChange={e => setForm({ ...form, dni: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none"
                />
              </div>
              <div>
                <label className="text-[8px] block mb-1">Teléfono</label>
                <input 
                  type="text"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[8px] block mb-1">Correo Electrónico</label>
              <input 
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-zinc-900 border border-white/10 p-2.5 rounded-xl text-white outline-none lowercase font-semibold"
              />
            </div>

            <div className="pt-2 border-t border-white/5 space-y-3">
              <span className="text-[8px] text-zinc-500 uppercase block">Grupo Familiar / Tutor responsable</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] block mb-1">Nombre Tutor</label>
                  <input 
                    type="text"
                    value={form.tutor}
                    onChange={e => setForm({ ...form, tutor: e.target.value })}
                    placeholder="Para menores"
                    className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] block mb-1">Parentesco</label>
                  <input 
                    type="text"
                    value={form.parentesco}
                    onChange={e => setForm({ ...form, parentesco: e.target.value })}
                    placeholder="Padre, Madre"
                    className="w-full bg-zinc-900 border border-white/10 p-2 rounded-xl text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-xs font-black uppercase py-3 rounded-xl transition-all shadow-lg cursor-pointer"
              style={{ backgroundColor: 'var(--color-button)', color: 'var(--color-text-main)' }}
            >
              Confirmar Alta Socio
            </button>
          </form>
        </div>

        {/* Listado y Carnet (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Socios Afiliados</h3>
          
          <div className="space-y-2">
            {socios.map(s => (
              <div 
                key={s.id}
                onClick={() => {
                  setSelectedSocio(s);
                  setModalOpen(true);
                }}
                className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex justify-between items-center hover:bg-zinc-900 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase text-white">{s.nombre} {s.apellido}</h4>
                    <span className="text-[8px] font-mono text-zinc-500">DNI: {s.dni} · {s.email || 'Sin mail'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black">
                    {s.estado}
                  </span>
                  <span className="text-[8px] font-black uppercase text-zinc-400 bg-white/5 border border-white/10 px-2 py-1 rounded">
                    Carnet QR 🔎
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL CARNET DIGITAL QR */}
      {modalOpen && selectedSocio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-sm w-full shadow-2xl p-6 relative">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-6">
              <div className="space-y-1">
                <span className="text-[8px] bg-club-primary/15 text-club-primary border border-club-primary/20 px-2 py-0.5 rounded font-black uppercase" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                  Credencial Oficial
                </span>
                <h3 className="font-black text-xs uppercase tracking-wider text-white pt-2">CARNET DIGITAL SOCIO</h3>
              </div>

              {/* Photo & QR Block */}
              <div className="bg-white p-6 rounded-2xl max-w-[200px] mx-auto space-y-4 shadow-xl flex flex-col items-center">
                {/* Simulated QR Code using pixels representation */}
                <div className="w-32 h-32 bg-black flex flex-wrap p-1.5 rounded">
                  <div className="w-full h-full bg-white flex items-center justify-center font-black text-black text-[9px] select-none">
                    [ QR CODE SCAN ]
                  </div>
                </div>
                <span className="text-[8px] font-mono text-zinc-800 font-bold block">{selectedSocio.digitalCard.qrCode}</span>
              </div>

              <div className="text-xs space-y-2 border-t border-zinc-800 pt-4 text-left">
                <div className="flex justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">Socio:</span>
                  <strong className="text-white uppercase">{selectedSocio.nombre} {selectedSocio.apellido}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">DNI / ID:</span>
                  <strong className="text-white font-mono">{selectedSocio.dni}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase">Estado:</span>
                  <strong className="text-emerald-400">{selectedSocio.estado}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
