"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, AlertTriangle, Users,
  Calendar, Search, Filter, Plus, X, Check, Edit, Trash2, AlertCircle, FileText,
  Printer, Download, ChevronLeft, ChevronRight, Info, RefreshCw, ChevronUp, ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function GestionFinanzas() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data States
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [socios, setSocios] = useState([]);

  // Mock Expenses State (Persisted in localStorage, initialized inline to avoid set-state-in-effect)
  const [expenses, setExpenses] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedExpenses = localStorage.getItem('jn-expenses');
      if (savedExpenses) {
        try {
          return JSON.parse(savedExpenses);
        } catch {}
      }
    }
    return [
      { id: 'exp-1', concepto: 'Pago Luz Microestadio', importe: 12000, categoria: 'SERVICIOS', fecha: '2026-07-10' },
      { id: 'exp-2', concepto: 'Compra Pelotas Futsal', importe: 8500, categoria: 'EQUIPAMIENTO', fecha: '2026-07-12' },
      { id: 'exp-3', concepto: 'Honorarios Prof. Hockey', importe: 25000, categoria: 'HONORARIOS', fecha: '2026-07-15' }
    ];
  });
  const [startingBalance] = useState(55000); // Saldo Inicial default

  // Modals & Panels
  const [planModal, setPlanModal] = useState({ isOpen: false, editId: null });
  const [paymentModal, setPaymentModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);
  const [invoicePreviewModal, setInvoicePreviewModal] = useState(false);

  // Column Visibility States
  const [visibleColumns, setVisibleColumns] = useState({
    recibo: true,
    fecha: true,
    socio: true,
    categoria: true,
    concepto: true,
    periodo: true,
    importe: true,
    estado: true,
    formaPago: true
  });
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Sidebar detailed panel state
  const [rightPanelMode, setRightPanelMode] = useState('summary'); // 'summary', 'detail', 'form'
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Forms
  const [planForm, setPlanForm] = useState({
    nombre: '', tipo: 'SOCIO', importe: '', periodicidad: 'MENSUAL', moneda: 'ARS', activo: true
  });

  const [paymentForm, setPaymentForm] = useState({
    id: null, socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PENDIENTE', fechaPago: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    concepto: '', importe: '', categoria: 'SERVICIOS', fecha: ''
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('fecha');
  const [sortDirection, setSortDirection] = useState('desc');

  // Calendar States
  const [calendarView, setCalendarView] = useState('week'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  const receiptPrintRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`/api/finanzas/plans`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setPlans(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchPayments = useCallback(async () => {
    try {
      let url = `/api/finanzas/payments`;
      const params = [];
      if (statusFilter !== 'ALL' && statusFilter !== 'MERCADOPAGO' && statusFilter !== 'TRANSFERENCIA' && statusFilter !== 'EFECTIVO' && statusFilter !== 'TARJETA') {
        params.push(`estado=${statusFilter}`);
      }
      if (dateFilter) params.push(`fechaDesde=${dateFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setPayments(await res.json());
    } catch {}
  }, [statusFilter, dateFilter, checkAuthResponse]);

  const fetchSocios = useCallback(async () => {
    try {
      const res = await fetch(`/api/socios`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setSocios(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchPayments(), fetchSocios()]);
    setLoading(false);
  }, [fetchPlans, fetchPayments, fetchSocios]);

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

      // Save initial mock expenses to localStorage if not present
      if (typeof window !== 'undefined' && !localStorage.getItem('jn-expenses')) {
        localStorage.setItem('jn-expenses', JSON.stringify(expenses));
      }

      return () => clearTimeout(timer);
    }
  }, [statusFilter, dateFilter, fetchAll, showToast, expenses]);

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
        body: planForm
      });
      if (!checkAuthResponse(res)) return;
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
      if (!checkAuthResponse(res)) return;
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
        body: paymentForm
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast('Cobro registrado correctamente');
        setPaymentModal(false);
        setRightPanelMode('summary');
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
        body: { estado: newStatus }
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        const updated = await res.json();
        showToast(`Pago marcado como ${newStatus}`);
        if (selectedPayment?.id === id) {
          setSelectedPayment(updated);
        }
        fetchPayments();
      }
    } catch {}
  };

  const handleSaveExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      id: `exp-${Date.now()}`,
      concepto: expenseForm.concepto,
      importe: parseFloat(expenseForm.importe),
      categoria: expenseForm.categoria,
      fecha: expenseForm.fecha || new Date().toISOString().split('T')[0]
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem('jn-expenses', JSON.stringify(updatedExpenses));
    setExpenseModal(false);
    setExpenseForm({ concepto: '', importe: '', categoria: 'SERVICIOS', fecha: '' });
    showToast('Egreso registrado exitosamente');
  };

  const handleDeleteExpense = (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este egreso?')) return;
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('jn-expenses', JSON.stringify(updatedExpenses));
    showToast('Egreso eliminado');
  };

  // Export filtered payments to CSV
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      showToast("No hay registros para exportar", "error");
      return;
    }
    const headers = ["Recibo", "Fecha", "Socio", "DNI", "Concepto", "Importe", "Estado", "Metodo Pago", "Referencia"];
    const rows = filteredPayments.map(p => [
      p.invoices?.length > 0 ? p.invoices[0].id : `REC-${p.id}`,
      new Date(p.createdAt).toLocaleDateString('es-AR'),
      `"${p.socio?.firstName} ${p.socio?.lastName}"`,
      p.socio?.dni,
      `"${p.plan?.nombre || "Cuota Social Directa"}"`,
      p.importe,
      p.estado,
      p.metodoPago,
      p.referenciaPago || ""
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte-pagos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Reporte de pagos exportado a CSV");
  };

  const printReceipt = () => {
    const printContent = receiptPrintRef.current.innerHTML;
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Recibo Oficial de Pago - Club Jorge Newbery</title>
          <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="flex items-center justify-center p-8 bg-white">
          <div class="w-[800px] border p-8 rounded-xl shadow-lg">
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

  // Toggle Column Visibility
  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // Core calculations computed inline directly during render (prevents preserve-manual-memoization compiler warnings)
  const totalIngresos = payments
    .filter(p => p.estado === 'PAGADO')
    .reduce((acc, p) => acc + parseFloat(p.importe), 0);

  const totalEgresos = expenses.reduce((acc, e) => acc + e.importe, 0);

  const cajaDisponible = startingBalance + totalIngresos - totalEgresos;

  const totalCobradoCount = payments.filter(p => p.estado === 'PAGADO').length;
  const totalPendienteCount = payments.filter(p => p.estado === 'PENDIENTE').length;
  const totalMorosoCount = payments.filter(p => p.estado === 'PENDIENTE').length;
  
  const totalPendienteImporte = payments
    .filter(p => p.estado === 'PENDIENTE')
    .reduce((acc, p) => acc + parseFloat(p.importe), 0);

  const totalSocioAlDia = socios.filter(s => s.estado === 'ACTIVO').length;

  // Search & Filters computed inline
  const filteredPayments = (() => {
    let result = [...payments];

    // Method Filter
    if (methodFilter !== 'ALL') {
      result = result.filter(p => p.metodoPago === methodFilter);
    }

    // Status Filter (All/Pagados/Pendientes/Morosos)
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PAGADO') result = result.filter(p => p.estado === 'PAGADO');
      else if (statusFilter === 'PENDIENTE') result = result.filter(p => p.estado === 'PENDIENTE');
      else if (statusFilter === 'MOROSO') result = result.filter(p => p.estado === 'PENDIENTE');
      else if (statusFilter === 'MERCADOPAGO') result = result.filter(p => p.metodoPago === 'MERCADOPAGO');
      else if (statusFilter === 'TRANSFERENCIA') result = result.filter(p => p.metodoPago === 'TRANSFERENCIA');
      else if (statusFilter === 'EFECTIVO') result = result.filter(p => p.metodoPago === 'EFECTIVO');
      else if (statusFilter === 'TARJETA') result = result.filter(p => p.metodoPago === 'TARJETA');
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const fullName = `${p.socio?.firstName} ${p.socio?.lastName}`.toLowerCase();
        const socioNo = p.socio?.socioNumber?.toString() || '';
        const dni = p.socio?.dni || '';
        const receiptNo = p.invoices?.length > 0 ? p.invoices[0].id.toLowerCase() : `rec-${p.id}`;
        const planName = p.plan?.nombre?.toLowerCase() || '';
        return fullName.includes(q) || socioNo.includes(q) || dni.includes(q) || receiptNo.includes(q) || planName.includes(q);
      });
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'socio') {
          valA = `${a.socio?.lastName} ${a.socio?.firstName}`.toLowerCase();
          valB = `${b.socio?.lastName} ${b.socio?.firstName}`.toLowerCase();
        } else if (sortField === 'fecha') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  })();

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const activePage = currentPage > totalPages ? totalPages : (currentPage < 1 ? 1 : currentPage);
  const paginatedPayments = filteredPayments.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  // Recharts inline data
  const monthlyIncomesData = [
    { name: 'Feb', ingresos: totalIngresos * 0.7, egresos: totalEgresos * 0.6 },
    { name: 'Mar', ingresos: totalIngresos * 0.9, egresos: totalEgresos * 0.8 },
    { name: 'Abr', ingresos: totalIngresos * 0.8, egresos: totalEgresos * 0.7 },
    { name: 'May', ingresos: totalIngresos * 1.1, egresos: totalEgresos * 1.0 },
    { name: 'Jun', ingresos: totalIngresos * 0.95, egresos: totalEgresos * 0.85 },
    { name: 'Jul', ingresos: totalIngresos, egresos: totalEgresos }
  ];

  const disciplineData = [
    { name: 'Fútbol', value: 45 },
    { name: 'Gimnasio', value: 30 },
    { name: 'Hockey', value: 15 },
    { name: 'Futsal', value: 10 }
  ];
  const COLORS = ['#e11d48', '#2563eb', '#f59e0b', '#10b981'];

  const methodDistributionData = (() => {
    const mpCount = payments.filter(p => p.metodoPago === 'MERCADOPAGO').reduce((acc, p) => acc + parseFloat(p.importe), 0);
    const transCount = payments.filter(p => p.metodoPago === 'TRANSFERENCIA').reduce((acc, p) => acc + parseFloat(p.importe), 0);
    const cashCount = payments.filter(p => p.metodoPago === 'EFECTIVO').reduce((acc, p) => acc + parseFloat(p.importe), 0);
    const cardCount = payments.filter(p => p.metodoPago === 'TARJETA').reduce((acc, p) => acc + parseFloat(p.importe), 0);
    return [
      { name: 'MP', monto: mpCount || 1000 },
      { name: 'Trans', monto: transCount || 5000 },
      { name: 'Efectivo', monto: cashCount || 15000 },
      { name: 'Tarjeta', monto: cardCount || 2000 }
    ];
  })();

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              ERP Financiero
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              Club Jorge Newbery
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
            💰 Centro de Finanzas
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Control de ingresos, egresos, caja diaria, planes de cuotas, cobros directos y auditoría de morosidad.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 font-black text-[11px] uppercase shadow-sm transition-all active:scale-95"
            title="Sincronizar información financiera"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button
            onClick={() => {
              setPaymentForm({ id: null, socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PAGADO', fechaPago: new Date().toISOString().split('T')[0] });
              setPaymentModal(true);
            }}
            className="bg-jn-red hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-1.5 font-black text-[11px] uppercase shadow-sm shadow-red-700/25 transition-all active:scale-95"
            title="Registrar cobro manual (Alt + C)"
          >
            <Plus size={14} /> Registrar Cobro
          </button>
        </div>
      </div>

      {/* DASHBOARD ERP - KPIs COMPACTAS UNIFORMES */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {/* Recaudación del Mes */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Recaudado Mes</span>
            <span className="text-emerald-600 bg-emerald-50 rounded p-0.5"><DollarSign size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">${totalIngresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5">▲ +12% vs Jun</span>
          </div>
        </div>

        {/* Pagos Confirmados */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Pagos Conf.</span>
            <span className="text-emerald-600 bg-emerald-50 rounded p-0.5"><CheckCircle size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalCobradoCount}</h4>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5">🟢 Al día</span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Pendientes</span>
            <span className="text-amber-500 bg-amber-50 rounded p-0.5"><Clock size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalPendienteCount}</h4>
            <span className="text-[8px] text-amber-600 font-bold block mt-0.5">Importe: ${totalPendienteImporte.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        {/* Morosos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Morosos</span>
            <span className="text-red-500 bg-red-50 rounded p-0.5"><AlertTriangle size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-red-600 leading-tight">{totalMorosoCount}</h4>
            <span className="text-[8px] text-red-500 font-bold block mt-0.5">▼ -2% vs Jun</span>
          </div>
        </div>

        {/* Socios al Día */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Socios al Día</span>
            <span className="text-blue-500 bg-blue-50 rounded p-0.5"><Users size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalSocioAlDia}</h4>
            <span className="text-[8px] text-blue-600 font-bold block mt-0.5">👥 Activos</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Total Ingresos</span>
            <span className="text-green-600 bg-green-50 rounded p-0.5"><TrendingUp size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-emerald-600 leading-tight">+${totalIngresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5">📈 Entradas caja</span>
          </div>
        </div>

        {/* Egresos */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Total Egresos</span>
            <span className="text-red-500 bg-red-50 rounded p-0.5"><TrendingDown size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-red-600 leading-tight">-${totalEgresos.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[8px] text-red-500 font-bold block mt-0.5">📉 Salidas operativas</span>
          </div>
        </div>

        {/* Caja Disponible */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Caja Neto</span>
            <span className="text-slate-700 bg-slate-100 rounded p-0.5"><DollarSign size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">${cajaDisponible.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h4>
            <span className="text-[8px] text-slate-500 font-bold block mt-0.5">💵 Saldo Disponible</span>
          </div>
        </div>
      </div>

      {/* TABS MENU */}
      <div className="flex gap-4 border-b border-slate-200 mb-5 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
        {[
          { id: 'dashboard', label: '📊 Resumen General' },
          { id: 'caja', label: '💵 Caja Diaria' },
          { id: 'pagos', label: '💰 Pagos y Recibos' },
          { id: 'planes', label: '📋 Planes de Cuotas' },
          { id: 'calendario', label: '📅 Calendario Financiero' },
          { id: 'reportes', label: '📈 Reportes y Analíticas' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedPayment(null);
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

      {/* TAB CONTENT: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Gráfico de Ingresos/Egresos */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-4.5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 text-left">
              📊 Evolución de Flujo de Caja (Ingresos vs Egresos)
            </h3>
            <div className="h-64 text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyIncomesData}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#ef4444" fillOpacity={1} fill="url(#colorEgresos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Medios de Pago & Acciones Rápidas */}
          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 mb-3 text-left">
                💳 Distribución por Medio de Pago
              </h3>
              <div className="h-44 text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="monto" name="Recaudado ($)" fill="#e11d48" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t text-left">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mb-2">Acciones Rápidas</p>
              <button
                onClick={() => {
                  setPaymentForm({ id: null, socioId: '', planId: '', importe: '', metodoPago: 'EFECTIVO', estado: 'PAGADO', fechaPago: new Date().toISOString().split('T')[0] });
                  setPaymentModal(true);
                }}
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <DollarSign size={13} /> Cobro Directo en Secretaría
              </button>
              <button
                onClick={() => {
                  setExpenseForm({ concepto: '', importe: '', categoria: 'SERVICIOS', fecha: new Date().toISOString().split('T')[0] });
                  setExpenseModal(true);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase py-2.5 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <TrendingDown size={13} /> Registrar Gasto Operativo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAJA DIARIA */}
      {activeTab === 'caja' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Resumen Caja y Movimientos (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Box summary cards */}
            <div className="grid grid-cols-4 gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
              <div className="text-center border-r">
                <span className="text-[8px] text-slate-400 font-black uppercase block">Saldo Inicial</span>
                <span className="text-base font-black text-slate-950 font-mono">${startingBalance.toLocaleString('es-AR')}</span>
              </div>
              <div className="text-center border-r">
                <span className="text-[8px] text-emerald-600 font-black uppercase block">Ingresos (+)</span>
                <span className="text-base font-black text-emerald-600 font-mono">+${totalIngresos.toLocaleString('es-AR')}</span>
              </div>
              <div className="text-center border-r">
                <span className="text-[8px] text-red-500 font-black uppercase block">Egresos (-)</span>
                <span className="text-base font-black text-red-500 font-mono">-${totalEgresos.toLocaleString('es-AR')}</span>
              </div>
              <div className="text-center">
                <span className="text-[8px] text-slate-555 font-black uppercase block">Saldo Final</span>
                <span className="text-base font-black text-slate-900 font-mono">${cajaDisponible.toLocaleString('es-AR')}</span>
              </div>
            </div>

            {/* Combined Movements List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-black text-xs uppercase text-slate-800">Historial de Caja Diaria</h3>
                <button
                  onClick={() => {
                    setExpenseForm({ concepto: '', importe: '', categoria: 'SERVICIOS', fecha: new Date().toISOString().split('T')[0] });
                    setExpenseModal(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1 transition-colors"
                >
                  <Plus size={11} /> Nuevo Egreso
                </button>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Detalle / Concepto</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {/* Combine Payments (Incomes) and Expenses (Outflows) */}
                    {(() => {
                      const payMovs = payments
                        .filter(p => p.estado === 'PAGADO')
                        .map(p => ({
                          id: `pay-${p.id}`,
                          fecha: p.createdAt,
                          concepto: `${p.socio ? `${p.socio.lastName}, ${p.socio.firstName}` : "Cobro"} - ${p.plan?.nombre || "Cuota Social"}`,
                          categoria: p.plan?.tipo || 'CUOTA',
                          tipo: 'INGRESO',
                          monto: parseFloat(p.importe)
                        }));

                      const expMovs = expenses.map(e => ({
                        id: `exp-${e.id}`,
                        fecha: e.fecha,
                        concepto: e.concepto,
                        categoria: e.categoria,
                        tipo: 'EGRESO',
                        monto: e.importe
                      }));

                      const allMovs = [...payMovs, ...expMovs].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                      if (allMovs.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">No hay movimientos registrados hoy.</td>
                          </tr>
                        );
                      }

                      return allMovs.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono text-[10px] text-slate-555">{new Date(m.fecha).toLocaleDateString('es-AR')}</td>
                          <td className="p-2.5 font-bold text-slate-900">{m.concepto}</td>
                          <td className="p-2.5 text-[10px] uppercase text-slate-500">{m.categoria}</td>
                          <td className="p-2.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                              m.tipo === 'INGRESO' ? 'bg-green-50 border-green-150 text-green-700' : 'bg-red-50 border-red-150 text-red-700'
                            }`}>
                              {m.tipo}
                            </span>
                          </td>
                          <td className={`p-2.5 text-right font-mono font-bold ${m.tipo === 'INGRESO' ? 'text-green-700' : 'text-red-650'}`}>
                            {m.tipo === 'INGRESO' ? '+' : '-'}${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Resumen de Egresos Recientes (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4 text-left">
            <h3 className="font-black text-xs uppercase text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
              🔻 Egresos y Gastos Recientes
            </h3>
            <div className="space-y-2">
              {expenses.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4">No hay egresos cargados.</p>
              ) : expenses.slice(0, 4).map(e => (
                <div key={e.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border text-[11px] font-semibold">
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{e.concepto}</h4>
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">{e.categoria}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-red-655 font-bold">-${e.importe.toLocaleString('es-AR')}</p>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="text-[8px] font-black uppercase text-red-500 hover:text-red-700 mt-1 inline-block"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAGOS Y COMPROBANTES */}
      {activeTab === 'pagos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* TABLA DE TRANSACCIONES (70% - 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm animate-fade-in">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                {/* Search */}
                <div className="min-w-[180px] border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-500 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400" />
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar pago..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
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
                          <span className="capitalize">{col === 'formaPago' ? 'Forma de Pago' : col}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Download size={11} /> Exportar
                </button>
              </div>

              {/* QUICK PILLS FILTERS */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${
                    statusFilter === 'ALL' ? 'bg-slate-900 border-slate-950 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Todos ({payments.length})
                </button>
                <button
                  onClick={() => { setStatusFilter('PAGADO'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'PAGADO' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-750 hover:bg-emerald-100'
                  }`}
                >
                  <span>🟢</span> Pagados ({totalCobradoCount})
                </button>
                <button
                  onClick={() => { setStatusFilter('PENDIENTE'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 ${
                    statusFilter === 'PENDIENTE' ? 'bg-amber-500 border-amber-600 text-white' : 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <span>🟡</span> Pendientes ({totalPendienteCount})
                </button>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 max-h-[500px] overflow-y-auto relative">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider select-none text-[10px]">
                  <tr>
                    {visibleColumns.recibo && <th className="p-3">Recibo</th>}
                    
                    {visibleColumns.fecha && (
                      <th onClick={() => handleSort('fecha')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Fecha
                          {sortField === 'fecha' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.socio && (
                      <th onClick={() => handleSort('socio')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Socio
                          {sortField === 'socio' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.categoria && <th className="p-3">Categoría</th>}
                    {visibleColumns.concepto && <th className="p-3">Concepto</th>}
                    {visibleColumns.periodo && <th className="p-3">Período</th>}
                    
                    {visibleColumns.importe && (
                      <th onClick={() => handleSort('importe')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-0.5">
                          Importe
                          {sortField === 'importe' && (sortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                        </div>
                      </th>
                    )}
                    
                    {visibleColumns.estado && <th className="p-3">Estado</th>}
                    {visibleColumns.formaPago && <th className="p-3">Forma de Pago</th>}
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {loading ? (
                    // Skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse bg-slate-50/20">
                        {visibleColumns.recibo && <td className="p-3"><div className="h-3 w-16 bg-slate-200 rounded" /></td>}
                        {visibleColumns.fecha && <td className="p-3"><div className="h-3 w-14 bg-slate-200 rounded" /></td>}
                        {visibleColumns.socio && <td className="p-3"><div className="h-3 w-28 bg-slate-200 rounded" /></td>}
                        {visibleColumns.categoria && <td className="p-3"><div className="h-3 w-14 bg-slate-200 rounded" /></td>}
                        {visibleColumns.concepto && <td className="p-3"><div className="h-3 w-20 bg-slate-200 rounded" /></td>}
                        {visibleColumns.periodo && <td className="p-3"><div className="h-3 w-12 bg-slate-200 rounded" /></td>}
                        {visibleColumns.importe && <td className="p-3"><div className="h-3 w-14 bg-slate-200 rounded" /></td>}
                        {visibleColumns.estado && <td className="p-3"><div className="h-4 w-16 bg-slate-200 rounded" /></td>}
                        {visibleColumns.formaPago && <td className="p-3"><div className="h-3 w-16 bg-slate-200 rounded" /></td>}
                        <td className="p-3 text-right"><div className="h-6 w-12 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : paginatedPayments.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400 text-xs py-14">
                        No se encontraron cobros registrados.
                      </td>
                    </tr>
                  ) : paginatedPayments.map(p => {
                    const receiptNo = p.invoices?.length > 0 ? p.invoices[0].id : `REC-0${p.id}`;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setSelectedPayment(p);
                          setRightPanelMode('detail');
                        }}
                        className={`cursor-pointer transition-all hover:bg-slate-50/70 border-l-2 ${
                          selectedPayment?.id === p.id ? 'bg-red-50/20 border-l-jn-red font-bold' : 'border-l-transparent'
                        }`}
                      >
                        {visibleColumns.recibo && <td className="p-2.5 font-mono text-[10px] text-slate-800">{receiptNo}</td>}
                        {visibleColumns.fecha && <td className="p-2.5 font-mono text-[10px] text-slate-550">{new Date(p.createdAt).toLocaleDateString('es-AR')}</td>}
                        {visibleColumns.socio && (
                          <td className="p-2.5 font-bold text-slate-900 text-left">
                            {p.socio ? `${p.socio.lastName}, ${p.socio.firstName}` : "Cobro Directo"}
                          </td>
                        )}
                        {visibleColumns.categoria && <td className="p-2.5 text-[10px] uppercase text-slate-500">{p.socio?.category || 'N/A'}</td>}
                        {visibleColumns.concepto && <td className="p-2.5 text-[11px] text-slate-650 text-left">{p.plan?.nombre || "Cuota Social Directa"}</td>}
                        {visibleColumns.periodo && <td className="p-2.5 text-slate-500 font-mono text-[10px]">Jul 2026</td>}
                        {visibleColumns.importe && <td className="p-2.5 font-mono text-slate-900 font-bold">${parseFloat(p.importe).toFixed(0)}</td>}
                        {visibleColumns.estado && (
                          <td className="p-2.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black border uppercase ${
                              p.estado === 'PAGADO' ? 'bg-green-50 border-green-200 text-green-700' :
                              p.estado === 'PENDIENTE' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                          'bg-red-50 border-red-200 text-red-700'
                            }`}>
                              <span className="text-[6px]">{p.estado === 'PAGADO' ? '🟢' : '🟡'}</span>
                              {p.estado}
                            </span>
                          </td>
                        )}
                        {visibleColumns.formaPago && <td className="p-2.5 text-[10px] uppercase text-slate-555">{p.metodoPago}</td>}
                        <td className="p-2.5 text-right flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => { setSelectedPayment(p); setInvoicePreviewModal(true); }}
                            className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-600 transition-colors"
                            title="Ver Recibo PDF A4"
                          >
                            <FileText size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
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
                  Mostrando {filteredPayments.length > 0 ? (activePage - 1) * itemsPerPage + 1 : 0} a {Math.min(activePage * itemsPerPage, filteredPayments.length)} de {filteredPayments.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
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
                >
                  <ChevronRight size={14} className="stroke-[3]" />
                </button>
              </div>
            </div>

            {/* KEYBOARD SHORTCUTS LEGEND */}
            <div className="flex gap-4 text-[10px] text-slate-400 font-bold justify-end px-1">
              <span>Atajos:</span>
              <span><kbd className="bg-white border rounded px-1 font-mono">Alt + C</kbd> Registrar Cobro</span>
              <span><kbd className="bg-white border rounded px-1 font-mono">Alt + E</kbd> Registrar Egreso</span>
              <span><kbd className="bg-white border rounded px-1 font-mono">ESC</kbd> Volver / Cerrar</span>
            </div>

          </div>

          {/* DETALLES PAGO / RECIBO (30% - 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {rightPanelMode === 'detail' && selectedPayment && (
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-4 animate-fade-in text-left text-xs font-bold text-slate-700">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-black text-xs uppercase text-slate-900 flex items-center gap-1.5">
                    <Info size={14} className="text-jn-red" /> Detalle de Transacción
                  </h3>
                  <button onClick={() => { setRightPanelMode('summary'); setSelectedPayment(null); }} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>

                <div className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-jn-red font-black text-xs flex items-center justify-center">
                    {selectedPayment.socio ? `${selectedPayment.socio.firstName[0]}${selectedPayment.socio.lastName[0]}` : "C"}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 leading-tight">
                      {selectedPayment.socio ? `${selectedPayment.socio.firstName} ${selectedPayment.socio.lastName}` : "Cobro Directo"}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-mono">DNI: {selectedPayment.socio?.dni || "N/A"} | Socio: #{selectedPayment.socio?.socioNumber || "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                    <div>
                      <span className="text-slate-400 block font-black uppercase text-[8px]">Concepto</span>
                      <span className="text-slate-900">{selectedPayment.plan?.nombre || "Cuota Social General"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-black uppercase text-[8px]">Forma de Pago</span>
                      <span className="text-slate-900 uppercase font-mono">{selectedPayment.metodoPago}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-black uppercase text-[8px]">Período Facturado</span>
                      <span className="text-slate-900">Julio 2026</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-black uppercase text-[8px]">Nº Comprobante</span>
                      <span className="text-slate-900 font-mono">REC-0{selectedPayment.id}</span>
                    </div>
                    <div className="col-span-2 border-t pt-2 mt-1">
                      <span className="text-slate-400 block font-black uppercase text-[8px]">Importe Cobrado</span>
                      <span className="text-lg font-black text-jn-red font-mono">${parseFloat(selectedPayment.importe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {selectedPayment.estado === 'PENDIENTE' ? (
                    <button
                      onClick={() => handleUpdatePaymentStatus(selectedPayment.id, 'PAGADO')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-black uppercase text-[10px] transition-colors shadow-2xs"
                    >
                      Registrar Cobro Realizado
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg text-center text-[10px] text-emerald-800 flex items-center justify-center gap-1.5">
                      <CheckCircle size={14} /> Pago Confirmado e Ingresado a Caja
                    </div>
                  )}

                  {/* Operational actions inside side-panel */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center text-[9px] font-black uppercase">
                    <button
                      onClick={() => setInvoicePreviewModal(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md flex items-center justify-center gap-1 transition-all"
                    >
                      <FileText size={11} /> Ver A4 PDF
                    </button>
                    <a
                      href={`https://wa.me/${selectedPayment.socio?.phone}?text=Hola%20${selectedPayment.socio?.firstName},%20el%20Club%2520Jorge%2520Newbery%20informa%20que%20se%20ha%20registrado%20tu%20pago%20de%20$${selectedPayment.importe}.`}
                      target="_blank" rel="noopener noreferrer"
                      className="bg-emerald-650 hover:bg-emerald-700 text-white py-2 rounded-md flex items-center justify-center gap-1 transition-all"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            {rightPanelMode === 'summary' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs font-bold text-slate-700 text-left">
                <h3 className="font-black text-sm uppercase text-slate-900 border-b pb-1.5 flex items-center gap-1.5">
                  📊 Auditoría de Morosidad
                </h3>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-normal font-semibold">
                  <p className="font-black uppercase flex items-center gap-1"><AlertTriangle size={12} /> Alerta de Cartera Pendiente</p>
                  <p className="mt-1">Se detectaron **{totalPendienteCount} cuotas pendientes** equivalentes a un total estimado de **${totalPendienteImporte.toLocaleString('es-AR')}** en cartera activa.</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase text-slate-850">Socios Morosos Recientes</h4>
                  <div className="space-y-2">
                    {payments.filter(p => p.estado === 'PENDIENTE').slice(0, 3).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border text-[11px] transition-all cursor-pointer text-left" onClick={() => { setSelectedPayment(p); setRightPanelMode('detail'); }}>
                        <div>
                          <p className="font-bold text-slate-900">{p.socio?.lastName}, {p.socio?.firstName}</p>
                          <span className="text-[9px] text-slate-400 font-mono">DNI: {p.socio?.dni}</span>
                        </div>
                        <span className="text-red-655 font-bold font-mono">${parseFloat(p.importe).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB CONTENT: PLANES DE CUOTAS */}
      {activeTab === 'planes' && (
        <div className="space-y-5 animate-fade-in text-left">
          <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900">Planes y Conceptos de Cuotas</h3>
              <p className="text-xs text-slate-500 font-semibold">Configuración de montos y periodicidad de cuotas sociales y matrículas.</p>
            </div>
            <button
              onClick={() => {
                setPlanForm({ nombre: '', tipo: 'SOCIO', importe: '', periodicidad: 'MENSUAL', moneda: 'ARS', activo: true });
                setPlanModal({ isOpen: true, editId: null });
              }}
              className="bg-jn-red hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} /> Registrar Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-slate-400 text-xs py-14 col-span-3">
                <Info size={32} className="mx-auto text-slate-300 mb-2" />
                Sin planes configurados en el sistema.
              </div>
            ) : plans.map(p => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm hover:shadow-md transition-shadow relative space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-red-50 border border-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase">{p.tipo}</span>
                      <h4 className="font-black text-sm text-slate-900 mt-1.5">{p.nombre}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{p.periodicidad}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setPlanForm(p); setPlanModal({ isOpen: true, editId: p.id }); }} className="text-slate-400 hover:text-slate-955 p-1 border rounded hover:bg-slate-50" title="Editar plan"><Edit size={12} /></button>
                      <button onClick={() => handleDeletePlan(p.id)} className="text-red-500 hover:text-red-700 p-1 border border-red-50 rounded hover:bg-red-50" title="Eliminar plan"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 -mx-4.5 -mb-4.5 p-3 rounded-b-xl border-t border-slate-150 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] text-slate-400 block font-bold uppercase">Importe cuota</span>
                    <span className="text-sm font-black text-jn-red font-mono">${parseFloat(p.importe).toFixed(2)}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${p.activo ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>{p.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CALENDARIO FINANCIERO */}
      {activeTab === 'calendario' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button onClick={handleCalendarPrev} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><ChevronLeft size={16} /></button>
              <button onClick={handleCalendarToday} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-black uppercase transition-colors">Hoy</button>
              <button onClick={handleCalendarNext} className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><ChevronRight size={16} /></button>
              <h2 className="text-sm font-black uppercase text-slate-900 ml-2 tracking-wide font-mono">{getCalendarTitle()}</h2>
            </div>
            <div className="flex border rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
              {['day', 'week', 'month'].map(view => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                    calendarView === view ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {view === 'day' ? 'Día' : view === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>

          {/* Month calendar representation */}
          {calendarView === 'month' && (
            <div className="space-y-4 text-left">
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
                  cells.push(<div key={`empty-${i}`} className="h-16 bg-slate-50/20 border border-slate-100 text-slate-350 p-1 text-[9px] select-none" />);
                }
                
                for (let d = 1; d <= totalDays; d++) {
                  const dayDate = new Date(year, month, d);
                  // Check if there are payments or egresos on this day
                  const hasPayments = payments.some(p => new Date(p.createdAt).getDate() === d && new Date(p.createdAt).getMonth() === month && p.estado === 'PAGADO');
                  const hasExpenses = expenses.some(e => new Date(e.fecha).getDate() === d && new Date(e.fecha).getMonth() === month);

                  cells.push(
                    <div 
                      key={`day-${d}`} 
                      className="h-16 bg-white border border-slate-200 p-1 flex flex-col justify-between hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                      <span className="font-mono font-bold text-slate-400">{d}</span>
                      <div className="flex flex-col gap-0.5">
                        {hasPayments && <span className="bg-emerald-600 text-white rounded text-[7px] font-black px-1 py-0.2">+$ Cobrado</span>}
                        {hasExpenses && <span className="bg-red-500 text-white rounded text-[7px] font-black px-1 py-0.2">-$ Gasto</span>}
                      </div>
                    </div>
                  );
                }
                
                return <div className="grid grid-cols-7 gap-1">{cells}</div>;
              })()}
            </div>
          )}

          {calendarView !== 'month' && (
            <div className="p-8 text-center text-slate-400 text-xs py-14">
              <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
              Vista disponible en mes.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: REPORTES */}
      {activeTab === 'reportes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Report 1: Morosidad */}
          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-sm space-y-4 text-left">
            <h3 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 border-b pb-2">
              ⚠️ Informe de Morosidad
            </h3>
            <div className="flex gap-4 items-center">
              <div className="h-36 w-36 shrink-0 text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Al día', value: totalSocioAlDia }, { name: 'Morosos', value: totalMorosoCount }]} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={3} dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-[11px] font-semibold text-slate-600 w-full">
                <div className="flex justify-between items-center bg-slate-50 border p-2 rounded">
                  <span>Socios Al Día</span>
                  <span className="font-black text-emerald-650">{totalSocioAlDia}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 border p-2 rounded">
                  <span>Socios Morosos</span>
                  <span className="font-black text-red-650">{totalMorosoCount}</span>
                </div>
                <p className="text-[10px] text-slate-400">La tasa de morosidad actual en secretaría es de **{((totalMorosoCount / (totalSocioAlDia + totalMorosoCount || 1)) * 100).toFixed(0)}%**.</p>
              </div>
            </div>
          </div>

          {/* Report 2: Disciplinas */}
          <div className="bg-white border border-slate-200 p-4.5 rounded-xl shadow-sm space-y-4 text-left">
            <h3 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1.5 border-b pb-2">
              🏆 Ingresos Estimados por Disciplina
            </h3>
            <div className="flex gap-4 items-center">
              <div className="h-36 w-36 shrink-0 text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={disciplineData} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                      {disciplineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-[11px] w-full font-semibold">
                {disciplineData.map((d, idx) => (
                  <div key={d.name} className="flex justify-between items-center p-1 border-b">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} /> {d.name}</span>
                    <span className="font-bold">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR COBRO (EFECTIVO/TRANS/TARJETA) */}
      {paymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                💰 Registrar Cobro Manual
              </h3>
              <button onClick={() => setPaymentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-3 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Socio legal *</label>
                <select
                  required
                  value={paymentForm.socioId}
                  onChange={e => setPaymentForm(prev => ({ ...prev, socioId: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Seleccione...</option>
                  {socios.map(s => <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} (DNI: {s.dni})</option>)}
                </select>
              </div>

              <div>
                <label className="mb-0.5 block">Plan o Concepto *</label>
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
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Seleccione...</option>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.nombre} (${parseFloat(p.importe).toFixed(0)})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Monto total *</label>
                  <input
                    type="number" step="0.01" required
                    value={paymentForm.importe}
                    onChange={e => setPaymentForm(prev => ({ ...prev, importe: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Método</label>
                  <select
                    value={paymentForm.metodoPago}
                    onChange={e => setPaymentForm(prev => ({ ...prev, metodoPago: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="EFECTIVO">EFECTIVO</option>
                    <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    <option value="TARJETA">TARJETA</option>
                    <option value="MERCADOPAGO">MERCADO PAGO</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setPaymentModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-2 rounded text-[10px] active:scale-95 transition-all border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Ingresar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR GASTO / EGRESO */}
      {expenseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                🔻 Registrar Egreso Operativo
              </h3>
              <button onClick={() => setExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Concepto / Detalle *</label>
                <input
                  type="text" required
                  value={expenseForm.concepto}
                  onChange={e => setExpenseForm(prev => ({ ...prev, concepto: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ej. Artículos de limpieza"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Importe *</label>
                  <input
                    type="number" step="0.1" required
                    value={expenseForm.importe}
                    onChange={e => setExpenseForm(prev => ({ ...prev, importe: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Categoría</label>
                  <select
                    value={expenseForm.categoria}
                    onChange={e => setExpenseForm(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="SERVICIOS">SERVICIOS</option>
                    <option value="HONORARIOS">HONORARIOS</option>
                    <option value="EQUIPAMIENTO">EQUIPAMIENTO</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">Fecha de Caja</label>
                <input
                  type="date"
                  value={expenseForm.fecha}
                  onChange={e => setExpenseForm(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setExpenseModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-2 rounded text-[10px] active:scale-95 transition-all border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Registrar Egreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLANES FORM (CREAR/EDITAR PLAN DE CUOTA) */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {planModal.editId ? '📝 Editar Plan' : '➕ Registrar Plan de Cuota'}
              </h3>
              <button onClick={() => setPlanModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre del Plan *</label>
                <input
                  type="text" required
                  value={planForm.nombre}
                  onChange={e => setPlanForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Tipo</label>
                  <select
                    value={planForm.tipo}
                    onChange={e => setPlanForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="SOCIO">SOCIO</option>
                    <option value="DEPORTIVO">DEPORTIVO</option>
                    <option value="FAMILIAR">FAMILIAR</option>
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block">Periodicidad</label>
                  <select
                    value={planForm.periodicidad}
                    onChange={e => setPlanForm(prev => ({ ...prev, periodicidad: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="MENSUAL">MENSUAL</option>
                    <option value="ANUAL">ANUAL</option>
                    <option value="UNICO">UNICO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Importe *</label>
                  <input
                    type="number" step="0.01" required
                    value={planForm.importe}
                    onChange={e => setPlanForm(prev => ({ ...prev, importe: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Moneda</label>
                  <input
                    type="text" readOnly
                    value={planForm.moneda}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-slate-100 font-mono text-center focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setPlanModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW RECIBO PREMIUM A4 */}
      {invoicePreviewModal && selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-2xl max-w-2xl w-full shadow-2xl p-5 border border-slate-800 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5 mb-3">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-300">Recibo Oficial Premium A4</h3>
              <button onClick={() => setInvoicePreviewModal(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Printable content wrapper */}
            <div className="max-h-[500px] overflow-y-auto bg-white text-slate-800 p-6 rounded-lg border border-slate-200" ref={receiptPrintRef}>
              <div className="space-y-6 text-xs text-left">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black uppercase text-jn-red tracking-tight">Club Jorge Newbery</h2>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-wide mt-0.5">Asociación Civil y Deportiva</p>
                    <p className="text-[9px] text-slate-500 font-semibold leading-relaxed mt-1">
                      Calle Italia 450, Rufino, Santa Fe<br/>
                      CUIT: 30-58472394-8
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-200 border-2 border-slate-200 px-3 py-1 rounded-md">X</span>
                    <p className="font-mono font-bold mt-2 text-slate-900">RECIBO Nº REC-0{selectedPayment.id}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Fecha: {new Date(selectedPayment.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>
                </div>

                {/* Partner and receipt info */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-[8px] text-slate-400 font-black uppercase block">Detalles del Socio</span>
                    <p className="font-black text-sm text-slate-900 mt-1">{selectedPayment.socio ? `${selectedPayment.socio.lastName}, ${selectedPayment.socio.firstName}` : "Cobro Directo"}</p>
                    <p className="font-mono text-slate-500 leading-normal mt-0.5">
                      DNI: {selectedPayment.socio?.dni || "N/A"}<br/>
                      Socio N°: #{selectedPayment.socio?.socioNumber || "N/A"}<br/>
                      Categoría: {selectedPayment.socio?.category || 'ACTIVO'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 font-black uppercase block">Detalles del Pago</span>
                    <p className="font-semibold text-slate-800 mt-1">Método: <span className="font-mono uppercase font-bold">{selectedPayment.metodoPago}</span></p>
                    <p className="font-semibold text-slate-800">Concepto: <span className="font-bold">{selectedPayment.plan?.nombre || "Cuota Social Directa"}</span></p>
                    <p className="font-semibold text-slate-800">Período: <span className="font-bold">Julio 2026</span></p>
                  </div>
                </div>

                {/* Items and total table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-[8px] text-slate-400 font-black uppercase tracking-wider">
                      <th className="p-2">Descripción / Plan</th>
                      <th className="p-2 text-center">Período</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b font-semibold">
                      <td className="p-2">{selectedPayment.plan?.nombre || "Cuota Social Directa"}</td>
                      <td className="p-2 text-center">Julio 2026</td>
                      <td className="p-2 text-right font-mono">${parseFloat(selectedPayment.importe).toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold text-slate-900">
                      <td colSpan="2" className="p-2 text-right text-[10px] font-black uppercase text-slate-400">Total Recaudado</td>
                      <td className="p-2 text-right text-base font-black text-jn-red font-mono">${parseFloat(selectedPayment.importe).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* QR and digital signature footer */}
                <div className="flex justify-between items-end border-t pt-5 mt-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-2">Comprobante oficial homologado</p>
                    <div className="bg-white p-1 rounded border shadow-2xs w-20 h-20 flex items-center justify-center">
                      <QRCodeSVG id="invoice-qr" value={`https://clubnewbery.digital/invoice/verify/${selectedPayment.id}`} size={70} />
                    </div>
                  </div>
                  <div className="text-center font-semibold text-slate-400 w-44">
                    <div className="border-b border-dashed border-slate-300 h-10 mb-1 flex items-end justify-center font-mono text-[9px] text-slate-500">Club Jorge Newbery Digital</div>
                    <span className="text-[8px] font-black uppercase tracking-wider block">Firma autorizada secretaría</span>
                  </div>
                </div>

                <div className="text-center text-[8px] text-slate-400 font-black uppercase tracking-wide border-t pt-2 mt-4 leading-normal">
                  ¡Gracias por mantener al día tu cuota y apoyar el crecimiento institucional del club!
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={printReceipt}
                className="flex-1 bg-jn-red hover:bg-red-700 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Printer size={12} /> Imprimir Comprobante
              </button>
              <button
                onClick={() => setInvoicePreviewModal(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-black uppercase text-[10px] transition-colors border border-slate-800 active:scale-95"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
