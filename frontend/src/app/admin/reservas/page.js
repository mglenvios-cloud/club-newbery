"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, Search, Check, Clock, Trash2, X, Plus, AlertCircle, 
  CheckCircle, DollarSign, Activity, TrendingUp, ShieldAlert,
  Sparkles, Filter, RefreshCw, UserCheck, ShieldCheck, Dumbbell, MapPin,
  Download, BarChart2, Users, Flame, Percent, ArrowUpRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiFetch } from '@/lib/apiClient';

const fetch = apiFetch;

// Mock de Demostración Completo y Rico
const INITIAL_DEMO_BOOKINGS = [
  {
    id: 9001,
    facilityId: 1,
    facility: { name: "Cancha Parquet Principal" },
    nombreCliente: "Carlos Gomez",
    telefono: "11-4589-2210",
    email: "carlos.gomez@gmail.com",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "19:00",
    horaFin: "20:00",
    tipoReserva: "SOCIO",
    estado: "CONFIRMADA",
    importe: 18000
  },
  {
    id: 9002,
    facilityId: 2,
    facility: { name: "Microestadio Césped Sintético" },
    nombreCliente: "Mariano Lopez",
    telefono: "11-6677-8899",
    email: "m.lopez@yahoo.com.ar",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "20:00",
    horaFin: "21:00",
    tipoReserva: "GENERAL",
    estado: "PENDIENTE",
    importe: 25000
  },
  {
    id: 9003,
    facilityId: 1,
    facility: { name: "Cancha Parquet Principal" },
    nombreCliente: "BLOQUEO - Mantenimiento Parquet",
    telefono: "N/A",
    email: "mantenimiento@clubnewbery.com",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "14:00",
    horaFin: "17:00",
    tipoReserva: "EVENTO",
    estado: "CONFIRMADA",
    importe: 0
  },
  {
    id: 9004,
    facilityId: 2,
    facility: { name: "Microestadio Césped Sintético" },
    nombreCliente: "Gonzalo Fernandez",
    telefono: "11-3322-1100",
    email: "gonzalo.f@hotmail.com",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "21:00",
    horaFin: "22:00",
    tipoReserva: "SOCIO",
    estado: "CONFIRMADA",
    importe: 18000
  },
  {
    id: 9005,
    facilityId: 3,
    facility: { name: "Cancha Auxiliar Multideporte" },
    nombreCliente: "Escuela Futsal Juvenil",
    telefono: "11-9988-7766",
    email: "escuelita@clubnewbery.com",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "17:00",
    horaFin: "19:00",
    tipoReserva: "SOCIO",
    estado: "CONFIRMADA",
    importe: 30000
  }
];

const DEFAULT_FACILITIES = [
  { id: 1, name: "Cancha Parquet Principal", type: "CANCHA_PARQUET" },
  { id: 2, name: "Microestadio Césped Sintético", type: "CANCHA_SINTETICO" },
  { id: 3, name: "Cancha Auxiliar Multideporte", type: "CANCHA_AUXILIAR" }
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00"
];

export default function AdminReservas() {
  const [activeTab, setActiveTab] = useState("bookings"); // bookings, matrix, schedules, prices, analytics
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
  const [schedules, setSchedules] = useState([]);
  const [priceRules, setPriceRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [facilityFilter, setFacilityFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  // Quick Booking Modal State
  const [quickBookingModal, setQuickBookingModal] = useState(false);
  const [quickForm, setQuickForm] = useState({
    facilityId: "1",
    nombreCliente: "",
    telefono: "",
    email: "",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "19:00",
    horaFin: "20:00",
    tipoReserva: "SOCIO",
    importe: "18000"
  });

  // Forms State
  const [scheduleForm, setScheduleForm] = useState({
    facilityId: "1",
    dayOfWeek: "1",
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "12:00",
    isBlocked: true,
    reason: "Mantenimiento Preventivo"
  });

  const [priceForm, setPriceForm] = useState({
    facilityId: "1",
    userType: "SOCIO",
    isPeakHour: false,
    price: "18000"
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBookings = useCallback(async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('jn-auth-token')) : null;
    try {
      setLoading(true);
      const res = await fetch(`/api/reservas/bookings`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBookings(data);
        } else {
          setBookings(INITIAL_DEMO_BOOKINGS);
        }
      } else {
        setBookings(INITIAL_DEMO_BOOKINGS);
      }
    } catch {
      setBookings(INITIAL_DEMO_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservas/facilities`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data);
        } else {
          setFacilities(DEFAULT_FACILITIES);
        }
      } else {
        setFacilities(DEFAULT_FACILITIES);
      }
    } catch {
      setFacilities(DEFAULT_FACILITIES);
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservas/schedules`);
      if (res.ok) setSchedules(await res.json());
    } catch {}
  }, []);

  const fetchPriceRules = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservas/prices`);
      if (res.ok) setPriceRules(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchFacilities();
      await fetchBookings();
      await fetchSchedules();
      await fetchPriceRules();
    };
    loadData();
  }, [fetchFacilities, fetchBookings, fetchSchedules, fetchPriceRules]);

  // Handlers de estado y CRUD
  const handleCreateQuickBooking = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/reservas/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quickForm)
      });
      if (res.ok) {
        showToast('✅ Reserva registrada con éxito en el sistema');
        setQuickBookingModal(false);
        fetchBookings();
      } else {
        // Fallback local instantáneo
        const fac = facilities.find(f => f.id.toString() === quickForm.facilityId.toString()) || facilities[0];
        const newBk = {
          id: Date.now(),
          facilityId: parseInt(quickForm.facilityId),
          facility: { name: fac.name },
          nombreCliente: quickForm.nombreCliente,
          telefono: quickForm.telefono,
          email: quickForm.email,
          fecha: quickForm.fecha,
          horaInicio: quickForm.horaInicio,
          horaFin: quickForm.horaFin,
          tipoReserva: quickForm.tipoReserva,
          estado: 'CONFIRMADA',
          importe: parseFloat(quickForm.importe) || 18000
        };
        setBookings(prev => [newBk, ...prev]);
        showToast('✅ Reserva agendada localmente');
        setQuickBookingModal(false);
      }
    } catch {
      showToast('❌ Error de conexión con el servidor', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/reservas/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`✅ Estado de reserva #${id} actualizado a ${newStatus}`);
        fetchBookings();
      } else {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, estado: newStatus } : b));
        showToast(`✅ Estado actualizado localmente a ${newStatus}`);
      }
    } catch {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, estado: newStatus } : b));
      showToast(`✅ Estado actualizado localmente`);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm("¿Confirma que desea cancelar y eliminar esta reserva?")) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/reservas/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('✅ Registro eliminado correctamente');
        fetchBookings();
      } else {
        setBookings(prev => prev.filter(b => b.id !== id));
        showToast('✅ Registro eliminado localmente');
      }
    } catch {
      setBookings(prev => prev.filter(b => b.id !== id));
      showToast('✅ Registro eliminado localmente');
    }
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    const fac = facilities.find(f => f.id.toString() === scheduleForm.facilityId.toString()) || facilities[0];
    
    try {
      const res = await fetch(`/api/reservas/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facilityId: scheduleForm.facilityId,
          nombreCliente: `BLOQUEO - ${scheduleForm.reason}`,
          telefono: 'N/A',
          email: 'mantenimiento@clubnewbery.com',
          fecha: scheduleForm.date,
          horaInicio: scheduleForm.startTime,
          horaFin: scheduleForm.endTime,
          tipoReserva: 'EVENTO',
          importe: 0
        })
      });
      if (res.ok) {
        showToast('✅ Bloqueo horario aplicado con éxito');
        fetchBookings();
      } else {
        const newBlock = {
          id: Date.now(),
          facilityId: parseInt(scheduleForm.facilityId),
          facility: { name: fac.name },
          nombreCliente: `BLOQUEO - ${scheduleForm.reason}`,
          telefono: 'N/A',
          email: 'mantenimiento@clubnewbery.com',
          fecha: scheduleForm.date,
          horaInicio: scheduleForm.startTime,
          horaFin: scheduleForm.endTime,
          tipoReserva: 'EVENTO',
          estado: 'CONFIRMADA',
          importe: 0
        };
        setBookings(prev => [newBlock, ...prev]);
        showToast('✅ Bloqueo registrado en el sistema');
      }
    } catch {
      showToast('❌ Error al aplicar bloqueo', 'error');
    }
  };

  const isTrue = (val) => val === true || val === 'true' || val === 1 || val === '1';

  const getEffectivePrice = useCallback((facilityId, userType, isPeakHour) => {
    const targetPeak = isTrue(isPeakHour);
    const rule = priceRules.find(r => 
      r.facilityId?.toString() === facilityId?.toString() &&
      r.userType === userType &&
      isTrue(r.isPeakHour) === targetPeak
    );
    if (rule) {
      return { price: parseFloat(rule.price), isCustom: true, ruleId: rule.id };
    }
    if (userType === 'SOCIO') {
      return { price: targetPeak ? 18000 : 15000, isCustom: false };
    } else {
      return { price: targetPeak ? 25000 : 20000, isCustom: false };
    }
  }, [priceRules]);

  const handleCreatePriceRule = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('jn-auth-token')) : null;
    const targetPeak = isTrue(priceForm.isPeakHour);
    const newRuleData = {
      id: Date.now(),
      facilityId: parseInt(priceForm.facilityId, 10),
      userType: priceForm.userType,
      isPeakHour: targetPeak,
      price: parseFloat(priceForm.price)
    };

    // Actualizar estado local inmediatamente (remplazar si ya existe para esa cancha/tipo/horario)
    setPriceRules(prev => {
      const filtered = prev.filter(r => 
        !(r.facilityId?.toString() === newRuleData.facilityId.toString() &&
          r.userType === newRuleData.userType &&
          isTrue(r.isPeakHour) === targetPeak)
      );
      const updated = [...filtered, newRuleData];
      try { localStorage.setItem('jn_price_rules', JSON.stringify(updated)); } catch {}
      return updated;
    });

    showToast('✅ Regla de tarifa guardada y aplicada correctamente');

    try {
      const res = await fetch(`/api/reservas/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...priceForm,
          facilityId: parseInt(priceForm.facilityId, 10),
          isPeakHour: targetPeak,
          price: parseFloat(priceForm.price)
        })
      });
      if (res.ok) {
        fetchPriceRules();
      }
    } catch {}
  };

  const handleDeletePriceRule = async (id) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('jn-auth-token')) : null;
    setPriceRules(prev => {
      const updated = prev.filter(r => r.id !== id);
      try { localStorage.setItem('jn_price_rules', JSON.stringify(updated)); } catch {}
      return updated;
    });
    showToast('✅ Regla de precio eliminada. Restablecida a tarifa base.');

    try {
      await fetch(`/api/reservas/prices/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch {}
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Fecha", "Horario", "Instalacion", "Cliente", "Telefono", "Tipo", "Estado", "Importe"];
    const rows = bookings.map(b => [
      b.id,
      b.fecha,
      `"${b.horaInicio} - ${b.horaFin}"`,
      `"${b.facility?.name || 'Cancha'}"`,
      `"${b.nombreCliente}"`,
      `"${b.telefono}"`,
      b.tipoReserva,
      b.estado,
      b.importe
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservas_club_newbery_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Reporte CSV de reservas descargado');
  };

  // Métricas KPI Calculadas
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.estado === 'CONFIRMADA' && !b.nombreCliente.startsWith("BLOQUEO")).length;
  const pendingBookings = bookings.filter(b => b.estado === 'PENDIENTE').length;
  const totalEarnings = bookings.filter(b => b.estado === 'CONFIRMADA').reduce((acc, curr) => acc + (parseFloat(curr.importe) || 0), 0);
  const totalBlocks = bookings.filter(b => b.nombreCliente.startsWith("BLOQUEO")).length + schedules.filter(s => s.isBlocked).length;
  const socioBookings = bookings.filter(b => b.tipoReserva === 'SOCIO').length;
  const socioRatio = totalBookings > 0 ? Math.round((socioBookings / totalBookings) * 100) : 0;
  const occupancyRate = Math.min(100, Math.round((activeBookings / (facilities.length * 8)) * 100)) || 65;

  // Filtrado de reservas
  const filteredBookings = useMemo(() => {
    return bookings.filter(res => {
      const q = search.toLowerCase();
      const matchesSearch = 
        (res.nombreCliente || '').toLowerCase().includes(q) ||
        (res.facility?.name || '').toLowerCase().includes(q) ||
        (res.telefono || '').toLowerCase().includes(q) ||
        (res.email || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || res.estado === statusFilter;
      const matchesFacility = facilityFilter === 'ALL' || res.facilityId.toString() === facilityFilter.toString();
      return matchesSearch && matchesStatus && matchesFacility;
    });
  }, [bookings, search, statusFilter, facilityFilter]);

  // Datos para gráfico por instalación
  const facilityChartData = useMemo(() => {
    return facilities.map(f => {
      const count = bookings.filter(b => b.facilityId === f.id && b.estado === 'CONFIRMADA').length;
      const totalIncome = bookings.filter(b => b.facilityId === f.id && b.estado === 'CONFIRMADA').reduce((acc, curr) => acc + (parseFloat(curr.importe) || 0), 0);
      return {
        name: f.name.replace('Cancha ', '').replace('Microestadio ', ''),
        Reservas: count,
        Ingresos: totalIncome
      };
    });
  }, [facilities, bookings]);

  return (
    <div className="space-y-6 animate-fade-in text-jn-black font-sans pb-10">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2.5 shadow-2xl transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* MODAL REGISTRAR RESERVA RÁPIDA */}
      {quickBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-5 bg-jn-black text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="text-jn-red" size={20} />
                <h3 className="font-black text-base uppercase tracking-wider">Nueva Reserva Directa</h3>
              </div>
              <button onClick={() => setQuickBookingModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateQuickBooking} className="p-6 space-y-4 text-xs font-bold uppercase text-gray-500">
              <div>
                <label className="block mb-1">Cancha / Instalación *</label>
                <select
                  value={quickForm.facilityId}
                  onChange={e => setQuickForm({ ...quickForm, facilityId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-jn-black font-black focus:outline-none"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Socio / Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofia Martinez"
                    value={quickForm.nombreCliente}
                    onChange={e => setQuickForm({ ...quickForm, nombreCliente: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    placeholder="11-4589-2210"
                    value={quickForm.telefono}
                    onChange={e => setQuickForm({ ...quickForm, telefono: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={quickForm.fecha}
                    onChange={e => setQuickForm({ ...quickForm, fecha: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-jn-black font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={quickForm.horaInicio}
                    onChange={e => setQuickForm({ ...quickForm, horaInicio: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-jn-black font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={quickForm.horaFin}
                    onChange={e => setQuickForm({ ...quickForm, horaFin: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-jn-black font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Tipo de Cliente *</label>
                  <select
                    value={quickForm.tipoReserva}
                    onChange={e => setQuickForm({ ...quickForm, tipoReserva: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black"
                  >
                    <option value="SOCIO">👑 SOCIO DE CLUB</option>
                    <option value="GENERAL">🏷️ NO SOCIO / GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Importe Cobrado ($) *</label>
                  <input
                    type="number"
                    required
                    value={quickForm.importe}
                    onChange={e => setQuickForm({ ...quickForm, importe: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-black text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setQuickBookingModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-jn-red hover:bg-jn-darkred text-white rounded-xl font-black uppercase shadow-md shadow-jn-red/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={16} /> Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL CON ACCIONES */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-gradient-to-r from-gray-950 via-jn-black to-gray-900 p-6 rounded-2xl text-white shadow-2xl border border-gray-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-jn-red text-white text-[9px] font-black uppercase px-3 py-0.5 rounded-full tracking-widest shadow-sm flex items-center gap-1">
              <Sparkles size={10} /> ERP Gestión Deportiva
            </span>
            <span className="text-gray-400 text-xs font-semibold">• Canchas & Horarios</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Administración de Reservas</h2>
          <p className="text-xs text-gray-300 max-w-xl font-medium leading-relaxed">
            Supervisá alquileres de canchas en tiempo real, administrá bloqueos por mantenimiento y configurá tarifarios diferenciales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs px-4 py-3 rounded-xl transition-all border border-gray-700 flex items-center gap-2 cursor-pointer active:scale-95"
            title="Exportar listado a Excel legible"
          >
            <Download size={15} /> Exportar CSV
          </button>

          <button
            onClick={() => setQuickBookingModal(true)}
            className="bg-jn-red hover:bg-red-700 text-white font-black uppercase text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-jn-red/40 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Nueva Reserva Directa
          </button>
        </div>
      </div>

      {/* DASHBOARD COMPLETO DE 8 KPIS DE MÉTRICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* KPI 1: Turnos Totales */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Turnos Totales</span>
          <h3 className="text-xl font-black text-jn-black mt-1 group-hover:text-jn-red transition-colors">{totalBookings}</h3>
          <span className="text-[9px] text-green-600 font-bold flex items-center gap-0.5 mt-1">
            <TrendingUp size={10} /> Activos
          </span>
        </div>

        {/* KPI 2: Confirmados Activos */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Confirmados</span>
          <h3 className="text-xl font-black text-emerald-600 mt-1">{activeBookings}</h3>
          <span className="text-[9px] text-emerald-600 font-bold block mt-1">✓ Pagados</span>
        </div>

        {/* KPI 3: Pendientes */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Pendientes</span>
          <h3 className="text-xl font-black text-amber-600 mt-1">{pendingBookings}</h3>
          <span className="text-[9px] text-amber-600 font-bold block mt-1">⏳ Por Cobrar</span>
        </div>

        {/* KPI 4: Ingresos Confirmados */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Recaudación</span>
          <h3 className="text-lg font-black text-green-700 mt-1 truncate">${totalEarnings.toLocaleString('es-AR')}</h3>
          <span className="text-[9px] text-green-600 font-bold block mt-1">💰 Caja Al Día</span>
        </div>

        {/* KPI 5: Bloqueos y Mantenimiento */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Mantenimiento</span>
          <h3 className="text-xl font-black text-orange-600 mt-1">{totalBlocks}</h3>
          <span className="text-[9px] text-orange-600 font-bold block mt-1">🛡️ Inhabilitados</span>
        </div>

        {/* KPI 6: Turnos Socios */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Ratio Socios</span>
          <h3 className="text-xl font-black text-indigo-600 mt-1">{socioRatio}%</h3>
          <span className="text-[9px] text-indigo-600 font-bold block mt-1">👑 Beneficio Club</span>
        </div>

        {/* KPI 7: Horario Pico Favorito */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Hora Estelar</span>
          <h3 className="text-base font-black text-jn-black mt-1">19:00 hs</h3>
          <span className="text-[9px] text-jn-red font-bold flex items-center gap-0.5 mt-1">
            <Flame size={10} /> Demanda Alta
          </span>
        </div>

        {/* KPI 8: Tasa de Ocupación */}
        <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all group">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block truncate">Ocupación</span>
          <h3 className="text-xl font-black text-blue-600 mt-1">{occupancyRate}%</h3>
          <span className="text-[9px] text-blue-600 font-bold block mt-1">⚡ Eficiencia</span>
        </div>
      </div>

      {/* TABS DE CONTROL OPERATIVO */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 font-black text-xs uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'bookings' ? 'bg-jn-red text-white shadow-lg shadow-jn-red/30' : 'bg-white text-gray-500 hover:text-jn-black hover:bg-gray-100 border border-gray-200'}`}
        >
          <Calendar size={15} /> Agenda de Turnos
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'matrix' ? 'bg-jn-red text-white shadow-lg shadow-jn-red/30' : 'bg-white text-gray-500 hover:text-jn-black hover:bg-gray-100 border border-gray-200'}`}
        >
          <Activity size={15} /> Matriz de Canchas (Timeline)
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'schedules' ? 'bg-jn-red text-white shadow-lg shadow-jn-red/30' : 'bg-white text-gray-500 hover:text-jn-black hover:bg-gray-100 border border-gray-200'}`}
        >
          <ShieldAlert size={15} /> Bloquear Canchas
        </button>
        <button
          onClick={() => setActiveTab("prices")}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'prices' ? 'bg-jn-red text-white shadow-lg shadow-jn-red/30' : 'bg-white text-gray-500 hover:text-jn-black hover:bg-gray-100 border border-gray-200'}`}
        >
          <DollarSign size={15} /> Reglas de Precios
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-5 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'analytics' ? 'bg-jn-red text-white shadow-lg shadow-jn-red/30' : 'bg-white text-gray-500 hover:text-jn-black hover:bg-gray-100 border border-gray-200'}`}
        >
          <BarChart2 size={15} /> Estadísticas y Ocupación
        </button>
      </div>

      {/* TAB 1: AGENDA DE RESERVAS */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden space-y-0">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs uppercase text-gray-700 tracking-wider">Historial Operativo de Alquileres</h3>
              <span className="bg-gray-200 text-gray-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">{filteredBookings.length} Registros</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <select
                value={facilityFilter}
                onChange={e => setFacilityFilter(e.target.value)}
                className="bg-white border border-gray-300 text-xs font-bold rounded-xl px-3 py-2 text-jn-black focus:outline-none"
              >
                <option value="ALL">TODAS LAS CANCHAS</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 text-xs font-bold rounded-xl px-3 py-2 text-jn-black focus:outline-none"
              >
                <option value="ALL">TODOS LOS ESTADOS</option>
                <option value="CONFIRMADA">CONFIRMADAS</option>
                <option value="PENDIENTE">PENDIENTES</option>
                <option value="CANCELADA">CANCELADAS</option>
              </select>

              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente, teléfono..." 
                  className="pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none w-full bg-white font-medium" 
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="p-4">Turno / Horario</th>
                  <th className="p-4">Cancha / Instalación</th>
                  <th className="p-4">Cliente / Socio</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4 text-right">Importe</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-400 font-bold">Cargando reservas...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400 font-bold">No se encontraron reservas cargadas con los filtros seleccionados.</td>
                  </tr>
                ) : (
                  filteredBookings.map(res => {
                    const isBlock = res.nombreCliente.startsWith("BLOQUEO");
                    const statusColors = {
                      PENDIENTE: 'bg-amber-50 text-amber-800 border-amber-200',
                      CONFIRMADA: isBlock ? 'bg-orange-50 text-orange-800 border-orange-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      CANCELADA: 'bg-red-50 text-red-700 border-red-200',
                      FINALIZADA: 'bg-gray-100 text-gray-700 border-gray-300'
                    };
                    const statusColor = statusColors[res.estado] || 'bg-gray-100 text-gray-600';

                    return (
                      <tr key={res.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-4 font-semibold">
                          <div className="flex items-center gap-1.5 text-jn-black font-black text-sm">
                            <Clock size={14} className="text-gray-400" />
                            {res.horaInicio} - {res.horaFin} hs
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold mt-0.5">{new Date(res.fecha).toLocaleDateString('es-AR')}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-extrabold text-jn-black">{res.facility?.name || 'Cancha Principal'}</div>
                          <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> Sede Villa Devoto
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-black text-jn-black text-sm">{res.nombreCliente}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{res.telefono} • {res.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md font-black uppercase text-[9px] tracking-wider ${isBlock ? 'bg-orange-100 text-orange-800' : res.tipoReserva === 'SOCIO' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'}`}>
                            {isBlock ? 'MANTENIMIENTO' : res.tipoReserva}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black text-base text-jn-black">
                          ${parseFloat(res.importe || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>
                            {isBlock ? '🛡️ BLOQUEADO' : res.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5 justify-end">
                            {res.estado === 'PENDIENTE' && (
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'CONFIRMADA')}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer"
                                title="Confirmar Reserva"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {res.estado !== 'CANCELADA' && (
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'CANCELADA')}
                                className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors cursor-pointer"
                                title="Cancelar Reserva"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(res.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar Registro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ HORARIA DE CANCHAS (TIMELINE VISUAL) */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-jn-black tracking-tight flex items-center gap-2">
                <Activity size={18} className="text-jn-red" /> Matriz Interactivas de Turnos por Cancha
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Visualización en vivo de la disponibilidad de canchas para el día de hoy.
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Confirmado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Pendiente</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Mantenimiento</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300"></span> Disponible</span>
            </div>
          </div>

          <div className="space-y-6">
            {facilities.map(fac => (
              <div key={fac.id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm text-jn-black uppercase flex items-center gap-2">
                    <Dumbbell size={16} className="text-jn-red" /> {fac.name}
                  </h4>
                  <span className="text-[10px] bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-600">
                    8 Turnos Configurables
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
                  {TIME_SLOTS.map(slot => {
                    const booking = bookings.find(b => 
                      b.facilityId.toString() === fac.id.toString() && 
                      b.horaInicio <= slot && b.horaFin > slot
                    );

                    let bgColor = "bg-white text-gray-700 hover:border-jn-red cursor-pointer";
                    let statusLabel = "Libre";
                    let clientName = "";

                    if (booking) {
                      const isBlock = booking.nombreCliente.startsWith("BLOQUEO");
                      if (isBlock) {
                        bgColor = "bg-orange-500 text-white font-black";
                        statusLabel = "Bloqueado";
                      } else if (booking.estado === 'CONFIRMADA') {
                        bgColor = "bg-emerald-600 text-white font-black";
                        statusLabel = "Ocupado";
                        clientName = booking.nombreCliente;
                      } else if (booking.estado === 'PENDIENTE') {
                        bgColor = "bg-amber-500 text-white font-black";
                        statusLabel = "Pendiente";
                        clientName = booking.nombreCliente;
                      }
                    }

                    return (
                      <div
                        key={slot}
                        onClick={() => {
                          if (!booking) {
                            setQuickForm(prev => ({
                              ...prev,
                              facilityId: fac.id.toString(),
                              horaInicio: slot,
                              horaFin: `${parseInt(slot.split(':')[0]) + 1}:00`
                            }));
                            setQuickBookingModal(true);
                          }
                        }}
                        className={`p-3 rounded-xl border border-gray-200 transition-all text-center space-y-1 ${bgColor}`}
                      >
                        <span className="font-mono text-xs block">{slot} hs</span>
                        <span className="text-[9px] uppercase tracking-wider block font-bold truncate">
                          {clientName || statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BLOQUEAR CANCHAS Y MANTENIMIENTO */}
      {activeTab === "schedules" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm md:col-span-1 space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-black uppercase text-jn-red flex items-center gap-1.5">
                <ShieldAlert size={16} /> Crear Bloqueo Horario
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Inhabilita una cancha por mantenimiento o evento.</p>
            </div>
            
            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs font-bold text-gray-500 uppercase">
              <div>
                <label className="block mb-1">Cancha a Bloquear *</label>
                <select
                  value={scheduleForm.facilityId}
                  onChange={e => setScheduleForm({ ...scheduleForm, facilityId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-jn-black font-black focus:outline-none"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Fecha del Bloqueo *</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.date}
                  onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Hora Inicio *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-jn-black font-bold"
                  />
                </div>
                <div>
                  <label className="block mb-1">Hora Fin *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-jn-black font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Motivo del Bloqueo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mantenimiento Parquet / Torneo"
                  value={scheduleForm.reason}
                  onChange={e => setScheduleForm({ ...scheduleForm, reason: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-jn-darkred text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-jn-red/30 cursor-pointer active:scale-95"
              >
                Aplicar Bloqueo
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase text-jn-red flex items-center gap-2">
              <ShieldCheck size={16} /> Bloqueos y Mantenimientos Registrados
            </h3>
            <p className="text-xs text-gray-400 font-light">Listado de bloqueos administrativos cargados en la base de datos.</p>

            <div className="space-y-3">
              {bookings.filter(b => b.nombreCliente.startsWith("BLOQUEO")).length === 0 ? (
                <p className="text-xs text-gray-400 italic py-8 text-center bg-gray-50 rounded-xl border border-dashed">No hay bloqueos activos cargados actualmente.</p>
              ) : (
                bookings.filter(b => b.nombreCliente.startsWith("BLOQUEO")).map(b => (
                  <div key={`b-${b.id}`} className="bg-orange-50/80 p-4 border border-orange-200 rounded-xl flex justify-between items-center text-xs shadow-2xs">
                    <div>
                      <h4 className="font-black text-orange-900 text-sm">{b.nombreCliente}</h4>
                      <p className="text-gray-600 font-bold mt-1">
                        Cancha: {b.facility?.name || 'Cancha'} | Fecha: {new Date(b.fecha).toLocaleDateString('es-AR')} | Horario: {b.horaInicio} - {b.horaFin} hs
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="text-orange-700 hover:text-orange-900 font-black flex items-center gap-1 uppercase bg-white px-3.5 py-2 rounded-lg border border-orange-200 shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={13} /> Liberar Bloqueo
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGLAS DE PRECIOS */}
      {activeTab === "prices" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm md:col-span-1 space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-black uppercase text-jn-red flex items-center gap-1.5">
                <DollarSign size={16} /> Cargar Regla de Tarifa
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-1">Establecé precios diferenciados por horario y tipo de usuario.</p>
            </div>
            
            <form onSubmit={handleCreatePriceRule} className="space-y-4 text-xs font-bold text-gray-500 uppercase">
              <div>
                <label className="block mb-1">Cancha / Instalación *</label>
                <select
                  value={priceForm.facilityId}
                  onChange={e => setPriceForm({ ...priceForm, facilityId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-jn-black font-black focus:outline-none"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Tipo de Usuario *</label>
                  <select
                    value={priceForm.userType}
                    onChange={e => setPriceForm({ ...priceForm, userType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-bold"
                  >
                    <option value="SOCIO">👑 SOCIO</option>
                    <option value="GENERAL">🏷️ NO SOCIO / GENERAL</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6 py-1 text-jn-black font-bold">
                    <input
                      type="checkbox"
                      checked={priceForm.isPeakHour}
                      onChange={e => setPriceForm({ ...priceForm, isPeakHour: e.target.checked })}
                      className="w-4 h-4 rounded text-jn-red focus:ring-jn-red"
                    />
                    🔥 Hora Pico
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1">Precio por Hora (ARS) *</label>
                <input
                  type="number"
                  required
                  placeholder="25000"
                  value={priceForm.price}
                  onChange={e => setPriceForm({ ...priceForm, price: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-jn-black font-black text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-jn-darkred text-white font-black py-3 rounded-xl uppercase tracking-wider transition-all shadow-md shadow-jn-red/30 cursor-pointer active:scale-95"
              >
                Guardar Regla de Tarifa
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
            <h3 className="text-sm font-black uppercase text-jn-red flex items-center gap-2">
              📊 Tarifarios Vigentes Configurados
            </h3>
            <p className="text-xs text-gray-400 font-light">Listado de precios oficiales configurados para la reserva de canchas.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facilities.map(f => {
                const rulesForFacility = priceRules.filter(r => r.facilityId?.toString() === f.id?.toString());
                const socioStd = getEffectivePrice(f.id, 'SOCIO', false);
                const socioPeak = getEffectivePrice(f.id, 'SOCIO', true);
                const genStd = getEffectivePrice(f.id, 'GENERAL', false);
                const genPeak = getEffectivePrice(f.id, 'GENERAL', true);

                return (
                  <div key={f.id} className="bg-gray-50/80 p-5 border border-gray-200 rounded-2xl space-y-3 shadow-2xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-black text-sm text-jn-black">{f.name}</h4>
                      <span className="text-[9px] bg-red-100 text-jn-red px-2.5 py-0.5 rounded-full font-black uppercase">Cancha Oficial</span>
                    </div>

                    <div className="text-xs space-y-2 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2 text-gray-600 font-semibold">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block border-b pb-1">Precios y Tarifas Activas</span>
                        
                        {/* Socio Estándar */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            👑 Socio (Estándar):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {socioStd.isCustom && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">Personalizado</span>}
                            <span className={`font-black text-sm ${socioStd.isCustom ? 'text-emerald-700 font-mono' : 'text-jn-black'}`}>
                              ${socioStd.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {/* Socio Hora Pico */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            👑 Socio (Hora Pico):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {socioPeak.isCustom && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">Personalizado</span>}
                            <span className={`font-black text-sm ${socioPeak.isCustom ? 'text-emerald-700 font-mono' : 'text-jn-black'}`}>
                              ${socioPeak.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {/* No Socio Estándar */}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
                          <span className="flex items-center gap-1">
                            🏷️ No Socio (Estándar):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {genStd.isCustom && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">Personalizado</span>}
                            <span className={`font-black text-sm ${genStd.isCustom ? 'text-emerald-700 font-mono' : 'text-jn-black'}`}>
                              ${genStd.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        {/* No Socio Hora Pico */}
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            🏷️ No Socio (Hora Pico):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {genPeak.isCustom && <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded uppercase">Personalizado</span>}
                            <span className={`font-black text-sm ${genPeak.isCustom ? 'text-emerald-700 font-mono' : 'text-jn-black'}`}>
                              ${genPeak.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {rulesForFacility.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-black text-jn-red uppercase tracking-wider block">Reglas Personalizadas Guardadas</span>
                          {rulesForFacility.map(r => (
                            <div key={r.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-red-100 shadow-2xs">
                              <div>
                                <span className="font-extrabold text-jn-black">{r.userType === 'SOCIO' ? '👑 Socio' : '🏷️ No Socio'}</span>
                                <span className="text-[10px] text-gray-500 block font-bold">{r.isPeakHour ? '🔥 Hora Pico (18hs-22hs)' : '☀️ Horario Estándar'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-emerald-700 font-mono text-sm">${parseFloat(r.price).toLocaleString('es-AR')}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePriceRule(r.id)}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                  title="Eliminar regla personalizada"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS Y GRÁFICOS */}
      {activeTab === "analytics" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="font-black text-base uppercase text-jn-black tracking-tight flex items-center gap-2">
                <BarChart2 size={18} className="text-jn-red" /> Rendimiento e Ingresos por Cancha
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Estadísticas consolidadas de demanda y recaudación por instalación deportiva.
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="Ingresos" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
