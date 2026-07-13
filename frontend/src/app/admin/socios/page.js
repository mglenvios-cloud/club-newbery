"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, UserPlus, CreditCard, Award, Printer, Shield,
  Search, Filter, Edit, Trash, Plus, X, Check, AlertCircle,
  RefreshCw, Eye, Download, Phone, Mail, MapPin, Calendar, Heart,
  BookOpen, Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

export default function GestionSocios() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data States
  const [socios, setSocios] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [selectedSocio, setSelectedSocio] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [socioModal, setSocioModal] = useState({ isOpen: false, editId: null });
  const [tutorModal, setTutorModal] = useState({ isOpen: false, editId: null });
  const [cardPreviewModal, setCardPreviewModal] = useState(false);

  // Forms
  const [socioForm, setSocioForm] = useState({
    nombre: '', apellido: '', DNI: '', fechaNacimiento: '', sexo: 'MASCULINO',
    email: '', telefono: '', direccion: '', ciudad: '', provincia: '',
    codigoPostal: '', estado: 'ACTIVO', observaciones: '', tutorId: '', category: 'ACTIVO', foto: ''
  });

  const [tutorForm, setTutorForm] = useState({
    nombre: '', apellido: '', DNI: '', telefono: '', email: '', parentesco: 'PADRE', contactoEmergencia: ''
  });

  const cardRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helpers de Autenticación
  const checkAuthResponse = (res) => {
    if (res.status === 401 || res.status === 403) {
      showToast("No tienes permisos suficientes o tu sesión ha expirado", "error");
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);
      return false;
    }
    return true;
  };

  // Fetch functions
  const fetchSocios = useCallback(async () => {
    try {
      let url = `/api/socios`;
      const params = [];
      if (statusFilter !== 'ALL') params.push(`estado=${statusFilter}`);
      if (categoryFilter !== 'ALL') params.push(`category=${categoryFilter}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await apiFetch(url);
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        setSocios(await res.json());
      }
    } catch {
      showToast('Error al conectar con la API de socios', 'error');
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  const fetchTutores = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/socios/tutores`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setTutores(await res.json());
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSocios(), fetchTutores()]);
    setLoading(false);
  }, [fetchSocios, fetchTutores]);

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem("jn-auth-token") || localStorage.getItem("token"))
      : null;
    if (!token) {
      showToast("Sesión expirada", "error");
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1500);
    } else {
      fetchAll();
    }
  }, [statusFilter, categoryFilter, searchQuery, fetchAll]);

  // Operations
  const handleSaveSocio = async (e) => {
    e.preventDefault();
    const method = socioModal.editId ? 'PUT' : 'POST';
    const url = socioModal.editId
      ? `/api/socios/${socioModal.editId}`
      : `/api/socios`;

    try {
      const res = await apiFetch(url, {
        method,
        body: socioForm
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast(socioModal.editId ? 'Socio actualizado correctamente' : 'Socio registrado con éxito');
        setSocioModal({ isOpen: false, editId: null });
        fetchSocios();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error en validación de datos', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteSocio = async (id) => {
    if (!window.confirm('¿Seguro que desea dar de baja definitiva a este socio?')) return;
    try {
      const res = await apiFetch(`/api/socios/${id}`, { 
        method: 'DELETE'
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast('Socio dado de baja');
        if (selectedSocio?.id === id) setSelectedSocio(null);
        fetchSocios();
      }
    } catch {}
  };

  const handleSaveTutor = async (e) => {
    e.preventDefault();
    const method = tutorModal.editId ? 'PUT' : 'POST';
    const url = tutorModal.editId
      ? `/api/socios/tutores/${tutorModal.editId}`
      : `/api/socios/tutores`;

    try {
      const res = await apiFetch(url, {
        method,
        body: tutorForm
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast(tutorModal.editId ? 'Tutor actualizado' : 'Tutor registrado');
        setTutorModal({ isOpen: false, editId: null });
        fetchTutores();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al guardar', 'error');
      }
    } catch {}
  };

  const handleDeleteTutor = async (id) => {
    if (!window.confirm('¿Eliminar este tutor? Se desvinculará de todos los socios asociados.')) return;
    try {
      const res = await apiFetch(`/api/socios/tutores/${id}`, { 
        method: 'DELETE'
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast('Tutor eliminado');
        fetchTutores();
        fetchSocios();
      }
    } catch {}
  };

  const handleGenerateCard = async (socioId) => {
    try {
      const res = await apiFetch(`/api/socios/carnets/generate/${socioId}`, { 
        method: 'POST'
      });

      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast('Carnet digital generado con código QR único');
        fetchSocios();
        // Update selected socio detail
        const updated = socios.find(s => s.id === socioId);
        if (updated) {
          setSelectedSocio({
            ...updated,
            digitalCard: await res.json()
          });
        }
      }
    } catch {
      showToast('Error al generar credencial', 'error');
    }
  };

  const printCard = () => {
    const printContent = cardRef.current.innerHTML;
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Carnet Digital</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="flex items-center justify-center h-screen bg-white">
          <div class="border p-4 rounded-3xl bg-red-600 text-white w-96">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) {
      showToast('No se encontró el código QR para descargar', 'error');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 300, 300);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-socio-${selectedSocio.socioNumber}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Dashboard Stats Calculations
  const totalSocios = socios.length;
  const activos = socios.filter(s => s.estado === 'ACTIVO').length;
  const inactivos = socios.filter(s => s.estado === 'INACTIVO').length;
  const suspendidos = socios.filter(s => s.estado === 'SUSPENDIDO').length;
  const carnetsEmitidos = socios.filter(s => s.digitalCard).length;
  const carnetsPendientes = totalSocios - carnetsEmitidos;

  const currentMonth = new Date().getMonth();
  const cumpleañosMes = socios.filter(s => {
    if (!s.birthDate) return false;
    return new Date(s.birthDate).getMonth() === currentMonth;
  });

  const nuevosMes = socios.filter(s => {
    if (!s.fechaAlta) return false;
    const alta = new Date(s.fechaAlta);
    const now = new Date();
    return alta.getMonth() === now.getMonth() && alta.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-jn-black">
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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-jn-red uppercase tracking-widest bg-red-100 px-3 py-1.5 rounded-full border border-jn-red/20">Módulo Socios</span>
          <h1 className="text-3xl font-black uppercase mt-2">👥 Centro de Socios</h1>
          <p className="text-gray-500 text-sm">Administración integral del padrón de socios del club y emisión de credenciales con código QR.</p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs uppercase self-start shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* MODULE NAVIGATION */}
      <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'socios', label: '👥 Socios' },
          { id: 'tutores', label: '🛡️ Tutores' }
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
                <div className="w-12 h-12 bg-red-50 text-jn-red rounded-xl flex items-center justify-center"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Padron</p>
                  <h4 className="text-2xl font-black">{totalSocios}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Check size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Socios Activos</p>
                  <h4 className="text-2xl font-black text-green-600">{activos}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><AlertCircle size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nuevos del Mes</p>
                  <h4 className="text-2xl font-black text-amber-600">{nuevosMes}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CreditCard size={24} /></div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Carnets Emitidos</p>
                  <h4 className="text-2xl font-black text-blue-600">{carnetsEmitidos}</h4>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cumpleaños del Mes */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 lg:col-span-1">
                <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Heart size={16} className="text-jn-red" /> Cumpleaños de Socios (Este Mes)
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cumpleañosMes.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">No hay cumpleaños de socios registrados este mes.</p>
                  ) : cumpleañosMes.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-jn-red text-xs flex items-center justify-center font-bold">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-xs">{c.firstName} {c.lastName}</p>
                          <span className="text-[9px] text-gray-400">Nº Socio: {c.socioNumber}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-jn-red">
                        {new Date(c.birthDate).getDate()} / {new Date(c.birthDate).getMonth() + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Distribución de Estados */}
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 lg:col-span-2">
                <h3 className="font-black text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Shield size={16} className="text-jn-red" /> Estado General del Padrón
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 border rounded-xl bg-green-50/20 border-green-150">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Activos</p>
                    <h4 className="text-3xl font-black text-green-600 mt-1">{activos}</h4>
                  </div>
                  <div className="p-4 border rounded-xl bg-red-50/20 border-red-150">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Inactivos</p>
                    <h4 className="text-3xl font-black text-red-600 mt-1">{inactivos}</h4>
                  </div>
                  <div className="p-4 border rounded-xl bg-amber-50/20 border-amber-150">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Suspendidos</p>
                    <h4 className="text-3xl font-black text-amber-600 mt-1">{suspendidos}</h4>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-gray-400">Emisión de Credenciales</h4>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between text-xs">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-50">
                          Progreso de Carnets
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {totalSocios > 0 ? ((carnetsEmitidos / totalSocios) * 100).toFixed(0) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                      <div style={{ width: `${totalSocios > 0 ? (carnetsEmitidos / totalSocios) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-bold">
                    <span>Emitidos: {carnetsEmitidos}</span>
                    <span>Pendientes: {carnetsPendientes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SOCIOS */}
        {activeTab === 'socios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Padron List & Search */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por Nombre, DNI, Nº Socio, Email..."
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
                    <option value="ACTIVO">ACTIVOS</option>
                    <option value="INACTIVO">INACTIVOS</option>
                    <option value="SUSPENDIDO">SUSPENDIDOS</option>
                  </select>
                  <button
                    onClick={() => {
                      setSocioForm({
                        nombre: '', apellido: '', DNI: '', fechaNacimiento: '', sexo: 'MASCULINO',
                        email: '', telefono: '', direccion: '', ciudad: '', provincia: '',
                        codigoPostal: '', estado: 'ACTIVO', observaciones: '', tutorId: '', category: 'ACTIVO', foto: ''
                      });
                      setSocioModal({ isOpen: true, editId: null });
                    }}
                    className="bg-jn-red hover:bg-red-700 text-white font-black uppercase text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Registrar Socio
                  </button>
                </div>
              </div>

              {/* Socios Table */}
              <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Socio</th>
                      <th className="p-4">DNI</th>
                      <th className="p-4">Email / Tel.</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {socios.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-4 text-center text-gray-400 text-xs py-8">No se encontraron socios en el padrón.</td>
                      </tr>
                    ) : socios.map(s => (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedSocio(s)}
                        className={`cursor-pointer transition-colors ${selectedSocio?.id === s.id ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50/50'}`}
                      >
                        <td className="p-4">
                          <p>{s.firstName} {s.lastName}</p>
                          <span className="text-[10px] text-gray-400 font-mono">Nº {s.socioNumber} | Cat: {s.category}</span>
                        </td>
                        <td className="p-4 font-mono text-xs">{s.dni}</td>
                        <td className="p-4">
                          <p className="text-xs text-gray-600 leading-none lowercase mb-1">{s.email}</p>
                          <span className="text-[10px] text-gray-400 font-mono">{s.phone || 'Sin tel.'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                            s.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' :
                            s.estado === 'SUSPENDIDO' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                          }`}>{s.estado}</span>
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSocioForm({
                                ...s,
                                nombre: s.firstName,
                                apellido: s.lastName,
                                DNI: s.dni,
                                fechaNacimiento: s.birthDate ? s.birthDate.split('T')[0] : '',
                                email: s.email,
                                telefono: s.phone || '',
                                direccion: s.address || '',
                                ciudad: s.ciudad || '',
                                provincia: s.provincia || '',
                                codigoPostal: s.codigoPostal || '',
                                estado: s.estado || 'ACTIVO',
                                observaciones: s.observaciones || '',
                                tutorId: s.tutorId || '',
                                category: s.category || 'ACTIVO',
                                foto: s.foto || ''
                              });
                              setSocioModal({ isOpen: true, editId: s.id });
                            }}
                            className="p-1.5 border hover:bg-gray-50 rounded-lg bg-white"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSocio(s.id)}
                            className="p-1.5 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg bg-white"
                          >
                            <Trash size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Socio Detail & Carnet Digital (Sidepanel) */}
            <div className="lg:col-span-1 space-y-6">
              {selectedSocio ? (
                <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
                  
                  {/* Carnet Digital Preview Premium */}
                  <div className="bg-gradient-to-br from-jn-red via-red-600 to-jn-darkred text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col justify-between h-56">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl pointer-events-none select-none">JN</div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-white/70">Club J. Newbery</h4>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Carnet Oficial</p>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        selectedSocio.estado === 'ACTIVO' ? 'bg-white/20 text-white' : 'bg-red-900/60 text-red-100'
                      }`}>
                        {selectedSocio.estado}
                      </span>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center self-center shrink-0">
                        {selectedSocio.foto ? (
                          <img src={selectedSocio.foto} alt="Perfil" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-black text-2xl uppercase">{selectedSocio.firstName[0]}{selectedSocio.lastName[0]}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black truncate leading-tight uppercase">{selectedSocio.firstName} {selectedSocio.lastName}</h3>
                        <p className="text-[10px] text-white/75 font-mono">Nº {selectedSocio.socioNumber}</p>
                        <p className="text-[10px] text-white/75 uppercase font-bold tracking-wider">Cat: {selectedSocio.category}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[8px] font-bold text-white/60">
                      <span>Vence: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.expiresAt).toLocaleDateString('es-AR') : 'PENDIENTE'}</span>
                      {selectedSocio.digitalCard ? (
                        <button
                          onClick={() => setCardPreviewModal(true)}
                          className="bg-white text-jn-red px-2 py-1 rounded font-black uppercase hover:bg-white/90 text-[8px]"
                        >
                          Ampliar QR
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateCard(selectedSocio.id)}
                          className="bg-white/20 text-white hover:bg-white/30 px-2 py-1 rounded font-black uppercase text-[8px]"
                        >
                          Generar QR
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ficha de Socio Detail */}
                  <div className="space-y-4">
                    <h3 className="font-black text-sm uppercase border-b pb-2 flex items-center gap-1.5"><Eye size={16} /> Datos de la Ficha</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[9px]">DNI</span>
                        <span className="font-bold font-mono">{selectedSocio.dni}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[9px]">Nacimiento</span>
                        <span className="font-bold">{selectedSocio.birthDate ? new Date(selectedSocio.birthDate).toLocaleDateString('es-AR') : 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-400 block font-bold uppercase text-[9px]">Dirección</span>
                        <span className="font-bold">{selectedSocio.address} {selectedSocio.ciudad && `, ${selectedSocio.ciudad}`}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[9px]">Teléfono</span>
                        <span className="font-bold font-mono">{selectedSocio.phone || 'Sin registro'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold uppercase text-[9px]">Sexo</span>
                        <span className="font-bold uppercase">{selectedSocio.sexo || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grupo Familiar / Tutor Vinculado */}
                  {selectedSocio.tutor ? (
                    <div className="bg-gray-50 border p-4 rounded-xl space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tutor a cargo</p>
                      <h4 className="font-bold text-sm">{selectedSocio.tutor.nombre} {selectedSocio.tutor.apellido} ({selectedSocio.tutor.parentesco})</h4>
                      <div className="flex gap-4 text-xs text-gray-500 font-bold">
                        <span className="flex items-center gap-1"><Phone size={12} /> {selectedSocio.tutor.telefono}</span>
                        <span className="flex items-center gap-1"><Mail size={12} className="lowercase" /> {selectedSocio.tutor.email}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50/50 border border-dashed p-4 rounded-xl text-center text-xs text-gray-400 font-bold">
                      Sin tutor asociado (Socio Mayor de Edad)
                    </div>
                  )}

                  {selectedSocio.observaciones && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase block">Observaciones</span>
                      <p className="text-xs font-semibold leading-relaxed text-gray-500">{selectedSocio.observaciones}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGenerateCard(selectedSocio.id)}
                      className="flex-1 bg-white hover:bg-gray-50 border text-jn-black font-black uppercase text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={12} /> Regenerar Carnet
                    </button>
                    <button
                      onClick={() => {
                        setSocioForm({
                          ...selectedSocio,
                          nombre: selectedSocio.firstName,
                          apellido: selectedSocio.lastName,
                          DNI: selectedSocio.dni,
                          fechaNacimiento: selectedSocio.birthDate ? selectedSocio.birthDate.split('T')[0] : '',
                          email: selectedSocio.email,
                          telefono: selectedSocio.phone || '',
                          direccion: selectedSocio.address || '',
                          ciudad: selectedSocio.ciudad || '',
                          provincia: selectedSocio.provincia || '',
                          codigoPostal: selectedSocio.codigoPostal || '',
                          estado: selectedSocio.estado || 'ACTIVO',
                          observaciones: selectedSocio.observaciones || '',
                          tutorId: selectedSocio.tutorId || '',
                          category: selectedSocio.category || 'ACTIVO',
                          foto: selectedSocio.foto || ''
                        });
                        setSocioModal({ isOpen: true, editId: selectedSocio.id });
                      }}
                      className="bg-jn-black hover:bg-gray-800 text-white font-black uppercase text-xs px-4 py-2.5 rounded-xl"
                    >
                      Editar Ficha
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-dashed rounded-2xl p-8 text-center text-gray-400 text-xs py-20 font-bold shadow-sm">
                  Selecciona un socio de la lista para ver su ficha técnica, credencial digital y grupo familiar.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: TUTORES */}
        {activeTab === 'tutores' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setTutorForm({ nombre: '', apellido: '', DNI: '', telefono: '', email: '', parentesco: 'PADRE', contactoEmergencia: '' });
                  setTutorModal({ isOpen: true, editId: null });
                }}
                className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5"
              >
                <Plus size={16} /> Registrar Tutor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutores.length === 0 ? (
                <p className="text-gray-400 text-xs col-span-3 text-center py-8">Sin tutores registrados.</p>
              ) : tutores.map(t => (
                <div key={t.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-red-150 text-jn-red px-2 py-0.5 rounded font-black uppercase">{t.parentesco}</span>
                      <h4 className="font-black text-base mt-1">{t.nombre} {t.apellido}</h4>
                      <p className="text-[10px] text-gray-400 font-mono font-bold">DNI: {t.DNI}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setTutorForm(t); setTutorModal({ isOpen: true, editId: t.id }); }} className="text-gray-500 hover:text-black"><Edit size={12} /></button>
                      <button onClick={() => handleDeleteTutor(t.id)} className="text-red-500 hover:text-red-700"><Trash size={12} /></button>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t pt-3 text-xs font-bold text-gray-600">
                    <p className="flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> {t.telefono}</p>
                    <p className="flex items-center gap-1.5"><Mail size={13} className="text-gray-400 lowercase" /> {t.email}</p>
                    {t.contactoEmergencia && <p className="text-[10px] text-red-600 font-black flex items-center gap-1.5"><AlertCircle size={12} /> Emer.: {t.contactoEmergencia}</p>}
                  </div>

                  <div className="bg-gray-50 -mx-5 -mb-5 p-3.5 rounded-b-2xl border-t text-[10px] font-black text-gray-400 uppercase">
                    Menores asociados: {t.socios?.length || 0}
                    {t.socios?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.socios.map(s => (
                          <span key={s.id} className="bg-white border px-2 py-0.5 rounded font-semibold text-jn-black">{s.firstName} {s.lastName}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL REGISTRAR SOCIO */}
      {socioModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{socioModal.editId ? 'Editar Socio' : 'Registrar Socio'}</h3>
              <button onClick={() => setSocioModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSocio} className="space-y-4 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Nombre *</label>
                  <input
                    type="text" required
                    value={socioForm.nombre}
                    onChange={e => setSocioForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Apellido *</label>
                  <input
                    type="text" required
                    value={socioForm.apellido}
                    onChange={e => setSocioForm(prev => ({ ...prev, apellido: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block">DNI *</label>
                  <input
                    type="text" required
                    value={socioForm.DNI}
                    onChange={e => setSocioForm(prev => ({ ...prev, DNI: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-mono"
                    placeholder="Solo números"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Fecha de Nacimiento *</label>
                  <input
                    type="date" required
                    value={socioForm.fechaNacimiento}
                    onChange={e => setSocioForm(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Sexo</label>
                  <select
                    value={socioForm.sexo}
                    onChange={e => setSocioForm(prev => ({ ...prev, sexo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="MASCULINO">MASCULINO</option>
                    <option value="FEMENINO">FEMENINO</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Email *</label>
                  <input
                    type="email" required
                    value={socioForm.email}
                    onChange={e => setSocioForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 lowercase"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Teléfono</label>
                  <input
                    type="text"
                    value={socioForm.telefono}
                    onChange={e => setSocioForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block">Dirección</label>
                  <input
                    type="text"
                    value={socioForm.direccion}
                    onChange={e => setSocioForm(prev => ({ ...prev, direccion: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Ciudad</label>
                  <input
                    type="text"
                    value={socioForm.ciudad}
                    onChange={e => setSocioForm(prev => ({ ...prev, ciudad: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Código Postal</label>
                  <input
                    type="text"
                    value={socioForm.codigoPostal}
                    onChange={e => setSocioForm(prev => ({ ...prev, codigoPostal: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block">Estado</label>
                  <select
                    value={socioForm.estado}
                    onChange={e => setSocioForm(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Categoría de Socio</label>
                  <select
                    value={socioForm.category}
                    onChange={e => setSocioForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="MENOR">MENOR</option>
                    <option value="CADETE">CADETE</option>
                    <option value="VITALICIO">VITALICIO</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Tutor a cargo (Opcional)</label>
                  <select
                    value={socioForm.tutorId}
                    onChange={e => setSocioForm(prev => ({ ...prev, tutorId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-bold"
                  >
                    <option value="">Ninguno (Mayor de edad)</option>
                    {tutores.map(t => <option key={t.id} value={t.id}>{t.apellido}, {t.nombre} ({t.parentesco})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Observaciones</label>
                <textarea
                  value={socioForm.observaciones}
                  onChange={e => setSocioForm(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2.5 h-20"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-600 uppercase">Foto de Perfil</label>
                <MediaUploadUniversal
                  value={socioForm.foto}
                  onChange={url => setSocioForm(prev => ({ ...prev, foto: url }))}
                  category="socios"
                  allowedTypes={['image']}
                />
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3.5 rounded-xl text-xs transition-colors mt-2 shadow-lg shadow-jn-red/20">
                Guardar Ficha del Socio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR TUTOR */}
      {tutorModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{tutorModal.editId ? 'Editar Tutor' : 'Registrar Tutor'}</h3>
              <button onClick={() => setTutorModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Nombre *</label>
                  <input
                    type="text" required
                    value={tutorForm.nombre}
                    onChange={e => setTutorForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Apellido *</label>
                  <input
                    type="text" required
                    value={tutorForm.apellido}
                    onChange={e => setTutorForm(prev => ({ ...prev, apellido: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">DNI *</label>
                <input
                  type="text" required
                  value={tutorForm.DNI}
                  onChange={e => setTutorForm(prev => ({ ...prev, DNI: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Teléfono *</label>
                  <input
                    type="text" required
                    value={tutorForm.telefono}
                    onChange={e => setTutorForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Parentesco *</label>
                  <select
                    value={tutorForm.parentesco}
                    onChange={e => setTutorForm(prev => ({ ...prev, parentesco: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    <option value="PADRE">PADRE</option>
                    <option value="MADRE">MADRE</option>
                    <option value="TUTOR_LEGAL">TUTOR LEGAL</option>
                    <option value="ABUELO">ABUELO/A</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Email *</label>
                <input
                  type="email" required
                  value={tutorForm.email}
                  onChange={e => setTutorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs lowercase"
                />
              </div>

              <div>
                <label className="mb-1 block">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={tutorForm.contactoEmergencia}
                  onChange={e => setTutorForm(prev => ({ ...prev, contactoEmergencia: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Nombre y teléfono alternativo"
                />
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARNET PREVIEW PREMIUM (PRINTABLE) */}
      {cardPreviewModal && selectedSocio && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-jn-black text-white rounded-3xl max-w-sm w-full shadow-2xl p-6 relative flex flex-col items-center gap-6 border border-white/10 animate-scale-in">
            <button
              onClick={() => setCardPreviewModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="text-center w-full">
              <h3 className="font-black text-lg uppercase tracking-wide">Credencial de Socio</h3>
              <p className="text-xs text-white/50">Club Jorge Newbery Oficial</p>
            </div>

            {/* Printable Area Wrapper */}
            <div ref={cardRef} className="w-full">
              <div className="bg-jn-red text-white p-5 rounded-2xl shadow-lg border border-white/15 flex flex-col justify-between h-80 w-full relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl pointer-events-none select-none">JN</div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-white/95">Club J. Newbery</h4>
                    <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider">Carnet Oficial de Socio</p>
                  </div>
                  <span className="text-[8px] bg-white text-jn-red px-2 py-0.5 rounded font-black uppercase">
                    {selectedSocio.estado}
                  </span>
                </div>

                <div className="flex gap-4 items-center mt-3">
                  <div className="w-20 h-20 rounded-full bg-white/10 border border-white/25 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedSocio.foto ? (
                      <img src={selectedSocio.foto} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-3xl uppercase">{selectedSocio.firstName[0]}{selectedSocio.lastName[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black truncate leading-tight uppercase">{selectedSocio.firstName} {selectedSocio.lastName}</h3>
                    <p className="text-xs text-white/80 font-mono">DNI: {selectedSocio.dni}</p>
                    <p className="text-xs text-white/80 font-mono">Socio Nº: {selectedSocio.socioNumber}</p>
                    <p className="text-[10px] text-white/80 uppercase font-bold tracking-wider">Categoría: {selectedSocio.category}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-4 border-t border-white/10 pt-3">
                  <div className="text-[8px] font-bold text-white/60">
                    <p>EMITIDO: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.issuedAt).toLocaleDateString('es-AR') : '-'}</p>
                    <p>VENCE: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.expiresAt).toLocaleDateString('es-AR') : '-'}</p>
                  </div>
                  {selectedSocio.digitalCard && (
                    <div className="bg-white p-1 rounded-lg shadow-md shrink-0">
                      <QRCodeSVG id="qr-code-svg" value={selectedSocio.digitalCard.qrCode} size={65} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full border-t border-white/10 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white font-black uppercase text-[10px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Download size={12} /> Descargar QR
                </button>
                <button
                  onClick={printCard}
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black uppercase text-[10px] py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-jn-red/35"
                >
                  <Printer size={12} /> Imprimir
                </button>
              </div>
              <button
                onClick={() => setCardPreviewModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] py-2 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
