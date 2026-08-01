'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function StandaloneReceiptPage({ params }) {
  // Extract params safely
  const receiptId = params?.receiptId || 'REC-100001';

  // Sample or dynamic receipt data based on ID
  const clubName = 'Club Atlético Jorge Newbery';
  const shortName = 'Jorge Newbery';
  const sigla = 'JN';
  const address = 'Alpatacal 3026, Villa Devoto, Ciudad Autónoma de Buenos Aires';
  const phone = '+54 11 4501-0000';
  const email = 'contacto@jorgenewbery.org.ar';
  const website = 'https://jorgenewbery.org.ar';

  const dateStr = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const qrUrl = `https://jorgenewbery.org.ar/verify/${receiptId}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans print:p-0 print:bg-white print:min-h-0">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, header, nav, footer, button {
            display: none !important;
          }
          #printable-receipt-card {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
            border: none !important;
          }
        }
      `}</style>

      {/* ACTION BAR (Hidden on print) */}
      <div className="w-full max-w-3xl mb-6 flex items-center justify-between no-print bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black">
            JN
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Comprobante Oficial de Pago</h1>
            <p className="text-xs text-slate-400">Emisión digital oficial • {clubName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* STANDALONE RECEIPT CARD */}
      <div
        id="printable-receipt-card"
        className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border-4 border-blue-900 space-y-8 font-sans"
      >
        {/* HEADER SECTION WITH CLUB BRANDING */}
        <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-2 border-blue-950 uppercase tracking-tighter">
              {sigla}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-950 uppercase">
                {clubName}
              </h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">
                Institución Deportiva &amp; Social • Devoto, CABA
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{address}</p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-600 mt-1">
                <span>Tel: {phone}</span>
                <span>Email: {email}</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block bg-red-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-sm">
              Comprobante Oficial
            </span>
            <p className="text-sm font-mono font-black text-slate-900 mt-2">{receiptId}</p>
            <p className="text-xs font-mono font-bold text-slate-500">Fecha: {dateStr}</p>
          </div>
        </div>

        {/* SOCIO / CLIENT DATA */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 grid grid-cols-3 gap-6 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block">
              Titular / Socio
            </span>
            <p className="text-base font-black text-slate-900 mt-1">Socio Institucional</p>
            <span className="text-slate-600">Cat: Activo</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block">
              Identificación / N° Socio
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">SOC-2026-JN</p>
            <span className="text-slate-600">DNI: 35.890.123</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider block">
              Estado de Pago
            </span>
            <span className="inline-flex items-center gap-1 mt-1 text-emerald-700 bg-emerald-100 border border-emerald-300 font-bold px-2.5 py-1 rounded-md text-xs uppercase">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acreditado
            </span>
          </div>
        </div>

        {/* DETAILS TABLE */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                <th className="p-4">Concepto Abonado</th>
                <th className="p-4 text-center">Forma de Pago</th>
                <th className="p-4 text-right">Importe Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              <tr>
                <td className="p-4 font-bold text-slate-900 text-sm">
                  Cuota Social Institucional — {clubName}
                </td>
                <td className="p-4 text-center font-mono font-bold text-slate-700 uppercase">
                  Efectivo / MercadoPago
                </td>
                <td className="p-4 text-right font-mono font-black text-base text-blue-900">
                  $12.500,00 ARS
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTALS & QR VALIDATION */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <QRCodeSVG value={qrUrl} size={80} level="H" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Validación Digital Centralizada
              </span>
              <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                ✓ Comprobante Válido Oficial
              </span>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                Hash: {receiptId}-JN-VERIFIED
              </span>
            </div>
          </div>

          <div className="text-right border-l border-slate-200 pl-8">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              Total Cancelado
            </span>
            <span className="text-3xl font-black font-mono text-blue-900 block mt-1">
              $12.500,00 ARS
            </span>
          </div>
        </div>

        {/* FOOTER & SIGNATURE */}
        <div className="border-t border-slate-200 pt-6 flex items-center justify-between text-xs text-slate-600">
          <div className="max-w-md">
            <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Normativa de Tesorería
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Este documento reviste carácter de constancia oficial de pago ingresado en las cajas del {clubName}.
            </p>
          </div>
          <div className="text-center border-t border-slate-400 pt-2 w-48">
            <p className="font-serif italic font-semibold text-slate-800">Tesorería General</p>
            <p className="font-bold text-[10px] uppercase text-slate-900 tracking-wider mt-0.5">
              {clubName}
            </p>
          </div>
        </div>

        {/* FOOTER BRANDING */}
        <div className="text-center border-t border-slate-200 pt-4 text-[10px] text-slate-500 uppercase font-mono font-semibold">
          {clubName} • Alpatacal 3026, Villa Devoto • www.jorgenewbery.org.ar
        </div>
      </div>
    </div>
  );
}
