"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, Shield, Trophy, Users, Calendar, Building, Plus, Edit, Trash2, X, Check,
  AlertCircle, Save, Clock, Lock, Key, RefreshCw, Info, Heart, ChevronLeft, ChevronRight,
  Search, Filter, Mail, Phone, MapPin, Globe, Bell, FileText, Award, ChevronUp, ChevronDown
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
  const [socios, setSocios] = useState([]);

  // Mock System Logs for Audit
  const [logs] = useState([
    { id: 1, action: 'Inicio de sesión', user: 'admin@clubnewbery.com', ip: '192.168.1.50', date: '2026-07-18 18:30:15', type: 'INFO' },
    { id: 2, action: 'Actualización de Club Config', user: 'admin@clubnewbery.com', ip: '192.168.1.50', date: '2026-07-18 18:12:04', type: 'SUCCESS' },
    { id: 3, action: 'Creación de Temporada 2026', user: 'secretaria@clubnewbery.com', ip: '192.168.1.55', date: '2026-07-18 17:45:22', type: 'SUCCESS' },
    { id: 4, action: 'Clausura temporal de vestuario', user: 'mantenimiento@clubnewbery.com', ip: '192.168.1.62', date: '2026-07-18 15:20:10', type: 'WARNING' },
    { id: 5, action: 'Fallo de autenticación', user: 'unknown@user.com', ip: '200.45.12.98', date: '2026-07-18 12:05:44', type: 'ERROR' }
  ]);

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

  // Filter & Search States (Seasons)
  const [seasonSearch, setSeasonSearch] = useState('');
  const [seasonStatusFilter, setSeasonStatusFilter] = useState('ALL');
  const [seasonCurrentPage, setSeasonCurrentPage] = useState(1);
  const [seasonSortField, setSeasonSortField] = useState('year');
  const [seasonSortDirection, setSeasonSortDirection] = useState('desc');

  // Filter & Search States (Disciplines)
  const [disciplineSearch, setDisciplineSearch] = useState('');
  const [disciplineActiveFilter, setDisciplineActiveFilter] = useState('ALL');
  const [disciplineCurrentPage, setDisciplineCurrentPage] = useState(1);
  const [disciplineSortField, setDisciplineSortField] = useState('name');
  const [disciplineSortDirection, setDisciplineSortDirection] = useState('asc');

  // Filter & Search States (Facilities)
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilitySedeFilter, setFacilitySedeFilter] = useState('ALL');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('ALL');
  const [facilityCurrentPage, setFacilityCurrentPage] = useState(1);
  const [facilitySortField, setFacilitySortField] = useState('name');
  const [facilitySortDirection, setFacilitySortDirection] = useState('asc');

  // Filter & Search States (Users)
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userSortField, setUserSortField] = useState('email');
  const [userSortDirection, setUserSortDirection] = useState('asc');

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

  // Fetch functions
  const fetchClubConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/club-config`);
      if (!checkAuthResponse(res)) return;
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
  }, [checkAuthResponse, showToast]);

  const fetchSeasons = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/seasons`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setSeasons(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchDisciplines = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/disciplines`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setDisciplines(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchSedes = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/sedes`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setSedes(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchFacilities = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/facilities`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setFacilities(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/roles`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setRoles(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin-general/users`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setUsers(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchSocios = useCallback(async () => {
    try {
      const res = await fetch(`/api/socios`);
      if (!checkAuthResponse(res)) return;
      if (res.ok) setSocios(await res.json());
    } catch {}
  }, [checkAuthResponse]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchClubConfig(),
      fetchSeasons(),
      fetchDisciplines(),
      fetchSedes(),
      fetchFacilities(),
      fetchRoles(),
      fetchUsers(),
      fetchSocios()
    ]);
    setLoading(false);
  }, [fetchClubConfig, fetchSeasons, fetchDisciplines, fetchSedes, fetchFacilities, fetchRoles, fetchUsers, fetchSocios]);

  // Auth check & load data on mount
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
      }, 1550);
    } else {
      const timer = setTimeout(() => {
        fetchAll();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [fetchAll, showToast]);

  // Operations
  const handleSaveClubConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin-general/club-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clubConfig)
      });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/seasons/${seasonModal.editId}`
      : `/api/admin-general/seasons`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seasonForm)
      });
      if (!checkAuthResponse(res)) return;
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
      const res = await fetch(`/api/admin-general/seasons/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/disciplines/${disciplineModal.editId}`
      : `/api/admin-general/disciplines`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disciplineForm)
      });
      if (!checkAuthResponse(res)) return;
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
      const res = await fetch(`/api/admin-general/disciplines/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/sedes/${sedeModal.editId}`
      : `/api/admin-general/sedes`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sedeForm)
      });
      if (!checkAuthResponse(res)) return;
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
      const res = await fetch(`/api/admin-general/sedes/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/facilities/${facilityModal.editId}`
      : `/api/admin-general/facilities`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facilityForm)
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast(facilityModal.editId ? 'Instalación actualizada' : 'Instalación creada');
        setFacilityModal({ isOpen: false, editId: null });
        fetchFacilities();
        fetchSedes();
      } else {
        const err = await res.json();
        showToast(err.error, 'error');
      }
    } catch {}
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('¿Eliminar instalación?')) return;
    try {
      const res = await fetch(`/api/admin-general/facilities/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/users/${userModal.editId}`
      : `/api/admin-general/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (!checkAuthResponse(res)) return;
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
      const res = await fetch(`/api/admin-general/users/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
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
      ? `/api/admin-general/roles/${roleModal.editId}`
      : `/api/admin-general/roles`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...roleForm,
          permissions: JSON.stringify(roleForm.permissions)
        })
      });
      if (!checkAuthResponse(res)) return;
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
      const res = await fetch(`/api/admin-general/roles/${id}`, { method: 'DELETE' });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast('Rol eliminado');
        fetchRoles();
      }
    } catch {}
  };

  const handleToggleRolePermission = async (role, permKey) => {
    let perms = [];
    try { perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions; } catch {}
    const isChecked = perms.includes(permKey);
    const newPerms = isChecked
      ? perms.filter(p => p !== permKey)
      : [...perms, permKey];

    try {
      const res = await fetch(`/api/admin-general/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: role.name,
          description: role.description,
          permissions: JSON.stringify(newPerms)
        })
      });
      if (!checkAuthResponse(res)) return;
      if (res.ok) {
        showToast(`Permiso actualizado para el rol: ${role.name}`);
        fetchRoles();
      }
    } catch {
      showToast('Error al actualizar permiso', 'error');
    }
  };

  const togglePermission = (perm) => {
    const isChecked = roleForm.permissions.includes(perm);
    const newPerms = isChecked
      ? roleForm.permissions.filter(p => p !== perm)
      : [...roleForm.permissions, perm];
    setRoleForm(prev => ({ ...prev, permissions: newPerms }));
  };

  // KPIs Calculations
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'ADMIN' || u.roleRel?.name?.toLowerCase().includes('admin')).length;
  const professors = users.filter(u => u.role === 'FUTSAL' || u.roleRel?.name?.toLowerCase().includes('profesor') || u.roleRel?.name?.toLowerCase().includes('prof')).length;
  const coachUsers = users.filter(u => u.roleRel?.name?.toLowerCase().includes('entrenador') || u.roleRel?.name?.toLowerCase().includes('coach')).length;
  const totalDisciplines = disciplines.length;
  const totalFacilities = facilities.length;
  const totalSocios = socios.length;
  const pendingNotifications = 3; // Mock value

  // Sort helpers
  const handleSortSeasons = (field) => {
    if (seasonSortField === field) {
      setSeasonSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSeasonSortField(field);
      setSeasonSortDirection('asc');
    }
  };

  const handleSortDisciplines = (field) => {
    if (disciplineSortField === field) {
      setDisciplineSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setDisciplineSortField(field);
      setDisciplineSortDirection('asc');
    }
  };

  const handleSortFacilities = (field) => {
    if (facilitySortField === field) {
      setFacilitySortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setFacilitySortField(field);
      setFacilitySortDirection('asc');
    }
  };

  const handleSortUsers = (field) => {
    if (userSortField === field) {
      setUserSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortField(field);
      setUserSortDirection('asc');
    }
  };

  // Inline filter evaluations for pagination bounds
  const filteredSeasons = (() => {
    let result = [...seasons];
    if (seasonSearch) {
      const q = seasonSearch.toLowerCase().trim();
      result = result.filter(s => s.name?.toLowerCase().includes(q) || s.year?.toString().includes(q) || s.sportYear?.toLowerCase().includes(q));
    }
    if (seasonStatusFilter !== 'ALL') {
      result = result.filter(s => s.status === seasonStatusFilter);
    }
    if (seasonSortField) {
      result.sort((a, b) => {
        let valA = a[seasonSortField];
        let valB = b[seasonSortField];
        if (valA < valB) return seasonSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return seasonSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();
  const seasonPageSize = 8;
  const seasonTotalPages = Math.ceil(filteredSeasons.length / seasonPageSize) || 1;
  const activeSeasonPage = seasonCurrentPage > seasonTotalPages ? seasonTotalPages : (seasonCurrentPage < 1 ? 1 : seasonCurrentPage);
  const paginatedSeasons = filteredSeasons.slice((activeSeasonPage - 1) * seasonPageSize, activeSeasonPage * seasonPageSize);

  const filteredDisciplines = (() => {
    let result = [...disciplines];
    if (disciplineSearch) {
      const q = disciplineSearch.toLowerCase().trim();
      result = result.filter(d => d.name?.toLowerCase().includes(q) || d.manager?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
    }
    if (disciplineActiveFilter !== 'ALL') {
      const isActive = disciplineActiveFilter === 'ACTIVE';
      result = result.filter(d => d.isActive === isActive);
    }
    if (disciplineSortField) {
      result.sort((a, b) => {
        let valA = a[disciplineSortField];
        let valB = b[disciplineSortField];
        if (valA < valB) return disciplineSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return disciplineSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();
  const disciplinePageSize = 8;
  const disciplineTotalPages = Math.ceil(filteredDisciplines.length / disciplinePageSize) || 1;
  const activeDisciplinePage = disciplineCurrentPage > disciplineTotalPages ? disciplineTotalPages : (disciplineCurrentPage < 1 ? 1 : disciplineCurrentPage);
  const paginatedDisciplines = filteredDisciplines.slice((activeDisciplinePage - 1) * disciplinePageSize, activeDisciplinePage * disciplinePageSize);

  const filteredFacilities = (() => {
    let result = [...facilities];
    if (facilitySearch) {
      const q = facilitySearch.toLowerCase().trim();
      result = result.filter(f => f.name?.toLowerCase().includes(q) || f.location?.toLowerCase().includes(q) || f.observations?.toLowerCase().includes(q));
    }
    if (facilitySedeFilter !== 'ALL') {
      result = result.filter(f => f.sedeId === facilitySedeFilter);
    }
    if (facilityTypeFilter !== 'ALL') {
      result = result.filter(f => f.type === facilityTypeFilter);
    }
    if (facilitySortField) {
      result.sort((a, b) => {
        let valA = a[facilitySortField];
        let valB = b[facilitySortField];
        if (valA < valB) return facilitySortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return facilitySortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();
  const facilityPageSize = 8;
  const facilityTotalPages = Math.ceil(filteredFacilities.length / facilityPageSize) || 1;
  const activeFacilityPage = facilityCurrentPage > facilityTotalPages ? facilityTotalPages : (facilityCurrentPage < 1 ? 1 : facilityCurrentPage);
  const paginatedFacilities = filteredFacilities.slice((activeFacilityPage - 1) * facilityPageSize, activeFacilityPage * facilityPageSize);

  const filteredUsers = (() => {
    let result = [...users];
    if (userSearch) {
      const q = userSearch.toLowerCase().trim();
      result = result.filter(u => u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q));
    }
    if (userRoleFilter !== 'ALL') {
      result = result.filter(u => u.role === userRoleFilter || u.roleRel?.id === userRoleFilter);
    }
    if (userSortField) {
      result.sort((a, b) => {
        let valA = a[userSortField];
        let valB = b[userSortField];
        if (userSortField === 'email') {
          valA = a.email?.toLowerCase() || '';
          valB = b.email?.toLowerCase() || '';
        }
        if (valA < valB) return userSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return userSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  })();
  const userPageSize = 10;
  const userTotalPages = Math.ceil(filteredUsers.length / userPageSize) || 1;
  const activeUserPage = userCurrentPage > userTotalPages ? userTotalPages : (userCurrentPage < 1 ? 1 : userCurrentPage);
  const paginatedUsers = filteredUsers.slice((activeUserPage - 1) * userPageSize, activeUserPage * userPageSize);

  // Permission definitions for Matriz and Roles
  const permissionKeys = [
    { key: 'READ_CLUB', label: 'Ver Configuración Club' },
    { key: 'WRITE_CLUB', label: 'Modificar Club' },
    { key: 'READ_SEASONS', label: 'Ver Temporadas' },
    { key: 'WRITE_SEASONS', label: 'Modificar Temporadas' },
    { key: 'READ_SPORTS', label: 'Ver Deportes/Disciplinas' },
    { key: 'WRITE_SPORTS', label: 'Modificar Deportes' },
    { key: 'READ_FACILITIES', label: 'Ver Instalaciones' },
    { key: 'WRITE_FACILITIES', label: 'Modificar Instalaciones' },
    { key: 'ADMIN_USERS', label: 'Controlar Usuarios' }
  ];

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2.5 shadow-2xl transition-all duration-300 text-white max-w-sm border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-jn-red uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              ERP Administrativo
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
              Club Jorge Newbery
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
            ⚙️ Administración General
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">Control institucional del club, temporadas, disciplinas, sedes, espacios físicos, roles y permisos de usuarios.</p>
        </div>
        <button
          onClick={fetchAll}
          className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 font-black text-[11px] uppercase self-start shadow-sm transition-all active:scale-95"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* KPI DASHBOARD - EJECUTIVO COMPACTO */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 animate-fade-in">
        {/* Total Usuarios */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Total Usuarios</span>
            <span className="text-slate-600 bg-slate-50 rounded p-0.5"><Users size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalUsers}</h4>
            <span className="text-[8px] text-slate-550 font-bold block mt-0.5">Registrados</span>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Admins</span>
            <span className="text-red-655 bg-red-50 rounded p-0.5"><Shield size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{adminUsers}</h4>
            <span className="text-[8px] text-red-500 font-bold block mt-0.5">Control Total</span>
          </div>
        </div>

        {/* Profesores */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Profesores</span>
            <span className="text-blue-500 bg-blue-50 rounded p-0.5"><Award size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{professors}</h4>
            <span className="text-[8px] text-blue-600 font-bold block mt-0.5">Cátedra Deportiva</span>
          </div>
        </div>

        {/* Entrenadores */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Entrenadores</span>
            <span className="text-amber-500 bg-amber-50 rounded p-0.5"><Award size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{coachUsers}</h4>
            <span className="text-[8px] text-amber-600 font-bold block mt-0.5">Técnicos</span>
          </div>
        </div>

        {/* Disciplinas */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Disciplinas</span>
            <span className="text-emerald-500 bg-emerald-50 rounded p-0.5"><Trophy size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalDisciplines}</h4>
            <span className="text-[8px] text-emerald-600 font-bold block mt-0.5">Deportes Activos</span>
          </div>
        </div>

        {/* Instalaciones */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Instalaciones</span>
            <span className="text-violet-500 bg-violet-50 rounded p-0.5"><Building size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalFacilities}</h4>
            <span className="text-[8px] text-violet-600 font-bold block mt-0.5">Espacios Físicos</span>
          </div>
        </div>

        {/* Socios */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Socios</span>
            <span className="text-pink-500 bg-pink-50 rounded p-0.5"><Users size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 leading-tight">{totalSocios}</h4>
            <span className="text-[8px] text-pink-600 font-bold block mt-0.5">Padrón Club</span>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow transition-all duration-200 flex flex-col justify-between h-20">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate">Notificaciones</span>
            <span className="text-rose-500 bg-rose-50 rounded p-0.5"><Bell size={12} /></span>
          </div>
          <div>
            <h4 className="text-base font-black text-rose-600 leading-tight">{pendingNotifications}</h4>
            <span className="text-[8px] text-rose-500 font-bold block mt-0.5">Mensajes Sistema</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex gap-4 border-b border-slate-200 mb-5 overflow-x-auto pb-1 text-xs font-black uppercase tracking-wider">
        {[
          { id: 'club', label: '🛡️ Identidad Club' },
          { id: 'temporadas', label: '📅 Temporadas' },
          { id: 'disciplinas', label: '🏆 Disciplinas' },
          { id: 'instalaciones', label: '🏢 Sedes e Instalaciones' },
          { id: 'usuarios', label: '👥 Usuarios y Roles' },
          { id: 'permisos', label: '🔑 Matriz de Permisos' },
          { id: 'logs', label: '📋 Logs & Auditoría' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* TAB CONTENT: CLUB CONFIG */}
      {activeTab === 'club' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 mb-5">
            <Settings className="text-jn-red" size={20} />
            <div>
              <h3 className="font-black text-sm uppercase text-slate-800">Configuración Institucional</h3>
              <p className="text-[11px] text-slate-500">Administración de datos informativos, escudo y paleta visual del club.</p>
            </div>
          </div>

          <form onSubmit={handleSaveClubConfig} className="space-y-5 text-[10px] font-black text-slate-500 uppercase">
            {/* Sección 1: Datos Institucionales */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <p className="text-[11px] text-slate-800 border-b pb-1 font-black">🏢 Datos Institucionales</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="mb-0.5 block">Nombre Oficial del Club *</label>
                  <input
                    type="text" required
                    value={clubConfig.name}
                    onChange={e => setClubConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Fecha de Fundación</label>
                  <input
                    type="date"
                    value={clubConfig.foundedDate}
                    onChange={e => setClubConfig(prev => ({ ...prev, foundedDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-0.5 block">Presidente</label>
                  <input
                    type="text"
                    value={clubConfig.president}
                    onChange={e => setClubConfig(prev => ({ ...prev, president: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Secretario</label>
                  <input
                    type="text"
                    value={clubConfig.secretary}
                    onChange={e => setClubConfig(prev => ({ ...prev, secretary: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Colores y Logo */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <p className="text-[11px] text-slate-800 border-b pb-1 font-black">🎨 Identidad Visual y Escudo</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="mb-0.5 block">URL del Escudo / Logotipo</label>
                  <input
                    type="text"
                    value={clubConfig.shieldUrl || ''}
                    onChange={e => setClubConfig(prev => ({ ...prev, shieldUrl: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    placeholder="/images/escudo.png"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-0.5 block">Color Primario</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={clubConfig.colorPrimary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                        className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={clubConfig.colorPrimary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorPrimary: e.target.value }))}
                        className="w-16 border border-slate-200 rounded text-[9px] font-mono p-1 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="mb-0.5 block">Color Secundario</label>
                    <div className="flex gap-1.5 items-center">
                      <input
                        type="color"
                        value={clubConfig.colorSecondary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                        className="w-8 h-8 rounded border border-slate-200 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={clubConfig.colorSecondary}
                        onChange={e => setClubConfig(prev => ({ ...prev, colorSecondary: e.target.value }))}
                        className="w-16 border border-slate-200 rounded text-[9px] font-mono p-1 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Datos de Contacto */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <p className="text-[11px] text-slate-800 border-b pb-1 font-black">📞 Medios de Contacto y Redes</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="mb-0.5 block">Dirección Principal</label>
                  <input
                    type="text"
                    value={clubConfig.address}
                    onChange={e => setClubConfig(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Ciudad</label>
                  <input
                    type="text"
                    value={clubConfig.city}
                    onChange={e => setClubConfig(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Provincia / Región</label>
                  <input
                    type="text"
                    value={clubConfig.province}
                    onChange={e => setClubConfig(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="mb-0.5 block">Teléfono de Secretaría</label>
                  <input
                    type="text"
                    value={clubConfig.phone}
                    onChange={e => setClubConfig(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Correo Electrónico</label>
                  <input
                    type="email"
                    value={clubConfig.email}
                    onChange={e => setClubConfig(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Sitio Web</label>
                  <input
                    type="text"
                    value={clubConfig.website}
                    onChange={e => setClubConfig(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                    placeholder="www.clubjorgenewbery.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="mb-0.5 block flex items-center gap-1">
                    <svg className="text-blue-650 w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg> Facebook
                  </label>
                  <input
                    type="text"
                    value={clubConfig.socialFacebook}
                    onChange={e => setClubConfig(prev => ({ ...prev, socialFacebook: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block flex items-center gap-1">
                    <svg className="text-pink-600 w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg> Instagram
                  </label>
                  <input
                    type="text"
                    value={clubConfig.socialInstagram}
                    onChange={e => setClubConfig(prev => ({ ...prev, socialInstagram: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block flex items-center gap-1">
                    <svg className="text-sky-500 w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg> Twitter
                  </label>
                  <input
                    type="text"
                    value={clubConfig.socialTwitter}
                    onChange={e => setClubConfig(prev => ({ ...prev, socialTwitter: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block flex items-center gap-1">
                    <svg className="text-red-600 w-3 h-3 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.048 0 12 0 12s0 3.952.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.885.502-5.837.502-5.837s0-3.952-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg> YouTube
                  </label>
                  <input
                    type="text"
                    value={clubConfig.socialYoutube}
                    onChange={e => setClubConfig(prev => ({ ...prev, socialYoutube: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold lowercase"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <p className="text-[11px] text-slate-800 border-b pb-1 font-black">📅 Horarios y Reseña</p>
              <div>
                <label className="mb-0.5 block">Horarios de Atención Secretaría</label>
                <input
                  type="text"
                  value={clubConfig.officeHours}
                  onChange={e => setClubConfig(prev => ({ ...prev, officeHours: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  placeholder="Lunes a Viernes de 09:00 a 18:00 hs"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Historia Breve / Estatuto General</label>
                <textarea
                  value={clubConfig.history}
                  onChange={e => setClubConfig(prev => ({ ...prev, history: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold h-24 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-2.5 px-6 rounded-lg text-[10px] transition-colors flex items-center gap-1.5 shadow-md shadow-red-700/20 active:scale-95"
              >
                <Save size={13} /> Guardar Configuración del Club
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB CONTENT: TEMPORADAS */}
      {activeTab === 'temporadas' && (
        <div className="space-y-4 text-left">
          {/* SEARCH, FILTERS & ADD ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="min-w-[180px] border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-500 focus-within:bg-white transition-all">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  value={seasonSearch}
                  onChange={e => { setSeasonSearch(e.target.value); setSeasonCurrentPage(1); }}
                  placeholder="Buscar temporada..."
                  className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
                />
                {seasonSearch && (
                  <button onClick={() => { setSeasonSearch(''); setSeasonCurrentPage(1); }} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={seasonStatusFilter}
                onChange={e => { setSeasonStatusFilter(e.target.value); setSeasonCurrentPage(1); }}
                className="border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-black uppercase bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="ALL">TODOS LOS ESTADOS</option>
                <option value="ACTIVE">ACTIVAS</option>
                <option value="PLANIFICADA">PLANIFICADAS</option>
                <option value="FINISHED">FINALIZADAS</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSeasonForm({ name: '', year: new Date().getFullYear(), startDate: '', endDate: '', status: 'PLANIFICADA', isActive: false, isDefault: false, sportYear: '' });
                setSeasonModal({ isOpen: true, editId: null });
              }}
              className="bg-jn-red hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs self-start"
            >
              <Plus size={13} /> Registrar Temporada
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[450px] overflow-y-auto relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
                <tr>
                  <th onClick={() => handleSortSeasons('name')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-0.5">
                      Nombre
                      {seasonSortField === 'name' && (seasonSortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </div>
                  </th>
                  <th onClick={() => handleSortSeasons('year')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-0.5">
                      Año Calendario
                      {seasonSortField === 'year' && (seasonSortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </div>
                  </th>
                  <th className="p-3">Año Deportivo</th>
                  <th className="p-3">Periodo Oficial</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Configuraciones</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {paginatedSeasons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 text-xs py-14">Sin temporadas registradas que coincidan con la búsqueda.</td>
                  </tr>
                ) : paginatedSeasons.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">
                      {s.name}
                      <span className="block text-[8px] text-slate-400 font-mono">ID: {s.id}</span>
                    </td>
                    <td className="p-2.5 font-mono">{s.year}</td>
                    <td className="p-2.5 text-slate-655 font-bold">{s.sportYear || s.year}</td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-500">
                      {new Date(s.startDate).toLocaleDateString('es-AR')} - {new Date(s.endDate).toLocaleDateString('es-AR')}
                    </td>
                    <td className="p-2.5">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                        s.status === 'ACTIVE' ? 'bg-green-50 border-green-200 text-green-700 animate-pulse' :
                        s.status === 'FINISHED' ? 'bg-slate-100 border-slate-200 text-slate-600' :
                                                  'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>{s.status === 'ACTIVE' ? 'ACTIVA' : s.status}</span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {s.isActive && <span className="text-[7px] bg-red-50 text-jn-red border border-red-150 px-1.5 py-0.2 rounded font-black uppercase">Activa</span>}
                        {s.isDefault && <span className="text-[7px] bg-blue-50 text-blue-700 border border-blue-150 px-1.5 py-0.2 rounded font-black uppercase">Default</span>}
                      </div>
                    </td>
                    <td className="p-2.5 text-right flex gap-1 justify-end">
                      <button
                        onClick={() => {
                          setSeasonForm({
                            ...s,
                            startDate: s.startDate.split('T')[0],
                            endDate: s.endDate.split('T')[0]
                          });
                          setSeasonModal({ isOpen: true, editId: s.id });
                        }}
                        className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-655"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteSeason(s.id)}
                        className="p-1 border border-red-100 hover:bg-red-55 text-white rounded bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-bold text-slate-500">
            <span className="text-[10px] text-slate-400">
              Mostrando {(activeSeasonPage - 1) * seasonPageSize + 1} a {Math.min(activeSeasonPage * seasonPageSize, filteredSeasons.length)} de {filteredSeasons.length} temporadas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeSeasonPage === 1}
                onClick={() => setSeasonCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2.5">Pág {activeSeasonPage} de {seasonTotalPages}</span>
              <button
                disabled={activeSeasonPage === seasonTotalPages}
                onClick={() => setSeasonCurrentPage(prev => Math.min(prev + 1, seasonTotalPages))}
                className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DISCIPLINAS */}
      {activeTab === 'disciplinas' && (
        <div className="space-y-4 text-left">
          {/* SEARCH, FILTER & ADD */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
            <div className="flex flex-wrap gap-2 items-center flex-1">
              <div className="min-w-[180px] border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-550 focus-within:bg-white transition-all">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  value={disciplineSearch}
                  onChange={e => { setDisciplineSearch(e.target.value); setDisciplineCurrentPage(1); }}
                  placeholder="Buscar disciplina..."
                  className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
                />
                {disciplineSearch && (
                  <button onClick={() => { setDisciplineSearch(''); setDisciplineCurrentPage(1); }} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={disciplineActiveFilter}
                onChange={e => { setDisciplineActiveFilter(e.target.value); setDisciplineCurrentPage(1); }}
                className="border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-black uppercase bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="ALL">TODAS LAS DISCIPLINAS</option>
                <option value="ACTIVE">ACTIVAS</option>
                <option value="INACTIVE">INACTIVAS</option>
              </select>
            </div>

            <button
              onClick={() => {
                setDisciplineForm({ name: '', icon: 'Trophy', color: '#CC0000', displayOrder: 0, manager: '', isActive: true, description: '' });
                setDisciplineModal({ isOpen: true, editId: null });
              }}
              className="bg-jn-red hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
            >
              <Plus size={13} /> Nueva Disciplina
            </button>
          </div>

          {/* TABLE LIST */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[450px] overflow-y-auto relative">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
                <tr>
                  <th className="p-3 w-12 text-center">Color</th>
                  <th onClick={() => handleSortDisciplines('name')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-0.5">
                      Nombre Disciplina
                      {disciplineSortField === 'name' && (disciplineSortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </div>
                  </th>
                  <th className="p-3">Coordinador / Responsable</th>
                  <th className="p-3">Orden Visual</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {paginatedDisciplines.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 text-xs py-14">Sin disciplinas cargadas en el sistema.</td>
                  </tr>
                ) : paginatedDisciplines.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-center">
                      <span className="w-5 h-5 rounded-full inline-block border shadow-2xs" style={{ backgroundColor: d.color || '#CC0000' }} />
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {d.name}
                      {d.description && <span className="block text-[8px] text-slate-400 font-medium normal-case truncate max-w-xs">{d.description}</span>}
                    </td>
                    <td className="p-2.5 text-slate-655">{d.manager || 'No Asignado'}</td>
                    <td className="p-2.5 font-mono">{d.displayOrder}</td>
                    <td className="p-2.5">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                        d.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-150 border-slate-200 text-slate-600'
                      }`}>{d.isActive ? 'ACTIVA' : 'INACTIVA'}</span>
                    </td>
                    <td className="p-2.5 text-right flex gap-1 justify-end">
                      <button
                        onClick={() => { setDisciplineForm(d); setDisciplineModal({ isOpen: true, editId: d.id }); }}
                        className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-655"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteDiscipline(d.id)}
                        className="p-1 border border-red-100 hover:bg-red-55 text-white rounded bg-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-bold text-slate-500">
            <span className="text-[10px] text-slate-400">
              Mostrando {(activeDisciplinePage - 1) * disciplinePageSize + 1} a {Math.min(activeDisciplinePage * disciplinePageSize, filteredDisciplines.length)} de {filteredDisciplines.length} disciplinas
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={activeDisciplinePage === 1}
                onClick={() => setDisciplineCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2.5">Pág {activeDisciplinePage} de {disciplineTotalPages}</span>
              <button
                disabled={activeDisciplinePage === disciplineTotalPages}
                onClick={() => setDisciplineCurrentPage(prev => Math.min(prev + 1, disciplineTotalPages))}
                className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INSTALACIONES Y SEDES */}
      {activeTab === 'instalaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Sedes (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-xs uppercase text-slate-800">Sedes del Club</h3>
              <button
                onClick={() => {
                  setSedeForm({ name: '', address: '', location: '', capacity: 0, status: 'ACTIVE', observations: '' });
                  setSedeModal({ isOpen: true, editId: null });
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus size={11} /> Nueva Sede
              </button>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {sedes.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-6">Sin sedes creadas.</p>
              ) : sedes.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs font-semibold relative">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900">{s.name}</h4>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setSedeForm(s); setSedeModal({ isOpen: true, editId: s.id }); }} className="text-slate-400 hover:text-slate-700 transition-colors"><Edit size={12} /></button>
                      <button onClick={() => handleDeleteSede(s.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1"><MapPin size={10} className="text-slate-400" /> {s.address}</p>
                  <div className="text-[9px] text-slate-400 flex justify-between mt-2 pt-2 border-t border-slate-100 uppercase">
                    <span>Aforo: {s.capacity || 'N/A'}</span>
                    <span>Espacios: {s.facilities?.length || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instalaciones (8 cols) */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                <div className="min-w-[150px] border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-500 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    value={facilitySearch}
                    onChange={e => { setFacilitySearch(e.target.value); setFacilityCurrentPage(1); }}
                    placeholder="Buscar instalación..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
                  />
                  {facilitySearch && (
                    <button onClick={() => { setFacilitySearch(''); setFacilityCurrentPage(1); }} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={facilitySedeFilter}
                  onChange={e => { setFacilitySedeFilter(e.target.value); setFacilityCurrentPage(1); }}
                  className="border border-slate-200 rounded px-2 py-1.5 text-[9px] font-black uppercase bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">TODAS LAS SEDES</option>
                  {sedes.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                </select>

                <select
                  value={facilityTypeFilter}
                  onChange={e => { setFacilityTypeFilter(e.target.value); setFacilityCurrentPage(1); }}
                  className="border border-slate-200 rounded px-2 py-1.5 text-[9px] font-black uppercase bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">TODOS LOS TIPOS</option>
                  <option value="CANCHA">CANCHA</option>
                  <option value="GIMNASIO">GIMNASIO</option>
                  <option value="VESTUARIO">VESTUARIO</option>
                  <option value="QUINCHO">QUINCHO</option>
                  <option value="BUFFET">BUFFET</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFacilityForm({ name: '', type: 'CANCHA', capacity: 0, status: 'ACTIVE', location: '', observations: '', sedeId: sedes[0]?.id || '' });
                  setFacilityModal({ isOpen: true, editId: null });
                }}
                className="bg-jn-red hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs disabled:opacity-40"
                disabled={sedes.length === 0}
              >
                <Plus size={13} /> Nueva Instalación
              </button>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto relative">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
                  <tr>
                    <th onClick={() => handleSortFacilities('name')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-0.5">
                        Instalación / Código
                        {facilitySortField === 'name' && (facilitySortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                      </div>
                    </th>
                    <th className="p-3">Sede</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Capacidad</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {paginatedFacilities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-xs py-12">No hay instalaciones registradas o que coincidan.</td>
                    </tr>
                  ) : paginatedFacilities.map(f => {
                    const sede = sedes.find(s => s.id === f.sedeId);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900">
                          {f.name}
                          {f.location && <span className="block text-[8px] text-slate-400 font-medium normal-case">{f.location}</span>}
                        </td>
                        <td className="p-2.5 text-slate-655">{sede?.name || 'Cargando...'}</td>
                        <td className="p-2.5"><span className="text-[8px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border uppercase">{f.type}</span></td>
                        <td className="p-2.5 font-mono">{f.capacity || 'N/A'} pers.</td>
                        <td className="p-2.5">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                            f.status === 'ACTIVE' ? 'bg-green-50 border-green-200 text-green-700' :
                            f.status === 'MAINTENANCE' ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' :
                                                          'bg-red-50 border-red-200 text-red-700'
                          }`}>{f.status === 'ACTIVE' ? 'OPERATIVA' : f.status === 'MAINTENANCE' ? 'MANTENIMIENTO' : 'CLAUSURADA'}</span>
                        </td>
                        <td className="p-2.5 text-right flex gap-1 justify-end">
                          <button
                            onClick={() => { setFacilityForm(f); setFacilityModal({ isOpen: true, editId: f.id }); }}
                            className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-655"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteFacility(f.id)}
                            className="p-1 border border-red-100 hover:bg-red-55 text-white rounded bg-red-500"
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

            {/* PAGINATION */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-bold text-slate-500">
              <span className="text-[10px] text-slate-400">
                Mostrando {(activeFacilityPage - 1) * facilityPageSize + 1} a {Math.min(activeFacilityPage * facilityPageSize, filteredFacilities.length)} de {filteredFacilities.length} instalaciones
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={activeFacilityPage === 1}
                  onClick={() => setFacilityCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-2.5">Pág {activeFacilityPage} de {facilityTotalPages}</span>
                <button
                  disabled={activeFacilityPage === facilityTotalPages}
                  onClick={() => setFacilityCurrentPage(prev => Math.min(prev + 1, facilityTotalPages))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USUARIOS Y ROLES */}
      {activeTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Roles (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-xs uppercase text-slate-800">Roles del Sistema</h3>
              <button
                onClick={() => {
                  setRoleForm({ name: '', description: '', permissions: [] });
                  setRoleModal({ isOpen: true, editId: null });
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 transition-all active:scale-95"
              >
                <Plus size={11} /> Nuevo Rol
              </button>
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {roles.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-6">Sin roles configurados.</p>
              ) : roles.map(r => {
                let perms = [];
                try { perms = typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions; } catch {}
                return (
                  <div key={r.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs font-semibold relative space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{r.name}</h4>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setRoleForm({ ...r, permissions: perms }); setRoleModal({ isOpen: true, editId: r.id }); }} className="text-slate-400 hover:text-slate-700 transition-colors"><Edit size={12} /></button>
                        <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    {r.description && <p className="text-[10px] text-slate-500 font-medium normal-case leading-relaxed">{r.description}</p>}
                    <div className="flex flex-wrap gap-0.5 pt-2">
                      {perms.map(p => (
                        <span key={p} className="text-[7px] bg-slate-200/80 text-slate-600 px-1 py-0.2 rounded font-mono font-black uppercase">{p}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Usuarios List (8 cols) */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                <div className="min-w-[150px] border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-2 bg-slate-50 focus-within:ring-1 focus-within:ring-red-550 focus-within:bg-white transition-all">
                  <Search size={14} className="text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => { setUserSearch(e.target.value); setUserCurrentPage(1); }}
                    placeholder="Buscar usuario..."
                    className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
                  />
                  {userSearch && (
                    <button onClick={() => { setUserSearch(''); setUserCurrentPage(1); }} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={userRoleFilter}
                  onChange={e => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}
                  className="border border-slate-200 rounded px-2.5 py-1.5 text-[9px] font-black uppercase bg-slate-50 text-slate-700 focus:outline-none"
                >
                  <option value="ALL">TODOS LOS ROLES</option>
                  <option value="ADMIN">ADMIN (LEGACY)</option>
                  <option value="SOCIO">SOCIO (LEGACY)</option>
                  <option value="FUTSAL">FUTSAL (LEGACY)</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                </select>
              </div>

              <button
                onClick={() => {
                  setUserForm({ email: '', password: '', role: 'SOCIO', name: '', isActive: true, roleId: '' });
                  setUserModal({ isOpen: true, editId: null });
                }}
                className="bg-jn-red hover:bg-red-700 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
              >
                <Plus size={13} /> Registrar Usuario
              </button>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[400px] overflow-y-auto relative">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10 text-slate-400 font-bold uppercase tracking-wider text-[10px] select-none">
                  <tr>
                    <th onClick={() => handleSortUsers('email')} className="p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-0.5">
                        Email / Usuario
                        {userSortField === 'email' && (userSortDirection === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                      </div>
                    </th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">Rol Legacy</th>
                    <th className="p-3">Rol Asignado</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 text-xs py-12">No hay usuarios cargados en el sistema.</td>
                    </tr>
                  ) : paginatedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-900 lowercase">{u.email}</td>
                      <td className="p-2.5 text-slate-655">{u.name || 'Sin especificar'}</td>
                      <td className="p-2.5"><span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border uppercase">{u.role}</span></td>
                      <td className="p-2.5">
                        {u.roleRel ? (
                          <span className="text-[8px] bg-red-50 text-jn-red border border-red-150 px-1.5 py-0.5 rounded font-black uppercase">{u.roleRel.name}</span>
                        ) : (
                          <span className="text-[8px] text-slate-400">Sin Rol Asignado</span>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${
                          u.isActive ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>{u.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                      </td>
                      <td className="p-2.5 text-right flex gap-1 justify-end">
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
                          className="p-1 border border-slate-200 hover:bg-slate-100 rounded bg-white text-slate-655"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 border border-red-100 hover:bg-red-55 text-white rounded bg-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs text-xs font-bold text-slate-500">
              <span className="text-[10px] text-slate-400">
                Mostrando {(activeUserPage - 1) * userPageSize + 1} a {Math.min(activeUserPage * userPageSize, filteredUsers.length)} de {filteredUsers.length} usuarios
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={activeUserPage === 1}
                  onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="px-2.5">Pág {activeUserPage} de {userTotalPages}</span>
                <button
                  disabled={activeUserPage === userTotalPages}
                  onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, userTotalPages))}
                  className="px-2 py-1 border rounded bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERMISOS MATRIX (INTERACTIVA COMPLETA) */}
      {activeTab === 'permisos' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 text-left">
          <div className="border-b pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900">🔒 Matriz Interactiva de Permisos</h3>
              <p className="text-xs text-slate-500 font-semibold">Configuración de accesos por Rol sobre los endpoints del ERP en tiempo real.</p>
            </div>
            <span className="text-[9px] font-black bg-red-50 border border-red-200 text-jn-red px-2.5 py-1 rounded-full uppercase">Acción Autoguardable</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                  <th className="p-3 w-64 border-r">Permiso / Capacidad del Sistema</th>
                  {roles.length === 0 ? (
                    <th className="p-3 text-center">Sin Roles</th>
                  ) : roles.map(r => (
                    <th key={r.id} className="p-3 text-center font-bold text-slate-900 border-r">{r.name.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {permissionKeys.map(perm => (
                  <tr key={perm.key} className="hover:bg-slate-50/50">
                    <td className="p-3 border-r">
                      <span className="text-slate-900 block">{perm.label}</span>
                      <span className="text-[8px] font-mono text-slate-400 uppercase font-black">{perm.key}</span>
                    </td>
                    {roles.length === 0 ? (
                      <td className="p-3 text-center text-slate-400 font-medium border-r">N/A</td>
                    ) : roles.map(r => {
                      let perms = [];
                      try { perms = typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions; } catch {}
                      const isGranted = perms.includes(perm.key);
                      return (
                        <td key={r.id} className="p-3 text-center border-r select-none">
                          <label className="inline-flex items-center justify-center p-1 rounded hover:bg-slate-150 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => handleToggleRolePermission(r, perm.key)}
                              className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-4 h-4 cursor-pointer"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard roles reference block */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-black text-xs uppercase text-slate-800 flex items-center gap-1"><Info size={14} className="text-slate-500" /> Referencia Visual de Jerarquías de Accesos</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] text-slate-550 leading-relaxed font-semibold">
              <div className="bg-white p-2.5 rounded border">
                <p className="font-bold text-slate-900 uppercase">🛡️ Administrador</p>
                <p className="text-[9px] mt-0.5 text-slate-400">Acceso total e irrestricto en todos los módulos y bases de datos.</p>
              </div>
              <div className="bg-white p-2.5 rounded border">
                <p className="font-bold text-slate-900 uppercase">👥 Secretaría</p>
                <p className="text-[9px] mt-0.5 text-slate-400">Ver y editar socios, temporadas, disciplinas, y emitir cobros.</p>
              </div>
              <div className="bg-white p-2.5 rounded border">
                <p className="font-bold text-slate-900 uppercase">💵 Tesorería</p>
                <p className="text-[9px] mt-0.5 text-slate-400">Control de cobros, egresos, caja diaria y reportes analíticos.</p>
              </div>
              <div className="bg-white p-2.5 rounded border">
                <p className="font-bold text-slate-900 uppercase">🏆 Entrenador / Prof.</p>
                <p className="text-[9px] mt-0.5 text-slate-400">Visualizar planillas, asistencias, horarios y fichas básicas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGS & AUDITORIA */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center border-b pb-2">
            <div>
              <h3 className="font-black text-xs uppercase text-slate-800">📋 Logs de Auditoría y Seguridad</h3>
              <p className="text-[11px] text-slate-550">Historial completo de accesos, modificaciones de bases de datos y seguridad del sistema.</p>
            </div>
            <span className="text-[9px] font-black bg-slate-100 border text-slate-655 px-2 py-1 rounded-full uppercase flex items-center gap-1"><Clock size={11} /> Tiempo real</span>
          </div>

          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border text-[11px] font-semibold hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                    log.type === 'SUCCESS' ? 'bg-green-50 border-green-200 text-green-700' :
                    log.type === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    log.type === 'ERROR' ? 'bg-red-50 border-red-200 text-red-700' :
                                            'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>{log.type}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{log.action}</h4>
                    <span className="text-[9px] text-slate-450">Usuario: {log.user} | IP: {log.ip}</span>
                  </div>
                </div>
                <span className="font-mono text-slate-450 text-[10px]">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION (STUNNING COMPACT COLUMN FORM ALIGNMENTS WITH HORIZONTAL BUTTONS) */}
      {/* ========================================================================= */}

      {/* MODAL TEMPORADAS */}
      {seasonModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {seasonModal.editId ? '📝 Editar Temporada' : '📅 Registrar Temporada'}
              </h3>
              <button onClick={() => setSeasonModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSeason} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre de Temporada *</label>
                <input
                  type="text" required
                  value={seasonForm.name}
                  onChange={e => setSeasonForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ej. Temporada Invierno 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Año Calendario *</label>
                  <input
                    type="number" required
                    value={seasonForm.year}
                    onChange={e => setSeasonForm(prev => ({ ...prev, year: parseInt(e.target.value) || '' }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Año Deportivo</label>
                  <input
                    type="text"
                    value={seasonForm.sportYear}
                    onChange={e => setSeasonForm(prev => ({ ...prev, sportYear: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    placeholder="Ej. 2026-Inv"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Fecha Inicio *</label>
                  <input
                    type="date" required
                    value={seasonForm.startDate}
                    onChange={e => setSeasonForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Fecha Fin *</label>
                  <input
                    type="date" required
                    value={seasonForm.endDate}
                    onChange={e => setSeasonForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">Estado Temporada</label>
                <select
                  value={seasonForm.status}
                  onChange={e => setSeasonForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                >
                  <option value="PLANIFICADA">PLANIFICADA</option>
                  <option value="ACTIVE">ACTIVA</option>
                  <option value="FINISHED">FINALIZADA</option>
                </select>
              </div>

              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={seasonForm.isActive}
                    onChange={e => setSeasonForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Temporada Activa</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={seasonForm.isDefault}
                    onChange={e => setSeasonForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Por Defecto</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSeasonModal({ isOpen: false, editId: null })}
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

      {/* MODAL DISCIPLINAS */}
      {disciplineModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {disciplineModal.editId ? '📝 Editar Disciplina' : '🏆 Registrar Disciplina'}
              </h3>
              <button onClick={() => setDisciplineModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiscipline} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre de la Disciplina *</label>
                <input
                  type="text" required
                  value={disciplineForm.name}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Ej. Futsal AFA"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Color Representativo</label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="color"
                      value={disciplineForm.color}
                      onChange={e => setDisciplineForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={disciplineForm.color}
                      onChange={e => setDisciplineForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 border rounded text-[9px] font-mono p-1 text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-0.5 block">Orden en Menu</label>
                  <input
                    type="number"
                    value={disciplineForm.displayOrder}
                    onChange={e => setDisciplineForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">Coordinador Principal</label>
                <input
                  type="text"
                  value={disciplineForm.manager}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, manager: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold"
                  placeholder="Ej. Prof. Gomez Ariel"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Descripción Breve</label>
                <textarea
                  value={disciplineForm.description}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold h-16 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={disciplineForm.isActive}
                  onChange={e => setDisciplineForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span>Disciplina Activa</span>
              </label>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDisciplineModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SEDES */}
      {sedeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {sedeModal.editId ? '🏢 Editar Sede' : '🏢 Registrar Sede'}
              </h3>
              <button onClick={() => setSedeModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSede} className="space-y-3 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre de la Sede *</label>
                <input
                  type="text" required
                  value={sedeForm.name}
                  onChange={e => setSedeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  placeholder="Ej. Sede Central"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Dirección Física *</label>
                <input
                  type="text" required
                  value={sedeForm.address}
                  onChange={e => setSedeForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Localización / C.P.</label>
                  <input
                    type="text"
                    value={sedeForm.location}
                    onChange={e => setSedeForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                    placeholder="Rufino, SF"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block">Aforo Aprox (personas)</label>
                  <input
                    type="number"
                    value={sedeForm.capacity}
                    onChange={e => setSedeForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">Observaciones</label>
                <textarea
                  value={sedeForm.observations}
                  onChange={e => setSedeForm(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold h-16 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSedeModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Registrar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSTALACIONES */}
      {facilityModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {facilityModal.editId ? '📝 Editar Espacio' : '🏢 Registrar Instalación'}
              </h3>
              <button onClick={() => setFacilityModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-3 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre del Espacio *</label>
                <input
                  type="text" required
                  value={facilityForm.name}
                  onChange={e => setFacilityForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  placeholder="Ej. Microestadio Parquet"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Tipo de Espacio</label>
                  <select
                    value={facilityForm.type}
                    onChange={e => setFacilityForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="CANCHA">CANCHA</option>
                    <option value="GIMNASIO">GIMNASIO</option>
                    <option value="VESTUARIO">VESTUARIO</option>
                    <option value="QUINCHO">QUINCHO</option>
                    <option value="BUFFET">BUFFET</option>
                    <option value="OTHER">OTRO</option>
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block">Aforo Máximo</label>
                  <input
                    type="number"
                    value={facilityForm.capacity}
                    onChange={e => setFacilityForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Sede Asociada *</label>
                  <select
                    value={facilityForm.sedeId}
                    onChange={e => setFacilityForm(prev => ({ ...prev, sedeId: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    {sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block">Estado Inicial</label>
                  <select
                    value={facilityForm.status}
                    onChange={e => setFacilityForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="ACTIVE">OPERATIVA</option>
                    <option value="MAINTENANCE">MANTENIMIENTO</option>
                    <option value="INACTIVE">CLAUSURADA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-0.5 block">Ubicación Interna</label>
                <input
                  type="text"
                  value={facilityForm.location}
                  onChange={e => setFacilityForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  placeholder="Ej. Planta Alta / Sector Canchas"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Observaciones</label>
                <textarea
                  value={facilityForm.observations}
                  onChange={e => setFacilityForm(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold h-16 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setFacilityModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Registrar Espacio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ROLES */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {roleModal.editId ? '📝 Editar Rol' : '🔑 Registrar Nuevo Rol'}
              </h3>
              <button onClick={() => setRoleModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Nombre del Rol *</label>
                <input
                  type="text" required
                  value={roleForm.name}
                  onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                  placeholder="Ej. Coordinador de Futsal"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Descripción del Rol</label>
                <input
                  type="text"
                  value={roleForm.description}
                  onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="border-t pt-3">
                <label className="mb-1.5 block text-slate-400">Permisos del Sistema</label>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
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
                    <label key={p.key} className="flex items-center gap-1.5 cursor-pointer p-1 rounded hover:bg-slate-100 select-none">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                        className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setRoleModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR USUARIOS */}
      {userModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-5 border border-slate-200 animate-scale-in text-left">
            <div className="flex justify-between items-center border-b pb-2.5 mb-3">
              <h3 className="font-black text-sm uppercase text-slate-900 tracking-wide">
                {userModal.editId ? '👥 Editar Usuario' : '👥 Registrar Usuario'}
              </h3>
              <button onClick={() => setUserModal({ isOpen: false, editId: null })} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-[10px] font-black text-slate-500 uppercase">
              <div>
                <label className="mb-0.5 block">Correo Electrónico *</label>
                <input
                  type="email" required
                  value={userForm.email}
                  onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none lowercase"
                  disabled={!!userModal.editId}
                />
              </div>

              <div>
                <label className="mb-0.5 block">{userModal.editId ? 'Nueva Contraseña (vacío si no cambia)' : 'Contraseña de Acceso *'}</label>
                <input
                  type="password"
                  required={!userModal.editId}
                  value={userForm.password}
                  onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="mb-0.5 block">Nombre / Apellido Completo</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-0.5 block">Rol Legacy</label>
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="SOCIO">SOCIO</option>
                    <option value="FUTSAL">FUTSAL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="mb-0.5 block">Rol Asignado ERP</label>
                  <select
                    value={userForm.roleId}
                    onChange={e => setUserForm(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none"
                  >
                    <option value="">Ninguno</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={userForm.isActive}
                  onChange={e => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-slate-350 text-red-655 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <span>Usuario Activo en Sistema</span>
              </label>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setUserModal({ isOpen: false, editId: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border font-black py-2 rounded text-[10px] active:scale-95 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-jn-red hover:bg-red-700 text-white font-black py-2 rounded text-[10px] active:scale-95 transition-all shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
