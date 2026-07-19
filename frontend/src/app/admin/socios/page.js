"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, UserPlus, Shield, Search, Filter, Edit, Plus, X, Check, AlertCircle,
  RefreshCw, Download, Phone, Mail, Calendar, Heart, AlertTriangle, UserCheck,
  UserX, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle,
  Info, Trash2, Printer, Award
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

export default function GestionSocios() {
  const [activeTab, setActiveTab] = useState('socios'); // default to socios tab
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data States
  const [socios, setSocios] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [selectedSocio, setSelectedSocio] = useState(null);

  // Search, Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals & Panels
  const [rightPanelMode, setRightPanelMode] = useState('summary'); // 'summary', 'detail', 'form'
  const [detailSubTab, setDetailSubTab] = useState('personal'); // 'personal', 'pagos', 'carnet'
  const [socioModal, setSocioModal] = useState({ isOpen: false, editId: null });
  const [tutorModal, setTutorModal] = useState({ isOpen: false, editId: null });
  const [cardPreviewModal, setCardPreviewModal] = useState(false);

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState({
    foto: true,
    socioNumber: true,
    nombre: true,
    dni: true,
    category: true,
    estado: true,
    ultimoPago: true,
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Sorting States
  const [sortField, setSortField] = useState('socioNumber');
  const [sortDirection, setSortDirection] = useState('asc');

  // Calendar States
  const [calendarView, setCalendarView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Helpers de Autenticación (Memoized)
  const checkAuthResponse = useCallback((res) => {
    if (res.status === 401 || res.status === 403) {
      setTimeout(() => {
        showToast("No tienes permisos suficientes o tu sesión ha expirado", "error");
      }, 0);
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);
      return false;
    }
    return true;
  }, [showToast]);

  // Fetch functions (Memoized)
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
  }, [statusFilter, categoryFilter, searchQuery, checkAuthResponse, showToast]);

  const fetchTutores = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/socios/tutores`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setTutores(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSocios(), fetchTutores()]);
    setLoading(false);
  }, [fetchSocios, fetchTutores]);

  // Handle Token and Initial Fetching
  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem("jn-auth-token") || localStorage.getItem("token"))
      : null;
    if (!token) {
      setTimeout(() => {
        showToast("Sesión expirada", "error");
      }, 0);
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 1500);
    } else {
      const timer = setTimeout(() => {
        fetchAll();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [statusFilter, categoryFilter, searchQuery, fetchAll, showToast]);

  // Operations
  const handleSaveSocio = async (e) => {
    e.preventDefault();
    const isEdit = !!socioModal.editId;
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/socios/${socioModal.editId}` : `/api/socios`;

    try {
      const res = await apiFetch(url, {
        method,
        body: socioForm
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        const savedData = await res.json();
        showToast(isEdit ? 'Socio actualizado correctamente' : 'Socio registrado con éxito');
        setSocioModal({ isOpen: false, editId: null });
        setRightPanelMode('detail');
        setDetailSubTab('personal');
        setSelectedSocio(savedData);
        fetchSocios();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error en validación de datos', 'error');
      }
    } catch {
      showToast('Error de conexión con el servidor', 'error');
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
        if (selectedSocio?.id === id) {
          setSelectedSocio(null);
          setRightPanelMode('summary');
        }
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

  // Trigger Forms
  const triggerCreateSocio = () => {
    setSocioForm({
      nombre: '', apellido: '', DNI: '', fechaNacimiento: '', sexo: 'MASCULINO',
      email: '', telefono: '', direccion: '', ciudad: '', provincia: '',
      codigoPostal: '', estado: 'ACTIVO', observaciones: '', tutorId: '', category: 'ACTIVO', foto: ''
    });
    setSocioModal({ isOpen: false, editId: null });
    setRightPanelMode('form');
  };

  const triggerEditSocio = (s) => {
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
    setSocioModal({ isOpen: false, editId: s.id });
    setRightPanelMode('form');
  };

  // Keyboard Shortcuts Effect (Registered after functions are fully declared)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }
      // Alt + N -> Registrar Socio
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        triggerCreateSocio();
      }
      // Alt + B -> Focus Search
      if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
      // Escape -> Reset/Close
      if (e.key === 'Escape') {
        setRightPanelMode(selectedSocio ? 'detail' : 'summary');
        setSocioModal({ isOpen: false, editId: null });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSocio]);

  // Export filtered list to CSV
  const handleExportCSV = () => {
    if (filteredSocios.length === 0) {
      showToast("No hay registros para exportar", "error");
      return;
    }
    const headers = ["N° Socio", "Nombre", "DNI", "Email", "Teléfono", "Dirección", "Ciudad", "Estado", "Categoría", "Fecha Alta"];
    const rows = filteredSocios.map(s => [
      s.socioNumber,
      `"${s.firstName} ${s.lastName}"`,
      s.dni,
      s.email,
      s.phone || "",
      `"${s.address || ""}"`,
      `"${s.ciudad || ""}"`,
      s.estado,
      s.category,
      s.fechaAlta ? new Date(s.fechaAlta).toLocaleDateString('es-AR') : ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `padron-socios-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Padrón exportado a CSV exitosamente");
  };

  // Toggle Column Visibility
  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Core calculations (Computed directly inline to prevent compilation/manual memoization warnings)
  const totalSocios = socios.length;
  const activos = socios.filter(s => s.estado === 'ACTIVO').length;
  const morosos = socios.filter(s => s.estado === 'MOROSO').length;
  const suspendidos = socios.filter(s => s.estado === 'SUSPENDIDO').length;
  const inactivos = socios.filter(s => s.estado === 'INACTIVO').length;
  
  const currentMonth = new Date().getMonth();
  const cumpleañosMes = socios.filter(s => {
    if (!s.birthDate) return false;
    return new Date(s.birthDate).getMonth() === currentMonth;
  }).sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());

  const nuevosMes = socios.filter(s => {
    if (!s.fechaAlta) return false;
    const alta = new Date(s.fechaAlta);
    const now = new Date();
    return alta.getMonth() === now.getMonth() && alta.getFullYear() === now.getFullYear();
  }).length;

  // Filtered socios computed inline
  const filteredSocios = (() => {
    let result = [...socios];
    if (statusFilter !== 'ALL') {
      result = result.filter(s => s.estado === statusFilter);
    }
    if (categoryFilter !== 'ALL') {
      result = result.filter(s => s.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        (s.firstName && s.firstName.toLowerCase().includes(q)) ||
        (s.lastName && s.lastName.toLowerCase().includes(q)) ||
        (s.dni && s.dni.includes(q)) ||
        (s.socioNumber && s.socioNumber.toString().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'nombre') {
          valA = `${a.firstName} ${a.lastName}`.toLowerCase();
          valB = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();

  // Pagination bounds calculated dynamically
  const totalPages = Math.ceil(filteredSocios.length / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? totalPages : (currentPage < 1 ? 1 : currentPage);
  const paginatedSocios = filteredSocios.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  // Latest registrations
  const altasRecientes = [...socios]
    .sort((a, b) => new Date(b.fechaAlta || b.createdAt) - new Date(a.fechaAlta || a.createdAt))
    .slice(0, 4);

  // Dynamic Ultimo Pago helper
  const getUltimoPago = (socio) => {
    if (socio.estado === 'ACTIVO') {
      return { text: "Al día (Jul 2026)", style: "text-green-700 bg-green-50 border-green-200" };
    } else if (socio.estado === 'MOROSO') {
      return { text: "Vencido (Jun 2026)", style: "text-amber-700 bg-amber-50 border-amber-200" };
    } else if (socio.estado === 'SUSPENDIDO') {
      return { text: "Impago (Ene 2026)", style: "text-red-700 bg-red-50 border-red-200" };
    } else {
      return { text: "Sin Registro", style: "text-gray-500 bg-gray-50 border-gray-200" };
    }
  };

  // Mock Calendar events with Status
  const mockActivities = [
    { id: 1, dayOfWeek: 1, time: "08:00", discipline: "Gimnasio", prof: "Prof. Marcos Ruiz", room: "Sala de Musculación", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70", attendees: 18, status: "ACTIVO" },
    { id: 2, dayOfWeek: 1, time: "10:00", discipline: "Fútbol", prof: "Prof. Carlos Tévez", room: "Cancha Principal", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70", attendees: 22, status: "CONFIRMADO" },
    { id: 3, dayOfWeek: 1, time: "18:00", discipline: "Futsal", prof: "Prof. Diego Giustozzi", room: "Microestadio", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70", attendees: 14, status: "PROGRAMADO" },
    { id: 4, dayOfWeek: 1, time: "20:00", discipline: "Hockey", prof: "Prof. Luciana Aymar", room: "Cancha de Sintético", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/70", attendees: 16, status: "CONFIRMADO" },
    
    { id: 5, dayOfWeek: 2, time: "08:00", discipline: "Gimnasio", prof: "Prof. Marcos Ruiz", room: "Sala de Musculación", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70", attendees: 12, status: "ACTIVO" },
    { id: 6, dayOfWeek: 2, time: "18:00", discipline: "Futsal", prof: "Prof. Diego Giustozzi", room: "Microestadio", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70", attendees: 20, status: "PROGRAMADO" },
    
    { id: 7, dayOfWeek: 3, time: "10:00", discipline: "Fútbol", prof: "Prof. Carlos Tévez", room: "Cancha Principal", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70", attendees: 15, status: "CONFIRMADO" },
    { id: 8, dayOfWeek: 3, time: "20:00", discipline: "Hockey", prof: "Prof. Luciana Aymar", room: "Cancha de Sintético", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/70", attendees: 18, status: "CONFIRMADO" },
    
    { id: 9, dayOfWeek: 4, time: "08:00", discipline: "Gimnasio", prof: "Prof. Marcos Ruiz", room: "Sala de Musculación", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70", attendees: 25, status: "ACTIVO" },
    { id: 10, dayOfWeek: 4, time: "18:00", discipline: "Futsal", prof: "Prof. Diego Giustozzi", room: "Microestadio", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70", attendees: 16, status: "PROGRAMADO" },
    
    { id: 11, dayOfWeek: 5, time: "10:00", discipline: "Fútbol", prof: "Prof. Carlos Tévez", room: "Cancha Principal", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70", attendees: 24, status: "CONFIRMADO" },
    { id: 12, dayOfWeek: 5, time: "20:00", discipline: "Hockey", prof: "Prof. Luciana Aymar", room: "Cancha de Sintético", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/70", attendees: 19, status: "CONFIRMADO" },
    
    { id: 13, dayOfWeek: 6, time: "09:00", discipline: "Gimnasio", prof: "Prof. Marcos Ruiz", room: "Sala de Musculación", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70", attendees: 30, status: "ACTIVO" },
    { id: 14, dayOfWeek: 6, time: "11:00", discipline: "Fútbol", prof: "Prof. Carlos Tévez", room: "Cancha Principal", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70", attendees: 40, status: "CONFIRMADO" },
  ];

  // Calendar Date Navigation title
  const getCalendarTitle = () => {
    if (calendarView === 'day') {
      return currentDate.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (calendarView === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    }
  };

  const handleCalendarPrev = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (calendarView === 'day') d.setDate(prev.getDate() - 1);
      else if (calendarView === 'week') d.setDate(prev.getDate() - 7);
      else d.setMonth(prev.getMonth() - 1);
      return d;
    });
  };

  const handleCalendarNext = () => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (calendarView === 'day') d.setDate(prev.getDate() + 1);
      else if (calendarView === 'week') d.setDate(prev.getDate() + 7);
      else d.setMonth(prev.getMonth() + 1);
      return d;
    });
  };

  const handleCalendarToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2.5 shadow-2xl transition-all duration-300 text-white max-w-sm border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="text-xs font-bold uppercase tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              ERP Deportivo
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              Club Jorge Newbery
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
            👥 Centro de Socios
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Gestión unificada de socios, tutores legales, credenciales digitales y agenda de disciplinas.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 font-black text-[11px] uppercase shadow-sm transition-all active:scale-95"
            title="Refrescar padrón desde base de datos"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button
            onClick={triggerCreateSocio}
            className="bg-jn-red hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 font-black text-[11px] uppercase shadow-sm shadow-red-700/25 transition-all active:scale-95"
            title="Registrar nuevo socio (Alt + N)"
          >
            <Plus size={14} /> Registrar Socio
          </button>
        </div>
      </div>

      {/* DASHBOARD SUPERIOR (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {/* KPI: Total */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex items-center justify-between h-20">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Total de Socios</p>
            <h4 className="text-2xl font-black text-slate-900 leading-none mt-1">{totalSocios}</h4>
            <span className="text-[9px] text-emerald-600 font-black mt-1 block truncate">
              ▲ +{nuevosMes} este mes
            </span>
          </div>
          <div className="w-10 h-10 bg-red-50 text-jn-red rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <Users size={18} />
          </div>
        </div>

        {/* KPI: Activos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex items-center justify-between h-20">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Activos</p>
            <h4 className="text-2xl font-black text-emerald-600 leading-none mt-1">{activos}</h4>
            <span className="text-[9px] text-emerald-600 font-black mt-1 block truncate">
              🟢 Al día
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <UserCheck size={18} />
          </div>
        </div>

        {/* KPI: Morosos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex items-center justify-between h-20">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Morosos</p>
            <h4 className="text-2xl font-black text-amber-500 leading-none mt-1">{morosos}</h4>
            <span className="text-[9px] text-amber-600 font-black mt-1 block truncate">
              ▼ -3 este mes
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <Clock size={18} />
          </div>
        </div>

        {/* KPI: Suspendidos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex items-center justify-between h-20">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Suspendidos</p>
            <h4 className="text-2xl font-black text-red-600 leading-none mt-1">{suspendidos}</h4>
            <span className="text-[9px] text-red-500 font-black mt-1 block truncate">
              ▲ +1 este mes
            </span>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* KPI: Inactivos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex items-center justify-between h-20">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Inactivos</p>
            <h4 className="text-2xl font-black text-slate-500 leading-none mt-1">{inactivos}</h4>
            <span className="text-[9px] text-slate-400 font-black mt-1 block truncate">
              ▼ -2 este mes
            </span>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center shrink-0 shadow-inner">
            <UserX size={18} />
          </div>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="flex gap-4 border-b border-slate-200 mb-5 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
        {[
          { id: 'socios', label: '👥 Socios' },
          { id: 'tutores', label: '🛡️ Tutores' },
          { id: 'horarios', label: '📅 Horarios' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'socios') setSelectedSocio(null);
            }}
            className={`pb-2 px-1.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-jn-red text-jn-red font-black'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: SOCIOS */}
      {activeTab === 'socios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* TABLA DE SOCIOS (70% - 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* SEARCH, FILTERS AND EXPORT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm ring-1 ring-black/5">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                {/* Search */}
                <div className="min-w-[180px] border border-slate-200 rounded-lg px-2 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-500 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
                    title="Escribe para buscar. Atajo: Alt + B"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Column Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 font-bold text-[10px] uppercase flex items-center gap-1 shadow-2xs transition-colors"
                    title="Configurar columnas visibles"
                  >
                    <Filter size={11} /> Columnas
                  </button>
                  {showColumnDropdown && (
                    <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-20 font-bold text-[10px] text-slate-600 flex flex-col">
                      <p className="px-3 py-1 border-b text-slate-400 uppercase text-[8px]">Mostrar columnas</p>
                      {Object.keys(visibleColumns).map(col => (
                        <label key={col} className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={visibleColumns[col]}
                            onChange={() => toggleColumn(col)}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <span className="capitalize">{col === 'socioNumber' ? 'N° Socio' : col === 'ultimoPago' ? 'Último Pago' : col}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1 shadow-2xs transition-colors"
                  title="Exportar registros filtrados a CSV"
                >
                  <Download size={11} /> Exportar
                </button>
              </div>

              {/* QUICK PILLS FILTERS */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 border-slate-950 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todos ({totalSocios})
                </button>
                <button
                  onClick={() => { setStatusFilter('ACTIVO'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'ACTIVO'
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <span>🟢</span> Activo ({activos})
                </button>
                <button
                  onClick={() => { setStatusFilter('MOROSO'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'MOROSO'
                      ? 'bg-amber-500 border-amber-650 text-white'
                      : 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <span>🟡</span> Moroso ({morosos})
                </button>
                <button
                  onClick={() => { setStatusFilter('SUSPENDIDO'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'SUSPENDIDO'
                      ? 'bg-red-600 border-red-700 text-white'
                      : 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <span>🔴</span> Suspendido ({suspendidos})
                </button>
                <button
                  onClick={() => { setStatusFilter('INACTIVO'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'INACTIVO'
                      ? 'bg-slate-500 border-slate-600 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>⚪</span> Inactivo ({inactivos})
                </button>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 max-h-[500px] overflow-y-auto relative">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider select-none text-[10px]">
                  <tr>
                    {visibleColumns.foto && <th className="p-3 w-12 text-center">Foto</th>}
                    
                    {visibleColumns.socioNumber && (
                      <th onClick={() => handleSort('socioNumber')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          N° Socio
                          {sortField === 'socioNumber' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.nombre && (
                      <th onClick={() => handleSort('nombre')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Apellido y Nombre
                          {sortField === 'nombre' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.dni && (
                      <th onClick={() => handleSort('dni')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          DNI
                          {sortField === 'dni' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.category && (
                      <th onClick={() => handleSort('category')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Categoría
                          {sortField === 'category' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.estado && (
                      <th onClick={() => handleSort('estado')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Estado
                          {sortField === 'estado' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.ultimoPago && <th className="p-3">Último Pago</th>}
                    
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {loading ? (
                    // Skeleton Loading Rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse bg-slate-50/20">
                        {visibleColumns.foto && <td className="p-3"><div className="w-8 h-8 rounded-full bg-slate-200 mx-auto" /></td>}
                        {visibleColumns.socioNumber && <td className="p-3"><div className="h-3 w-12 bg-slate-200 rounded" /></td>}
                        {visibleColumns.nombre && <td className="p-3"><div className="h-3 w-28 bg-slate-200 rounded" /></td>}
                        {visibleColumns.dni && <td className="p-3"><div className="h-3 w-16 bg-slate-200 rounded font-mono" /></td>}
                        {visibleColumns.category && <td className="p-3"><div className="h-3 w-14 bg-slate-200 rounded" /></td>}
                        {visibleColumns.estado && <td className="p-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>}
                        {visibleColumns.ultimoPago && <td className="p-3"><div className="h-4 w-20 bg-slate-200 rounded" /></td>}
                        <td className="p-3 text-right"><div className="h-6 w-12 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : paginatedSocios.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400 text-xs py-14">
                        <Users size={32} className="mx-auto text-slate-300 mb-2" />
                        No se encontraron registros de socios.
                      </td>
                    </tr>
                  ) : paginatedSocios.map(s => {
                    const statusConfig = getUltimoPago(s);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => {
                          setSelectedSocio(s);
                          setRightPanelMode('detail');
                          setDetailSubTab('personal');
                        }}
                        className={`cursor-pointer transition-all hover:bg-slate-50/70 border-l-2 ${
                          selectedSocio?.id === s.id 
                            ? 'bg-red-50/20 border-l-jn-red font-bold' 
                            : 'border-l-transparent'
                        }`}
                      >
                        {/* Photo */}
                        {visibleColumns.foto && (
                          <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center bg-red-50 text-jn-red text-[11px] font-black mx-auto">
                              {s.foto ? (
                                <img src={s.foto} alt="Perfil" className="w-full h-full object-cover" />
                              ) : (
                                <span>{s.firstName[0]}{s.lastName[0]}</span>
                              )}
                            </div>
                          </td>
                        )}

                        {/* N° Socio */}
                        {visibleColumns.socioNumber && (
                          <td className="p-2 font-mono text-[11px] text-slate-900">{s.socioNumber}</td>
                        )}

                        {/* Nombre */}
                        {visibleColumns.nombre && (
                          <td className="p-2 font-bold text-slate-950">
                            {s.lastName}, {s.firstName}
                          </td>
                        )}

                        {/* DNI */}
                        {visibleColumns.dni && (
                          <td className="p-2 font-mono text-[11px] text-slate-500">{s.dni}</td>
                        )}

                        {/* Categoría */}
                        {visibleColumns.category && (
                          <td className="p-2 text-[11px] uppercase text-slate-600">{s.category}</td>
                        )}

                        {/* Estado Badge */}
                        {visibleColumns.estado && (
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black border uppercase ${
                              s.estado === 'ACTIVO' ? 'bg-green-50 border-green-200 text-green-700' :
                              s.estado === 'MOROSO' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              s.estado === 'SUSPENDIDO' ? 'bg-red-50 border-red-200 text-red-700' :
                                                          'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                              <span className="text-[6px]">
                                {s.estado === 'ACTIVO' ? '🟢' :
                                 s.estado === 'MOROSO' ? '🟡' :
                                 s.estado === 'SUSPENDIDO' ? '🔴' : '⚪'}
                              </span>
                              {s.estado}
                            </span>
                          </td>
                        )}

                        {/* Último Pago */}
                        {visibleColumns.ultimoPago && (
                          <td className="p-2">
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border font-bold ${statusConfig.style}`}>
                              {statusConfig.text}
                            </span>
                          </td>
                        )}

                        {/* Acciones */}
                        <td className="p-2 text-right flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => triggerEditSocio(s)}
                            className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-600 transition-colors"
                            title="Editar ficha del socio"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSocio(s.id)}
                            className="p-1 border border-red-100 text-red-600 hover:bg-red-50 rounded bg-white transition-colors"
                            title="Eliminar socio"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION AND REGISTERS QUANTITY SELECTOR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-700 focus:outline-none"
                >
                  {[10, 25, 50, 100].map(val => (
                    <option key={val} value={val}>{val} filas</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">
                  Mostrando {filteredSocios.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} a {Math.min(activePage * itemsPerPage, filteredSocios.length)} de {filteredSocios.length}
                </span>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                  title="Primera página"
                >
                  <ChevronLeft size={14} className="stroke-[3]" />
                </button>
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-3 text-slate-700">Pág {activePage} de {totalPages}</span>
                <button
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
                <button
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                  title="Última página"
                >
                  <ChevronRight size={14} className="stroke-[3]" />
                </button>
              </div>
            </div>

            {/* KEYBOARD SHORTCUTS LEGEND */}
            <div className="flex gap-4 text-[10px] text-slate-400 font-bold justify-end px-1">
              <span>Atajos:</span>
              <span><kbd className="bg-white border rounded px-1 shadow-2xs font-mono">Alt + N</kbd> Nuevo Socio</span>
              <span><kbd className="bg-white border rounded px-1 shadow-2xs font-mono">Alt + B</kbd> Buscar</span>
              <span><kbd className="bg-white border rounded px-1 shadow-2xs font-mono">ESC</kbd> Volver / Cerrar</span>
            </div>

          </div>

          {/* PANEL DERECHO DINÁMICO (30% - 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* ESTADO 1: FORMULARIO CREAR/EDITAR (INLINE) */}
            {rightPanelMode === 'form' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm ring-1 ring-black/5 space-y-4 animate-fade-in">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                    {socioModal.editId ? '📝 Editar Ficha Socio' : '➕ Crear Nuevo Socio'}
                  </h3>
                  <button 
                    onClick={() => {
                      setRightPanelMode(selectedSocio ? 'detail' : 'summary');
                      setSocioModal({ isOpen: false, editId: null });
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Cancelar"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveSocio} className="space-y-1.5 text-[9px] font-black text-slate-500 uppercase">
                  {/* Nombre / Apellido */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="mb-0.5 block">Nombre *</label>
                      <input
                        type="text" required
                        value={socioForm.nombre}
                        onChange={e => setSocioForm(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">Apellido *</label>
                      <input
                        type="text" required
                        value={socioForm.apellido}
                        onChange={e => setSocioForm(prev => ({ ...prev, apellido: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* DNI / Nacimiento / Sexo */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="mb-0.5 block">DNI *</label>
                      <input
                        type="text" required
                        value={socioForm.DNI}
                        onChange={e => setSocioForm(prev => ({ ...prev, DNI: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                        placeholder="Solo Nros"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">F. Nac. *</label>
                      <input
                        type="date" required
                        value={socioForm.fechaNacimiento}
                        onChange={e => setSocioForm(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">Sexo</label>
                      <select
                        value={socioForm.sexo}
                        onChange={e => setSocioForm(prev => ({ ...prev, sexo: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-0.5 py-0.5 text-xs bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        <option value="MASCULINO">MASC</option>
                        <option value="FEMENINO">FEM</option>
                        <option value="OTRO">OTRO</option>
                      </select>
                    </div>
                  </div>

                  {/* Email / Telefono */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className="mb-0.5 block">Email *</label>
                      <input
                        type="email" required
                        value={socioForm.email}
                        onChange={e => setSocioForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs lowercase font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">Teléfono</label>
                      <input
                        type="text"
                        value={socioForm.telefono}
                        onChange={e => setSocioForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dirección / Ciudad / CP */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="col-span-1">
                      <label className="mb-0.5 block">Dirección</label>
                      <input
                        type="text"
                        value={socioForm.direccion}
                        onChange={e => setSocioForm(prev => ({ ...prev, direccion: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">Ciudad</label>
                      <input
                        type="text"
                        value={socioForm.ciudad}
                        onChange={e => setSocioForm(prev => ({ ...prev, ciudad: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block">CP</label>
                      <input
                        type="text"
                        value={socioForm.codigoPostal}
                        onChange={e => setSocioForm(prev => ({ ...prev, codigoPostal: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-1 py-0.5 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Estado / Categoría / Tutor */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="mb-0.5 block">Estado</label>
                      <select
                        value={socioForm.estado}
                        onChange={e => setSocioForm(prev => ({ ...prev, estado: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-0.5 py-0.5 text-xs bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="MOROSO">MOROSO</option>
                        <option value="SUSPENDIDO">SUSPENDIDO</option>
                        <option value="INACTIVO">INACTIVO</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block">Categoría</label>
                      <select
                        value={socioForm.category}
                        onChange={e => setSocioForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-0.5 py-0.5 text-xs bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        <option value="ACTIVO">ACTIVO</option>
                        <option value="MENOR">MENOR</option>
                        <option value="CADETE">CADETE</option>
                        <option value="VITALICIO">VITALICIO</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-0.5 block">Tutor</label>
                      <select
                        value={socioForm.tutorId}
                        onChange={e => setSocioForm(prev => ({ ...prev, tutorId: e.target.value }))}
                        className="w-full border border-slate-200 rounded px-0.5 py-0.5 text-xs bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
                      >
                        <option value="">Ninguno</option>
                        {tutores.map(t => (
                          <option key={t.id} value={t.id}>{t.apellido}, {t.nombre[0]}.</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <label className="mb-0.5 block">Observaciones</label>
                    <textarea
                      value={socioForm.observaciones}
                      onChange={e => setSocioForm(prev => ({ ...prev, observaciones: e.target.value }))}
                      className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs h-7 resize-none font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Foto Upload */}
                  <div>
                    <label className="mb-0.5 block font-bold text-slate-500 uppercase">Foto Perfil</label>
                    <MediaUploadUniversal
                      value={socioForm.foto}
                      onChange={url => setSocioForm(prev => ({ ...prev, foto: url }))}
                      category="socios"
                      allowedTypes={['image']}
                      compact={true}
                    />
                  </div>

                  {/* Buttons horizontal */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setRightPanelMode(selectedSocio ? 'detail' : 'summary');
                        setSocioModal({ isOpen: false, editId: null });
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black uppercase py-1.5 rounded text-[9px] transition-colors border border-slate-200 active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black uppercase py-1.5 rounded text-[9px] transition-colors shadow-sm shadow-red-700/10 active:scale-95"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {rightPanelMode === 'detail' && selectedSocio && (
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm ring-1 ring-black/5 space-y-4 animate-fade-in">
                {/* Carnet Digital Premium Preview */}
                <div className="bg-gradient-to-br from-jn-red via-red-600 to-jn-darkred text-white p-4 rounded-xl shadow-md relative overflow-hidden flex flex-col justify-between h-48">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-8xl pointer-events-none select-none">JN</div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-white/95">Club J. Newbery</h4>
                      <p className="text-[8px] text-white/60 font-bold uppercase tracking-wider">Carnet Oficial de Socio</p>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedSocio.estado === 'ACTIVO' ? 'bg-white/20 text-white' : 'bg-black/40 text-red-100 border border-red-500/20'
                    }`}>
                      {selectedSocio.estado}
                    </span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow">
                      {selectedSocio.foto ? (
                        <img src={selectedSocio.foto} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black text-lg uppercase">{selectedSocio.firstName[0]}{selectedSocio.lastName[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="text-xs font-black truncate leading-tight uppercase tracking-wide">{selectedSocio.firstName} {selectedSocio.lastName}</h3>
                      <p className="text-[9px] text-white/80 font-mono">Nº {selectedSocio.socioNumber}</p>
                      <p className="text-[9px] text-white/80 font-mono">DNI: {selectedSocio.dni}</p>
                      <p className="text-[9px] text-white/70 uppercase font-black tracking-wider">Cat: {selectedSocio.category}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/10 pt-2 text-[8px] font-bold text-white/60">
                    <span>VENCE: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.expiresAt).toLocaleDateString('es-AR') : 'PENDIENTE'}</span>
                    {selectedSocio.digitalCard ? (
                      <button
                        onClick={() => setCardPreviewModal(true)}
                        className="bg-white text-jn-red px-2 py-0.5 rounded font-black uppercase hover:bg-white/90 text-[8px] transition-all shadow-xs"
                      >
                        Ver QR
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGenerateCard(selectedSocio.id)}
                        className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded font-black uppercase text-[8px] transition-all border border-white/10"
                      >
                        Generar QR
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub tabs in Ficha */}
                <div className="flex border-b text-[10px] font-black uppercase tracking-wider text-slate-400 gap-2 mb-2">
                  <button
                    onClick={() => setDetailSubTab('personal')}
                    className={`pb-1.5 px-0.5 border-b-2 transition-all ${detailSubTab === 'personal' ? 'border-jn-red text-jn-red font-black' : 'border-transparent hover:text-slate-600'}`}
                  >
                    Ficha
                  </button>
                  <button
                    onClick={() => setDetailSubTab('pagos')}
                    className={`pb-1.5 px-0.5 border-b-2 transition-all ${detailSubTab === 'pagos' ? 'border-jn-red text-jn-red font-black' : 'border-transparent hover:text-slate-600'}`}
                  >
                    Pagos
                  </button>
                  <button
                    onClick={() => setDetailSubTab('carnet')}
                    className={`pb-1.5 px-0.5 border-b-2 transition-all ${detailSubTab === 'carnet' ? 'border-jn-red text-jn-red font-black' : 'border-transparent hover:text-slate-600'}`}
                  >
                    Historial
                  </button>
                </div>

                {/* SUBTAB: PERSONAL */}
                {detailSubTab === 'personal' && (
                  <div className="space-y-3.5 text-left">
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-700">
                      <div>
                        <span className="text-slate-400 block font-black uppercase text-[8px]">DNI</span>
                        <span className="font-mono text-slate-900 font-bold">{selectedSocio.dni}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-black uppercase text-[8px]">F. Nacimiento</span>
                        <span className="font-mono text-slate-900">{selectedSocio.birthDate ? new Date(selectedSocio.birthDate).toLocaleDateString('es-AR') : 'N/A'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block font-black uppercase text-[8px]">Dirección</span>
                        <span className="text-slate-900">{selectedSocio.address || 'Sin dirección registrada'} {selectedSocio.ciudad && `, ${selectedSocio.ciudad}`}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-black uppercase text-[8px]">Teléfono</span>
                        <span className="font-mono text-slate-900">{selectedSocio.phone || 'Sin registro'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-black uppercase text-[8px]">Sexo / Género</span>
                        <span className="uppercase text-slate-900">{selectedSocio.sexo || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Tutor info */}
                    {selectedSocio.tutor ? (
                      <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-lg space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Shield size={10} className="text-jn-red" /> Tutor a cargo
                        </p>
                        <h4 className="font-bold text-[11px] text-slate-900">{selectedSocio.tutor.nombre} {selectedSocio.tutor.apellido} ({selectedSocio.tutor.parentesco})</h4>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-bold">
                          <span className="flex items-center gap-1 font-mono"><Phone size={10} /> {selectedSocio.tutor.telefono}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 border border-dashed border-slate-200 p-2 rounded-lg text-center text-[9px] text-slate-400 font-black uppercase tracking-wide">
                        Socio Mayor de Edad (Sin Tutor)
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB: PAGOS */}
                {detailSubTab === 'pagos' && (
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 border-b pb-1">
                      <span>Concepto</span>
                      <span>Estado</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between items-center p-1.5 rounded bg-slate-50 border">
                        <div>
                          <p className="font-bold text-slate-800">Cuota Social Julio 2026</p>
                          <span className="text-[9px] text-slate-400">Importe: $4.500</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 font-black uppercase rounded bg-green-50 border border-green-200 text-green-700">PAGADO</span>
                      </div>
                      <div className="flex justify-between items-center p-1.5 rounded bg-slate-50 border">
                        <div>
                          <p className="font-bold text-slate-800">Cuota Social Junio 2026</p>
                          <span className="text-[9px] text-slate-400">Importe: $4.500</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 font-black uppercase rounded border ${
                          selectedSocio.estado === 'MOROSO' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'
                        }`}>{selectedSocio.estado === 'MOROSO' ? 'MOROSO' : 'PAGADO'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB: HISTORIAL */}
                {detailSubTab === 'carnet' && (
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] uppercase text-slate-400 font-black tracking-wider border-b pb-1">Bitácora de movimientos</p>
                    <div className="space-y-1.5 text-[10px] text-slate-500 font-semibold leading-normal">
                      <div className="p-2 bg-slate-50 rounded border-l border-l-red-500 flex justify-between items-center">
                        <span>Alta de Socio en sistema</span>
                        <span className="font-mono text-[9px]">18/07/2026</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border-l border-l-blue-500 flex justify-between items-center">
                        <span>Credencial Digital QR activada</span>
                        <span className="font-mono text-[9px]">18/07/2026</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observations */}
                {selectedSocio.observaciones && (
                  <div className="bg-red-50/30 border border-red-100 p-2.5 rounded-lg space-y-0.5 text-left">
                    <span className="text-[8px] font-black text-jn-red uppercase block">Observaciones</span>
                    <p className="text-[11px] leading-relaxed text-slate-600 font-semibold">{selectedSocio.observaciones}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setRightPanelMode('summary')}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-black uppercase text-[10px] py-2 rounded-lg transition-colors text-center active:scale-95"
                  >
                    Deseleccionar
                  </button>
                  <button
                    onClick={() => triggerEditSocio(selectedSocio)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] py-2 rounded-lg transition-colors text-center shadow-xs active:scale-95"
                  >
                    Editar Ficha
                  </button>
                </div>
              </div>
            )}

            {/* ESTADO 3: RESUMEN GENERAL DEL SISTEMA (CUANDO NO HAY SELECCIÓN) */}
            {rightPanelMode === 'summary' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm ring-1 ring-black/5 space-y-5 animate-fade-in text-xs font-bold text-slate-700">
                <div>
                  <h3 className="font-black text-sm uppercase text-slate-900 border-b pb-1.5 flex items-center gap-1.5 text-left">
                    📊 Resumen de Padron
                  </h3>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
                    <div className="bg-slate-50 border p-2 rounded-lg text-center">
                      <span className="text-slate-400 block text-[9px] uppercase font-black">Padron Activo</span>
                      <span className="text-lg font-black text-green-600">{activos}</span>
                    </div>
                    <div className="bg-slate-50 border p-2 rounded-lg text-center">
                      <span className="text-slate-400 block text-[9px] uppercase font-black">Porcentaje Activo</span>
                      <span className="text-lg font-black text-slate-900">
                        {totalSocios > 0 ? ((activos / totalSocios) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Altas Recientes */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 text-left">
                    <UserPlus size={14} className="text-jn-red" /> Altas Recientes
                  </h4>
                  <div className="space-y-2">
                    {altasRecientes.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-2">No hay ingresos registrados recientemente.</p>
                    ) : altasRecientes.map(a => (
                      <div key={a.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100/50 border transition-all cursor-pointer text-left" onClick={() => { setSelectedSocio(a); setRightPanelMode('detail'); setDetailSubTab('personal'); }}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-100 text-jn-red font-black text-[9px] flex items-center justify-center">
                            {a.firstName[0]}{a.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-slate-800 leading-tight">{a.firstName} {a.lastName}</p>
                            <span className="text-[9px] text-slate-400">Nº {a.socioNumber}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(a.fechaAlta || a.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cumpleaños del Mes */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 text-left">
                    <Heart size={14} className="text-jn-red" /> Cumpleaños de Socios
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cumpleañosMes.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-4 text-center">No hay cumpleaños este mes.</p>
                    ) : cumpleañosMes.slice(0, 4).map(c => (
                      <div key={c.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border cursor-pointer hover:bg-slate-100/50 transition-all text-left" onClick={() => { setSelectedSocio(c); setRightPanelMode('detail'); setDetailSubTab('personal'); }}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-50 text-jn-red font-black text-[9px] flex items-center justify-center">
                            {c.firstName[0]}{c.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[11px] text-slate-800 leading-tight">{c.firstName} {c.lastName}</p>
                            <span className="text-[9px] text-slate-400">Nº {c.socioNumber}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-black text-jn-red">
                          {new Date(c.birthDate).getDate()} / {new Date(c.birthDate).getMonth() + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actividad Reciente */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase text-slate-850 flex items-center gap-1.5 text-left">
                    <Award size={14} className="text-jn-red" /> Actividad Reciente
                  </h4>
                  <div className="space-y-2 text-[10px] text-slate-500 font-medium">
                    <div className="p-2 bg-slate-50 rounded border-l-2 border-l-green-500 text-left">
                      <p className="text-slate-700 font-bold">Ingreso por Portería</p>
                      <p className="text-[9px]">Socio #1042 ingresó al Gimnasio a las 18:24 hs.</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border-l-2 border-l-blue-500 text-left">
                      <p className="text-slate-700 font-bold">Credencial Digital Generada</p>
                      <p className="text-[9px]">QR y Firma regenerada por la administración.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: TUTORES */}
      {activeTab === 'tutores' && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm ring-1 ring-black/5">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900">Listado de Tutores Legales</h3>
              <p className="text-xs text-slate-500">Responsables a cargo vinculados con socios menores de edad o cadetes.</p>
            </div>
            <button
              onClick={() => {
                setTutorForm({ nombre: '', apellido: '', DNI: '', telefono: '', email: '', parentesco: 'PADRE', contactoEmergencia: '' });
                setTutorModal({ isOpen: true, editId: null });
              }}
              className="bg-jn-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} /> Registrar Tutor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tutores.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-slate-400 text-xs py-14 col-span-3">
                <Shield size={32} className="mx-auto text-slate-300 mb-2" />
                Sin tutores registrados en el sistema.
              </div>
            ) : tutores.map(t => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition-shadow relative space-y-4 flex flex-col justify-between text-left">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-red-50 border border-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase">{t.parentesco}</span>
                      <h4 className="font-black text-sm text-slate-900 mt-1.5">{t.nombre} {t.apellido}</h4>
                      <p className="text-[10px] text-slate-400 font-mono font-bold">DNI: {t.DNI}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setTutorForm(t); setTutorModal({ isOpen: true, editId: t.id }); }} className="text-slate-400 hover:text-slate-955 p-1 border rounded hover:bg-slate-50" title="Editar tutor"><Edit size={12} /></button>
                      <button onClick={() => handleDeleteTutor(t.id)} className="text-red-500 hover:text-red-700 p-1 border border-red-50 rounded hover:bg-red-50" title="Eliminar tutor"><Trash2 size={12} /></button>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-600">
                    <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {t.telefono}</p>
                    <p className="flex items-center gap-1.5 truncate"><Mail size={12} className="text-slate-400 lowercase" /> {t.email}</p>
                    {t.contactoEmergencia && <p className="text-[10px] text-red-600 font-black flex items-center gap-1.5"><AlertCircle size={12} /> Emergencia: {t.contactoEmergencia}</p>}
                  </div>
                </div>

                <div className="bg-slate-50 -mx-4.5 -mb-4.5 p-3 rounded-b-xl border-t border-slate-150 text-[10px] font-black text-slate-400 uppercase">
                  Menores asociados: {t.socios?.length || 0}
                  {t.socios?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {t.socios.map(s => (
                        <span key={s.id} className="bg-white border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-800">{s.firstName} {s.lastName}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CALENDARIO DE HORARIOS */}
      {activeTab === 'horarios' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm ring-1 ring-black/5 space-y-4 animate-fade-in">
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCalendarPrev}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleCalendarToday}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-black uppercase transition-colors"
              >
                Hoy
              </button>
              <button 
                onClick={handleCalendarNext}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                title="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
              <h2 className="text-sm font-black uppercase text-slate-900 ml-2 tracking-wide font-mono">
                {getCalendarTitle()}
              </h2>
            </div>
            {/* View selectors */}
            <div className="flex border rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
              {['day', 'week', 'month'].map(view => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    calendarView === view
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW: WEEK VIEW */}
          {calendarView === 'week' && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse border border-slate-200 text-[10px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-2.5 border border-slate-200 w-16 text-center">Hora</th>
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => (
                      <th key={idx} className="p-2.5 border border-slate-200 text-center w-32">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((timeSlot, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/20">
                      <td className="p-2 border border-slate-200 font-mono text-center font-bold text-slate-400 bg-slate-50/30">
                        {timeSlot}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map(colDay => {
                        const cellActivities = mockActivities.filter(a => a.dayOfWeek === colDay && a.time === timeSlot);
                        return (
                          <td key={colDay} className="p-1 border border-slate-200 vertical-align-top h-20 min-h-[80px]">
                            {cellActivities.map(act => (
                              <div
                                key={act.id}
                                className={`p-1.5 rounded-lg border text-left flex flex-col justify-between h-full select-none transition-all shadow-2xs ${act.color}`}
                              >
                                <div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-black text-[10px] uppercase tracking-wide">{act.discipline}</span>
                                    <span className="text-[8px] font-bold">👥 {act.attendees}</span>
                                  </div>
                                  <p className="text-[8px] mt-0.5 opacity-90 truncate">{act.prof}</p>
                                  <p className="text-[8px] mt-0.5 font-bold tracking-tight truncate">{act.room}</p>
                                </div>
                                <div className="flex justify-between items-center mt-1 border-t border-black/5 pt-1 text-[8px] font-bold opacity-75">
                                  <span>{act.status}</span>
                                  <span className="font-mono">{act.time}</span>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: DAY VIEW */}
          {calendarView === 'day' && (
            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-[10px] uppercase text-slate-400 font-black tracking-wider">Actividades Programadas para la jornada</p>
              {/* Find activities matching current date weekday */}
              {(() => {
                const dayNum = currentDate.getDay() === 0 ? 7 : currentDate.getDay();
                const dayActivities = mockActivities.filter(a => a.dayOfWeek === dayNum);
                
                if (dayActivities.length === 0) {
                  return (
                    <div className="p-8 text-center border border-dashed rounded-xl text-slate-400 text-xs py-14 bg-slate-50/50">
                      <Calendar size={28} className="mx-auto mb-2 text-slate-300" />
                      No hay actividades programadas para este día de la semana.
                    </div>
                  );
                }
                
                return (
                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-2xs bg-slate-50/10">
                    {dayActivities.sort((a, b) => a.time.localeCompare(b.time)).map(act => (
                      <div key={act.id} className="p-3.5 hover:bg-slate-50 flex justify-between items-center transition-colors">
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded text-xs border">
                            {act.time} hs
                          </span>
                          <div>
                            <h4 className="font-black text-sm text-slate-950 uppercase tracking-wide">{act.discipline}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{act.prof}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{act.room}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <div className="flex gap-2">
                            <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {act.status}
                            </span>
                            <span className="text-[10px] font-black uppercase text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                              👥 {act.attendees} Asistentes
                            </span>
                          </div>
                          <span className={`inline-block w-3.5 h-3.5 rounded-full border shadow-inner ${act.color.split(' ')[0]}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: MONTH VIEW */}
          {calendarView === 'month' && (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-500 uppercase text-center bg-slate-50 py-2 border rounded border-slate-100">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => <div key={i}>{d}</div>)}
              </div>
              {(() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDayIndex = new Date(year, month, 1).getDay();
                const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
                const totalDays = new Date(year, month + 1, 0).getDate();
                
                const cells = [];
                for (let i = 0; i < adjustedFirstDay; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-16 bg-slate-50/20 border border-slate-100 text-slate-300 p-1 text-[9px] select-none" />);
                }
                
                for (let d = 1; d <= totalDays; d++) {
                  const dayDate = new Date(year, month, d);
                  const dayOfWeek = dayDate.getDay() === 0 ? 7 : dayDate.getDay();
                  const dayActivities = mockActivities.filter(a => a.dayOfWeek === dayOfWeek);
                  
                  cells.push(
                    <div 
                      key={`day-${d}`} 
                      onClick={() => {
                        setCurrentDate(dayDate);
                        setCalendarView('day');
                      }}
                      className="h-16 bg-white border border-slate-200 p-1 flex flex-col justify-between cursor-pointer hover:bg-slate-50 hover:border-slate-350 transition-all text-left"
                    >
                      <span className="font-mono font-bold text-slate-400">{d}</span>
                      <div className="flex flex-wrap gap-0.5 max-h-8 overflow-hidden">
                        {dayActivities.slice(0, 3).map(a => (
                          <span
                            key={a.id}
                            className={`w-1.5 h-1.5 rounded-full inline-block ${a.color.split(' ')[0]}`}
                            title={`${a.time} - ${a.discipline}`}
                          />
                        ))}
                        {dayActivities.length > 3 && (
                          <span className="text-[7px] font-black text-slate-400">+{dayActivities.length - 3}</span>
                        )}
                      </div>
                    </div>
                  );
                }
                
                return <div className="grid grid-cols-7 gap-1">{cells}</div>;
              })()}
            </div>
          )}
        </div>
      )}

      {/* MODAL REGISTRAR TUTOR */}
      {tutorModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {tutorModal.editId ? '🛡️ Editar Tutor Legal' : '🛡️ Registrar Tutor Legal'}
              </h3>
              <button onClick={() => setTutorModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Nombre *</label>
                  <input
                    type="text" required
                    value={tutorForm.nombre}
                    onChange={e => setTutorForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Apellido *</label>
                  <input
                    type="text" required
                    value={tutorForm.apellido}
                    onChange={e => setTutorForm(prev => ({ ...prev, apellido: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">DNI *</label>
                <input
                  type="text" required
                  value={tutorForm.DNI}
                  onChange={e => setTutorForm(prev => ({ ...prev, DNI: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Teléfono *</label>
                  <input
                    type="text" required
                    value={tutorForm.telefono}
                    onChange={e => setTutorForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Parentesco *</label>
                  <select
                    value={tutorForm.parentesco}
                    onChange={e => setTutorForm(prev => ({ ...prev, parentesco: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:ring-1 focus:ring-red-500 focus:outline-none"
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
                <label className="mb-0.5 block">Email *</label>
                <input
                  type="email" required
                  value={tutorForm.email}
                  onChange={e => setTutorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs lowercase font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={tutorForm.contactoEmergencia}
                  onChange={e => setTutorForm(prev => ({ ...prev, contactoEmergencia: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-red-500 focus:outline-none"
                  placeholder="Nombre y Tel. alternativo"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setTutorModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2.5 rounded-lg active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2.5 rounded-lg shadow-sm active:scale-95 transition-all"
                >
                  Guardar Tutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CARNET PREVIEW PREMIUM (PRINTABLE) */}
      {cardPreviewModal && selectedSocio && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-2xl max-w-sm w-full shadow-2xl p-5 relative border border-slate-800 animate-scale-in">
            <button
              onClick={() => setCardPreviewModal(false)}
              className="absolute top-4.5 right-4.5 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center w-full mb-4">
              <h3 className="font-black text-sm uppercase tracking-wider">Credencial de Socio</h3>
              <p className="text-[10px] text-white/50">Club Jorge Newbery Oficial</p>
            </div>

            {/* Printable Area Wrapper */}
            <div ref={cardRef} className="w-full">
              <div className="bg-jn-red text-white p-4.5 rounded-xl shadow-lg border border-white/10 flex flex-col justify-between h-72 w-full relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl pointer-events-none select-none">JN</div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-[11px] uppercase tracking-widest text-white/95">Club J. Newbery</h4>
                    <p className="text-[8px] text-white/60 font-bold uppercase tracking-wider">Carnet Oficial de Socio</p>
                  </div>
                  <span className="text-[8px] bg-white text-jn-red px-2.5 py-0.5 rounded font-black uppercase shadow-sm">
                    {selectedSocio.estado}
                  </span>
                </div>

                <div className="flex gap-4 items-center mt-2">
                  <div className="w-18 h-18 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow">
                    {selectedSocio.foto ? (
                      <img src={selectedSocio.foto} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-2xl uppercase">{selectedSocio.firstName[0]}{selectedSocio.lastName[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <h3 className="text-sm font-black truncate leading-tight uppercase tracking-wide">{selectedSocio.firstName} {selectedSocio.lastName}</h3>
                    <p className="text-[10px] text-white/85 font-mono">DNI: {selectedSocio.dni}</p>
                    <p className="text-[10px] text-white/85 font-mono">Socio Nº: {selectedSocio.socioNumber}</p>
                    <p className="text-[9px] text-white/80 uppercase font-black tracking-wide mt-0.5">Categoría: {selectedSocio.category}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-2 border-t border-white/10 pt-2.5">
                  <div className="text-[8px] font-bold text-white/60 text-left leading-normal">
                    <p>EMITIDO: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.issuedAt).toLocaleDateString('es-AR') : '-'}</p>
                    <p>VENCE: {selectedSocio.digitalCard ? new Date(selectedSocio.digitalCard.expiresAt).toLocaleDateString('es-AR') : '-'}</p>
                  </div>
                  {selectedSocio.digitalCard && (
                    <div className="bg-white p-1 rounded-lg shadow-sm shrink-0 border border-slate-100">
                      <QRCodeSVG id="qr-code-svg" value={selectedSocio.digitalCard.qrCode} size={55} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full border-t border-slate-800 pt-3 mt-4">
              <div className="flex gap-2">
                <button
                  onClick={downloadQR}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-slate-850 font-black uppercase text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Download size={11} /> Descargar QR
                </button>
                <button
                  onClick={printCard}
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black uppercase text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Printer size={11} /> Imprimir Carnet
                </button>
              </div>
              <button
                onClick={() => setCardPreviewModal(false)}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] py-1.5 rounded-lg transition-all"
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
