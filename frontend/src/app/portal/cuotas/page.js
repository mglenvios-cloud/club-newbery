"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, Check, AlertCircle, FileText, ExternalLink,
  DollarSign, Clock, RefreshCw, X, ShieldAlert, Sparkles
} from 'lucide-react';

import { API_URL } from '@/config';
import ReceiptPDF from '@/components/ReceiptPDF';

export default function MisCuotasSocio() {
  const [loading, setLoading] = useState(false);
  const [socio, setSocio] = useState(null);
  const [payments, setPayments] = useState([]);
  const [toast, setToast] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);

  // Mercado Pago simulated modal
  const [checkoutModal, setCheckoutModal] = useState({ isOpen: false, payment: null, preferenceId: '' });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, payment: null });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfileAndPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      
      if (!token) {
        window.location.href = "/portal/login";
        return;
      }

      // 1. Obtener socio actual
      let socioData = null;
      const socioRes = await fetch(`/api/members/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (socioRes.ok) {
        socioData = await socioRes.json();
        setSocio(socioData);

        // 2. Obtener sus pagos
        const paymentsRes = await fetch(`/api/finanzas/payments?socioId=${socioData.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (paymentsRes.ok) {
          setPayments(await paymentsRes.json());
        }

        // 3. Obtener medios de pago dinámicos
        const methodsRes = await fetch(`/api/finanzas/payment-methods`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (methodsRes.ok) {
          setPaymentMethods(await methodsRes.json());
        } else {
          setPaymentMethods([
            { id: 'MERCADOPAGO', name: 'Mercado Pago', description: 'Aboná tus cuotas de forma instantánea y segura. Los pagos se acreditan automáticamente en el acto.' },
            { id: 'TRANSFERENCIA', name: 'Transferencia Bancaria', description: 'Realizá una transferencia desde tu homebanking. Deberás presentar el comprobante en secretaría.' },
            { id: 'EFECTIVO', name: 'Pago en Administración (Efectivo)', description: 'Aboná en efectivo directamente en la secretaría del club en horario administrativo.' }
          ]);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('jn-auth-token');
        window.location.href = "/portal/login";
      }
    } catch (err) {
      console.error("Error al cargar cuotas y perfil:", err);
      showToast('Error al conectar con el backend de finanzas', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfileAndPayments();
  }, [fetchProfileAndPayments]);

  const handlePayOnline = async (payment) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      if (!token) {
        showToast('Inicia sesión para pagar.', 'error');
        setLoading(false);
        return;
      }

      // 1. Generar la preferencia de Mercado Pago en el backend
      const res = await fetch(`/api/finanzas/mercadopago/preference`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId: payment.id })
      });

      if (res.ok) {
        const data = await res.json();
        setCheckoutModal({
          isOpen: true,
          payment,
          preferenceId: data.preferenceId
        });
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'No se pudo generar la preferencia de pago online en el servidor.', 'error');
      }
    } catch {
      showToast('Error de conexión al procesador de pagos.', 'error');
    }
    setLoading(false);
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    try {
      // Llamar al webhook simulado en el backend
      const res = await fetch(`/api/finanzas/mercadopago/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferenceId: checkoutModal.preferenceId,
          paymentId: `MP-TRANS-${Math.floor(1000000 + Math.random() * 9000000)}`,
          status: 'approved'
        })
      });

      if (res.ok) {
        showToast('¡Pago Procesado Exitosamente por Mercado Pago!');
        setCheckoutModal({ isOpen: false, payment: null, preferenceId: '' });
        fetchProfileAndPayments();
      } else {
        showToast('Error en la simulación del webhook', 'error');
      }
    } catch {
      showToast('Error al simular pago', 'error');
    }
    setLoading(false);
  };

  const downloadInvoice = async (invoiceId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
      if (!token) {
        showToast('Inicia sesión para descargar el comprobante', 'error');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/finanzas/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al descargar el comprobante de pago.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recibo-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Comprobante descargado correctamente');
    } catch (err) {
      showToast(err.message || 'Error al descargar recibo', 'error');
    }
    setLoading(false);
  };

  // Calculations
  const pendingPayments = payments.filter(p => p.estado === 'PENDIENTE');
  const hasDebts = pendingPayments.length > 0;
  const totalDebt = pendingPayments.reduce((acc, p) => acc + parseFloat(p.importe), 0);

  return (
    <div className="space-y-6 text-jn-black">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2 shadow-2xl transition-all duration-300 text-white max-w-sm ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase">Mis Cuotas y Pagos</h2>
          <p className="text-gray-500 text-xs">Consulta tu estado de cuenta, descarga recibos y abona online.</p>
        </div>
        <button
          onClick={fetchProfileAndPayments}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {socio && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card: Account Status Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between h-44 md:col-span-1">
            <div>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Estado de Cuenta</span>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-3.5 h-3.5 rounded-full ${hasDebts ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                <h3 className={`text-lg font-black uppercase ${hasDebts ? 'text-jn-red' : 'text-green-600'}`}>
                  {hasDebts ? 'Pendiente de Pago' : 'Al Día / Sin Deudas'}
                </h3>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-xs font-bold text-gray-500">
              {hasDebts ? (
                <>
                  <span>Total Deuda:</span>
                  <span className="text-jn-red text-base font-black">${totalDebt.toFixed(2)}</span>
                </>
              ) : (
                <span>¡Gracias por mantenerte al día!</span>
              )}
            </div>
          </div>

          {/* Card: Proximo Vencimiento */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col justify-between h-44 md:col-span-1">
            <div>
              <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Próximo Vencimiento</span>
              <h3 className="text-lg font-black uppercase mt-2 text-gray-700 flex items-center gap-1.5">
                <Clock size={18} className="text-gray-400" />
                {hasDebts ? '10 de este Mes' : 'Sin Vencimientos'}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
              Las cuotas sociales vencen ordinariamente los días 10 de cada mes corriente.
            </p>
          </div>

          {/* Tarjetas Dinámicas de Métodos de Pago */}
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-gradient-to-br from-jn-red to-jn-darkred text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between h-44 md:col-span-1">
              <div>
                <span className="text-[9px] text-white/70 font-black uppercase tracking-wider block">
                  {method.id === 'MERCADOPAGO' ? 'Pago Online Oficial' : 'Pago Habilitado'}
                </span>
                <h3 className="text-lg font-black uppercase mt-1 flex items-center gap-1.5">
                  {method.id === 'MERCADOPAGO' && <Sparkles size={18} />}
                  {method.id === 'TRANSFERENCIA' && <RefreshCw size={18} />}
                  {method.id === 'EFECTIVO' && <Clock size={18} />}
                  {method.name}
                </h3>
              </div>
              <p className="text-[10px] text-white/80 font-semibold leading-relaxed">
                {method.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TABLE: HISTORIAL DE PAGOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <CreditCard size={16} /> Historial de Transacciones y Comprobantes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-bold text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Concepto / Plan</th>
                <th className="p-4">Fecha Emisión</th>
                <th className="p-4">Importe</th>
                <th className="p-4">Método</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400 text-xs py-8">No se encontraron facturas o registros de cuotas.</td>
                </tr>
              ) : payments.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-jn-black font-black">{p.plan?.nombre || 'Cuota Social General'}</td>
                  <td className="p-4 font-mono text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="p-4 text-jn-red font-mono">${parseFloat(p.importe).toFixed(2)}</td>
                  <td className="p-4 font-mono text-xs">{p.metodoPago || '-'}</td>
                  <td className="p-4">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                      p.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                      p.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-red-100 text-red-700'
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.estado === 'PENDIENTE' ? (
                      <button
                        onClick={() => handlePayOnline(p)}
                        className="bg-jn-black hover:bg-jn-red text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        Pagar Online
                      </button>
                    ) : (
                      <div className="flex gap-2 justify-end items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Pagado</span>
                        <button
                          onClick={() => setReceiptModal({ isOpen: true, payment: p })}
                          className="p-1.5 text-jn-red hover:bg-red-50 rounded border border-red-100 flex items-center justify-center bg-white cursor-pointer transition-all shadow-xs"
                          title="Ver / Descargar Comprobante PDF Oficial"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MERCADO PAGO SIMULATOR MODAL */}
      {checkoutModal.isOpen && checkoutModal.payment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 relative flex flex-col items-center gap-6 border">
            <button
              onClick={() => setCheckoutModal({ isOpen: false, payment: null, preferenceId: '' })}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X size={20} />
            </button>

            {/* MP Header */}
            <div className="text-center w-full">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                Simulador Mercado Pago Checkout
              </span>
              <h3 className="font-black text-lg uppercase mt-2.5">Portal de Pagos Oficial</h3>
              <p className="text-xs text-gray-400">Club Atlético Jorge Newbery</p>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 border p-4 rounded-2xl w-full space-y-3 font-semibold text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Concepto:</span>
                <span className="text-jn-black font-bold">{checkoutModal.payment.plan?.nombre || 'Cuota Social'}</span>
              </div>
              <div className="flex justify-between">
                <span>Preferencia ID:</span>
                <span className="font-mono text-[10px] truncate max-w-xs">{checkoutModal.preferenceId}</span>
              </div>
              <div className="flex justify-between border-t pt-2.5 items-end">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Total a Pagar:</span>
                <span className="text-xl font-black text-blue-600">${parseFloat(checkoutModal.payment.importe).toFixed(2)} ARS</span>
              </div>
            </div>

            {/* Sandbox Notice Alert */}
            <div className="bg-blue-50/50 border border-blue-150 p-3.5 rounded-xl text-blue-800 text-[10px] leading-relaxed font-bold flex gap-2">
              <ExternalLink size={18} className="shrink-0 mt-0.5 text-blue-500" />
              <div>
                <p className="uppercase font-black text-blue-700">Entorno Sandbox / Simulado</p>
                <p className="mt-0.5 text-blue-600 font-semibold">Esta integración está en modo de prueba. Haz clic a continuación para simular una transacción aprobada en Mercado Pago e impactar tu cuota en el acto.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleSimulatePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25"
              >
                {loading ? 'Procesando Pago...' : 'Simular Pago Exitoso'}
              </button>
              <button
                onClick={() => setCheckoutModal({ isOpen: false, payment: null, preferenceId: '' })}
                className="w-full bg-white hover:bg-gray-50 border text-jn-black font-black uppercase py-3 rounded-xl text-xs"
              >
                Cancelar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recibo Oficial Independiente en PDF */}
      <ReceiptPDF
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, payment: null })}
        receipt={receiptModal.payment}
      />
    </div>
  );
}
