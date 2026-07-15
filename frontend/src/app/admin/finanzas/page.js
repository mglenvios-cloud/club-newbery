"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, CreditCard, AlertTriangle, Plus, Search, Filter,
  Calendar, Check, X, RefreshCw, Printer, Download, DollarSign,
  Users, Trash, Edit, AlertCircle, FileText
} from 'lucide-react';

import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function GestionFinanzas() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data States
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [socios, setSocios] = useState([]);

  // Forms
  const [planModal, setPlanModal] = useState({ isOpen: false, editId: null });
  const [paymentModal, setPaymentModal] = useState(false);

  const [planForm, setPlanForm] = useState({
    nombre: '', tipo: 'SOCIO', importe: '', periodicidad: 'MENSUAL', moneda: 'ARS', activo: true
  });

  const [paymentForm, setPaymentForm] = useState({
    socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PENDIENTE', fechaPago: ''
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`/api/finanzas/plans`);
      if (res.ok) setPlans(await res.json());
    } catch {}
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      let url = `/api/finanzas/payments`;
      const params = [];
      if (statusFilter !== 'ALL') params.push(`estado=${statusFilter}`);
      if (dateFilter) params.push(`fechaDesde=${dateFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (res.ok) setPayments(await res.json());
    } catch {}
  }, [statusFilter, dateFilter]);

  const fetchSocios = useCallback(async () => {
    try {
      const res = await fetch(`/api/socios`);
      if (res.ok) setSocios(await res.json());
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchPayments(), fetchSocios()]);
    setLoading(false);
  }, [fetchPlans, fetchPayments, fetchSocios]);

  useEffect(() => {
    fetchAll();
  }, [statusFilter, dateFilter]);

  // Operations
  const handleSavePlan = async (e) => {
    e.preventDefault();
    const method = planModal.editId ? 'PUT' : 'POST';
    const url = planModal.editId
      ? `/api/finanzas/plans/${planModal.editId}`
      : `/api/finanzas/plans`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planForm)
      });
      if (res.ok) {
        showToast(planModal.editId ? 'Plan actualizado correctamente' : 'Plan de cuotas creado con éxito');
        setPlanModal({ isOpen: false, editId: null });
        fetchPlans();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al guardar plan', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('¿Seguro que desea desactivar este plan de cuotas?')) return;
    try {
      const res = await fetch(`/api/finanzas/plans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Plan desactivado (Baja lógica)');
        fetchPlans();
      }
    } catch {}
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/finanzas/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      if (res.ok) {
        showToast('Cobro registrado correctamente');
        setPaymentModal(false);
        fetchPayments();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al registrar cobro', 'error');
      }
    } catch {}
  };

  const handleUpdatePaymentStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/finanzas/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        showToast(`Pago marcado como ${newStatus}`);
        fetchPayments();
      }
    } catch {}
  };

  // Calculations for Financial Dashboard
  const ingresosMes = payments
    .filter(p => p.estado === 'PAGADO')
    .reduce((acc, p) => acc + parseFloat(p.importe), 0);

  const totalCobradoCount = payments.filter(p => p.estado === 'PAGADO').length;
  const totalPendienteCount = payments.filter(p => p.estado === 'PENDIENTE').length;
  
  const totalPendienteImporte = payments
    .filter(p => p.estado === 'PENDIENTE')
    .reduce((acc, p) => acc + parseFloat(p.importe), 0);

  const morosos = payments.filter(p => p.estado === 'PENDIENTE');

  // Filtered payments list
  const filteredPayments = payments.filter(p => {
    if (!searchQuery) return true;
    const name = `${p.socio?.firstName} ${p.socio?.lastName}`.toLowerCase();
    const dni = p.socio?.dni || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || dni.includes(query);
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-jn-black">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2 shadow-2xl transition-all duration-300 text-white max-w-sm ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-jn-red uppercase tracking-widest bg-red-100 px-3 py-1.5 rounded-full border border-jn-red/20">Módulo Finanzas</span>
          <h1 className="text-3xl font-black uppercase mt-2">💳 Administración Financiera</h1>
          <p className="text-gray-500 text-sm">Control e historial de pagos de cuotas sociales, matrículas deportivas y reportes de morosidad.</p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs uppercase self-start shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'planes', label: '📋 Planes' },
          { id: 'pagos', label: '💰 Pagos' },
          { id: 'morosidad', label: '⚠️ Morosidad' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-jn-red text-jn-red font-black'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW PANEL */}
      <div>
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><DollarSign size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ingresos del Mes</p>
                  <h4 className="text-2xl font-black text-green-600">${ingresosMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-jn-red rounded-xl flex items-center justify-center"><AlertTriangle size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monto Pendiente</p>
                  <h4 className="text-2xl font-black text-jn-red">${totalPendienteImporte.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Check size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cuotas Cobradas</p>
                  <h4 className="text-2xl font-black text-blue-600">{totalCobradoCount}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Socios Morosos</p>
                  <h4 className="text-2xl font-black text-amber-600">{morosos.length}</h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recientes */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-2 space-y-4">
                <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <TrendingUp size={16} className="text-jn-red" /> Últimas Transacciones Registradas
                </h3>
                <div className="divide-y divide-gray-100 overflow-x-auto">
                  <table className="w-full text-left text-xs font-bold text-gray-600">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b text-[10px]">
                        <th className="p-3">Socio</th>
                        <th className="p-3">Plan / Detalle</th>
                        <th className="p-3">Monto</th>
                        <th className="p-3">Metodo</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {payments.slice(0, 5).map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="p-3 text-jn-black">{p.socio?.firstName} {p.socio?.lastName}</td>
                          <td className="p-3">{p.plan?.nombre || 'Cuota Social General'}</td>
                          <td className="p-3 text-jn-black">${parseFloat(p.importe).toFixed(2)}</td>
                          <td className="p-3 font-mono">{p.metodoPago}</td>
                          <td className="p-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                              p.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                              p.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                          'bg-red-100 text-red-700'
                            }`}>{p.estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm lg:col-span-1 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4">
                    ⚡ Gestión Administrativa
                  </h3>
                  <p className="text-xs text-gray-500 mb-6 font-semibold">Usa las siguientes acciones rápidas para la generación de cuotas mensuales o el registro de ingresos directos en secretaría.</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setPaymentForm({ socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PAGADO', fechaPago: new Date().toISOString().split('T')[0] });
                      setPaymentModal(true);
                    }}
                    className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-jn-red/15"
                  >
                    <DollarSign size={16} /> Registrar Cobro Directo
                  </button>
                  <button
                    onClick={() => {
                      setPlanForm({ nombre: '', tipo: 'SOCIO', importe: '', periodicidad: 'MENSUAL', moneda: 'ARS', activo: true });
                      setPlanModal({ isOpen: true, editId: null });
                    }}
                    className="w-full bg-white hover:bg-gray-50 border text-jn-black font-black uppercase py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Nuevo Plan de Cuota
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLANES */}
        {activeTab === 'planes' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setPlanForm({ nombre: '', tipo: 'SOCIO', importe: '', periodicidad: 'MENSUAL', moneda: 'ARS', activo: true });
                  setPlanModal({ isOpen: true, editId: null });
                }}
                className="bg-jn-red hover:bg-red-700 text-white font-black uppercase text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
              >
                <Plus size={16} /> Crear Plan de Cuota
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.length === 0 ? (
                <p className="text-gray-400 text-xs col-span-3 text-center py-8">Sin planes registrados.</p>
              ) : plans.map(p => (
                <div key={p.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-red-150 text-jn-red px-2 py-0.5 rounded font-black uppercase">{p.tipo}</span>
                      <h4 className="font-black text-base mt-1 leading-tight">{p.nombre}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{p.periodicidad}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPlanForm(p);
                          setPlanModal({ isOpen: true, editId: p.id });
                        }}
                        className="text-gray-500 hover:text-black"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] text-gray-400 block font-bold uppercase">Importe</span>
                      <span className="text-xl font-black text-jn-red">${parseFloat(p.importe).toFixed(2)} <span className="text-xs text-gray-400 font-bold font-mono">{p.moneda}</span></span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PAGOS */}
        {activeTab === 'pagos' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar pagos por Socio o DNI..."
                  className="w-full text-xs font-semibold focus:outline-none bg-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="ALL">TODOS LOS ESTADOS</option>
                  <option value="PENDIENTE">PENDIENTES</option>
                  <option value="PAGADO">PAGADOS</option>
                  <option value="RECHAZADO">RECHAZADOS</option>
                  <option value="CANCELADO">CANCELADOS</option>
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-xs font-bold"
                />
                <button
                  onClick={() => {
                    setPaymentForm({ socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PENDIENTE', fechaPago: '' });
                    setPaymentModal(true);
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white font-black uppercase text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus size={16} /> Registrar Pago
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs font-black text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Socio</th>
                    <th className="p-4">Plan / Concepto</th>
                    <th className="p-4">Importe</th>
                    <th className="p-4">Fecha Reg.</th>
                    <th className="p-4">Método / Ref.</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-400 text-xs py-8">No se encontraron cobros registrados.</td>
                    </tr>
                  ) : filteredPayments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <p>{p.socio?.firstName} {p.socio?.lastName}</p>
                        <span className="text-[10px] text-gray-400 font-mono">DNI: {p.socio?.dni}</span>
                      </td>
                      <td className="p-4">
                        <p>{p.plan?.nombre || 'Cuota Social Directa'}</p>
                        <span className="text-[10px] text-gray-400 uppercase">{p.plan?.tipo || 'CUOTA'}</span>
                      </td>
                      <td className="p-4 text-jn-red font-mono">${parseFloat(p.importe).toFixed(2)}</td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>
                      <td className="p-4">
                        <p className="text-xs">{p.metodoPago}</p>
                        {p.referenciaPago && <span className="text-[9px] text-gray-400 font-mono font-bold truncate block max-w-xs">{p.referenciaPago}</span>}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                          p.estado === 'PAGADO' ? 'bg-green-100 text-green-700' :
                          p.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                      'bg-red-100 text-red-700'
                        }`}>{p.estado}</span>
                      </td>
                      <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-2 justify-end">
                          {p.estado === 'PENDIENTE' && (
                            <button
                              onClick={() => handleUpdatePaymentStatus(p.id, 'PAGADO')}
                              className="text-[9px] bg-green-600 hover:bg-green-700 text-white font-black uppercase px-2 py-1 rounded shadow-sm"
                            >
                              Marcar Pagado
                            </button>
                          )}
                          {p.invoices?.length > 0 && (
                            <a
                              href={`/api/finanzas/invoices/${p.invoices[0].id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 border hover:bg-gray-50 rounded bg-white text-gray-500 flex items-center justify-center"
                              title="Ver Comprobante"
                            >
                              <FileText size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MOROSIDAD */}
        {activeTab === 'morosidad' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-xs font-bold leading-relaxed items-start">
              <AlertCircle className="shrink-0 mt-0.5" />
              <div>
                <p className="uppercase font-black">Listado de Socios Morosos</p>
                <p className="text-amber-700 font-semibold mt-1">Este listado agrupa a todos los socios con cuotas sociales registradas como "PENDIENTE". Utilice esta sección para enviar recordatorios de pago.</p>
              </div>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b text-xs font-black text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Socio</th>
                    <th className="p-4">Cuota Impaga</th>
                    <th className="p-4">Importe</th>
                    <th className="p-4">Fecha de Vencimiento Estimada</th>
                    <th className="p-4 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold">
                  {morosos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-400 text-xs py-8">No hay socios registrados en estado de morosidad.</td>
                    </tr>
                  ) : morosos.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <p>{m.socio?.firstName} {m.socio?.lastName}</p>
                        <span className="text-[10px] text-gray-400 font-mono">DNI: {m.socio?.dni}</span>
                      </td>
                      <td className="p-4">{m.plan?.nombre || 'Cuota Social General'}</td>
                      <td className="p-4 text-jn-red font-mono">${parseFloat(m.importe).toFixed(2)}</td>
                      <td className="p-4 text-xs text-gray-500 font-mono">
                        {/* Fecha Estimada (10 días después de la creación) */}
                        {new Date(new Date(m.createdAt).setDate(new Date(m.createdAt).getDate() + 10)).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end text-[10px] font-black uppercase text-gray-500">
                          <span>{m.socio?.phone || 'Sin tel.'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: PLANES FORM */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{planModal.editId ? 'Editar Plan' : 'Crear Plan de Cuota'}</h3>
              <button onClick={() => setPlanModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre del Plan *</label>
                <input
                  type="text" required
                  value={planForm.nombre}
                  onChange={e => setPlanForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Tipo</label>
                  <select
                    value={planForm.tipo}
                    onChange={e => setPlanForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="SOCIO">SOCIO</option>
                    <option value="DEPORTIVO">DEPORTIVO</option>
                    <option value="FAMILIAR">FAMILIAR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Periodicidad</label>
                  <select
                    value={planForm.periodicidad}
                    onChange={e => setPlanForm(prev => ({ ...prev, periodicidad: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="MENSUAL">MENSUAL</option>
                    <option value="ANUAL">ANUAL</option>
                    <option value="UNICO">UNICO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Importe *</label>
                  <input
                    type="number" step="0.01" required
                    value={planForm.importe}
                    onChange={e => setPlanForm(prev => ({ ...prev, importe: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Moneda</label>
                  <input
                    type="text" readOnly
                    value={planForm.moneda}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-150 font-mono text-center"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Plan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR COBRO FORM */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">Registrar Cobro Directo</h3>
              <button onClick={() => setPaymentModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Socio *</label>
                <select
                  required
                  value={paymentForm.socioId}
                  onChange={e => setPaymentForm(prev => ({ ...prev, socioId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                >
                  <option value="">Seleccione Socio...</option>
                  {socios.map(s => <option key={s.id} value={s.id}>{s.apellido}, {s.nombre || s.firstName} (DNI: {s.dni})</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block">Concepto / Plan *</label>
                <select
                  required
                  value={paymentForm.planId}
                  onChange={e => {
                    const planSelected = plans.find(p => p.id === parseInt(e.target.value));
                    setPaymentForm(prev => ({
                      ...prev,
                      planId: e.target.value,
                      importe: planSelected ? parseFloat(planSelected.importe).toString() : ''
                    }));
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                >
                  <option value="">Seleccione Plan...</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.nombre} (${parseFloat(p.importe).toFixed(2)})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Importe *</label>
                  <input
                    type="number" step="0.01" required
                    value={paymentForm.importe}
                    onChange={e => setPaymentForm(prev => ({ ...prev, importe: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Método de Pago</label>
                  <select
                    value={paymentForm.metodoPago}
                    onChange={e => setPaymentForm(prev => ({ ...prev, metodoPago: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    <option value="TARJETA">TARJETA</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Cobro
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
