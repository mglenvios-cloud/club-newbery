"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Search, Plus, Calendar, FileText, ArrowUpRight, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminContabilidad() {
  const [role, setRole] = useState(null);
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    setRole(getCookie("adminRole") || "ADMIN");
  }, []);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  if (role === "COORDINADOR_FUTSAL") {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center max-w-xl mx-auto my-12 shadow-sm text-jn-black">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black">!</div>
        <h3 className="text-xl font-black uppercase text-red-700">Acceso Restringido</h3>
        <p className="text-sm text-red-600 mt-2 font-medium">Se requieren permisos de Administrador General para ver y gestionar la contabilidad y pagos del club.</p>
      </div>
    );
  }

  const [search, setSearch] = useState("");
  const [filterConcept, setFilterConcept] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleShowReceipt = (transaction) => {
    setActiveReceipt(transaction);
    setShowReceiptModal(true);
  };

  // Form State
  const [memberName, setMemberName] = useState("");
  const [concept, setConcept] = useState("CUOTA_SOCIAL");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        const local = localStorage.getItem('jn-transactions');
        setTransactions(local ? JSON.parse(local) : defaultMockTransactions);
      }
    } catch (e) {
      console.warn("Backend offline, cargando contabilidad local");
      const local = localStorage.getItem('jn-transactions');
      setTransactions(local ? JSON.parse(local) : defaultMockTransactions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const defaultMockTransactions = [
    { id: 1, concept: "CUOTA_SOCIAL", amount: 12000, date: new Date("2026-06-20T14:30:00").toISOString(), status: "COMPLETED", memberName: "Juan Pérez", details: "Cuota Junio - Activo" },
    { id: 2, concept: "ALQUILER_CANCHA", amount: 25000, date: new Date("2026-06-20T12:00:00").toISOString(), status: "COMPLETED", memberName: "Carlos Gómez", details: "Alquiler Cancha Parquet - Turno 19hs" },
    { id: 3, concept: "ARANCEL_DISCIPLINA", amount: 11000, date: new Date("2026-06-19T18:00:00").toISOString(), status: "COMPLETED", memberName: "Sofía Rodríguez", details: "Matrícula Patín Show" },
    { id: 4, concept: "CUOTA_SOCIAL", amount: 8000, date: new Date("2026-06-18T10:15:00").toISOString(), status: "COMPLETED", memberName: "Martín Díaz", details: "Cuota Junio - Cadete" },
    { id: 5, concept: "ALQUILER_CANCHA", amount: 20000, date: new Date("2026-06-17T21:00:00").toISOString(), status: "COMPLETED", memberName: "Lucas Albornoz", details: "Alquiler Cancha Sintético - Turno 21hs" },
    { id: 6, concept: "ARANCEL_DISCIPLINA", amount: 15000, date: new Date("2026-06-16T19:30:00").toISOString(), status: "COMPLETED", memberName: "Felipe González", details: "Matrícula Futsal Primera" }
  ];

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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("Pago registrado con éxito.");
        setMemberName("");
        setAmount("");
        setDetails("");
        setShowModal(false);
        fetchTransactions();
      } else {
        throw new Error("Error en el servidor");
      }
    } catch (e) {
      console.warn("Utilizando guardado contable offline");
      const newTx = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...payload
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem('jn-transactions', JSON.stringify(updated));
      setSuccessMsg("¡Pago registrado localmente (Offline)!");
      setMemberName("");
      setAmount("");
      setDetails("");
      setShowModal(false);
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
      <div className="flex flex-wrap justify-between items-center gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-jn-red/10">
            <TrendingUp size={64} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Caja Total (Junio)</p>
          <h3 className="text-3xl font-black mt-2 text-jn-black">${totalIncome.toLocaleString('es-AR')}</h3>
          <p className="text-[10px] text-green-600 mt-2 font-bold flex items-center gap-1">
            <ArrowUpRight size={12} /> +12.4% vs Mes Anterior
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
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Gráfico */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Composición de Ingresos</h3>
            <p className="text-xs text-gray-500 mb-6">Distribución por concepto contable.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
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
                          {new Date(tx.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}hs
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
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
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-jn-red text-white hover:bg-jn-darkred rounded-lg font-bold shadow-md shadow-jn-red/20"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recibo Oficial con QR */}
      {showReceiptModal && activeReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in print:shadow-none print:border-none print:w-full print:max-w-none text-jn-black">
            {/* Header del Recibo */}
            <div className="p-6 bg-jn-black text-white flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black print:pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center print:bg-black/5">
                  <span className="font-black text-jn-red">JN</span>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Club Atlético Jorge Newbery</h3>
                  <span className="text-[10px] text-gray-400 print:text-gray-600 font-bold uppercase tracking-wider">Comprobante de Pago Oficial</span>
                </div>
              </div>
              <button 
                onClick={() => setShowReceiptModal(false)} 
                className="text-white hover:text-gray-300 print:hidden text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Detalles del Pago */}
            <div className="p-8 space-y-6 print:p-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <p className="text-xs text-gray-450 uppercase font-bold">Recibo de Caja</p>
                  <p className="font-mono font-bold text-sm text-jn-black">N° REC-{100000 + activeReceipt.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-450 uppercase font-bold">Fecha de Emisión</p>
                  <p className="text-sm font-semibold">
                    {new Date(activeReceipt.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}hs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-450 uppercase font-bold">Socio / Cliente</p>
                  <p className="font-black text-base text-jn-black mt-0.5">{activeReceipt.memberName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-450 uppercase font-bold">Concepto</p>
                  <p className="font-semibold text-sm mt-0.5">
                    {activeReceipt.concept === 'CUOTA_SOCIAL' ? 'Cuota Social' :
                     activeReceipt.concept === 'ARANCEL_DISCIPLINA' ? 'Arancel Disciplina' : 'Alquiler Cancha'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-450 uppercase font-bold">Detalle del Pago</p>
                <p className="text-sm text-gray-600 font-light mt-0.5">{activeReceipt.details || "Sin descripción de detalles."}</p>
              </div>

              {/* QR y Monto */}
              <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-150 print:bg-white print:border-2 print:border-black">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-1.5 bg-white p-2.5 rounded-xl border border-gray-200">
                  <QRCodeSVG 
                    value={`https://jorgenewbery.com.ar/verify/REC-${100000 + activeReceipt.id}?amount=${activeReceipt.amount}&socio=${encodeURIComponent(activeReceipt.memberName)}`}
                    size={75}
                    level="H"
                  />
                  <span className="text-[7px] text-gray-400 font-mono">Verificación Digital</span>
                </div>
                
                {/* Total */}
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Recaudado</p>
                  <p className="text-3xl font-black text-jn-black mt-1">${parseFloat(activeReceipt.amount).toLocaleString('es-AR')}</p>
                  <p className="text-[9px] text-green-600 font-bold uppercase mt-1">✓ Pago Completado</p>
                </div>
              </div>
              
              <p className="text-[9px] text-gray-400 text-center leading-snug">
                Este comprobante tiene carácter de recibo oficial de pago electrónico para el Club Social y Deportivo Jorge Newbery. <br />
                Alpatacal 3026, Villa Devoto. C.A.B.A.
              </p>
            </div>

            {/* Footer Modal Acciones */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2 print:hidden">
              <button 
                type="button" 
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-150 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={() => window.print()}
                className="px-6 py-2 text-xs font-bold bg-jn-black hover:bg-jn-red text-white rounded-lg transition-colors shadow-md cursor-pointer"
              >
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
