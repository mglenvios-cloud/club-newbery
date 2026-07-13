"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit, Trash, X, Check, AlertCircle, Save,
  PlayCircle, Image as ImageIcon, Video, Star, Search, Film
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import { API_URL } from '@/config';

const fetch = apiFetch;

export default function AdminMultimedia() {
  const [mediaList, setMediaList] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modales
  const [modal, setModal] = useState({ isOpen: false, editId: null });

  // Form (Extended for Production)
  const [form, setForm] = useState({
    type: 'VIDEO',
    title: '',
    url: '',
    category: 'Partidos Completos',
    description: '',
    season: '2026',
    competition: '',
    opponent: '',
    playerId: '',
    matchId: '',
    published: true,
    visibility: 'PUBLIC',
    featured: false
  });

  // Filtros
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Partidos Completos',
    'Resúmenes',
    'Mejores Jugadas',
    'Goles',
    'Entrevistas',
    'Conferencias',
    'Entrenamientos',
    'Primera División',
    'Primera Femenina',
    'Inferiores',
    'Promocionales',
    'Historia del Club',
    'Eventos Especiales',
    'Archivo Histórico'
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetching (Passes admin=true to read drafts)
  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/media?admin=true`);
      if (res.ok) setMediaList(await res.json());
    } catch {
      showToast('Error al conectar con la API de multimedia', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/players`);
      if (res.ok) setPlayers(await res.json());
    } catch {}
  }, []);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches`);
      if (res.ok) setMatches(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchMedia();
    fetchPlayers();
    fetchMatches();
  }, [fetchMedia, fetchPlayers, fetchMatches]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url || !form.category) {
      return showToast('Faltan campos obligatorios', 'error');
    }

    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    if (!token) {
      return showToast('No estás autenticado como administrador', 'error');
    }

    const payload = {
      ...form,
      playerId: form.playerId ? parseInt(form.playerId, 10) : null,
      matchId: form.matchId ? parseInt(form.matchId, 10) : null,
      published: form.published === true || form.published === 'true',
      featured: form.featured === true || form.featured === 'true'
    };

    const method = modal.editId ? 'PUT' : 'POST';
    const url = modal.editId ? `${API_URL}/api/media/${modal.editId}` : `${API_URL}/api/media`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(modal.editId ? 'Multimedia actualizada correctamente' : 'Multimedia agregada correctamente');
        setModal({ isOpen: false, editId: null });
        fetchMedia();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al guardar el archivo multimedia', 'error');
      }
    } catch {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este contenido?')) return;
    const token = localStorage.getItem('token') || localStorage.getItem('jn-auth-token');
    if (!token) {
      return showToast('No estás autenticado como administrador', 'error');
    }

    try {
      const res = await fetch(`${API_URL}/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Contenido eliminado correctamente');
        fetchMedia();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Error al eliminar', 'error');
      }
    } catch {
      showToast('Error al conectar con la base de datos', 'error');
    }
  };

  // Filtrado
  const filteredList = mediaList.filter(item => {
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.opponent && item.opponent.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-jn-black">
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-2 shadow-lg transition-transform ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black text-jn-red uppercase tracking-widest bg-red-100 px-3 py-1 rounded-full border border-jn-red/20">Newbery TV Admin</span>
          <h1 className="text-3xl font-black uppercase mt-2">Centro de Producción Newbery TV</h1>
          <p className="text-gray-500 text-sm">Gestiona transmisiones, videos, goles, entrevistas y el estado de publicación en la plataforma oficial.</p>
        </div>
        <button
          onClick={() => {
            setForm({
              type: 'VIDEO', title: '', url: '', category: 'Partidos Completos', description: '',
              season: '2026', competition: '', opponent: '', playerId: '', matchId: '',
              published: true, visibility: 'PUBLIC', featured: false
            });
            setModal({ isOpen: true, editId: null });
          }}
          className="bg-jn-red hover:bg-red-700 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 self-start animate-fade-in"
        >
          <Plus size={16} /> Subir Contenido
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 border border-gray-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">TODOS LOS TIPOS</option>
            <option value="VIDEO">VIDEOS</option>
            <option value="PHOTO">FOTOS</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">TODAS LAS CATEGORÍAS</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, rival..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* CARGANDO */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-jn-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-gray-400 font-bold uppercase">Cargando biblioteca...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center text-gray-500">
          <Film size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="font-bold text-sm uppercase">Sin contenido multimedia registrado</p>
          <p className="text-xs text-gray-400 mt-1">Hacé click en "Subir Contenido" para inaugurar Newbery TV.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredList.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow relative">
              {/* Badges de Publicación / Visibilidad */}
              <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end font-bold text-[8px] uppercase tracking-wider">
                {item.featured && (
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded shadow flex items-center gap-1">
                    <Star size={8} fill="currentColor" /> Destacado
                  </span>
                )}
                {item.published ? (
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded shadow">Público</span>
                ) : (
                  <span className="bg-gray-500 text-white px-2 py-0.5 rounded shadow">Borrador</span>
                )}
                {item.visibility !== 'PUBLIC' && (
                  <span className="bg-indigo-600 text-white px-2 py-0.5 rounded shadow">Socios</span>
                )}
              </div>

              {/* Preview */}
              <div className="aspect-video bg-gray-100 relative group flex items-center justify-center border-b">
                {item.type === 'VIDEO' ? (
                  <>
                    <div className="absolute z-10 text-white/80 group-hover:text-jn-red transition-colors">
                      <PlayCircle size={36} className="drop-shadow-md" />
                    </div>
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px] uppercase font-black tracking-widest bg-gradient-to-br from-slate-900 to-red-950">
                      📺 Video Stream
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                )}
                <span className="absolute top-2 left-2 text-[8px] bg-jn-black text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  {item.type}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div>
                  <span className="text-[9px] bg-red-100 text-jn-red px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-black text-sm mt-1.5 leading-snug line-clamp-2">{item.title}</h4>
                </div>
                {item.description && <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>}

                {/* Meta tags */}
                <div className="flex gap-1.5 flex-wrap pt-2 mt-auto">
                  {item.season && <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">TEMPORADA {item.season}</span>}
                  {item.competition && <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">{item.competition}</span>}
                  {item.opponent && <span className="text-[8px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">VS {item.opponent}</span>}
                </div>
              </div>

              {/* Acciones */}
              <div className="p-3 border-t bg-gray-50 flex gap-2 justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                <span>👁️ {item.views || 0} vistas</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForm({
                        ...item,
                        playerId: item.playerId ? item.playerId.toString() : '',
                        matchId: item.matchId ? item.matchId.toString() : ''
                      });
                      setModal({ isOpen: true, editId: item.id });
                    }}
                    className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-lg bg-white"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 border border-red-100 text-red-600 hover:bg-red-50 rounded-lg bg-white"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-lg uppercase">{modal.editId ? 'Editar Contenido' : 'Subir Contenido Multimedia'}</h3>
              <button onClick={() => setModal({ isOpen: false, editId: null })} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-bold text-gray-600 uppercase">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Tipo de archivo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="VIDEO">🎥 VIDEO</option>
                    <option value="PHOTO">📸 IMAGEN</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Categoría de Canal</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block">Título del video/foto *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block">URL del archivo (MP4 / YouTube / Vimeo / CDN) *</label>
                <input
                  type="text"
                  required
                  value={form.url}
                  onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm lowercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Temporada</label>
                  <input
                    type="text"
                    value={form.season}
                    onChange={e => setForm(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Competencia</label>
                  <input
                    type="text"
                    value={form.competition || ''}
                    onChange={e => setForm(prev => ({ ...prev, competition: e.target.value }))}
                    placeholder="Torneo AFA"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Rival / Oponente</label>
                  <input
                    type="text"
                    value={form.opponent || ''}
                    onChange={e => setForm(prev => ({ ...prev, opponent: e.target.value }))}
                    placeholder="Boca Juniors"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block">Vincular Jugador</label>
                  <select
                    value={form.playerId || ''}
                    onChange={e => setForm(prev => ({ ...prev, playerId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="">Ninguno</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>{p.name} {p.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block">Asociar a Partido</label>
                  <select
                    value={form.matchId || ''}
                    onChange={e => setForm(prev => ({ ...prev, matchId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="">Ninguno</option>
                    {matches.map(m => (
                      <option key={m.id} value={m.id}>{m.opponent} ({new Date(m.date).toLocaleDateString('es-AR')})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block">Visibilidad</label>
                  <select
                    value={form.visibility}
                    onChange={e => setForm(prev => ({ ...prev, visibility: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                  >
                    <option value="PUBLIC">Público (Todo el mundo)</option>
                    <option value="MEMBERS_ONLY">Solo Socios</option>
                    <option value="PRIVATE">Privado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <div>
                    <span className="block font-bold">Publicar en Newbery TV</span>
                    <span className="block text-[9px] text-gray-400 font-normal">Si está desactivado se guardará como borrador.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <div>
                    <span className="block font-bold">Destacar contenido</span>
                    <span className="block text-[9px] text-gray-400 font-normal">Se mostrará en la sección superior destacada.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="mb-1 block">Descripción breve</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none h-20 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-jn-red hover:bg-red-700 text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-xs transition-colors"
              >
                {modal.editId ? 'Actualizar Contenido' : 'Guardar en Biblioteca'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
