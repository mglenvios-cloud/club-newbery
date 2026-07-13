"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users, Calendar, FileText, Clipboard, Plus, Edit, Trash, X, Check,
  AlertCircle, Save, Clock, Shield, Award, Activity, Heart, Search,
  Trophy, UserCheck, HelpCircle, FileCheck, RefreshCw, BarChart2, Star,
  Wifi, WifiOff, Database, Server, Zap, Circle
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO_TEAMS = [
  { id: 1, name: 'Primera', category: 'Primera Masculina', season: '2026', coach: 'Prof. Martínez', assistantCoach: 'Prof. López', preparadorFisico: 'Prof. García', status: 'ACTIVE', description: 'Equipo de primera división masculino', imageUrl: '' },
  { id: 2, name: 'Reserva', category: 'Reserva Masculina', season: '2026', coach: 'Prof. Rodríguez', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: 'Equipo de reserva masculino', imageUrl: '' },
  { id: 3, name: 'Quinta', category: 'Quinta División', season: '2026', coach: 'Prof. Fernández', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: '', imageUrl: '' },
  { id: 4, name: 'Sexta', category: 'Sexta División', season: '2026', coach: 'Prof. Sosa', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: '', imageUrl: '' },
  { id: 5, name: 'Séptima', category: 'Séptima División', season: '2026', coach: 'Prof. Benítez', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: '', imageUrl: '' },
  { id: 6, name: 'Octava', category: 'Octava División', season: '2026', coach: 'Prof. Acosta', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: '', imageUrl: '' },
  { id: 7, name: 'Novena', category: 'Novena División', season: '2026', coach: 'Prof. Medina', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE', description: '', imageUrl: '' },
];

const DEMO_CATEGORIES = [
  { id: 1, name: 'Categoría 2012', type: 'DISCIPLINA', price: 3500, description: 'Jugadores nacidos en 2012' },
  { id: 2, name: 'Categoría 2013', type: 'DISCIPLINA', price: 3500, description: 'Jugadores nacidos en 2013' },
  { id: 3, name: 'Categoría 2014', type: 'DISCIPLINA', price: 3000, description: 'Jugadores nacidos en 2014' },
  { id: 4, name: 'Categoría 2015', type: 'DISCIPLINA', price: 3000, description: 'Jugadores nacidos en 2015' },
  { id: 5, name: 'Categoría 2016', type: 'DISCIPLINA', price: 2500, description: 'Jugadores nacidos en 2016' },
];

const DEMO_PLAYERS = [
  { id: 1, name: 'Lucas', lastName: 'González', dorsal: 1, age: 22, category: 'Primera Masculina', position: 'Arquero', team: 'Primera', matchesPlayed: 18, goals: 0, assists: 2, yellowCards: 1, redCards: 0, cleanSheets: 9, playerStatus: 'ACTIVE', birthDate: '2004-07-15T00:00:00.000Z', photoUrl: null },
  { id: 2, name: 'Matías', lastName: 'Rodríguez', dorsal: 5, age: 24, category: 'Primera Masculina', position: 'Cierre', team: 'Primera', matchesPlayed: 20, goals: 3, assists: 7, yellowCards: 4, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', birthDate: '2002-03-22T00:00:00.000Z', photoUrl: null },
  { id: 3, name: 'Sebastián', lastName: 'López', dorsal: 10, age: 25, category: 'Primera Masculina', position: 'Ala', team: 'Primera', matchesPlayed: 22, goals: 15, assists: 11, yellowCards: 2, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', birthDate: '2001-11-08T00:00:00.000Z', photoUrl: null },
  { id: 4, name: 'Diego', lastName: 'Martínez', dorsal: 9, age: 23, category: 'Primera Masculina', position: 'Pivot', team: 'Primera', matchesPlayed: 19, goals: 12, assists: 4, yellowCards: 3, redCards: 1, cleanSheets: 0, playerStatus: 'INJURED', birthDate: '2003-05-30T00:00:00.000Z', photoUrl: null },
  { id: 5, name: 'Andrés', lastName: 'Pérez', dorsal: 7, age: 21, category: 'Reserva Masculina', position: 'Ala', team: 'Reserva', matchesPlayed: 14, goals: 8, assists: 5, yellowCards: 1, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', birthDate: '2005-02-14T00:00:00.000Z', photoUrl: null },
  { id: 6, name: 'Fernando', lastName: 'Sosa', dorsal: 4, age: 20, category: 'Reserva Masculina', position: 'Cierre', team: 'Reserva', matchesPlayed: 12, goals: 2, assists: 8, yellowCards: 2, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', birthDate: '2006-07-15T00:00:00.000Z', photoUrl: null },
];

const DEMO_COACHES = [
  { id: 1, name: 'Carlos Martínez', role: 'ENTRENADOR', categories: 'Primera, Reserva', license: 'ATFA Pro', phone: '351-555-0101', email: 'cmartinez@newbery.com', biography: 'DT con 10 años de experiencia en futsal de alto rendimiento.', photoUrl: null },
  { id: 2, name: 'Roberto López', role: 'AYUDANTE', categories: 'Primera', license: 'ATFA Básico', phone: '351-555-0102', email: 'rlopez@newbery.com', biography: null, photoUrl: null },
  { id: 3, name: 'Sergio García', role: 'PF', categories: 'Primera, Reserva, Quinta', license: null, phone: '351-555-0103', email: 'sgarcia@newbery.com', biography: 'Preparador físico especializado en deportes de sala.', photoUrl: null },
  { id: 4, name: 'Miguel Fernández', role: 'ENTRENADOR', categories: 'Quinta, Sexta', license: 'ATFA Básico', phone: '351-555-0104', email: 'mfernandez@newbery.com', biography: null, photoUrl: null },
];

const DEMO_MATCHES = [
  { id: 1, category: 'Primera Masculina', opponent: 'Talleres', homeTeam: 'Jorge Newbery', awayTeam: 'Talleres', date: new Date(Date.now() + 7*24*60*60*1000).toISOString(), timeSlot: '20:00', ourScore: null, opponentScore: null, status: 'UPCOMING', competition: 'AFA Primera', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: true },
  { id: 2, category: 'Primera Masculina', opponent: 'Belgrano', homeTeam: 'Belgrano', awayTeam: 'Jorge Newbery', date: new Date(Date.now() + 14*24*60*60*1000).toISOString(), timeSlot: '21:00', ourScore: null, opponentScore: null, status: 'UPCOMING', competition: 'AFA Primera', venue: 'Estadio Belgrano', season: '2026', isFeatured: false },
  { id: 3, category: 'Reserva Masculina', opponent: 'River Plate', homeTeam: 'Jorge Newbery', awayTeam: 'River Plate', date: new Date(Date.now() + 3*24*60*60*1000).toISOString(), timeSlot: '19:00', ourScore: null, opponentScore: null, status: 'UPCOMING', competition: 'AFA Reserva', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false },
  { id: 4, category: 'Primera Masculina', opponent: 'Boca Juniors', homeTeam: 'Boca Juniors', awayTeam: 'Jorge Newbery', date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), timeSlot: '20:30', ourScore: 3, opponentScore: 2, status: 'FINISHED', competition: 'AFA Primera', venue: 'Estadio Boca', season: '2026', isFeatured: true },
];

const DEMO_STATS = {
  totalTeams: 7,
  totalCategories: 5,
  totalPlayers: 6,
  totalCoaches: 2,
  totalAssistants: 1,
  totalPFs: 1,
  trainingsToday: 2,
  injuredPlayers: 1,
  suspendedPlayers: 0,
  upcomingMatches: DEMO_MATCHES.filter(m => m.status === 'UPCOMING').slice(0, 5),
  weeklyTrainings: [],
  birthdays: [
    { id: 1, name: 'Lucas González', birthDate: new Date().toISOString(), category: 'Primera Masculina' },
    { id: 5, name: 'Andrés Pérez', birthDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), category: 'Reserva Masculina' },
  ],
  publishedNews: 12,
};

// ─── FETCH WITH RETRY ─────────────────────────────────────────────────────────
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await apiFetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }
  }
  throw lastError;
}


export default function AdminGestionDeportiva() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [matches, setMatches] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [apiStatus, setApiStatus] = useState({ api: null, db: null, server: null });
  const [failedEndpoints, setFailedEndpoints] = useState([]);
  const [syncPulse, setSyncPulse] = useState(false);
  const autoRefreshRef = useRef(null);
  const CACHE_KEY = 'jn_gestion_cache';

  // ─── Helpers de caché local ──────────────────────────────────────────────
  const saveCache = (data) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, cachedAt: Date.now() })); } catch {}
  };
  const loadCache = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (Date.now() - d.cachedAt > 30 * 60 * 1000) return null; // 30 min TTL
      return d;
    } catch { return null; }
  };

  // Modales
  const [teamModal, setTeamModal] = useState({ isOpen: false, editId: null });
  const [playerModal, setPlayerModal] = useState({ isOpen: false, editId: null });
  const [trainingModal, setTrainingModal] = useState({ isOpen: false, editId: null });
  const [coachModal, setCoachModal] = useState({ isOpen: false, editId: null });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, editId: null });
  const [matchModal, setMatchModal] = useState({ isOpen: false, editId: null });
  const [docModal, setDocModal] = useState({ isOpen: false });

  // Modales Adicionales
  const [assignModal, setAssignModal] = useState({ isOpen: false, player: null });

  // Forms
  const [teamForm, setTeamForm] = useState({
    name: '', category: 'Primera Masculina', season: '2026', imageUrl: '', description: '', coach: '', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE'
  });

  const [playerForm, setPlayerForm] = useState({
    name: '', lastName: '', age: '', dorsal: 0, category: 'Primera Masculina', position: 'Ala', team: 'Futsal AFA', achievements: '', matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', description: '', birthDate: '', photoUrl: ''
  });

  const [trainingForm, setTrainingForm] = useState({
    date: '', timeSlot: '', category: 'Primera Masculina', team: '', coach: '', court: 'Cancha Parquet', objective: '', notes: '', status: 'SCHEDULED'
  });

  const [coachForm, setCoachForm] = useState({
    photoUrl: '', name: '', role: 'ENTRENADOR', categories: '', license: '', phone: '', email: '', biography: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '', type: 'DISCIPLINA', price: 0, description: ''
  });

  const [matchForm, setMatchForm] = useState({
    category: 'Primera Masculina', opponent: '', homeTeam: 'Jorge Newbery', awayTeam: '', referee: '', attendance: 0, date: '', timeSlot: '', ourScore: 0, opponentScore: 0, status: 'UPCOMING', competition: 'AFA Primera', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false
  });

  const [docForm, setDocForm] = useState({
    title: '', url: '', category: 'Reglamento', description: ''
  });

  // Filtros
  const [searchPlayer, setSearchPlayer] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [reportFilter, setReportFilter] = useState({
    type: 'team', id: '', category: '', season: '2026'
  });

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ─── Fetching General con recuperación automática ──────────────────────
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setSkeletonLoading(true);
    const failed = [];
    const startTime = Date.now();

    const tryFetch = async (label, url) => {
      try {
        const res = await fetchWithRetry(url);
        if (!res.ok) {
          failed.push(`${label} → HTTP ${res.status}`);
          console.error(`[API] ${label} falló con status ${res.status}`);
          return null;
        }
        return await res.json();
      } catch (err) {
        failed.push(`${label} → ${err.name === 'AbortError' ? 'Timeout' : err.message}`);
        console.error(`[API] ${label} error:`, err.message);
        return null;
      }
    };

    // Verificar salud de la API primero
    let apiOnline = false;
    try {
      const healthRes = await fetchWithRetry(`${API_URL}/`, {}, 2);
      apiOnline = healthRes.ok;
    } catch {
      apiOnline = false;
    }
    const elapsed = Date.now() - startTime;
    setResponseTime(elapsed);
    setApiStatus({ api: apiOnline, db: apiOnline, server: apiOnline });

    if (!apiOnline) {
      // Intentar cargar desde caché
      const cached = loadCache();
      if (cached) {
        setStats(cached.stats || DEMO_STATS);
        setPlayers(cached.players || DEMO_PLAYERS);
        setTrainings(cached.trainings || []);
        setDocuments(cached.documents || []);
        setTeams(cached.teams || DEMO_TEAMS);
        setCoaches(cached.coaches || DEMO_COACHES);
        setCategories(cached.categories || DEMO_CATEGORIES);
        setMatches(cached.matches || DEMO_MATCHES);
        setUsingDemoData(false);
        showToast('⚠️ API no disponible — usando datos en caché', 'warn');
      } else {
        // Usar datos de demostración
        setStats(DEMO_STATS);
        setPlayers(DEMO_PLAYERS);
        setTrainings([]);
        setDocuments([]);
        setTeams(DEMO_TEAMS);
        setCoaches(DEMO_COACHES);
        setCategories(DEMO_CATEGORIES);
        setMatches(DEMO_MATCHES);
        setUsingDemoData(true);
        showToast('🔌 API offline — mostrando datos de demostración', 'error');
      }
      setFailedEndpoints([`Servidor en ${API_URL} no responde`]);
      setLoading(false);
      setSkeletonLoading(false);
      return;
    }

    // API online — obtener datos reales en paralelo
    const [statsData, playersData, trainingsData, docsData, teamsData, coachesData, catsData, matchesData] = await Promise.all([
      tryFetch('Stats deportivos', `${API_URL}/api/gestion-deportiva/stats`),
      tryFetch('Jugadores', `${API_URL}/api/players`),
      tryFetch('Entrenamientos', `${API_URL}/api/gestion-deportiva/trainings`),
      tryFetch('Documentos', `${API_URL}/api/gestion-deportiva/documents`),
      tryFetch('Equipos', `${API_URL}/api/teams`),
      tryFetch('Entrenadores', `${API_URL}/api/gestion-deportiva/coaches`),
      tryFetch('Categorías', `${API_URL}/api/categories`),
      tryFetch('Partidos', `${API_URL}/api/matches`),
    ]);

    const newStats     = statsData    || DEMO_STATS;
    const newPlayers   = playersData  || DEMO_PLAYERS;
    const newTrainings = trainingsData || [];
    const newDocs      = docsData     || [];
    const newTeams     = teamsData    || DEMO_TEAMS;
    const newCoaches   = coachesData  || DEMO_COACHES;
    const newCats      = catsData     || DEMO_CATEGORIES;
    const newMatches   = matchesData  || DEMO_MATCHES;

    setStats(newStats);
    setPlayers(newPlayers);
    setTrainings(newTrainings);
    setDocuments(newDocs);
    setTeams(newTeams);
    setCoaches(newCoaches);
    setCategories(newCats);
    setMatches(newMatches);
    setFailedEndpoints(failed);
    setUsingDemoData(failed.length > 4); // muchos fallos = usar demo

    // Guardar en caché
    saveCache({ stats: newStats, players: newPlayers, trainings: newTrainings, documents: newDocs, teams: newTeams, coaches: newCoaches, categories: newCats, matches: newMatches });

    const now = new Date();
    setLastSync(now);
    setSyncPulse(true);
    setTimeout(() => setSyncPulse(false), 2000);

    if (failed.length > 0) {
      console.warn('[API] Endpoints con errores:', failed);
      if (!silent) showToast(`⚠️ ${failed.length} endpoint(s) con error — usando respaldo`, 'warn');
    } else if (!silent) {
      if (usingDemoData) showToast('✅ Conexión con la API restaurada', 'success');
    }

    setLoading(false);
    setSkeletonLoading(false);
  }, [usingDemoData]);

  useEffect(() => {
    fetchAllData();
    // Auto-refresh cada 30 segundos
    autoRefreshRef.current = setInterval(() => fetchAllData(true), 30000);
    return () => clearInterval(autoRefreshRef.current);
  }, [fetchAllData]);

  // CRUD EQUIPOS
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name) return showToast('El nombre del equipo es obligatorio', 'error');
    const method = teamModal.editId ? 'PUT' : 'POST';
    const url = teamModal.editId ? `${API_URL}/api/teams/${teamModal.editId}` : `${API_URL}/api/teams`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      if (res.ok) {
        showToast(teamModal.editId ? 'Equipo actualizado' : 'Equipo creado');
        setTeamModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('¿Seguro de eliminar este equipo?')) return;
    try {
      const res = await fetch(`${API_URL}/api/teams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Equipo eliminado');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD JUGADORES
  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.name || !playerForm.category) return showToast('Nombre y Categoría obligatorios', 'error');
    const method = playerModal.editId ? 'PUT' : 'POST';
    const url = playerModal.editId ? `${API_URL}/api/players/${playerModal.editId}` : `${API_URL}/api/players`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm)
      });
      if (res.ok) {
        showToast(playerModal.editId ? 'Jugador actualizado' : 'Jugador registrado');
        setPlayerModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm('¿Eliminar jugador de los planteles?')) return;
    try {
      const res = await fetch(`${API_URL}/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Jugador eliminado');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD ENTRENADORES Y CUERPO TECNICO
  const handleSaveCoach = async (e) => {
    e.preventDefault();
    if (!coachForm.name || !coachForm.role) return showToast('Nombre y Cargo obligatorios', 'error');
    const method = coachModal.editId ? 'PUT' : 'POST';
    const url = coachModal.editId ? `${API_URL}/api/gestion-deportiva/coaches/${coachModal.editId}` : `${API_URL}/api/gestion-deportiva/coaches`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coachForm)
      });
      if (res.ok) {
        showToast(coachModal.editId ? 'Registro de personal actualizado' : 'Personal registrado');
        setCoachModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteCoach = async (id) => {
    if (!window.confirm('¿Eliminar de la plantilla técnica?')) return;
    try {
      const res = await fetch(`${API_URL}/api/gestion-deportiva/coaches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Personal técnico eliminado');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD CATEGORÍAS
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name || categoryForm.price === undefined) return showToast('Nombre y precio requeridos', 'error');
    const method = categoryModal.editId ? 'PUT' : 'POST';
    const url = categoryModal.editId ? `${API_URL}/api/categories/${categoryModal.editId}` : `${API_URL}/api/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        showToast(categoryModal.editId ? 'Categoría configurada' : 'Categoría creada');
        setCategoryModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Categoría eliminada');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD PARTIDOS
  const handleSaveMatch = async (e) => {
    e.preventDefault();
    if (!matchForm.opponent || !matchForm.date || !matchForm.timeSlot) return showToast('Oponente, fecha y hora requeridos', 'error');
    const method = matchModal.editId ? 'PUT' : 'POST';
    const url = matchModal.editId ? `${API_URL}/api/matches/${matchModal.editId}` : `${API_URL}/api/matches`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchForm)
      });
      if (res.ok) {
        showToast(matchModal.editId ? 'Partido modificado' : 'Partido agendado');
        setMatchModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('¿Seguro de eliminar este partido?')) return;
    try {
      const res = await fetch(`${API_URL}/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Partido eliminado');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD ENTRENAMIENTOS
  const handleSaveTraining = async (e) => {
    e.preventDefault();
    const method = trainingModal.editId ? 'PUT' : 'POST';
    const url = trainingModal.editId ? `${API_URL}/api/gestion-deportiva/trainings/${trainingModal.editId}` : `${API_URL}/api/gestion-deportiva/trainings`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm)
      });
      if (res.ok) {
        showToast(trainingModal.editId ? 'Entrenamiento modificado' : 'Entrenamiento programado');
        setTrainingModal({ isOpen: false, editId: null });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('¿Cancelar este entrenamiento?')) return;
    try {
      const res = await fetch(`${API_URL}/api/gestion-deportiva/trainings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Entrenamiento cancelado');
        fetchAllData();
      }
    } catch {}
  };

  // CRUD DOCUMENTOS
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/gestion-deportiva/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm)
      });
      if (res.ok) {
        showToast('Documentación registrada');
        setDocModal({ isOpen: false });
        fetchAllData();
      }
    } catch {}
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('¿Eliminar este archivo?')) return;
    try {
      const res = await fetch(`${API_URL}/api/gestion-deportiva/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Documento eliminado');
        fetchAllData();
      }
    } catch {}
  };

  // ASIGNAR JUGADOR A EQUIPO/CATEGORIA
  const handleAssignRoster = async (e) => {
    e.preventDefault();
    const targetTeam = e.target.team.value;
    const targetCategory = e.target.category.value;
    const targetDorsal = e.target.dorsal.value;

    try {
      const res = await fetch(`${API_URL}/api/players/${assignModal.player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignModal.player,
          team: targetTeam,
          category: targetCategory,
          dorsal: parseInt(targetDorsal) || 0
        })
      });
      if (res.ok) {
        showToast('Jugador asignado exitosamente al plantel');
        setAssignModal({ isOpen: false, player: null });
        fetchAllData();
      }
    } catch {
      showToast('Error al asignar jugador', 'error');
    }
  };

  // CALENDAR HELPER
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const getCalendarEvents = (day) => {
    const formattedDay = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrainings = trainings.filter(t => t.date.startsWith(formattedDay));
    const dayMatches = matches.filter(m => m.date.startsWith(formattedDay));
    return { trainings: dayTrainings, matches: dayMatches };
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // FILTRAR JUGADORES POR EQUIPO
  const filteredPlayers = players.filter(p => {
    const matchesSearch = `${p.name} ${p.lastName}`.toLowerCase().includes(searchPlayer.toLowerCase());
    const matchesTeam = filterTeam === 'ALL' || p.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  // Skeleton component
  const Skeleton = ({ className = '' }) => (
    <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
  );

  const StatusDot = ({ status }) => {
    if (status === null) return <Circle size={8} className="text-gray-300 fill-gray-300" />;
    return status
      ? <Circle size={8} className="text-green-500 fill-green-500" />
      : <Circle size={8} className="text-red-500 fill-red-500 animate-pulse" />;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-jn-black">
      {/* TOAST mejorado con soporte de tipo 'warn' */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2 shadow-2xl transition-all duration-300 text-white max-w-sm ${
          toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'warn'    ? 'bg-amber-500' :
                                     'bg-red-600'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : toast.type === 'warn' ? <AlertCircle size={18} /> : <WifiOff size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* PANEL DE ESTADO DEL SISTEMA */}
      <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* API */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <StatusDot status={apiStatus.api} />
              <span className={apiStatus.api === null ? 'text-gray-400' : apiStatus.api ? 'text-green-700' : 'text-red-600'}>
                {apiStatus.api === null ? '⏳ API...' : apiStatus.api ? '🟢 API Online' : '🔴 API Offline'}
              </span>
            </div>
            {/* Base de Datos */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <StatusDot status={apiStatus.db} />
              <span className={apiStatus.db === null ? 'text-gray-400' : apiStatus.db ? 'text-green-700' : 'text-red-600'}>
                {apiStatus.db === null ? '⏳ BD...' : apiStatus.db ? '🟢 Base de Datos' : '🔴 BD Offline'}
              </span>
            </div>
            {/* Servidor */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <StatusDot status={apiStatus.server} />
              <span className={apiStatus.server === null ? 'text-gray-400' : apiStatus.server ? 'text-green-700' : 'text-red-600'}>
                {apiStatus.server === null ? '⏳ Servidor...' : apiStatus.server ? '🟢 Servidor' : '🔴 Servidor Caído'}
              </span>
            </div>
            {/* Sincronización */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <RefreshCw size={11} className={syncPulse ? 'animate-spin text-blue-500' : ''} />
              {lastSync
                ? <span>Sync: {lastSync.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                : <span className="text-gray-400">Sin sincronizar</span>
              }
            </div>
            {/* Tiempo de respuesta */}
            {responseTime !== null && (
              <div className="flex items-center gap-1 text-xs font-bold">
                <Zap size={11} className={responseTime < 300 ? 'text-green-500' : responseTime < 800 ? 'text-amber-500' : 'text-red-500'} />
                <span className={responseTime < 300 ? 'text-green-600' : responseTime < 800 ? 'text-amber-600' : 'text-red-600'}>
                  {responseTime}ms
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {usingDemoData && (
              <span className="text-[9px] font-black uppercase px-2 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200 tracking-wider">
                📊 Modo Demo
              </span>
            )}
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
              Auto-refresh 30s
            </span>
          </div>
        </div>
        {/* Endpoints con error */}
        {failedEndpoints.length > 0 && (
          <div className="mt-3 pt-3 border-t border-red-100">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">⚠️ Endpoints con error:</p>
            <div className="flex flex-wrap gap-1">
              {failedEndpoints.map((ep, i) => (
                <span key={i} className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100 font-bold">
                  {ep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-jn-red uppercase tracking-widest bg-red-100 px-3 py-1 rounded-full border border-jn-red/20">Centro Deportivo</span>
          <h1 className="text-3xl font-black uppercase mt-2">🏆 Centro de Gestión Deportiva</h1>
          <p className="text-gray-500 text-sm">Control profesional y unificado de todas las disciplinas, categorías, planteles y agendas.</p>
        </div>
        <button
          onClick={() => fetchAllData(false)}
          className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border flex items-center gap-2 font-bold text-xs uppercase self-start shadow-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LOCAL SIDEBAR NAVIGATION */}
        <div className="lg:w-64 bg-jn-black text-white p-5 rounded-2xl flex flex-col gap-1 shadow-xl h-fit border border-white/5">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 mb-3">Módulos de Gestión</span>
          
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: <Clipboard size={16} /> },
            { id: 'equipos', label: '🛡️ Equipos', icon: <Shield size={16} /> },
            { id: 'categorias', label: '🏷️ Categorías', icon: <Star size={16} /> },
            { id: 'planteles', label: '📋 Planteles', icon: <UserCheck size={16} /> },
            { id: 'jugadores', label: '🏃 Jugadores', icon: <Users size={16} /> },
            { id: 'entrenadores', label: '👔 Entrenadores', icon: <Award size={16} /> },
            { id: 'cuerpo-tecnico', label: '💼 Cuerpo Técnico', icon: <Users size={16} /> },
            { id: 'calendario', label: '📅 Calendario', icon: <Calendar size={16} /> },
            { id: 'entrenamientos', label: '⏱️ Entrenamientos', icon: <Clock size={16} /> },
            { id: 'partidos', label: '⚽ Partidos AFA', icon: <Trophy size={16} /> },
            { id: 'reportes', label: '📈 Reportes & Stats', icon: <BarChart2 size={16} /> },
            { id: 'documentacion', label: '📁 Documentación', icon: <FileText size={16} /> }
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
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPIs con skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {skeletonLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                      <Skeleton className="h-2.5 w-24" />
                      <Skeleton className="h-7 w-12" />
                    </div>
                  ))
                ) : [
                  { title: 'Equipos Activos', val: stats?.totalTeams, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Categorías', val: stats?.totalCategories, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { title: 'Jugadores Fichados', val: stats?.totalPlayers, color: 'text-jn-red', bg: 'bg-red-50' },
                  { title: 'Entrenadores', val: stats?.totalCoaches, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { title: 'Ayudantes de Campo', val: stats?.totalAssistants, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { title: 'Preparadores Físicos', val: stats?.totalPFs, color: 'text-cyan-600', bg: 'bg-cyan-50' },
                  { title: 'Entrenamientos Hoy', val: stats?.trainingsToday, color: 'text-pink-600', bg: 'bg-pink-50' },
                  { title: 'Lesionados', val: stats?.injuredPlayers, color: 'text-orange-600', bg: 'bg-orange-50' },
                  { title: 'Suspendidos', val: stats?.suspendedPlayers, color: 'text-red-700', bg: 'bg-red-100' },
                  { title: 'Noticias Publicadas', val: stats?.publishedNews, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1 transition-all hover:shadow-md">
                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{kpi.title}</span>
                    <span className={`text-2xl font-black ${kpi.color}`}>{kpi.val ?? 0}</span>
                  </div>
                ))}
              </div>

              {/* GRIDS RECIENTES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 border border-gray-200 rounded-2xl lg:col-span-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Agenda de Próximos Partidos</h3>
                  <div className="divide-y divide-gray-150">
                    {(stats?.upcomingMatches || []).length === 0 ? (
                      <p className="text-xs text-gray-400 py-4">Sin partidos pendientes.</p>
                    ) : stats.upcomingMatches.map(m => (
                      <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm">VS {m.opponent}</p>
                          <span className="text-[10px] text-gray-500 uppercase font-black">{m.category} · {m.competition}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500">{new Date(m.date).toLocaleDateString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 border border-gray-200 rounded-2xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                    <Heart size={14} className="text-red-500" /> Cumpleaños del Mes
                  </h3>
                  <div className="space-y-3">
                    {(stats?.birthdays || []).length === 0 ? (
                      <p className="text-xs text-gray-400">Sin cumpleaños este mes.</p>
                    ) : stats.birthdays.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div>
                          <p className="font-bold text-jn-black">{b.name}</p>
                          <span className="text-[9px] text-gray-500 font-bold uppercase">{b.category}</span>
                        </div>
                        <span className="text-jn-red font-black">
                          {new Date(b.birthDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EQUIPOS */}
          {activeTab === 'equipos' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setTeamForm({ name: '', category: 'Primera Masculina', season: '2026', imageUrl: '', description: '', coach: '', assistantCoach: '', preparadorFisico: '', status: 'ACTIVE' });
                    setTeamModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Crear Equipo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {teams.map(team => (
                  <div key={team.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        {team.imageUrl ? (
                          <img src={team.imageUrl} alt="" className="w-12 h-12 object-contain rounded border bg-gray-50" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400 font-bold">🛡️</div>
                        )}
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${team.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {team.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{team.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{team.category} · TEMP {team.season}</p>
                      </div>
                      {team.description && <p className="text-xs text-gray-500 leading-relaxed">{team.description}</p>}
                      <div className="border-t pt-3 mt-3 space-y-1 text-xs text-gray-500 font-bold">
                        <p><span className="text-gray-400">DT:</span> {team.coach || 'No asignado'}</p>
                        <span className="block"><span className="text-gray-400">Ayudante:</span> {team.assistantCoach || 'No asignado'}</span>
                        <span className="block"><span className="text-gray-400">PF:</span> {team.preparadorFisico || 'No asignado'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-5 border-t pt-3 bg-gray-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl">
                      <button
                        onClick={() => {
                          setTeamForm(team);
                          setTeamModal({ isOpen: true, editId: team.id });
                        }}
                        className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg bg-white"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
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

          {/* TAB 3: CATEGORIAS */}
          {activeTab === 'categorias' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCategoryForm({ name: '', type: 'DISCIPLINA', price: 0, description: '' });
                    setCategoryModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Nueva Categoría
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Arancel Social</th>
                      <th className="p-4">Descripción</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold">{cat.name}</td>
                        <td className="p-4"><span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-black uppercase">{cat.type}</span></td>
                        <td className="p-4 font-bold text-jn-red">${cat.price}</td>
                        <td className="p-4 text-gray-500 text-xs">{cat.description}</td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setCategoryForm(cat);
                              setCategoryModal({ isOpen: true, editId: cat.id });
                            }}
                            className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
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

          {/* TAB 4: PLANTELES */}
          {activeTab === 'planteles' && (
            <div className="space-y-6">
              <div className="bg-white p-4 border border-gray-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <select
                    value={filterTeam}
                    onChange={e => setFilterTeam(e.target.value)}
                    className="border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="ALL">TODOS LOS EQUIPOS / PLANTELES</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>{team.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPlayer}
                    onChange={e => setSearchPlayer(e.target.value)}
                    placeholder="Buscar jugador..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPlayers.map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl border flex items-center justify-center text-gray-400 font-bold"><Users size={20} /></div>
                        )}
                        <div className="space-y-1">
                          <span className="text-xs font-black text-jn-red bg-red-50 px-2 py-0.5 rounded">#{p.dorsal}</span>
                          <h4 className="font-black text-base leading-tight mt-1">{p.name} {p.lastName}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.position}</p>
                        </div>
                      </div>

                      <div className="border-t pt-3 text-xs font-bold text-gray-500 space-y-1">
                        <p><span className="text-gray-400">Equipo:</span> <b className="text-jn-black">{p.team || 'No asignado'}</b></p>
                        <p><span className="text-gray-400">Categoría:</span> <b className="text-jn-black">{p.category || 'No asignado'}</b></p>
                        <p><span className="text-gray-400">Estado:</span> <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black ${p.playerStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{p.playerStatus}</span></p>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl text-[10px] font-black uppercase text-gray-500 grid grid-cols-3 text-center gap-2">
                        <div>
                          <p className="text-xs text-jn-black font-bold">{p.matchesPlayed}</p>
                          <span>Partidos</span>
                        </div>
                        <div>
                          <p className="text-xs text-jn-black font-bold">{p.goals}</p>
                          <span>Goles</span>
                        </div>
                        <div>
                          <p className="text-xs text-jn-black font-bold">{p.assists}</p>
                          <span>Asistencias</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setAssignModal({ isOpen: true, player: p })}
                      className="w-full mt-4 bg-jn-black hover:bg-jn-red text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                    >
                      🔄 Asignar Plantel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JUGADORES */}
          {activeTab === 'jugadores' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchPlayer}
                    onChange={e => setSearchPlayer(e.target.value)}
                    placeholder="Buscar por jugador..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  />
                </div>
                <button
                  onClick={() => {
                    setPlayerForm({ name: '', lastName: '', age: '', dorsal: 0, category: 'Primera Masculina', position: 'Ala', team: 'Futsal AFA', achievements: '', matchesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheets: 0, playerStatus: 'ACTIVE', description: '', birthDate: '', photoUrl: '' });
                    setPlayerModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 self-start"
                >
                  <Plus size={16} /> Fichar Jugador
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Dorsal</th>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Categoría / Posición</th>
                      <th className="p-4">Estadísticas</th>
                      <th className="p-4">Tarjetas (A/R)</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {players.filter(p => `${p.name} ${p.lastName}`.toLowerCase().includes(searchPlayer.toLowerCase())).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-black text-jn-red">#{p.dorsal}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><Users size={12} /></div>
                            )}
                            <div>
                              <p className="font-bold">{p.name} {p.lastName}</p>
                              <span className="text-[9px] text-gray-400 uppercase font-black">{p.team}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs">{p.category}</span>
                          <span className="block text-[9px] text-gray-400 uppercase font-black">{p.position}</span>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {p.matchesPlayed} PJ / {p.goals} G / {p.assists} A
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          🟨 {p.yellowCards} / 🟥 {p.redCards}
                        </td>
                        <td className="p-4">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                            p.playerStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            p.playerStatus === 'INJURED' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {p.playerStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setPlayerForm({
                                ...p,
                                birthDate: p.birthDate ? p.birthDate.split('T')[0] : ''
                              });
                              setPlayerModal({ isOpen: true, editId: p.id });
                            }}
                            className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(p.id)}
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

          {/* TAB 6 & 7: ENTRENADORES Y CUERPO TECNICO */}
          {(activeTab === 'entrenadores' || activeTab === 'cuerpo-tecnico') && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setCoachForm({ photoUrl: '', name: '', role: activeTab === 'entrenadores' ? 'ENTRENADOR' : 'AYUDANTE', categories: '', license: '', phone: '', email: '', biography: '' });
                    setCoachModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Nuevo Registro
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coaches.filter(c => activeTab === 'entrenadores' ? c.role === 'ENTRENADOR' : (c.role === 'AYUDANTE' || c.role === 'PF')).map(c => (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        {c.photoUrl ? (
                          <img src={c.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-50 rounded-full border flex items-center justify-center text-gray-400 font-bold"><Users size={20} /></div>
                        )}
                        <div>
                          <span className="text-[9px] bg-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase">{c.role}</span>
                          <h4 className="font-black text-base mt-1.5 leading-tight">{c.name}</h4>
                          {c.license && <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Licencia: {c.license}</p>}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-bold space-y-1.5 border-t pt-3">
                        <p><span className="text-gray-400">Email:</span> {c.email || 'No especificado'}</p>
                        <p><span className="text-gray-400">Tel:</span> {c.phone || 'No especificado'}</p>
                        <p><span className="text-gray-400">Categorías:</span> {c.categories || 'Ninguna'}</p>
                        {c.biography && <p className="text-[11px] text-gray-400 font-light mt-2 italic leading-relaxed font-serif">"{c.biography}"</p>}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-5 border-t pt-3 bg-gray-50/50 -mx-5 -mb-5 p-3 rounded-b-2xl font-bold">
                      <button
                        onClick={() => {
                          setCoachForm(c);
                          setCoachModal({ isOpen: true, editId: c.id });
                        }}
                        className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg bg-white"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoach(c.id)}
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

          {/* TAB 8: CALENDARIO */}
          {activeTab === 'calendario' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg uppercase">{monthNames[currentMonth]} {currentYear}</h3>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-2 border rounded-xl hover:bg-gray-50 font-bold">◀</button>
                  <button onClick={nextMonth} className="p-2 border rounded-xl hover:bg-gray-50 font-bold">▶</button>
                </div>
              </div>

              {/* CALENDAR GRID */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">
                <div>Dom</div><div>Lun</div><div>Mar</div><div>Mie</div><div>Jue</div><div>Vie</div><div>Sab</div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-xl border border-dashed border-gray-100" />
                ))}
                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                  const day = i + 1;
                  const { trainings: dayTrainings, matches: dayMatches } = getCalendarEvents(day);
                  const hasEvents = dayTrainings.length > 0 || dayMatches.length > 0;

                  return (
                    <div key={`day-${day}`} className={`aspect-square p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      hasEvents ? 'bg-red-50/20 border-jn-red/20 hover:bg-red-50/40' : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}>
                      <span className={`text-xs font-black ${hasEvents ? 'text-jn-red' : 'text-gray-400'}`}>{day}</span>
                      
                      <div className="space-y-1">
                        {dayTrainings.map(t => (
                          <span key={t.id} className="block text-[8px] bg-blue-100 text-blue-700 px-1 py-0.5 rounded font-black truncate" title={`Entrenamiento ${t.category}`}>
                            ⏱️ {t.category}
                          </span>
                        ))}
                        {dayMatches.map(m => (
                          <span key={m.id} className="block text-[8px] bg-jn-red text-white px-1 py-0.5 rounded font-black truncate" title={`VS ${m.opponent}`}>
                            ⚽ VS {m.opponent}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: ENTRENAMIENTOS */}
          {activeTab === 'entrenamientos' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setTrainingForm({ date: '', timeSlot: '', category: 'Primera Masculina', team: '', coach: '', court: 'Cancha Parquet', objective: '', notes: '', status: 'SCHEDULED' });
                    setTrainingModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Programar Entrenamiento
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainings.map(t => (
                  <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 relative flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase tracking-wider">{t.category}</span>
                        <span className={`w-2 h-2 rounded-full ${t.status === 'SCHEDULED' ? 'bg-yellow-500 animate-pulse' : t.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                      <h4 className="font-bold text-sm">Entrenamiento {t.team ? `(${t.team})` : ''}</h4>
                      <div className="text-xs text-gray-500 space-y-1.5 font-bold">
                        <p className="flex items-center gap-1.5 text-gray-700"><Calendar size={12} /> {new Date(t.date).toLocaleDateString('es-AR')}</p>
                        <p className="flex items-center gap-1.5"><Clock size={12} /> {t.timeSlot} hs</p>
                        <p className="flex items-center gap-1.5"><Shield size={12} /> {t.court}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">Entrenador: {t.coach}</p>
                        {t.objective && <p className="text-[10px] text-jn-red uppercase mt-1">Objetivo: {t.objective}</p>}
                      </div>
                      {t.notes && <p className="text-xs text-gray-400 bg-gray-50 p-2.5 rounded-xl leading-relaxed">{t.notes}</p>}
                    </div>

                    <div className="flex gap-2 justify-end border-t border-gray-100 pt-3">
                      <button
                        onClick={() => {
                          setTrainingForm({ ...t, date: t.date.split('T')[0] });
                          setTrainingModal({ isOpen: true, editId: t.id });
                        }}
                        className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg bg-white"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteTraining(t.id)}
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

          {/* TAB 10: PARTIDOS */}
          {activeTab === 'partidos' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setMatchForm({ category: 'Primera Masculina', opponent: '', homeTeam: 'Jorge Newbery', awayTeam: '', referee: '', attendance: 0, date: '', timeSlot: '', ourScore: 0, opponentScore: 0, status: 'UPCOMING', competition: 'AFA Primera', venue: 'Cancha Jorge Newbery', season: '2026', isFeatured: false });
                    setMatchModal({ isOpen: true, editId: null });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Agendar Partido
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Fecha / Hora</th>
                      <th className="p-4">Rival</th>
                      <th className="p-4">Competencia / Categoría</th>
                      <th className="p-4 text-center">Score</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {matches.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="p-4 text-xs font-semibold">
                          <span>{new Date(m.date).toLocaleDateString('es-AR')}</span>
                          <span className="block text-[10px] text-gray-400">{m.timeSlot} hs</span>
                        </td>
                        <td className="p-4">VS {m.opponent.toUpperCase()}</td>
                        <td className="p-4">
                          <span className="text-xs">{m.category}</span>
                          <span className="block text-[9px] text-gray-400 uppercase font-black">{m.competition}</span>
                        </td>
                        <td className="p-4 text-center text-base font-black">
                          {m.status === 'UPCOMING' ? (
                            <span className="text-gray-400 text-xs uppercase font-bold">Sin Jugar</span>
                          ) : (
                            <span className="text-jn-red">{m.ourScore} - {m.opponentScore}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-[8px] font-black uppercase px-2.5 py-0.5 rounded ${
                            m.status === 'LIVE' ? 'bg-red-500 text-white animate-pulse' :
                            m.status === 'FINISHED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setMatchForm({ ...m, date: m.date.split('T')[0] });
                              setMatchModal({ isOpen: true, editId: m.id });
                            }}
                            className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg bg-white"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteMatch(m.id)}
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

          {/* TAB 11: REPORTES & STATS */}
          {activeTab === 'reportes' && (
            <div className="space-y-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Filtro de Reportes Deportivos</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tipo de Reporte</label>
                  <select
                    value={reportFilter.type}
                    onChange={e => setReportFilter(prev => ({ ...prev, type: e.target.value, id: '' }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white font-bold"
                  >
                    <option value="team">Por Equipo</option>
                    <option value="player">Por Jugador</option>
                    <option value="category">Por Categoría</option>
                  </select>
                </div>

                {reportFilter.type === 'team' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Seleccionar Equipo</label>
                    <select
                      value={reportFilter.id}
                      onChange={e => setReportFilter(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {reportFilter.type === 'player' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Seleccionar Jugador</label>
                    <select
                      value={reportFilter.id}
                      onChange={e => setReportFilter(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.lastName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {reportFilter.type === 'category' && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Seleccionar Categoría</label>
                    <select
                      value={reportFilter.category}
                      onChange={e => setReportFilter(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {Array.from(new Set(players.map(p => p.category))).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Temporada</label>
                  <select
                    value={reportFilter.season}
                    onChange={e => setReportFilter(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs font-bold bg-white"
                  >
                    <option value="2026">Temporada 2026</option>
                    <option value="2025">Temporada 2025</option>
                  </select>
                </div>
              </div>

              {/* REPORT PREVIEW */}
              <div className="border border-dashed p-6 rounded-2xl space-y-4">
                <h4 className="font-black text-sm uppercase text-gray-400">Vista Previa del Reporte de Rendimiento</h4>
                
                {reportFilter.type === 'team' && reportFilter.id && (
                  <div className="space-y-4">
                    <p className="font-black text-lg">Rendimiento Técnico - Equipo: {reportFilter.id}</p>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-2xl font-black text-jn-red">{players.filter(p => p.team === reportFilter.id).length}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Jugadores Activos</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-2xl font-black text-jn-red">{players.filter(p => p.team === reportFilter.id).reduce((acc, p) => acc + p.goals, 0)}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Goles Totales</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-2xl font-black text-jn-red">{players.filter(p => p.team === reportFilter.id).reduce((acc, p) => acc + p.yellowCards, 0)}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Amarillas</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <span className="text-2xl font-black text-jn-red">{players.filter(p => p.team === reportFilter.id).reduce((acc, p) => acc + p.redCards, 0)}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Rojas</p>
                      </div>
                    </div>
                  </div>
                )}

                {reportFilter.type === 'player' && reportFilter.id && (
                  <div className="space-y-4">
                    {(() => {
                      const p = players.find(x => x.id === parseInt(reportFilter.id));
                      if (!p) return <p className="text-xs text-gray-400">Jugador no encontrado.</p>;
                      return (
                        <>
                          <p className="font-black text-lg">Perfil e Historial: {p.name} {p.lastName}</p>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <span className="text-2xl font-black text-jn-red">{p.goals}</span>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Goles anotados</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <span className="text-2xl font-black text-jn-red">{p.assists}</span>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Asistencias</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <span className="text-2xl font-black text-jn-red">{p.cleanSheets}</span>
                              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Vallas Invictas</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {!reportFilter.id && (
                  <p className="text-xs text-gray-400">Seleccioná un elemento para ver la vista previa del reporte.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 12: DOCUMENTACION */}
          {activeTab === 'documentacion' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setDocForm({ title: '', url: '', category: 'Reglamento', description: '' });
                    setDocModal({ isOpen: true });
                  }}
                  className="bg-jn-red hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus size={16} /> Subir Documento
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {documents.map(d => (
                  <div key={d.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow relative">
                    <FileText size={32} className="text-jn-red flex-shrink-0 mt-1" />
                    <div className="space-y-1.5 flex-1 pr-6 font-bold">
                      <span className="text-[8px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">{d.category}</span>
                      <h4 className="font-bold text-sm leading-snug">{d.title}</h4>
                      {d.description && <p className="text-xs text-gray-400 leading-relaxed font-medium">{d.description}</p>}
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-black text-jn-red hover:underline uppercase tracking-wide">Descargar archivo</a>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(d.id)}
                      className="absolute top-4 right-4 p-1.5 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg bg-white"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL EQUIPOS */}
      {teamModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{teamModal.editId ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
              <button onClick={() => setTeamModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre del Equipo *</label>
                <input
                  type="text" required
                  value={teamForm.name}
                  onChange={e => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Categoría *</label>
                  <input
                    type="text" required
                    value={teamForm.category}
                    onChange={e => setTeamForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Temporada</label>
                  <input
                    type="text"
                    value={teamForm.season}
                    onChange={e => setTeamForm(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block">Entrenador (DT)</label>
                  <input
                    type="text"
                    value={teamForm.coach}
                    onChange={e => setTeamForm(prev => ({ ...prev, coach: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Ayudante</label>
                  <input
                    type="text"
                    value={teamForm.assistantCoach}
                    onChange={e => setTeamForm(prev => ({ ...prev, assistantCoach: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">PF</label>
                  <input
                    type="text"
                    value={teamForm.preparadorFisico}
                    onChange={e => setTeamForm(prev => ({ ...prev, preparadorFisico: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Escudo / Imagen URL</label>
                <input
                  type="text"
                  value={teamForm.imageUrl}
                  onChange={e => setTeamForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block">Estado</label>
                <select
                  value={teamForm.status}
                  onChange={e => setTeamForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="ACTIVE">ACTIVO</option>
                  <option value="INACTIVE">INACTIVO</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors mt-2"
              >
                {teamModal.editId ? 'Guardar Cambios' : 'Confirmar Creación'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PLANTELES / FICHA JUGADOR */}
      {playerModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{playerModal.editId ? 'Editar Ficha Jugador' : 'Registrar Jugador'}</h3>
              <button onClick={() => setPlayerModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Nombre *</label>
                  <input
                    type="text" required
                    value={playerForm.name}
                    onChange={e => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Apellido *</label>
                  <input
                    type="text" required
                    value={playerForm.lastName}
                    onChange={e => setPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block">Dorsal</label>
                  <input
                    type="number"
                    value={playerForm.dorsal}
                    onChange={e => setPlayerForm(prev => ({ ...prev, dorsal: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Edad *</label>
                  <input
                    type="number" required
                    value={playerForm.age}
                    onChange={e => setPlayerForm(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Posición *</label>
                  <select
                    value={playerForm.position}
                    onChange={e => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="Arquero">Arquero</option>
                    <option value="Cierre">Cierre</option>
                    <option value="Ala">Ala</option>
                    <option value="Pivot">Pivot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Categoría *</label>
                  <input
                    type="text" required
                    value={playerForm.category}
                    onChange={e => setPlayerForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Equipo *</label>
                  <input
                    type="text" required
                    value={playerForm.team}
                    onChange={e => setPlayerForm(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={playerForm.birthDate}
                    onChange={e => setPlayerForm(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Estado Físico / Sanción</label>
                  <select
                    value={playerForm.playerStatus}
                    onChange={e => setPlayerForm(prev => ({ ...prev, playerStatus: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="ACTIVE">ACTIVO</option>
                    <option value="INJURED">LESIONADO</option>
                    <option value="SUSPENDED">SUSPENDIDO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block">Partidos Jugados</label>
                  <input
                    type="number"
                    value={playerForm.matchesPlayed}
                    onChange={e => setPlayerForm(prev => ({ ...prev, matchesPlayed: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Goles</label>
                  <input
                    type="number"
                    value={playerForm.goals}
                    onChange={e => setPlayerForm(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Asistencias</label>
                  <input
                    type="number"
                    value={playerForm.assists}
                    onChange={e => setPlayerForm(prev => ({ ...prev, assists: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Foto URL</label>
                <input
                  type="text"
                  value={playerForm.photoUrl}
                  onChange={e => setPlayerForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors mt-2"
              >
                {playerModal.editId ? 'Guardar Cambios' : 'Confirmar Registro'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR PLANTEL */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm uppercase">Asignar Roster: {assignModal.player?.name}</h3>
              <button onClick={() => setAssignModal({ isOpen: false, player: null })} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignRoster} className="space-y-4 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Seleccionar Equipo</label>
                <select
                  name="team"
                  defaultValue={assignModal.player?.team || ''}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                >
                  <option value="">Ninguno</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block">Categoría Deportiva</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={assignModal.player?.category || ''}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="mb-1 block">Dorsal (#)</label>
                <input
                  type="number"
                  name="dorsal"
                  defaultValue={assignModal.player?.dorsal || 0}
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs"
              >
                Confirmar Asignación
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENTRENADORES */}
      {coachModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{coachModal.editId ? 'Editar Personal' : 'Registrar Personal Técnico'}</h3>
              <button onClick={() => setCoachModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoach} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre Completo *</label>
                <input
                  type="text" required
                  value={coachForm.name}
                  onChange={e => setCoachForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Cargo / Función</label>
                  <select
                    value={coachForm.role}
                    onChange={e => setCoachForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="ENTRENADOR">ENTRENADOR</option>
                    <option value="AYUDANTE">AYUDANTE DE CAMPO</option>
                    <option value="PF">PREPARADOR FÍSICO</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Licencia Habilitante</label>
                  <input
                    type="text"
                    value={coachForm.license}
                    onChange={e => setCoachForm(prev => ({ ...prev, license: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                    placeholder="ATFA Pro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Teléfono de Contacto</label>
                  <input
                    type="text"
                    value={coachForm.phone}
                    onChange={e => setCoachForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Email</label>
                  <input
                    type="email"
                    value={coachForm.email}
                    onChange={e => setCoachForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs lowercase"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Categorías a Cargo (separadas por comas)</label>
                <input
                  type="text"
                  value={coachForm.categories}
                  onChange={e => setCoachForm(prev => ({ ...prev, categories: e.target.value }))}
                  placeholder="Primera, Tercera, Quinta"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block">Foto URL</label>
                <input
                  type="text"
                  value={coachForm.photoUrl}
                  onChange={e => setCoachForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block">Biografía / Notas</label>
                <textarea
                  value={coachForm.biography}
                  onChange={e => setCoachForm(prev => ({ ...prev, biography: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors mt-2"
              >
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIAS */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm uppercase">{categoryModal.editId ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={() => setCategoryModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Nombre de Categoría *</label>
                <input
                  type="text" required
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Tipo</label>
                  <select
                    value={categoryForm.type}
                    onChange={e => setCategoryForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white"
                  >
                    <option value="SOCIO">SOCIO</option>
                    <option value="DISCIPLINA">DISCIPLINA</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Arancel ($) *</label>
                  <input
                    type="number" required
                    value={categoryForm.price}
                    onChange={e => setCategoryForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Descripción breve</label>
                <textarea
                  value={categoryForm.description}
                  onChange={e => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-2 h-20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white py-3 rounded-xl font-black uppercase tracking-wider text-xs"
              >
                Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARTIDOS */}
      {matchModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{matchModal.editId ? 'Editar Partido' : 'Programar Partido'}</h3>
              <button onClick={() => setMatchModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMatch} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Categoría *</label>
                  <input
                    type="text" required
                    value={matchForm.category}
                    onChange={e => setMatchForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Rival / Oponente *</label>
                  <input
                    type="text" required
                    value={matchForm.opponent}
                    onChange={e => setMatchForm(prev => ({ ...prev, opponent: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Fecha del encuentro *</label>
                  <input
                    type="date" required
                    value={matchForm.date}
                    onChange={e => setMatchForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Horario *</label>
                  <input
                    type="text" required
                    placeholder="20:00"
                    value={matchForm.timeSlot}
                    onChange={e => setMatchForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Competencia</label>
                  <input
                    type="text"
                    value={matchForm.competition}
                    onChange={e => setMatchForm(prev => ({ ...prev, competition: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Sede (Gimnasio)</label>
                  <input
                    type="text"
                    value={matchForm.venue}
                    onChange={e => setMatchForm(prev => ({ ...prev, venue: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block">Marcador (Newbery)</label>
                  <input
                    type="number"
                    value={matchForm.ourScore}
                    onChange={e => setMatchForm(prev => ({ ...prev, ourScore: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Marcador (Rival)</label>
                  <input
                    type="number"
                    value={matchForm.opponentScore}
                    onChange={e => setMatchForm(prev => ({ ...prev, opponentScore: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Estado</label>
                  <select
                    value={matchForm.status}
                    onChange={e => setMatchForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="UPCOMING">PROGRAMADO</option>
                    <option value="LIVE">EN VIVO</option>
                    <option value="FINISHED">FINALIZADO</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors mt-2"
              >
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ENTRENAMIENTOS */}
      {trainingModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{trainingModal.editId ? 'Editar Entrenamiento' : 'Programar Entrenamiento'}</h3>
              <button onClick={() => setTrainingModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Fecha *</label>
                  <input
                    type="date" required
                    value={trainingForm.date}
                    onChange={e => setTrainingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Horario *</label>
                  <input
                    type="text" required
                    placeholder="20:00"
                    value={trainingForm.timeSlot}
                    onChange={e => setTrainingForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Categoría *</label>
                  <input
                    type="text" required
                    value={trainingForm.category}
                    onChange={e => setTrainingForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Equipo Vinculado</label>
                  <select
                    value={trainingForm.team}
                    onChange={e => setTrainingForm(prev => ({ ...prev, team: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
                  >
                    <option value="">Ninguno</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Entrenador Responsable *</label>
                <input
                  type="text" required
                  value={trainingForm.coach}
                  onChange={e => setTrainingForm(prev => ({ ...prev, coach: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block">Objetivo Técnico</label>
                <input
                  type="text"
                  value={trainingForm.objective}
                  onChange={e => setTrainingForm(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="Defensa 2-2, Salida Presión"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Cancha *</label>
                  <select
                    value={trainingForm.court}
                    onChange={e => setTrainingForm(prev => ({ ...prev, court: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="Cancha Parquet">Cancha Parquet</option>
                    <option value="Cancha Sintética">Cancha Sintética</option>
                    <option value="Salón Multideporte">Salón Multideporte</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Estado</label>
                  <select
                    value={trainingForm.status}
                    onChange={e => setTrainingForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="SCHEDULED">AGENDADO</option>
                    <option value="COMPLETED">REALIZADO</option>
                    <option value="CANCELLED">SUSPENDIDO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Observaciones adicionales</label>
                <textarea
                  value={trainingForm.notes}
                  onChange={e => setTrainingForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors mt-2"
              >
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DOCUMENTACION */}
      {docModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">Subir Documento Técnico</h3>
              <button onClick={() => setDocModal({ isOpen: false })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-3 text-xs font-bold text-gray-600 uppercase">
              <div>
                <label className="mb-1 block">Título del Documento *</label>
                <input
                  type="text" required
                  value={docForm.title}
                  onChange={e => setDocForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block">Tipo de documento</label>
                  <select
                    value={docForm.category}
                    onChange={e => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="Reglamento">Reglamento</option>
                    <option value="Apto Médico">Apto Médico</option>
                    <option value="Ficha Afiliación">Ficha Afiliación</option>
                    <option value="Manual Táctico">Manual Táctico</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">URL del archivo *</label>
                  <input
                    type="text" required
                    value={docForm.url}
                    onChange={e => setDocForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block">Descripción breve</label>
                <textarea
                  value={docForm.description}
                  onChange={e => setDocForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors"
              >
                Subir Archivo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
