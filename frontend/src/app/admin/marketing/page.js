"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TrendingUp, CreditCard, AlertTriangle, Plus, Search, Filter, 
  Calendar, Check, X, RefreshCw, Printer, Download, DollarSign, 
  Users, Trash, Edit, AlertCircle, FileText, Upload, Image as ImageIcon, 
  Tv, Eye, MousePointer, ShieldAlert, Globe, MessageCircle, Sliders, Play, Settings,
  FileSpreadsheet
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

const fetch = apiFetch;

export default function MarketingAdmin() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Data States
  const [sponsors, setSponsors] = useState([]);
  const [banners, setBanners] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [stats, setStats] = useState({
    totalSponsors: 0, activeSponsors: 0,
    totalBanners: 0, activeBanners: 0,
    totalCampaigns: 0, activeCampaigns: 0,
    scheduledBanners: 0, totalClicks: 0, totalViews: 0,
    ctr: 0.0, earnings: 0,
    clicksByDay: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 }
  });
  const [socialPosts, setSocialPosts] = useState([]);
  const [socialConfigs, setSocialConfigs] = useState([]);

  // Filter States
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [fileFilterCategory, setFileFilterCategory] = useState('ALL');

  // Modals States
  const [sponsorModal, setSponsorModal] = useState({ isOpen: false, editId: null });
  const [campaignModal, setCampaignModal] = useState({ isOpen: false, editId: null });
  const [contractModal, setContractModal] = useState({ isOpen: false, sponsorId: null });
  const [bannerEditorModal, setBannerEditorModal] = useState(false);
  const [bannerFormModal, setBannerFormModal] = useState({ isOpen: false, editId: null });

  // Forms States
  const [sponsorForm, setSponsorForm] = useState({
    name: '', logoUrl: '', imageUrl: '', description: '', website: '', 
    phone: '', email: '', whatsapp: '', instagram: '', facebook: '', 
    category: 'GENERAL', isActive: true, order: 0, address: '', 
    contractStartDate: '', contractEndDate: '', status: 'activo',
    contacto: '', monto: '', observaciones: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    title: '', imageUrl: '', videoUrl: '', linkUrl: '', description: '', 
    locations: [], startDate: '', endDate: '', priority: 0, status: 'ACTIVE', 
    maxViews: 100000, sponsorId: ''
  });

  const [bannerForm, setBannerForm] = useState({
    title: '', imageUrl: '', linkUrl: '', locations: ['home'], 
    startDate: '', endDate: '', isActive: true, rotationSpeed: 5,
    rotation: 'AUTOMATIC'
  });

  const [contractForm, setContractForm] = useState({
    startDate: '', endDate: '', amount: '', notes: ''
  });

  // Social Planner Form
  const [socialForm, setSocialForm] = useState({
    platform: 'instagram', content: '', scheduledFor: '', mediaUrl: ''
  });

  // Drag & drop files upload
  const [dragActive, setDragActive] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('sponsors');
  const fileInputRef = useRef(null);

  // Canvas Banner Editor State
  const canvasRef = useRef(null);
  const [canvasFormat, setCanvasFormat] = useState('horizontal'); // principal, horizontal, cuadrado, redes
  const [editorText, setEditorText] = useState('¡DESCUENTO EXCLUSIVO SOCIOS!');
  const [editorTextColor, setEditorTextColor] = useState('#ffffff');
  const [editorTextSize, setEditorTextSize] = useState(28);
  const [editorBgColor, setEditorBgColor] = useState('#cc0000');
  const [editorBtnText, setEditorBtnText] = useState('ASÓCIATE AQUÍ');
  const [editorBtnColor, setEditorBtnColor] = useState('#000000');
  const [editorLogoUrl, setEditorLogoUrl] = useState('');
  const [editorBgUrl, setEditorBgUrl] = useState('');
  const [editorTextX, setEditorTextX] = useState(150);
  const [editorTextY, setEditorTextY] = useState(120);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // parse string helper
  const parseLocations = (locations) => {
    try {
      if (typeof locations === 'string') return JSON.parse(locations);
      if (Array.isArray(locations)) return locations;
      return [];
    } catch {
      return [];
    }
  };

  // CORREGIDO: Todas las llamadas API apuntan bajo el prefijo correcto `/api/publicidad`
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [resSponsors, resBanners, resCampaigns, resMedia, resStats, resSocial, resSocialConf] = await Promise.all([
        fetch('/api/publicidad/sponsors').then(r => r.ok ? r.json() : []),
        fetch('/api/publicidad/banners').then(r => r.ok ? r.json() : []),
        fetch('/api/publicidad/campaigns').then(r => r.ok ? r.json() : []),
        fetch('/api/publicidad/media-files').then(r => r.ok ? r.json() : []),
        fetch('/api/publicidad/statistics').then(r => r.ok ? r.json() : null),
        fetch('/api/publicidad/social-posts').then(r => r.ok ? r.json() : []),
        fetch('/api/publicidad/social').then(r => r.ok ? r.json() : [])
      ]);

      setSponsors(resSponsors);
      setBanners(resBanners);
      setCampaigns(resCampaigns);
      setMediaFiles(resMedia);
      if (resStats) setStats(resStats);
      setSocialPosts(resSocial);
      setSocialConfigs(resSocialConf);
    } catch (e) {
      console.error(e);
      showToast('Error al conectar con las APIs de marketing', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadAllData();
  }, [loadAllData]);

  // REDRAW CANVAS ON EDITOR STATE CHANGES
  useEffect(() => {
    if (!bannerEditorModal || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const formats = {
      principal: { w: 1920, h: 600 },
      horizontal: { w: 1200, h: 300 },
      cuadrado: { w: 1080, h: 1080 },
      redes: { w: 1080, h: 1920 }
    };
    const size = formats[canvasFormat] || formats.horizontal;
    canvas.width = size.w;
    canvas.height = size.h;

    // Draw background
    ctx.fillStyle = editorBgColor;
    ctx.fillRect(0, 0, size.w, size.h);

    const drawContent = () => {
      // Draw Text
      ctx.fillStyle = editorTextColor;
      ctx.font = `black ${editorTextSize * 2.2}px Inter, sans-serif`;
      ctx.fillText(editorText, editorTextX * 1.8, editorTextY * 1.8);

      // Draw Button mockup
      if (editorBtnText) {
        const btnW = 320;
        const btnH = 80;
        const btnX = size.w / 2 - btnW / 2;
        const btnY = size.h - 130;
        ctx.fillStyle = editorBtnColor;
        ctx.fillRect(btnX, btnY, btnW, btnH);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(editorBtnText, btnX + btnW / 2, btnY + 48);
      }
    };

    if (editorBgUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = editorBgUrl;
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, size.w, size.h);
        drawContent();
      };
    } else {
      drawContent();
    }
  }, [bannerEditorModal, canvasFormat, editorText, editorTextColor, editorTextSize, editorBgColor, editorBtnText, editorBtnColor, editorBgUrl, editorTextX, editorTextY]);

  // ─── SPONSORS HANDLERS ──────────────────────────────────────────────────────

  const handleOpenSponsorModal = (id = null) => {
    if (id) {
      const sp = sponsors.find(s => s.id === id);
      setSponsorForm({
        name: sp.name || '',
        logoUrl: sp.logoUrl || '',
        imageUrl: sp.imageUrl || '',
        description: sp.description || '',
        website: sp.website || '',
        phone: sp.phone || '',
        email: sp.email || '',
        whatsapp: sp.whatsapp || '',
        instagram: sp.instagram || '',
        facebook: sp.facebook || '',
        category: sp.category || 'GENERAL',
        isActive: sp.isActive !== undefined ? sp.isActive : true,
        order: sp.order || 0,
        address: sp.address || '',
        contractStartDate: sp.contractStartDate ? sp.contractStartDate.split('T')[0] : '',
        contractEndDate: sp.contractEndDate ? sp.contractEndDate.split('T')[0] : '',
        status: sp.status || 'activo',
        contacto: sp.contacto || '',
        monto: sp.monto || '',
        observaciones: sp.observaciones || ''
      });
      setSponsorModal({ isOpen: true, editId: id });
    } else {
      setSponsorForm({
        name: '', logoUrl: '', imageUrl: '', description: '', website: '', 
        phone: '', email: '', whatsapp: '', instagram: '', facebook: '', 
        category: 'GENERAL', isActive: true, order: 0, address: '', 
        contractStartDate: '', contractEndDate: '', status: 'activo',
        contacto: '', monto: '', observaciones: ''
      });
      setSponsorModal({ isOpen: true, editId: null });
    }
  };

  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    const method = sponsorModal.editId ? 'PUT' : 'POST';
    const url = sponsorModal.editId ? `/api/publicidad/sponsors/${sponsorModal.editId}` : '/api/publicidad/sponsors';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sponsorForm,
          monto: sponsorForm.monto ? parseFloat(sponsorForm.monto) : 0
        })
      });
      if (res.ok) {
        showToast(sponsorModal.editId ? 'Sponsor actualizado con éxito' : 'Sponsor creado con éxito');
        setSponsorModal({ isOpen: false, editId: null });
        loadAllData();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Error al guardar sponsor', 'error');
      }
    } catch {
      showToast('Error de red al guardar sponsor', 'error');
    }
  };

  const handleDeleteSponsor = async (id) => {
    if (!confirm('¿Deseas eliminar definitivamente este Sponsor y todo su historial de contratos?')) return;
    try {
      const res = await fetch(`/api/publicidad/sponsors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Sponsor eliminado');
        loadAllData();
      } else {
        showToast('Error al eliminar sponsor', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleToggleSponsor = async (id, currentActive) => {
    try {
      const res = await fetch(`/api/publicidad/sponsors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      if (res.ok) {
        showToast('Estado del sponsor cambiado');
        loadAllData();
      }
    } catch {
      showToast('Error al alternar estado', 'error');
    }
  };

  // ─── CONTRACT RENEWALS ──────────────────────────────────────────────────────

  const handleOpenRenewContract = (sponsorId) => {
    setContractForm({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: '',
      notes: 'Renovación de espacio comercial anual.'
    });
    setContractModal({ isOpen: true, sponsorId });
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/publicidad/sponsors/${contractModal.sponsorId}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractForm)
      });
      if (res.ok) {
        showToast('Contrato comercial renovado con éxito');
        setContractModal({ isOpen: false, sponsorId: null });
        loadAllData();
      }
    } catch {
      showToast('Error al registrar contrato', 'error');
    }
  };

  // ─── FILE UPLOADS HANDLERS (DRAG & DROP) ────────────────────────────────────

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', uploadCategory);

    try {
      showToast('Subiendo archivo comercial...', 'info');
      const res = await fetch('/api/publicidad/media-files/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        showToast('Archivo comercial subido con éxito');
        loadAllData();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Error al subir archivo', 'error');
      }
    } catch {
      showToast('Error de red al subir archivo', 'error');
    }
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('¿Deseas eliminar físicamente este archivo?')) return;
    try {
      const res = await fetch(`/api/publicidad/media-files/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Archivo eliminado de disco');
        loadAllData();
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  // ─── CANVAS BANNER SAVE / EXPORT ────────────────────────────────────────────

  const handleSaveBanner = async () => {
    if (!canvasRef.current) return;
    
    try {
      showToast('Exportando banner visual...', 'info');
      
      const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
      const filename = `banner-${canvasFormat}-${Date.now()}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      // 1. Subir el archivo generado al storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'banners');

      const resUpload = await fetch('/api/publicidad/media-files/upload', {
        method: 'POST',
        body: formData
      });

      if (!resUpload.ok) {
        throw new Error('Error al guardar archivo del banner en el servidor');
      }
      
      const mediaInfo = await resUpload.json();

      // 2. Registrar el banner en el ABM
      const resBanner = await fetch('/api/publicidad/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Banner Visual Canva - ${canvasFormat.toUpperCase()}`,
          imageUrl: mediaInfo.url,
          locations: JSON.stringify(['home']),
          isActive: true
        })
      });

      if (resBanner.ok) {
        showToast('¡Banner creado, guardado y publicado con éxito!');
        setBannerEditorModal(false);
        loadAllData();
      }
    } catch (e) {
      console.error(e);
      showToast('Error al exportar banner', 'error');
    }
  };

  // ─── CAMPAIGNS HANDLERS ─────────────────────────────────────────────────────

  const handleOpenCampaignModal = (id = null) => {
    if (id) {
      const cp = campaigns.find(c => c.id === id);
      setCampaignForm({
        title: cp.title || '',
        imageUrl: cp.imageUrl || '',
        videoUrl: cp.videoUrl || '',
        linkUrl: cp.linkUrl || '',
        description: cp.description || '',
        locations: parseLocations(cp.locations),
        startDate: cp.startDate ? cp.startDate.split('T')[0] : '',
        endDate: cp.endDate ? cp.endDate.split('T')[0] : '',
        priority: cp.priority || 0,
        status: cp.status || 'ACTIVE',
        maxViews: cp.maxViews || 100000,
        sponsorId: cp.sponsorId || ''
      });
      setCampaignModal({ isOpen: true, editId: id });
    } else {
      setCampaignForm({
        title: '', imageUrl: '', videoUrl: '', linkUrl: '', description: '', 
        locations: ['home'], startDate: '', endDate: '', priority: 0, status: 'ACTIVE', 
        maxViews: 100000, sponsorId: sponsors[0]?.id || ''
      });
      setCampaignModal({ isOpen: true, editId: null });
    }
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    const method = campaignModal.editId ? 'PUT' : 'POST';
    const url = campaignModal.editId ? `/api/publicidad/campaigns/${campaignModal.editId}` : '/api/publicidad/campaigns';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          sponsorId: campaignForm.sponsorId ? parseInt(campaignForm.sponsorId) : null
        })
      });
      if (res.ok) {
        showToast(campaignModal.editId ? 'Campaña actualizada con éxito' : 'Campaña publicitaria activada');
        setCampaignModal({ isOpen: false, editId: null });
        loadAllData();
      }
    } catch {
      showToast('Error al guardar campaña', 'error');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!confirm('¿Eliminar esta campaña?')) return;
    try {
      const res = await fetch(`/api/publicidad/campaigns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Campaña removida');
        loadAllData();
      }
    } catch {
      showToast('Error de red', 'error');
    }
  };

  // ─── BANNERS HANDLERS ──────────────────────────────────────────────────────

  const handleOpenBannerFormModal = (id = null) => {
    if (id) {
      const b = banners.find(item => item.id === id);
      setBannerForm({
        title: b.title || '',
        imageUrl: b.imageUrl || '',
        linkUrl: b.linkUrl || '',
        locations: parseLocations(b.locations),
        startDate: b.startDate ? b.startDate.split('T')[0] : '',
        endDate: b.endDate ? b.endDate.split('T')[0] : '',
        isActive: b.isActive,
        rotationSpeed: b.rotationSpeed || 5,
        rotation: b.rotation || 'AUTOMATIC'
      });
      setBannerFormModal({ isOpen: true, editId: id });
    } else {
      setBannerForm({
        title: '',
        imageUrl: '',
        linkUrl: '',
        locations: ['home'],
        startDate: '',
        endDate: '',
        isActive: true,
        rotationSpeed: 5,
        rotation: 'AUTOMATIC'
      });
      setBannerFormModal({ isOpen: true, editId: null });
    }
  };

  const handleSaveBannerForm = async (e) => {
    e.preventDefault();
    const method = bannerFormModal.editId ? 'PUT' : 'POST';
    const url = bannerFormModal.editId ? `/api/publicidad/banners/${bannerFormModal.editId}` : '/api/publicidad/banners';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bannerForm,
          locations: JSON.stringify(bannerForm.locations)
        })
      });
      if (res.ok) {
        showToast(bannerFormModal.editId ? 'Banner actualizado' : 'Banner comercial programado');
        setBannerFormModal({ isOpen: false, editId: null });
        loadAllData();
      }
    } catch {
      showToast('Error al guardar banner', 'error');
    }
  };

  // ─── SOCIAL POSTS HANDLERS ──────────────────────────────────────────────────

  const handleCreateSocialPost = async (e) => {
    e.preventDefault();
    if (!socialForm.content) return;
    
    try {
      const res = await fetch('/api/publicidad/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialForm)
      });
      if (res.ok) {
        showToast(`Publicación programada en ${socialForm.platform.toUpperCase()}`);
        setSocialForm({ platform: 'instagram', content: '', scheduledFor: '', mediaUrl: '' });
        loadAllData();
      }
    } catch {
      showToast('Error de red', 'error');
    }
  };

  const handleDeleteSocialPost = async (id) => {
    try {
      const res = await fetch(`/api/publicidad/social-posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Publicación programada cancelada');
        loadAllData();
      }
    } catch {
      showToast('Error al cancelar', 'error');
    }
  };

  // ─── STATISTICS & CSV EXPORT ────────────────────────────────────────────────

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Sponsor,Impresiones,Clics,CTR\n";
      sponsors.forEach(s => {
        const ctr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(2) : '0.00';
        csvContent += `"${s.name}",${s.views || 0},${s.clicks || 0},${ctr}%\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reporte_marketing_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exportación de Estadísticas CSV completada');
    } catch {
      showToast('Falla al exportar CSV', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      let tsvContent = "Sponsor\tImpresiones\tClics\tCTR\n";
      sponsors.forEach(s => {
        const ctr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(2) : '0.00';
        tsvContent += `${s.name}\t${s.views || 0}\t${s.clicks || 0}\t${ctr}%\n`;
      });

      const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte_marketing_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exportación de Estadísticas Excel completada');
    } catch {
      showToast('Falla al exportar Excel', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-jn-black text-white p-6 font-sans">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl ${
          toast.type === 'error' ? 'bg-red-950 border-red-500 text-red-200' : 'bg-green-950 border-green-500 text-green-200'
        }`}>
          <AlertCircle size={18} />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider flex items-center gap-3">
            <span className="w-4 h-8 bg-jn-red inline-block" />
            Marketing & Sponsors
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-bold">Consola comercial de venta y administración de espacios publicitarios del club</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setBannerEditorModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-650 to-red-800 hover:from-red-700 hover:to-red-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Sliders size={14} /> Creador Banners Visual
          </button>
          <button 
            onClick={loadAllData}
            className="p-2 border border-gray-800 hover:bg-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-800 pb-px mb-8">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'sponsors', label: 'Sponsors' },
          { id: 'banners', label: 'Banners' },
          { id: 'campanas', label: 'Campañas' },
          { id: 'archivos', label: 'Media & Uploads' },
          { id: 'estadisticas', label: 'Estadísticas' },
          { id: 'redes', label: 'Redes Sociales' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-all relative shrink-0 cursor-pointer ${
              activeTab === t.id ? 'text-jn-red border-b-2 border-jn-red' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOADING SPINNER */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-24">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-jn-red rounded-full animate-spin mb-4" />
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Cargando ecosistema comercial...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: DASHBOARD */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* METRIC CARD GRID - EXACTLY 8 KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                
                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Sponsors Activos</span>
                  <div className="text-xl font-black text-white">{sponsors.filter(s => s.isActive).length} / {sponsors.length}</div>
                  <div className="text-[8px] text-green-550 font-bold mt-1">🤝 Convenios</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Campañas</span>
                  <div className="text-xl font-black text-white">{campaigns.length}</div>
                  <div className="text-[8px] text-jn-red font-bold mt-1">📊 Programadas</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Ingresos Pub.</span>
                  <div className="text-xl font-black text-white">
                    ${sponsors.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0).toLocaleString('es-AR')}
                  </div>
                  <div className="text-[8px] text-green-555 font-bold mt-1">💵 Facturación anual</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Banners Activos</span>
                  <div className="text-xl font-black text-white">{banners.filter(b => b.isActive).length} / {banners.length}</div>
                  <div className="text-[8px] text-blue-500 font-bold mt-1">🖼 En rotación</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Publicaciones</span>
                  <div className="text-xl font-black text-white">{socialPosts.length}</div>
                  <div className="text-[8px] text-purple-500 font-bold mt-1">📱 Redes Sociales</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Alcance Proy.</span>
                  <div className="text-xl font-black text-white">{(stats.totalViews * 1.3 || 24000).toLocaleString('es-AR')}</div>
                  <div className="text-[8px] text-indigo-500 font-bold mt-1">📈 Espectadores</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Interacciones</span>
                  <div className="text-xl font-black text-white">{(stats.totalClicks || 1280).toLocaleString('es-AR')}</div>
                  <div className="text-[8px] text-zinc-550 font-bold mt-1">🎯 Conversiones</div>
                </div>

                <div className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 rounded-2xl p-4 relative overflow-hidden shadow-md text-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-2">Convenios</span>
                  <div className="text-xl font-black text-white">{sponsors.filter(s => s.category === 'PRINCIPAL').length}</div>
                  <div className="text-[8px] text-amber-500 font-bold mt-1">📜 Principales</div>
                </div>

              </div>

              {/* CHARTS ROW */}
              {mounted && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Line Chart */}
                  <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-xs font-black uppercase tracking-wider mb-6 text-gray-400">Rendimiento por clics (Últimos 7 días)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                        <LineChart data={stats.clicksByDay || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                          <XAxis dataKey="date" stroke="#666" fontSize={11} />
                          <YAxis stroke="#666" fontSize={11} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }} />
                          <Line type="monotone" dataKey="clicks" stroke="#cc0000" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Device Stats Pie Chart */}
                  <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider mb-6 text-gray-400">Acceso por dispositivo</h3>
                      <div className="h-48 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Desktop', value: stats.deviceStats?.desktop || 1 },
                                { name: 'Mobile', value: stats.deviceStats?.mobile || 0 },
                                { name: 'Tablet', value: stats.deviceStats?.tablet || 0 }
                              ]}
                              cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                            >
                              <Cell fill="#cc0000" />
                              <Cell fill="#ffffff" />
                              <Cell fill="#666666" />
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex justify-around text-xs font-bold mt-4">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-jn-red inline-block rounded-full" /> Desktop</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-white inline-block rounded-full" /> Mobile</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-600 inline-block rounded-full" /> Tablet</span>
                    </div>
                  </div>

                </div>
              )}

              {/* NEAR EXPIRATIONS */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-gray-400">Contratos próximos a vencer</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase">
                        <th className="py-3 px-4">Sponsor</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Monto Contrato</th>
                        <th className="py-3 px-4">Inicio Contrato</th>
                        <th className="py-3 px-4">Fin Contrato</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsors.slice(0, 4).map(s => {
                        const isNearEnd = s.contractEndDate && (new Date(s.contractEndDate) - new Date()) < 30 * 24 * 60 * 60 * 1000;
                        return (
                          <tr key={s.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                            <td className="py-3 px-4 font-black">{s.name}</td>
                            <td className="py-3 px-4 text-gray-450">{s.category}</td>
                            <td className="py-3 px-4 font-mono font-bold text-green-500">${(s.monto || 0).toLocaleString()}</td>
                            <td className="py-3 px-4">{s.contractStartDate ? new Date(s.contractStartDate).toLocaleDateString() : 'N/A'}</td>
                            <td className={`py-3 px-4 font-bold ${isNearEnd ? 'text-red-500' : ''}`}>
                              {s.contractEndDate ? new Date(s.contractEndDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                s.status === 'activo' ? 'bg-green-950 text-green-300' : 'bg-yellow-950 text-yellow-300'
                              }`}>{s.status}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button 
                                onClick={() => handleOpenRenewContract(s.id)}
                                className="bg-jn-red hover:bg-red-700 px-3 py-1 rounded text-[9px] font-black uppercase cursor-pointer"
                              >
                                Renovar contrato
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: SPONSORS */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'sponsors' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SEARCH & ADD BAR */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-550" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar sponsors..."
                    value={sponsorSearch}
                    onChange={e => setSponsorSearch(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:border-jn-red outline-none font-medium"
                  />
                </div>
                <button
                  onClick={() => handleOpenSponsorModal()}
                  className="bg-jn-red hover:bg-red-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 justify-center cursor-pointer"
                >
                  <Plus size={14} /> Nuevo Sponsor
                </button>
              </div>

              {/* SPONSORS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors
                  .filter(s => s.name?.toLowerCase().includes(sponsorSearch.toLowerCase()))
                  .map(s => (
                    <div key={s.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt={s.name} className="h-10 object-contain max-w-[120px] rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.png'; }} />
                          ) : (
                            <div className="w-10 h-10 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-center font-black text-sm text-jn-red">SP</div>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            s.isActive ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'
                          }`}>
                            {s.isActive ? 'Activo' : 'Pausado'}
                          </span>
                        </div>
                        <h3 className="text-sm font-black">{s.name}</h3>
                        <p className="text-gray-450 text-xs mt-1 line-clamp-2">{s.description || 'Sin descripción comercial.'}</p>
                        
                        <div className="text-[10px] text-gray-500 font-bold space-y-1 mt-4">
                          <p>👤 Contacto: <span className="text-white">{s.contacto || 'No asignado'}</span></p>
                          <p>💰 Monto Contrato: <span className="text-green-400 font-mono">${(s.monto || 0).toLocaleString()}</span></p>
                          <p>📞 Teléfono: {s.phone || 'No declarado'}</p>
                          <p>📧 Email: {s.email || 'No declarado'}</p>
                          <p>🔗 Web: <a href={s.website} target="_blank" rel="noreferrer" className="text-jn-red underline">{s.website || 'N/A'}</a></p>
                          {s.observaciones && <p className="text-gray-400 italic">📝 {s.observaciones}</p>}
                        </div>
                      </div>

                      <div className="border-t border-gray-900 mt-6 pt-4 flex items-center justify-between text-xs font-bold">
                        <button 
                          onClick={() => handleOpenRenewContract(s.id)}
                          className="text-[10px] text-gray-350 hover:text-white font-black uppercase tracking-wider cursor-pointer"
                        >
                          Renovar Contrato
                        </button>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenSponsorModal(s.id)}
                            className="p-2 border border-gray-800 hover:bg-gray-900 rounded-lg text-gray-350 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteSponsor(s.id)}
                            className="p-2 border border-gray-800 hover:bg-red-955 hover:border-red-900 rounded-lg text-gray-350 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: BANNERS */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* HEADER INFO */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Banners Publicitarios en Rotación</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenBannerFormModal()}
                    className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={14} /> Programar Banner
                  </button>
                  <button
                    onClick={() => setBannerEditorModal(true)}
                    className="bg-jn-red hover:bg-red-750 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                  >
                    <Sliders size={14} /> Editor Canva
                  </button>
                </div>
              </div>

              {/* BANNERS LIST */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map(b => (
                  <div key={b.id} className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-gray-700 transition-colors">
                    <div>
                      {b.imageUrl ? (
                        <div className="aspect-[3/1] bg-black relative">
                          <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[3/1] bg-gray-950 border-b border-gray-800 flex items-center justify-center font-bold text-gray-600">Sin Imagen</div>
                      )}
                      <div className="p-4 text-left">
                        <h4 className="text-xs font-black">{b.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold mt-1">Ubicación web: {parseLocations(b.locations).join(', ') || 'N/A'}</p>
                        
                        <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-450 font-bold">
                          <span>👁️ {b.views} Vistas</span>
                          <span>Target: <strong className="text-white">{b.rotation || 'AUTOMATIC'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-900 p-4 flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        b.isActive ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {b.isActive ? 'Activo' : 'Pausado'}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenBannerFormModal(b.id)}
                          className="p-2 border border-gray-800 hover:bg-gray-900 rounded-lg text-gray-350 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('¿Eliminar este banner?')) {
                              fetch(`/api/publicidad/banners/${b.id}`, { method: 'DELETE' }).then(() => loadAllData());
                            }
                          }}
                          className="p-2 border border-gray-800 hover:bg-red-950 hover:border-red-900 rounded-lg text-gray-350 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: CAMPAÑAS */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'campanas' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Campañas Comerciales Programadas</h3>
                <button
                  onClick={() => handleOpenCampaignModal()}
                  className="bg-jn-red hover:bg-red-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Nueva Campaña
                </button>
              </div>

              {/* CAMPAIGNS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map(c => {
                  const sp = sponsors.find(s => s.id === c.sponsorId);
                  return (
                    <div key={c.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between hover:border-gray-700 transition-colors text-left">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-black">{c.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            c.status === 'ACTIVE' ? 'bg-green-950 text-green-300' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {c.status === 'ACTIVE' ? 'Activa' : 'Borrador'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-450 font-bold mb-4 font-mono">Sponsor: <span className="text-white font-sans">{sp?.name || 'Ninguno'}</span></p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.description || 'Sin descripción comercial.'}</p>
                        
                        <div className="text-[10px] text-gray-500 font-bold space-y-1 mt-4">
                          <p>📅 Rango: {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A'} al {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'N/A'}</p>
                          <p>📍 Espacios Web: {parseLocations(c.locations).join(', ') || 'N/A'}</p>
                          <p>🛑 Límite Impresiones: {c.maxViews ? c.maxViews?.toLocaleString() : 'Ilimitado'}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-900 mt-6 pt-4 flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenCampaignModal(c.id)}
                          className="p-2 border border-gray-800 hover:bg-gray-900 rounded-lg text-gray-350 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCampaign(c.id)}
                          className="p-2 border border-gray-800 hover:bg-red-955 hover:border-red-900 rounded-lg text-gray-355 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: ARCHIVOS (MEDIA & UPLOADS) */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'archivos' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* DRAG & DROP UPLOADER CONTAINER */}
              <div className="bg-gray-950 border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center relative">
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center"
                >
                  <Upload size={32} className="text-gray-500 mb-3" />
                  <p className="text-xs font-black uppercase tracking-wider text-gray-300">Arrastra y suelta aquí tu archivo</p>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">Soporta JPG, PNG, WEBP, SVG (máx. 10MB) | MP4, WEBM (máx. 100MB) | PDF (máx. 20MB)</p>

                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Clasificar en:</span>
                    <select
                      value={uploadCategory}
                      onChange={e => setUploadCategory(e.target.value)}
                      className="bg-gray-900 border border-gray-800 text-[10px] rounded-lg px-2 py-1 font-bold text-white outline-none"
                    >
                      <option value="sponsors">Sponsors</option>
                      <option value="banners">Banners</option>
                      <option value="campanas">Campañas</option>
                      <option value="videos">Videos</option>
                      <option value="documentos">Documentos</option>
                    </select>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-gray-900 hover:bg-gray-850 px-4 py-2 border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Examinar desde mi PC
                  </button>
                </div>
              </div>

              {/* FILES LIST FILTER */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 text-left">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Archivos almacenados</h3>
                  <div className="flex items-center gap-2">
                    <Filter size={12} className="text-gray-400" />
                    <select
                      value={fileFilterCategory}
                      onChange={e => setFileFilterCategory(e.target.value)}
                      className="bg-gray-900 border border-gray-800 text-[10px] rounded-lg px-2 py-1 font-bold outline-none"
                    >
                      <option value="ALL">Todas las carpetas</option>
                      <option value="sponsors">sponsors/</option>
                      <option value="banners">banners/</option>
                      <option value="campanas">campañas/</option>
                      <option value="videos">videos/</option>
                      <option value="documentos">documentos/</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {mediaFiles
                    .filter(f => fileFilterCategory === 'ALL' || f.category === fileFilterCategory)
                    .map(f => (
                      <div key={f.id} className="bg-gray-900 border border-gray-850 rounded-xl p-3 relative group hover:border-gray-700 transition-colors flex flex-col justify-between">
                        <div className="aspect-square bg-black rounded-lg flex items-center justify-center overflow-hidden mb-3">
                          {['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(f.filetype) ? (
                            <img src={f.url} alt={f.filename} className="w-full h-full object-cover" />
                          ) : f.filetype === 'pdf' ? (
                            <FileText size={28} className="text-red-500" />
                          ) : (
                            <Tv size={28} className="text-blue-500" />
                          )}
                        </div>
                        
                        <div>
                          <p className="text-[10px] font-black truncate text-gray-300" title={f.filename}>{f.filename}</p>
                          <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{f.category}/ · {(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>

                        <div className="flex items-center justify-between mt-3 border-t border-gray-850 pt-2 text-xs font-bold">
                          <a 
                            href={f.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[9px] text-jn-red hover:underline font-black uppercase"
                          >
                            Ver enlace
                          </a>
                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            className="text-gray-550 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: ESTADÍSTICAS */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-8 animate-fadeIn text-left">
              
              {/* Export Panel */}
              <div className="flex justify-between items-center bg-gray-950 p-4 border border-gray-800 rounded-2xl">
                <div>
                  <h4 className="text-xs font-black uppercase text-white">Exportación de Reportes Comerciales</h4>
                  <p className="text-[10px] text-gray-400">Descarga los datos compilados de CTR de sponsors y campañas en un formato contable.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleExportCSV}
                    className="bg-green-650 hover:bg-green-700 text-white font-black uppercase text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={16} /> Exportar CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={16} /> Exportar Excel
                  </button>
                </div>
              </div>

              {/* CHARTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Impressions/views by day */}
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-6 text-gray-400">CTR vs Clics Diarios</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                      <AreaChart data={stats.clicksByDay || []}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#cc0000" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#cc0000" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="date" stroke="#666" fontSize={11} />
                        <YAxis stroke="#666" fontSize={11} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                        <Area type="monotone" dataKey="clicks" stroke="#cc0000" fillOpacity={1} fill="url(#colorClicks)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Campaign performance */}
                <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-6 text-gray-400">Rendimiento por Campaña (Clicks)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={100}>
                      <BarChart data={campaigns.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="title" stroke="#666" fontSize={10} />
                        <YAxis stroke="#666" fontSize={11} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                        <Bar dataKey="clicks" fill="#cc0000">
                          {campaigns.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#cc0000' : '#ffffff'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* SPONSOR CTR TABLE */}
              <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-gray-400">Rendimiento Detallado por Sponsor</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-bold uppercase">
                        <th className="py-3 px-4">Sponsor</th>
                        <th className="py-3 px-4">Impresiones (Views)</th>
                        <th className="py-3 px-4">Clicks Recibidos</th>
                        <th className="py-3 px-4">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sponsors.map(s => {
                        const calculatedCtr = s.views > 0 ? ((s.clicks / s.views) * 100).toFixed(2) : '0.00';
                        return (
                          <tr key={s.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                            <td className="py-3 px-4 font-black">{s.name}</td>
                            <td className="py-3 px-4">{s.views?.toLocaleString()}</td>
                            <td className="py-3 px-4">{s.clicks?.toLocaleString()}</td>
                            <td className="py-3 px-4 font-bold text-jn-red">{calculatedCtr}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* TAB: REDES SOCIALES */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'redes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-left">
              
              {/* PLANIFICADOR FORM */}
              <div className="lg:col-span-1 bg-gray-950 border border-gray-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-900 pb-2">Programar Publicación</h3>
                
                <form onSubmit={handleCreateSocialPost} className="space-y-4 text-xs font-bold text-gray-650">
                  <div className="space-y-1">
                    <label className="block text-gray-400 mb-1">Plataforma Social *</label>
                    <select
                      value={socialForm.platform}
                      onChange={e => setSocialForm({...socialForm, platform: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">X (Twitter)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 mb-1">Fecha y Hora de Envío *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={socialForm.scheduledFor}
                      onChange={e => setSocialForm({...socialForm, scheduledFor: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 mb-1">Contenido / Texto del Post *</label>
                    <textarea 
                      rows={4}
                      required
                      value={socialForm.content}
                      onChange={e => setSocialForm({...socialForm, content: e.target.value})}
                      placeholder="Escribe el cuerpo de tu publicación comercial..."
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-400 mb-1">Imagen / Video URL</label>
                    <input 
                      type="text" 
                      value={socialForm.mediaUrl}
                      onChange={e => setSocialForm({...socialForm, mediaUrl: e.target.value})}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase text-xs py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950"
                  >
                    Programar Publicación Automática
                  </button>
                </form>
              </div>

              {/* CALENDAR / LIST OF SCHEDULED POSTS */}
              <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-6 border-b border-gray-900 pb-2">Calendario de Publicaciones Programadas</h3>
                
                <div className="space-y-4">
                  {socialPosts.map(p => (
                    <div key={p.id} className="bg-gray-900 border border-gray-850 rounded-xl p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] bg-red-955 text-red-300 px-2 py-0.5 rounded font-black uppercase">{p.platform}</span>
                          <span className="text-[9px] text-gray-500 font-bold">⏰ {p.scheduledFor ? new Date(p.scheduledFor).toLocaleString('es-AR') : 'N/A'}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-300">{p.content}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteSocialPost(p.id)}
                        className="text-gray-550 hover:text-red-400 p-1 rounded-lg cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}

                  {socialPosts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-bold">No hay publicaciones comerciales programadas para esta semana</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: CREATE/EDIT SPONSOR */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {sponsorModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
              <h2 className="text-base font-black uppercase tracking-wider">{sponsorModal.editId ? 'Editar Sponsor Comercial' : 'Registrar Nuevo Sponsor'}</h2>
              <button onClick={() => setSponsorModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveSponsor} className="space-y-4 text-xs font-bold text-gray-650 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Nombre Comercial *</label>
                  <input
                    type="text" required
                    value={sponsorForm.name}
                    onChange={e => setSponsorForm({ ...sponsorForm, name: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Categoría</label>
                  <select
                    value={sponsorForm.category}
                    onChange={e => setSponsorForm({ ...sponsorForm, category: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  >
                    <option value="PRINCIPAL">Sponsor Principal (Camiseta)</option>
                    <option value="INDUMENTARIA">Indumentaria y Training</option>
                    <option value="ESTADIO">Cartelería Estadio / Canchas</option>
                    <option value="GENERAL">General y Digital</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Contacto de Alianza (Ejecutivo) *</label>
                  <input
                    type="text" required
                    placeholder="Nombre del directivo"
                    value={sponsorForm.contacto}
                    onChange={e => setSponsorForm({ ...sponsorForm, contacto: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Monto de Contrato Comercial (AR$ Anual) *</label>
                  <input
                    type="number" required
                    placeholder="Monto de la inversión"
                    value={sponsorForm.monto}
                    onChange={e => setSponsorForm({ ...sponsorForm, monto: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción de Alianza Comercial</label>
                <textarea
                  rows="2"
                  value={sponsorForm.description}
                  onChange={e => setSponsorForm({ ...sponsorForm, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Logo de Sponsor (Carga)</label>
                  <MediaUploadUniversal
                    value={sponsorForm.logoUrl}
                    onChange={url => setSponsorForm({ ...sponsorForm, logoUrl: url })}
                    category="sponsors"
                    allowedTypes={['image']}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Sitio Web URL</label>
                  <input
                    type="text"
                    value={sponsorForm.website}
                    onChange={e => setSponsorForm({ ...sponsorForm, website: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={sponsorForm.whatsapp}
                    onChange={e => setSponsorForm({ ...sponsorForm, whatsapp: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={sponsorForm.phone}
                    onChange={e => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Contacto</label>
                  <input
                    type="email"
                    value={sponsorForm.email}
                    onChange={e => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={sponsorForm.address}
                    onChange={e => setSponsorForm({ ...sponsorForm, address: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Estado de Contrato</label>
                  <select
                    value={sponsorForm.status}
                    onChange={e => setSponsorForm({ ...sponsorForm, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-bold"
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado / En suspenso</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Inicio de Contrato</label>
                  <input
                    type="date"
                    value={sponsorForm.contractStartDate}
                    onChange={e => setSponsorForm({ ...sponsorForm, contractStartDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Fin de Contrato</label>
                  <input
                    type="date"
                    value={sponsorForm.contractEndDate}
                    onChange={e => setSponsorForm({ ...sponsorForm, contractEndDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-400 mb-1">Observaciones / Notas Especiales</label>
                <textarea
                  rows="2"
                  value={sponsorForm.observaciones}
                  onChange={e => setSponsorForm({ ...sponsorForm, observaciones: e.target.value })}
                  placeholder="Cláusulas especiales de renovación o exhibición"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                />
              </div>

              <div className="border-t border-gray-900 mt-6 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSponsorModal({ isOpen: false, editId: null })}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-jn-red hover:bg-red-700 px-4 py-2 rounded-xl text-white font-black uppercase tracking-wider cursor-pointer"
                >
                  Guardar Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: PROGRAM / EDIT BANNER (FORM) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {bannerFormModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
              <h2 className="text-base font-black uppercase tracking-wider">{bannerFormModal.editId ? 'Editar Banner Programado' : 'Programar Nuevo Banner'}</h2>
              <button onClick={() => setBannerFormModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveBannerForm} className="space-y-4 text-xs font-bold text-gray-650 text-left">
              <div>
                <label className="block text-gray-400 mb-1">Título de Banner *</label>
                <input
                  type="text" required
                  placeholder="Ej: Promo Socios - Julio"
                  value={bannerForm.title}
                  onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Imagen URL / Banner *</label>
                  <MediaUploadUniversal
                    value={bannerForm.imageUrl}
                    onChange={url => setBannerForm({ ...bannerForm, imageUrl: url })}
                    category="banners"
                    allowedTypes={['image']}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Link de Destino URL</label>
                  <input
                    type="text"
                    placeholder="https://"
                    value={bannerForm.linkUrl}
                    onChange={e => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Páginas de Destino (Ubicaciones) *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['home', 'newbery-tv', 'noticias', 'portal-socio', 'resultados', 'eventos'].map(loc => {
                    const isChecked = bannerForm.locations.includes(loc);
                    return (
                      <label key={loc} className="flex items-center gap-2 text-gray-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setBannerForm({ ...bannerForm, locations: [...bannerForm.locations, loc] });
                            } else {
                              setBannerForm({ ...bannerForm, locations: bannerForm.locations.filter(l => l !== loc) });
                            }
                          }}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span>{loc.toUpperCase()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Fecha Inicio Programada</label>
                  <input
                    type="date"
                    value={bannerForm.startDate}
                    onChange={e => setBannerForm({ ...bannerForm, startDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Fecha Fin Programada</label>
                  <input
                    type="date"
                    value={bannerForm.endDate}
                    onChange={e => setBannerForm({ ...bannerForm, endDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Estilo de Rotación</label>
                  <select
                    value={bannerForm.rotation}
                    onChange={e => setBannerForm({ ...bannerForm, rotation: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="AUTOMATIC">Rotación Automática</option>
                    <option value="SCHEDULED">Fecha Programada</option>
                    <option value="MANUAL">Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Tiempo de Rotación (Segundos)</label>
                  <input
                    type="number"
                    value={bannerForm.rotationSpeed}
                    onChange={e => setBannerForm({ ...bannerForm, rotationSpeed: parseInt(e.target.value) || 5 })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-gray-900 mt-6 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBannerFormModal({ isOpen: false, editId: null })}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-jn-red hover:bg-red-700 px-4 py-2 rounded-xl text-white font-black uppercase tracking-wider cursor-pointer"
                >
                  Guardar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: RENEW CONTRACT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {contractModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
              <h2 className="text-base font-black uppercase tracking-wider">Renovación de Contrato Comercial</h2>
              <button onClick={() => setContractModal({ isOpen: false, sponsorId: null })} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-4 text-xs font-bold text-gray-650 text-left">
              <div>
                <label className="block text-gray-400 mb-1">Fecha Inicio Renovación *</label>
                <input
                  type="date" required
                  value={contractForm.startDate}
                  onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Fecha Final Renovación *</label>
                <input
                  type="date" required
                  value={contractForm.endDate}
                  onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Monto del Contrato (AR$ Anual)</label>
                <input
                  type="number"
                  placeholder="250000"
                  value={contractForm.amount}
                  onChange={e => setContractForm({ ...contractForm, amount: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Notas Comerciales</label>
                <textarea
                  rows="3"
                  value={contractForm.notes}
                  onChange={e => setContractForm({ ...contractForm, notes: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                />
              </div>

              <div className="border-t border-gray-900 mt-6 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setContractModal({ isOpen: false, sponsorId: null })}
                  className="bg-gray-900 hover:bg-gray-850 border border-gray-800 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="bg-jn-red hover:bg-red-700 px-4 py-2 rounded-xl text-white font-black uppercase tracking-wider cursor-pointer"
                >
                  Registrar Renovación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: CAMPAIGN CREATE/EDIT */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {campaignModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
              <h2 className="text-base font-black uppercase tracking-wider">{campaignModal.editId ? 'Editar Campaña Comercial' : 'Lanzar Nueva Campaña'}</h2>
              <button onClick={() => setCampaignModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs font-bold text-gray-650 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Título de la Campaña *</label>
                  <input
                    type="text" required
                    value={campaignForm.title}
                    onChange={e => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-black"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Sponsor Asociado *</label>
                  <select
                    required
                    value={campaignForm.sponsorId}
                    onChange={e => setCampaignForm({ ...campaignForm, sponsorId: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  >
                    <option value="">Selecciona un Sponsor</option>
                    {sponsors.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Imagen / Banner Asociado</label>
                  <MediaUploadUniversal
                    value={campaignForm.imageUrl}
                    onChange={url => setCampaignForm({ ...campaignForm, imageUrl: url })}
                    category="campañas"
                    allowedTypes={['image']}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Link de Redirección (Clics)</label>
                  <input
                    type="text"
                    value={campaignForm.linkUrl}
                    onChange={e => setCampaignForm({ ...campaignForm, linkUrl: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none focus:border-jn-red text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Descripción / Objetivos comerciales</label>
                <textarea
                  rows="2"
                  value={campaignForm.description}
                  onChange={e => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Límite de Impresiones (Vistas)</label>
                  <input
                    type="number"
                    value={campaignForm.maxViews}
                    onChange={e => setCampaignForm({ ...campaignForm, maxViews: parseInt(e.target.value) || 100000 })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Prioridad (0-100)</label>
                  <input
                    type="number"
                    value={campaignForm.priority}
                    onChange={e => setCampaignForm({ ...campaignForm, priority: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Estado</label>
                  <select
                    value={campaignForm.status}
                    onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white"
                  >
                    <option value="ACTIVE">Activa / Publicada</option>
                    <option value="DRAFT">Borrador / Pausada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Inicio Exhibición</label>
                  <input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Fin Exhibición</label>
                  <input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-gray-900 mt-6 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCampaignModal({ isOpen: false, editId: null })}
                  className="bg-gray-900 hover:bg-gray-855 border border-gray-800 px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-jn-red hover:bg-red-700 px-4 py-2 rounded-xl text-white font-black uppercase tracking-wider cursor-pointer"
                >
                  Guardar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL: VISUAL BANNER EDITOR (CANVA-LIKE) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {bannerEditorModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-5xl p-6 shadow-2xl max-h-[95vh] overflow-y-auto flex flex-col md:flex-row gap-6">
            
            {/* CANVAS CONTAINER */}
            <div className="flex-1 flex flex-col justify-center items-center bg-black border border-gray-900 rounded-xl p-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Lienzo del Banner (Miniatura en tiempo real)</span>
              
              <div className="w-full max-w-full overflow-x-auto flex justify-center py-4">
                <canvas 
                  ref={canvasRef}
                  className="border border-gray-700 shadow-2xl max-w-full object-contain"
                  style={{ maxHeight: '420px', width: '100%' }}
                />
              </div>
            </div>

            {/* CONTROLS SIDEBAR */}
            <div className="w-full md:w-80 flex flex-col justify-between text-xs font-bold space-y-4 text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-900 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider">Editor de Banners</h3>
                  <button onClick={() => setBannerEditorModal(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Formato / Proporción</label>
                  <select
                    value={canvasFormat}
                    onChange={e => setCanvasFormat(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 font-bold"
                  >
                    <option value="principal">Banner Principal (1920x600)</option>
                    <option value="horizontal">Banner Horizontal (1200x300)</option>
                    <option value="cuadrado">Banner Cuadrado (1080x1080)</option>
                    <option value="redes">Social Media (1080x1920)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Texto Principal</label>
                  <input
                    type="text"
                    value={editorText}
                    onChange={e => setEditorText(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Tamaño Texto</label>
                    <input
                      type="number"
                      value={editorTextSize}
                      onChange={e => setEditorTextSize(parseInt(e.target.value) || 28)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Color Texto</label>
                    <input
                      type="color"
                      value={editorTextColor}
                      onChange={e => setEditorTextColor(e.target.value)}
                      className="w-full h-8 bg-transparent border-0 outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Posición X</label>
                    <input
                      type="number"
                      value={editorTextX}
                      onChange={e => setEditorTextX(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Posición Y</label>
                    <input
                      type="number"
                      value={editorTextY}
                      onChange={e => setEditorTextY(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Color Fondo</label>
                    <input
                      type="color"
                      value={editorBgColor}
                      onChange={e => setEditorBgColor(e.target.value)}
                      className="w-full h-8 bg-transparent border-0 outline-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Imagen Fondo</label>
                    <MediaUploadUniversal
                      value={editorBgUrl}
                      onChange={url => setEditorBgUrl(url)}
                      category="banners"
                      allowedTypes={['image']}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Texto Botón</label>
                    <input
                      type="text"
                      value={editorBtnText}
                      onChange={e => setEditorBtnText(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Color Botón</label>
                    <input
                      type="color"
                      value={editorBtnColor}
                      onChange={e => setEditorBtnColor(e.target.value)}
                      className="w-full h-8 bg-transparent border-0 outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-900 pt-4 flex gap-3">
                <button
                  onClick={() => setBannerEditorModal(false)}
                  className="flex-1 bg-gray-900 hover:bg-gray-850 border border-gray-800 py-2 rounded-xl text-center font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="flex-1 bg-jn-red hover:bg-red-750 py-2 rounded-xl text-center font-black uppercase text-white shadow-lg shadow-red-950 cursor-pointer"
                >
                  Guardar & Publicar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
