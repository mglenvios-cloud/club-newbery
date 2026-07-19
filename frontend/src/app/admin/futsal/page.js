"use client";
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Video, Image as ImageIcon, Newspaper, Plus, Edit, Trash, Eye, EyeOff, Activity, Shield, CheckCircle, Search, Filter, PlayCircle, ExternalLink } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';
import MediaUploadUniversal from '@/components/MediaUploadUniversal';

const fetch = apiFetch;

export default function AdminFutsal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState("ADMIN");

  // Season and Category global filters
  const [filterSeason, setFilterSeason] = useState("2026");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Data lists
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [media, setMedia] = useState([]);
  const [futsalNews, setFutsalNews] = useState([]);

  // Loading & Message state
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);

  // Edit target state (null for creating, object for editing)
  const [editTarget, setEditTarget] = useState(null);

  // Form states
  // 1. Team Form
  const [teamForm, setTeamForm] = useState({
    name: "", category: "Primera Masculina", gender: "MASCULINO", season: "2026",
    coach: "", assistantCoach: "", trainingDays: "", trainingSchedule: "",
    location: "", description: "", imageUrl: ""
  });

  // 2. Player Form
  const [playerForm, setPlayerForm] = useState({
    name: "", lastName: "", dorsal: "0", age: "20", category: "Primera Masculina",
    position: "Ala", team: "Futsal AFA", achievements: "", matchesPlayed: "0",
    goals: "0", assists: "0", yellowCards: "0", redCards: "0", cleanSheets: "0",
    season: "2026", description: "", birthDate: "", playerStatus: "ACTIVE",
    videoUrl: "", photoUrl: "", dni: ""
  });

  // 3. Match Form
  const [matchForm, setMatchForm] = useState({
    category: "Primera Masculina", opponent: "", homeTeam: "Jorge Newbery", awayTeam: "",
    referee: "", attendance: "0", date: "", timeSlot: "", ourScore: "", opponentScore: "",
    status: "UPCOMING", videoUrl: "", summary: "", photoGallery: "", isFeatured: false,
    competition: "AFA Primera", venue: "Cancha Jorge Newbery", season: "2026",
    externalMatchId: "", liveStreamUrl: "", provider: "LOCAL"
  });

  // 4. Media Form
  const [mediaForm, setMediaForm] = useState({
    type: "PHOTO", title: "", url: "", category: "Primera", description: ""
  });

  // 5. News Form
  const [newsForm, setNewsForm] = useState({
    title: "", description: "", imageUrl: "", category: "Primera Masculina",
    season: "2026", published: true
  });

  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const showNotification = (type, text) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Teams
      const resTeams = await fetch(`/api/teams`);
      const dataTeams = resTeams.ok ? await resTeams.json() : [];
      setTeams(dataTeams);

      // Fetch Players
      const resPlayers = await fetch(`/api/players`);
      const dataPlayers = resPlayers.ok ? await resPlayers.json() : [];
      setPlayers(dataPlayers.filter(p => p.team === 'Futsal AFA' || p.category.toLowerCase().includes('futsal')));

      // Fetch Matches
      const resMatches = await fetch(`/api/matches`);
      const dataMatches = resMatches.ok ? await resMatches.json() : [];
      setMatches(dataMatches);

      // Fetch Media
      const resMedia = await fetch(`/api/media`);
      const dataMedia = resMedia.ok ? await resMedia.json() : [];
      setMedia(dataMedia);

      // Fetch News
      const resNews = await fetch(`/api/futsal-news`);
      const dataNews = resNews.ok ? await resNews.json() : [];
      setFutsalNews(dataNews);

    } catch (e) {
      console.error('[Futsal Admin] Error al cargar datos del backend:', e.message);
      setPlayers([]);
      setTeams([]);
      setMatches([]);
      setMedia([]);
      setNews([]);
      showNotification("error", "Error conectando con la API, usando datos locales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRole(getCookie("adminRole") || "ADMIN");
    fetchData();
  }, []);

  // TEAM CRUD OPERATIONS
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    const url = editTarget ? `/api/teams/${editTarget.id}` : `/api/teams`;
    const method = editTarget ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      if (res.ok) {
        showNotification('success', editTarget ? 'Equipo actualizado' : 'Equipo creado');
        setShowTeamModal(false);
        setEditTarget(null);
        fetchData();
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Error al guardar equipo');
      }
    } catch (err) {
      showNotification('error', 'Error del servidor al guardar equipo');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría/equipo?')) return;
    try {
      const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Categoría eliminada');
        fetchData();
      } else {
        showNotification('error', 'Error al eliminar');
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleOpenTeamEdit = (team) => {
    setEditTarget(team);
    setTeamForm(team);
    setShowTeamModal(true);
  };

  const handleOpenTeamCreate = () => {
    setEditTarget(null);
    setTeamForm({
      name: "", category: "Primera Masculina", gender: "MASCULINO", season: "2026",
      coach: "", assistantCoach: "", trainingDays: "", trainingSchedule: "",
      location: "", description: "", imageUrl: ""
    });
    setShowTeamModal(true);
  };

  // PLAYER CRUD OPERATIONS
  const handleSavePlayer = async (e) => {
    e.preventDefault();
    const url = editTarget ? `/api/players/${editTarget.id}` : `/api/players`;
    const method = editTarget ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm)
      });
      if (res.ok) {
        showNotification('success', editTarget ? 'Jugador actualizado' : 'Jugador creado');
        setShowPlayerModal(false);
        setEditTarget(null);
        fetchData();
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Error al guardar jugador');
      }
    } catch (err) {
      showNotification('error', 'Error del servidor');
    }
  };

  const handleDeletePlayer = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este jugador?')) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Jugador eliminado');
        fetchData();
      } else {
        showNotification('error', 'Error al eliminar');
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleOpenPlayerEdit = (p) => {
    setEditTarget(p);
    setPlayerForm({
      ...p,
      birthDate: p.birthDate ? new Date(p.birthDate).toISOString().split('T')[0] : "",
      dni: p.dni || ""
    });
    setShowPlayerModal(true);
  };

  const handleOpenPlayerCreate = () => {
    setEditTarget(null);
    setPlayerForm({
      name: "", lastName: "", dorsal: "0", age: "20", category: "Primera Masculina",
      position: "Ala", team: "Futsal AFA", achievements: "", matchesPlayed: "0",
      goals: "0", assists: "0", yellowCards: "0", redCards: "0", cleanSheets: "0",
      season: "2026", description: "", birthDate: "", playerStatus: "ACTIVE",
      videoUrl: "", photoUrl: "", dni: ""
    });
    setShowPlayerModal(true);
  };

  // MATCH CRUD OPERATIONS
  const handleSaveMatch = async (e) => {
    e.preventDefault();
    const url = editTarget ? `/api/matches/${editTarget.id}` : `/api/matches`;
    const method = editTarget ? 'PUT' : 'POST';

    try {
      const payload = {
        ...matchForm,
        ourScore: matchForm.ourScore === "" ? null : matchForm.ourScore,
        opponentScore: matchForm.opponentScore === "" ? null : matchForm.opponentScore,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showNotification('success', editTarget ? 'Partido actualizado' : 'Partido registrado');
        setShowMatchModal(false);
        setEditTarget(null);
        fetchData();
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Error al guardar partido');
      }
    } catch (err) {
      showNotification('error', 'Error del servidor');
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!confirm('¿Seguro de eliminar este partido?')) return;
    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Partido eliminado');
        fetchData();
      } else {
        showNotification('error', 'Error al eliminar');
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleOpenMatchEdit = (m) => {
    setEditTarget(m);
    setMatchForm({
      ...m,
      date: m.date ? new Date(m.date).toISOString().split('T')[0] : "",
      ourScore: m.ourScore !== null ? m.ourScore : "",
      opponentScore: m.opponentScore !== null ? m.opponentScore : ""
    });
    setShowMatchModal(true);
  };

  const handleOpenMatchCreate = () => {
    setEditTarget(null);
    setMatchForm({
      category: "Primera Masculina", opponent: "", homeTeam: "Jorge Newbery", awayTeam: "",
      referee: "", attendance: "0", date: "", timeSlot: "", ourScore: "", opponentScore: "",
      status: "UPCOMING", videoUrl: "", summary: "", photoGallery: "", isFeatured: false,
      competition: "AFA Primera", venue: "Cancha Jorge Newbery", season: "2026",
      externalMatchId: "", liveStreamUrl: "", provider: "LOCAL"
    });
    setShowMatchModal(true);
  };

  // MEDIA CRUD OPERATIONS
  const handleSaveMedia = async (e) => {
    e.preventDefault();
    const url = editTarget ? `/api/media/${editTarget.id}` : `/api/media`;
    const method = editTarget ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaForm)
      });
      if (res.ok) {
        showNotification('success', editTarget ? 'Multimedia actualizada' : 'Multimedia subida');
        setShowMediaModal(false);
        setEditTarget(null);
        fetchData();
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Error al guardar');
      }
    } catch (err) {
      showNotification('error', 'Error de servidor');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!confirm('¿Seguro de eliminar este archivo multimedia?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Archivo eliminado');
        fetchData();
      } else {
        showNotification('error', 'Error al eliminar');
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleOpenMediaEdit = (m) => {
    setEditTarget(m);
    setMediaForm(m);
    setShowMediaModal(true);
  };

  const handleOpenMediaCreate = () => {
    setEditTarget(null);
    setMediaForm({
      type: "PHOTO", title: "", url: "", category: "Primera", description: ""
    });
    setShowMediaModal(true);
  };

  // NEWS CRUD OPERATIONS
  const handleSaveNews = async (e) => {
    e.preventDefault();
    const url = editTarget ? `/api/futsal-news/${editTarget.id}` : `/api/futsal-news`;
    const method = editTarget ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm)
      });
      if (res.ok) {
        showNotification('success', editTarget ? 'Noticia de futsal actualizada' : 'Noticia creada');
        setShowNewsModal(false);
        setEditTarget(null);
        fetchData();
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Error al guardar');
      }
    } catch (err) {
      showNotification('error', 'Error de servidor');
    }
  };

  const handleDeleteNews = async (id) => {
    if (!confirm('¿Seguro de eliminar esta noticia?')) return;
    try {
      const res = await fetch(`/api/futsal-news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification('success', 'Noticia eliminada');
        fetchData();
      } else {
        showNotification('error', 'Error al eliminar');
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleToggleNewsPublished = async (item) => {
    try {
      const res = await fetch(`/api/futsal-news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, published: !item.published })
      });
      if (res.ok) {
        showNotification('success', item.published ? 'Noticia oculta' : 'Noticia publicada');
        fetchData();
      }
    } catch (err) {
      showNotification('error', 'Error de red');
    }
  };

  const handleOpenNewsEdit = (n) => {
    setEditTarget(n);
    setNewsForm(n);
    setShowNewsModal(true);
  };

  const handleOpenNewsCreate = () => {
    setEditTarget(null);
    setNewsForm({
      title: "", description: "", imageUrl: "", category: "Primera Masculina",
      season: "2026", published: true
    });
    setShowNewsModal(true);
  };

  // Filter lists based on global dashboard filters (season & category)
  const isMatchCategoryInFilter = (itemCat, filterCat) => {
    if (filterCat === "ALL") return true;
    if (filterCat === "Primera") return itemCat.toLowerCase().includes("primera");
    if (filterCat === "Inferiores") return ["3ra", "4ta", "5ta", "6ta", "7ma", "8va", "tercera", "cuarta", "quinta", "sexta", "septima", "octava"].some(v => itemCat.toLowerCase().includes(v));
    if (filterCat === "Promocionales") return ["escuelita", "pre infantil", "infantil", "promocional"].some(v => itemCat.toLowerCase().includes(v));
    return itemCat.toLowerCase().includes(filterCat.toLowerCase());
  };

  const filteredTeams = teams.filter(t => 
    (t.season === filterSeason) && 
    isMatchCategoryInFilter(t.category, filterCategory)
  );

  const filteredPlayers = players.filter(p => 
    (p.season === filterSeason) && 
    isMatchCategoryInFilter(p.category, filterCategory)
  );

  const filteredMatches = matches.filter(m => 
    (m.season === filterSeason) && 
    isMatchCategoryInFilter(m.category, filterCategory)
  );

  const filteredNews = futsalNews.filter(n => 
    (n.season === filterSeason) && 
    isMatchCategoryInFilter(n.category, filterCategory)
  );

  return (
    <div className="space-y-6 text-jn-black">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in font-bold flex items-center gap-2">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in font-bold flex items-center gap-2">
          <Shield size={18} /> {errorMsg}
        </div>
      )}

      {/* Header and Global Filter Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-150 gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <Trophy className="text-jn-red" /> GESTIÓN FUTSAL AFA
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">Control del módulo profesional, inferiores y promocionales.</p>
        </div>

        {/* Global Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold">
            <Filter size={14} className="text-gray-400" />
            <span>Temporada:</span>
            <select 
              value={filterSeason} 
              onChange={e => setFilterSeason(e.target.value)}
              className="bg-transparent font-black text-jn-red outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold">
            <span>Categoría:</span>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-transparent font-black text-jn-red outline-none cursor-pointer"
            >
              <option value="ALL">Todas</option>
              <option value="Primera">Primera Div.</option>
              <option value="3ra">3ra Div.</option>
              <option value="4ta">4ta Div.</option>
              <option value="5ta">5ta Div.</option>
              <option value="6ta">6ta Div.</option>
              <option value="7ma">7ma Div.</option>
              <option value="8va">8va Div.</option>
              <option value="Promocionales">Promocionales</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white p-2.5 rounded-2xl shadow-sm border gap-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
          { id: 'teams', label: 'Equipos/Categorías', icon: <Trophy size={16} /> },
          { id: 'players', label: 'Jugadores', icon: <Users size={16} /> },
          { id: 'matches', label: 'Partidos', icon: <Calendar size={16} /> },
          { id: 'media', label: 'Multimedia', icon: <Video size={16} /> },
          { id: 'news', label: 'Noticias Futsal', icon: <Newspaper size={16} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === t.id 
                ? 'bg-jn-red text-white shadow-md shadow-jn-red/20' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-jn-black'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
              <Trophy size={24} className="text-jn-red mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Equipos Filtrados</p>
              <h3 className="text-2xl font-black mt-1">{filteredTeams.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
              <Users size={24} className="text-blue-600 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Jugadores Fichados</p>
              <h3 className="text-2xl font-black mt-1">{filteredPlayers.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
              <Calendar size={24} className="text-purple-600 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Partidos Programados</p>
              <h3 className="text-2xl font-black mt-1">{filteredMatches.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center">
              <Video size={24} className="text-green-600 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Archivos Multimedia</p>
              <h3 className="text-2xl font-black mt-1">{media.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm text-center col-span-2 lg:col-span-1">
              <Newspaper size={24} className="text-orange-500 mx-auto mb-2" />
              <p className="text-[10px] font-bold text-gray-400 uppercase">Noticias Futsal</p>
              <h3 className="text-2xl font-black mt-1">{filteredNews.length}</h3>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Matches Preview */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex justify-between items-center">
                <span>Próximos Encuentros</span>
                <button onClick={() => setActiveTab('matches')} className="text-xs text-jn-red hover:underline">Ver Todos</button>
              </h3>
              <div className="space-y-3">
                {filteredMatches.filter(m => m.status === 'UPCOMING').slice(0, 3).map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="bg-jn-red/10 text-jn-red text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{m.category}</span>
                      <p className="font-bold text-jn-black mt-1.5">{m.homeTeam} vs {m.opponent}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{new Date(m.date).toLocaleDateString()} • {m.timeSlot}hs ({m.venue})</p>
                    </div>
                    {m.liveStreamUrl && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full uppercase">
                        Stream Listo
                      </span>
                    )}
                  </div>
                ))}
                {filteredMatches.filter(m => m.status === 'UPCOMING').length === 0 && (
                  <p className="text-xs text-gray-400 font-semibold py-4 text-center">No hay partidos próximos programados.</p>
                )}
              </div>
            </div>

            {/* Last Results Preview */}
            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex justify-between items-center">
                <span>Últimos Resultados</span>
                <button onClick={() => setActiveTab('matches')} className="text-xs text-jn-red hover:underline">Ver Todos</button>
              </h3>
              <div className="space-y-3">
                {filteredMatches.filter(m => m.status === 'FINISHED').slice(0, 3).map(m => (
                  <div key={m.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{m.category}</span>
                      <p className="font-bold text-jn-black mt-1.5">{m.homeTeam} vs {m.opponent}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{m.competition}</p>
                    </div>
                    <div className="bg-jn-red text-white px-3.5 py-1.5 rounded-lg text-sm font-black font-mono">
                      {m.ourScore} - {m.opponentScore}
                    </div>
                  </div>
                ))}
                {filteredMatches.filter(m => m.status === 'FINISHED').length === 0 && (
                  <p className="text-xs text-gray-400 font-semibold py-4 text-center">No hay resultados registrados recientemente.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. TEAMS */}
      {activeTab === 'teams' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-jn-black uppercase tracking-tight">Equipos Futsal AFA</h3>
            <button 
              onClick={handleOpenTeamCreate}
              className="flex items-center gap-1.5 bg-jn-red text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-jn-darkred transition-colors uppercase tracking-wider"
            >
              <Plus size={16} /> Nueva Categoría
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                    <th className="p-4">Categoría/Equipo</th>
                    <th className="p-4">Género</th>
                    <th className="p-4">Cuerpo Técnico</th>
                    <th className="p-4">Entrenamiento</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-jn-black">
                        {t.name}
                        <span className="block text-[10px] text-gray-400 font-medium mt-0.5">{t.category}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-500">{t.gender}</td>
                      <td className="p-4">
                        <span className="font-bold text-jn-black">Coach: {t.coach || 'No asignado'}</span>
                        <span className="block text-[10px] text-gray-400 mt-0.5">AC: {t.assistantCoach || '-'}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-600 block">{t.trainingDays || 'Sin definir'}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{t.trainingSchedule || '-'}</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenTeamEdit(t)} className="p-2 bg-gray-100 hover:bg-jn-red/10 hover:text-jn-red rounded-lg transition-colors text-gray-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteTeam(t.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-gray-400 font-semibold">No se encontraron categorías/equipos creados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. PLAYERS */}
      {activeTab === 'players' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-jn-black uppercase tracking-tight">Fichas de Jugadores</h3>
            <button 
              onClick={handleOpenPlayerCreate}
              className="flex items-center gap-1.5 bg-jn-red text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-jn-darkred transition-colors uppercase tracking-wider"
            >
              <Plus size={16} /> Fichar Jugador
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                    <th className="p-4">Camiseta / Nombre</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Posición</th>
                    <th className="p-4 text-center">Partidos</th>
                    <th className="p-4 text-center">Goles</th>
                    <th className="p-4 text-center">Asist.</th>
                    <th className="p-4 text-center">Vallas Inv.</th>
                    <th className="p-4 text-center">Tarjetas (A/R)</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-jn-red/10 text-jn-red font-black font-mono flex items-center justify-center rounded-md text-[10px]">{p.dorsal}</span>
                          <div>
                            <span className="font-bold text-jn-black">{p.name} {p.lastName}</span>
                            <span className="block text-[9px] text-gray-400 font-medium mt-0.5">Edad: {p.age} años {p.dni && `| DNI: ${p.dni}`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-500">{p.category}</td>
                      <td className="p-4 font-semibold text-gray-700">{p.position}</td>
                      <td className="p-4 text-center font-bold font-mono">{p.matchesPlayed}</td>
                      <td className="p-4 text-center font-bold font-mono text-jn-red">{p.goals}</td>
                      <td className="p-4 text-center font-bold font-mono text-blue-600">{p.assists}</td>
                      <td className="p-4 text-center font-bold font-mono text-green-600">{p.cleanSheets}</td>
                      <td className="p-4 text-center font-bold font-mono">
                        <span className="text-yellow-600">{p.yellowCards}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-red-600">{p.redCards}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          p.playerStatus === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-200' :
                          p.playerStatus === 'INJURED' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {p.playerStatus === 'ACTIVE' ? 'Activo' : p.playerStatus === 'INJURED' ? 'Lesionado' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenPlayerEdit(p)} className="p-2 bg-gray-100 hover:bg-jn-red/10 hover:text-jn-red rounded-lg transition-colors text-gray-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeletePlayer(p.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td colSpan="10" className="p-10 text-center text-gray-400 font-semibold">No se encontraron jugadores registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-jn-black uppercase tracking-tight">Fixture y Resultados</h3>
            <button 
              onClick={handleOpenMatchCreate}
              className="flex items-center gap-1.5 bg-jn-red text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-jn-darkred transition-colors uppercase tracking-wider"
            >
              <Plus size={16} /> Registrar Partido
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                    <th className="p-4">Partido / Oponente</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Sede / Competencia</th>
                    <th className="p-4 text-center">Marcador</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Proveedor / Integración</th>
                    <th className="p-4 text-center">Destacado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map(m => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-jn-black block">{m.homeTeam} vs {m.opponent || m.awayTeam}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Ref: {m.referee || 'Sin asignar'}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-500">{m.category}</td>
                      <td className="p-4">
                        <span className="font-bold block">{new Date(m.date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{m.timeSlot} hs</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-600 block">{m.venue}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{m.competition}</span>
                      </td>
                      <td className="p-4 text-center">
                        {m.status === 'FINISHED' ? (
                          <div className="inline-block bg-jn-red text-white font-mono font-black text-sm px-2.5 py-1 rounded">
                            {m.ourScore} - {m.opponentScore}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          m.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          m.status === 'LIVE' ? 'bg-green-600 text-white animate-pulse' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {m.status === 'UPCOMING' ? 'Próximo' : m.status === 'LIVE' ? 'En Vivo 🔴' : 'Finalizado'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-700 block">{m.provider}</span>
                        {m.externalMatchId && (
                          <span className="text-[9px] text-gray-400 font-mono">ID: {m.externalMatchId}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {m.isFeatured ? (
                          <span className="text-yellow-500 text-base">⭐</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenMatchEdit(m)} className="p-2 bg-gray-100 hover:bg-jn-red/10 hover:text-jn-red rounded-lg transition-colors text-gray-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteMatch(m.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMatches.length === 0 && (
                    <tr>
                      <td colSpan="9" className="p-10 text-center text-gray-400 font-semibold">No hay partidos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. MULTIMEDIA */}
      {activeTab === 'media' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-jn-black uppercase tracking-tight">Galería de Fotos y Videos</h3>
            <button 
              onClick={handleOpenMediaCreate}
              className="flex items-center gap-1.5 bg-jn-red text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-jn-darkred transition-colors uppercase tracking-wider"
            >
              <Plus size={16} /> Publicar Archivo
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                    <th className="p-4">Título</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Categoría Relacionada</th>
                    <th className="p-4">URL del Recurso</th>
                    <th className="p-4">Fecha Publicación</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map(m => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-jn-black block">{m.title}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{m.description || 'Sin descripción'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          m.type === 'VIDEO' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">{m.category}</td>
                      <td className="p-4 font-mono text-[10px] text-gray-400 max-w-[200px] truncate">{m.url}</td>
                      <td className="p-4 text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenMediaEdit(m)} className="p-2 bg-gray-100 hover:bg-jn-red/10 hover:text-jn-red rounded-lg transition-colors text-gray-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteMedia(m.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {media.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 font-semibold">No se encontraron archivos multimedia publicados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. FUTSAL NEWS */}
      {activeTab === 'news' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-jn-black uppercase tracking-tight">Noticias de Futsal</h3>
            <button 
              onClick={handleOpenNewsCreate}
              className="flex items-center gap-1.5 bg-jn-red text-white text-xs font-black px-4 py-2.5 rounded-xl hover:bg-jn-darkred transition-colors uppercase tracking-wider"
            >
              <Plus size={16} /> Crear Noticia
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold border-b border-gray-150">
                    <th className="p-4">Título</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Temporada</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Fecha de Creación</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map(n => (
                    <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-jn-black block">{n.title}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{n.description}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-600">{n.category}</td>
                      <td className="p-4 font-mono">{n.season}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggleNewsPublished(n)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                            n.published 
                              ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' 
                              : 'bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100'
                          }`}
                        >
                          {n.published ? <Eye size={10} /> : <EyeOff size={10} />}
                          {n.published ? 'Publicada' : 'Borrador'}
                        </button>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOpenNewsEdit(n)} className="p-2 bg-gray-100 hover:bg-jn-red/10 hover:text-jn-red rounded-lg transition-colors text-gray-500">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDeleteNews(n.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-500">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredNews.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-10 text-center text-gray-400 font-semibold">No se encontraron noticias de futsal.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TEAM CREATION/EDIT MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10">
              <h3 className="font-black uppercase text-sm tracking-widest">{editTarget ? 'Editar Categoría' : 'Nueva Categoría / Equipo'}</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre Comercial del Equipo</label>
                  <input type="text" value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Futsal AFA Primera" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría Deportiva</label>
                  <select value={teamForm.category} onChange={e => setTeamForm({...teamForm, category: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="Primera Masculina">Primera Masculina</option>
                    <option value="Primera Femenina">Primera Femenina</option>
                    <option value="3ra División">3ra División</option>
                    <option value="4ta División">4ta División</option>
                    <option value="5ta División">5ta División</option>
                    <option value="6ta División">6ta División</option>
                    <option value="7ma División">7ma División</option>
                    <option value="8va División">8va División</option>
                    <option value="Escuelita">Escuelita</option>
                    <option value="Pre Infantil">Pre Infantil</option>
                    <option value="Infantil">Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Género</label>
                  <select value={teamForm.gender} onChange={e => setTeamForm({...teamForm, gender: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Director Técnico</label>
                  <input type="text" value={teamForm.coach} onChange={e => setTeamForm({...teamForm, coach: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Prof. Ariel González" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ayudante de Campo</label>
                  <input type="text" value={teamForm.assistantCoach} onChange={e => setTeamForm({...teamForm, assistantCoach: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Marcos Silva" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Días de Entrenamiento</label>
                  <input type="text" value={teamForm.trainingDays} onChange={e => setTeamForm({...teamForm, trainingDays: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Lunes, Miércoles y Viernes" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Horario</label>
                  <input type="text" value={teamForm.trainingSchedule} onChange={e => setTeamForm({...teamForm, trainingSchedule: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. 19:30 a 21:00 hs" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Lugar físico</label>
                  <input type="text" value={teamForm.location} onChange={e => setTeamForm({...teamForm, location: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Cancha Parquet (Sede Central)" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción / Mensaje</label>
                  <textarea value={teamForm.description} onChange={e => setTeamForm({...teamForm, description: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="Descripción de la categoría o lema del equipo..." rows="2" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Foto Representativa</label>
                  <MediaUploadUniversal
                    value={teamForm.imageUrl}
                    onChange={url => setTeamForm({...teamForm, imageUrl: url})}
                    category="multimedia"
                    allowedTypes={['image']}
                  />
                </div>
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowTeamModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="bg-jn-red text-white hover:bg-jn-darkred px-5 py-2.5 rounded-xl font-bold uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLAYER MODAL */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10">
              <h3 className="font-black uppercase text-sm tracking-widest">{editTarget ? 'Editar Jugador' : 'Fichar Nuevo Jugador'}</h3>
              <button onClick={() => setShowPlayerModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSavePlayer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre</label>
                  <input type="text" value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Apellido</label>
                  <input type="text" value={playerForm.lastName} onChange={e => setPlayerForm({...playerForm, lastName: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">N° de Camiseta (Dorsal)</label>
                  <input type="number" value={playerForm.dorsal} onChange={e => setPlayerForm({...playerForm, dorsal: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Edad</label>
                  <input type="number" value={playerForm.age} onChange={e => setPlayerForm({...playerForm, age: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
                  <select value={playerForm.category} onChange={e => setPlayerForm({...playerForm, category: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="Primera Masculina">Primera Masculina</option>
                    <option value="Primera Femenina">Primera Femenina</option>
                    <option value="3ra División">3ra División</option>
                    <option value="4ta División">4ta División</option>
                    <option value="5ta División">5ta División</option>
                    <option value="6ta División">6ta División</option>
                    <option value="7ma División">7ma División</option>
                    <option value="8va División">8va División</option>
                    <option value="Escuelita">Escuelita</option>
                    <option value="Pre Infantil">Pre Infantil</option>
                    <option value="Infantil">Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Posición</label>
                  <select value={playerForm.position} onChange={e => setPlayerForm({...playerForm, position: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="Arquero">Arquero</option>
                    <option value="Cierre">Cierre</option>
                    <option value="Ala">Ala</option>
                    <option value="Pivot">Pivot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha de Nacimiento</label>
                  <input type="date" value={playerForm.birthDate} onChange={e => setPlayerForm({...playerForm, birthDate: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Estado de Disponibilidad</label>
                  <select value={playerForm.playerStatus} onChange={e => setPlayerForm({...playerForm, playerStatus: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="ACTIVE">Activo</option>
                    <option value="INJURED">Lesionado</option>
                    <option value="INACTIVE">Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">DNI del Jugador</label>
                  <input type="text" value={playerForm.dni} onChange={e => setPlayerForm({...playerForm, dni: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. 40123456" />
                </div>

                <div className="col-span-2 border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-jn-red mb-3">Estadísticas de la Temporada</h4>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Partidos Jugados</label>
                  <input type="number" value={playerForm.matchesPlayed} onChange={e => setPlayerForm({...playerForm, matchesPlayed: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles</label>
                  <input type="number" value={playerForm.goals} onChange={e => setPlayerForm({...playerForm, goals: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Asistencias</label>
                  <input type="number" value={playerForm.assists} onChange={e => setPlayerForm({...playerForm, assists: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Vallas Invictas (Arqueros)</label>
                  <input type="number" value={playerForm.cleanSheets} onChange={e => setPlayerForm({...playerForm, cleanSheets: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tarjetas Amarillas</label>
                  <input type="number" value={playerForm.yellowCards} onChange={e => setPlayerForm({...playerForm, yellowCards: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tarjetas Rojas</label>
                  <input type="number" value={playerForm.redCards} onChange={e => setPlayerForm({...playerForm, redCards: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>

                <div className="col-span-2 border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-gray-500 mb-3">Información Adicional</h4>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Logros / Insignias</label>
                  <input type="text" value={playerForm.achievements} onChange={e => setPlayerForm({...playerForm, achievements: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Goleador, Fair Play, Asistencia Perfecta (separados por coma)" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Biografía del Jugador</label>
                  <textarea value={playerForm.description} onChange={e => setPlayerForm({...playerForm, description: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" rows="2" placeholder="Breve historia o descripción técnica del jugador..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Foto de Perfil</label>
                  <MediaUploadUniversal
                    value={playerForm.photoUrl}
                    onChange={url => setPlayerForm({...playerForm, photoUrl: url})}
                    category="multimedia"
                    allowedTypes={['image']}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Video Destacado</label>
                  <MediaUploadUniversal
                    value={playerForm.videoUrl}
                    onChange={url => setPlayerForm({...playerForm, videoUrl: url})}
                    category="multimedia"
                    allowedTypes={['video']}
                  />
                </div>
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowPlayerModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="bg-jn-red text-white hover:bg-jn-darkred px-5 py-2.5 rounded-xl font-bold uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10">
              <h3 className="font-black uppercase text-sm tracking-widest">{editTarget ? 'Editar Partido' : 'Registrar Nuevo Partido'}</h3>
              <button onClick={() => setShowMatchModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
                  <select value={matchForm.category} onChange={e => setMatchForm({...matchForm, category: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="Primera Masculina">Primera Masculina</option>
                    <option value="Primera Femenina">Primera Femenina</option>
                    <option value="3ra División">3ra División</option>
                    <option value="4ta División">4ta División</option>
                    <option value="5ta División">5ta División</option>
                    <option value="6ta División">6ta División</option>
                    <option value="7ma División">7ma División</option>
                    <option value="8va División">8va División</option>
                    <option value="Escuelita">Escuelita</option>
                    <option value="Pre Infantil">Pre Infantil</option>
                    <option value="Infantil">Infantil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Competencia</label>
                  <input type="text" value={matchForm.competition} onChange={e => setMatchForm({...matchForm, competition: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. AFA Primera, Copa AFA" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Equipo Local</label>
                  <input type="text" value={matchForm.homeTeam} onChange={e => setMatchForm({...matchForm, homeTeam: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Equipo Visitante / Oponente</label>
                  <input type="text" value={matchForm.opponent} onChange={e => setMatchForm({...matchForm, opponent: e.target.value, awayTeam: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha</label>
                  <input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Horario (Franja)</label>
                  <input type="text" value={matchForm.timeSlot} onChange={e => setMatchForm({...matchForm, timeSlot: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. 21:30" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sede / Cancha</label>
                  <input type="text" value={matchForm.venue} onChange={e => setMatchForm({...matchForm, venue: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Cancha Jorge Newbery" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Árbitro</label>
                  <input type="text" value={matchForm.referee} onChange={e => setMatchForm({...matchForm, referee: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. Patricio Loustau" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Concurrencia (Espectadores)</label>
                  <input type="number" value={matchForm.attendance} onChange={e => setMatchForm({...matchForm, attendance: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Estado del Partido</label>
                  <select value={matchForm.status} onChange={e => setMatchForm({...matchForm, status: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="UPCOMING">Próximo</option>
                    <option value="LIVE">En Vivo 🔴</option>
                    <option value="FINISHED">Finalizado</option>
                  </select>
                </div>

                {matchForm.status === 'FINISHED' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles Local ({matchForm.homeTeam})</label>
                      <input type="number" value={matchForm.ourScore} onChange={e => setMatchForm({...matchForm, ourScore: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles Visitante ({matchForm.opponent})</label>
                      <input type="number" value={matchForm.opponentScore} onChange={e => setMatchForm({...matchForm, opponentScore: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Resumen del Encuentro</label>
                      <textarea value={matchForm.summary} onChange={e => setMatchForm({...matchForm, summary: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" rows="2" placeholder="Resumen corto del partido..." />
                    </div>
                  </>
                )}

                <div className="col-span-2 border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-jn-red mb-3">Integración Streaming y Liga Pro Studio</h4>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Proveedor de Transmisión</label>
                  <select value={matchForm.provider} onChange={e => setMatchForm({...matchForm, provider: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                    <option value="LOCAL">Local / Ninguno</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="LIGA_PRO_STUDIO">Liga Pro Studio ⚡</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ID Externo (Liga Pro Studio)</label>
                  <input type="text" value={matchForm.externalMatchId} onChange={e => setMatchForm({...matchForm, externalMatchId: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="e.g. lps-match-90412" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">URL de Transmisión (YouTube o Live Stream)</label>
                  <input type="text" value={matchForm.liveStreamUrl} onChange={e => setMatchForm({...matchForm, liveStreamUrl: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="https://youtube.com/live/..." />
                </div>

                <div className="col-span-2 border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-black uppercase text-gray-500 mb-3">Contenido Multimedia Destacado</h4>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Video del Partido (Resumen YouTube)</label>
                  <input type="text" value={matchForm.videoUrl} onChange={e => setMatchForm({...matchForm, videoUrl: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Galería de Fotos (URLs separadas por comas)</label>
                  <input type="text" value={matchForm.photoGallery} onChange={e => setMatchForm({...matchForm, photoGallery: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" placeholder="https://img.com/1.jpg, https://img.com/2.jpg" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="isFeatured" checked={matchForm.isFeatured} onChange={e => setMatchForm({...matchForm, isFeatured: e.target.checked})} className="w-4 h-4 text-jn-red focus:ring-jn-red border-gray-300 rounded" />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-gray-700 select-none">Marcar como Partido Destacado (Banner Superior)</label>
                </div>
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowMatchModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="bg-jn-red text-white hover:bg-jn-darkred px-5 py-2.5 rounded-xl font-bold uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10">
              <h3 className="font-black uppercase text-sm tracking-widest">{editTarget ? 'Editar Multimedia' : 'Subir Archivo Multimedia'}</h3>
              <button onClick={() => setShowMediaModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveMedia} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipo de Archivo</label>
                <select value={mediaForm.type} onChange={e => setMediaForm({...mediaForm, type: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                  <option value="PHOTO">Foto</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título</label>
                <input type="text" value={mediaForm.title} onChange={e => setMediaForm({...mediaForm, title: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Recurso Multimedia</label>
                <MediaUploadUniversal
                  value={mediaForm.url}
                  onChange={url => setMediaForm({...mediaForm, url: url})}
                  category="newbery-tv"
                  allowedTypes={mediaForm.type === 'VIDEO' ? ['video'] : ['image']}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sección Relacionada</label>
                <select value={mediaForm.category} onChange={e => setMediaForm({...mediaForm, category: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                  <option value="Primera">Primera Masculina</option>
                  <option value="Femenino">Primera Femenina</option>
                  <option value="Inferiores">Inferiores (Sub-13 a Sub-20)</option>
                  <option value="Promocionales">Promocionales (Escuelita)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción</label>
                <textarea value={mediaForm.description} onChange={e => setMediaForm({...mediaForm, description: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" rows="2" />
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowMediaModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="bg-jn-red text-white hover:bg-jn-darkred px-5 py-2.5 rounded-xl font-bold uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FUTSAL NEWS MODAL */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="bg-jn-black text-white p-5 flex justify-between items-center border-b border-white/10">
              <h3 className="font-black uppercase text-sm tracking-widest">{editTarget ? 'Editar Noticia Futsal' : 'Crear Noticia Futsal'}</h3>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSaveNews} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título de la Noticia</label>
                <input type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Descripción / Contenido</label>
                <textarea value={newsForm.description} onChange={e => setNewsForm({...newsForm, description: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red" rows="4" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Imagen de Noticia</label>
                <MediaUploadUniversal
                  value={newsForm.imageUrl}
                  onChange={url => setNewsForm({...newsForm, imageUrl: url})}
                  category="noticias"
                  allowedTypes={['image']}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sección de Destino</label>
                <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} className="w-full p-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jn-red">
                  <option value="Primera Masculina">Primera Masculina</option>
                  <option value="Primera Femenina">Primera Femenina</option>
                  <option value="Inferiores">Inferiores</option>
                  <option value="Promocionales">Promocionales</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="published" checked={newsForm.published} onChange={e => setNewsForm({...newsForm, published: e.target.checked})} className="w-4 h-4 text-jn-red focus:ring-jn-red border-gray-300 rounded" />
                <label htmlFor="published" className="text-xs font-bold text-gray-700 select-none">Publicar inmediatamente</label>
              </div>
              <div className="border-t border-gray-150 pt-4 flex justify-end gap-2 text-xs">
                <button type="button" onClick={() => setShowNewsModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-bold uppercase">Cancelar</button>
                <button type="submit" className="bg-jn-red text-white hover:bg-jn-darkred px-5 py-2.5 rounded-xl font-bold uppercase">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
