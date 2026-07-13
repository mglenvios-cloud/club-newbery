"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Shield, Trophy, Users, Calendar, Star, Building,
  Plus, Edit, Trash, X, Check, AlertCircle, Save, Clock,
  Lock, Key, RefreshCw, Star as StarIcon, Info, Heart
} from 'lucide-react';

import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdministracionGeneral() {
  const [activeTab, setActiveTab] = useState('club');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data States
  const [clubConfig, setClubConfig] = useState({
    name: 'Club Jorge Newbery',
    shieldUrl: '',
    colorPrimary: '#CC0000',
    colorSecondary: '#FFFFFF',
    address: '',
    city: '',
    province: '',
    country: 'Argentina',
    phone: '',
    email: '',
    website: '',
    socialFacebook: '',
    socialInstagram: '',
    socialTwitter: '',
    socialYoutube: '',
    history: '',
    foundedDate: '',
    president: '',
    secretary: '',
    officeHours: ''
  });

  const [seasons, setSeasons] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal States
  const [seasonModal, setSeasonModal] = useState({ isOpen: false, editId: null });
  const [disciplineModal, setDisciplineModal] = useState({ isOpen: false, editId: null });
  const [sedeModal, setSedeModal] = useState({ isOpen: false, editId: null });
  const [facilityModal, setFacilityModal] = useState({ isOpen: false, editId: null });
  const [userModal, setUserModal] = useState({ isOpen: false, editId: null });
  const [roleModal, setRoleModal] = useState({ isOpen: false, editId: null });

  // Form States
  const [seasonForm, setSeasonForm] = useState({
    name: '', year: new Date().getFullYear(), startDate: '', endDate: '', status: 'PLANIFICADA', isActive: false, isDefault: false, sportYear: ''
  });
  const [disciplineForm, setDisciplineForm] = useState({
    name: '', icon: 'Trophy', color: '#CC0000', displayOrder: 0, manager: '', isActive: true, description: ''
  });
  const [sedeForm, setSedeForm] = useState({
    name: '', address: '', location: '', capacity: 0, status: 'ACTIVE', observations: ''
  });
  const [facilityForm, setFacilityForm] = useState({
    name: '', type: 'CANCHA', capacity: 0, status: 'ACTIVE', location: '', observations: '', sedeId: ''
  });
  const [userForm, setUserForm] = useState({
    email: '', password: '', role: 'SOCIO', name: '', isActive: true, roleId: ''
  });
  const [roleForm, setRoleForm] = useState({
    name: '', description: '', permissions: []
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch functions
  const fetchClubConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/club-config`);
      if (res.ok) {
        const data = await res.json();
        if (data.foundedDate) {
          data.foundedDate = data.foundedDate.split('T')[0];
        }
        setClubConfig(data);
      }
    } catch {
      showToast('Error al conectar con la API de configuración', 'error');
    }
  }, []);

  const fetchSeasons = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/seasons`);
      if (res.ok) setSeasons(await res.json());
    } catch {}
  }, []);

  const fetchDisciplines = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/disciplines`);
      if (res.ok) setDisciplines(await res.json());
    } catch {}
  }, []);

  const fetchSedes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/sedes`);
      if (res.ok) setSedes(await res.json());
    } catch {}
  }, []);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/facilities`);
      if (res.ok) setFacilities(await res.json());
    } catch {}
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/roles`);
      if (res.ok) setRoles(await res.json());
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin-general/users`);
      if (res.ok) setUsers(await res.json());
    } catch {}
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchClubConfig(),
      fetchSeasons(),
      fetchDisciplines(),
      fetchSedes(),
      fetchFacilities(),
      fetchRoles(),
      fetchUsers()
    ]);
    setLoading(false);
  }, [fetchClubConfig, fetchSeasons, fetchDisciplines, fetchSedes, fetchFacilities, fetchRoles, fetchUsers]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Operations
  const handleSaveClubConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin-general/club-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubConfig)
      });
      if (res.ok) {
        showToast('Configuración del club actualizada exitosamente');
        fetchClubConfig();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al actualizar', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleSaveSeason = async (e) => {
    e.preventDefault();
    const method = seasonModal.editId ? 'PUT' : 'POST';
    const url = seasonModal.editId
      ? `${API_URL}/api/admin-general/seasons/${seasonModal.editId}`
      : `${API_URL}/api/admin-general/seasons`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seasonForm)
      });
      if (res.ok) {
        showToast(seasonModal.editId ? 'Temporada actualizada' : 'Temporada creada');
        setSeasonModal({ isOpen: false, editId: null });
        fetchSeasons();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error de validación', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteSeason = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar esta temporada?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/seasons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Temporada eliminada');
        fetchSeasons();
      }
    } catch {}
  };

  const handleSaveDiscipline = async (e) => {
    e.preventDefault();
    const method = disciplineModal.editId ? 'PUT' : 'POST';
    const url = disciplineModal.editId
      ? `${API_URL}/api/admin-general/disciplines/${disciplineModal.editId}`
      : `${API_URL}/api/admin-general/disciplines`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disciplineForm)
      });
      if (res.ok) {
        showToast(disciplineModal.editId ? 'Disciplina actualizada' : 'Disciplina creada');
        setDisciplineModal({ isOpen: false, editId: null });
        fetchDisciplines();
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch {}
  };

  const handleDeleteDiscipline = async (id) => {
    if (!window.confirm('¿Eliminar disciplina de forma permanente?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/disciplines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Disciplina eliminada');
        fetchDisciplines();
      }
    } catch {}
  };

  const handleSaveSede = async (e) => {
    e.preventDefault();
    const method = sedeModal.editId ? 'PUT' : 'POST';
    const url = sedeModal.editId
      ? `${API_URL}/api/admin-general/sedes/${sedeModal.editId}`
      : `${API_URL}/api/admin-general/sedes`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sedeForm)
      });
      if (res.ok) {
        showToast(sedeModal.editId ? 'Sede actualizada' : 'Sede creada');
        setSedeModal({ isOpen: false, editId: null });
        fetchSedes();
      }
    } catch {}
  };

  const handleDeleteSede = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar esta Sede? Esto también eliminará todos sus espacios asociados.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/sedes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Sede eliminada');
        fetchSedes();
        fetchFacilities();
      }
    } catch {}
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    const method = facilityModal.editId ? 'PUT' : 'POST';
    const url = facilityModal.editId
      ? `${API_URL}/api/admin-general/facilities/${facilityModal.editId}`
      : `${API_URL}/api/admin-general/facilities`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facilityForm)
      });
      if (res.ok) {
        showToast(facilityModal.editId ? 'Instalación actualizada' : 'Instalación creada');
        setFacilityModal({ isOpen: false, editId: null });
        fetchFacilities();
        fetchSedes(); // update counters in sede list
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch {}
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('¿Eliminar instalación?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/facilities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Instalación eliminada');
        fetchFacilities();
        fetchSedes();
      }
    } catch {}
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const method = userModal.editId ? 'PUT' : 'POST';
    const url = userModal.editId
      ? `${API_URL}/api/admin-general/users/${userModal.editId}`
      : `${API_URL}/api/admin-general/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        showToast(userModal.editId ? 'Usuario actualizado' : 'Usuario creado');
        setUserModal({ isOpen: false, editId: null });
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || 'Error de validación', 'error');
      }
    } catch {}
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Eliminar este usuario del sistema?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Usuario eliminado');
        fetchUsers();
      }
    } catch {}
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    const method = roleModal.editId ? 'PUT' : 'POST';
    const url = roleModal.editId
      ? `${API_URL}/api/admin-general/roles/${roleModal.editId}`
      : `${API_URL}/api/admin-general/roles`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm)
      });
      if (res.ok) {
        showToast(roleModal.editId ? 'Rol actualizado' : 'Rol creado');
        setRoleModal({ isOpen: false, editId: null });
        fetchRoles();
      }
    } catch {}
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('¿Seguro de eliminar este rol?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-general/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Rol eliminado');
        fetchRoles();
      }
    } catch {}
  };

  const togglePermission = (perm) => {
    const isChecked = roleForm.permissions.includes(perm);
    const newPerms = isChecked
      ? roleForm.permissions.filter(p => p !== perm)
      : [...roleForm.permissions, perm];
    setRoleForm(prev => ({ ...prev, permissions: newPerms }));
  };

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
          <span className="text-xs font-black text-jn-red uppercase tracking-widest bg-red-100 px-3 py-1.5 rounded-full border border-jn-red/20">Configuración</span>
          <h1 className="text-3xl font-black uppercase mt-2">⚙️ Administración General</h1>
          <p className="text-gray-500 text-sm">Configuración institucional del club, temporadas, disciplinas, instalaciones físicas y control de usuarios.</p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs uppercase self-start shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:w-64 bg-jn-black text-white p-5 rounded-2xl flex flex-col gap-1 shadow-xl h-fit border border-white/5">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3">Módulos Administrativos</span>
          
          {[
            { id: 'club', label: '🛡️ Datos del Club', icon: <Settings size={16} /> },
            { id: 'temporadas', label: '📅 Temporadas', icon: <Calendar size={16} /> },
            { id: 'disciplinas', label: '🏆 Disciplinas', icon: <Trophy size={16} /> },
            { id: 'instalaciones', label: '🏢 Instalaciones', icon: <Building size={16} /> },
            { id: 'usuarios', label: '👥 Usuarios', icon: <Users size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-jn-red text-white shadow-md shadow-jn-red/30 translate-x-1'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT PANEL */}
        <div className="flex-1 min-w-0">
          
          {/* TAB: CLUB CONFIG */}
          {activeTab === 'club' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-gray-150">
                <Settings className="text-jn-red" size={24} />
                <div>
                  <h3 className="font-black text-lg uppercase">Configuración Institucional</h3>
                  <p className="text-xs text-gray-500">Datos informativos, escudo y paleta cromática institucional.</p>
                </div>
              </div>

              <form onSubmit={handleSaveClubConfig} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div className="md:col-span-2">
                    <label className="mb-1 block">Nombre Oficial del Club *</label>
                    <input
                      type="text" required
                      value={clubConfig.name}
                      onChange={e => setClubConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Fecha de Fundación</label>
                    <input
                      type="date"
                      value={clubConfig.foundedDate}
                      onChange={e => setClubConfig(prev => ({ ...prev, foundedDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div>
                    <label className="mb-1 block">Presidente</label>
                    <input
                      type="text"
                      value={clubConfig.president}
                      onChange={e => setClubConfig(prev => ({ ...prev, president: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Secretario</label>
                    <input
                      type="text"
                      value={clubConfig.secretary}
                      onChange={e => setClubConfig(prev => ({ ...prev, secretary: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Escudo / Logo URL</label>
                    <input
                      type="text"
                      value={clubConfig.shieldUrl || ''}
                      onChange={e => setClubConfig(prev => ({ ...prev, shieldUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="/images/escudo.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div>
                    <label className="mb-1 block">Color Primario (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={clubConfig.colorPrimary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={clubConfig.colorPrimary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block">Color Secundario (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={clubConfig.colorSecondary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={clubConfig.colorSecondary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div>
                    <label className="mb-1 block">Dirección</label>
                    <input
                      type="text"
                      value={clubConfig.address}
                      onChange={e => setClubConfig(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Ciudad / C.P.</label>
                    <input
                      type="text"
                      value={clubConfig.city}
                      onChange={e => setClubConfig(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Provincia / Estado</label>
                    <input
                      type="text"
                      value={clubConfig.province}
                      onChange={e => setClubConfig(prev => ({ ...prev, province: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div>
                    <label className="mb-1 block">Teléfono</label>
                    <input
                      type="text"
                      value={clubConfig.phone}
                      onChange={e => setClubConfig(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Correo Electrónico</label>
                    <input
                      type="email"
                      value={clubConfig.email}
                      onChange={e => setClubConfig(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 lowercase"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Sitio Web</label>
                    <input
                      type="text"
                      value={clubConfig.website}
                      onChange={e => setClubConfig(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 lowercase"
                      placeholder="www.clubjorgenewbery.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-600 uppercase">
                  <div>
                    <label className="mb-1 block">Facebook</label>
                    <input
                      type="text"
                      value={clubConfig.socialFacebook}
                      onChange={e => setClubConfig(prev => ({ ...prev, socialFacebook: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 lowercase"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block">Instagram</label>
                    <input
                      type="text"
                      value={clubConfig.socialInstagram}
                      onChange={e => setClubConfig(prev => ({ ...prev, socialInstagram: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 lowercase"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-600 uppercase">
                  <label className="mb-1 block">Horarios de Atención de Secretaría</label>
                  <input
                    type="text"
                    value={clubConfig.officeHours}
                    onChange={e => setClubConfig(prev => ({ ...prev, officeHours: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Lunes a Viernes de 09:00 a 18:00 hs"
                  />
                </div>

                <div className="text-xs font-bold text-gray-600 uppercase">
                  <label className="mb-1 block">Historia Institucional</label>
                  <textarea
                    value={clubConfig.history}
                    onChange={e => setClubConfig(prev => ({ ...prev, history: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3 px-6 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-jn-red/20"
                  >
                    <Save size={16} /> Guardar Configuración
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: TEMPORADAS */}
          {activeTab === 'temporadas' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSeasonForm({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '', status: 'PLANIFICADA', isActive: false, isDefault: false, sportYear: '' });
                    setSeasonModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Nueva Temporada
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Temporada</th>
                      <th className="p-4">Año Deportivo</th>
                      <th className="p-4">Periodo</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {seasons.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-400 text-xs py-8">Sin temporadas registradas. Crea una para comenzar.</td>
                      </tr>
                    ) : seasons.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <p>{s.name}</p>
                          <span className="text-[10px] text-gray-400 font-bold font-mono">ID: {s.id}</span>
                        </td>
                        <td className="p-4 font-mono text-jn-red">{s.sportYear || s.year}</td>
                        <td className="p-4 text-xs text-gray-500 font-mono">
                          {new Date(s.startDate).toLocaleDateString('es-AR')} - {new Date(s.endDate).toLocaleDateString('es-AR')}
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                            s.status === 'ACTIVE' ? 'bg-green-100 text-green-700 animate-pulse' :
                            s.status === 'FINISHED' ? 'bg-gray-150 text-gray-600' :
                                                      'bg-blue-100 text-blue-700'
                          }`}>{s.status}</span>
                        </td>
                        <td className="p-4 space-y-1">
                          {s.isActive && <span className="block text-[8px] bg-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase text-center w-fit">Temporada Activa</span>}
                          {s.isDefault && <span className="block text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase text-center w-fit">Por Defecto</span>}
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setSeasonForm({
                                ...s,
                                startDate: s.startDate.split('T')[0],
                                endDate: s.endDate.split('T')[0]
                              });
                              setSeasonModal({ isOpen: true, editId: s.id });
                            }}
                            className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSeason(s.id)}
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
          )}

          {/* TAB: DISCIPLINAS */}
          {activeTab === 'disciplinas' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setDisciplineForm({ name: '', icon: 'Trophy', color: '#CC0000', displayOrder: 0, manager: '', isActive: true, description: '' });
                    setDisciplineModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Nueva Disciplina
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {disciplines.length === 0 ? (
                  <p className="text-gray-400 text-xs col-span-3 text-center py-8">Sin disciplinas registradas. Agrega disciplinas para el club.</p>
                ) : disciplines.map(d => (
                  <div key={d.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: d.color }}>
                          <Trophy size={18} />
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {d.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{d.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Orden: {d.displayOrder}</p>
                      </div>
                      {d.manager && <p className="text-xs text-gray-500"><span className="text-gray-400 font-bold">Coordinador:</span> {d.manager}</p>}
                      {d.description && <p className="text-xs text-gray-400 leading-relaxed font-medium">{d.description}</p>}
                    </div>
                    <div className="flex gap-2 justify-end mt-5 border-t pt-3 bg-gray-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                      <button
                        onClick={() => {
                          setDisciplineForm(d);
                          setDisciplineModal({ isOpen: true, editId: d.id });
                        }}
                        className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg bg-white"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteDiscipline(d.id)}
                        className="p-1.5 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg bg-white"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INSTALACIONES */}
          {activeTab === 'instalaciones' && (
            <div className="space-y-6">
              {/* Sedes */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-black text-base uppercase">Sedes del Club</h3>
                  <button
                    onClick={() => {
                      setSedeForm({ name: '', address: '', location: '', capacity: 0, status: 'ACTIVE', observations: '' });
                      setSedeModal({ isOpen: true, editId: null });
                    }}
                    className="bg-jn-red hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Nueva Sede
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sedes.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center col-span-2 py-4">Sin sedes creadas.</p>
                  ) : sedes.map(s => (
                    <div key={s.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-sm">{s.name}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => { setSedeForm(s); setSedeModal({ isOpen: true, editId: s.id }); }} className="text-gray-500 hover:text-black"><Edit size={12} /></button>
                          <button onClick={() => handleDeleteSede(s.id)} className="text-red-500 hover:text-red-700"><Trash size={12} /></button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-bold uppercase">{s.address} {s.location && `(${s.location})`}</p>
                      <div className="text-[10px] text-gray-400 flex justify-between">
                        <span>Capacidad: {s.capacity} personas</span>
                        <span>Instalaciones vinculadas: {s.facilities?.length || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instalaciones Específicas */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-black text-base uppercase">Espacios / Instalaciones</h3>
                  <button
                    onClick={() => {
                      setFacilityForm({ name: '', type: 'CANCHA', capacity: 0, status: 'ACTIVE', location: '', observations: '', sedeId: sedes[0]?.id || '' });
                      setFacilityModal({ isOpen: true, editId: null });
                    }}
                    className="bg-jn-red hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5"
                    disabled={sedes.length === 0}
                  >
                    <Plus size={14} /> Nueva Instalación
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {facilities.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center col-span-3 py-4">Sin instalaciones/espacios registrados.</p>
                  ) : facilities.map(f => {
                    const sede = sedes.find(s => s.id === f.sedeId);
                    return (
                      <div key={f.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 hover:shadow-sm relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] bg-red-100 text-jn-red px-1.5 py-0.5 rounded font-black uppercase">{f.type}</span>
                            <h4 className="font-black text-sm mt-1">{f.name}</h4>
                          </div>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            f.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            f.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                                                          'bg-red-100 text-red-700'
                          }`}>{f.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase"><span className="text-gray-400">Sede:</span> {sede?.name || 'Cargando...'}</p>
                        {f.location && <p className="text-xs text-gray-400">Ubicación: {f.location}</p>}
                        <div className="flex gap-2 justify-end border-t pt-2 mt-2">
                          <button onClick={() => { setFacilityForm(f); setFacilityModal({ isOpen: true, editId: f.id }); }} className="text-gray-500 hover:text-black"><Edit size={12} /></button>
                          <button onClick={() => handleDeleteFacility(f.id)} className="text-red-500 hover:text-red-700"><Trash size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: USUARIOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Roles */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-black text-base uppercase">Roles & Permisos del Sistema</h3>
                  <button
                    onClick={() => {
                      setRoleForm({ name: '', description: '', permissions: [] });
                      setRoleModal({ isOpen: true, editId: null });
                    }}
                    className="bg-jn-red hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Nuevo Rol
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center col-span-3 py-4">Sin roles configurados. Crea uno para comenzar.</p>
                  ) : roles.map(r => {
                    let perms = [];
                    try { perms = JSON.parse(r.permissions); } catch {}
                    return (
                      <div key={r.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 flex flex-col justify-between hover:shadow-sm">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <h4 className="font-black text-sm">{r.name}</h4>
                            <div className="flex gap-2">
                              <button onClick={() => { setRoleForm({ ...r, permissions: perms }); setRoleModal({ isOpen: true, editId: r.id }); }} className="text-gray-500 hover:text-black"><Edit size={12} /></button>
                              <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-700"><Trash size={12} /></button>
                            </div>
                          </div>
                          {r.description && <p className="text-xs text-gray-500 font-medium">{r.description}</p>}
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Permisos ({perms.length})</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {perms.map(p => (
                              <span key={p} className="text-[8px] bg-gray-150 text-gray-700 px-1.5 py-0.5 rounded font-black uppercase font-mono">{p}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Usuarios */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="font-black text-base uppercase">Usuarios Registrados</h3>
                  <button
                    onClick={() => {
                      setUserForm({ email: '', password: '', role: 'SOCIO', name: '', isActive: true, roleId: '' });
                      setUserModal({ isOpen: true, editId: null });
                    }}
                    className="bg-jn-red hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Registrar Usuario
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Email / Nombre</th>
                        <th className="p-4">Rol legacy</th>
                        <th className="p-4">Rol asignado</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <p>{u.email}</p>
                            {u.name && <span className="text-xs text-gray-400 font-medium block">{u.name}</span>}
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-black uppercase">{u.role}</span>
                          </td>
                          <td className="p-4">
                            {u.roleRel ? (
                              <span className="text-[10px] bg-red-50 text-jn-red px-2 py-0.5 rounded font-black uppercase border border-jn-red/10">{u.roleRel.name}</span>
                            ) : (
                              <span className="text-[10px] text-gray-400">Sin rol específico</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-4 text-right flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setUserForm({
                                  email: u.email,
                                  password: '',
                                  role: u.role,
                                  name: u.name || '',
                                  isActive: u.isActive,
                                  roleId: u.roleId || ''
                                });
                                setUserModal({ isOpen: true, editId: u.id });
                              }}
                              className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
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
            </div>
          )}

        </div>
      </div>

      {/* MODAL TEMPORADAS */}
      {seasonModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{seasonModal.editId ? 'Editar Temporada' : 'Nueva Temporada'}</h3>
              <button onClick={() => setSeasonModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre de la Temporada *</label>
                <input
                  type="text" required
                  value={seasonForm.name}
                  onChange={e => setSeasonForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  placeholder="Temporada 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Año *</label>
                  <input
                    type="number" required
                    value={seasonForm.year}
                    onChange={e => setSeasonForm(prev => ({ ...prev, year: parseInt(e.target.value) || '' }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Año Deportivo (Label)</label>
                  <input
                    type="text"
                    value={seasonForm.sportYear}
                    onChange={e => setSeasonForm(prev => ({ ...prev, sportYear: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    placeholder="2026 / Invierno"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Fecha Inicio *</label>
                  <input
                    type="date" required
                    value={seasonForm.startDate}
                    onChange={e => setSeasonForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Fecha Fin *</label>
                  <input
                    type="date" required
                    value={seasonForm.endDate}
                    onChange={e => setSeasonForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 border-t pt-3">
                <label className="mb-1 block">Estado de la temporada</label>
                <select
                  value={seasonForm.status}
                  onChange={e => setSeasonForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                >
                  <option value="PLANIFICADA">PLANIFICADA</option>
                  <option value="ACTIVE">ACTIVA</option>
                  <option value="FINISHED">FINALIZADA</option>
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonForm.isActive}
                    onChange={e => setSeasonForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-jn-red focus:ring-red-500"
                  />
                  <span>Temporada Activa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonForm.isDefault}
                    onChange={e => setSeasonForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded border-gray-300 text-jn-red focus:ring-red-500"
                  />
                  <span>Por Defecto</span>
                </label>
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DISCIPLINAS */}
      {disciplineModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{disciplineModal.editId ? 'Editar Disciplina' : 'Nueva Disciplina'}</h3>
              <button onClick={() => setDisciplineModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDiscipline} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre *</label>
                <input
                  type="text" required
                  value={disciplineForm.name}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Futsal AFA"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Color (Hex)</label>
                  <input
                    type="color"
                    value={disciplineForm.color}
                    onChange={e => setDisciplineForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-9 border border-gray-300 rounded cursor-pointer p-0 bg-transparent"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Orden Visual</label>
                  <input
                    type="number"
                    value={disciplineForm.displayOrder}
                    onChange={e => setDisciplineForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Responsable / Coordinador</label>
                <input
                  type="text"
                  value={disciplineForm.manager}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, manager: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Prof. Gómez"
                />
              </div>

              <div>
                <label className="mb-1 block">Descripción</label>
                <textarea
                  value={disciplineForm.description}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 h-20 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={disciplineForm.isActive}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-jn-red focus:ring-red-500"
                />
                <span>Disciplina Activa</span>
              </label>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SEDES */}
      {sedeModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{sedeModal.editId ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button onClick={() => setSedeModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSede} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre de la Sede *</label>
                <input
                  type="text" required
                  value={sedeForm.name}
                  onChange={e => setSedeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Sede Central"
                />
              </div>

              <div>
                <label className="mb-1 block">Dirección *</label>
                <input
                  type="text" required
                  value={sedeForm.address}
                  onChange={e => setSedeForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Ubicación Geográfica</label>
                  <input
                    type="text"
                    value={sedeForm.location}
                    onChange={e => setSedeForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                    placeholder="Echeverría 500"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Capacidad Personas</label>
                  <input
                    type="number"
                    value={sedeForm.capacity}
                    onChange={e => setSedeForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Observaciones</label>
                <textarea
                  value={sedeForm.observations}
                  onChange={e => setSedeForm(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 h-20 text-xs"
                />
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Sede
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTALACIONES */}
      {facilityModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{facilityModal.editId ? 'Editar Instalación' : 'Nueva Instalación'}</h3>
              <button onClick={() => setFacilityModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre / Código *</label>
                <input
                  type="text" required
                  value={facilityForm.name}
                  onChange={e => setFacilityForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Cancha Parquet Principal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Tipo de Espacio</label>
                  <select
                    value={facilityForm.type}
                    onChange={e => setFacilityForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    <option value="CANCHA">CANCHA</option>
                    <option value="GIMNASIO">GIMNASIO</option>
                    <option value="VESTUARIO">VESTUARIO</option>
                    <option value="OFICINA">OFICINA</option>
                    <option value="SALON">SALÓN</option>
                    <option value="QUINCHO">QUINCHO</option>
                    <option value="BUFFET">BUFFET</option>
                    <option value="DEPOSITO">DEPÓSITO</option>
                    <option value="OTHER">OTRO</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Capacidad</label>
                  <input
                    type="number"
                    value={facilityForm.capacity}
                    onChange={e => setFacilityForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Sede Vinculada *</label>
                  <select
                    value={facilityForm.sedeId}
                    onChange={e => setFacilityForm(prev => ({ ...prev, sedeId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Estado Operativo</label>
                  <select
                    value={facilityForm.status}
                    onChange={e => setFacilityForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    <option value="ACTIVE">OPERATIVA</option>
                    <option value="MAINTENANCE">EN MANTENIMIENTO</option>
                    <option value="INACTIVE">CLAUSURADA / INACTIVA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Ubicación Relativa (Ubicación en sede)</label>
                <input
                  type="text"
                  value={facilityForm.location}
                  onChange={e => setFacilityForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Planta Alta / Sector Norte"
                />
              </div>

              <div>
                <label className="mb-1 block">Observaciones</label>
                <textarea
                  value={facilityForm.observations}
                  onChange={e => setFacilityForm(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 h-20 text-xs"
                />
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Espacio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ROLES */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{roleModal.editId ? 'Editar Rol' : 'Nuevo Rol'}</h3>
              <button onClick={() => setRoleModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre del Rol *</label>
                <input
                  type="text" required
                  value={roleForm.name}
                  onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  placeholder="Administrador de Futsal"
                />
              </div>

              <div>
                <label className="mb-1 block">Descripción</label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="border-t pt-3">
                <label className="mb-2 block text-gray-400">Permisos del Sistema</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'READ_CLUB', label: 'Ver config. club' },
                    { key: 'WRITE_CLUB', label: 'Modificar club' },
                    { key: 'READ_SEASONS', label: 'Ver temporadas' },
                    { key: 'WRITE_SEASONS', label: 'Modificar temp.' },
                    { key: 'READ_SPORTS', label: 'Ver deportes' },
                    { key: 'WRITE_SPORTS', label: 'Modificar deportes' },
                    { key: 'READ_FACILITIES', label: 'Ver instalaciones' },
                    { key: 'WRITE_FACILITIES', label: 'Modificar instal.' },
                    { key: 'ADMIN_USERS', label: 'Controlar usuarios' }
                  ].map(p => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                        className="rounded border-gray-300 text-jn-red focus:ring-red-500"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Guardar Rol
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR USUARIOS */}
      {userModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg uppercase">{userModal.editId ? 'Editar Usuario' : 'Registrar Usuario'}</h3>
              <button onClick={() => setUserModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Correo Electrónico (Email) *</label>
                <input
                  type="email" required
                  value={userForm.email}
                  onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs lowercase"
                  disabled={!!userModal.editId}
                />
              </div>

              <div>
                <label className="mb-1 block">{userModal.editId ? 'Nueva Contraseña (dejar vacío si no cambia)' : 'Contraseña *'}</label>
                <input
                  type="password"
                  required={!userModal.editId}
                  value={userForm.password}
                  onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block">Nombre / Apellido</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Rol legacy</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    <option value="SOCIO">SOCIO</option>
                    <option value="FUTSAL">FUTSAL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Rol Asignado</label>
                  <select
                    value={userForm.roleId}
                    onChange={e => setUserForm(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-bold"
                  >
                    <option value="">Ninguno</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={userForm.isActive}
                  onChange={e => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-jn-red focus:ring-red-500"
                />
                <span>Usuario Activo en el Sistema</span>
              </label>

              <button type="submit" className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase py-3 rounded-xl text-xs transition-colors mt-2">
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
