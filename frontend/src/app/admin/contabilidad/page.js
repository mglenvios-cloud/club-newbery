"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Search, Plus, Calendar, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import { QRCodeSVG } from 'qrcode.react';
import ReceiptPDF from '@/components/ReceiptPDF';

const fetch = apiFetch;

export default function AdminContabilidad() {
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return "ADMIN";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; adminRole=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return "ADMIN";
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterConcept, setFilterConcept] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Form State
  const [memberName, setMemberName] = useState("");
  const [concept, setConcept] = useState("CUOTA_SOCIAL");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = React.useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || "No se pudieron obtener las transacciones del servidor.");
      }
    } catch (e) {
      console.error("Error al cargar transacciones:", e);
      setErrorMsg("Error de conexión al cargar la contabilidad.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchTransactions();
    };
    load();
  }, [fetchTransactions]);

  if (role === "COORDINADOR_FUTSAL") {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center max-w-xl mx-auto my-12 shadow-sm text-jn-black">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">!</div>
        <h3 className="text-xl font-black uppercase text-red-700">Acceso Restringido</h3>
        <p className="text-sm text-red-600 mt-2 font-medium">Se requieren permisos de Administrador General para ver y gestionar la contabilidad y pagos del club.</p>
      </div>
    );
  }

  const handleShowReceipt = (transaction) => {
    setActiveReceipt(transaction);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = (receipt = activeReceipt) => {
    if (!receipt) return;
    const receiptId = receipt.numero || receipt.receiptNumber || receipt.id || 'REC-100001';
    window.open(`/receipt/${receiptId}`, '_blank');
  };



  const handlePostTransaction = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!memberName || !amount) {
      setErrorMsg("Completá todos los campos obligatorios.");
      return;
    }

    const payload = {
      concept,
      amount: parseFloat(amount),
      memberName,
      details,
      status: "COMPLETED"
    };

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        const newTransaction = await res.json().catch(() => ({}));
        setSuccessMsg("¡Pago registrado y guardado con éxito en el sistema!");
        setMemberName("");
        setAmount("");
        setDetails("");
        setShowModal(false);
        await fetchTransactions();

        // Si se recibió la nueva transacción creada, abrir su recibo automáticamente
        if (newTransaction && newTransaction.id) {
          setActiveReceipt(newTransaction);
          setShowReceiptModal(true);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo registrar la transacción en el servidor.");
      }
    } catch (e) {
      console.error("Error al registrar transacción:", e);
      setErrorMsg(e.message || "Error de red: No se pudo registrar la transacción.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculos contables
  const totalIncome = transactions.reduce((acc, tx) => acc + (tx.status === 'COMPLETED' ? tx.amount : 0), 0);
  const duesIncome = transactions.reduce((acc, tx) => acc + (tx.concept === 'CUOTA_SOCIAL' && tx.status === 'COMPLETED' ? tx.amount : 0), 0);
  const disciplineIncome = transactions.reduce((acc, tx) => acc + (tx.concept === 'ARANCEL_DISCIPLINA' && tx.status === 'COMPLETED' ? tx.amount : 0), 0);
  const courtIncome = transactions.reduce((acc, tx) => acc + (tx.concept === 'ALQUILER_CANCHA' && tx.status === 'COMPLETED' ? tx.amount : 0), 0);

  // Formato gráfico de barras
  const chartData = [
    { name: 'Cuotas', valor: duesIncome },
    { name: 'Disciplinas', valor: disciplineIncome },
    { name: 'Alquiler Canchas', valor: courtIncome }
  ];

  const COLORS = ['#D32F2F', '#111111', '#B71C1C'];

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.memberName.toLowerCase().includes(search.toLowerCase()) || 
                          (tx.details && tx.details.toLowerCase().includes(search.toLowerCase()));
    const matchesConcept = filterConcept === "ALL" || tx.concept === filterConcept;
    return matchesSearch && matchesConcept;
  });

  return (
    <div className="space-y-8 animate-fade-in text-jn-black">
      {/* Reglas de Estilo para Impresión en 1 Sola Página */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          /* Ocultar toda la interfaz del panel */
          body > *:not(#printable-receipt-modal-wrapper) {
            display: none !important;
          }
          .no-print, nav, header, sidebar, footer {
            display: none !important;
          }
          #printable-receipt-modal-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            z-index: 999999 !important;
          }
          #printable-receipt-card {
            box-shadow: none !important;
            border: 2px solid #111 !important;
            border-radius: 12px !important;
            max-width: 100% !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl font-bold text-sm flex justify-between items-center animate-fade-in no-print">
          <span>✓ {successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-green-600 hover:text-green-900 font-black">&times;</button>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Contabilidad y Movimientos</h2>
          <p className="text-sm text-gray-500">Monitoreá la recaudación general de cuotas, aranceles y alquileres.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-jn-red text-white px-5 py-2.5 rounded-xl font-bold hover:bg-jn-darkred transition-colors shadow-lg hover:shadow-jn-red/30 cursor-pointer text-sm"
        >
          <Plus size={18} /> Registrar Cobro Manual
        </button>
      </div>

      {/* Indicadores Contables */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-jn-red/10">
            <TrendingUp size={64} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Caja Total</p>
          <h3 className="text-3xl font-black mt-2 text-jn-black">${totalIncome.toLocaleString('es-AR')}</h3>
          <p className="text-[10px] text-green-600 mt-2 font-bold flex items-center gap-1">
            <ArrowUpRight size={12} /> Movimientos Registrados
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cuotas Sociales</p>
          <h3 className="text-3xl font-black mt-2 text-blue-600">${duesIncome.toLocaleString('es-AR')}</h3>
          <p className="text-[10px] text-gray-400 mt-2">Pagos de cuota ordinaria</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Disciplinas</p>
          <h3 className="text-3xl font-black mt-2 text-jn-red">${disciplineIncome.toLocaleString('es-AR')}</h3>
          <p className="text-[10px] text-gray-400 mt-2">Aranceles y matrículas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alquiler de Canchas</p>
          <h3 className="text-3xl font-black mt-2 text-jn-black">${courtIncome.toLocaleString('es-AR')}</h3>
          <p className="text-[10px] text-gray-400 mt-2">Reservas de turnos diarios</p>
        </div>
      </div>

      {/* Gráfico y Sección Historial */}
      <div className="grid lg:grid-cols-3 gap-8 no-print">
        
        {/* Gráfico */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Composición de Ingresos</h3>
            <p className="text-xs text-gray-500 mb-6">Distribución por concepto contable.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-bold" />
                <YAxis axisLine={false} tickLine={false} className="text-xs font-mono" />
                <RechartsTooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Ingreso']} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} barSize={35}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historial */}
        <div className="lg:col-span-2 space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por socio o detalle..." 
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-250 rounded-lg focus:outline-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setFilterConcept("ALL")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  filterConcept === 'ALL' ? 'bg-jn-black text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterConcept("CUOTA_SOCIAL")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  filterConcept === 'CUOTA_SOCIAL' ? 'bg-jn-black text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                Cuotas
              </button>
              <button 
                onClick={() => setFilterConcept("ARANCEL_DISCIPLINA")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  filterConcept === 'ARANCEL_DISCIPLINA' ? 'bg-jn-black text-white' : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                Disciplinas
              </button>
              <button 
                onClick={() => setFilterConcept("ALQUILER_CANCHA")}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                  filterConcept === 'ALQUILER_CANCHA' ? 'bg-jn-black text-white' : 'bg-gray-55 text-gray-550 border border-gray-200'
                }`}
              >
                Alquileres
              </button>
            </div>
          </div>

          {/* Tabla de movimientos */}
          <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-55 border-b border-gray-150">
                  <tr className="text-[11px] font-bold text-gray-500 uppercase">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Socio / Cliente</th>
                    <th className="p-4">Concepto</th>
                    <th className="p-4">Detalle</th>
                    <th className="p-4 text-right">Monto / Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400 font-bold">Cargando movimientos...</td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400 font-bold">No se encontraron movimientos registrados.</td>
                    </tr>
                  ) : (
                    filtered.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-4 text-xs font-mono text-gray-500">
                          {new Date(tx.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}, {String(new Date(tx.date).getHours()).padStart(2, '0')}:{String(new Date(tx.date).getMinutes()).padStart(2, '0')} hs
                        </td>
                        <td className="p-4 font-bold">{tx.memberName}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            tx.concept === 'CUOTA_SOCIAL' ? 'bg-blue-50 text-blue-600' :
                            tx.concept === 'ARANCEL_DISCIPLINA' ? 'bg-red-50 text-jn-red' :
                            'bg-gray-100 text-jn-black'
                          }`}>
                            {tx.concept === 'CUOTA_SOCIAL' ? 'Cuota' :
                             tx.concept === 'ARANCEL_DISCIPLINA' ? 'Disciplina' :
                             'Alquiler'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500">{tx.details || "Sin descripción"}</td>
                        <td className="p-4 text-right flex items-center justify-end gap-3 font-bold">
                          <span className="font-black text-jn-black">${parseFloat(tx.amount).toLocaleString('es-AR')}</span>
                          <button 
                            onClick={() => handleShowReceipt(tx)}
                            className="p-1.5 text-gray-400 hover:text-jn-red hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver Recibo de Pago"
                          >
                            <FileText size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Modal Cobro Manual */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-5 bg-gradient-to-r from-jn-black to-jn-red text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Registrar Cobro en Ventanilla</h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-300">
                &times;
              </button>
            </div>

            <form onSubmit={handlePostTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo del Socio</label>
                <input 
                  type="text" 
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  placeholder="Ej. Juan Pérez" 
                  className="w-full px-4 py-2 border border-gray-250 rounded-lg text-sm outline-none focus:ring-1 focus:ring-jn-red"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Concepto</label>
                  <select 
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-250 rounded-lg text-sm outline-none focus:ring-1 focus:ring-jn-red"
                  >
                    <option value="CUOTA_SOCIAL">Cuota Social</option>
                    <option value="ARANCEL_DISCIPLINA">Arancel Disciplina</option>
                    <option value="ALQUILER_CANCHA">Alquiler Cancha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto ($ ARS)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="12000" 
                    className="w-full px-4 py-2 border border-gray-250 rounded-lg text-sm outline-none focus:ring-1 focus:ring-jn-red"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalles / Nota Adicional</label>
                <textarea 
                  rows="2"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Ej. Pago efectivo Cuota Junio - Socio N°45892" 
                  className="w-full px-4 py-2 border border-gray-250 rounded-lg text-sm outline-none focus:ring-1 focus:ring-jn-red resize-none"
                ></textarea>
              </div>

              {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-jn-red text-white hover:bg-jn-darkred rounded-lg font-bold shadow-md shadow-jn-red/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Cobro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo Oficial Independiente en PDF */}
      <ReceiptPDF 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        receipt={activeReceipt} 
      />

    </div>
  );
}
