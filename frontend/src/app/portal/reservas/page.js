"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CreditCard, Plus, CheckCircle, AlertCircle, ArrowRight, Trash2, Shield } from "lucide-react";
import Link from 'next/link';

import { API_URL } from '@/config';

export default function MisReservas() {
  const [bookings, setBookings] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socio, setSocio] = useState(null);

  // Estados del Formulario de Reserva
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { startTime, endTime }
  const [submitting, setSubmitting] = useState(false);

  // Toast / Mensajes
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Obtener datos del socio (me)
  const fetchSocioProfile = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    if (!token) return;
    try {
      const res = await fetch(`/api/members/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSocio(data);
      }
    } catch (e) {
      console.error("Error al obtener perfil del socio:", e);
    }
  }, []);

  // Obtener reservas del socio
  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/reservas/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBookings(await res.json());
      }
    } catch (e) {
      console.error("Error al obtener reservas:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener canchas disponibles
  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservas/facilities`);
      if (res.ok) {
        const data = await res.json();
        setFacilities(data);
        if (data.length > 0) setSelectedFacilityId(data[0].id.toString());
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSocioProfile();
    fetchBookings();
    fetchFacilities();
  }, [fetchSocioProfile, fetchBookings, fetchFacilities]);

  // Consultar disponibilidad horaria al cambiar fecha o cancha
  useEffect(() => {
    if (!selectedFacilityId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await fetch(`/api/reservas/availability?facilityId=${selectedFacilityId}&date=${selectedDate}`);
        if (res.ok) {
          const slots = await res.json();
          // Filtrar slots disponibles
          setAvailableSlots(slots);
        }
      } catch (e) {
        console.error("Error al obtener disponibilidad:", e);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [selectedFacilityId, selectedDate]);

  // Confirmar reserva
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedFacilityId || !selectedDate || !selectedSlot) {
      return showToast("Completa la cancha, la fecha y el horario.", "error");
    }

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    if (!token) return showToast("Debes iniciar sesión para reservar.", "error");

    setSubmitting(true);

    const bookingPayload = {
      nombreCliente: socio ? `${socio.firstName} ${socio.lastName}` : "Socio Invitado",
      telefono: socio?.phone || "1111-2222",
      email: socio?.email || "socio@newbery.com",
      facilityId: parseInt(selectedFacilityId, 10),
      fecha: selectedDate,
      horaInicio: selectedSlot.startTime,
      horaFin: selectedSlot.endTime,
      tipoReserva: 'SOCIO'
    };

    try {
      const res = await fetch(`/api/reservas/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (res.ok) {
        showToast("¡Reserva solicitada con éxito! Queda pendiente de aprobación.");
        setSelectedDate("");
        setSelectedSlot(null);
        fetchBookings();
      } else {
        const err = await res.json();
        showToast(err.error || "No se pudo realizar la reserva.", "error");
      }
    } catch {
      showToast("Error de red.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar reserva
  const handleCancelBooking = async (id) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    try {
      const res = await fetch(`/api/reservas/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToast("Reserva cancelada correctamente.");
        fetchBookings();
      } else {
        showToast("No se pudo cancelar la reserva.", "error");
      }
    } catch {
      showToast("Error al conectar con el servidor.", "error");
    }
  };

  const formatDate = (dateStr) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateObj = new Date(dateStr);
      const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
      return utcDate.toLocaleDateString('es-AR', options);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-jn-black">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2 shadow-lg transition-transform ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase">Mis Reservas de Canchas</h2>
          <p className="text-sm text-gray-500">Reserva turnos de futsal, patín, vóley y salones como socio oficial.</p>
        </div>
        <div className="bg-red-100 text-jn-red text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-jn-red/10 flex items-center gap-1.5">
          <Shield size={14} /> Tarifas Socio Activas
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* PANEL DE RESERVAS (2/5 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase text-jn-red flex items-center gap-2">
              <Plus size={16} /> Alquilar Cancha / Espacio
            </h3>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs font-bold text-gray-500 uppercase">
              {/* Cancha */}
              <div>
                <label className="block mb-1">Seleccionar Cancha *</label>
                <select
                  value={selectedFacilityId}
                  onChange={e => setSelectedFacilityId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-jn-black font-bold focus:ring-1 focus:ring-jn-red focus:outline-none"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.sede.name})</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block mb-1">Seleccionar Fecha *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-jn-black font-bold focus:ring-1 focus:ring-jn-red focus:outline-none"
                />
              </div>

              {/* Horarios Disponibles */}
              {selectedDate && (
                <div className="space-y-2">
                  <label className="block">Horarios Disponibles *</label>
                  {loadingSlots ? (
                    <p className="text-[10px] text-gray-400 animate-pulse font-normal">Verificando turnos libres en agenda...</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic font-normal">Instalación cerrada o sin disponibilidad horaria.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => {
                        const isAvailable = slot.status === 'DISPONIBLE';
                        const isSelected = selectedSlot?.startTime === slot.startTime;

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${
                              !isAvailable
                                ? 'bg-gray-100 border-gray-200 text-gray-450 cursor-not-allowed'
                                : isSelected
                                ? 'bg-jn-red border-jn-red text-white shadow'
                                : 'bg-white border-gray-300 text-jn-black hover:border-jn-red'
                            }`}
                          >
                            {slot.startTime} - {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Botón enviar */}
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full bg-jn-red hover:bg-jn-darkred disabled:opacity-40 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Confirmando...' : 'Confirmar Reserva'} <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* HISTORIAL Y ESTADO (3/5 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-jn-red">📁 Mis Alquileres Reservados</h3>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center text-gray-400 font-bold">
              Cargando historial de reservas...
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-12 text-center space-y-3">
              <AlertCircle size={36} className="mx-auto text-gray-300 animate-pulse" />
              <p className="text-gray-500 font-bold">No tienes reservas activas registradas.</p>
              <p className="text-[11px] text-gray-450 font-light leading-relaxed">Usa el panel de la izquierda para reservar una cancha y comenzar a jugar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((booking) => {
                const statusColors = {
                  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
                  CANCELADA: 'bg-red-100 text-red-800 border-red-200',
                  FINALIZADA: 'bg-gray-100 text-gray-800 border-gray-250'
                };
                const statusColor = statusColors[booking.estado] || 'bg-gray-100 text-gray-700';

                return (
                  <div
                    key={booking.id}
                    className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${statusColor}`}>
                          {booking.estado}
                        </span>
                        <span className="text-[9px] bg-red-50 text-jn-red px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          {booking.tipoReserva}
                        </span>
                      </div>
                      <h4 className="font-black text-base leading-tight">{booking.facility?.name || 'Cancha del Club'}</h4>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 font-bold uppercase">
                        <div>📅 {formatDate(booking.fecha)}</div>
                        <div>⏰ {booking.horaInicio} - {booking.horaFin} HS</div>
                        <div className="col-span-2 mt-1 text-jn-black">💰 Importe: <span className="font-extrabold">${parseFloat(booking.importe).toLocaleString('es-AR')}</span></div>
                      </div>
                    </div>

                    <div className="flex gap-2 self-start sm:self-center">
                      {booking.estado !== 'CANCELADA' && booking.estado !== 'FINALIZADA' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold uppercase flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={12} /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
