"use client";

import React, { useState } from 'react';
import { DollarSign, ShieldCheck, FileCheck, RefreshCw } from 'lucide-react';

export default function FinanzasModule() {
  const [plans, setPlans] = useState([
    { id: 'p-1', name: 'Cuota Social Activa', price: 4500, frequency: 'MENSUAL' },
    { id: 'p-2', name: 'Cuota Federado Futsal', price: 8000, frequency: 'MENSUAL' }
  ]);

  const [debts, setDebts] = useState([
    { id: 'd-1', socio: 'Carlos Tevez', plan: 'Cuota Social Activa', price: 4500, status: 'MOROSO', month: 'Enero 2026' },
    { id: 'd-2', socio: 'Juan Roman Riquelme', plan: 'Cuota Federado Futsal', price: 8000, status: 'AL DIA', month: 'Enero 2026' }
  ]);

  const [invoices, setInvoices] = useState([
    { id: 'inv-101', socio: 'Juan Roman Riquelme', plan: 'Cuota Federado Futsal', amount: 8000, date: '2026-01-05', method: 'MercadoPago' }
  ]);

  const handlePayMercadoPago = (debt) => {
    const confirmPay = window.confirm(`¿Desea abrir la pasarela de Mercado Pago para abonar $${debt.price} correspondientes a ${debt.month}?`);
    if (!confirmPay) return;

    // Simulate payment transaction
    alert("Redirigiendo a Mercado Pago... [Simulado]");
    setTimeout(() => {
      // update state
      setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, status: 'AL DIA' } : d));
      
      const newInvoice = {
        id: `inv-${Math.floor(Math.random() * 9000) + 1000}`,
        socio: debt.socio,
        plan: debt.plan,
        amount: debt.price,
        date: new Date().toISOString().split('T')[0],
        method: 'MercadoPago'
      };
      setInvoices([newInvoice, ...invoices]);
      alert("¡Pago procesado y verificado con webhook de Mercado Pago!");
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
          <DollarSign size={20} className="text-club-primary" style={{ color: 'var(--color-primary)' }} /> Cuotas y Finanzas
        </h2>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-black uppercase">
          Mercado Pago Ready
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Debt status & MP payment (7 Cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Estados de Deuda de Socios</h3>
          
          <div className="space-y-2">
            {debts.map(d => (
              <div 
                key={d.id}
                className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex justify-between items-center"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase text-white">{d.socio}</h4>
                  <p className="text-[9px] text-zinc-500 font-semibold uppercase">{d.plan} · {d.month}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black border ${
                    d.status === 'AL DIA' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {d.status}
                  </span>
                  
                  {d.status === 'MOROSO' && (
                    <button
                      onClick={() => handlePayMercadoPago(d)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[8px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    >
                      Pagar MP 💳
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Invoices & Receipts (5 Cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">Historial de Recibos / Facturas</h3>
          
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {invoices.map(inv => (
              <div key={inv.id} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-white uppercase font-black">{inv.id}</strong>
                  <span className="text-[8px] text-zinc-500 font-mono">{inv.date}</span>
                </div>
                <div className="text-[9px] text-zinc-400 font-semibold space-y-0.5">
                  <p>Socio: <strong className="text-zinc-300">{inv.socio}</strong></p>
                  <p>Monto: <strong className="text-emerald-400">${inv.amount}</strong> via {inv.method}</p>
                </div>
              </div>
            ))}
            
            {invoices.length === 0 && (
              <p className="text-xs text-zinc-500 py-6 text-center">No se han registrado pagos aún.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
