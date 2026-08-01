'use client';
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink, X, FileText, Printer } from 'lucide-react';

/**
 * Helper para formatear valores monetarios en ARS
 */
const formatARS = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(num);
};

/**
 * Helper para formatear fechas
 */
const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleDateString('es-AR');
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) + ' hs';
};

/**
 * Plantilla HTML Aislada Exclusiva para el Recibo
 */
export function StandaloneReceiptTemplate({ receipt }) {
  const receiptNum = receipt?.numero || receipt?.receiptNumber || `REC-${100000 + (receipt?.id || 1)}`;
  const fecha = formatDate(receipt?.fechaEmision || receipt?.fechaPago || receipt?.date || new Date());
  const socioNombre = receipt?.memberName || (receipt?.socio ? `${receipt.socio.firstName} ${receipt.socio.lastName}` : receipt?.nombreCliente || 'Socio / Cliente');
  const socioDni = receipt?.socioDni || receipt?.dni || (receipt?.socio ? receipt.socio.dni : 'N/A');
  const socioNum = receipt?.socioNumber || (receipt?.socio ? receipt.socio.socioNumber : 'N/A');
  const concepto = receipt?.concept || receipt?.concepto || receipt?.planNombre || 'Cuota Social';
  const detalle = receipt?.details || receipt?.observaciones || (receipt?.metodoPago ? `Pago registrado vía ${receipt.metodoPago}` : 'Pago acreditado en sistema central.');
  const importe = receipt?.amount || receipt?.importe || 0;
  const estado = receipt?.estado || receipt?.status || 'PAGADO';
  const qrUrl = `https://jorgenewbery.org.ar/verify/${receiptNum}?amount=${importe}&socio=${encodeURIComponent(socioNombre)}`;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '794px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '32px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
        borderRadius: '16px'
      }}
    >
      {/* HEADER COMPROBANTE OFICIAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #b91c1c', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', backgroundColor: '#b91c1c', color: '#ffffff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', border: '2px solid #991b1b', textTransform: 'uppercase' }}>
            JN
          </div>
          <div>
            <h1 style={{ margin: '0', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Club Atlético Jorge Newbery
            </h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Institución Deportiva &amp; Social • Devoto, CABA
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '9px', fontWeight: '600', color: '#94a3b8' }}>
              Alpatacal 3026, Villa Devoto | Tel: +54 11 4501-0000
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'inline-block', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
            Comprobante Oficial
          </span>
          <p style={{ margin: '0', fontFamily: 'monospace', fontWeight: '900', fontSize: '16px', color: '#0f172a' }}>{receiptNum}</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>Fecha: {fecha}</p>
        </div>
      </div>

      {/* SECCIÓN DATOS DEL SOCIO */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '12px' }}>
          <div>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', display: 'block' }}>Nombre Completo</span>
            <span style={{ fontWeight: '900', color: '#0f172a', fontSize: '14px', display: 'block', marginTop: '2px' }}>{socioNombre}</span>
          </div>
          <div>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', display: 'block' }}>DNI / Identificación</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e293b', display: 'block', marginTop: '2px' }}>{socioDni}</span>
          </div>
          <div>
            <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', display: 'block' }}>N° Socio</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e293b', display: 'block', marginTop: '2px' }}>{socioNum}</span>
          </div>
        </div>
      </div>

      {/* TABLA DETALLE DEL PAGO */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px' }}>Concepto</th>
              <th style={{ padding: '12px' }}>Detalle</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Importe ARS</th>
            </tr>
          </thead>
          <tbody style={{ fontWeight: '600', color: '#334155' }}>
            <tr>
              <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                {concepto === 'CUOTA_SOCIAL' ? 'Cuota Social' : concepto}
              </td>
              <td style={{ padding: '12px', color: '#475569', fontSize: '11px' }}>
                {detalle}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', textTransform: 'uppercase' }}>
                  ✓ {estado}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: '900', color: '#0f172a', fontSize: '14px' }}>
                {formatARS(importe)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TOTALES Y CÓDIGO QR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <QRCodeSVG value={qrUrl} size={64} level="H" />
          </div>
          <div>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Validación Electrónica</span>
            <span style={{ fontSize: '9px', color: '#15803d', fontWeight: '800', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
              ✓ Código QR Verificado
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Total Abonado</span>
          <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', color: '#15803d', display: 'block', marginTop: '2px' }}>
            {formatARS(importe)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente Modal ReceiptPDF abre la página independiente /receipt/[id]
 */
export default function ReceiptPDF({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null;

  const receiptId = receipt.numero || receipt.receiptNumber || receipt.id || 'REC-100001';

  const handleOpenReceiptPage = () => {
    window.open(`/receipt/${receiptId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto font-sans">
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col my-auto border border-slate-800">
        
        {/* BARRA SUPERIOR */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2 text-white">
            <FileText size={16} className="text-blue-500" />
            <span className="uppercase tracking-wider">Comprobante Oficial — Club A. Jorge Newbery</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenReceiptPage}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-2 rounded-lg text-xs flex items-center gap-2 uppercase tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Printer size={14} />
              <span>Abrir Comprobante e Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* VISTA PREVIA MODAL */}
        <div className="p-4 bg-slate-900 overflow-x-auto flex justify-center max-h-[500px] overflow-y-auto">
          <StandaloneReceiptTemplate receipt={receipt} />
        </div>

        {/* PIE MODAL ACCIONES */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">El comprobante se abrirá en una página independiente lista para imprimir / guardar en PDF.</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleOpenReceiptPage}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>Abrir / Imprimir PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
